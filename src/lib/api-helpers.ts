import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'

export type ApiContext = {
    userId: string
    accountId: string // formerly tenantId
    sessionId: string
    email: string
    params: any
}

type Handler = (req: NextRequest, ctx: ApiContext) => Promise<NextResponse>

export function withAuth(handler: Handler) {
    return async function routeHandler(
        req: NextRequest,
        context?: { params: Promise<any> | any }
    ): Promise<NextResponse> {
        try {
            const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
            const limited = await rateLimit(ip, 100, 60)
            if (!limited.success) {
                return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
            }

            const payload = await getUserFromRequest(req)
            if (!payload) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }

            // Verify session is still valid in PostgreSQL
            const session = await prisma.session.findFirst({
                where: {
                    id: payload.sid,
                    userId: payload.sub,
                    active: true,
                    expiresAt: {
                        gt: new Date()
                    }
                },
                select: { id: true }
            })

            if (!session) {
                return NextResponse.json({ error: 'Session expired or revoked' }, { status: 401 })
            }

            // Update last active timestamp
            await prisma.session.update({
                where: { id: payload.sid },
                data: { lastActiveAt: new Date() }
            })

            const ctx: ApiContext = {
                userId: payload.sub,
                accountId: payload.tid, // tid is kept as accountId
                sessionId: payload.sid,
                email: payload.email,
                params: context?.params || {}
            }

            return await handler(req, ctx)
        } catch (error: unknown) {
            console.error('[API Auth] Error:', error)
            const message = error instanceof Error ? error.message : 'Internal Server Error'
            return NextResponse.json({
                success: false,
                error: message
            }, { status: 500 })
        }
    }
}

export function withAdminAuth(handler: Handler) {
    return withAuth(async (req, ctx) => {
        // Check if user has admin role via PostgreSQL (Check across Tenants)
        const member = await prisma.tenantMember.findFirst({
            where: {
                userId: ctx.userId,
                role: {
                    key: {
                        in: ['admin', 'super_admin', 'owner']
                    }
                }
            },
            include: {
                role: true
            }
        })

        if (!member) {
            // Check if user is the account owner (fallback)
            const account = await prisma.account.findUnique({
                where: { id: ctx.accountId },
                include: {
                    users: {
                        orderBy: { createdAt: 'asc' },
                        take: 1
                    }
                }
            })

            const isOwner = account?.users[0]?.id === ctx.userId

            if (!isOwner) {
                return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
            }
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
