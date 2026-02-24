'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
    Users, Building2, Activity, Shield,
    ArrowUpRight, ArrowDownRight, CheckCircle, AlertTriangle, XCircle,
    Loader2
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

interface DashboardStats {
    totalUsers: number
    newUsersThisMonth: number
    userGrowth: number
    totalOrganizations: number
    newOrgsThisMonth: number
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

function ActivityIcon({ result }: { result: string }) {
    if (result === 'SUCCESS') return <CheckCircle size={14} color="#3fb950" />
    if (result === 'FAILURE') return <XCircle size={14} color="#f85149" />
    return <AlertTriangle size={14} color="#d29922" />
}

function SkeletonCard() {
    return (
        <div className="stat-card" style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
                <div style={{ width: 50, height: 16, borderRadius: 4, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
            </div>
            <div style={{ width: 80, height: 36, borderRadius: 6, background: 'rgba(255,255,255,0.05)', marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
            <div style={{ width: 100, height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s infinite' }} />
        </div>
    )
}

export default function DashboardPage() {
    const { user, accessToken } = useAuth()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [userList, setUserList] = useState<any[]>([])
    const [loadingStats, setLoadingStats] = useState(true)
    const [loadingLogs, setLoadingLogs] = useState(true)
    const [loadingUsers, setLoadingUsers] = useState(true)

    const greeting = () => {
        const h = new Date().getHours()
        if (h < 12) return 'Good morning'
        if (h < 17) return 'Good afternoon'
        return 'Good evening'
    }

    useEffect(() => {
        if (!accessToken) return

        const headers = { Authorization: `Bearer ${accessToken}` }

        const safeJson = async (r: Response) => {
            if (!r.ok) {
                const text = await r.text()
                throw new Error(text || `Status: ${r.status}`)
            }
            return r.json()
        }

        // Fetch stats
        fetch('/api/stats', { headers })
            .then(safeJson)
            .then(d => { if (d.success) setStats(d.data) })
            .catch(err => console.error('[Dashboard] Stats fetch error:', err))
            .finally(() => setLoadingStats(false))

        // Fetch recent audit logs (last 6)
        fetch('/api/audit-logs?limit=6&page=1', { headers })
            .then(safeJson)
            .then(d => { if (d.success) setLogs(d.data.logs) })
            .catch(err => console.error('[Dashboard] Logs fetch error:', err))
            .finally(() => setLoadingLogs(false))

        // Fetch recent users (last 5)
        fetch('/api/users?limit=5&page=1', { headers })
            .then(safeJson)
            .then(d => { if (d.success) setUserList(d.data.users) })
            .catch(err => console.error('[Dashboard] Users fetch error:', err))
            .finally(() => setLoadingUsers(false))
    }, [accessToken])

    const statCards = stats ? [
        {
            title: 'Total Users',
            value: stats.totalUsers.toLocaleString(),
            change: `${stats.userGrowth >= 0 ? '+' : ''}${stats.userGrowth}%`,
            trend: stats.userGrowth >= 0 ? 'up' : 'down',
            icon: Users,
            color: '#6366f1',
            bg: 'rgba(99,102,241,0.1)',
            sub: `${stats.newUsersThisMonth} new this month`,
        },
        {
            title: 'Organizations',
            value: stats.totalOrganizations.toLocaleString(),
            change: `+${stats.newOrgsThisMonth} new`,
            trend: 'up',
            icon: Building2,
            color: '#8b5cf6',
            bg: 'rgba(139,92,246,0.1)',
            sub: `${stats.newOrgsThisMonth} created this month`,
        },
        {
            title: 'Active Sessions',
            value: stats.activeSessions.toLocaleString(),
            change: 'Live',
            trend: 'up',
            icon: Activity,
            color: '#3fb950',
            bg: 'rgba(63,185,80,0.1)',
            sub: 'Currently active',
        },
        {
            title: 'Failed Logins (7d)',
            value: stats.auditLast7Days.failure.toLocaleString(),
            change: stats.auditLast7Days.failure > 0 ? 'Review' : 'Clean',
            trend: stats.auditLast7Days.failure > 0 ? 'up' : 'down',
            icon: Shield,
            color: '#f85149',
            bg: 'rgba(248,81,73,0.1)',
            sub: `${stats.auditLast7Days.warning} warnings`,
        },
    ] : []

    return (
        <div style={{ maxWidth: 1200, animation: 'fadeIn 0.4s ease' }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', marginBottom: 4 }}>
                    {greeting()}, {user?.firstName || 'Admin'} 👋
                </h1>
                <p style={{ color: '#8b949e', fontSize: 14 }}>
                    Here&apos;s what&apos;s happening with your identity platform today.
                </p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                {loadingStats
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                    : statCards.map((card, i) => (
                        <div key={i} className="stat-card" style={{ cursor: 'default' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10, background: card.bg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <card.icon size={18} color={card.color} />
                                </div>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600,
                                    color: card.trend === 'up' && card.title !== 'Failed Logins (7d)' ? '#3fb950'
                                        : card.title === 'Failed Logins (7d)' && card.trend === 'up' ? '#f85149'
                                            : '#3fb950',
                                }}>
                                    {card.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {card.change}
                                </div>
                            </div>
                            <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 32, letterSpacing: '-0.03em', color: '#f0f6fc', marginBottom: 4 }}>
                                {card.value}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#8b949e', marginBottom: 4 }}>{card.title}</div>
                            <div style={{ fontSize: 12, color: '#484f58' }}>{card.sub}</div>
                        </div>
                    ))
                }
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
                {/* Recent Activity */}
                <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 16, margin: 0 }}>Recent Activity</h2>
                        <a href="/dashboard/audit-logs" style={{ fontSize: 12, color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
                            View all →
                        </a>
                    </div>

                    {loadingLogs ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 10, color: '#484f58' }}>
                            <Loader2 size={16} className="animate-spin" /> Loading activity...
                        </div>
                    ) : logs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 48, color: '#484f58', fontSize: 14 }}>
                            No activity recorded yet.
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Action', 'User', 'IP', 'Time', 'Status'].map(h => (
                                        <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '12px 24px' }}>
                                            <code style={{ fontSize: 11, color: '#818cf8', background: 'rgba(99,102,241,0.08)', padding: '2px 7px', borderRadius: 4 }}>
                                                {log.action}
                                            </code>
                                        </td>
                                        <td style={{ padding: '12px 24px', fontSize: 12, color: '#8b949e', fontFamily: 'monospace' }}>
                                            {log.user?.email ?? '—'}
                                        </td>
                                        <td style={{ padding: '12px 24px', fontSize: 12, color: '#8b949e', fontFamily: 'monospace' }}>
                                            {log.ipAddress ?? '—'}
                                        </td>
                                        <td style={{ padding: '12px 24px', fontSize: 12, color: '#484f58' }}>
                                            {formatRelativeTime(log.createdAt)}
                                        </td>
                                        <td style={{ padding: '12px 24px' }}>
                                            <span className={`badge badge-${log.result === 'SUCCESS' ? 'success' : log.result === 'FAILURE' ? 'danger' : 'warning'}`}
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                <ActivityIcon result={log.result} />
                                                {log.result}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Latest Users */}
                <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 16, margin: 0 }}>Saved Users</h2>
                        <a href="/dashboard/users" style={{ fontSize: 12, color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
                            Manage all →
                        </a>
                    </div>

                    {loadingUsers ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 10, color: '#484f58' }}>
                            <Loader2 size={16} className="animate-spin" /> Loading users...
                        </div>
                    ) : userList.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 48, color: '#484f58', fontSize: 14 }}>
                            No users registered yet.
                        </div>
                    ) : (
                        <div style={{ padding: '0 24px 20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                                {userList.map(u => (
                                    <div key={u.id} style={{
                                        padding: 16,
                                        borderRadius: 12,
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.04)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12
                                    }}>
                                        <div style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 20,
                                            background: `hsl(${u.id?.charCodeAt(0) * 20 || 0}, 60%, 40%)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: '#fff'
                                        }}>
                                            {u.firstName?.[0] || u.email?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div style={{ overflow: 'hidden' }}>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f6fc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {u.firstName ? `${u.firstName} ${u.lastName ?? ''}` : u.email?.split('@')[0] || 'Unknown User'}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email ?? 'No email'}</div>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                {u.emailVerified && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(63,185,80,0.1)', color: '#3fb950', fontWeight: 700 }}>Verified</span>}
                                                {u.mfaEnabled && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(99,102,241,0.1)', color: '#818cf8', fontWeight: 700 }}>MFA</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginTop: 24 }}>
                {/* Security / MFA */}
                <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                    <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Security Overview</h3>
                    {loadingStats ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#484f58', fontSize: 13 }}>
                            <Loader2 size={14} className="animate-spin" /> Loading...
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                                    <span style={{ color: '#8b949e' }}>MFA Adoption</span>
                                    <span style={{ color: '#3fb950', fontWeight: 700 }}>{stats?.mfaAdoptionRate ?? 0}%</span>
                                </div>
                                <div className="progress">
                                    <div className="progress-bar" style={{ width: `${stats?.mfaAdoptionRate ?? 0}%`, background: 'linear-gradient(90deg, #3fb950, #2ea043)' }} />
                                </div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                                    <span style={{ color: '#8b949e' }}>Success Rate (7d)</span>
                                    <span style={{ color: '#6366f1', fontWeight: 700 }}>
                                        {stats && (stats.auditLast7Days.success + stats.auditLast7Days.failure) > 0
                                            ? Math.round(stats.auditLast7Days.success / (stats.auditLast7Days.success + stats.auditLast7Days.failure) * 100)
                                            : 100}%
                                    </span>
                                </div>
                                <div className="progress">
                                    <div className="progress-bar" style={{
                                        width: stats && (stats.auditLast7Days.success + stats.auditLast7Days.failure) > 0
                                            ? `${Math.round(stats.auditLast7Days.success / (stats.auditLast7Days.success + stats.auditLast7Days.failure) * 100)}%`
                                            : '100%'
                                    }} />
                                </div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                                    <span style={{ color: '#8b949e' }}>Failed Events (7d)</span>
                                    <span style={{ color: '#d29922', fontWeight: 700 }}>{stats?.auditLast7Days.failure ?? 0}</span>
                                </div>
                                <div className="progress">
                                    <div className="progress-bar" style={{
                                        width: stats && stats.auditLast7Days.success > 0
                                            ? `${Math.min(100, Math.round(stats.auditLast7Days.failure / stats.auditLast7Days.success * 100))}%`
                                            : '0%',
                                        background: 'linear-gradient(90deg, #d29922, #f0883e)'
                                    }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                    <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                            { label: 'Manage users', href: '/dashboard/users', icon: Users, color: '#6366f1' },
                            { label: 'View organizations', href: '/dashboard/organizations', icon: Building2, color: '#8b5cf6' },
                            { label: 'Active sessions', href: '/dashboard/sessions', icon: Activity, color: '#3fb950' },
                            { label: 'Audit logs', href: '/dashboard/audit-logs', icon: Shield, color: '#58a6ff' },
                        ].map((action, i) => (
                            <a key={i} href={action.href} style={{
                                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 8, textDecoration: 'none', fontSize: 13, color: '#f0f6fc', fontWeight: 500,
                                transition: 'all 0.15s ease',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = `${action.color}30` }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
                            >
                                <div style={{
                                    width: 28, height: 28, borderRadius: 6, background: `${action.color}15`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <action.icon size={14} color={action.color} />
                                </div>
                                {action.label}
                                <ArrowUpRight size={12} color="#484f58" style={{ marginLeft: 'auto' }} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
