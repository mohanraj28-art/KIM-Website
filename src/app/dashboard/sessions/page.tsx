'use client'

import { useState } from 'react'
import { Activity, Search, Monitor, Smartphone, Globe, LogOut, Shield, MapPin } from 'lucide-react'
import { formatDateTime, formatRelativeTime, parseUserAgent } from '@/lib/utils'

const MOCK_SESSIONS = Array.from({ length: 15 }, (_, i) => ({
    id: `session-${i + 1}`,
    userId: `user-${(i % 5) + 1}`,
    userEmail: [`john@acme.com`, `alice@startup.io`, `bob@corp.com`, `admin@example.com`, `dev@saas.io`][i % 5],
    userAgent: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15 Mobile Safari',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Firefox/121.0',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0',
    ][i % 5],
    ipAddress: [`192.168.${i}.${i * 3 + 1}`, `10.0.${i}.1`, `172.16.${i}.10`][i % 3],
    country: ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'IN'][i % 7],
    city: ['New York', 'London', 'Toronto', 'Sydney', 'Berlin', 'Paris', 'Mumbai'][i % 7],
    active: Math.random() > 0.2,
    lastActiveAt: new Date(Date.now() - Math.random() * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
}))

function DeviceIcon({ ua }: { ua: string }) {
    const { device } = parseUserAgent(ua)
    return device === 'Mobile' ? <Smartphone size={14} /> : <Monitor size={14} />
}

function FlagEmoji({ country }: { country: string }) {
    const flags: Record<string, string> = { US: '🇺🇸', UK: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺', DE: '🇩🇪', FR: '🇫🇷', IN: '🇮🇳' }
    return <span>{flags[country] || '🌐'}</span>
}

export default function SessionsPage() {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

    const filtered = MOCK_SESSIONS.filter(s => {
        const matchesSearch = s.userEmail.toLowerCase().includes(search.toLowerCase()) || s.ipAddress.includes(search)
        const matchesFilter = filter === 'all' || (filter === 'active' && s.active) || (filter === 'inactive' && !s.active)
        return matchesSearch && matchesFilter
    })

    const activeCount = MOCK_SESSIONS.filter(s => s.active).length

    return (
        <div style={{ maxWidth: 1200, animation: 'fadeIn 0.4s ease' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Activity size={24} color="#3fb950" />
                        Sessions
                    </h1>
                    <p style={{ color: '#8b949e', fontSize: 14 }}>
                        Monitor and manage active user sessions. <span style={{ color: '#3fb950', fontWeight: 600 }}>{activeCount} active</span> out of {MOCK_SESSIONS.length} total.
                    </p>
                </div>
                <button className="btn btn-danger" style={{ gap: 8 }}>
                    <LogOut size={14} /> Revoke all sessions
                </button>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
                {[
                    { label: 'Active Sessions', value: activeCount, color: '#3fb950', icon: Activity },
                    { label: 'Countries', value: 7, color: '#6366f1', icon: Globe },
                    { label: 'Mobile Devices', value: 4, color: '#8b5cf6', icon: Smartphone },
                    { label: 'Suspicious', value: 1, color: '#f85149', icon: Shield },
                ].map((s, i) => (
                    <div key={i} style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <s.icon size={16} color={s.color} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 20, color: '#f0f6fc' }}>{s.value}</div>
                            <div style={{ fontSize: 12, color: '#484f58' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
                    <Search size={14} color="#484f58" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Search sessions..." value={search} onChange={e => setSearch(e.target.value)} className="input" style={{ paddingLeft: 36, height: 38, fontSize: 13 }} />
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
                            {['User', 'Device / Browser', 'Location', 'IP Address', 'Last active', 'Status', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(session => {
                            const { browser, os } = parseUserAgent(session.userAgent)
                            return (
                                <tr key={session.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#8b949e', fontFamily: 'monospace' }}>{session.userEmail}</td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#f0f6fc' }}>
                                            <DeviceIcon ua={session.userAgent} />
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{browser}</div>
                                                <div style={{ fontSize: 11, color: '#484f58' }}>{os}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#8b949e' }}>
                                            <FlagEmoji country={session.country} />
                                            <div>
                                                <div>{session.city}</div>
                                                <div style={{ fontSize: 11, color: '#484f58' }}>{session.country}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 20px', fontSize: 12, color: '#484f58', fontFamily: 'monospace' }}>{session.ipAddress}</td>
                                    <td style={{ padding: '14px 20px', fontSize: 12, color: '#484f58' }}>{formatRelativeTime(session.lastActiveAt)}</td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div className={`status-dot ${session.active ? 'status-dot-online' : 'status-dot-offline'}`} />
                                            <span style={{ fontSize: 12, color: session.active ? '#3fb950' : '#484f58' }}>
                                                {session.active ? 'Active' : 'Expired'}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 20px' }}>
                                        {session.active && (
                                            <button className="btn btn-danger btn-sm" style={{ gap: 6 }}>
                                                <LogOut size={11} /> Revoke
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
