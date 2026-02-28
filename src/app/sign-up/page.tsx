'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Eye,
    EyeOff,
    ArrowRight,
    Loader2,
    Mail,
    Lock,
    User,
    CheckCircle,
    Shield
} from 'lucide-react'

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
        if (!agreed) {
            setError('Please acknowledge the security protocols.')
            return
        }
        setError('')
        setLoading(true)
        try {
            await signUp({ email, password, firstName, lastName })
            router.push('/dashboard')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Identity enrollment failed. Please retry.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container" style={{ background: '#030712', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* Premium Background */}
            <div className="auth-bg" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 30%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139,92,246,0.1) 0%, transparent 50%)', zIndex: 0 }} />
            <div className="auth-bg-grid" style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', zIndex: 1 }} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="auth-card animate-fade-in"
                style={{ width: '100%', maxWidth: 480, background: 'rgba(13, 17, 23, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 40, position: 'relative', zIndex: 10, backdropFilter: 'blur(20px)', boxShadow: '0 25px 80px rgba(0,0,0,0.5)' }}
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
                    <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f6fc' }}>
                        Create Identity
                    </h1>
                    <p style={{ color: '#8b949e', fontSize: 13, marginTop: 4, textAlign: 'center' }}>
                        Enroll in the Kaappu Identity Platform (KIP).
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#f85149', textAlign: 'center', fontWeight: 600 }}
                            >
                                ⚠️ {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="form-group">
                        <label className="form-label" style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, marginLeft: 4 }}>First Name</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, height: 52, overflow: 'hidden' }}>
                            <div style={{ width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#484f58' }}>
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="John"
                                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f0f6fc', fontSize: 15, paddingRight: 16 }}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, marginLeft: 4 }}>Last Name</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, height: 52, overflow: 'hidden' }}>
                            <div style={{ width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#484f58' }}>
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Doe"
                                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f0f6fc', fontSize: 15, paddingRight: 16 }}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, marginLeft: 4 }}>Work Email</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, height: 52, overflow: 'hidden' }}>
                            <div style={{ width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#484f58' }}>
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f0f6fc', fontSize: 15, paddingRight: 16 }}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, marginLeft: 4 }}>Access Key</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, height: 52, overflow: 'hidden' }}>
                            <div style={{ width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#484f58' }}>
                                <Lock size={18} />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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

                    <div style={{ paddingTop: 8 }}>
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginTop: 2 }}>
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={() => setAgreed(!agreed)}
                                    style={{ position: 'absolute', opacity: 0, cursor: 'pointer' }}
                                />
                                <div style={{ width: 22, height: 22, borderRadius: 6, border: '2px solid rgba(255,255,255,0.1)', background: agreed ? '#6366f1' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                                    {agreed && <CheckCircle size={14} color="white" />}
                                </div>
                            </div>
                            <span style={{ fontSize: 12, color: '#8b949e', fontWeight: 500, lineHeight: 1.5 }}>
                                I authorize the identity creation and agree to the <Link href="/terms" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 700 }}>Security Charter</Link>.
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !agreed}
                        style={{
                            width: '100%', height: 56, marginTop: 16,
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white', border: 'none', borderRadius: 14,
                            fontSize: 15, fontWeight: 700, cursor: agreed ? 'pointer' : 'not-allowed',
                            boxShadow: agreed ? '0 10px 25px rgba(99,102,241,0.3)' : 'none',
                            opacity: agreed ? 1 : 0.6,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <>Enroll Identity <ArrowRight size={18} /></>}
                    </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: 14, color: '#8b949e', marginTop: 32 }}>
                    Already an authorized user?{' '}
                    <Link href="/sign-in" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 700 }}>
                        Authenticate
                    </Link>
                </p>

                <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, opacity: 0.4 }}>
                        <Shield size={14} color="#8b949e" />
                        <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#8b949e' }}>Protocol Secured</span>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}