'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Eye,
    EyeOff,
    ArrowRight,
    Loader2,
    Mail,
    Lock,
    Github,
    Sparkles,
    Shield,
    Key
} from 'lucide-react'

// Brand Icons
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
    </svg>
)

const MicrosoftIcon = () => (
    <svg viewBox="0 0 23 23" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
        <path fill="#f3f3f3" d="M0 0h11v11H0zM12 0h11v11H12zM0 12h11v11H0zM12 12h11v11H12z" />
    </svg>
)

const AppleIcon = () => (
    <svg viewBox="0 0 384 512" className="w-5 h-5 fill-current">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
)

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
        <div className="auth-container" style={{ background: '#030712', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* Premium Background */}
            <div className="auth-bg" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 30%, rgba(99,102,241,0.12) 0%, transparent 60%), radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)', zIndex: 0 }} />
            <div className="auth-bg-grid" style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', zIndex: 1 }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="auth-card animate-fade-in"
                style={{ width: '100%', maxWidth: 420, background: 'rgba(13, 17, 23, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 40, position: 'relative', zIndex: 10, backdropFilter: 'blur(20px)', boxShadow: '0 25px 80px rgba(0,0,0,0.5)' }}
            >
                {/* Brand Identity */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 14, marginBottom: 16,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, fontWeight: 900, color: 'white',
                        boxShadow: '0 0 30px rgba(99,102,241,0.4)',
                    }}>K</div>
                    <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f6fc' }}>
                        Sign in to KIP
                    </h1>
                    <p style={{ color: '#8b949e', fontSize: 13, marginTop: 4 }}>
                        Welcome back! Please sign in to continue.
                    </p>
                </div>

                {/* OAuth Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
                    {[
                        { id: 'google', icon: <GoogleIcon /> },
                        { id: 'github', icon: <Github size={20} /> },
                        { id: 'microsoft', icon: <MicrosoftIcon /> },
                        { id: 'apple', icon: <AppleIcon /> }
                    ].map((p) => (
                        <button
                            key={p.id}
                            onClick={() => handleOAuth(p.id)}
                            className="oauth-btn"
                            style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                        >
                            {p.icon}
                        </button>
                    ))}
                </div>

                <div className="divider" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, color: '#484f58', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                    or use email
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 3, marginBottom: 24 }}>
                    {(['password', 'magic'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            style={{
                                flex: 1, padding: '8px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                background: tab === t ? 'rgba(99,102,241,0.2)' : 'transparent',
                                color: tab === t ? '#818cf8' : '#8b949e',
                                border: 'none',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            {t === 'password' ? '🔑 Password' : '✨ Magic Link'}
                        </button>
                    ))}
                </div>

                {magicSent ? (
                    <div style={{ background: 'rgba(63,185,80,0.05)', border: '1px solid rgba(63,185,80,0.1)', borderRadius: 16, padding: 32, textAlign: 'center' }}>
                        <div style={{ fontSize: 32, marginBottom: 16 }}>📧</div>
                        <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: '#f0f6fc' }}>Check your email</h3>
                        <p style={{ color: '#8b949e', fontSize: 14 }}>
                            We sent a secure link to <strong style={{ color: '#f0f6fc' }}>{email}</strong>.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f85149', textAlign: 'center', fontWeight: 600, marginBottom: 16 }}
                                >
                                    ⚠️ {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="form-group">
                            <label className="form-label" style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, marginLeft: 4 }}>Work Email</label>
                            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, height: 52, overflow: 'hidden' }}>
                                <div style={{ width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#484f58' }}>
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f0f6fc', fontSize: 15, paddingRight: 16 }}
                                    required
                                />
                            </div>
                        </div>

                        {tab === 'password' && (
                            <div className="form-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, marginLeft: 4 }}>
                                    <label className="form-label" style={{ fontSize: 11, fontWeight: 800, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Access Key</label>
                                    <Link href="/forgot-password" style={{ fontSize: 11, color: '#818cf8', textDecoration: 'none', fontWeight: 700 }}>
                                        Recover
                                    </Link>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, height: 52, overflow: 'hidden' }}>
                                    <div style={{ width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#484f58' }}>
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f0f6fc', fontSize: 15 }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ width: 48, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#484f58' }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', height: 56, marginTop: 16,
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white', border: 'none', borderRadius: 14,
                                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                                boxShadow: '0 10px 25px rgba(99,102,241,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <>{tab === 'password' ? 'Authenticate' : 'Send Link'} <ArrowRight size={18} /></>}
                        </button>
                    </form>
                )}

                <p style={{ textAlign: 'center', fontSize: 14, color: '#8b949e', marginTop: 32 }}>
                    New operator?{' '}
                    <Link href="/sign-up" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 700 }}>
                        Enroll Identity
                    </Link>
                </p>

                <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, opacity: 0.4 }}>
                        <Shield size={14} color="#8b949e" />
                        <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#8b949e' }}>Protocol Secure</span>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}