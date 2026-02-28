import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { SubscriptionStatus } from '@prisma/client'

export async function POST(req: NextRequest) {
    const body = await req.arrayBuffer()
    const payload = Buffer.from(body)
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: ReturnType<typeof stripe.webhooks.constructEvent>

    try {
        event = stripe.webhooks.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        ) as ReturnType<typeof stripe.webhooks.constructEvent>
    } catch {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any
                const accountId = session.metadata?.accountId
                if (!accountId) break

                await prisma.account.update({
                    where: { id: accountId },
                    data: {
                        stripeCustomerId: session.customer ?? null,
                        stripeSubscriptionId: session.subscription ?? null,
                        subscriptionStatus: 'ACTIVE' as SubscriptionStatus,
                    }
                })
                break
            }

            case 'customer.subscription.updated': {
                const sub = event.data.object as any
                const accountId = sub.metadata?.accountId
                if (!accountId) break

                const statusMap: Record<string, SubscriptionStatus> = {
                    'active': 'ACTIVE',
                    'trialing': 'TRIALING',
                    'past_due': 'PAST_DUE',
                    'canceled': 'CANCELED',
                    'unpaid': 'INACTIVE',
                    'incomplete': 'INACTIVE',
                }

                const status = statusMap[sub.status] || 'INACTIVE'

                await prisma.account.update({
                    where: { id: accountId },
                    data: {
                        subscriptionStatus: status,
                        trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
                        stripePriceId: sub.items?.data?.[0]?.price?.id ?? null,
                    }
                })
                break
            }

            case 'customer.subscription.deleted': {
                const sub = event.data.object as any
                const accountId = sub.metadata?.accountId
                if (!accountId) break

                await prisma.account.update({
                    where: { id: accountId },
                    data: {
                        subscriptionStatus: 'CANCELED' as SubscriptionStatus,
                        stripeSubscriptionId: null,
                    }
                })
                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as any
                if (invoice.customer) {
                    await prisma.account.updateMany({
                        where: { stripeCustomerId: invoice.customer },
                        data: {
                            subscriptionStatus: 'PAST_DUE' as SubscriptionStatus,
                        }
                    })
                }
                break
            }

            default:
                console.log(`Unhandled webhook event: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook processing error:', error)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}
