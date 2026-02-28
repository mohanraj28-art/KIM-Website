import { NextRequest } from 'next/server'
import { withAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { hashPassword } from '@/lib/auth/auth'

const createUserSchema = z.object({
    email: z.string().email(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    password: z.string().min(8).optional(),
})

// GET /api/users - list users for the account
export const GET = withAuth(async (req: NextRequest, ctx) => {
    const { searchParams } = req.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
    const limit = Math.max(1, Math.min(parseInt(searchParams.get('limit') || '20') || 20, 100))
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    const where: any = {
        accountId: ctx.accountId,
        deletedAt: null,
    }

    if (search) {
        where.OR = [
            { email: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
        ]
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            include: {
                mfaSettings: {
                    where: { verified: true },
                    select: { type: true }
                },
                _count: {
                    select: {
                        sessions: { where: { active: true } },
                        tenantMembers: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.user.count({ where }),
    ])

    const formattedUsers = users.map(u => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        emailVerified: u.emailVerified,
        phone: u.phone,
        banned: u.banned,
        lastSignInAt: u.lastSignInAt,
        createdAt: u.createdAt,
        mfaEnabled: u.mfaSettings.length > 0,
        sessionCount: u._count.sessions,
        tenantCount: u._count.tenantMembers,
    }))

    return successResponse({
        users: formattedUsers,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    })
})

// POST /api/users - create a new user
export const POST = withAuth(async (req: NextRequest, ctx) => {
    try {
        const body = await req.json()
        const data = createUserSchema.parse(body)

        // Check if user already exists in this account
        const existing = await prisma.user.findFirst({
            where: {
                email: data.email,
                accountId: ctx.accountId,
                deletedAt: null
            }
        })

        if (existing) {
            return errorResponse('User with this email already exists in your account', 409)
        }

        const newUser = await prisma.user.create({
            data: {
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                displayName: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : data.email.split('@')[0],
                accountId: ctx.accountId,
                emailVerified: true,
                passwords: data.password ? {
                    create: {
                        hash: await hashPassword(data.password),
                        strength: 3
                    }
                } : undefined
            }
        })

        // Audit log
        await prisma.auditLog.create({
            data: {
                action: 'user.created',
                result: 'SUCCESS',
                resourceId: newUser.id,
                accountId: ctx.accountId,
                userId: ctx.userId,
                metadata: { createdEmail: data.email }
            }
        })

        return successResponse(newUser, 201)
    } catch (error: any) {
        const message = error instanceof z.ZodError ? error.issues[0].message : error.message
        return errorResponse(message || 'Failed to create user')
    }
})
