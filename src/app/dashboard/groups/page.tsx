'use client'

import { useEffect, useState, useCallback } from 'react'
import { LayoutGrid, Plus, Search, MoreVertical, Users, Shield, ArrowRight, Folder, ChevronRight, Loader2, X, XCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface Group {
    id: string
    name: string
    description: string | null
    memberCount: number
    createdAt: string
}

export default function GroupsPage() {
    const { accessToken } = useAuth()
    const [groups, setGroups] = useState<Group[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')

    // Modal state
    const [showModal, setShowModal] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({ name: '', description: '' })

    const fetchGroups = useCallback(async () => {
        if (!accessToken) return
        setIsLoading(true)
        try {
            const res = await fetch('/api/groups', {
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            const data = await res.json()
            if (data.success) {
                setGroups(data.data)
            }
        } catch (err) {
            console.error('Failed to fetch groups:', err)
        } finally {
            setIsLoading(false)
        }
    }, [accessToken])

    useEffect(() => {
        fetchGroups()
    }, [fetchGroups])

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!accessToken) return
        setIsCreating(true)
        setError(null)
        try {
            const res = await fetch('/api/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (data.success) {
                setSuccess(true)
                setFormData({ name: '', description: '' })
                fetchGroups()
                setTimeout(() => {
                    setShowModal(false)
                    setSuccess(false)
                }, 1500)
            } else {
                setError(data.error || 'Failed to create group')
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred')
        } finally {
            setIsCreating(false)
        }
    }

    const filteredGroups = groups.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        (g.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
    )

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <LayoutGrid size={28} className="text-indigo-500" />
                        Groups
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Batch manage users and their access levels using logical groups.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                    <Plus size={18} /> Create Group
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-10 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Search groups by name or metadata..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#0d1117] border border-white/10 rounded-[24px] py-4.5 pl-14 pr-6 text-base font-medium text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-600"
                />
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 size={32} className="animate-spin text-indigo-500" />
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-600">Syncing Groups...</p>
                </div>
            ) : filteredGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-white/5 rounded-[40px] bg-[#0d1117]/30 backdrop-blur-sm">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-500/5 flex items-center justify-center mb-8 ring-1 ring-indigo-500/10">
                        <LayoutGrid size={36} className="text-indigo-400 opacity-40" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3">No groups found</h3>
                    <p className="text-slate-500 font-medium max-w-sm text-center mb-10 leading-relaxed">
                        {search ? "No groups match your search criteria." : "User groups allow you to manage permissions and access levels for multiple users simultaneously."}
                    </p>
                    {!search && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-105"
                        >
                            <Plus size={18} className="text-indigo-400" />
                            Initialize First Group
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGroups.map((group) => (
                        <div key={group.id} className="bg-[#0d1117] border border-white/5 rounded-[32px] p-7 hover:border-indigo-500/30 transition-all group flex flex-col shadow-xl hover:shadow-indigo-500/5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex justify-between items-start mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                    <Folder size={24} />
                                </div>
                                <button className="p-2.5 text-slate-600 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                    <MoreVertical size={18} />
                                </button>
                            </div>

                            <div className="flex-1 mb-8">
                                <h3 className="text-xl font-black text-white mb-2 leading-tight group-hover:text-indigo-400 transition-colors">
                                    {group.name}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">
                                    {group.description || 'No description provided.'}
                                </p>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Members</span>
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <div className="flex -space-x-2">
                                            {[...Array(Math.min(3, group.memberCount))].map((_, i) => (
                                                <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0d1117] bg-slate-800 flex items-center justify-center text-[8px] font-bold">
                                                    U
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-slate-300">{group.memberCount} Participants</span>
                                    </div>
                                </div>

                                <button className="w-full mt-4 flex items-center justify-center gap-3 py-3.5 bg-slate-900/50 border border-white/5 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-800 hover:border-white/10 transition-all group/btn">
                                    Explore Group <ArrowRight size={16} className="text-indigo-500 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => setShowModal(true)}
                        className="border-2 border-dashed border-white/5 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group min-h-[320px]"
                    >
                        <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center text-slate-600 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-2xl">
                            <Plus size={32} />
                        </div>
                        <div className="text-center">
                            <p className="text-slate-200 font-black text-lg">New Group</p>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Scale your identity</p>
                        </div>
                    </button>
                </div>
            )}

            {/* Create Group Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-[520px] bg-[#0d1117] border border-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                        <Plus className="text-indigo-500" size={20} />
                                    </div>
                                    Create Group
                                </h2>
                                <p className="text-slate-500 font-medium mt-2">Logical collection of users for access control.</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-slate-500 hover:text-white bg-white/5 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {success ? (
                            <div className="py-12 flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 ring-1 ring-emerald-500/20">
                                    <CheckCircle size={40} className="text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Group Created!</h3>
                                <p className="text-slate-500">Your new group is ready for users.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleCreateGroup} className="space-y-6">
                                {error && (
                                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold flex items-center gap-3">
                                        <XCircle size={18} />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Group Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Engineering, Sales, Beta Testers"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-700"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Description (Optional)</label>
                                    <textarea
                                        placeholder="What is this group for?"
                                        rows={4}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 text-sm font-medium text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-700 resize-none"
                                    />
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-4 px-6 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl font-bold transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="flex-1 py-4 px-6 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
                                    >
                                        {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                        Create Group
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
