import { NextRequest, NextResponse } from 'next/server'
import { runQuery } from '@/lib/db'
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
        const userResult = await runQuery(
            `MATCH (u:User {email: $email})
             WHERE u.banned = false OR u.banned IS NULL
             RETURN u LIMIT 1`,
            { email: email.toLowerCase() }
        )

        if (userResult.records.length > 0) {
            const user = userResult.records[0].get('u').properties
            const token = uuidv4()
            const now = new Date().toISOString()
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

            await runQuery(
                `MATCH (u:User {id: $userId})
                 CREATE (v:VerificationToken {
                     id: $id,
                     email: $email,
                     token: $token,
                     type: 'PASSWORD_RESET',
                     expiresAt: $expiresAt,
                     createdAt: $now,
                     usedAt: null
                 })<-[:HAS_TOKEN]-(u)`,
                { id: uuidv4(), userId: user.id, email, token, expiresAt, now }
            )

            sendPasswordResetEmail(email, token, user.firstName ?? undefined).catch(console.error)

            await runQuery(
                `MATCH (u:User {id: $userId})
                 CREATE (a:AuditLog {
                     id: $logId,
                     action: 'user.password_reset_requested',
                     result: 'SUCCESS',
                     ipAddress: $ip,
                     tenantId: $tenantId,
                     createdAt: $now
                 })<-[:HAS_AUDIT_LOG]-(u)`,
                { logId: uuidv4(), userId: user.id, ip, tenantId: user.tenantId ?? 'default', now: new Date().toISOString() }
            )
        }

        // Always return success to prevent email enumeration
        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ success: true })
    }
}
