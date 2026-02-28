import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const schema = z.object({
    email: z.string().email(),
})

export async function POST(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const limited = await rateLimit(`forgot:${ip}`, 5, 300)
    if (!limited.success) {
        return NextResponse.json({ success: true })
    }

    try {
        const body = await req.json()
        const { email } = schema.parse(body)

        // Look up user — don't reveal existence
        const user = await prisma.user.findFirst({
            where: {
                email: email.toLowerCase(),
                banned: false
            }
        })

        if (user) {
            const token = uuidv4()
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

            await prisma.verificationToken.create({
                data: {
                    userId: user.id,
                    email: user.email,
                    token,
                    type: 'PASSWORD_RESET',
                    expiresAt,
                }
            })

            sendPasswordResetEmail(user.email, token, user.firstName ?? undefined).catch(console.error)

            // Audit log
            await prisma.auditLog.create({
                data: {
                    action: 'user.password_reset_requested',
                    result: 'SUCCESS',
                    ipAddress: ip,
                    accountId: user.accountId,
                    userId: user.id
                }
            })
        }

        // Always return success to prevent email enumeration
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[Forgot Password API Error]:', error)
        return NextResponse.json({ success: true })
    }
}
