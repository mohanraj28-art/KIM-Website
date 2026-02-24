import { NextRequest, NextResponse } from 'next/server'
import { signInWithPassword } from '@/lib/auth/auth'
import { rateLimit } from '@/lib/rate-limit'
import { runQuery } from '@/lib/db'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
    tenantId: z.string(),
})

export async function POST(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const limited = await rateLimit(`signin:${ip}`, 10, 60)
    if (!limited.success) {
        return NextResponse.json({ error: 'Too many sign in attempts. Please try again later.' }, { status: 429 })
    }

    try {
        const body = await req.json()
        const parsed = signInSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid credentials format' }, { status: 400 })
        }

        const { email, password, tenantId } = parsed.data

        // Ensure tenant node exists
        await runQuery(
            `MERGE (t:Tenant {id: $tenantId})
             ON CREATE SET t.name = 'Default', t.slug = $tenantId, t.createdAt = $now`,
            { tenantId, now: new Date().toISOString() }
        )

        const userAgent = req.headers.get('user-agent') ?? undefined
        const result = await signInWithPassword(email, password, tenantId, ip, userAgent)

        // Audit log
        await runQuery(
            `MATCH (u:User {id: $userId})
             CREATE (a:AuditLog {
                 id: $id,
                 action: 'user.signed_in',
                 result: 'SUCCESS',
                 ipAddress: $ip,
                 userAgent: $ua,
                 tenantId: $tenantId,
                 createdAt: $now
             })<-[:HAS_AUDIT_LOG]-(u)`,
            { id: uuidv4(), userId: result.user.id, ip, ua: userAgent ?? null, tenantId, now: new Date().toISOString() }
        )

        const response = NextResponse.json({ success: true, data: result })
        console.log(`[SignIn] Setting kip_token cookie for user: ${email}`);
        response.cookies.set('kip_token', result.accessToken, {
            httpOnly: true,
            secure: false, // Changed for local development testing
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 15,
        })

        return response
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Sign in failed'
        return NextResponse.json({ error: message }, { status: 401 })
    }
}
