'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Key, Plus, Copy, Eye, Trash2, Clock, CheckCircle, XCircle, AlertTriangle, Loader2, RefreshCw, X, Shield, ChevronRight, Hash } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ApiKey {
    id: string
    name: string
    keyPrefix: string
    scopes: string[]
    lastUsedAt: string | null
    expiresAt: string | null
    createdAt: string
}

const ALL_SCOPES = [
    'users:read', 'users:write', 'users:delete',
    'orgs:read', 'orgs:write', 'orgs:delete',
    'sessions:read', 'sessions:revoke',
    'audit-logs:read', 'webhooks:manage',
    'api-keys:manage',
]

export default function ApiKeysPage() {
    const { accessToken } = useAuth()
    const [keys, setKeys] = useState<ApiKey[]>([])
    const [loading, setLoading] = useState(true)
    const [pageLoading, setPageLoading] = useState(false)

    // Create key state
    const [showModal, setShowModal] = useState(false)
    const [newKeyForm, setNewKeyForm] = useState({ name: '', scopes: [] as string[], expiresAt: '' })
    const [creating, setCreating] = useState(false)
    const [createError, setCreateError] = useState<string | null>(null)
    const [createdKey, setCreatedKey] = useState<{ id: string, name: string, rawKey: string } | null>(null)
    const [copied, setCopied] = useState(false)

    const fetchKeys = useCallback(async () => {
        if (!accessToken) return
        setLoading(true)
        try {
            const res = await fetch('/api/api-keys', { headers: { Authorization: `Bearer ${accessToken}` } })
            const data = await res.json()
            if (data.success) {
                setKeys(data.data)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [accessToken])

    useEffect(() => { fetchKeys() }, [fetchKeys])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreating(true)
        setCreateError(null)
        try {
            const res = await fetch('/api/api-keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    ...newKeyForm,
                    expiresAt: newKeyForm.expiresAt || undefined
                })
            })
            const data = await res.json()
            if (data.success) {
                setCreatedKey(data.data)
                fetchKeys()
            } else {
                setCreateError(data.error)
            }
        } catch (err: any) {
            setCreateError(err.message)
        } finally {
            setCreating(false)
        }
    }

    const handleRevoke = async (id: string) => {
        if (!confirm('Are you sure you want to revoke this API key? Applications using it will stop working immediately.')) return
        setPageLoading(true)
        try {
            const res = await fetch(`/api/api-keys?id=${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            if (res.ok) fetchKeys()
        } catch (err) {
            console.error(err)
        } finally {
            setPageLoading(false)
        }
    }

    const handleCopy = () => {
        if (createdKey) {
            navigator.clipboard.writeText(createdKey.rawKey)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const toggleScope = (scope: string) => {
        setNewKeyForm(prev => ({
            ...prev,
            scopes: prev.scopes.includes(scope)
                ? prev.scopes.filter(s => s !== scope)
                : [...prev.scopes, scope]
        }))
    }

    const isExpired = (expiresAt: string | null) => expiresAt && new Date(expiresAt) < new Date()

    return (
        <div style={{ maxWidth: 1000, animation: 'fadeIn 0.4s ease' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Key size={24} color="#3fb950" />
                        API Keys
                    </h1>
                    <p style={{ color: '#8b949e', fontSize: 14 }}>Manage programmatic access to your account. Keys are hashed and shown only once at creation.</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={fetchKeys} className="btn btn-secondary" style={{ gap: 8 }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                    <button onClick={() => { setShowModal(true); setCreatedKey(null); setCreateError(null) }} className="btn btn-primary" style={{ gap: 8 }}>
                        <Plus size={14} /> Generate New Key
                    </button>
                </div>
            </div>

            {/* Keys List */}
            {loading ? (
                <div style={{ padding: 80, textAlign: 'center', color: '#484f58' }}>
                    <Loader2 size={24} className="animate-spin" style={{ marginBottom: 16 }} />
                    <p>Fetching API keys...</p>
                </div>
            ) : keys.length === 0 ? (
                <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 60, textAlign: 'center' }}>
                    <div style={{ width: 60, height: 60, borderRadius: 20, background: 'rgba(63, 185, 80, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <Key size={28} color="#3fb950" />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No active API keys</h3>
                    <p style={{ color: '#8b949e', fontSize: 14, maxWidth: 400, margin: '0 auto 24px' }}>Generate your first key to start integrating your applications with KIM platform.</p>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ gap: 8 }}>
                        <Plus size={14} /> Generate New Key
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {keys.map(key => (
                        <div key={key.id} style={{
                            background: '#0d1117',
                            border: `1px solid ${isExpired(key.expiresAt) ? 'rgba(248,81,73,0.3)' : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: 16, padding: '24px 28px',
                            transition: 'all 0.2s',
                            position: 'relative'
                        }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = isExpired(key.expiresAt) ? 'rgba(248,81,73,0.5)' : 'rgba(99,102,241,0.3)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = isExpired(key.expiresAt) ? 'rgba(248,81,73,0.3)' : 'rgba(255,255,255,0.06)'}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                        <h3 style={{ fontWeight: 700, fontSize: 16, margin: 0, color: '#f0f6fc' }}>{key.name}</h3>
                                        {isExpired(key.expiresAt) ? (
                                            <span className="badge badge-danger">Expired</span>
                                        ) : (
                                            <span className="badge badge-success">Active</span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <code style={{ fontSize: 13, color: '#8b949e', fontFamily: 'monospace', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: 6 }}>
                                            {key.keyPrefix}
                                        </code>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRevoke(key.id)}
                                    className="btn btn-ghost btn-icon"
                                    style={{ color: '#f85149', background: 'rgba(248,81,73,0.05)' }}
                                    title="Revoke Key"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                                {key.scopes.map(scope => (
                                    <span key={scope} style={{ fontSize: 11, background: 'rgba(99,102,241,0.08)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 6, padding: '3px 10px', fontWeight: 600 }}>
                                        {scope}
                                    </span>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: 24, fontSize: 12, color: '#484f58', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Clock size={12} />
                                    Created {formatDate(key.createdAt)}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Shield size={12} />
                                    {key.lastUsedAt ? `Last active ${formatDate(key.lastUsedAt)}` : 'Never used'}
                                </div>
                                {key.expiresAt && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: isExpired(key.expiresAt) ? '#f85149' : '#d29922' }}>
                                        <AlertTriangle size={12} />
                                        {isExpired(key.expiresAt) ? 'Expired' : 'Expires'} {formatDate(key.expiresAt)}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Key Modal */}
            {showModal && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content" style={{ maxWidth: createdKey ? 500 : 540, animation: 'modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        {!createdKey ? (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                    <div>
                                        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <Shield size={20} color="#3fb950" />
                                            Generate API Key
                                        </h2>
                                        <p style={{ color: '#8b949e', fontSize: 13, marginTop: 4 }}>Configure permissions for your new programmatic access key.</p>
                                    </div>
                                    <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon" style={{ width: 32, height: 32 }}>
                                        <X size={18} />
                                    </button>
                                </div>

                                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    {createError && (
                                        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', color: '#f85149', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <XCircle size={14} /> {createError}
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label className="label">Key Name</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="e.g. CI/CD Pipeline Key"
                                            required
                                            value={newKeyForm.name}
                                            onChange={e => setNewKeyForm({ ...newKeyForm, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="label">Permissions Scopes</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 180, overflowY: 'auto', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                                            {ALL_SCOPES.map(scope => (
                                                <div key={scope} onClick={() => toggleScope(scope)} style={{
                                                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                                                    background: newKeyForm.scopes.includes(scope) ? 'rgba(99,102,241,0.15)' : 'transparent',
                                                    borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                                                    border: `1px solid ${newKeyForm.scopes.includes(scope) ? 'rgba(99,102,241,0.3)' : 'transparent'}`
                                                }}>
                                                    <div style={{
                                                        width: 14, height: 14, borderRadius: 3, border: `1px solid ${newKeyForm.scopes.includes(scope) ? '#818cf8' : '#484f58'}`,
                                                        background: newKeyForm.scopes.includes(scope) ? '#6366f1' : 'transparent',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        {newKeyForm.scopes.includes(scope) && <CheckCircle size={10} color="white" />}
                                                    </div>
                                                    <span style={{ fontSize: 12, color: newKeyForm.scopes.includes(scope) ? '#c7d2fe' : '#8b949e' }}>{scope}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="label">Expiration (Optional)</label>
                                        <input
                                            type="datetime-local"
                                            className="input"
                                            value={newKeyForm.expiresAt}
                                            onChange={e => setNewKeyForm({ ...newKeyForm, expiresAt: e.target.value })}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                                        <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }} disabled={creating}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary" style={{ flex: 1, gap: 10, background: 'linear-gradient(135deg, #3fb950, #2ea043)' }} disabled={creating || !newKeyForm.name}>
                                            {creating ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
                                            Generate Key
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s ease' }}>
                                <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(63, 185, 80, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                    <CheckCircle size={32} color="#3fb950" />
                                </div>
                                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f0f6fc', marginBottom: 8 }}>API Key Generated</h2>
                                <p style={{ color: '#f85149', fontSize: 13, marginBottom: 28, fontWeight: 600 }}>
                                    ⚠️ Copy this key now! It will never be shown again for security.
                                </p>

                                <div style={{
                                    background: 'rgba(255,255,255,0.03)', border: '1px dotted rgba(255,255,255,0.15)',
                                    borderRadius: 12, padding: '20px', marginBottom: 24,
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
                                }}>
                                    <code style={{ flex: 1, fontSize: 13, color: '#f0f6fc', fontFamily: '"Fira Code", monospace', wordBreak: 'break-all', textAlign: 'left' }}>
                                        {createdKey.rawKey}
                                    </code>
                                    <button onClick={handleCopy} className="btn btn-secondary btn-sm" style={{ flexShrink: 0, gap: 8, height: 36 }}>
                                        {copied ? <CheckCircle size={14} color="#3fb950" /> : <Copy size={14} />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                </div>

                                <button onClick={() => { setShowModal(false); setCreatedKey(null); setNewKeyForm({ name: '', scopes: [], expiresAt: '' }) }}
                                    className="btn btn-primary" style={{ width: '100%', height: 44, fontSize: 15, fontWeight: 700 }}>
                                    I&apos;ve saved it securely
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
