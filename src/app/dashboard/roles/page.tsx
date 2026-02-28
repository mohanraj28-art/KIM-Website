'use client'

import { useState, useMemo, useEffect } from 'react'
import {
    Shield, Plus, Check, X, Search, Info, Trash2, Edit,
    ChevronRight, Lock, Loader2, AlertCircle, Save, Users,
    Key, Eye, EyeOff, Fingerprint, RefreshCw, MoreVertical
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Role = {
    id: string
    name: string
    key: string
    description: string
    users: number
    permissions: string[]
    type: 'SYSTEM' | 'CUSTOM'
}

const PERMISSION_GROUPS: Record<string, string[]> = {
    'Users': ['users:read', 'users:write', 'users:delete'],
    'Tenants': ['tenants:read', 'tenants:write', 'tenants:delete'],
    'Roles': ['roles:read', 'roles:write'],
    'System': ['audit-logs:read', 'billing:read', 'billing:write', 'api-keys:manage'],
}

const ALL_PERMISSIONS = Object.values(PERMISSION_GROUPS).flat()

const ROLE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    'Super Admin': { bg: 'bg-rose-500/10', text: 'text-rose-400', dot: 'bg-rose-400' },
    'Admin': { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
    'Developer': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', dot: 'bg-cyan-400' },
    'default': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', dot: 'bg-indigo-400' },
}

function getRoleStyle(name: string) {
    return ROLE_COLORS[name] ?? ROLE_COLORS['default']
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
    const [showModal, setShowModal] = useState<{ type: 'create' | 'edit' | 'delete'; role?: Role } | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [formData, setFormData] = useState({ name: '', description: '', permissions: [] as string[] })

    const fetchRoles = async () => {
        try {
            setIsLoading(true)
            const res = await fetch('/api/roles')
            const data = await res.json()
            if (data.success) {
                setRoles(data.data)
                if (data.data.length > 0 && !selectedRoleId) setSelectedRoleId(data.data[0].id)
            } else {
                setError(data.error || 'Failed to fetch roles')
            }
        } catch { setError('Failed to connect to server') }
        finally { setIsLoading(false) }
    }

    useEffect(() => { fetchRoles() }, [])

    const filteredRoles = useMemo(() =>
        roles.filter(r =>
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.key.toLowerCase().includes(search.toLowerCase()) ||
            (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
        ), [roles, search])

    const selectedRole = useMemo(() =>
        roles.find(r => r.id === selectedRoleId) ?? (roles[0] ?? null),
        [roles, selectedRoleId])

    const handleAction = async () => {
        if (!showModal) return
        try {
            setIsSaving(true); setError(null)
            let res: Response | undefined
            if (showModal.type === 'create') res = await fetch('/api/roles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
            else if (showModal.type === 'edit') res = await fetch(`/api/roles/${showModal.role?.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
            else if (showModal.type === 'delete') res = await fetch(`/api/roles/${showModal.role?.id}`, { method: 'DELETE' })
            if (!res) throw new Error()
            const data = await res.json()
            if (data.success) {
                setStatusMessage({ type: 'success', text: `Role ${showModal.type === 'delete' ? 'deleted' : showModal.type === 'edit' ? 'updated' : 'created'} successfully` })
                setTimeout(() => setStatusMessage(null), 3500)
                await fetchRoles()
                setShowModal(null)
                setFormData({ name: '', description: '', permissions: [] })
            } else { setError(data.error || 'Action failed') }
        } catch { setError('Network error. Please try again.') }
        finally { setIsSaving(false) }
    }

    const openCreate = () => { setFormData({ name: '', description: '', permissions: [] }); setError(null); setShowModal({ type: 'create' }) }
    const openEdit = (role: Role) => { setFormData({ name: role.name, description: role.description || '', permissions: role.permissions }); setError(null); setShowModal({ type: 'edit', role }) }
    const openDelete = (role: Role) => { setError(null); setShowModal({ type: 'delete', role }) }
    const togglePerm = (perm: string) => setFormData(p => ({ ...p, permissions: p.permissions.includes(perm) ? p.permissions.filter(x => x !== perm) : [...p.permissions, perm] }))
    const toggleGroup = (perms: string[]) => {
        const allSelected = perms.every(p => formData.permissions.includes(p))
        setFormData(prev => ({
            ...prev,
            permissions: allSelected
                ? prev.permissions.filter(p => !perms.includes(p))
                : [...new Set([...prev.permissions, ...perms])]
        }))
    }

    return (
        <div className="max-w-[1400px] mx-auto pb-16 space-y-6">
            {/* Toast */}
            <AnimatePresence>
                {statusMessage && (
                    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                        className="fixed top-5 left-1/2 -translate-x-1/2 z-[300] w-full max-w-sm px-4"
                    >
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-xl
                            ${statusMessage.type === 'success'
                                ? 'bg-[#0d1117] border-emerald-500/30 text-emerald-400'
                                : 'bg-[#0d1117] border-rose-500/30 text-rose-400'}`}
                        >
                            {statusMessage.type === 'success' ? <Check size={15} strokeWidth={3} /> : <AlertCircle size={15} />}
                            <p className="text-xs font-semibold flex-1">{statusMessage.text}</p>
                            <button onClick={() => setStatusMessage(null)}><X size={14} className="opacity-50 hover:opacity-100 transition-opacity" /></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-2">
                        <Shield size={11} />
                        <span>Roles &amp; Permissions</span>
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Access Control</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Define roles and assign granular permissions to control access across your platform.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20 active:scale-95 mr-4"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Create Role
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Roles', value: roles.length, icon: Shield, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
                    { label: 'Custom Roles', value: roles.filter(r => r.type === 'CUSTOM').length, icon: Key, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
                    { label: 'Total Members', value: roles.reduce((sum, r) => sum + r.users, 0), icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                ].map((s, i) => (
                    <div key={i} className="bg-[#0d1117] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${s.bg}`}>
                            <s.icon size={18} className={s.color} />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-white">{isLoading ? '—' : s.value}</div>
                            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content — 2 column */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left: Role List */}
                <div className="lg:col-span-4 flex flex-col gap-3">
                    {/* Search */}
                    <div className="relative mt-2">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                        <input
                            type="text"
                            placeholder="Search roles..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-[#0d1117] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/40 transition-all"
                        />
                    </div>

                    {/* Role Cards */}
                    <div className="space-y-2 overflow-y-auto max-h-[640px] custom-scrollbar pb-2">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="animate-pulse bg-[#0d1117] border border-white/5 rounded-2xl p-4 space-y-3">
                                    <div className="h-4 w-28 bg-white/5 rounded" />
                                    <div className="h-3 w-40 bg-white/5 rounded" />
                                    <div className="flex gap-2">
                                        <div className="h-5 w-12 bg-white/5 rounded-full" />
                                        <div className="h-5 w-16 bg-white/5 rounded-full" />
                                    </div>
                                </div>
                            ))
                        ) : filteredRoles.length === 0 ? (
                            <div className="py-16 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl">
                                <Fingerprint size={32} className="text-slate-800 mb-3" />
                                <p className="text-slate-700 text-xs font-semibold uppercase tracking-widest">No roles found</p>
                            </div>
                        ) : (
                            filteredRoles.map((role, idx) => {
                                const style = getRoleStyle(role.name)
                                const isSelected = selectedRoleId === role.id || (!selectedRoleId && idx === 0)
                                return (
                                    <motion.button
                                        key={role.id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.04 }}
                                        onClick={() => setSelectedRoleId(role.id)}
                                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 group ${isSelected
                                            ? 'bg-[#111827] border-indigo-500/30 ring-1 ring-indigo-500/20'
                                            : 'bg-[#0d1117] border-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-2 h-2 rounded-full ${style.dot} ${isSelected ? 'ring-2 ring-offset-1 ring-offset-[#111827] ring-indigo-500/30' : ''}`} />
                                                <span className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-300'}`}>{role.name}</span>
                                            </div>
                                            {role.type === 'SYSTEM'
                                                ? <Lock size={12} className="text-slate-600 mt-0.5" />
                                                : <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-full">Custom</span>
                                            }
                                        </div>
                                        <p className="text-xs text-slate-600 line-clamp-1 mb-3 pl-4.5">{role.description || 'No description.'}</p>
                                        <div className="flex items-center justify-between pl-4.5">
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                                                <Users size={11} />
                                                <span>{role.users} member{role.users !== 1 ? 's' : ''}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-700">
                                                {role.permissions.includes('*') ? 'All permissions' : `${role.permissions.length} permission${role.permissions.length !== 1 ? 's' : ''}`}
                                            </span>
                                        </div>
                                    </motion.button>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Right: Role Detail */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {selectedRole ? (
                            <motion.div
                                key={selectedRoleId}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="bg-[#0d1117] border border-white/5 rounded-2xl overflow-hidden"
                            >
                                {/* Role Header */}
                                <div className="px-6 py-5 border-b border-white/5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                                <h2 className="text-xl font-black text-white tracking-tight">{selectedRole.name}</h2>
                                                {selectedRole.type === 'SYSTEM' ? (
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg">
                                                        <Lock size={10} /> System Role
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg">Custom</span>
                                                )}
                                            </div>
                                            <p className="text-slate-500 text-sm">{selectedRole.description || 'No description provided.'}</p>
                                            <div className="mt-3 flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                                    <Users size={12} />
                                                    <span>{selectedRole.users} member{selectedRole.users !== 1 ? 's' : ''}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                                    <Key size={12} />
                                                    <code className="font-mono">{selectedRole.key}</code>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button onClick={() => openEdit(selectedRole)} className="flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 rounded-xl text-xs font-semibold transition-all">
                                                <Edit size={13} /> Edit
                                            </button>
                                            {selectedRole.type === 'CUSTOM' && (
                                                <button onClick={() => openDelete(selectedRole)} className="flex items-center gap-2 px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold transition-all">
                                                    <Trash2 size={13} /> Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Permissions Section */}
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-white">Permissions</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-semibold text-slate-500">
                                                {selectedRole.permissions.includes('*') ? 'Full Access' : `${selectedRole.permissions.length} of ${ALL_PERMISSIONS.length} granted`}
                                            </span>
                                            {!selectedRole.permissions.includes('*') && (
                                                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 rounded-full"
                                                        style={{ width: `${Math.round((selectedRole.permissions.length / ALL_PERMISSIONS.length) * 100)}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => {
                                            const grantedCount = selectedRole.permissions.includes('*')
                                                ? perms.length
                                                : perms.filter(p => selectedRole.permissions.includes(p)).length
                                            const allGranted = grantedCount === perms.length
                                            return (
                                                <div key={group} className="bg-[#0b0e14] border border-white/5 rounded-xl overflow-hidden">
                                                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                                                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{group}</span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${allGranted ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : grantedCount > 0 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-white/5 text-slate-600 border border-white/5'}`}>
                                                            {grantedCount}/{perms.length}
                                                        </span>
                                                    </div>
                                                    <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                        {perms.map(perm => {
                                                            const has = selectedRole.permissions.includes('*') || selectedRole.permissions.includes(perm)
                                                            return (
                                                                <div key={perm} className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all ${has
                                                                    ? 'bg-emerald-500/5 border-emerald-500/15'
                                                                    : 'bg-transparent border-transparent opacity-40'
                                                                    }`}>
                                                                    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${has ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                                                                        {has ? <Check size={10} strokeWidth={3} className="text-white" /> : <X size={9} className="text-slate-600" />}
                                                                    </div>
                                                                    <code className={`text-[10px] font-mono font-semibold truncate ${has ? 'text-slate-300' : 'text-slate-600'}`}>{perm}</code>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {selectedRole.type === 'SYSTEM' && (
                                        <div className="mt-4 flex items-start gap-3 p-3.5 bg-indigo-500/5 border border-indigo-500/15 rounded-xl">
                                            <Info size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                                            <p className="text-xs text-slate-500 leading-relaxed">
                                                System roles are managed by the platform and cannot be deleted. You can edit their metadata but permissions set by the system are enforced automatically.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="min-h-[400px] border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center p-8">
                                <div className="w-14 h-14 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center mb-4">
                                    <Shield size={24} className="text-slate-700" />
                                </div>
                                <h3 className="text-slate-500 font-semibold text-sm mb-1">No role selected</h3>
                                <p className="text-slate-700 text-xs">Select a role from the list to view its permissions</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* === CREATE / EDIT MODAL === */}
            <AnimatePresence>
                {showModal && (showModal.type === 'create' || showModal.type === 'edit') && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => !isSaving && setShowModal(null)}
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.97, y: 8 }}
                            className="relative w-full max-w-2xl bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[88vh]"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                        {showModal.type === 'create' ? <Plus size={16} className="text-indigo-400" strokeWidth={2.5} /> : <Edit size={15} className="text-indigo-400" />}
                                    </div>
                                    <div>
                                        <h2 className="text-base font-black text-white tracking-tight">
                                            {showModal.type === 'create' ? 'Create New Role' : `Edit: ${showModal.role?.name}`}
                                        </h2>
                                        <p className="text-[11px] text-slate-500">Configure name, description and permission scope.</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(null)} disabled={isSaving} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all">
                                    <X size={15} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="sm:col-span-2 space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Role Name *</label>
                                        <input
                                            type="text" placeholder="e.g. Compliance Manager"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            disabled={isSaving}
                                            className="w-full bg-[#0b0e14] border border-white/5 rounded-xl py-2.5 px-4 text-white text-sm placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Description</label>
                                        <textarea
                                            placeholder="Describe the responsibilities and scope of this role..."
                                            rows={3} value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            disabled={isSaving}
                                            className="w-full bg-[#0b0e14] border border-white/5 rounded-xl py-2.5 px-4 text-white text-sm placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Permissions Grouped */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Permissions</label>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] text-indigo-400 font-semibold">{formData.permissions.length} selected</span>
                                            <button
                                                onClick={() => setFormData(p => ({ ...p, permissions: p.permissions.length === ALL_PERMISSIONS.length ? [] : ALL_PERMISSIONS }))}
                                                className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-white transition-colors"
                                            >
                                                {formData.permissions.length === ALL_PERMISSIONS.length ? 'Clear all' : 'Select all'}
                                            </button>
                                        </div>
                                    </div>

                                    {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => {
                                        const groupSelected = perms.filter(p => formData.permissions.includes(p)).length
                                        const allGroupSelected = groupSelected === perms.length
                                        return (
                                            <div key={group} className="bg-[#0b0e14] border border-white/5 rounded-xl overflow-hidden">
                                                <button
                                                    onClick={() => toggleGroup(perms)}
                                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${allGroupSelected ? 'bg-indigo-500 border-indigo-400' : groupSelected > 0 ? 'bg-indigo-500/30 border-indigo-500/50' : 'bg-transparent border-slate-700'}`}>
                                                            {allGroupSelected ? <Check size={10} strokeWidth={3} className="text-white" /> : groupSelected > 0 ? <div className="w-1.5 h-1.5 bg-indigo-400 rounded-sm" /> : null}
                                                        </div>
                                                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{group}</span>
                                                    </div>
                                                    <span className="text-[10px] font-semibold text-slate-600">{groupSelected}/{perms.length}</span>
                                                </button>
                                                <div className="px-4 pb-3 grid grid-cols-2 gap-1.5 border-t border-white/5 pt-3">
                                                    {perms.map(perm => {
                                                        const on = formData.permissions.includes(perm)
                                                        return (
                                                            <button
                                                                key={perm}
                                                                onClick={() => togglePerm(perm)}
                                                                disabled={isSaving}
                                                                className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${on ? 'bg-indigo-600/15 border-indigo-500/30 text-indigo-300' : 'bg-transparent border-transparent text-slate-600 hover:bg-white/5 hover:text-slate-400'}`}
                                                            >
                                                                <div className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-all ${on ? 'bg-indigo-500 border-indigo-400' : 'bg-transparent border-slate-700'}`}>
                                                                    {on && <Check size={10} strokeWidth={3} className="text-white" />}
                                                                </div>
                                                                <code className="text-[10px] font-mono truncate">{perm}</code>
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                                        <AlertCircle size={14} /> {error}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex gap-3 px-6 py-4 border-t border-white/5 shrink-0 bg-[#0b0e14]/60">
                                <button onClick={() => setShowModal(null)} disabled={isSaving} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 font-semibold text-sm rounded-xl transition-all border border-white/5">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAction}
                                    disabled={!formData.name.trim() || isSaving}
                                    className="flex-[2] py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    {isSaving
                                        ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
                                        : <>{showModal.type === 'create' ? <Plus size={15} strokeWidth={2.5} /> : <Save size={15} />} {showModal.type === 'create' ? 'Create Role' : 'Save Changes'}</>
                                    }
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* === DELETE MODAL === */}
                {showModal?.type === 'delete' && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isSaving && setShowModal(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-sm bg-[#0d1117] border border-rose-500/20 rounded-2xl p-6 shadow-2xl text-center"
                        >
                            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={20} className="text-rose-400" />
                            </div>
                            <h2 className="text-lg font-black text-white mb-1">Delete Role</h2>
                            <p className="text-slate-400 text-sm mb-6">
                                Delete <span className="font-bold text-white">{showModal.role?.name}</span>? This cannot be undone and will remove all associated permissions.
                            </p>
                            <div className="flex flex-col gap-2">
                                <button onClick={handleAction} disabled={isSaving} className="w-full py-2.5 bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2">
                                    {isSaving ? <Loader2 size={15} className="animate-spin" /> : <><Trash2 size={14} /> Delete Role</>}
                                </button>
                                <button onClick={() => setShowModal(null)} disabled={isSaving} className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl font-semibold text-sm transition-all">
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 99px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }
            `}</style>
        </div>
    )
}
