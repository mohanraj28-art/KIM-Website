import { NextRequest } from 'next/server'
import { withAuth, successResponse } from '@/lib/api-helpers'
import { runQuery, toNum, int } from '@/lib/db'

// GET /api/audit-logs
export const GET = withAuth(async (req: NextRequest, ctx) => {
    const { searchParams } = req.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const userId = searchParams.get('userId') || null
    const result = searchParams.get('result') || null
    const action = searchParams.get('action') || null
    const skip = (page - 1) * limit

    const filters: string[] = ['a.tenantId = $tenantId']
    if (userId) filters.push('a.userId = $userId')
    if (result) filters.push('a.result = $result')
    if (action) filters.push('toLower(a.action) CONTAINS toLower($action)')

    const whereClause = filters.join(' AND ')

    const [logsResult, countResult] = await Promise.all([
        runQuery(
            `MATCH (u:User)-[:HAS_AUDIT_LOG]->(a:AuditLog)
             WHERE ${whereClause}
             RETURN a, u.email AS email, u.firstName AS firstName, u.lastName AS lastName
             ORDER BY a.createdAt DESC
             SKIP $skip LIMIT $limit`,
            {
                tenantId: ctx.tenantId, userId, result, action,
                skip: int(skip),
                limit: int(limit)
            }
        ),
        runQuery(
            `MATCH (u:User)-[:HAS_AUDIT_LOG]->(a:AuditLog)
             WHERE ${whereClause}
             RETURN count(a) AS total`,
            { tenantId: ctx.tenantId, userId, result, action }
        ),
    ])

    const total = toNum(countResult.records[0]?.get('total'))

    const logs = logsResult.records.map(r => {
        const a = r.get('a').properties
        return {
            id: a.id,
            action: a.action,
            userId: a.userId ?? null,
            result: a.result,
            ipAddress: a.ipAddress ?? null,
            userAgent: a.userAgent ?? null,
            resourceId: a.resourceId ?? null,
            createdAt: a.createdAt,
            user: {
                email: r.get('email'),
                firstName: r.get('firstName'),
                lastName: r.get('lastName'),
            },
        }
    })

    return successResponse({ logs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
})
