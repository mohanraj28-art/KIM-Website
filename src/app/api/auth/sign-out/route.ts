import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { revokeSession } from '@/lib/auth/auth'
import { runQuery } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
    const payload = await getUserFromRequest(req)

    if (payload?.sid) {
        try {
            await revokeSession(payload.sid)

            // Audit log node
            await runQuery(
                `MATCH (u:User {id: $userId})
                 CREATE (a:AuditLog {
                     id: $id,
                     action: 'user.signed_out',
                     result: 'SUCCESS',
                     ipAddress: $ip,
                     tenantId: $tenantId,
                     createdAt: $now
                 })<-[:HAS_AUDIT_LOG]-(u)`,
                {
                    id: uuidv4(),
                    userId: payload.sub,
                    ip: req.headers.get('x-forwarded-for') ?? null,
                    tenantId: payload.tid,
                    now: new Date().toISOString(),
                }
            ).catch(() => { })
        } catch {
            // Silent failure
        }
    }

    const response = NextResponse.json({ success: true })
    response.cookies.delete('kip_token')
    response.cookies.delete('kip_refresh_token')
    return response
}
