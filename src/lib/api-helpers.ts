import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { runQuery } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'

export type ApiContext = {
    userId: string
    tenantId: string
    sessionId: string
    email: string
}

type Handler = (req: NextRequest, ctx: ApiContext) => Promise<NextResponse>

export function withAuth(handler: Handler) {
    return async function routeHandler(req: NextRequest): Promise<NextResponse> {
        const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
        const limited = await rateLimit(ip, 100, 60)
        if (!limited.success) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
        }

        const payload = await getUserFromRequest(req)
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify session is still valid in Neo4j
        const now = new Date().toISOString()
        const sessionResult = await runQuery(
            `MATCH (u:User {id: $userId})-[:HAS_SESSION]->(s:Session {id: $sessionId, active: true})
             WHERE s.expiresAt > $now
             RETURN s.id AS id`,
            { userId: payload.sub, sessionId: payload.sid, now }
        )

        if (sessionResult.records.length === 0) {
            return NextResponse.json({ error: 'Session expired or revoked' }, { status: 401 })
        }

        // Update last active timestamp
        await runQuery(
            `MATCH (s:Session {id: $sessionId})
             SET s.lastActiveAt = $now`,
            { sessionId: payload.sid, now }
        )

        const ctx: ApiContext = {
            userId: payload.sub,
            tenantId: payload.tid,
            sessionId: payload.sid,
            email: payload.email,
        }

        return handler(req, ctx)
    }
}



export function withAdminAuth(handler: Handler) {
    return withAuth(async (req, ctx) => {
        // Check if user has admin role via Neo4j
        const adminResult = await runQuery(
            `OPTIONAL MATCH (u:User {id: $userId})-[:IS_MEMBER]->(org:Organization)
             -[:HAS_MEMBER]->(m:OrganizationMember)-[:HAS_ROLE]->(r:Role)
             WHERE r.key IN ['admin', 'super_admin', 'owner']
             WITH u, m
             OPTIONAL MATCH (t:Tenant {id: $tenantId})<-[:BELONGS_TO]-(firstUser:User)
             WHERE firstUser.createdAt = t.createdAt
             RETURN m.id AS memberRole, firstUser.id AS ownerId`,
            { userId: ctx.userId, tenantId: ctx.tenantId }
        )

        const isAdmin = adminResult.records.some(r =>
            r.get('memberRole') !== null || r.get('ownerId') === ctx.userId
        )

        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
        }

        return handler(req, ctx)
    })
}

export function successResponse(data: unknown, status: number = 200) {
    return NextResponse.json({ success: true, data }, { status })
}

export function errorResponse(message: string, status: number = 400, code?: string) {
    return NextResponse.json({ success: false, error: message, code }, { status })
}
