'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, Scale, ScrollText, Globe } from 'lucide-react'

export default function LegalLayout({ children, title }: { children: React.ReactNode, title: string }) {
    return (
        <div className="min-h-screen bg-[#030712] text-slate-300 font-sans selection:bg-indigo-500/30">
            <nav className="h-20 flex items-center justify-between px-8 lg:px-20 border-b border-white/5 bg-slate-900/10 backdrop-blur-xl sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-3 no-underline group">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-black text-white shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                        K
                    </div>
                </Link>
                <Link href="/sign-up" className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-bold transition-all no-underline shadow-lg shadow-indigo-500/20">
                    Get Started
                </Link>
            </nav>

            <main className="max-w-4xl mx-auto py-20 px-8">
                <Link href="/sign-up" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-12 no-underline text-sm font-bold group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Sign Up
                </Link>

                <div className="mb-16">
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-4">{title}</h1>
                    <p className="text-slate-500 text-lg font-medium">Last updated: February 24, 2026</p>
                </div>

                <div className="prose prose-invert prose-indigo max-w-none">
                    {children}
                </div>
            </main>
        </div>
    )
}

export function Section({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) {
    return (
        <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-indigo-400">
                    <Icon size={20} />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
            </div>
            <div className="space-y-4 text-slate-400 leading-relaxed font-medium">
                {children}
            </div>
        </div>
    )
}
