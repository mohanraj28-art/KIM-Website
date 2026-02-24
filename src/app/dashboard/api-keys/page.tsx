'use client'

import { useState } from 'react'
import { Key, Plus, Copy, Eye, EyeOff, Trash2, Clock, CheckCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const MOCK_KEYS = [
    {
        id: '1',
        name: 'Production API Key',
        keyPrefix: 'kip_prod_a1b2...',
        scopes: ['users:read', 'users:write', 'orgs:read'],
        lastUsedAt: new Date(Date.now() - 3600000).toISOString(),
        expiresAt: null,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
        id: '2',
        name: 'Development Key',
        keyPrefix: 'kip_dev_x9y8...',
        scopes: ['users:read', 'sessions:read'],
        lastUsedAt: new Date(Date.now() - 86400000).toISOString(),
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    {
        id: '3',
        name: 'Analytics Integration',
        keyPrefix: 'kip_anl_m3n4...',
        scopes: ['audit-logs:read'],
        lastUsedAt: null,
        expiresAt: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    },
]

const ALL_SCOPES = [
    'users:read', 'users:write', 'users:delete',
    'orgs:read', 'orgs:write', 'orgs:delete',
    'sessions:read', 'sessions:revoke',
    'audit-logs:read', 'webhooks:manage',
    'api-keys:manage',
]

export default function ApiKeysPage() {
    const [showModal, setShowModal] = useState(false)
    const [newKeyName, setNewKeyName] = useState('')
    const [selectedScopes, setSelectedScopes] = useState<string[]>([])
    const [createdKey, setCreatedKey] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const handleCreate = () => {
        const fakeKey = `kip_live_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
        setCreatedKey(fakeKey)
    }

    const handleCopy = () => {
        if (createdKey) {
            navigator.clipboard.writeText(createdKey)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const toggleScope = (scope: string) => {
        setSelectedScopes(prev => prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope])
    }

    const isExpired = (expiresAt: string | null) => expiresAt && new Date(expiresAt) < new Date()

    return (
        <div style={{ maxWidth: 900, animation: 'fadeIn 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Key size={24} color="#3fb950" />
                        API Keys
                    </h1>
                    <p style={{ color: '#8b949e', fontSize: 14 }}>Programmatic access to your KIP tenant. Keys store hashed — shown once only.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ gap: 8 }}>
                    <Plus size={14} /> Generate key
                </button>
            </div>

            {/* Keys List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {MOCK_KEYS.map(key => (
                    <div key={key.id} style={{
                        background: '#0d1117', border: `1px solid ${isExpired(key.expiresAt) ? 'rgba(248,81,73,0.2)' : 'rgba(255,255,255,0.06)'}`,
                        borderRadius: 14, padding: '20px 24px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <h3 style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>{key.name}</h3>
                                    {isExpired(key.expiresAt) && <span className="badge badge-danger">Expired</span>}
                                </div>
                                <code style={{ fontSize: 13, color: '#8b949e', fontFamily: 'monospace', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 4 }}>
                                    {key.keyPrefix}
                                </code>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn btn-ghost btn-sm" style={{ color: '#f85149', gap: 6 }}>
                                    <Trash2 size={13} /> Revoke
                                </button>
                            </div>
                        </div>

                        {/* Scopes */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                            {key.scopes.map(scope => (
                                <code key={scope} style={{ fontSize: 11, background: 'rgba(99,102,241,0.08)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 4, padding: '2px 8px' }}>
                                    {scope}
                                </code>
                            ))}
                        </div>

                        {/* Meta */}
                        <div style={{ display: 'flex', gap: 20, fontSize: 12, color: '#484f58' }}>
                            <span>Created {formatDate(key.createdAt)}</span>
                            {key.lastUsedAt && <span>Last used {formatDate(key.lastUsedAt)}</span>}
                            {key.expiresAt && (
                                <span style={{ color: isExpired(key.expiresAt) ? '#f85149' : '#484f58' }}>
                                    {isExpired(key.expiresAt) ? 'Expired' : 'Expires'} {formatDate(key.expiresAt)}
                                </span>
                            )}
                            {!key.expiresAt && <span style={{ color: '#3fb950' }}>Never expires</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Key Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => { if (!createdKey) setShowModal(false) }}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
                        {!createdKey ? (
                            <>
                                <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Generate API Key</h2>
                                <p style={{ color: '#8b949e', fontSize: 13, marginBottom: 24 }}>The key will only be shown once. Store it securely.</p>

                                <div className="form-group">
                                    <label className="form-label">Key name</label>
                                    <input type="text" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} placeholder="e.g. Production API" className="input" />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Scopes</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                                        {ALL_SCOPES.map(scope => (
                                            <div key={scope} onClick={() => toggleScope(scope)} style={{
                                                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                                                background: selectedScopes.includes(scope) ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                                                border: `1px solid ${selectedScopes.includes(scope) ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                                borderRadius: 8, cursor: 'pointer', fontSize: 12,
                                                color: selectedScopes.includes(scope) ? '#818cf8' : '#8b949e',
                                            }}>
                                                <div style={{
                                                    width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                                                    background: selectedScopes.includes(scope) ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                                                    border: selectedScopes.includes(scope) ? 'none' : '1px solid rgba(255,255,255,0.2)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    {selectedScopes.includes(scope) && <CheckCircle size={10} color="white" />}
                                                </div>
                                                {scope}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
                                    <button onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                                    <button onClick={handleCreate} disabled={!newKeyName} className="btn btn-primary" style={{ gap: 8 }}>
                                        <Key size={14} /> Generate Key
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
                                    <div style={{ fontSize: 40, marginBottom: 12 }}>🔑</div>
                                    <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Your API Key</h2>
                                    <p style={{ color: '#f85149', fontSize: 13, marginBottom: 24 }}>
                                        ⚠️ Copy and save this key now. You won&apos;t be able to see it again.
                                    </p>
                                </div>

                                <div style={{
                                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: 10, padding: '14px 16px', marginBottom: 16,
                                    display: 'flex', alignItems: 'center', gap: 10,
                                }}>
                                    <code style={{ flex: 1, fontSize: 12, color: '#f0f6fc', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                        {createdKey}
                                    </code>
                                    <button onClick={handleCopy} className="btn btn-secondary btn-sm" style={{ flexShrink: 0, gap: 6 }}>
                                        {copied ? <><CheckCircle size={12} color="#3fb950" /> Copied!</> : <><Copy size={12} /> Copy</>}
                                    </button>
                                </div>

                                <button onClick={() => { setShowModal(false); setCreatedKey(null); setNewKeyName(''); setSelectedScopes([]) }}
                                    className="btn btn-primary" style={{ width: '100%' }}>
                                    Done
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
