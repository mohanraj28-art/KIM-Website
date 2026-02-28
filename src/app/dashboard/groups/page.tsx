'use client'

import { useState } from 'react'
import { LayoutGrid, Plus, Search, MoreVertical, Users, Shield, ArrowRight, Folder, ChevronRight, Settings } from 'lucide-react'

const MOCK_GROUPS = [
    { id: '1', name: 'Engineering', description: 'Core product engineers and infrastructure team.', members: 42, role: 'Developer', color: '#6366f1' },
    { id: '2', name: 'Product Management', description: 'Owners of product vision and roadmaps.', members: 8, role: 'Editor', color: '#ec4899' },
    { id: '3', name: 'Support Tier 1', description: 'Customer response and initial triage.', members: 15, role: 'Member', color: '#10b981' },
    { id: '4', name: 'Billing Admins', description: 'Financial controllers and plan managers.', members: 4, role: 'Billing Admin', color: '#f59e0b' },
    { id: '5', name: 'External Contractors', description: 'Temporary access for third-party vendors.', members: 12, role: 'Guest', color: '#64748b' },
]

export default function GroupsPage() {
    const [search, setSearch] = useState('')

    return (
        <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <LayoutGrid size={28} className="text-indigo-500" />
                        User Groups
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Batch manage users and their permissions using logical groups.</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20">
                    <Plus size={16} /> Create Group
                </button>
            </div>

            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                    type="text"
                    placeholder="Search groups by name or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#0d1117] border border-white/10 rounded-2xl py-3.5 pl-12 pr-6 text-sm font-medium text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_GROUPS.map((group) => (
                    <div key={group.id} className="bg-[#0d1117] border border-white/5 rounded-3xl p-6 hover:border-white/20 transition-all group flex flex-col shadow-lg hover:shadow-indigo-500/5">
                        <div className="flex justify-between items-start mb-6">
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg"
                                style={{ background: `linear-gradient(135deg, ${group.color}, #000)` }}
                            >
                                <Folder size={20} />
                            </div>
                            <button className="p-2 text-slate-600 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                                <MoreVertical size={16} />
                            </button>
                        </div>

                        <div className="flex-1 mb-6">
                            <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-indigo-400 transition-colors">
                                {group.name}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                {group.description}
                            </p>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-white/5">
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                                <span>Default Role</span>
                                <span className="text-indigo-400 flex items-center gap-1.5 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                    <Shield size={10} /> {group.role}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                                <span>Members</span>
                                <div className="flex items-center gap-1.5 text-slate-300">
                                    <Users size={12} className="text-indigo-500" />
                                    {group.members} Users
                                </div>
                            </div>

                            <button className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 bg-slate-900 border border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all">
                                Manage Group <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Create Card */}
                <button className="border-2 border-dashed border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group min-h-[300px]">
                    <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-xl">
                        <Plus size={24} />
                    </div>
                    <div className="text-center">
                        <p className="text-slate-200 font-bold">New Group</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Logical collection of users</p>
                    </div>
                </button>
            </div>
        </div>
    )
}
