import { NextRequest } from 'next/server'
import { withAuth, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import crypto from 'crypto'

const createWebhookSchema = z.object({
    url: z.string().url(),
    events: z.array(z.string()).min(1),
    description: z.string().max(500).optional(),
    active: z.boolean().optional().default(true),
})

// GET /api/webhooks
export const GET = withAuth(async (req: NextRequest, ctx) => {
    const webhooks = await prisma.webhook.findMany({
        where: { accountId: ctx.accountId },
        include: {
            _count: {
                select: { deliveries: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    // Get success/fail counts for each webhook (simplified for now)
    const formattedWebhooks = await Promise.all(webhooks.map(async (w) => {
        const stats = await prisma.webhookDelivery.groupBy({
            by: ['success'],
            where: { webhookId: w.id },
            _count: true
        })

        const success = stats.find(s => s.success)?._count ?? 0
        const failed = stats.find(s => !s.success)?._count ?? 0

        const lastDelivery = await prisma.webhookDelivery.findFirst({
            where: { webhookId: w.id },
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true }
        })

        return {
            id: w.id,
            url: w.url,
            events: w.events,
            active: w.active,
            description: w.description,
            deliveries: {
                total: success + failed,
                success,
                failed
            },
            lastDeliveryAt: lastDelivery?.createdAt ?? null,
            createdAt: w.createdAt,
        }
    }))

    return successResponse(formattedWebhooks)
})

// POST /api/webhooks
export const POST = withAuth(async (req: NextRequest, ctx) => {
    try {
        const body = await req.json()
        const data = createWebhookSchema.parse(body)

        // Generate a random secret for the webhook
        const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`

        const webhook = await prisma.webhook.create({
            data: {
                url: data.url,
                events: data.events,
                description: data.description,
                active: data.active,
                secret,
                accountId: ctx.accountId,
            }
        })

        // Audit log
        await prisma.auditLog.create({
            data: {
                action: 'webhook.created',
                result: 'SUCCESS',
                resourceId: webhook.id,
                accountId: ctx.accountId,
                userId: ctx.userId,
                description: `Created webhook for ${data.url}`
            }
        })

        return successResponse(webhook, 201)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to create webhook'
        return errorResponse(message)
    }
})

// DELETE /api/webhooks?id=xxx
export const DELETE = withAuth(async (req: NextRequest, ctx) => {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return errorResponse('Webhook ID required', 400)

    try {
        const webhook = await prisma.webhook.delete({
            where: { id, accountId: ctx.accountId }
        })

        // Audit log
        await prisma.auditLog.create({
            data: {
                action: 'webhook.deleted',
                result: 'SUCCESS',
                resourceId: id,
                accountId: ctx.accountId,
                userId: ctx.userId,
                description: `Deleted webhook for ${webhook.url}`
            }
        })

        return successResponse({ deleted: true })
    } catch (error: unknown) {
        return errorResponse('Webhook not found or already deleted', 404)
    }
})

// PATCH /api/webhooks?id=xxx (Toggle active status)
export const PATCH = withAuth(async (req: NextRequest, ctx) => {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return errorResponse('Webhook ID required', 400)

    try {
        const body = await req.json()
        const webhook = await prisma.webhook.update({
            where: { id, accountId: ctx.accountId },
            data: {
                active: body.active,
                url: body.url,
                events: body.events,
                description: body.description,
            }
        })

        return successResponse(webhook)
    } catch (error: unknown) {
        return errorResponse('Failed to update webhook', 400)
    }
})
