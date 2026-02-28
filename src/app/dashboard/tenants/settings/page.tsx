'use client'

import { useState } from 'react'
import { Building2, Save, Globe, Lock, Users, Zap, Trash2, Camera, Shield, Mail, CheckCircle, ExternalLink } from 'lucide-react'

export default function TenantSettingsPage() {
    const [activeTab, setActiveTab] = useState('general')

    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="flex items-center gap-6 mb-12">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-indigo-500/10">
                        K
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2.5 bg-slate-900 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all shadow-xl hover:scale-110">
                        <Camera size={16} />
                    </button>
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-black text-white tracking-tight">Kaappu Inc.</h1>
                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded border border-indigo-500/20">Enterprise</span>
                    </div>
                    <p className="text-slate-400 font-medium">Manage your tenant's identity, security, and member access.</p>
                </div>
            </div>

            <div className="flex gap-2 border-b border-white/5 mb-10 overflow-x-auto pb-px scrollbar-hide">
                {[
                    { id: 'general', label: 'General', icon: Building2 },
                    { id: 'security', label: 'Security & Auth', icon: Lock },
                    { id: 'members', label: 'Members', icon: Users },
                    { id: 'domains', label: 'Verified Domains', icon: Globe },
                    { id: 'billing', label: 'Billing', icon: Zap },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id
                            ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                            : 'border-transparent text-slate-500 hover:text-slate-200 hover:bg-white/5'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="space-y-8">
                {activeTab === 'general' && (
                    <div className="grid gap-8">
                        <SettingsSection title="Display Information" description="How your tenant appears to users and teams.">
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tenant Name</label>
                                        <input type="text" defaultValue="Kaappu Inc." className="w-full bg-slate-900 border border-white/5 rounded-2xl py-3 px-4 text-sm font-medium text-white focus:outline-none focus:border-indigo-500 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tenant ID</label>
                                        <div className="relative">
                                            <input type="text" readOnly defaultValue="tenant_2nmX7qL..." className="w-full bg-[#161b22] border border-white/5 rounded-2xl py-3 px-4 text-sm font-mono text-slate-500 focus:outline-none" />
                                            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">Copy</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Website URL</label>
                                    <input type="url" defaultValue="https://kaappu.id" className="w-full bg-slate-900 border border-white/5 rounded-2xl py-3 px-4 text-sm font-medium text-white focus:outline-none focus:border-indigo-500 transition-all" />
                                </div>
                            </div>
                        </SettingsSection>

                        <SettingsSection title="Danger Zone" description="Irreversible actions for this tenant.">
                            <div className="p-8 flex items-center justify-between bg-rose-500/5 border-t border-rose-500/10">
                                <div>
                                    <p className="font-bold text-white mb-1">Delete Tenant</p>
                                    <p className="text-sm text-slate-500 font-medium">Permanently remove this tenant and all associated data.</p>
                                </div>
                                <button className="px-6 py-2.5 bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-rose-500/20">
                                    Delete Tenant
                                </button>
                            </div>
                        </SettingsSection>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="grid gap-8">
                        <SettingsSection title="Authentication Policies" description="Manage how members sign in to this tenant.">
                            <div className="divide-y divide-white/5">
                                <ToggleSetting
                                    title="Enforce MFA"
                                    description="Require all members to have multi-factor authentication enabled."
                                    enabled={true}
                                />
                                <ToggleSetting
                                    title="SSO Enforcement"
                                    description="Restrict login to only verified SSO providers (Google/GitHub)."
                                    enabled={false}
                                />
                                <ToggleSetting
                                    title="Just-In-Time Provisioning"
                                    description="Automatically create user accounts on their first sign-in."
                                    enabled={true}
                                />
                            </div>
                        </SettingsSection>

                        <SettingsSection title="Domain Locking" description="Restrict tenant access to specific email domains.">
                            <div className="p-8 space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <CheckCircle size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-white">@kaappu.id</p>
                                        <p className="text-xs text-slate-500 font-medium whitespace-nowrap">Verified Primary Domain</p>
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active</span>
                                </div>
                                <button className="w-full flex items-center justify-center gap-2 py-3 bg-[#0d1117] border border-dashed border-white/20 rounded-2xl text-slate-400 text-xs font-black uppercase tracking-widest hover:border-indigo-500/40 hover:text-white transition-all">
                                    Add Another Domain
                                </button>
                            </div>
                        </SettingsSection>
                    </div>
                )}

                {activeTab === 'members' && (
                    <SettingsSection title="Manage Members" description="Invite and manage team members and their roles.">
                        <div className="p-4 bg-slate-900/30 border-b border-white/5 flex gap-4">
                            <div className="relative flex-1">
                                <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                                <input type="text" placeholder="Search members..." className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 pl-12 pr-4 text-sm font-medium text-white focus:outline-none focus:border-indigo-500/50" />
                            </div>
                            <button className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                                <Users size={14} /> Invite
                            </button>
                        </div>
                        <div className="divide-y divide-white/5">
                            <MemberRow name="Mokaa Kip" email="mokaa@kaappu.id" role="Owner" avatar="M" />
                            <MemberRow name="Sarah Chen" email="sarah@kaappu.id" role="Admin" avatar="S" />
                            <MemberRow name="Alex Rivera" email="alex@kaappu.id" role="Member" avatar="A" />
                        </div>
                    </SettingsSection>
                )}
            </div>

            <div className="mt-12 flex justify-end gap-3 pb-20">
                <button className="px-6 py-2.5 text-slate-400 font-bold text-sm hover:text-white transition-colors">Discard</button>
                <button className="px-8 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold text-sm transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
                    <Save size={16} /> Save Changes
                </button>
            </div>
        </div>
    )
}

function SettingsSection({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
    return (
        <div className="bg-[#0d1117] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 bg-slate-900/10">
                <h3 className="text-xl font-black text-white tracking-tight">{title}</h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">{description}</p>
            </div>
            {children}
        </div>
    )
}

function ToggleSetting({ title, description, enabled }: { title: string, description: string, enabled: boolean }) {
    return (
        <div className="p-8 flex items-center justify-between hover:bg-white/[0.01] transition-all group">
            <div className="max-w-md">
                <p className="font-bold text-slate-200 mb-1 group-hover:text-white transition-colors">{title}</p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{description}</p>
            </div>
            <button className={`w-12 h-6 rounded-full relative transition-all duration-300 ${enabled ? 'bg-indigo-500' : 'bg-slate-800'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-lg ${enabled ? 'left-7' : 'left-1'}`} />
            </button>
        </div>
    )
}

function MemberRow({ name, email, role, avatar }: { name: string, email: string, role: string, avatar: string }) {
    return (
        <div className="p-8 flex items-center justify-between hover:bg-white/[0.01] transition-all">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center text-sm font-black text-white">
                    {avatar}
                </div>
                <div>
                    <p className="font-bold text-white">{name}</p>
                    <p className="text-xs text-slate-500 font-medium">{email}</p>
                </div>
            </div>
            <div className="flex items-center gap-8">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${role === 'Owner' ? 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10' : 'text-slate-500 border-white/5 bg-slate-900/50'
                    }`}>{role}</span>
                <button className="p-2 text-slate-600 hover:text-white transition-all">
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    )
}
