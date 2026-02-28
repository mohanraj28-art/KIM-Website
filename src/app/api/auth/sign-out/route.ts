import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { revokeSession } from '@/lib/auth/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
    const payload = await getUserFromRequest(req)

    if (payload?.sid) {
        try {
            await revokeSession(payload.sid)

            // Audit log
            await prisma.auditLog.create({
                data: {
                    action: 'user.signed_out',
                    result: 'SUCCESS',
                    ipAddress: req.headers.get('x-forwarded-for'),
                    accountId: payload.tid,
                    userId: payload.sub
                }
            }).catch(() => { })
        } catch {
            // Silent failure
        }
    }

    const response = NextResponse.json({ success: true })
    response.cookies.delete('kaappu_token')
    response.cookies.delete('kaappu_refresh_token')
    return response
}
