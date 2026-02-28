'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Building2, Search, Plus, MoreVertical, Users, Settings, ExternalLink, Loader2, RefreshCw, X, Hash, Globe, Info, Briefcase, CheckCircle, XCircle } from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'

interface Tenant {
    id: string
    name: string
    slug: string
    logoUrl: string | null
    plan: string | null
    memberCount: number
    createdAt: string
}
interface Pagination { page: number; limit: number; total: number; totalPages: number }

export default function TenantsPage() {
    const { accessToken } = useAuth()
    const [tenants, setTenants] = useState<Tenant[]>([])
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 })
    const [search, setSearch] = useState('')
    const [view, setView] = useState<'grid' | 'list'>('grid')
    const [activeMenu, setActiveMenu] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // Create tenant state
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [createForm, setCreateForm] = useState({ name: '', slug: '', description: '', website: '', industry: '' })
    const [creating, setCreating] = useState(false)
    const [createError, setCreateError] = useState<string | null>(null)

    const fetchTenants = useCallback(async () => {
        if (!accessToken) return
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: '1', limit: '50' })
            const res = await fetch(`/api/tenants?${params}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            })

            if (!res.ok) {
                const text = await res.text()
                console.error(`API Error (${res.status}):`, text)
                setTenants([])
                return
            }

            const contentType = res.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
                const text = await res.text()
                console.error('Non-JSON response received:', text)
                setTenants([])
                return
            }

            const data = await res.json()
            if (data.success) {
                setTenants(data.data.tenants);
                setPagination(data.data.pagination)
            } else {
                console.error('API reported failure:', data.error)
            }
        } catch (err) {
            console.error('Fetch tenants failed:', err)
        } finally {
            setLoading(false)
        }
    }, [accessToken])

    useEffect(() => { fetchTenants() }, [fetchTenants])

    const handleCreateTenant = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreating(true)
        setCreateError(null)
        try {
            const res = await fetch('/api/tenants', {
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
                setCreateForm({ name: '', slug: '', description: '', website: '', industry: '' })
                fetchTenants()
            } else {
                setCreateError(data.error)
            }
        } catch (err: any) {
            setCreateError(err.message)
        } finally {
            setCreating(false)
        }
    }

    // Auto-generate slug from name
    useEffect(() => {
        if (!createForm.slug) {
            const slug = createForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            setCreateForm(prev => ({ ...prev, slug }))
        }
    }, [createForm.name])

    const filtered = tenants.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.slug.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div style={{ maxWidth: 1200, animation: 'fadeIn 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Building2 size={24} color="#8b5cf6" /> Tenants
                    </h1>
                    <p style={{ color: '#8b949e', fontSize: 14 }}>
                        {loading ? 'Loading...' : `${pagination.total.toLocaleString()} tenants in your account.`}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={fetchTenants} className="btn btn-secondary" style={{ gap: 8 }}><RefreshCw size={14} /> Refresh</button>
                    <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ gap: 8 }}><Plus size={14} /> Create tenant</button>
                </div>
            </div>

            {/* Search + view toggle */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
                    <Search size={14} color="#484f58" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Search tenants..." value={search}
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
                    <Loader2 size={18} className="animate-spin" /> Loading tenants...
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 80, color: '#484f58', fontSize: 14 }}>
                    {search ? 'No tenants match your search.' : 'No tenants yet.'}
                </div>
            ) : view === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {filtered.map(tenant => (
                        <div key={tenant.id} className="card card-hover" style={{ padding: 24, cursor: 'pointer', position: 'relative' }}>
                            <button
                                onClick={e => { e.stopPropagation(); setActiveMenu(activeMenu === tenant.id ? null : tenant.id) }}
                                style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#484f58', padding: 4 }}
                            >
                                <MoreVertical size={16} />
                            </button>
                            {activeMenu === tenant.id && (
                                <div className="dropdown-menu" style={{ position: 'absolute', right: 16, top: 44, zIndex: 100 }}>
                                    <div className="dropdown-item"><Settings size={13} /> Settings</div>
                                    <div className="dropdown-item"><Users size={13} /> Manage members</div>
                                    <div className="dropdown-item"><ExternalLink size={13} /> View tenant</div>
                                    <div className="dropdown-item dropdown-item-danger">Delete tenant</div>
                                </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <div className="avatar" style={{ width: 44, height: 44, borderRadius: 10, fontSize: 16, fontWeight: 800, background: `hsl(${tenant.id.charCodeAt(0) * 30}, 60%, 30%)` }}>
                                    {getInitials(tenant.name)}
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <h3 style={{ fontWeight: 700, fontSize: 15, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tenant.name}</h3>
                                    <p style={{ fontSize: 12, color: '#484f58', margin: 0 }}>/{tenant.slug}</p>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px' }}>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: '#f0f6fc' }}>{tenant.memberCount}</div>
                                    <div style={{ fontSize: 11, color: '#484f58' }}>Members</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px' }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#f0f6fc' }}>{tenant.plan ?? 'Free'}</div>
                                    <div style={{ fontSize: 11, color: '#484f58' }}>Plan</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <span className={`badge ${tenant.plan === 'Enterprise' ? 'badge-primary' : tenant.plan === 'Pro' ? 'badge-info' : 'badge-default'}`}>
                                    {tenant.plan ?? 'Free'}
                                </span>
                                <span style={{ fontSize: 11, color: '#484f58', marginLeft: 'auto' }}>Created {formatDate(tenant.createdAt)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                                {['Tenant', 'Slug', 'Members', 'Plan', 'Created', ''].map(h => (
                                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(tenant => (
                                <tr key={tenant.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div className="avatar" style={{ width: 32, height: 32, borderRadius: 8, fontSize: 12, background: `hsl(${tenant.id.charCodeAt(0) * 30}, 60%, 30%)` }}>
                                                {getInitials(tenant.name)}
                                            </div>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: '#f0f6fc' }}>{tenant.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 20px', fontSize: 12, color: '#8b949e', fontFamily: 'monospace' }}>/{tenant.slug}</td>
                                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#f0f6fc', fontWeight: 600 }}>{tenant.memberCount}</td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <span className={`badge ${tenant.plan === 'Enterprise' ? 'badge-primary' : tenant.plan === 'Pro' ? 'badge-info' : 'badge-default'}`}>{tenant.plan ?? 'Free'}</span>
                                    </td>
                                    <td style={{ padding: '14px 20px', fontSize: 12, color: '#484f58' }}>{formatDate(tenant.createdAt)}</td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28 }}><MoreVertical size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Tenant Modal */}
            {showCreateModal && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content" style={{ maxWidth: 500, animation: 'modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div>
                                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <Building2 size={20} color="#8b5cf6" />
                                    New Tenant Workspace
                                </h2>
                                <p style={{ color: '#8b949e', fontSize: 13, marginTop: 4 }}>Create a separate workspace for your project or team.</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="btn btn-ghost btn-icon" style={{ width: 32, height: 32 }}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTenant} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {createError && (
                                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', color: '#f85149', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <XCircle size={14} /> {createError}
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div className="form-group">
                                    <label className="label">Tenant Name</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Acme Corp"
                                        required
                                        value={createForm.name}
                                        onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">URL Slug</label>
                                    <div style={{ position: 'relative' }}>
                                        <Hash size={14} color="#484f58" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="acme-corp"
                                            style={{ paddingLeft: 34 }}
                                            required
                                            value={createForm.slug}
                                            onChange={e => setCreateForm({ ...createForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-') })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label">Industry (Optional)</label>
                                <div style={{ position: 'relative' }}>
                                    <Briefcase size={14} color="#484f58" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Technology, Finance, etc."
                                        style={{ paddingLeft: 38 }}
                                        value={createForm.industry}
                                        onChange={e => setCreateForm({ ...createForm, industry: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label">Website (Optional)</label>
                                <div style={{ position: 'relative' }}>
                                    <Globe size={14} color="#484f58" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="url"
                                        className="input"
                                        placeholder="https://acme.com"
                                        style={{ paddingLeft: 38 }}
                                        value={createForm.website}
                                        onChange={e => setCreateForm({ ...createForm, website: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label">Description</label>
                                <div style={{ position: 'relative' }}>
                                    <Info size={14} color="#484f58" style={{ position: 'absolute', left: 12, top: 12 }} />
                                    <textarea
                                        className="input"
                                        placeholder="Tell us about this workspace..."
                                        style={{ paddingLeft: 38, minHeight: 80, resize: 'vertical' }}
                                        value={createForm.description}
                                        onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary" style={{ flex: 1 }} disabled={creating}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, gap: 10, background: 'linear-gradient(135deg, #8b5cf6, #d946ef)' }} disabled={creating}>
                                    {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                    Create Tenant
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
