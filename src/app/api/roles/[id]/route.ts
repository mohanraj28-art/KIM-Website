import { NextRequest } from 'next/server'
import { withAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// GET /api/roles/[id]
export const GET = withAuth(async (req: NextRequest, ctx) => {
    const { id } = await ctx.params
    const role = await prisma.role.findFirst({
        where: {
            id,
            accountId: ctx.accountId
        },
        include: {
            permissions: {
                include: {
                    permission: true
                }
            }
        }
    })

    if (!role) return errorResponse('Role not found', 404)

    return successResponse({
        ...role,
        permissions: role.permissions.map(p => p.permission.key)
    })
})

// PATCH /api/roles/[id]
export const PATCH = withAuth(async (req: NextRequest, ctx) => {
    const { id } = await ctx.params
    if (!id) return errorResponse('Missing Role ID', 400)

    try {
        const body = await req.json()
        const data = z.object({
            name: z.string().min(1).optional(),
            description: z.string().optional(),
            permissions: z.array(z.string()).optional()
        }).parse(body)

        const role = await prisma.role.findFirst({
            where: { id, accountId: ctx.accountId }
        })

        if (!role) return errorResponse('Role not found', 404)
        if (role.isSystem) return errorResponse('System roles cannot be modified', 403)

        const updatedRole = await prisma.$transaction(async (tx) => {
            const r = await tx.role.update({
                where: { id },
                data: {
                    name: data.name,
                    description: data.description,
                    key: data.name ? data.name.toLowerCase().replace(/\s+/g, '-') : undefined
                }
            })

            if (data.permissions) {
                // Remove old permissions
                await tx.rolePermission.deleteMany({
                    where: { roleId: id }
                })

                // Add new permissions
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
                            roleId: id,
                            permissionId: permission.id
                        }
                    })
                }
            }

            return r
        })

        return successResponse(updatedRole)
    } catch (error: any) {
        return errorResponse(error.message || 'Failed to update role')
    }
})

// DELETE /api/roles/[id]
export const DELETE = withAuth(async (req: NextRequest, ctx) => {
    const { id } = await ctx.params
    if (!id) return errorResponse('Missing Role ID', 400)

    const role = await prisma.role.findFirst({
        where: { id, accountId: ctx.accountId }
    })

    if (!role) return errorResponse('Role not found', 404)
    if (role.isSystem) return errorResponse('System roles cannot be deleted', 403)

    await prisma.role.delete({
        where: { id }
    })

    // Audit log
    await prisma.auditLog.create({
        data: {
            action: 'role.deleted',
            result: 'SUCCESS',
            resourceId: id,
            accountId: ctx.accountId,
            userId: ctx.userId,
            metadata: { roleName: role.name }
        }
    })

    return successResponse({ deleted: true })
})
