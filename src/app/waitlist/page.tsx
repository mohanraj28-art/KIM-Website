'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, CheckCircle, Mail, Globe, Shield, Zap, Loader2 } from 'lucide-react'

export default function WaitlistPage() {
    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        // Simulate API call
        await new Promise(r => setTimeout(r, 1500))
        setSubmitted(true)
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-[#030712] text-white flex flex-col font-sans selection:bg-indigo-500/30">
            {/* Nav */}
            <nav className="h-20 flex items-center justify-between px-8 lg:px-20 border-b border-white/5 bg-slate-900/10 backdrop-blur-xl sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-3 no-underline group">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-black text-white shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                        K
                    </div>
                    <span className="font-black text-xl tracking-tight">Kaappu Identity</span>
                </Link>
                <div className="flex gap-4">
                    <Link href="/sign-in" className="px-5 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors no-underline">Log in</Link>
                    <Link href="/sign-up" className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all no-underline">Get Started</Link>
                </div>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

                <div className="max-w-3xl w-full text-center z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-black uppercase tracking-widest mb-8 animate-fade-in">
                        <Sparkles size={14} /> Early Access Program
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-black tracking-tighter mb-8 leading-[1.05] animate-fade-in shadow-indigo-500/20">
                        The future of <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Identity Management</span> is almost here.
                    </h1>

                    <p className="text-xl text-slate-400 font-medium mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        Join 5,000+ developers building secure, multi-tenant applications with Kaappu Identity.
                        Get early access to our JIT privileged roles and advanced audit infrastructure.
                    </p>

                    {submitted ? (
                        <div className="bg-[#0d1117] border border-emerald-500/20 rounded-[32px] p-12 animate-in zoom-in-95 duration-500 shadow-2xl shadow-emerald-500/5">
                            <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 flex items-center justify-center text-4xl mx-auto mb-8 shadow-xl shadow-emerald-500/10">
                                ✅
                            </div>
                            <h2 className="text-3xl font-black mb-4">You're on the list!</h2>
                            <p className="text-slate-400 font-bold mb-8">
                                We've reserved your spot. We'll send an invite to <span className="text-emerald-400">{email}</span> as soon as we're ready for you.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <button className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold flex items-center gap-2 transition-all">
                                    Share on Twitter
                                </button>
                                <button className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20">
                                    Join Discord Community
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-16 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <div className="flex-1 relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    placeholder="Enter your work email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#0d1117] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-600"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl shadow-indigo-500/30 group disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <span className="flex items-center gap-2">
                                        Join Waitlist <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <Feature icon={Globe} label="Multi-tenant" desc="Isolated environments" />
                        <Feature icon={Shield} label="JIT Access" desc="Privileged roles" />
                        <Feature icon={Zap} label="Edge Auth" desc="Sub-1ms latency" />
                        <Feature icon={CheckCircle} label="Compliant" desc="SOC2 / HIPAA ready" />
                    </div>
                </div>
            </main>

            <footer className="py-12 px-8 border-t border-white/5 text-center">
                <p className="text-slate-600 text-sm font-bold uppercase tracking-[0.2em]">
                    © 2026 Kaappu Identity. All rights reserved.
                </p>
            </footer>
        </div>
    )
}

function Feature({ icon: Icon, label, desc }: { icon: any, label: string, desc: string }) {
    return (
        <div className="flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/5 transition-all shadow-lg">
                <Icon size={20} />
            </div>
            <div>
                <p className="text-sm font-black text-white leading-none mb-1">{label}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{desc}</p>
            </div>
        </div>
    )
}
