'use client'

import { useState } from 'react'
import { Webhook, Plus, CheckCircle, XCircle, MoreVertical, Globe, RefreshCw } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

const EVENTS = [
    'user.created', 'user.updated', 'user.deleted', 'user.signed_in',
    'org.created', 'org.member_added', 'org.member_removed',
    'session.created', 'session.revoked',
    'api_key.created', 'api_key.revoked',
]

const MOCK_WEBHOOKS = [
    {
        id: '1',
        url: 'https://api.myapp.io/webhooks/kip',
        events: ['user.created', 'user.deleted', 'org.member_added'],
        active: true,
        deliveries: { total: 1234, success: 1230, failed: 4 },
        lastDeliveryAt: new Date(Date.now() - 600000).toISOString(),
    },
    {
        id: '2',
        url: 'https://hooks.slack.com/services/xxx/yyy/zzz',
        events: ['user.signed_in', 'session.revoked'],
        active: false,
        deliveries: { total: 89, success: 80, failed: 9 },
        lastDeliveryAt: new Date(Date.now() - 86400000).toISOString(),
    },
]

export default function WebhooksPage() {
    const [showModal, setShowModal] = useState(false)
    const [url, setUrl] = useState('')
    const [selectedEvents, setSelectedEvents] = useState<string[]>([])
    const [testingId, setTestingId] = useState<string | null>(null)

    const toggleEvent = (e: string) => setSelectedEvents(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e])

    return (
        <div style={{ maxWidth: 860, animation: 'fadeIn 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Webhook size={24} color="#8b5cf6" />
                        Webhooks
                    </h1>
                    <p style={{ color: '#8b949e', fontSize: 14 }}>Receive real-time HTTP notifications when events happen.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ gap: 8 }}>
                    <Plus size={14} /> Add webhook
                </button>
            </div>

            {/* Webhook cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {MOCK_WEBHOOKS.map(hook => (
                    <div key={hook.id} style={{
                        background: '#0d1117', border: `1px solid ${hook.active ? 'rgba(255,255,255,0.06)' : 'rgba(248,81,73,0.15)'}`,
                        borderRadius: 16, padding: 24,
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                    <Globe size={14} color="#8b5cf6" />
                                    <code style={{ fontSize: 13, color: '#f0f6fc', fontFamily: 'monospace' }}>{hook.url}</code>
                                    <div className={`status-dot ${hook.active ? 'status-dot-online' : 'status-dot-error'}`} />
                                    <span style={{ fontSize: 11, color: hook.active ? '#3fb950' : '#f85149' }}>
                                        {hook.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p style={{ fontSize: 12, color: '#484f58', margin: 0 }}>
                                    Last delivery {formatRelativeTime(hook.lastDeliveryAt)}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    onClick={() => { setTestingId(hook.id); setTimeout(() => setTestingId(null), 2000) }}
                                    className="btn btn-secondary btn-sm" style={{ gap: 6 }}
                                >
                                    {testingId === hook.id ? <><RefreshCw size={11} className="animate-spin" /> Sending...</> : '⚡ Test'}
                                </button>
                                <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28 }}>
                                    <MoreVertical size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Events */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                            {hook.events.map(ev => (
                                <code key={ev} style={{ fontSize: 11, background: 'rgba(139,92,246,0.08)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 4, padding: '2px 8px' }}>
                                    {ev}
                                </code>
                            ))}
                        </div>

                        {/* Delivery stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                            {[
                                { label: 'Total', value: hook.deliveries.total, color: '#f0f6fc' },
                                { label: 'Successful', value: hook.deliveries.success, color: '#3fb950' },
                                { label: 'Failed', value: hook.deliveries.failed, color: '#f85149' },
                            ].map((s, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px' }}>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
                                    <div style={{ fontSize: 11, color: '#484f58' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Webhook Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: 520 }}>
                        <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Add Webhook</h2>
                        <p style={{ color: '#8b949e', fontSize: 13, marginBottom: 24 }}>We'll send a POST request with a JSON payload for selected events.</p>

                        <div className="form-group">
                            <label className="form-label">Endpoint URL</label>
                            <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://yourapp.com/webhooks/kip" className="input" />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ marginBottom: 10, display: 'block' }}>Events to receive</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto', padding: '2px 0' }}>
                                {EVENTS.map(ev => (
                                    <div key={ev} onClick={() => toggleEvent(ev)} style={{
                                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                                        background: selectedEvents.includes(ev) ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.02)',
                                        border: `1px solid ${selectedEvents.includes(ev) ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                        borderRadius: 8, cursor: 'pointer', fontSize: 13,
                                        color: selectedEvents.includes(ev) ? '#a78bfa' : '#8b949e',
                                    }}>
                                        <div style={{
                                            width: 16, height: 16, borderRadius: 4,
                                            background: selectedEvents.includes(ev) ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'transparent',
                                            border: selectedEvents.includes(ev) ? 'none' : '1px solid rgba(255,255,255,0.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                        }}>
                                            {selectedEvents.includes(ev) && <CheckCircle size={10} color="white" />}
                                        </div>
                                        <code>{ev}</code>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                            <button onClick={() => { setShowModal(false) }} disabled={!url || selectedEvents.length === 0} className="btn btn-primary" style={{ gap: 8 }}>
                                <Webhook size={14} /> Add webhook
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
