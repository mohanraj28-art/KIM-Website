import { NextRequest, NextResponse } from 'next/server'
import { runQuery } from '@/lib/db'
import { sendMagicLinkEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const magicLinkSchema = z.object({
    email: z.string().email(),
    tenantId: z.string().optional().default('default'),
})

export async function POST(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const limited = await rateLimit(`magic:${ip}`, 5, 300)
    if (!limited.success) {
        return NextResponse.json({ error: 'Too many requests. Please wait before requesting another link.' }, { status: 429 })
    }

    try {
        const body = await req.json()
        const { email, tenantId } = magicLinkSchema.parse(body)

        const token = uuidv4()
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
        const now = new Date().toISOString()

        // Create VerificationToken node (unlinked — email may not exist)
        await runQuery(
            `CREATE (v:VerificationToken {
                id: $id,
                email: $email,
                token: $token,
                type: 'MAGIC_LINK',
                tenantId: $tenantId,
                expiresAt: $expiresAt,
                createdAt: $now,
                usedAt: null
            })`,
            { id: uuidv4(), email, token, tenantId, expiresAt, now }
        )

        sendMagicLinkEmail(email, token).catch(console.error)

        return NextResponse.json({ success: true, message: 'If an account exists, a magic link has been sent.' })
    } catch {
        return NextResponse.json({ error: 'Failed to send magic link' }, { status: 500 })
    }
}

// Verify magic link token
export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get('token')
    if (!token) {
        return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const result = await runQuery(
        `MATCH (v:VerificationToken {token: $token, type: 'MAGIC_LINK'})
         RETURN v`,
        { token }
    )

    if (result.records.length === 0) {
        return NextResponse.json({ error: 'Invalid or expired link' }, { status: 400 })
    }

    const v = result.records[0].get('v').properties

    if (v.usedAt) {
        return NextResponse.json({ error: 'This link has already been used' }, { status: 400 })
    }

    if (v.expiresAt < new Date().toISOString()) {
        return NextResponse.json({ error: 'This link has expired. Please request a new one.' }, { status: 400 })
    }

    // Mark as used
    await runQuery(
        `MATCH (v:VerificationToken {token: $token})
         SET v.usedAt = $now`,
        { token, now: new Date().toISOString() }
    )

    return NextResponse.json({ success: true, email: v.email })
}
