'use client'

import { useState } from 'react'
import { Shield, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight, Zap, History, UserCheck, Lock } from 'lucide-react'

export default function PrivilegedAccessPage() {
    const [requests, setRequests] = useState([
        { id: '1', resource: 'Production Database', reason: 'Emergency fix for user auth bug', status: 'PENDING', duration: '2 hours', user: 'jane.doe@example.com', requestedAt: '10 mins ago' },
        { id: '2', resource: 'AWS Admin Console', reason: 'Audit of security groups', status: 'APPROVED', duration: '4 hours', user: 'john.smith@example.com', requestedAt: '1 hour ago' },
        { id: '3', resource: 'Production Kubernetes', reason: 'Scaling cluster', status: 'DENIED', duration: '1 hour', user: 'bob.wilson@example.com', requestedAt: 'Yesterday' },
    ])

    const [activeSessions, setActiveSessions] = useState([
        { id: 'a1', resource: 'Payment Gateway API', expiresAt: '45 mins remaining', user: 'alice.active@example.com' },
    ])

    return (
        <div style={{ maxWidth: 1000, animation: 'fadeIn 0.4s ease' }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Shield size={24} color="#6366f1" />
                    Privileged Access Management
                </h1>
                <p style={{ color: '#8b949e', fontSize: 14 }}>Just-in-time (JIT) access control with approval workflows.</p>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                <div className="stat-card">
                    <div style={{ color: '#818cf8', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={14} /> Pending Approvals
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>1</div>
                    <div style={{ fontSize: 11, color: '#484f58', marginTop: 4 }}>Requires your immediate attention</div>
                </div>
                <div className="stat-card">
                    <div style={{ color: '#3fb950', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Zap size={14} /> Active Sessions
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>{activeSessions.length}</div>
                    <div style={{ fontSize: 11, color: '#484f58', marginTop: 4 }}>Temporary privileges in use</div>
                </div>
                <div className="stat-card">
                    <div style={{ color: '#f85149', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <History size={14} /> Denied Requests
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>{requests.filter(r => r.status === 'DENIED').length}</div>
                    <div style={{ fontSize: 11, color: '#484f58', marginTop: 4 }}>Blocked in the last 30 days</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
                {/* Requests Table */}
                <div>
                    <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
                        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 15, margin: 0 }}>Incoming Requests</h2>
                        </div>
                        <div style={{ padding: 0 }}>
                            {requests.map((r, i) => (
                                <div key={r.id} style={{
                                    padding: '16px 24px',
                                    borderBottom: i < requests.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 12
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Lock size={14} color="#8b949e" />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 14, fontWeight: 600, color: '#f0f6fc', margin: 0 }}>{r.resource}</p>
                                                <p style={{ fontSize: 12, color: '#484f58', margin: 0 }}>Requested by {r.user} • {r.requestedAt}</p>
                                            </div>
                                        </div>
                                        <span className={`badge ${r.status === 'APPROVED' ? 'badge-success' : r.status === 'DENIED' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: 10 }}>
                                            {r.status}
                                        </span>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 8, fontSize: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
                                        <p style={{ color: '#8b949e', margin: 0 }}><strong style={{ color: '#f0f6fc' }}>Reason:</strong> {r.reason}</p>
                                    </div>
                                    {r.status === 'PENDING' && (
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                            <button className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
                                                <XCircle size={14} /> Deny
                                            </button>
                                            <button className="btn btn-primary btn-sm" style={{ gap: 4 }}>
                                                <CheckCircle size={14} /> Approve Access
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Active & Request New */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Active Sessions */}
                    <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
                        <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Zap size={14} color="#3fb950" /> Active Elevatations
                        </h3>
                        {activeSessions.map(s => (
                            <div key={s.id} style={{ background: 'rgba(63,185,80,0.05)', border: '1px solid rgba(63,185,80,0.1)', borderRadius: 10, padding: 12 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#3fb950', marginBottom: 4 }}>{s.resource}</div>
                                <div style={{ fontSize: 11, color: '#484f58', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Expires in</span>
                                    <span style={{ fontWeight: 600, color: '#8b949e' }}>{s.expiresAt}</span>
                                </div>
                                <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 8, fontSize: 11, color: '#f85149' }}>Revoke Early</button>
                            </div>
                        ))}
                    </div>

                    {/* Request CTA */}
                    <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 16, padding: 24, color: 'white' }}>
                        <UserCheck size={28} style={{ marginBottom: 12, opacity: 0.8 }} />
                        <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Need Access?</h3>
                        <p style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.5, marginBottom: 20 }}>
                            Request temporary elevated permissions for protected resources. Your manager will be notified.
                        </p>
                        <button className="btn btn-lg" style={{ width: '100%', background: 'white', color: '#6366f1', boxShadow: 'none' }}>
                            Request Access <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
