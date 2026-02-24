'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Users, Search, Filter, MoreVertical, Shield, Ban, Mail, Plus, Download, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react'
import { formatRelativeTime, getInitials } from '@/lib/utils'

interface ApiUser {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    emailVerified: boolean
    mfaEnabled: boolean
    banned: boolean
    lastSignInAt: string | null
    createdAt: string
    sessionCount: number
    orgCount: number
}

interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
}

export default function UsersPage() {
    const { accessToken } = useAuth()
    const [users, setUsers] = useState<ApiUser[]>([])
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 })
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [activeMenu, setActiveMenu] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 400)
        return () => clearTimeout(t)
    }, [search])

    const fetchUsers = useCallback(async () => {
        if (!accessToken) return
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), limit: '20' })
            if (debouncedSearch) params.set('search', debouncedSearch)
            const res = await fetch(`/api/users?${params}`, { headers: { Authorization: `Bearer ${accessToken}` } })
            const data = await res.json()
            if (data.success) {
                setUsers(data.data.users)
                setPagination(data.data.pagination)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [accessToken, page, debouncedSearch])

    useEffect(() => { fetchUsers() }, [fetchUsers])

    const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    const toggleAll = () => setSelectedIds(selectedIds.length === users.length ? [] : users.map(u => u.id))

    return (
        <div style={{ maxWidth: 1200, animation: 'fadeIn 0.4s ease' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Users size={24} color="#6366f1" />
                        Users
                    </h1>
                    <p style={{ color: '#8b949e', fontSize: 14 }}>
                        {loading ? 'Loading...' : `${pagination.total.toLocaleString()} total users in your tenant.`}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={fetchUsers} className="btn btn-secondary" style={{ gap: 8 }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                    <button className="btn btn-secondary" style={{ gap: 8 }}>
                        <Download size={14} /> Export
                    </button>
                    <button className="btn btn-primary" style={{ gap: 8 }}>
                        <Plus size={14} /> Invite user
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
                    <Search size={14} color="#484f58" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="input"
                        style={{ paddingLeft: 36, height: 38, fontSize: 13 }}
                    />
                </div>
                <button className="btn btn-secondary" style={{ gap: 8, fontSize: 13 }}>
                    <Filter size={13} /> Filter
                </button>
                {selectedIds.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 8 }}>
                        <span style={{ fontSize: 13, color: '#8b949e' }}>{selectedIds.length} selected</span>
                        <button className="btn btn-danger btn-sm">Ban selected</button>
                        <button className="btn btn-secondary btn-sm">Send email</button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ width: 48, padding: '12px 16px' }}>
                                <input type="checkbox" onChange={toggleAll} checked={selectedIds.length === users.length && users.length > 0} style={{ cursor: 'pointer' }} />
                            </th>
                            {['Name', 'Email', 'Status', 'MFA', 'Sessions', 'Last active', ''].map(h => (
                                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} style={{ padding: 48, textAlign: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#484f58' }}>
                                        <Loader2 size={16} className="animate-spin" /> Loading users...
                                    </div>
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ padding: 48, textAlign: 'center', color: '#484f58', fontSize: 14 }}>
                                    No users found.
                                </td>
                            </tr>
                        ) : users.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={{ padding: '14px 16px' }}>
                                    <input type="checkbox" checked={selectedIds.includes(user.id)} onChange={() => toggleSelect(user.id)} style={{ cursor: 'pointer' }} />
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div className="avatar" style={{ width: 34, height: 34, fontSize: 12, background: `hsl(${user.id.charCodeAt(0) * 15}, 60%, 40%)` }}>
                                            {getInitials(`${user.firstName ?? ''} ${user.lastName ?? ''}`).trim() || user.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: '#f0f6fc', margin: 0 }}>
                                                {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName ?? user.email.split('@')[0]}
                                            </p>
                                            <p style={{ fontSize: 11, color: '#484f58', margin: 0 }}>ID: {user.id.slice(0, 8)}...</p>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '14px 16px', fontSize: 13, color: '#8b949e', fontFamily: 'monospace' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {user.emailVerified ? <CheckCircle size={12} color="#3fb950" /> : <Clock size={12} color="#d29922" />}
                                        {user.email}
                                    </div>
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                    {user.banned ? (
                                        <span className="badge badge-danger">Banned</span>
                                    ) : user.emailVerified ? (
                                        <span className="badge badge-success">Active</span>
                                    ) : (
                                        <span className="badge badge-warning">Pending</span>
                                    )}
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                    {user.mfaEnabled
                                        ? <span className="badge badge-primary">Enabled</span>
                                        : <span className="badge badge-default">Off</span>
                                    }
                                </td>
                                <td style={{ padding: '14px 16px', fontSize: 13, color: '#8b949e' }}>
                                    {user.sessionCount} active
                                </td>
                                <td style={{ padding: '14px 16px', fontSize: 12, color: '#484f58' }}>
                                    {user.lastSignInAt ? formatRelativeTime(user.lastSignInAt) : 'Never'}
                                </td>
                                <td style={{ padding: '14px 16px', position: 'relative' }}>
                                    <button
                                        onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                                        className="btn btn-ghost btn-icon"
                                        style={{ width: 28, height: 28 }}
                                    >
                                        <MoreVertical size={14} />
                                    </button>
                                    {activeMenu === user.id && (
                                        <div className="dropdown-menu" style={{ position: 'absolute', right: 12, top: '100%', zIndex: 100 }}>
                                            <div className="dropdown-item" onClick={() => setActiveMenu(null)}><Users size={13} /> View profile</div>
                                            <div className="dropdown-item" onClick={() => setActiveMenu(null)}><Mail size={13} /> Send email</div>
                                            <div className="dropdown-item" onClick={() => setActiveMenu(null)}><Shield size={13} /> Reset password</div>
                                            <div className="dropdown-item dropdown-item-danger" onClick={() => setActiveMenu(null)}><Ban size={13} /> Ban user</div>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 12, color: '#484f58' }}>
                        {pagination.total > 0
                            ? `Showing ${(page - 1) * pagination.limit + 1}–${Math.min(page * pagination.limit, pagination.total)} of ${pagination.total}`
                            : 'No results'}
                    </span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn btn-ghost btn-icon" style={{ width: 28, height: 28 }}>
                            <ChevronLeft size={14} />
                        </button>
                        {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                            const p = Math.max(1, Math.min(pagination.totalPages - 4, page - 2)) + i
                            return (
                                <button key={p} onClick={() => setPage(p)} style={{
                                    width: 28, height: 28, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                    background: p === page ? 'rgba(99,102,241,0.2)' : 'transparent',
                                    color: p === page ? '#818cf8' : '#8b949e',
                                    border: p === page ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                                }}>{p}</button>
                            )
                        })}
                        <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page === pagination.totalPages} className="btn btn-ghost btn-icon" style={{ width: 28, height: 28 }}>
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
