'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Users, Search, Filter, MoreVertical, Shield, Ban, Mail, Plus, Download, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Loader2, RefreshCw, X, UserPlus, Key, Phone } from 'lucide-react'
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
    tenantCount: number
    tenants: { id: string, name: string, role?: string }[]
    groups: { id: string, name: string }[]
}

interface Tenant { id: string; name: string }
interface Role { id: string; name: string; key: string }
interface Group { id: string; name: string }

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

    // Data for selectors
    const [availableTenants, setAvailableTenants] = useState<Tenant[]>([])
    const [availableRoles, setAvailableRoles] = useState<Role[]>([])
    const [availableGroups, setAvailableGroups] = useState<Group[]>([])

    // Create user state
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [createForm, setCreateForm] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        password: '',
        tenantId: '',
        roleId: '',
        groupIds: [] as string[]
    })
    const [creating, setCreating] = useState(false)
    const [createError, setCreateError] = useState<string | null>(null)

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

    const fetchSelectorsData = useCallback(async () => {
        if (!accessToken) return
        try {
            const [tRes, rRes, gRes] = await Promise.all([
                fetch('/api/tenants', { headers: { Authorization: `Bearer ${accessToken}` } }),
                fetch('/api/roles', { headers: { Authorization: `Bearer ${accessToken}` } }),
                fetch('/api/groups', { headers: { Authorization: `Bearer ${accessToken}` } })
            ])
            const [tData, rData, gData] = await Promise.all([tRes.json(), rRes.json(), gRes.json()])

            // Tenants API returns { tenants, pagination } in data
            if (tData.success && tData.data?.tenants) {
                setAvailableTenants(tData.data.tenants)
            } else {
                setAvailableTenants([])
            }

            // Roles and Groups return arrays directly in data
            if (rData.success && Array.isArray(rData.data)) {
                setAvailableRoles(rData.data)
            } else {
                setAvailableRoles([])
            }

            if (gData.success && Array.isArray(gData.data)) {
                setAvailableGroups(gData.data)
            } else {
                setAvailableGroups([])
            }
        } catch (err) {
            console.error('Failed to fetch selector data:', err)
            setAvailableTenants([])
            setAvailableRoles([])
            setAvailableGroups([])
        }
    }, [accessToken])

    useEffect(() => {
        fetchUsers()
        if (showCreateModal) fetchSelectorsData()
    }, [fetchUsers, fetchSelectorsData, showCreateModal])

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreating(true)
        setCreateError(null)
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify(createForm)
            })
            const data = await res.json()
            if (data.success) {
                setShowCreateModal(false)
                setCreateForm({ email: '', firstName: '', lastName: '', phone: '', password: '', tenantId: '', roleId: '', groupIds: [] })
                fetchUsers()
            } else {
                setCreateError(data.error)
            }
        } catch (err: unknown) {
            setCreateError(err instanceof Error ? err.message : 'An unexpected error occurred')
        } finally {
            setCreating(false)
        }
    }

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
                    <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ gap: 8 }}>
                        <Plus size={14} /> Create User
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
                            {['Name', 'Email', 'Tenants', 'Groups', 'Status', 'MFA', 'Sessions', ''].map(h => (
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
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                        {user.tenants.length > 0 ? (
                                            user.tenants.map(t => (
                                                <span key={t.id} className="badge badge-default" style={{ fontSize: 10, background: 'rgba(255,255,255,0.05)' }}>
                                                    {t.name} {t.role && <span style={{ opacity: 0.6 }}>({t.role})</span>}
                                                </span>
                                            ))
                                        ) : (
                                            <span style={{ color: '#484f58', fontSize: 11 }}>No tenants</span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                        {user.groups.length > 0 ? (
                                            user.groups.map(g => (
                                                <span key={g.id} className="badge badge-primary" style={{ fontSize: 10, background: 'rgba(99,102,241,0.1)', color: '#818cf8', borderColor: 'rgba(99,102,241,0.2)' }}>
                                                    {g.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span style={{ color: '#484f58', fontSize: 11 }}>No groups</span>
                                        )}
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

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content" style={{ maxWidth: 460, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh', animation: 'modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div>
                                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <UserPlus size={20} color="#6366f1" />
                                    Add New User
                                </h2>
                                <p style={{ color: '#8b949e', fontSize: 13, marginTop: 4 }}>Add a user to your tenant workspace.</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="btn btn-ghost btn-icon" style={{ width: 32, height: 32 }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
                            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {createError && (
                                    <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', color: '#f85149', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <XCircle size={14} /> {createError}
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div className="form-group">
                                        <label className="label">First Name</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Jane"
                                            required
                                            value={createForm.firstName}
                                            onChange={e => setCreateForm({ ...createForm, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Last Name</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Doe"
                                            required
                                            value={createForm.lastName}
                                            onChange={e => setCreateForm({ ...createForm, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="label">Email Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={14} color="#484f58" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                        <input
                                            type="email"
                                            className="input"
                                            placeholder="jane.doe@example.com"
                                            style={{ paddingLeft: 38 }}
                                            required
                                            value={createForm.email}
                                            onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="label">Phone Number (Optional)</label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone size={14} color="#484f58" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                        <input
                                            type="tel"
                                            className="input"
                                            placeholder="+1 (555) 000-0000"
                                            style={{ paddingLeft: 38 }}
                                            value={createForm.phone}
                                            onChange={e => setCreateForm({ ...createForm, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="label">Initial Password (Optional)</label>
                                    <div style={{ position: 'relative' }}>
                                        <Key size={14} color="#484f58" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                        <input
                                            type="password"
                                            className="input"
                                            placeholder="••••••••"
                                            style={{ paddingLeft: 38 }}
                                            value={createForm.password}
                                            onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div className="form-group">
                                        <label className="label">Primary Tenant</label>
                                        <select
                                            className="input"
                                            value={createForm.tenantId}
                                            onChange={e => setCreateForm({ ...createForm, tenantId: e.target.value })}
                                        >
                                            <option value="">Select a tenant...</option>
                                            {availableTenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Workspace Role</label>
                                        <select
                                            className="input"
                                            value={createForm.roleId}
                                            onChange={e => setCreateForm({ ...createForm, roleId: e.target.value })}
                                            disabled={!createForm.tenantId}
                                        >
                                            <option value="">Select a role...</option>
                                            {availableRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="label">Groups</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 120, overflowY: 'auto', padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
                                        {availableGroups.length > 0 ? availableGroups.map(g => (
                                            <label key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={createForm.groupIds.includes(g.id)}
                                                    onChange={e => {
                                                        const ids = e.target.checked
                                                            ? [...createForm.groupIds, g.id]
                                                            : createForm.groupIds.filter(id => id !== g.id)
                                                        setCreateForm({ ...createForm, groupIds: ids })
                                                    }}
                                                />
                                                {g.name}
                                            </label>
                                        )) : <span style={{ color: '#484f58', fontSize: 12 }}>No groups available.</span>}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary" style={{ flex: 1 }} disabled={creating}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1, gap: 10 }} disabled={creating}>
                                        {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                        Create User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
