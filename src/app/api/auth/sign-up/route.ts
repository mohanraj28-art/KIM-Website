import { NextRequest, NextResponse } from 'next/server'
import { signUpWithPassword } from '@/lib/auth/auth'
import { sendVerificationEmail } from '@/lib/email'
import { generateOTP, isDisposableEmail } from '@/lib/utils'
import { runQuery } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

const signUpSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().max(50).optional(),
    lastName: z.string().max(50).optional(),
    tenantId: z.string(),
})

export async function POST(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const limited = await rateLimit(`signup:${ip}`, 5, 60)
    if (!limited.success) {
        return NextResponse.json({ error: 'Too many sign up attempts. Please try again in a minute.' }, { status: 429 })
    }

    try {
        const body = await req.json()
        const parsed = signUpSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json({
                error: parsed.error.issues[0]?.message || 'Invalid request data'
            }, { status: 400 })
        }

        const { email, password, firstName, lastName, tenantId } = parsed.data

        // Ensure tenant node exists in Neo4j
        await runQuery(
            `MERGE (t:Tenant {id: $tenantId})
             ON CREATE SET t.name = 'Default', t.slug = $tenantId, t.createdAt = $now`,
            { tenantId, now: new Date().toISOString() }
        )

        const userAgent = req.headers.get('user-agent') ?? undefined
        const result = await signUpWithPassword(
            { email, password, firstName, lastName, tenantId },
            ip,
            userAgent
        )

        // Create verification token node
        const verifyToken = generateOTP(32)
        await runQuery(
            `MATCH (u:User {id: $userId})
             CREATE (v:VerificationToken {
                 id: $id,
                 email: $email,
                 token: $token,
                 type: 'EMAIL_VERIFICATION',
                 expiresAt: $expiresAt,
                 createdAt: $now
             })<-[:HAS_TOKEN]-(u)`,
            {
                id: uuidv4(),
                userId: result.user.id,
                email,
                token: verifyToken,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                now: new Date().toISOString(),
            }
        )

        sendVerificationEmail(email, verifyToken, firstName).catch(console.error)

        const response = NextResponse.json({ success: true, data: result }, { status: 201 })
        response.cookies.set('kip_token', result.accessToken, {
            httpOnly: true,
            secure: false, // Force false for localhost stability
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 15,
        })

        return response
    } catch (error: unknown) {
        console.error('[sign-up] Error:', error)
        const message = error instanceof Error ? error.message : 'Registration failed'
        const status = message.includes('already exists') ? 409 : 400
        return NextResponse.json({ error: message, detail: String(error) }, { status })
    }
}
