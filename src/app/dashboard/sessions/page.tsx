'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Activity, Search, Monitor, Smartphone, Globe, LogOut, Shield, MapPin, Loader2, RefreshCw, XCircle, CheckCircle, Clock, Layout } from 'lucide-react'
import { formatDateTime, formatRelativeTime, parseUserAgent, getInitials } from '@/lib/utils'

interface Session {
    id: string
    userId: string
    user: { email: string; firstName: string | null; lastName: string | null; avatarUrl: string | null }
    ipAddress: string | null
    userAgent: string | null
    active: boolean
    lastActiveAt: string
    createdAt: string
    expiresAt: string
    country: string | null
    city: string | null
    isCurrent: boolean
}

interface Pagination { page: number; limit: number; total: number; totalPages: number }

function DeviceIcon({ ua }: { ua: string | null }) {
    if (!ua) return <Monitor size={14} />
    const { device } = parseUserAgent(ua)
    return device === 'Mobile' ? <Smartphone size={14} /> : <Monitor size={14} />
}

function FlagEmoji({ country }: { country: string | null }) {
    const flags: Record<string, string> = { US: '🇺🇸', UK: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺', DE: '🇩🇪', FR: '🇫🇷', IN: '🇮🇳' }
    return <span>{country && flags[country] ? flags[country] : '🌐'}</span>
}

export default function SessionsPage() {
    const { accessToken } = useAuth()
    const [sessions, setSessions] = useState<Session[]>([])
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 })
    const [loading, setLoading] = useState(true)
    const [revoking, setRevoking] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active')

    const fetchSessions = useCallback(async () => {
        if (!accessToken) return
        setLoading(true)
        try {
            const params = new URLSearchParams({
                all: 'true',
                active: filter === 'active' ? 'true' : filter === 'inactive' ? 'false' : 'all',
                page: String(pagination.page),
                limit: '20'
            })
            const res = await fetch(`/api/sessions?${params}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            const data = await res.json()
            if (data.success) {
                setSessions(data.data.sessions)
                setPagination(data.data.pagination)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [accessToken, filter, pagination.page])

    useEffect(() => { fetchSessions() }, [fetchSessions])

    const handleRevoke = async (id: string) => {
        if (!confirm('Are you sure you want to revoke this session? The user will be logged out immediately.')) return
        setRevoking(id)
        try {
            const res = await fetch(`/api/sessions?id=${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            if (res.ok) fetchSessions()
        } catch (err) {
            console.error(err)
        } finally {
            setRevoking(null)
        }
    }

    const handleRevokeAll = async () => {
        if (!confirm('Are you sure you want to revoke ALL other active sessions in the account?')) return
        setRevoking('all')
        try {
            const res = await fetch(`/api/sessions?all=true`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            if (res.ok) fetchSessions()
        } catch (err) {
            console.error(err)
        } finally {
            setRevoking(null)
        }
    }

    const activeSessions = sessions.filter(s => s.active)

    return (
        <div style={{ maxWidth: 1200, animation: 'fadeIn 0.4s ease' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Activity size={24} color="#3fb950" />
                        Active Sessions
                    </h1>
                    <p style={{ color: '#8b949e', fontSize: 14 }}>
                        Monitor and manage all active access sessions across your KIM account.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={fetchSessions} className="btn btn-secondary" style={{ gap: 8 }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                    <button onClick={handleRevokeAll} className="btn btn-danger" style={{ gap: 8 }} disabled={revoking === 'all'}>
                        {revoking === 'all' ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                        Revoke all others
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
                    <Search size={14} color="#484f58" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Search sessions by IP or user..." value={search} onChange={e => setSearch(e.target.value)} className="input" style={{ paddingLeft: 36, height: 38, fontSize: 13 }} />
                </div>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 3 }}>
                    {(['all', 'active', 'inactive'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)} style={{
                            padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                            background: filter === f ? 'rgba(99,102,241,0.2)' : 'transparent',
                            color: filter === f ? '#818cf8' : '#8b949e',
                            border: filter === f ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                        }}>{f}</button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                            {['User', 'Device / Browser', 'Location', 'IP Address', 'Last active', 'Status', ''].map(h => (
                                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ padding: 60, textAlign: 'center' }}>
                                <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 12px', color: '#484f58' }} />
                                <p style={{ color: '#484f58', fontSize: 13 }}>Loading sessions...</p>
                            </td></tr>
                        ) : sessions.length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: 60, textAlign: 'center', color: '#484f58', fontSize: 14 }}>No sessions found.</td></tr>
                        ) : sessions.map(session => {
                            const { browser, os } = parseUserAgent(session.userAgent || '')
                            const userName = session.user.firstName ? `${session.user.firstName} ${session.user.lastName || ''}` : session.user.email
                            return (
                                <tr key={session.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div className="avatar" style={{ width: 32, height: 32, borderRadius: 8, fontSize: 12, background: 'rgba(255,255,255,0.05)', color: '#8b949e' }}>
                                                {getInitials(userName)}
                                            </div>
                                            <div style={{ overflow: 'hidden', maxWidth: 180 }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f6fc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
                                                <div style={{ fontSize: 11, color: '#484f58', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#f0f6fc' }}>
                                            <div style={{ color: '#8b949e' }}><DeviceIcon ua={session.userAgent} /></div>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{browser}</div>
                                                <div style={{ fontSize: 11, color: '#484f58' }}>{os}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#8b949e' }}>
                                            <FlagEmoji country={session.country} />
                                            <div>
                                                <div style={{ color: '#f0f6fc', fontWeight: 500 }}>{session.city || 'Unknown'}</div>
                                                <div style={{ fontSize: 11, color: '#484f58' }}>{session.country || 'Unknown'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 20px', fontSize: 12, color: '#8b949e', fontFamily: 'monospace' }}>{session.ipAddress || '—'}</td>
                                    <td style={{ padding: '14px 20px', fontSize: 12, color: '#8b949e' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Clock size={12} />
                                            {formatRelativeTime(session.lastActiveAt)}
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div className={`status-dot ${session.active ? 'status-dot-online' : 'status-dot-offline'}`} />
                                            <span style={{ fontSize: 12, color: session.active ? '#3fb950' : '#484f58', fontWeight: 600 }}>
                                                {session.active ? (session.isCurrent ? 'Current' : 'Active') : 'Expired'}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                                        {!session.isCurrent && session.active && (
                                            <button
                                                onClick={() => handleRevoke(session.id)}
                                                className="btn btn-ghost btn-icon"
                                                style={{ color: '#f85149', background: 'rgba(248,81,73,0.05)' }}
                                                disabled={revoking === session.id}
                                                title="Revoke session"
                                            >
                                                {revoking === session.id ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                                            </button>
                                        )}
                                        {session.isCurrent && (
                                            <div style={{ color: '#3fb950' }} title="Current Session">
                                                <Shield size={16} />
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 12, color: '#484f58' }}>
                        Showing {sessions.length} sessions
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))} disabled={pagination.page === 1} className="btn btn-secondary btn-sm" style={{ fontSize: 12 }}>← Prev</button>
                        <button onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))} disabled={pagination.page >= pagination.totalPages} className="btn btn-secondary btn-sm" style={{ fontSize: 12 }}>Next →</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
