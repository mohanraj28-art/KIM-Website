import { NextRequest } from 'next/server'
import { withAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createKeySchema = z.object({
    name: z.string().min(1).max(100),
    scopes: z.array(z.string()).optional().default([]),
    expiresAt: z.string().datetime().optional(),
})

// GET /api/api-keys
export const GET = withAuth(async (req: NextRequest, ctx) => {
    const keys = await prisma.apiKey.findMany({
        where: {
            accountId: ctx.accountId,
            revokedAt: null
        },
        orderBy: { createdAt: 'desc' }
    })

    const formattedKeys = keys.map(k => ({
        id: k.id,
        name: k.name,
        keyPrefix: k.keyPrefix,
        scopes: k.scopes,
        lastUsedAt: k.lastUsedAt,
        expiresAt: k.expiresAt,
        createdAt: k.createdAt,
    }))

    return successResponse(formattedKeys)
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

        const newKey = await prisma.apiKey.create({
            data: {
                name: data.name,
                keyPrefix: keyPrefix,
                keyHash: keyHash,
                scopes: data.scopes,
                accountId: ctx.accountId,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
            }
        })

        // Audit log
        await prisma.auditLog.create({
            data: {
                action: 'api_key.created',
                result: 'SUCCESS',
                resourceId: newKey.id,
                accountId: ctx.accountId,
                userId: ctx.userId
            }
        })

        return successResponse({
            id: newKey.id,
            name: data.name,
            keyPrefix,
            scopes: data.scopes,
            createdAt: newKey.createdAt,
            rawKey
        }, 201)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to create API key'
        return errorResponse(message)
    }
})

// DELETE /api/api-keys?id=xxx
export const DELETE = withAuth(async (req: NextRequest, ctx) => {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return errorResponse('Key ID required', 400)

    await prisma.apiKey.update({
        where: { id, accountId: ctx.accountId },
        data: { revokedAt: new Date() }
    })

    // Audit log
    await prisma.auditLog.create({
        data: {
            action: 'api_key.revoked',
            result: 'SUCCESS',
            resourceId: id,
            accountId: ctx.accountId,
            userId: ctx.userId
        }
    })

    return successResponse({ revoked: true })
})
