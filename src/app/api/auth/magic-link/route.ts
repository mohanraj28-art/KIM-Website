import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendMagicLinkEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const magicLinkSchema = z.object({
    email: z.string().email(),
    accountId: z.string().optional().default('default'),
})

export async function POST(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const limited = await rateLimit(`magic:${ip}`, 5, 300)
    if (!limited.success) {
        return NextResponse.json({ error: 'Too many requests. Please wait before requesting another link.' }, { status: 429 })
    }

    try {
        const body = await req.json()
        const { email, accountId } = magicLinkSchema.parse(body)

        const token = uuidv4()
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

        // Create VerificationToken
        await prisma.verificationToken.create({
            data: {
                email,
                token,
                type: 'MAGIC_LINK',
                expiresAt,
            }
        })

        sendMagicLinkEmail(email, token).catch(console.error)

        return NextResponse.json({ success: true, message: 'If an account exists, a magic link has been sent.' })
    } catch (error) {
        console.error('[Magic Link API Error]:', error)
        return NextResponse.json({ error: 'Failed to send magic link' }, { status: 500 })
    }
}

// Verify magic link token
export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get('token')
    if (!token) {
        return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const verificationToken = await prisma.verificationToken.findUnique({
        where: { token }
    })

    if (!verificationToken || verificationToken.type !== 'MAGIC_LINK') {
        return NextResponse.json({ error: 'Invalid or expired link' }, { status: 400 })
    }

    if (verificationToken.usedAt) {
        return NextResponse.json({ error: 'This link has already been used' }, { status: 400 })
    }

    if (verificationToken.expiresAt < new Date()) {
        return NextResponse.json({ error: 'This link has expired. Please request a new one.' }, { status: 400 })
    }

    // Mark as used
    await prisma.verificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() }
    })

    return NextResponse.json({ success: true, email: verificationToken.email })
}
