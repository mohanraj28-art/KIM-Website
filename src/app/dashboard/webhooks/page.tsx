'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Webhook, Plus, CheckCircle, XCircle, MoreVertical, Globe, RefreshCw, X, AlertTriangle, Loader2, Link, Shield, Trash2, Edit2, Activity } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

interface WebhookData {
    id: string
    url: string
    events: string[]
    active: boolean
    description: string | null
    deliveries: { total: number; success: number; failed: number }
    lastDeliveryAt: string | null
    createdAt: string
}

const EVENTS = [
    'user.created', 'user.updated', 'user.deleted', 'user.signed_in',
    'org.created', 'org.member_added', 'org.member_removed',
    'session.created', 'session.revoked',
    'api_key.created', 'api_key.revoked',
]

export default function WebhooksPage() {
    const { accessToken } = useAuth()
    const [webhooks, setWebhooks] = useState<WebhookData[]>([])
    const [loading, setLoading] = useState(true)
    const [operationLoading, setOperationLoading] = useState<string | null>(null)

    // Modal state
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ url: '', events: [] as string[], description: '' })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchWebhooks = useCallback(async () => {
        if (!accessToken) return
        setLoading(true)
        try {
            const res = await fetch('/api/webhooks', { headers: { Authorization: `Bearer ${accessToken}` } })
            const data = await res.json()
            if (data.success) setWebhooks(data.data)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }, [accessToken])

    useEffect(() => { fetchWebhooks() }, [fetchWebhooks])

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)
        try {
            const res = await fetch('/api/webhooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify(form)
            })
            const data = await res.json()
            if (data.success) {
                setShowModal(false)
                setForm({ url: '', events: [], description: '' })
                fetchWebhooks()
            } else {
                setError(data.error)
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this webhook? You will stop receiving events at this URL.')) return
        setOperationLoading(id)
        try {
            const res = await fetch(`/api/webhooks?id=${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            if (res.ok) fetchWebhooks()
        } catch (err) { console.error(err) }
        finally { setOperationLoading(null) }
    }

    const toggleStatus = async (hook: WebhookData) => {
        setOperationLoading(hook.id)
        try {
            const res = await fetch(`/api/webhooks?id=${hook.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify({ active: !hook.active })
            })
            if (res.ok) fetchWebhooks()
        } catch (err) { console.error(err) }
        finally { setOperationLoading(null) }
    }

    const toggleEvent = (e: string) => setForm(prev => ({
        ...prev,
        events: prev.events.includes(e) ? prev.events.filter(x => x !== e) : [...prev.events, e]
    }))

    return (
        <div style={{ maxWidth: 1000, animation: 'fadeIn 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Webhook size={24} color="#8b5cf6" />
                        Webhooks
                    </h1>
                    <p style={{ color: '#8b949e', fontSize: 14 }}>Receive real-time HTTP POST notifications when events happen in your account.</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={fetchWebhooks} className="btn btn-secondary" style={{ gap: 8 }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                    <button onClick={() => { setShowModal(true); setError(null) }} className="btn btn-primary" style={{ gap: 8 }}>
                        <Plus size={14} /> Add Webhook
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: 80, textAlign: 'center', color: '#484f58' }}>
                    <Loader2 size={24} className="animate-spin" style={{ marginBottom: 16 }} />
                    <p>Fetching webhooks...</p>
                </div>
            ) : webhooks.length === 0 ? (
                <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 60, textAlign: 'center' }}>
                    <div style={{ width: 60, height: 60, borderRadius: 20, background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <Webhook size={28} color="#8b5cf6" />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No webhooks configured</h3>
                    <p style={{ color: '#8b949e', fontSize: 14, maxWidth: 400, margin: '0 auto 24px' }}>Configure your first webhook to start receiving real-time event data in your own applications.</p>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ gap: 8 }}>
                        <Plus size={14} /> Add Webhook
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {webhooks.map(hook => (
                        <div key={hook.id} style={{
                            background: '#0d1117',
                            border: `1px solid ${hook.active ? 'rgba(255,255,255,0.06)' : 'rgba(248,81,73,0.15)'}`,
                            borderRadius: 16, padding: '24px 28px',
                            transition: 'all 0.2s', position: 'relative'
                        }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = hook.active ? 'rgba(139,92,246,0.3)' : 'rgba(248,81,73,0.3)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = hook.active ? 'rgba(255,255,255,0.06)' : 'rgba(248,81,73,0.1)'}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                                        <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: 8, borderRadius: 10 }}>
                                            <Globe size={18} color="#8b5cf6" />
                                        </div>
                                        <h3 style={{ fontWeight: 700, fontSize: 16, margin: 0, color: '#f0f6fc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hook.url}</h3>
                                        <button
                                            onClick={() => toggleStatus(hook)}
                                            style={{
                                                border: 'none', background: 'none', cursor: 'pointer', padding: 0,
                                                display: 'flex', alignItems: 'center', gap: 6
                                            }}
                                            disabled={operationLoading === hook.id}
                                        >
                                            <div className={`status-dot ${hook.active ? 'status-dot-online' : 'status-dot-error'}`} />
                                            <span style={{ fontSize: 11, color: hook.active ? '#3fb950' : '#f85149', fontWeight: 600 }}>
                                                {hook.active ? 'Active' : 'Paused'}
                                            </span>
                                        </button>
                                    </div>
                                    <p style={{ fontSize: 13, color: '#484f58', margin: 0, marginLeft: 38 }}>
                                        {hook.lastDeliveryAt ? `Last active ${formatRelativeTime(hook.lastDeliveryAt)}` : 'No deliveries yet'}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={() => handleDelete(hook.id)} className="btn btn-ghost btn-icon" style={{ color: '#f85149', background: 'rgba(248,81,73,0.05)' }} title="Delete Webhook">
                                        {operationLoading === hook.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20, marginLeft: 38 }}>
                                {hook.events.map(ev => (
                                    <span key={ev} style={{ fontSize: 11, background: 'rgba(139,92,246,0.06)', color: '#b794f4', border: '1px solid rgba(139,92,246,0.12)', borderRadius: 6, padding: '3px 10px', fontWeight: 600 }}>
                                        {ev}
                                    </span>
                                ))}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginLeft: 38, borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: 16 }}>
                                {[
                                    { label: 'Total Requests', value: hook.deliveries.total, color: '#f0f6fc', icon: Activity },
                                    { label: 'Successful', value: hook.deliveries.success, color: '#3fb950', icon: CheckCircle },
                                    { label: 'Failed', value: hook.deliveries.failed, color: '#f85149', icon: XCircle },
                                ].map((s, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ color: s.color, opacity: 0.6 }}><s.icon size={14} /></div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</div>
                                            <div style={{ fontSize: 11, color: '#484f58' }}>{s.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Webhook Modal */}
            {showModal && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="modal-content" style={{ maxWidth: 540, animation: 'modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div>
                                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <Webhook size={20} color="#8b5cf6" />
                                    Add Webhook Endpoint
                                </h2>
                                <p style={{ color: '#8b949e', fontSize: 13, marginTop: 4 }}>Configure your endpoint to receive automated event payloads.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon" style={{ width: 32, height: 32 }}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {error && (
                                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', color: '#f85149', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <XCircle size={14} /> {error}
                                </div>
                            )}

                            <div className="form-group">
                                <label className="label">Endpoint URL</label>
                                <div style={{ position: 'relative' }}>
                                    <Globe size={14} color="#484f58" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="url"
                                        className="input"
                                        placeholder="https://yourapp.ia/webhooks/incoming"
                                        style={{ paddingLeft: 38 }}
                                        required
                                        value={form.url}
                                        onChange={e => setForm({ ...form, url: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label">Events to receive</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 200, overflowY: 'auto', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                                    {EVENTS.map(ev => (
                                        <div key={ev} onClick={() => toggleEvent(ev)} style={{
                                            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                                            background: form.events.includes(ev) ? 'rgba(139,92,246,0.12)' : 'transparent',
                                            borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                                            border: `1px solid ${form.events.includes(ev) ? 'rgba(139,92,246,0.3)' : 'transparent'}`
                                        }}>
                                            <div style={{
                                                width: 14, height: 14, borderRadius: 3, border: `1px solid ${form.events.includes(ev) ? '#a78bfa' : '#484f58'}`,
                                                background: form.events.includes(ev) ? '#8b5cf6' : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {form.events.includes(ev) && <CheckCircle size={10} color="white" />}
                                            </div>
                                            <span style={{ fontSize: 12, color: form.events.includes(ev) ? '#ddd6fe' : '#8b949e', fontFamily: 'monospace' }}>{ev}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label">Description (Optional)</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g. Primary production app webhook"
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }} disabled={submitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, gap: 10, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }} disabled={submitting || !form.url || form.events.length === 0}>
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Webhook size={16} />}
                                    Add Webhook
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
