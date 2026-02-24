import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { runQuery } from '@/lib/db'

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
                const session = event.data.object as {
                    metadata?: { tenantId?: string }
                    customer?: string | null
                    subscription?: string | null
                }
                const tenantId = session.metadata?.tenantId
                if (!tenantId) break

                await runQuery(
                    `MATCH (t:Tenant {id: $tenantId})
                     SET t.stripeCustomerId = $customerId,
                         t.stripeSubscriptionId = $subscriptionId,
                         t.subscriptionStatus = 'ACTIVE'`,
                    {
                        tenantId,
                        customerId: session.customer ?? null,
                        subscriptionId: session.subscription ?? null,
                    }
                )
                break
            }

            case 'customer.subscription.updated': {
                const sub = event.data.object as {
                    metadata?: { tenantId?: string }
                    status?: string
                    trial_end?: number | null
                    items?: { data?: Array<{ price?: { id?: string } }> }
                }
                const tenantId = sub.metadata?.tenantId
                if (!tenantId) break

                const status =
                    sub.status === 'active' ? 'ACTIVE' :
                        sub.status === 'trialing' ? 'TRIALING' :
                            sub.status === 'past_due' ? 'PAST_DUE' :
                                sub.status === 'canceled' ? 'CANCELED' : 'INACTIVE'

                await runQuery(
                    `MATCH (t:Tenant {id: $tenantId})
                     SET t.subscriptionStatus = $status,
                         t.trialEndsAt = $trialEndsAt,
                         t.stripePriceId = $priceId`,
                    {
                        tenantId,
                        status,
                        trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
                        priceId: sub.items?.data?.[0]?.price?.id ?? null,
                    }
                )
                break
            }

            case 'customer.subscription.deleted': {
                const sub = event.data.object as { metadata?: { tenantId?: string } }
                const tenantId = sub.metadata?.tenantId
                if (!tenantId) break

                await runQuery(
                    `MATCH (t:Tenant {id: $tenantId})
                     SET t.subscriptionStatus = 'CANCELED', t.stripeSubscriptionId = null`,
                    { tenantId }
                )
                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as { customer?: string | null }
                const tenantResult = await runQuery(
                    `MATCH (t:Tenant {stripeCustomerId: $customerId})
                     RETURN t.id AS id LIMIT 1`,
                    { customerId: invoice.customer ?? '' }
                )
                if (tenantResult.records.length > 0) {
                    const tenantId = tenantResult.records[0].get('id')
                    await runQuery(
                        `MATCH (t:Tenant {id: $tenantId})
                         SET t.subscriptionStatus = 'PAST_DUE'`,
                        { tenantId }
                    )
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
