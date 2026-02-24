'use client'

import { useState } from 'react'
import { CreditCard, Check, Star, ArrowRight, Zap, Shield, Users, Globe } from 'lucide-react'

const PLANS = [
    {
        name: 'Free',
        price: 0,
        period: 'forever',
        desc: 'For personal projects',
        color: '#8b949e',
        features: ['10 users', '1 organization', 'Email/password', '3 OAuth providers', 'Basic audit logs', 'Community support'],
        current: false,
    },
    {
        name: 'Starter',
        price: 25,
        period: 'per month',
        desc: 'For small teams',
        color: '#6366f1',
        features: ['100 users', '5 organizations', 'All auth methods', 'All OAuth providers', 'MFA & magic links', 'Advanced audit logs', 'Email support'],
        current: true,
    },
    {
        name: 'Pro',
        price: 99,
        period: 'per month',
        desc: 'For scaling companies',
        color: '#8b5cf6',
        popular: true,
        features: ['1,000 users', '25 organizations', 'Passkeys / WebAuthn', 'Custom domains', 'Webhooks & API keys', 'White-label branding', 'Priority support', 'SLA guarantee'],
        current: false,
    },
    {
        name: 'Enterprise',
        price: null,
        period: 'custom',
        desc: 'For large organizations',
        color: '#f0883e',
        features: ['Unlimited users', 'Unlimited orgs', 'SAML SSO', 'Custom SLA', 'Dedicated infra', 'SOC2 compliance', '24/7 support'],
        current: false,
    },
]

const USAGE = [
    { label: 'Users', used: 23, total: 100, color: '#6366f1' },
    { label: 'Organizations', used: 2, total: 5, color: '#8b5cf6' },
    { label: 'Monthly active users', used: 18, total: 100, color: '#3fb950' },
    { label: 'API requests (today)', used: 4821, total: 10000, color: '#f0883e' },
]

export default function BillingPage() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

    return (
        <div style={{ maxWidth: 1000, animation: 'fadeIn 0.4s ease' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CreditCard size={24} color="#6366f1" />
                        Billing & Plans
                    </h1>
                    <p style={{ color: '#8b949e', fontSize: 14 }}>Manage your subscription, usage, and payment details.</p>
                </div>
                <button className="btn btn-secondary" style={{ gap: 8 }}>
                    <CreditCard size={14} /> Manage billing
                </button>
            </div>

            {/* Current plan card */}
            <div style={{
                background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 16, padding: 24, marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={22} color="#6366f1" />
                    </div>
                    <div>
                        <p style={{ fontSize: 13, color: '#8b949e', marginBottom: 2 }}>Current plan</p>
                        <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 22 }}>Starter Plan</h2>
                        <p style={{ fontSize: 13, color: '#484f58' }}>$25/month · Renews March 23, 2026</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-secondary">Cancel plan</button>
                    <button className="btn btn-primary" style={{ gap: 8 }}>Upgrade <ArrowRight size={14} /></button>
                </div>
            </div>

            {/* Usage */}
            <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, marginBottom: 28 }}>
                <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Usage This Period</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
                    {USAGE.map((u, i) => (
                        <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 13, color: '#8b949e' }}>{u.label}</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#f0f6fc' }}>
                                    {u.used.toLocaleString()} / {u.total.toLocaleString()}
                                </span>
                            </div>
                            <div className="progress">
                                <div className="progress-bar" style={{ width: `${(u.used / u.total) * 100}%`, background: `linear-gradient(90deg, ${u.color}, ${u.color}aa)` }} />
                            </div>
                            <p style={{ fontSize: 11, color: '#484f58', marginTop: 4 }}>
                                {Math.round((u.used / u.total) * 100)}% used
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Plan selector */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 18, margin: 0 }}>All Plans</h2>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 3 }}>
                        {(['monthly', 'yearly'] as const).map(c => (
                            <button key={c} onClick={() => setBillingCycle(c)} style={{
                                padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                                background: billingCycle === c ? 'rgba(99,102,241,0.2)' : 'transparent',
                                color: billingCycle === c ? '#818cf8' : '#8b949e',
                                border: billingCycle === c ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                            }}>
                                {c} {c === 'yearly' && <span style={{ color: '#3fb950', marginLeft: 4 }}>-20%</span>}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    {PLANS.map((plan, i) => (
                        <div key={i} style={{
                            background: plan.current ? 'rgba(99,102,241,0.05)' : '#0d1117',
                            border: `1px solid ${plan.current ? 'rgba(99,102,241,0.4)' : plan.popular ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: 16, padding: 20, position: 'relative',
                        }}>
                            {plan.popular && (
                                <div style={{
                                    position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', borderRadius: 999,
                                    padding: '3px 12px', fontSize: 10, fontWeight: 700, color: 'white', whiteSpace: 'nowrap',
                                }}>
                                    ✦ Most Popular
                                </div>
                            )}
                            <div style={{ marginBottom: 12 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: plan.color }}>{plan.name}</span>
                                {plan.current && <span className="badge badge-primary" style={{ marginLeft: 6, fontSize: 10 }}>Current</span>}
                            </div>
                            <div style={{ marginBottom: 6 }}>
                                {plan.price === null ? (
                                    <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 26 }}>Custom</span>
                                ) : (
                                    <>
                                        <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 26 }}>
                                            ${billingCycle === 'yearly' ? Math.round(plan.price * 0.8) : plan.price}
                                        </span>
                                        <span style={{ fontSize: 12, color: '#484f58' }}>/mo</span>
                                    </>
                                )}
                            </div>
                            <p style={{ fontSize: 12, color: '#484f58', marginBottom: 16 }}>{plan.desc}</p>
                            <button className={`btn ${plan.current ? 'btn-secondary' : 'btn-primary'} btn-sm`} style={{ width: '100%', marginBottom: 16 }}>
                                {plan.current ? 'Current plan' : plan.price === null ? 'Contact sales' : 'Upgrade'}
                            </button>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                                {plan.features.map((f, j) => (
                                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8b949e' }}>
                                        <Check size={12} color={plan.color} style={{ flexShrink: 0 }} />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Invoice history */}
            <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 16, margin: 0 }}>Invoice History</h2>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            {['Date', 'Amount', 'Plan', 'Status', ''].map(h => (
                                <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { date: 'Feb 23, 2026', amount: '$25.00', plan: 'Starter', status: 'Paid' },
                            { date: 'Jan 23, 2026', amount: '$25.00', plan: 'Starter', status: 'Paid' },
                            { date: 'Dec 23, 2025', amount: '$25.00', plan: 'Starter', status: 'Paid' },
                        ].map((inv, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '12px 24px', fontSize: 13, color: '#8b949e' }}>{inv.date}</td>
                                <td style={{ padding: '12px 24px', fontSize: 13, fontWeight: 700, color: '#f0f6fc' }}>{inv.amount}</td>
                                <td style={{ padding: '12px 24px', fontSize: 13, color: '#8b949e' }}>{inv.plan}</td>
                                <td style={{ padding: '12px 24px' }}><span className="badge badge-success">{inv.status}</span></td>
                                <td style={{ padding: '12px 24px' }}>
                                    <button className="btn btn-ghost btn-sm">Download</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
