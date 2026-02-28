import { NextRequest } from 'next/server'
import { withAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/db'

// GET /api/sessions - list sessions for current account/user
export const GET = withAuth(async (req: NextRequest, ctx) => {
    const { searchParams } = req.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
    const limit = Math.max(1, Math.min(parseInt(searchParams.get('limit') || '20') || 20, 100))
    const userId = searchParams.get('userId')
    const listAll = searchParams.get('all') === 'true'
    const activeOnly = searchParams.get('active') !== 'false'
    const skip = (page - 1) * limit

    const where: any = {
        accountId: ctx.accountId,
    }

    if (userId) {
        where.userId = userId
    } else if (!listAll) {
        where.userId = ctx.userId
    }

    if (activeOnly) {
        where.active = true
        where.expiresAt = { gt: new Date() }
    }

    const [sessions, total] = await Promise.all([
        prisma.session.findMany({
            where,
            include: {
                user: {
                    select: {
                        email: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: { lastActiveAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.session.count({ where })
    ])

    const formattedSessions = sessions.map(s => ({
        id: s.id,
        userId: s.userId,
        user: s.user,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        active: s.active,
        lastActiveAt: s.lastActiveAt,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        country: s.country,
        city: s.city,
        isCurrent: s.id === ctx.sessionId,
    }))

    return successResponse({
        sessions: formattedSessions,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
})

// DELETE /api/sessions?id=xxx  or  ?all=true
export const DELETE = withAuth(async (req: NextRequest, ctx) => {
    const id = req.nextUrl.searchParams.get('id')
    const revokeAll = req.nextUrl.searchParams.get('all') === 'true'

    if (revokeAll) {
        // Revoke all active sessions for this account EXCEPT current one
        await prisma.session.updateMany({
            where: {
                accountId: ctx.accountId,
                active: true,
                id: { not: ctx.sessionId }
            },
            data: {
                active: false,
                revokedAt: new Date()
            }
        })

        await prisma.auditLog.create({
            data: {
                action: 'session.revoked_all',
                result: 'SUCCESS',
                accountId: ctx.accountId,
                userId: ctx.userId,
                description: 'Revoked all other active sessions in the account'
            }
        })

        return successResponse({ revokedAll: true })
    }

    if (!id) return errorResponse('Session ID required', 400)

    const session = await prisma.session.findFirst({
        where: {
            id,
            accountId: ctx.accountId
        }
    })

    if (!session) return errorResponse('Session not found', 404)

    await prisma.session.update({
        where: { id },
        data: {
            active: false,
            revokedAt: new Date(),
            revokedBy: ctx.userId
        }
    })

    // Audit log
    await prisma.auditLog.create({
        data: {
            action: 'session.revoked',
            result: 'SUCCESS',
            resourceId: id,
            accountId: ctx.accountId,
            userId: ctx.userId,
            description: `Revoked session ${id} for user ${session.userId}`
        }
    })

    return successResponse({ revoked: true })
})
