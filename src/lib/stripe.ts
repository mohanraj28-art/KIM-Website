import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.acacia' as any,
})

export const PLANS = {
    FREE: {
        name: 'Free',
        price: 0,
        priceId: null,
        maxUsers: 10,
        maxTenants: 1,
        features: [
            'Up to 10 users',
            '1 tenant',
            'Email/password auth',
            'Social login (3 providers)',
            'Basic audit logs',
            'Community support',
        ],
    },
    STARTER: {
        name: 'Starter',
        price: 25,
        priceId: process.env.STRIPE_PRICE_STARTER,
        maxUsers: 100,
        maxTenants: 5,
        features: [
            'Up to 100 users',
            '5 tenants',
            'All auth methods',
            'All social providers',
            'MFA support',
            'Magic links & OTP',
            'Advanced audit logs',
            'Email support',
        ],
    },
    PRO: {
        name: 'Pro',
        price: 99,
        priceId: process.env.STRIPE_PRICE_PRO,
        maxUsers: 1000,
        maxTenants: 25,
        features: [
            'Up to 1,000 users',
            '25 tenants',
            'Passkeys / WebAuthn',
            'Custom domains',
            'Webhooks',
            'API keys',
            'White-label branding',
            'Priority support',
        ],
    },
    ENTERPRISE: {
        name: 'Enterprise',
        price: null, // Custom
        priceId: process.env.STRIPE_PRICE_ENTERPRISE,
        maxUsers: -1, // Unlimited
        maxTenants: -1,
        features: [
            'Unlimited users',
            'Unlimited tenants',
            'SAML SSO',
            'Custom SLA',
            'Dedicated infrastructure',
            'SOC2 compliance',
            'On-premise option',
            '24/7 support',
        ],
    },
}

export async function createStripeCustomer(email: string, name: string, accountId: string) {
    return stripe.customers.create({
        email,
        name,
        metadata: { accountId },
    })
}

export async function createCheckoutSession({
    customerId,
    priceId,
    successUrl,
    cancelUrl,
    accountId,
    trialDays,
}: {
    customerId: string
    priceId: string
    successUrl: string
    cancelUrl: string
    accountId: string
    trialDays?: number
}) {
    return stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { accountId },
        subscription_data: {
            trial_period_days: trialDays,
            metadata: { accountId },
        },
    })
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
    return stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    })
}

export async function handleWebhookEvent(payload: Buffer, signature: string) {
    const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
    )
    return event
}
