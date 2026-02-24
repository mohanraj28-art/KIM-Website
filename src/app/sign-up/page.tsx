'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, ArrowRight, Loader2, Mail, Lock, User, CheckCircle } from 'lucide-react'

const OAUTH_PROVIDERS = [
    { name: 'Google', icon: '🔍', provider: 'google' },
    { name: 'GitHub', icon: '🐙', provider: 'github' },
    { name: 'Microsoft', icon: '🪟', provider: 'microsoft' },
    { name: 'Apple', icon: '🍎', provider: 'apple' },
]

function PasswordStrength({ password }: { password: string }) {
    const checks = [
        { label: '8+ characters', pass: password.length >= 8 },
        { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
        { label: 'Number', pass: /\d/.test(password) },
        { label: 'Special char', pass: /[^A-Za-z0-9]/.test(password) },
    ]
    const score = checks.filter(c => c.pass).length

    if (!password) return null

    const colors = ['#f85149', '#f85149', '#d29922', '#3fb950', '#3fb950']
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']

    return (
        <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 999,
                        background: i <= score ? colors[score] : 'rgba(255,255,255,0.08)',
                        transition: 'all 0.3s ease',
                    }} />
                ))}
                <span style={{ fontSize: 11, color: colors[score], fontWeight: 700, marginLeft: 8, whiteSpace: 'nowrap' }}>
                    {labels[score]}
                </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                {checks.map(c => (
                    <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                        <CheckCircle size={10} color={c.pass ? '#3fb950' : '#484f58'} />
                        <span style={{ color: c.pass ? '#8b949e' : '#484f58' }}>{c.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function SignUpPage() {
    const router = useRouter()
    const { signUp } = useAuth()

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [agreed, setAgreed] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!agreed) { setError('Please accept the terms of service'); return }
        setError('')
        setLoading(true)
        try {
            await signUp({ email, password, firstName, lastName })
            router.push('/dashboard')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleOAuth = (provider: string) => {
        window.location.href = `/api/auth/oauth/${provider}`
    }

    return (
        <div className="auth-container" style={{ background: '#030712' }}>
            <div className="auth-bg" />
            <div className="auth-bg-grid" />

            <div className="auth-card animate-fade-in" style={{ maxWidth: 440 }}>
                {/* Logo */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12, marginBottom: 12,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, fontWeight: 800, color: 'white',
                        boxShadow: '0 0 24px rgba(99,102,241,0.4)',
                    }}>K</div>
                    <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
                        Create your account
                    </h1>
                    <p style={{ color: '#8b949e', fontSize: 13, marginTop: 4 }}>
                        Get started with KIP Platform for free.
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

                <div className="divider">or continue with email</div>

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

                    {/* Name row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                            <label className="form-label">First name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={15} color="#484f58" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                    placeholder="John"
                                    className="input"
                                    style={{ paddingLeft: 40 }}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Last name</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                placeholder="Doe"
                                className="input"
                            />
                        </div>
                    </div>

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

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={15} color="#484f58" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Create a strong password"
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
                        <PasswordStrength password={password} />
                    </div>

                    {/* Terms */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 20, cursor: 'pointer' }} onClick={() => setAgreed(!agreed)}>
                        <div style={{
                            width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 2,
                            background: agreed ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                            border: agreed ? 'none' : '1px solid rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s',
                        }}>
                            {agreed && <CheckCircle size={12} color="white" />}
                        </div>
                        <p style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.5 }}>
                            I agree to the{' '}
                            <Link href="/terms" style={{ color: '#6366f1', textDecoration: 'none' }}>Terms of Service</Link>
                            {' '}and{' '}
                            <Link href="/privacy" style={{ color: '#6366f1', textDecoration: 'none' }}>Privacy Policy</Link>
                        </p>
                    </div>

                    <button type="submit" disabled={loading || !email || !password} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                        {loading ? (
                            <><Loader2 size={16} className="animate-spin" /> Creating account...</>
                        ) : (
                            <>Create account <ArrowRight size={16} /></>
                        )}
                    </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: 13, color: '#8b949e', marginTop: 24 }}>
                    Already have an account?{' '}
                    <Link href="/sign-in" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
