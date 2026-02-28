'use client'

import Link from 'next/link'
import {
  Shield, Zap, Users, Globe, Lock, Key,
  CheckCircle, ArrowRight, Star, Sparkles,
  BarChart3, Building2, Fingerprint, Code2,
  ChevronRight
} from 'lucide-react'

const FEATURES = [
  {
    icon: Shield,
    title: 'Enterprise-Grade Security',
    desc: 'SOC2-style practices, breach detection, rate limiting, and JWT-based auth out of the box.',
    color: 'from-indigo-500 to-violet-600',
  },
  {
    icon: Users,
    title: 'Multi-Tenant Architecture',
    desc: 'Full tenant isolation with projects, teams, groups, and granular RBAC permissions.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: Globe,
    title: '20+ Social Providers',
    desc: 'Google, GitHub, Apple, Facebook, Microsoft, Discord, Slack, and 15+ more OAuth providers.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Fingerprint,
    title: 'Passkeys & WebAuthn',
    desc: 'Next-generation passwordless auth with device biometrics and hardware security keys.',
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: Zap,
    title: 'Magic Links & OTP',
    desc: 'Frictionless authentication via email magic links and one-time passwords via SMS.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Code2,
    title: 'Developer-First API',
    desc: 'REST API, webhooks, SDKs, and React components you can drop into any application.',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: Shield,
    title: 'JIT Privileged Access',
    desc: 'Just-in-time permissions with approval workflows for sensitive production access.',
    color: 'from-red-500 to-orange-600',
  },
]

const PROVIDERS = [
  { name: 'Google', color: '#EA4335' },
  { name: 'GitHub', color: '#ffffff' },
  { name: 'Apple', color: '#ffffff' },
  { name: 'Facebook', color: '#1877F2' },
  { name: 'Microsoft', color: '#00A4EF' },
  { name: 'Twitter/X', color: '#ffffff' },
  { name: 'LinkedIn', color: '#0A66C2' },
  { name: 'Discord', color: '#5865F2' },
  { name: 'Slack', color: '#4A154B' },
  { name: 'Spotify', color: '#1DB954' },
]

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    desc: 'Perfect for side projects and small teams',
    features: ['10 users', '1 tenant', 'Email/password auth', '3 social providers', 'Basic audit logs'],
    cta: 'Start for free',
    popular: false,
  },
  {
    name: 'Starter',
    price: '$25',
    period: '/month',
    desc: 'For growing startups needing more',
    features: ['100 users', '5 tenants', 'All auth methods', 'All social providers', 'MFA & magic links', 'Advanced audit logs'],
    cta: 'Start free trial',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$99',
    period: '/month',
    desc: 'For scaling companies and teams',
    features: ['1,000 users', '25 tenants', 'Passkeys / WebAuthn', 'Custom domains', 'Webhooks & API keys', 'White-label branding', 'Priority support'],
    cta: 'Start free trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large organizations with custom needs',
    features: ['Unlimited users', 'Unlimited tenants', 'SAML SSO', 'Custom SLA', 'Dedicated infra', 'SOC2 compliance', '24/7 support'],
    cta: 'Contact sales',
    popular: false,
  },
]

const STATS = [
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '<100ms', label: 'Auth latency' },
  { value: '20+', label: 'OAuth providers' },
  { value: 'SOC2', label: 'Compliant' },
]

