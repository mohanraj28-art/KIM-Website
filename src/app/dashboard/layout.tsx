'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    LayoutDashboard, Users, Building2, Shield, Activity,
    Settings, Key, Bell, LogOut, ChevronDown, Menu, X,
    BarChart3, FileText, Zap, Lock, Globe, CreditCard, Webhook,
    Search, Command, Sparkles, LayoutGrid
} from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { UserButton } from '@/components/UserButton'
import { TenantSwitcher } from '@/components/TenantSwitcher'

const NAV_ITEMS = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Overview', group: 'NAVIGATION' },
    { href: '/dashboard/users', icon: Users, label: 'Users', group: 'NAVIGATION' },
    { href: '/dashboard/tenants', icon: Building2, label: 'Organizations', group: 'NAVIGATION' },
    { href: '/dashboard/sessions', icon: Activity, label: 'Sessions', group: 'NAVIGATION' },
    { href: '/dashboard/audit-logs', icon: FileText, label: 'Audit Logs', group: 'NAVIGATION' },
    { href: '/dashboard/roles', icon: Shield, label: 'Roles & Permissions', group: 'NAVIGATION' },
    { href: '/dashboard/api-keys', icon: Key, label: 'API Keys', group: 'NAVIGATION' },
    { href: '/dashboard/webhooks', icon: Webhook, label: 'Webhooks', group: 'NAVIGATION' },
    { href: '/dashboard/billing', icon: CreditCard, label: 'Billing', group: 'NAVIGATION' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings', group: 'NAVIGATION' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoaded, isSignedIn, signOut } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/sign-in')
        }
    }, [isLoaded, isSignedIn, router])

    if (!isLoaded) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#030712]">
                <div className="text-center group">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-indigo-500/20 animate-pulse">
                        K
                    </div>
                    <p className="text-slate-400 font-bold text-sm tracking-widest uppercase animate-pulse">Initializing Kaappu...</p>
                </div>
            </div>
        )
    }

    if (!isSignedIn) return null

    const groups = ['NAVIGATION']

    return (
        <div className="flex h-screen bg-[#030712] text-slate-200 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className={`bg-[#0d1117] border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out z-50 ${sidebarOpen ? 'w-[280px]' : 'w-0 -ml-[280px] lg:ml-0 lg:w-20'}`}>
                {/* Logo & Header */}
                <div className="h-16 flex items-center px-6 border-b border-white/5 shrink-0 bg-slate-900/10">
                    <Link href="/dashboard" className="flex items-center gap-3 no-underline group">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-base font-black text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                            K
                        </div>
                        {sidebarOpen && (
                            <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                                KIP Platform
                            </span>
                        )}
                    </Link>
                </div>

                {/* Org Switcher Section */}
                {/* Tenant Switcher removed for visual parity with image */}

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-8 custom-scrollbar">
                    {groups.map(group => (
                        <div key={group}>
                            {sidebarOpen && (
                                <p className="text-[10px] font-extrabold text-slate-600 tracking-[0.2em] uppercase mb-3 px-2">
                                    {group}
                                </p>
                            )}
                            <div className="space-y-1">
                                {NAV_ITEMS.filter(item => item.group === group).map(({ href, icon: Icon, label }) => {
                                    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                                    return (
                                        <Link
                                            key={href}
                                            href={href}
                                            className={`
                                                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all no-underline group relative
                                                ${isActive
                                                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm shadow-indigo-500/5'
                                                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}
                                            `}
                                        >
                                            <Icon size={18} className={`${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-200'} transition-colors`} />
                                            {sidebarOpen && <span>{label}</span>}
                                            {isActive && sidebarOpen && (
                                                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                {sidebarOpen && (
                    <div className="p-4 bg-slate-900/20 border-t border-white/5 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                                    <Sparkles size={14} className="text-indigo-400" />
                                </div>
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Free Plan</span>
                            </div>
                            <button className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded transition-all">Upgrade</button>
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#030712] relative overflow-hidden">
                {/* Modern Backdrop Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />

                {/* Header */}
                <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-[#0d1117]/50 backdrop-blur-xl sticky top-0 z-[40]">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 -ml-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-900/50 border border-white/5 rounded-2xl w-80 group focus-within:border-indigo-500/50 transition-all">
                            <Search size={16} className="text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="bg-transparent border-none text-sm font-medium text-slate-300 placeholder-slate-500 focus:outline-none w-full"
                            />
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white/5 rounded-md border border-white/5">
                                <Command size={10} className="text-slate-500" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">K</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            target="_blank"
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl font-bold text-xs transition-all border border-indigo-500/20 no-underline"
                        >
                            <Globe size={14} />
                            <span>Visit site</span>
                        </Link>

                        <button className="relative p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                            <Bell size={20} />
                            <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-[#0d1117] group-hover:scale-110 transition-transform" />
                        </button>

                        <div className="h-6 w-px bg-white/5 mx-2" />

                        <UserButton />
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-8 relative scroll-smooth custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    )
}
