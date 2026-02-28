'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
    Users, Building2, Activity, Shield,
    ArrowUpRight, ArrowDownRight, CheckCircle, AlertTriangle, XCircle,
    Loader2, ExternalLink, Bell, MoreHorizontal, ChevronRight,
    Sparkles, TrendingUp, Zap, Lock, Globe, Eye, Clock
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface DashboardStats {
    totalUsers: number
    newUsersThisMonth: number
    userGrowth: number
    totalTenants: number
    newTenantsThisMonth: number
    activeSessions: number
    auditLast7Days: { success: number; failure: number; warning: number }
    mfaAdoptionRate: number
    mfaCount: number
}

interface AuditLog {
    id: string
    action: string
    user: { email: string; firstName: string | null; lastName: string | null }
    result: 'SUCCESS' | 'FAILURE' | 'WARNING'
    ipAddress: string | null
    createdAt: string
}

/* ─────────────── Status Badge ─────────────── */
function StatusBadge({ result }: { result: string }) {
    const map: Record<string, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
        SUCCESS: {
            bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400',
            icon: <CheckCircle size={10} strokeWidth={3} />
        },
        FAILURE: {
            bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400',
            icon: <XCircle size={10} strokeWidth={3} />
        },
        WARNING: {
            bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400',
            icon: <AlertTriangle size={10} strokeWidth={3} />
        },
    }
    const s = map[result] ?? map.WARNING
    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${s.bg} border ${s.border} ${s.text} text-[9px] font-black uppercase tracking-widest`}>
            {s.icon}
            {result}
        </div>
    )
}

/* ─────────────── Mini Sparkline Bar ─────────────── */
function SparkBars({ count = 7 }: { count?: number }) {
    const [bars] = useState(() =>
        Array.from({ length: count }, () => 20 + Math.random() * 80)
    )
    return (
        <div className="flex items-end gap-[3px] h-8">
            {bars.map((h, i) => (
                <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: 'easeOut' }}
                    className="w-[3px] rounded-full bg-current opacity-60"
                    style={{ minHeight: 4 }}
                />
            ))}
        </div>
    )
}

/* ─────────────── Stat Card ─────────────── */
function StatCard({ title, value, change, trend, icon: Icon, sub, gradient, loading, sparkColor }: any) {
    if (loading) {
        return (
            <div className="relative bg-[#0d1117] border border-white/5 rounded-3xl p-6 animate-pulse overflow-hidden">
                <div className="flex justify-between mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-white/5" />
                    <div className="w-14 h-4 rounded-lg bg-white/5" />
                </div>
                <div className="w-20 h-9 rounded-xl bg-white/5 mb-2" />
                <div className="w-28 h-3 rounded bg-white/5" />
            </div>
        )
    }

    const isPositive = trend === 'up'
    const isNeutral = change === 'Live' || change === 'Clean'

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.3 }}
            className="relative bg-[#0d1117] border border-white/[0.06] rounded-3xl p-6 overflow-hidden group cursor-default"
        >
            {/* Gradient glow */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl ${gradient}`} />

            <div className="relative flex justify-between items-start mb-5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-300 ${gradient}`}>
                    <Icon size={20} className="text-white/80" />
                </div>
                <div className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border
                    ${isNeutral
                        ? 'text-slate-400 border-white/5 bg-white/[0.03]'
                        : isPositive
                            ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                            : 'text-rose-400 border-rose-500/20 bg-rose-500/10'
                    }`}>
                    {!isNeutral && (isPositive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />)}
                    {change}
                </div>
            </div>

            <div className="relative flex items-end justify-between">
                <div>
                    <div className="text-3xl font-black text-white tracking-tighter mb-1">{value}</div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{title}</div>
                    <div className="text-[11px] font-medium text-slate-600 mt-0.5">{sub}</div>
                </div>
                <div className={`${sparkColor}`}>
                    <SparkBars />
                </div>
            </div>
        </motion.div>
    )
}

/* ─────────────── Quick Action Card ─────────────── */
function QuickAction({ icon: Icon, label, desc, href, color }: any) {
    return (
        <Link href={href} className="no-underline">
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-all cursor-pointer group"
            >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon size={18} className="text-white" />
                </div>
                <div className="min-w-0">
                    <div className="text-sm font-bold text-white truncate">{label}</div>
                    <div className="text-[11px] text-slate-500 truncate">{desc}</div>
                </div>
                <ChevronRight size={14} className="text-slate-600 ml-auto group-hover:text-slate-400 transition-colors shrink-0" />
            </motion.div>
        </Link>
    )
}

/* ─────────────── Main Page ─────────────── */
export default function DashboardPage() {
    const { user, accessToken } = useAuth()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [userList, setUserList] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const greeting = () => {
        const h = new Date().getHours()
        if (h < 12) return 'Good morning'
        if (h < 17) return 'Good afternoon'
        return 'Good evening'
    }

    useEffect(() => {
        if (!accessToken) return
        const headers = { Authorization: `Bearer ${accessToken}` }
        setIsLoading(true)
        Promise.all([
            fetch('/api/stats', { headers }).then(r => r.json()),
            fetch('/api/audit-logs?limit=8&page=1', { headers }).then(r => r.json()),
            fetch('/api/users?limit=6&page=1', { headers }).then(r => r.json())
        ]).then(([statsRes, logsRes, usersRes]) => {
            if (statsRes.success) setStats(statsRes.data)
            if (logsRes.success) setLogs(logsRes.data.logs)
            if (usersRes.success) setUserList(usersRes.data.users)
        }).catch(err => {
            console.error('[Dashboard] Fetch error:', err)
        }).finally(() => {
            setIsLoading(false)
        })
    }, [accessToken])

    const statData = useMemo(() => {
        if (!stats) return []
        return [
            {
                title: 'Total Users',
                value: stats.totalUsers.toLocaleString(),
                change: `${stats.userGrowth >= 0 ? '+' : ''}${stats.userGrowth}%`,
                trend: stats.userGrowth >= 0 ? 'up' : 'down',
                icon: Users,
                sub: `${stats.newUsersThisMonth} new this month`,
                gradient: 'bg-gradient-to-br from-violet-500/20 to-indigo-500/10',
                sparkColor: 'text-indigo-400',
            },
            {
                title: 'Organizations',
                value: stats.totalTenants.toLocaleString(),
                change: `+${stats.newTenantsThisMonth} new`,
                trend: 'up',
                icon: Building2,
                sub: `${stats.newTenantsThisMonth} this month`,
                gradient: 'bg-gradient-to-br from-sky-500/20 to-cyan-500/10',
                sparkColor: 'text-sky-400',
            },
            {
                title: 'Active Sessions',
                value: stats.activeSessions.toLocaleString(),
                change: 'Live',
                trend: 'up',
                icon: Activity,
                sub: 'Currently active',
                gradient: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10',
                sparkColor: 'text-emerald-400',
            },
            {
                title: 'Failed Logins (7d)',
                value: stats.auditLast7Days.failure.toLocaleString(),
                change: stats.auditLast7Days.failure > 0 ? 'Review' : 'Clean',
                trend: stats.auditLast7Days.failure > 0 ? 'down' : 'up',
                icon: Shield,
                sub: `${stats.auditLast7Days.warning} warnings`,
                gradient: 'bg-gradient-to-br from-rose-500/20 to-orange-500/10',
                sparkColor: 'text-rose-400',
            },
        ]
    }, [stats])

    const successRate = stats
        ? Math.round((stats.auditLast7Days.success / Math.max(1, stats.auditLast7Days.success + stats.auditLast7Days.failure + stats.auditLast7Days.warning)) * 100)
        : 0

    return (
        <div className="max-w-[1440px] mx-auto space-y-10 pb-20">

            {/* ── Hero Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-3xl overflow-hidden p-8 border border-white/[0.06]"
                style={{ background: 'linear-gradient(135deg, #0d1117 60%, #1a1040 100%)' }}
            >
                {/* Background glows */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-40 w-60 h-60 bg-indigo-600/10 rounded-full blur-[60px] pointer-events-none" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Live Platform</span>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-3">
                            {greeting()},{' '}
                            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                                {user?.firstName || 'Admin'}
                            </span>{' '}
                            <span className="text-3xl">👋</span>
                        </h1>
                        <p className="text-slate-400 text-base font-medium max-w-lg">
                            Your identity platform is operating normally. Here's a real-time snapshot of what's happening.
                        </p>
                    </div>

                    {/* Right — Security Score Ring */}
                    <div className="flex items-center gap-6 shrink-0">
                        <div className="relative w-28 h-28" style={{ flexShrink: 0 }}>
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
                                <motion.circle
                                    cx="50" cy="50" r="42"
                                    fill="none"
                                    stroke="url(#scoreGrad)"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 42}`}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - (stats?.mfaAdoptionRate ?? 0) / 100) }}
                                    transition={{ duration: 1.2, ease: 'easeOut' }}
                                />
                                <defs>
                                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#a78bfa" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-white">{stats?.mfaAdoptionRate ?? 0}%</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">MFA Rate</span>
                            </div>
                        </div>
                        <div className="hidden md:block space-y-3">
                            <div>
                                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-black mb-0.5">Auth Success</div>
                                <div className="text-xl font-black text-white">{successRate}%</div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-black mb-0.5">MFA Users</div>
                                <div className="text-xl font-black text-white">{stats?.mfaCount ?? 0}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => <StatCard key={i} loading={true} icon={Users} />)
                    : statData.map((stat, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                            <StatCard {...stat} />
                        </motion.div>
                    ))
                }
            </div>

            {/* ── Main Content Grid ── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* Activity Feed — 8 cols */}
                <div className="xl:col-span-8 bg-[#0d1117] border border-white/[0.06] rounded-3xl overflow-hidden">
                    <div className="px-7 py-5 border-b border-white/[0.05] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                <Activity size={15} className="text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-white">Recent Activity</h2>
                                <p className="text-[10px] text-slate-600 font-medium">Last 8 events</p>
                            </div>
                        </div>
                        <Link href="/dashboard/audit-logs" className="no-underline flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">
                            View all <ChevronRight size={12} />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 size={24} className="animate-spin text-indigo-500" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Loading activity...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-slate-600 font-bold text-sm">No activity recorded yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/[0.03]">
                            {logs.map((log, i) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="flex items-center gap-4 px-7 py-4 hover:bg-white/[0.015] transition-colors group"
                                >
                                    {/* Status dot */}
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${log.result === 'SUCCESS' ? 'bg-emerald-500' :
                                        log.result === 'FAILURE' ? 'bg-rose-500' : 'bg-amber-500'
                                        } shadow-[0_0_6px_currentColor] opacity-80`} />

                                    {/* Action */}
                                    <code className="text-[10px] font-black text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 shrink-0 max-w-[180px] truncate">
                                        {log.action}
                                    </code>

                                    {/* User */}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-semibold text-slate-300 truncate group-hover:text-white transition-colors">
                                            {log.user?.email || '—'}
                                        </div>
                                        <div className="text-[10px] text-slate-600 font-mono">{log.ipAddress || 'Unknown IP'}</div>
                                    </div>

                                    {/* Time */}
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600 shrink-0">
                                        <Clock size={10} />
                                        {formatRelativeTime(log.createdAt)}
                                    </div>

                                    {/* Badge */}
                                    <StatusBadge result={log.result} />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column — 4 cols */}
                <div className="xl:col-span-4 flex flex-col gap-5">

                    {/* Users Panel */}
                    <div className="bg-[#0d1117] border border-white/[0.06] rounded-3xl overflow-hidden flex-1">
                        <div className="px-6 py-5 border-b border-white/[0.05] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                    <Users size={15} className="text-violet-400" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-white">Users</h2>
                                    <p className="text-[10px] text-slate-600 font-medium">Recent registrations</p>
                                </div>
                            </div>
                            <Link href="/dashboard/users" className="no-underline text-[11px] font-black uppercase tracking-widest text-violet-400 hover:text-violet-300 transition-colors">
                                All →
                            </Link>
                        </div>

                        <div className="p-4 space-y-2">
                            {isLoading
                                ? Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.01] animate-pulse border border-white/[0.03]">
                                        <div className="w-9 h-9 rounded-full bg-white/5 shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="w-24 h-3 rounded bg-white/5" />
                                            <div className="w-32 h-2 rounded bg-white/5" />
                                        </div>
                                    </div>
                                ))
                                : userList.length === 0
                                    ? <p className="text-slate-600 font-bold text-xs text-center py-8">No users yet.</p>
                                    : userList.map((u, i) => (
                                        <motion.div
                                            key={u.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.015] hover:bg-white/[0.03] border border-white/[0.04] hover:border-violet-500/20 transition-all group cursor-default"
                                        >
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[13px] font-black text-white shrink-0 group-hover:scale-105 transition-transform shadow-lg shadow-violet-500/20">
                                                {u.firstName?.[0] || u.email?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[12px] font-black text-white truncate leading-tight">
                                                    {u.firstName ? `${u.firstName} ${u.lastName ?? ''}`.trim() : u.email?.split('@')[0] || 'Unknown'}
                                                </div>
                                                <div className="text-[10px] text-slate-500 truncate">{u.email}</div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                {u.emailVerified && (
                                                    <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                                                        ✓ Verified
                                                    </span>
                                                )}
                                                {u.mfaEnabled && (
                                                    <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                                                        MFA
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Bottom Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Security Health */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-8 relative rounded-3xl overflow-hidden border border-white/[0.06] p-8"
                    style={{ background: 'linear-gradient(135deg, #0d1117 0%, #0f1320 100%)' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.04] to-violet-500/[0.04] pointer-events-none" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />

                    <div className="relative flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <Sparkles size={22} className="text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white tracking-tight">Security Health</h3>
                            <p className="text-[11px] font-bold text-indigo-400/70 uppercase tracking-widest">
                                Global Identity Score
                            </p>
                        </div>
                    </div>

                    <div className="relative space-y-6">
                        {/* MFA Bar */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">MFA Adoption</span>
                                <span className="text-base font-black text-white">{stats?.mfaAdoptionRate ?? 0}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stats?.mfaAdoptionRate ?? 0}%` }}
                                    transition={{ duration: 1.2, ease: 'easeOut' }}
                                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                                />
                            </div>
                        </div>

                        {/* Auth success bar */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Auth Success Rate</span>
                                <span className="text-base font-black text-white">{successRate}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${successRate}%` }}
                                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                                />
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-4 gap-4 pt-2">
                            {[
                                { label: 'Total Events', val: (stats?.auditLast7Days.success ?? 0) + (stats?.auditLast7Days.failure ?? 0) + (stats?.auditLast7Days.warning ?? 0) },
                                { label: 'Successful', val: stats?.auditLast7Days.success ?? 0 },
                                { label: 'Failures', val: stats?.auditLast7Days.failure ?? 0 },
                                { label: 'Warnings', val: stats?.auditLast7Days.warning ?? 0 },
                            ].map(({ label, val }) => (
                                <div key={label} className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1">{label}</p>
                                    <p className="text-xl font-black text-white">{val}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-4 bg-[#0d1117] border border-white/[0.06] rounded-3xl p-6 flex flex-col gap-4"
                >
                    <div>
                        <h3 className="text-sm font-black text-white mb-0.5">Quick Actions</h3>
                        <p className="text-[11px] text-slate-600">Common management tasks</p>
                    </div>
                    <div className="space-y-2">
                        <QuickAction icon={Users} label="Manage Users" desc="View & edit all users" href="/dashboard/users" color="bg-violet-500/20" />
                        <QuickAction icon={Shield} label="Roles & Permissions" desc="Configure access control" href="/dashboard/roles" color="bg-indigo-500/20" />
                        <QuickAction icon={Activity} label="Active Sessions" desc="Monitor live sessions" href="/dashboard/sessions" color="bg-emerald-500/20" />
                        <QuickAction icon={Lock} label="Security Settings" desc="Harden your platform" href="/dashboard/security" color="bg-rose-500/20" />
                        <QuickAction icon={Zap} label="Webhooks" desc="Event integrations" href="/dashboard/webhooks" color="bg-amber-500/20" />
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
