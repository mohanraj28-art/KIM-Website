import { NextRequest } from 'next/server'
import { withAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/db'
import { Prisma } from '@/generated/client'
import { z } from 'zod'

const createGroupSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
})

// GET /api/groups - list groups for the account
export const GET = withAuth(async (req: NextRequest, ctx) => {
    const groups = await prisma.group.findMany({
        where: { accountId: ctx.accountId },
        include: {
            _count: {
                select: { members: true }
            }
        },
        orderBy: { createdAt: 'desc' },
    })

    const formattedGroups = groups.map(g => ({
        id: g.id,
        name: g.name,
        description: g.description,
        memberCount: g._count.members,
        createdAt: g.createdAt,
    }))

    return successResponse(formattedGroups)
})

// POST /api/groups - create a new group
export const POST = withAuth(async (req: NextRequest, ctx) => {
    console.log('DEBUG: accountId =', ctx.accountId)
    try {
        const body = await req.json()
        const data = createGroupSchema.parse(body)

        // Check if group already exists in this account
        const existing = await prisma.group.findFirst({
            where: {
                name: data.name,
                accountId: ctx.accountId,
            }
        })

        if (existing) {
            return errorResponse('A group with this name already exists', 409)
        }

        const newGroup = await prisma.group.create({
            data: {
                name: data.name,
                description: data.description,
                accountId: ctx.accountId,
            }
        })

        // Audit log
        await prisma.auditLog.create({
            data: {
                action: 'group.created',
                result: 'SUCCESS',
                resourceId: newGroup.id,
                accountId: ctx.accountId,
                userId: ctx.userId,
                metadata: { groupName: data.name }
            }
        })

        return successResponse(newGroup, 201)
    } catch (error: unknown) {
        const message = error instanceof z.ZodError
            ? error.issues[0].message
            : error instanceof Error
                ? error.message
                : 'Failed to create group'
        return errorResponse(message)
    }
})
