import { NextRequest } from 'next/server'
import { withAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createRoleSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    permissions: z.array(z.string()),
})

// GET /api/roles
export const GET = withAuth(async (req: NextRequest, ctx) => {
    const roles = await prisma.role.findMany({
        where: {
            accountId: ctx.accountId,
            // We can also allow fetching global roles if needed
        },
        include: {
            permissions: {
                include: {
                    permission: true
                }
            },
            _count: {
                select: { members: true }
            }
        },
        orderBy: { createdAt: 'desc' },
    })

    const formattedRoles = roles.map(r => ({
        id: r.id,
        name: r.name,
        key: r.key,
        description: r.description,
        type: r.isSystem ? 'SYSTEM' : 'CUSTOM',
        users: r._count.members,
        permissions: r.permissions.map(p => p.permission.key)
    }))

    return successResponse(formattedRoles)
})

// POST /api/roles
export const POST = withAuth(async (req: NextRequest, ctx) => {
    try {
        const body = await req.json()
        const data = createRoleSchema.parse(body)

        const key = data.name.toLowerCase().replace(/\s+/g, '-')

        // Check uniqueness
        const existing = await prisma.role.findFirst({
            where: {
                accountId: ctx.accountId,
                key
            }
        })

        if (existing) {
            return errorResponse('A role with this key already exists', 409)
        }

        const newRole = await prisma.$transaction(async (tx) => {
            // Create the role
            const role = await tx.role.create({
                data: {
                    name: data.name,
                    key,
                    description: data.description,
                    accountId: ctx.accountId,
                    isSystem: false,
                }
            })

            // Create permissions if they don't exist and link them
            // In a real system, permissions should already exist in the database.
            // For now, we'll try to find or create them for demo purposes.
            for (const permKey of data.permissions) {
                let permission = await tx.permission.findUnique({
                    where: { key: permKey }
                })

                if (!permission) {
                    permission = await tx.permission.create({
                        data: {
                            key: permKey,
                            name: permKey.split(':').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
                        }
                    })
                }

                await tx.rolePermission.create({
                    data: {
                        roleId: role.id,
                        permissionId: permission.id
                    }
                })
            }

            return role
        })

        // Audit log
        await prisma.auditLog.create({
            data: {
                action: 'role.created',
                result: 'SUCCESS',
                resourceId: newRole.id,
                accountId: ctx.accountId,
                userId: ctx.userId,
                metadata: { roleName: data.name }
            }
        })

        return successResponse(newRole, 201)
    } catch (error: any) {
        const message = error instanceof z.ZodError ? error.issues[0].message : error.message
        return errorResponse(message || 'Failed to create role')
    }
})
