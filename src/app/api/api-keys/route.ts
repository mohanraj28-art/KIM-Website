import { NextRequest } from 'next/server'
import { withAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { runQuery } from '@/lib/db'
import { z } from 'zod'

const createKeySchema = z.object({
    name: z.string().min(1).max(100),
    scopes: z.array(z.string()).optional().default([]),
    expiresAt: z.string().datetime().optional(),
})

// GET /api/api-keys
export const GET = withAuth(async (req: NextRequest, ctx) => {
    const result = await runQuery(
        `MATCH (k:ApiKey {tenantId: $tenantId})
         WHERE k.revokedAt IS NULL
         RETURN k
         ORDER BY k.createdAt DESC`,
        { tenantId: ctx.tenantId }
    )

    const keys = result.records.map(r => {
        const k = r.get('k').properties
        return {
            id: k.id,
            name: k.name,
            keyPrefix: k.keyPrefix,
            scopes: k.scopes ?? [],
            lastUsedAt: k.lastUsedAt ?? null,
            expiresAt: k.expiresAt ?? null,
            createdAt: k.createdAt,
        }
    })

    return successResponse(keys)
})

// POST /api/api-keys
export const POST = withAuth(async (req: NextRequest, ctx) => {
    try {
        const body = await req.json()
        const data = createKeySchema.parse(body)

        const rawKey = `kip_${Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex')}`
        const keyPrefix = rawKey.slice(0, 12) + '...'

        const encoder = new TextEncoder()
        const keyData = encoder.encode(rawKey)
        const hashBuffer = await crypto.subtle.digest('SHA-256', keyData)
        const keyHash = Buffer.from(hashBuffer).toString('hex')

        const keyId = crypto.randomUUID()
        const now = new Date().toISOString()

        await runQuery(
            `MATCH (u:User {id: $userId})
             CREATE (k:ApiKey {
                 id: $keyId,
                 name: $name,
                 keyPrefix: $keyPrefix,
                 keyHash: $keyHash,
                 scopes: $scopes,
                 tenantId: $tenantId,
                 expiresAt: $expiresAt,
                 revokedAt: null,
                 lastUsedAt: null,
                 createdAt: $now
             })<-[:HAS_API_KEY]-(u)`,
            {
                userId: ctx.userId, keyId, name: data.name, keyPrefix, keyHash,
                scopes: data.scopes, tenantId: ctx.tenantId,
                expiresAt: data.expiresAt ?? null, now,
            }
        )

        await runQuery(
            `MATCH (u:User {id: $userId})
             CREATE (a:AuditLog {
                 id: $id, action: 'api_key.created', result: 'SUCCESS',
                 resourceId: $keyId, tenantId: $tenantId, createdAt: $now
             })<-[:HAS_AUDIT_LOG]-(u)`,
            { id: crypto.randomUUID(), userId: ctx.userId, keyId, tenantId: ctx.tenantId, now }
        )

        return successResponse({ id: keyId, name: data.name, keyPrefix, scopes: data.scopes, createdAt: now, rawKey }, 201)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to create API key'
        return errorResponse(message)
    }
})

// DELETE /api/api-keys?id=xxx
export const DELETE = withAuth(async (req: NextRequest, ctx) => {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return errorResponse('Key ID required', 400)

    const now = new Date().toISOString()
    await runQuery(
        `MATCH (k:ApiKey {id: $id, tenantId: $tenantId})
         SET k.revokedAt = $now`,
        { id, tenantId: ctx.tenantId, now }
    )

    await runQuery(
        `MATCH (u:User {id: $userId})
         CREATE (a:AuditLog {
             id: $logId, action: 'api_key.revoked', result: 'SUCCESS',
             resourceId: $id, tenantId: $tenantId, createdAt: $now
         })<-[:HAS_AUDIT_LOG]-(u)`,
        { logId: crypto.randomUUID(), userId: ctx.userId, id, tenantId: ctx.tenantId, now }
    )

    return successResponse({ revoked: true })
})
