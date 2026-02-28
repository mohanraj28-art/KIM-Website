import { NextRequest, NextResponse } from 'next/server'
import { signInWithPassword } from '@/lib/auth/auth'
import { rateLimit } from '@/lib/rate-limit'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
    accountId: z.string(), // formerly tenantId
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

        const { email, password, accountId } = parsed.data

        // Ensure account exists
        await prisma.account.upsert({
            where: { id: accountId },
            create: {
                id: accountId,
                name: 'Default',
                slug: accountId,
            },
            update: {}
        })

        const userAgent = req.headers.get('user-agent') ?? undefined
        const result = await signInWithPassword(email, password, accountId, ip, userAgent)

        // Audit log
        await prisma.auditLog.create({
            data: {
                action: 'user.signed_in',
                result: 'SUCCESS',
                ipAddress: ip,
                userAgent: userAgent ?? null,
                accountId: accountId,
                userId: result.user.id
            }
        })

        const response = NextResponse.json({ success: true, data: result })
        console.log(`[SignIn] Setting kaappu_token cookie for user: ${email}`);
        response.cookies.set('kaappu_token', result.accessToken, {
            httpOnly: true,
            secure: false, // Changed for local development testing
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 15,
        })

        return response
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Sign in failed'
        console.error('[SignIn API Error]:', error)

        // Distinguish between auth errors (401) and server errors (500)
        const isAuthError = message.includes('email') || message.includes('password') || message.includes('credentials')
        return NextResponse.json(
            { error: message },
            { status: isAuthError ? 401 : 500 }
        )
    }
}
