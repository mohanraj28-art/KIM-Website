import { NextRequest } from 'next/server'
import { withAuth, successResponse } from '@/lib/api-helpers'
import { runQuery, toNum } from '@/lib/db'

// GET /api/stats — dashboard overview stats
export const GET = withAuth(async (_req: NextRequest, ctx) => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

    const [usersResult, orgsResult, sessionsResult, auditResult, mfaResult] = await Promise.all([
        // Total users + new this month + last month (for growth %)
        runQuery(
            `MATCH (u:User)-[:BELONGS_TO]->(:Tenant {id: $tenantId})
             WHERE u.deletedAt IS NULL
             RETURN
                 count(u) AS total,
                 sum(CASE WHEN u.createdAt >= $startOfMonth THEN 1 ELSE 0 END) AS thisMonth,
                 sum(CASE WHEN u.createdAt >= $lastMonth AND u.createdAt < $startOfMonth THEN 1 ELSE 0 END) AS lastMonth`,
            { tenantId: ctx.tenantId, startOfMonth, lastMonth }
        ),
        // Total orgs + new this month
        runQuery(
            `MATCH (o:Organization)-[:BELONGS_TO]->(:Tenant {id: $tenantId})
             WHERE o.deletedAt IS NULL
             RETURN
                 count(o) AS total,
                 sum(CASE WHEN o.createdAt >= $startOfMonth THEN 1 ELSE 0 END) AS thisMonth`,
            { tenantId: ctx.tenantId, startOfMonth }
        ),
        // Active sessions
        runQuery(
            `MATCH (u:User)-[:BELONGS_TO]->(:Tenant {id: $tenantId})
             MATCH (u)-[:HAS_SESSION]->(s:Session {active: true, tenantId: $tenantId})
             WHERE s.expiresAt > $now
             RETURN count(s) AS active`,
            { tenantId: ctx.tenantId, now: now.toISOString() }
        ),
        // Audit log counts by result (last 7 days)
        runQuery(
            `MATCH (u:User)-[:BELONGS_TO]->(:Tenant {id: $tenantId})
             MATCH (u)-[:HAS_AUDIT_LOG]->(a:AuditLog)
             WHERE a.createdAt >= $since
             RETURN
                 sum(CASE WHEN a.result = 'SUCCESS' THEN 1 ELSE 0 END) AS success,
                 sum(CASE WHEN a.result = 'FAILURE' THEN 1 ELSE 0 END) AS failure,
                 sum(CASE WHEN a.result = 'WARNING' THEN 1 ELSE 0 END) AS warning`,
            {
                tenantId: ctx.tenantId,
                since: new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString()
            }
        ),
        // MFA adoption rate
        runQuery(
            `MATCH (u:User)-[:BELONGS_TO]->(:Tenant {id: $tenantId})
             WHERE u.deletedAt IS NULL
             OPTIONAL MATCH (u)-[:HAS_MFA]->(m:MfaSetting {verified: true})
             WITH count(u) AS total, count(m) AS mfaCount
             RETURN total, mfaCount,
                    CASE WHEN total > 0 THEN round(100.0 * mfaCount / total) ELSE 0 END AS rate`,
            { tenantId: ctx.tenantId }
        ),
    ])

    const ur = usersResult.records[0]
    const or = orgsResult.records[0]
    const sr = sessionsResult.records[0]
    const ar = auditResult.records[0]
    const mr = mfaResult.records[0]

    const totalUsers = toNum(ur?.get('total'))
    const newUsersThisMonth = toNum(ur?.get('thisMonth'))
    const newUsersLastMonth = toNum(ur?.get('lastMonth'))
    const userGrowth = newUsersLastMonth > 0
        ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 * 10) / 10
        : newUsersThisMonth > 0 ? 100 : 0

    return successResponse({
        totalUsers,
        newUsersThisMonth,
        userGrowth,
        totalOrganizations: toNum(or?.get('total')),
        newOrgsThisMonth: toNum(or?.get('thisMonth')),
        activeSessions: toNum(sr?.get('active')),
        auditLast7Days: {
            success: toNum(ar?.get('success')),
            failure: toNum(ar?.get('failure')),
            warning: toNum(ar?.get('warning')),
        },
        mfaAdoptionRate: toNum(mr?.get('rate')),
        mfaCount: toNum(mr?.get('mfaCount')),
    })
})
