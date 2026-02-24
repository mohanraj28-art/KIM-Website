import { NextRequest } from 'next/server'
import { withAuth, successResponse } from '@/lib/api-helpers'
import { runQuery, toNum, int } from '@/lib/db'

// GET /api/users - list users for the tenant
export const GET = withAuth(async (req: NextRequest, ctx) => {
    const { searchParams } = req.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    const searchClause = search
        ? `AND (toLower(u.email) CONTAINS toLower($search)
               OR toLower(u.firstName) CONTAINS toLower($search)
               OR toLower(u.lastName) CONTAINS toLower($search))`
        : ''

    const [usersResult, countResult] = await Promise.all([
        runQuery(
            `MATCH (u:User)-[:BELONGS_TO]->(:Tenant {id: $tenantId})
             WHERE u.deletedAt IS NULL ${searchClause}
             OPTIONAL MATCH (u)-[:HAS_MFA]->(m:MfaSetting {verified: true})
             OPTIONAL MATCH (u)-[:HAS_SESSION]->(s:Session {active: true})
             OPTIONAL MATCH (u)-[:IS_MEMBER]->(org:Organization)
             WITH u,
                  collect(DISTINCT m.type) AS mfaTypes,
                  count(DISTINCT s) AS sessionCount,
                  count(DISTINCT org) AS orgCount
             RETURN u, mfaTypes, sessionCount, orgCount
             ORDER BY u.createdAt DESC
             SKIP $skip LIMIT $limit`,
            {
                tenantId: ctx.tenantId,
                search,
                skip: int(skip),
                limit: int(limit)
            }
        ),
        runQuery(
            `MATCH (u:User)-[:BELONGS_TO]->(:Tenant {id: $tenantId})
             WHERE u.deletedAt IS NULL ${searchClause}
             RETURN count(u) AS total`,
            { tenantId: ctx.tenantId, search }
        ),
    ])

    const total = toNum(countResult.records[0]?.get('total'))

    const users = usersResult.records.map(r => {
        const u = r.get('u').properties
        const mfaTypes = r.get('mfaTypes') as string[]
        return {
            id: u.id,
            email: u.email,
            firstName: u.firstName ?? null,
            lastName: u.lastName ?? null,
            displayName: u.displayName ?? null,
            avatarUrl: u.avatarUrl ?? null,
            emailVerified: u.emailVerified ?? false,
            phone: u.phone ?? null,
            banned: u.banned ?? false,
            lastSignInAt: u.lastSignInAt ?? null,
            createdAt: u.createdAt,
            mfaEnabled: mfaTypes.length > 0,
            sessionCount: toNum(r.get('sessionCount')),
            orgCount: toNum(r.get('orgCount')),
        }
    })

    return successResponse({
        users,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    })
})
