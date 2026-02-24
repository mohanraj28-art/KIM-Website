'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { FileText, Search, CheckCircle, XCircle, AlertTriangle, Loader2, RefreshCw, Download } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface AuditLog {
    id: string
    action: string
    result: 'SUCCESS' | 'FAILURE' | 'WARNING'
    ipAddress: string | null
    createdAt: string
    user: { email: string | null; firstName: string | null; lastName: string | null }
}
interface Pagination { page: number; limit: number; total: number; totalPages: number }

const RESULT_CONFIG = {
    SUCCESS: { icon: CheckCircle, color: '#3fb950', bg: 'rgba(63,185,80,0.1)', badge: 'badge-success' },
    FAILURE: { icon: XCircle, color: '#f85149', bg: 'rgba(248,81,73,0.1)', badge: 'badge-danger' },
    WARNING: { icon: AlertTriangle, color: '#d29922', bg: 'rgba(210,153,34,0.1)', badge: 'badge-warning' },
}

export default function AuditLogsPage() {
    const { accessToken } = useAuth()
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 15, total: 0, totalPages: 1 })
    const [counts, setCounts] = useState({ SUCCESS: 0, FAILURE: 0, WARNING: 0 })
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [resultFilter, setResultFilter] = useState<'all' | 'SUCCESS' | 'FAILURE' | 'WARNING'>('all')
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 400)
        return () => clearTimeout(t)
    }, [search])

    useEffect(() => { setPage(1) }, [resultFilter])

    const fetchLogs = useCallback(async () => {
        if (!accessToken) return
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), limit: '15' })
            if (debouncedSearch) params.set('action', debouncedSearch)
            if (resultFilter !== 'all') params.set('result', resultFilter)
            const res = await fetch(`/api/audit-logs?${params}`, { headers: { Authorization: `Bearer ${accessToken}` } })
            const data = await res.json()
            if (data.success) { setLogs(data.data.logs); setPagination(data.data.pagination) }
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }, [accessToken, page, debouncedSearch, resultFilter])

    // Fetch summary counts
    useEffect(() => {
        if (!accessToken) return
        const h = { Authorization: `Bearer ${accessToken}` }
        Promise.all([
            fetch('/api/audit-logs?limit=1&result=SUCCESS', { headers: h }).then(r => r.json()),
            fetch('/api/audit-logs?limit=1&result=FAILURE', { headers: h }).then(r => r.json()),
            fetch('/api/audit-logs?limit=1&result=WARNING', { headers: h }).then(r => r.json()),
        ]).then(([s, f, w]) => setCounts({
            SUCCESS: s.data?.pagination?.total ?? 0,
            FAILURE: f.data?.pagination?.total ?? 0,
            WARNING: w.data?.pagination?.total ?? 0,
        })).catch(() => { })
    }, [accessToken])

    useEffect(() => { fetchLogs() }, [fetchLogs])

    return (
        <div style={{ maxWidth: 1200, animation: 'fadeIn 0.4s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FileText size={24} color="#58a6ff" /> Audit Logs
                    </h1>
                    <p style={{ color: '#8b949e', fontSize: 14 }}>
                        {loading ? 'Loading...' : `${pagination.total.toLocaleString()} total events.`}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={fetchLogs} className="btn btn-secondary" style={{ gap: 8 }}><RefreshCw size={14} /> Refresh</button>
                    <button className="btn btn-secondary" style={{ gap: 8 }}><Download size={14} /> Export CSV</button>
                </div>
            </div>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
                {(['SUCCESS', 'FAILURE', 'WARNING'] as const).map(result => {
                    const cfg = RESULT_CONFIG[result]
                    return (
                        <div key={result} onClick={() => setResultFilter(resultFilter === result ? 'all' : result)} style={{
                            background: resultFilter === result ? cfg.bg : '#0d1117',
                            border: `1px solid ${resultFilter === result ? cfg.color + '40' : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: 12, padding: '16px 20px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s',
                        }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <cfg.icon size={16} color={cfg.color} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 22, color: cfg.color }}>{counts[result].toLocaleString()}</div>
                                <div style={{ fontSize: 12, color: '#484f58', textTransform: 'capitalize' }}>{result.toLowerCase()} events</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Search */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
                    <Search size={14} color="#484f58" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Search by action..." value={search}
                        onChange={e => setSearch(e.target.value)} className="input"
                        style={{ paddingLeft: 36, height: 38, fontSize: 13 }} />
                </div>
                {resultFilter !== 'all' && (
                    <button onClick={() => setResultFilter('all')} className="btn btn-secondary" style={{ fontSize: 13 }}>✕ Clear filter</button>
                )}
            </div>

            {/* Table */}
            <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                            {['Action', 'User', 'IP Address', 'Result', 'Timestamp'].map(h => (
                                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: 48, textAlign: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#484f58' }}>
                                    <Loader2 size={16} className="animate-spin" /> Loading...
                                </div>
                            </td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: 48, textAlign: 'center', color: '#484f58', fontSize: 14 }}>No events found.</td></tr>
                        ) : logs.map(log => {
                            const cfg = RESULT_CONFIG[log.result] ?? RESULT_CONFIG.SUCCESS
                            return (
                                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '12px 20px' }}>
                                        <code style={{ fontSize: 12, color: '#818cf8', background: 'rgba(99,102,241,0.08)', padding: '2px 8px', borderRadius: 4 }}>{log.action}</code>
                                    </td>
                                    <td style={{ padding: '12px 20px', fontSize: 12, color: '#8b949e' }}>{log.user?.email ?? '—'}</td>
                                    <td style={{ padding: '12px 20px', fontSize: 12, color: '#484f58', fontFamily: 'monospace' }}>{log.ipAddress ?? '—'}</td>
                                    <td style={{ padding: '12px 20px' }}>
                                        <span className={`badge ${cfg.badge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                            <cfg.icon size={10} />{log.result}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 20px', fontSize: 12, color: '#484f58' }}>{formatDateTime(log.createdAt)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 12, color: '#484f58' }}>
                        {pagination.total > 0 ? `${(page - 1) * 15 + 1}–${Math.min(page * 15, pagination.total)} of ${pagination.total}` : 'No events'}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn btn-secondary btn-sm" style={{ fontSize: 12 }}>← Prev</button>
                        <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page >= pagination.totalPages} className="btn btn-secondary btn-sm" style={{ fontSize: 12 }}>Next →</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
