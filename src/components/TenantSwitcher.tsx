'use client'

import { useState, useRef, useEffect } from 'react'
import {
    Building2, ChevronDown, Check,
    Plus, Settings, LayoutGrid,
    Search
} from 'lucide-react'

// Mock tenants for UI (Formerly Orgs)
const MOCK_TENANTS = [
    { id: '1', name: 'Kaappu Inc.', role: 'Owner', logo: null, color: '#6366f1' },
    { id: '2', name: 'Design Studio', role: 'Admin', logo: null, color: '#ec4899' },
    { id: '3', name: 'Dev Ops', role: 'Member', logo: null, color: '#10b981' },
]

export function TenantSwitcher() {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedTenant, setSelectedTenant] = useState(MOCK_TENANTS[0])
    const [searchQuery, setSearchQuery] = useState('')
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const filteredTenants = MOCK_TENANTS.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all group"
            >
                <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-lg shrink-0"
                    style={{ background: selectedTenant.color }}
                >
                    {selectedTenant.name[0]}
                </div>
                <div className="min-w-0 flex-1 text-left">
                    <p className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors tracking-tight">
                        {selectedTenant.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">
                        {selectedTenant.role}
                    </p>
                </div>
                <ChevronDown size={14} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-3 w-72 bg-[#161b22] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100] backdrop-blur-xl">
                    <div className="p-3 border-b border-white/5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                            <input
                                type="text"
                                placeholder="Search tenants..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto p-1.5 custom-scrollbar">
                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-3 py-2">
                            Tenants
                        </p>
                        {filteredTenants.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => { setSelectedTenant(t); setIsOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl transition-all group relative"
                            >
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0"
                                    style={{ background: t.color }}
                                >
                                    {t.name[0]}
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-300 truncate group-hover:text-white transition-colors">
                                        {t.name}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">
                                        {t.role}
                                    </p>
                                </div>
                                {selectedTenant.id === t.id && (
                                    <div className="w-5 h-5 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
                                        <Check size={10} className="text-indigo-400" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-1.5 bg-slate-900/30 border-t border-white/5">
                        <button className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all">
                            <div className="w-8 h-8 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-slate-500 group-hover:border-white/40 transition-all">
                                <Plus size={16} />
                            </div>
                            <span className="text-sm font-bold">Create Tenant</span>
                        </button>
                        <button className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all mt-1">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-slate-700 transition-all">
                                <LayoutGrid size={16} />
                            </div>
                            <span className="text-sm font-bold">Manage All Tenants</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
