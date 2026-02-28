import { NextRequest, NextResponse } from 'next/server'
import { signUpWithPassword } from '@/lib/auth/auth'
import { sendVerificationEmail } from '@/lib/email'
import { generateOTP } from '@/lib/utils'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

const signUpSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().max(50).optional(),
    lastName: z.string().max(50).optional(),
    accountId: z.string(), // formerly tenantId
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

        const { email, password, firstName, lastName, accountId } = parsed.data

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
        const result = await signUpWithPassword(
            { email, password, firstName, lastName, accountId },
            ip,
            userAgent
        )

        // Create verification token
        const verifyToken = generateOTP(32)
        await prisma.verificationToken.create({
            data: {
                userId: result.user.id,
                email,
                token: verifyToken,
                type: 'EMAIL_VERIFICATION',
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            }
        })

        sendVerificationEmail(email, verifyToken, firstName).catch(console.error)

        const response = NextResponse.json({ success: true, data: result }, { status: 201 })
        response.cookies.set('kaappu_token', result.accessToken, {
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
