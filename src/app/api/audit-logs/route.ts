import { NextRequest } from 'next/server'
import { withAuth, successResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/db'

// GET /api/audit-logs
export const GET = withAuth(async (req: NextRequest, ctx) => {
    const { searchParams } = req.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
    const limit = Math.max(1, Math.min(parseInt(searchParams.get('limit') || '50') || 50, 100))
    const userId = searchParams.get('userId')
    const result = searchParams.get('result')
    const action = searchParams.get('action')
    const skip = (page - 1) * limit

    const where: any = {
        accountId: ctx.accountId,
    }

    if (userId) where.userId = userId
    if (result) where.result = result
    if (action) where.action = { contains: action, mode: 'insensitive' }

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            include: {
                user: {
                    select: {
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.auditLog.count({ where })
    ])

    const formattedLogs = logs.map(l => ({
        id: l.id,
        action: l.action,
        userId: l.userId,
        result: l.result,
        ipAddress: l.ipAddress,
        userAgent: l.userAgent,
        resourceId: l.resourceId,
        createdAt: l.createdAt,
        user: l.user ? {
            email: l.user.email,
            firstName: l.user.firstName,
            lastName: l.user.lastName,
        } : null,
    }))

    return successResponse({
        logs: formattedLogs,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
})
