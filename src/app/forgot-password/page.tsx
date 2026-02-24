'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowRight, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            // Always show success to prevent email enumeration
            setSent(true)
        } catch {
            setSent(true) // Still show success
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container" style={{ background: '#030712' }}>
            <div className="auth-bg" />
            <div className="auth-bg-grid" />

            <div className="auth-card animate-fade-in" style={{ maxWidth: 400 }}>
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
                        Forgot your password?
                    </h1>
                    <p style={{ color: '#8b949e', fontSize: 13, marginTop: 4, textAlign: 'center' }}>
                        Enter your email and we&apos;ll send you a reset link.
                    </p>
                </div>

                {sent ? (
                    <div style={{
                        background: 'rgba(63,185,80,0.06)', border: '1px solid rgba(63,185,80,0.2)',
                        borderRadius: 14, padding: 28, textAlign: 'center',
                    }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: '50%', background: 'rgba(63,185,80,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                        }}>
                            <CheckCircle size={28} color="#3fb950" />
                        </div>
                        <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Check your inbox</h3>
                        <p style={{ color: '#8b949e', fontSize: 13, lineHeight: 1.6 }}>
                            If an account exists for <strong style={{ color: '#f0f6fc' }}>{email}</strong>, you&apos;ll receive a password reset link within 5 minutes.
                        </p>
                        <button
                            onClick={() => { setSent(false); setEmail('') }}
                            className="btn btn-ghost btn-sm"
                            style={{ marginTop: 16 }}
                        >
                            Try again
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)',
                                borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f85149',
                                marginBottom: 16,
                            }}>
                                {error}
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

                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', marginTop: 4 }}
                        >
                            {loading ? (
                                <><Loader2 size={16} className="animate-spin" /> Sending...</>
                            ) : (
                                <>Send reset link <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>
                )}

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <Link href="/sign-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#8b949e', fontSize: 13, textDecoration: 'none' }}>
                        <ArrowLeft size={14} /> Back to sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}