export default function HomePage() {
  return (
    <div style={{ background: '#030712', color: '#f0f6fc', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(3,7,18,0.9)', backdropFilter: 'blur(20px)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 800, color: 'white',
            }}>K</div>
            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em', background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Kaappu Identity
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {['Docs', 'Pricing', 'Blog'].map(item => (
              <a key={item} href="#" style={{
                padding: '8px 16px', color: '#8b949e', fontSize: 14, fontWeight: 500,
                borderRadius: 8, textDecoration: 'none', transition: 'all 0.15s ease',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f0f6fc')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8b949e')}
              >{item}</a>
            ))}
            <Link href="/sign-in" style={{
              padding: '8px 16px', color: '#8b949e', fontSize: 14, fontWeight: 500,
              borderRadius: 8, textDecoration: 'none',
            }}>Sign in</Link>
            <Link href="/sign-up" className="btn btn-primary" style={{ padding: '9px 20px', fontSize: 14 }}>
              Get started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 140, paddingBottom: 100, position: 'relative' }}>
        {/* Background orbs */}
        <div style={{
          position: 'absolute', top: '10%', left: '15%', width: 600, height: 600,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '20%', right: '10%', width: 400, height: 400,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
          filter: 'blur(80px)', pointerEvents: 'none',
        }} />
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '40px 40px', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', textAlign: 'center', position: 'relative' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 999, padding: '6px 14px', marginBottom: 32, fontSize: 13, fontWeight: 600, color: '#818cf8',
          }}>
            <Sparkles size={14} />
            Now with Passkeys & WebAuthn support
          </div>

          <h1 style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800,
            fontSize: 'clamp(42px, 8vw, 80px)', letterSpacing: '-0.04em',
            lineHeight: 1.05, marginBottom: 24, color: '#f0f6fc',
          }}>
            Unified Identity{' '}
            <span style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Infrastructure
            </span>
            <br />for Modern SaaS
          </h1>

          <p style={{ fontSize: 20, color: '#8b949e', maxWidth: 620, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Drop-in authentication, multi-tenant management, and enterprise-grade security.
            Launch faster. Scale confidently.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/sign-up" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white',
              padding: '16px 32px', borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: 'none',
              boxShadow: '0 0 30px rgba(99,102,241,0.4)',
            }}>
              Start building free <ArrowRight size={16} />
            </Link>
            <Link href="/dashboard" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.06)', color: '#f0f6fc',
              padding: '16px 32px', borderRadius: 12, fontWeight: 600, fontSize: 16, textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              View dashboard <ChevronRight size={16} />
            </Link>
          </div>

          <p style={{ marginTop: 20, fontSize: 13, color: '#484f58' }}>
            No credit card required · Free forever plan · Set up in 5 minutes
          </p>
        </div>

        {/* Stats */}
        <div style={{
          maxWidth: 900, margin: '80px auto 0', padding: '0 24px',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1,
          background: 'rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              padding: '28px 24px', textAlign: 'center',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <div style={{
                fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800,
                fontSize: 32, letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#8b949e', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800,
            fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-0.03em', marginBottom: 16,
          }}>
            Everything you need to{' '}
            <span style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              ship auth fast
            </span>
          </h2>
          <p style={{ color: '#8b949e', fontSize: 18, maxWidth: 560, margin: '0 auto' }}>
            A complete identity infrastructure so you can focus on building your product.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16, padding: 28, transition: 'all 0.2s ease',
              cursor: 'default',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 10, marginBottom: 16,
                background: `linear-gradient(135deg, ${f.color.split(' ')[1]}, ${f.color.split(' ')[3]})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(99,102,241,0.2)',
              }}>
                <f.icon size={20} color="white" />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, letterSpacing: '-0.01em' }}>{f.title}</h3>
              <p style={{ color: '#8b949e', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* OAuth Providers */}
      <section style={{ padding: '80px 24px', background: 'rgba(13,17,23,0.5)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 36, marginBottom: 12, letterSpacing: '-0.02em' }}>
            20+ OAuth Providers
          </h2>
          <p style={{ color: '#8b949e', marginBottom: 48, fontSize: 16 }}>Link, unlink, and merge social accounts with ease.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {PROVIDERS.map((p, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600,
                color: '#8b949e', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                {p.name}
              </div>
            ))}
            <div style={{
              background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600, color: '#818cf8',
            }}>
              + 10 more
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800,
            fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-0.03em', marginBottom: 12,
          }}>
            Simple, transparent pricing
          </h2>
          <p style={{ color: '#8b949e', fontSize: 18 }}>Start free. Scale as you grow.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, alignItems: 'start' }}>
          {PLANS.map((plan, i) => (
            <div key={i} style={{
              background: plan.popular ? 'rgba(99,102,241,0.05)' : 'rgba(13,17,23,0.8)',
              border: `1px solid ${plan.popular ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 20, padding: 28, position: 'relative',
              transform: plan.popular ? 'scale(1.03)' : 'none',
              transition: 'all 0.3s ease',
            }}>
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 999,
                  padding: '4px 14px', fontSize: 12, fontWeight: 700, color: 'white',
                  display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
                }}>
                  <Star size={10} /> Most Popular
                </div>
              )}
              <div style={{ fontSize: 14, fontWeight: 700, color: plan.popular ? '#818cf8' : '#8b949e', marginBottom: 8 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 40, letterSpacing: '-0.03em' }}>{plan.price}</span>
                <span style={{ color: '#8b949e', fontSize: 14 }}>{plan.period}</span>
              </div>
              <p style={{ color: '#8b949e', fontSize: 13, marginBottom: 24 }}>{plan.desc}</p>
              <Link href="/sign-up" style={{
                display: 'block', textAlign: 'center',
                background: plan.popular ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)',
                color: 'white', padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
                textDecoration: 'none', border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.12)',
                marginBottom: 24, boxShadow: plan.popular ? '0 0 20px rgba(99,102,241,0.3)' : 'none',
              }}>
                {plan.cta}
              </Link>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#8b949e' }}>
                    <CheckCircle size={14} color="#3fb950" style={{ flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center', position: 'relative' }}>
        <div style={{
          maxWidth: 700, margin: '0 auto',
          background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 24, padding: '60px 40px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%)',
          }} />
          <h2 style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800,
            fontSize: 40, letterSpacing: '-0.03em', marginBottom: 16, position: 'relative',
          }}>
            Ready to get started?
          </h2>
          <p style={{ color: '#8b949e', fontSize: 18, marginBottom: 32, position: 'relative' }}>
            Join thousands of developers building secure applications with Kaappu Identity.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', position: 'relative' }}>
            <Link href="/sign-up" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white',
              padding: '14px 28px', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none',
              boxShadow: '0 0 30px rgba(99,102,241,0.4)',
            }}>
              Start for free <ArrowRight size={16} />
            </Link>
            <Link href="/dashboard" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.06)', color: '#f0f6fc',
              padding: '14px 28px', borderRadius: 12, fontWeight: 600, fontSize: 15, textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              View dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '40px 24px', textAlign: 'center', color: '#484f58', fontSize: 14,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 6,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, color: 'white',
            }}>K</div>
            <span style={{ fontWeight: 600, color: '#8b949e' }}>Kaappu Identity</span>
          </div>
          <div>© 2026 Kaappu Identity. Built with ⚡ for modern SaaS.</div>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy', 'Terms', 'Security', 'Status'].map(l => (
              <a key={l} href="#" style={{ color: '#484f58', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
