import { NextRequest } from 'next/server'
import { withAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createTenantSchema = z.object({
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
    description: z.string().max(500).optional(),
    website: z.string().url().optional(),
    industry: z.string().optional(),
})

// GET /api/tenants
export const GET = withAuth(async (req: NextRequest, ctx) => {
    const { searchParams } = req.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
    const limit = Math.max(1, Math.min(parseInt(searchParams.get('limit') || '20') || 20, 100))
    const skip = (page - 1) * limit

    const [tenants, total] = await Promise.all([
        prisma.tenant.findMany({
            where: {
                accountId: ctx.accountId,
                deletedAt: null,
            },
            include: {
                _count: {
                    select: { members: true }
                },
                members: {
                    where: { userId: ctx.userId },
                    include: { role: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.tenant.count({
            where: {
                accountId: ctx.accountId,
                deletedAt: null,
            }
        }),
    ])

    const formattedTenants = tenants.map(t => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        logoUrl: t.logoUrl,
        description: t.description,
        website: t.website,
        industry: t.industry,
        memberCount: t._count.members,
        myRole: t.members[0]?.role?.key ?? null,
        createdAt: t.createdAt,
    }))

    return successResponse({
        tenants: formattedTenants,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
})

// POST /api/tenants
export const POST = withAuth(async (req: NextRequest, ctx) => {
    try {
        const body = await req.json()
        const data = createTenantSchema.parse(body)

        // Check slug uniqueness in account
        const existing = await prisma.tenant.findFirst({
            where: {
                slug: data.slug,
                accountId: ctx.accountId,
                deletedAt: null,
            }
        })
        if (existing) {
            return errorResponse('A tenant with this slug already exists', 409)
        }

        const newTenant = await prisma.$transaction(async (tx) => {
            // Create tenant
            const tenant = await tx.tenant.create({
                data: {
                    name: data.name,
                    slug: data.slug,
                    description: data.description,
                    website: data.website,
                    industry: data.industry,
                    accountId: ctx.accountId,
                }
            })

            // Create Owner role for this tenant
            const ownerRole = await tx.role.create({
                data: {
                    name: 'Owner',
                    key: 'owner',
                    isSystem: true,
                    accountId: ctx.accountId,
                    tenantId: tenant.id,
                }
            })

            // Add creator as member with owner role
            await tx.tenantMember.create({
                data: {
                    tenantId: tenant.id,
                    userId: ctx.userId,
                    roleId: ownerRole.id
                }
            })

            return tenant
        })

        // Audit log
        await prisma.auditLog.create({
            data: {
                action: 'tenant.created',
                result: 'SUCCESS',
                resourceId: newTenant.id,
                accountId: ctx.accountId,
                userId: ctx.userId
            }
        })

        return successResponse(newTenant, 201)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to create tenant'
        return errorResponse(message)
    }
})
