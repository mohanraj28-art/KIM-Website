'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Building2, Search, Plus, MoreVertical, Users, Settings, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'

interface Org {
    id: string
    name: string
    slug: string
    logoUrl: string | null
    plan: string | null
    memberCount: number
    createdAt: string
}
interface Pagination { page: number; limit: number; total: number; totalPages: number }

export default function OrganizationsPage() {
    const { accessToken } = useAuth()
    const [orgs, setOrgs] = useState<Org[]>([])
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 })
    const [search, setSearch] = useState('')
    const [view, setView] = useState<'grid' | 'list'>('grid')
    const [activeMenu, setActiveMenu] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchOrgs = useCallback(async () => {
        if (!accessToken) return
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: '1', limit: '50' })
            const res = await fetch(`/api/organizations?${params}`, { headers: { Authorization: `Bearer ${accessToken}` } })
            const data = await res.json()
            if (data.success) { setOrgs(data.data.organizations); setPagination(data.data.pagination) }
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }, [accessToken])

    useEffect(() => { fetchOrgs() }, [fetchOrgs])

    const filtered = orgs.filter(o =>
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.slug.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div style={{ maxWidth: 1200, animation: 'fadeIn 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Building2 size={24} color="#8b5cf6" /> Organizations
                    </h1>
                    <p style={{ color: '#8b949e', fontSize: 14 }}>
                        {loading ? 'Loading...' : `${pagination.total.toLocaleString()} organizations in your tenant.`}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={fetchOrgs} className="btn btn-secondary" style={{ gap: 8 }}><RefreshCw size={14} /> Refresh</button>
                    <button className="btn btn-primary" style={{ gap: 8 }}><Plus size={14} /> Create organization</button>
                </div>
            </div>

            {/* Search + view toggle */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
                    <Search size={14} color="#484f58" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Search organizations..." value={search}
                        onChange={e => setSearch(e.target.value)} className="input"
                        style={{ paddingLeft: 36, height: 38, fontSize: 13 }} />
                </div>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 3 }}>
                    {(['grid', 'list'] as const).map(v => (
                        <button key={v} onClick={() => setView(v)} style={{
                            padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            background: view === v ? 'rgba(99,102,241,0.2)' : 'transparent',
                            color: view === v ? '#818cf8' : '#8b949e',
                            border: view === v ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                        }}>{v === 'grid' ? '⊞ Grid' : '≡ List'}</button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 10, color: '#484f58' }}>
                    <Loader2 size={18} className="animate-spin" /> Loading organizations...
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 80, color: '#484f58', fontSize: 14 }}>
                    {search ? 'No organizations match your search.' : 'No organizations yet.'}
                </div>
            ) : view === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {filtered.map(org => (
                        <div key={org.id} className="card card-hover" style={{ padding: 24, cursor: 'pointer', position: 'relative' }}>
                            <button
                                onClick={e => { e.stopPropagation(); setActiveMenu(activeMenu === org.id ? null : org.id) }}
                                style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#484f58', padding: 4 }}
                            >
                                <MoreVertical size={16} />
                            </button>
                            {activeMenu === org.id && (
                                <div className="dropdown-menu" style={{ position: 'absolute', right: 16, top: 44, zIndex: 100 }}>
                                    <div className="dropdown-item"><Settings size={13} /> Settings</div>
                                    <div className="dropdown-item"><Users size={13} /> Manage members</div>
                                    <div className="dropdown-item"><ExternalLink size={13} /> View org</div>
                                    <div className="dropdown-item dropdown-item-danger">Delete org</div>
                                </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <div className="avatar" style={{ width: 44, height: 44, borderRadius: 10, fontSize: 16, fontWeight: 800, background: `hsl(${org.id.charCodeAt(0) * 30}, 60%, 30%)` }}>
                                    {getInitials(org.name)}
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>{org.name}</h3>
                                    <p style={{ fontSize: 12, color: '#484f58', margin: 0 }}>/{org.slug}</p>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px' }}>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: '#f0f6fc' }}>{org.memberCount}</div>
                                    <div style={{ fontSize: 11, color: '#484f58' }}>Members</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px' }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#f0f6fc' }}>{org.plan ?? 'Free'}</div>
                                    <div style={{ fontSize: 11, color: '#484f58' }}>Plan</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <span className={`badge ${org.plan === 'Enterprise' ? 'badge-primary' : org.plan === 'Pro' ? 'badge-info' : 'badge-default'}`}>
                                    {org.plan ?? 'Free'}
                                </span>
                                <span style={{ fontSize: 11, color: '#484f58', marginLeft: 'auto' }}>Created {formatDate(org.createdAt)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                                {['Organization', 'Slug', 'Members', 'Plan', 'Created', ''].map(h => (
                                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(org => (
                                <tr key={org.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div className="avatar" style={{ width: 32, height: 32, borderRadius: 8, fontSize: 12, background: `hsl(${org.id.charCodeAt(0) * 30}, 60%, 30%)` }}>
                                                {getInitials(org.name)}
                                            </div>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: '#f0f6fc' }}>{org.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 20px', fontSize: 12, color: '#8b949e', fontFamily: 'monospace' }}>/{org.slug}</td>
                                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#f0f6fc', fontWeight: 600 }}>{org.memberCount}</td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <span className={`badge ${org.plan === 'Enterprise' ? 'badge-primary' : org.plan === 'Pro' ? 'badge-info' : 'badge-default'}`}>{org.plan ?? 'Free'}</span>
                                    </td>
                                    <td style={{ padding: '14px 20px', fontSize: 12, color: '#484f58' }}>{formatDate(org.createdAt)}</td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28 }}><MoreVertical size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
