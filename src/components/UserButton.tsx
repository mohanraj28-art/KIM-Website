'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import {
    User, Settings, Shield, LogOut,
    ChevronDown, CreditCard, Sparkles,
    CheckCircle, ChevronRight
} from 'lucide-react'

export function UserButton() {
    const { user, signOut } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
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

    if (!user) return null

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-800/50 transition-all border border-transparent hover:border-white/5 group"
            >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg overflow-hidden shrink-0">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                        user.firstName?.[0] || user.email?.[0]?.toUpperCase()
                    )}
                </div>
                <div className="hidden sm:block text-left">
                    <p className="text-sm font-bold text-slate-200 leading-none mb-1 group-hover:text-white transition-colors">
                        {user.firstName || 'User'}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                        Free Plan
                    </p>
                </div>
                <ChevronDown size={14} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-3 w-64 bg-[#161b22] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                    <div className="p-4 bg-slate-900/50 border-b border-white/5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/10 flex-shrink-0">
                                {user.firstName?.[0] || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-white truncate">{user.firstName} {user.lastName}</p>
                                <p className="text-xs text-slate-500 truncate font-medium">{user.email}</p>
                            </div>
                        </div>
                        <Link
                            href="/dashboard/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-center gap-2 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-all border border-slate-700"
                        >
                            Manage Account
                        </Link>
                    </div>

                    <div className="p-1.5">
                        <UserMenuItem
                            href="/dashboard/profile"
                            icon={User}
                            label="Profile"
                            onClick={() => setIsOpen(false)}
                        />
                        <UserMenuItem
                            href="/dashboard/security"
                            icon={Shield}
                            label="Security & MFA"
                            onClick={() => setIsOpen(false)}
                        />
                        <UserMenuItem
                            href="/dashboard/billing"
                            icon={CreditCard}
                            label="Billing & Plans"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="h-px bg-white/5 my-1.5 mx-1.5" />
                        <UserMenuItem
                            href="/dashboard/settings"
                            icon={Settings}
                            label="Settings"
                            onClick={() => setIsOpen(false)}
                        />

                        <button
                            onClick={() => { setIsOpen(false); signOut(); }}
                            className="flex items-center gap-3 w-full px-3 py-2 text-rose-500 hover:bg-rose-500/10 rounded-xl text-sm font-bold transition-all"
                        >
                            <LogOut size={16} /> Sign out
                        </button>
                    </div>

                    <div className="p-3 bg-indigo-500/5 border-t border-indigo-500/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-indigo-500/20 rounded-md">
                                <Sparkles size={12} className="text-indigo-400" />
                            </div>
                            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Pro trial active</span>
                        </div>
                        <ChevronRight size={12} className="text-indigo-400/50" />
                    </div>
                </div>
            )}
        </div>
    )
}

function UserMenuItem({ href, icon: Icon, label, onClick }: { href: string, icon: any, label: string, onClick: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
        >
            <Icon size={16} />
            <span className="text-sm font-bold">{label}</span>
        </Link>
    )
}
