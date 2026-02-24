import { NextRequest } from 'next/server'
import { withAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { runQuery, runTransaction } from '@/lib/db'
import { z } from 'zod'

const createOrgSchema = z.object({
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
    description: z.string().max(500).optional(),
    website: z.string().url().optional(),
    industry: z.string().optional(),
})

// GET /api/organizations
export const GET = withAuth(async (req: NextRequest, ctx) => {
    const { searchParams } = req.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [orgsResult, countResult] = await Promise.all([
        runQuery(
            `MATCH (org:Organization)-[:BELONGS_TO]->(:Tenant {id: $tenantId})
             WHERE org.deletedAt IS NULL
             OPTIONAL MATCH (org)<-[:IS_MEMBER]-(m:User)
             OPTIONAL MATCH (u:User {id: $userId})-[:IS_MEMBER]->(org)-[:HAS_ROLE]->(r:Role)
             WITH org, count(DISTINCT m) AS memberCount, r.key AS myRole
             RETURN org, memberCount, myRole
             ORDER BY org.createdAt DESC
             SKIP $skip LIMIT $limit`,
            { tenantId: ctx.tenantId, userId: ctx.userId, skip, limit }
        ),
        runQuery(
            `MATCH (org:Organization)-[:BELONGS_TO]->(:Tenant {id: $tenantId})
             WHERE org.deletedAt IS NULL
             RETURN count(org) AS total`,
            { tenantId: ctx.tenantId }
        ),
    ])

    const total = countResult.records[0]?.get('total').toNumber() ?? 0

    const organizations = orgsResult.records.map(r => {
        const o = r.get('org').properties
        return {
            id: o.id,
            name: o.name,
            slug: o.slug,
            logoUrl: o.logoUrl ?? null,
            description: o.description ?? null,
            website: o.website ?? null,
            industry: o.industry ?? null,
            memberCount: r.get('memberCount').toNumber(),
            myRole: r.get('myRole') ?? null,
            createdAt: o.createdAt,
        }
    })

    return successResponse({
        organizations,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
})

// POST /api/organizations
export const POST = withAuth(async (req: NextRequest, ctx) => {
    try {
        const body = await req.json()
        const data = createOrgSchema.parse(body)

        // Check slug uniqueness in tenant
        const existing = await runQuery(
            `MATCH (org:Organization {slug: $slug})-[:BELONGS_TO]->(:Tenant {id: $tenantId})
             RETURN org.id AS id LIMIT 1`,
            { slug: data.slug, tenantId: ctx.tenantId }
        )
        if (existing.records.length > 0) {
            return errorResponse('An organization with this slug already exists', 409)
        }

        const orgId = crypto.randomUUID()
        const roleId = crypto.randomUUID()
        const memberId = crypto.randomUUID()
        const now = new Date().toISOString()

        await runTransaction([
            {
                cypher: `
                    MATCH (t:Tenant {id: $tenantId})
                    CREATE (org:Organization {
                        id: $orgId,
                        name: $name,
                        slug: $slug,
                        description: $desc,
                        website: $website,
                        industry: $industry,
                        logoUrl: null,
                        deletedAt: null,
                        createdAt: $now,
                        updatedAt: $now
                    })-[:BELONGS_TO]->(t)`,
                params: {
                    tenantId: ctx.tenantId, orgId,
                    name: data.name, slug: data.slug,
                    desc: data.description ?? null,
                    website: data.website ?? null,
                    industry: data.industry ?? null,
                    now,
                },
            },
            {
                cypher: `
                    MATCH (org:Organization {id: $orgId})
                    CREATE (r:Role {
                        id: $roleId, name: 'Owner', key: 'owner',
                        isSystem: true, createdAt: $now
                    })<-[:HAS_ROLE]-(org)`,
                params: { orgId, roleId, now },
            },
            {
                cypher: `
                    MATCH (u:User {id: $userId})
                    MATCH (org:Organization {id: $orgId})
                    MATCH (r:Role {id: $roleId})
                    CREATE (u)-[:IS_MEMBER {id: $memberId, createdAt: $now}]->(org)`,
                params: { userId: ctx.userId, orgId, roleId, memberId, now },
            },
        ])

        // Audit log
        await runQuery(
            `MATCH (u:User {id: $userId})
             CREATE (a:AuditLog {
                 id: $id, action: 'org.created', result: 'SUCCESS',
                 resourceId: $orgId, tenantId: $tenantId, createdAt: $now
             })<-[:HAS_AUDIT_LOG]-(u)`,
            { id: crypto.randomUUID(), userId: ctx.userId, orgId, tenantId: ctx.tenantId, now }
        )

        return successResponse({ id: orgId, ...data, createdAt: now }, 201)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to create organization'
        return errorResponse(message)
    }
})
