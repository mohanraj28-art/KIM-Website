'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, ArrowRight, Loader2, Mail, Lock, Github, Chrome } from 'lucide-react'

const OAUTH_PROVIDERS = [
    { name: 'Google', icon: '🔍', color: '#EA4335', provider: 'google' },
    { name: 'GitHub', icon: '🐙', color: '#fff', provider: 'github' },
    { name: 'Microsoft', icon: '🪟', color: '#00A4EF', provider: 'microsoft' },
    { name: 'Apple', icon: '🍎', color: '#fff', provider: 'apple' },
]

export default function SignInPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { signIn } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [tab, setTab] = useState<'password' | 'magic'>('password')
    const [magicSent, setMagicSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            if (tab === 'password') {
                await signIn(email, password)
                const redirect = searchParams.get('redirect') || '/dashboard'
                router.push(redirect)
            } else {
                // Magic link
                const res = await fetch('/api/auth/magic-link', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                })
                if (!res.ok) {
                    const d = await res.json()
                    throw new Error(d.error)
                }
                setMagicSent(true)
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleOAuth = (provider: string) => {
        const redirect = searchParams.get('redirect')
        window.location.href = `/api/auth/oauth/${provider}${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`
    }

    return (
        <div className="auth-container" style={{ background: '#030712' }}>
            <div className="auth-bg" />
            <div className="auth-bg-grid" />

            <div className="auth-card animate-fade-in" style={{ maxWidth: 420 }}>
                {/* Logo */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12, marginBottom: 12,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, fontWeight: 800, color: 'white',
                        boxShadow: '0 0 24px rgba(99,102,241,0.4)',
                    }}>K</div>
                    <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
                        Sign in to KIP
                    </h1>
                    <p style={{ color: '#8b949e', fontSize: 13, marginTop: 4 }}>
                        Welcome back! Please sign in to continue.
                    </p>
                </div>

                {/* OAuth Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                    {OAUTH_PROVIDERS.map((p) => (
                        <button
                            key={p.provider}
                            onClick={() => handleOAuth(p.provider)}
                            className="oauth-btn"
                            style={{ justifyContent: 'center' }}
                        >
                            <span style={{ fontSize: 16 }}>{p.icon}</span>
                            <span style={{ fontSize: 13 }}>{p.name}</span>
                        </button>
                    ))}
                </div>

                <div className="divider">or continue with</div>

                {/* Tabs */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 3, marginBottom: 20 }}>
                    {(['password', 'magic'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            style={{
                                flex: 1, padding: '8px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                background: tab === t ? 'rgba(99,102,241,0.2)' : 'transparent',
                                color: tab === t ? '#818cf8' : '#8b949e',
                                border: tab === t ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            {t === 'password' ? '🔑 Password' : '✨ Magic Link'}
                        </button>
                    ))}
                </div>

                {magicSent ? (
                    <div style={{
                        background: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.2)',
                        borderRadius: 12, padding: 24, textAlign: 'center',
                    }}>
                        <div style={{ fontSize: 32, marginBottom: 12 }}>📧</div>
                        <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Check your email</h3>
                        <p style={{ color: '#8b949e', fontSize: 14 }}>
                            We sent a magic link to <strong style={{ color: '#f0f6fc' }}>{email}</strong>.
                            Click it to sign in instantly.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)',
                                borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f85149',
                                marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Email address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={15} color="#484f58" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="input"
                                    style={{ paddingLeft: 40 }}
                                    required
                                />
                            </div>
                        </div>

                        {tab === 'password' && (
                            <div className="form-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <label className="form-label">Password</label>
                                    <Link href="/forgot-password" style={{ fontSize: 12, color: '#6366f1', textDecoration: 'none' }}>
                                        Forgot password?
                                    </Link>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={15} color="#484f58" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="input"
                                        style={{ paddingLeft: 40, paddingRight: 40 }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', cursor: 'pointer', color: '#484f58',
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }}>
                            {loading ? (
                                <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                            ) : (
                                <>{tab === 'password' ? 'Sign in' : 'Send magic link'} <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>
                )}

                <p style={{ textAlign: 'center', fontSize: 13, color: '#8b949e', marginTop: 24 }}>
                    Don&apos;t have an account?{' '}
                    <Link href="/sign-up" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    )
}
