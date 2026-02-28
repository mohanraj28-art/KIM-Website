import { NextRequest } from 'next/server'
import { withAuth, successResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/db'

// GET /api/stats — dashboard overview stats
export const GET = withAuth(async (_req: NextRequest, ctx) => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000)

    const [usersStats, tenantsStats, activeSessionsCount, auditStats, mfaStats] = await Promise.all([
        // User stats
        prisma.user.aggregate({
            where: { accountId: ctx.accountId, deletedAt: null },
            _count: { id: true },
        }).then(async (totalRes) => {
            const thisMonth = await prisma.user.count({
                where: { accountId: ctx.accountId, deletedAt: null, createdAt: { gte: startOfMonth } }
            })
            const lastMonth = await prisma.user.count({
                where: {
                    accountId: ctx.accountId,
                    deletedAt: null,
                    createdAt: { gte: lastMonthStart, lt: startOfMonth }
                }
            })
            return { total: totalRes._count.id, thisMonth, lastMonth }
        }),

        // Tenant stats (formerly Org)
        prisma.tenant.aggregate({
            where: { accountId: ctx.accountId, deletedAt: null },
            _count: { id: true },
        }).then(async (totalRes) => {
            const thisMonth = await prisma.tenant.count({
                where: { accountId: ctx.accountId, deletedAt: null, createdAt: { gte: startOfMonth } }
            })
            return { total: totalRes._count.id, thisMonth }
        }),

        // Active sessions
        prisma.session.count({
            where: {
                accountId: ctx.accountId,
                active: true,
                expiresAt: { gt: now }
            }
        }),

        // Audit log counts (last 7 days)
        prisma.auditLog.groupBy({
            by: ['result'],
            where: {
                accountId: ctx.accountId,
                createdAt: { gte: sevenDaysAgo }
            },
            _count: { id: true }
        }),

        // MFA Adoption
        prisma.user.count({
            where: {
                accountId: ctx.accountId,
                deletedAt: null,
                mfaSettings: { some: { verified: true } }
            }
        })
    ])

    const totalUsers = usersStats.total
    const newUsersThisMonth = usersStats.thisMonth
    const newUsersLastMonth = usersStats.lastMonth
    const userGrowth = newUsersLastMonth > 0
        ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 * 10) / 10
        : newUsersThisMonth > 0 ? 100 : 0

    const auditCounts = {
        success: auditStats.find(s => s.result === 'SUCCESS')?._count.id || 0,
        failure: auditStats.find(s => s.result === 'FAILURE')?._count.id || 0,
        warning: auditStats.find(s => s.result === 'WARNING')?._count.id || 0,
    }

    const mfaAdoptionRate = totalUsers > 0 ? Math.round((mfaStats / totalUsers) * 100) : 0

    return successResponse({
        totalUsers,
        newUsersThisMonth,
        userGrowth,
        totalTenants: tenantsStats.total,
        newTenantsThisMonth: tenantsStats.thisMonth,
        activeSessions: activeSessionsCount,
        auditLast7Days: auditCounts,
        mfaAdoptionRate,
        mfaCount: mfaStats,
    })
})
