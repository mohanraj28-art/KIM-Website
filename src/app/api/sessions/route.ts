import { NextRequest } from 'next/server'
import { withAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { runQuery } from '@/lib/db'

// GET /api/sessions - list sessions for current user
export const GET = withAuth(async (req: NextRequest, ctx) => {
    const { searchParams } = req.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const userId = searchParams.get('userId') || ctx.userId
    const activeOnly = searchParams.get('active') !== 'false'
    const skip = (page - 1) * limit
    const now = new Date().toISOString()

    const activeClause = activeOnly
        ? `AND s.active = true AND s.expiresAt > '${now}'`
        : ''

    const [sessionsResult, countResult] = await Promise.all([
        runQuery(
            `MATCH (u:User {id: $userId})-[:HAS_SESSION]->(s:Session)
             WHERE s.tenantId = $tenantId ${activeClause}
             RETURN s
             ORDER BY s.lastActiveAt DESC
             SKIP $skip LIMIT $limit`,
            { userId, tenantId: ctx.tenantId, skip, limit }
        ),
        runQuery(
            `MATCH (u:User {id: $userId})-[:HAS_SESSION]->(s:Session)
             WHERE s.tenantId = $tenantId ${activeClause}
             RETURN count(s) AS total`,
            { userId, tenantId: ctx.tenantId }
        ),
    ])

    const total = countResult.records[0]?.get('total').toNumber() ?? 0
    const sessions = sessionsResult.records.map(r => {
        const s = r.get('s').properties
        return {
            id: s.id,
            userId,
            ipAddress: s.ipAddress ?? null,
            userAgent: s.userAgent ?? null,
            active: s.active,
            lastActiveAt: s.lastActiveAt,
            createdAt: s.createdAt,
            expiresAt: s.expiresAt,
            isCurrent: s.id === ctx.sessionId,
        }
    })

    return successResponse({ sessions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
})

// DELETE /api/sessions?id=xxx  or  ?all=true
export const DELETE = withAuth(async (req: NextRequest, ctx) => {
    const id = req.nextUrl.searchParams.get('id')
    const revokeAll = req.nextUrl.searchParams.get('all') === 'true'
    const now = new Date().toISOString()

    if (revokeAll) {
        await runQuery(
            `MATCH (u:User {id: $userId})-[:HAS_SESSION]->(s:Session {active: true})
             WHERE s.id <> $currentSessionId AND s.tenantId = $tenantId
             SET s.active = false, s.revokedAt = $now`,
            { userId: ctx.userId, currentSessionId: ctx.sessionId, tenantId: ctx.tenantId, now }
        )

        await runQuery(
            `MATCH (u:User {id: $userId})
             CREATE (a:AuditLog {
                 id: $id, action: 'session.revoked_all', result: 'SUCCESS',
                 tenantId: $tenantId, createdAt: $now
             })<-[:HAS_AUDIT_LOG]-(u)`,
            { id: crypto.randomUUID(), userId: ctx.userId, tenantId: ctx.tenantId, now }
        )

        return successResponse({ revokedAll: true })
    }

    if (!id) return errorResponse('Session ID required', 400)

    const sessionResult = await runQuery(
        `MATCH (u:User {id: $userId})-[:HAS_SESSION]->(s:Session {id: $sessionId, tenantId: $tenantId})
         RETURN s.id AS id`,
        { userId: ctx.userId, sessionId: id, tenantId: ctx.tenantId }
    )

    if (sessionResult.records.length === 0) return errorResponse('Session not found', 404)

    await runQuery(
        `MATCH (s:Session {id: $sessionId})
         SET s.active = false, s.revokedAt = $now`,
        { sessionId: id, now }
    )

    return successResponse({ revoked: true })
})
