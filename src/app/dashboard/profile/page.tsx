'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
    User, Mail, Shield, Smartphone, Globe,
    Camera, CheckCircle, ExternalLink, Trash2,
    Lock, Fingerprint, Key, ChevronRight
} from 'lucide-react'

export default function ProfilePage() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('account')

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="flex items-center gap-6 mb-10">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-indigo-500/20 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()
                        )}
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-white transition-all shadow-lg group-hover:scale-110">
                        <Camera size={14} />
                    </button>
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-[#f0f6fc] tracking-tight">
                        {user?.firstName} {user?.lastName}
                    </h1>
                    <p className="text-slate-400 font-medium">Manage your personal information and security settings.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/5 mb-8">
                {['Account', 'Security', 'Connections'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === tab.toLowerCase()
                                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="space-y-6">
                {activeTab === 'account' && (
                    <div className="grid gap-6">
                        <ProfileSection title="Profile Details" description="Standard information used across the platform.">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                                <div className="space-y-4">
                                    <ProfileField label="First Name" value={user?.firstName || 'Not set'} />
                                    <ProfileField label="Last Name" value={user?.lastName || 'Not set'} />
                                </div>
                                <div className="space-y-4">
                                    <ProfileField label="Email Address" value={user?.email || 'Not set'} />
                                    <ProfileField label="Phone Number" value="+1 (555) 000-0000" />
                                </div>
                            </div>
                        </ProfileSection>

                        <ProfileSection title="Regional Settings" description="Configure your timezone and locale.">
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ProfileField label="Timezone" value="UTC-07:00 (Pacific Time)" />
                                <ProfileField label="Language" value="English (United States)" />
                            </div>
                        </ProfileSection>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="grid gap-6">
                        <ProfileSection title="Two-Factor Authentication" description="Add an extra layer of security to your account.">
                            <div className="p-6 flex items-center justify-between bg-emerald-500/5 border border-emerald-500/10 rounded-xl m-2">
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-emerald-400">2FA is Enabled</p>
                                        <p className="text-sm text-slate-400">Your account is protected with multi-factor authentication.</p>
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-sm transition-all border border-slate-700">Manage</button>
                            </div>
                        </ProfileSection>

                        <ProfileSection title="Passkeys" description="Passwordless login using biometric or hardware keys.">
                            <div className="p-6 flex items-center justify-between border-t border-white/5">
                                <div className="flex gap-4 items-center">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                        <Fingerprint size={20} />
                                    </div>
                                    <p className="text-[#f0f6fc] font-medium">iCloud Keychain</p>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <span className="text-xs text-slate-500 font-medium">Added 3 months ago</span>
                                    <button className="p-2 text-slate-500 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-900/50 flex justify-center border-t border-white/5">
                                <button className="flex items-center gap-2 text-indigo-400 font-bold text-sm hover:text-indigo-300 transition-all">
                                    <Key size={14} /> Add a passkey
                                </button>
                            </div>
                        </ProfileSection>
                    </div>
                )}

                {activeTab === 'connections' && (
                    <ProfileSection title="Social Connections" description="Link your social accounts for faster sign-in.">
                        <div className="divide-y divide-white/5">
                            <ConnectionRow
                                name="Google"
                                icon="https://www.google.com/favicon.ico"
                                email={user?.email || 'Linked'}
                                connected={true}
                            />
                            <ConnectionRow
                                name="GitHub"
                                icon="https://github.com/favicon.ico"
                                email="mokaa-kip"
                                connected={true}
                            />
                            <ConnectionRow
                                name="Microsoft"
                                icon="https://www.microsoft.com/favicon.ico"
                                connected={false}
                            />
                        </div>
                    </ProfileSection>
                )}
            </div>
        </div>
    )
}

function ProfileSection({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
    return (
        <div className="bg-[#0d1117] border border-white/5 rounded-2xl overflow-hidden shadow-sm shadow-indigo-500/5">
            <div className="px-6 py-5 border-b border-white/5 bg-slate-900/30">
                <h3 className="text-lg font-bold text-[#f0f6fc] tracking-tight">{title}</h3>
                <p className="text-sm text-slate-400 mt-1 font-medium">{description}</p>
            </div>
            {children}
        </div>
    )
}

function ProfileField({ label, value }: { label: string, value: string }) {
    return (
        <div className="space-y-1.5 p-3 rounded-lg hover:bg-white/5 transition-all cursor-default group">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</label>
            <div className="flex items-center justify-between">
                <p className="text-[#f0f6fc] font-semibold">{value}</p>
                <button className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-all text-xs font-bold uppercase tracking-wider">Edit</button>
            </div>
        </div>
    )
}

function ConnectionRow({ name, icon, email, connected }: { name: string, icon: string, email?: string, connected: boolean }) {
    return (
        <div className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-all">
            <div className="flex gap-4 items-center">
                <img src={icon} alt="" className="w-8 h-8 p-1.5 bg-slate-800 rounded-lg filter grayscale opacity-80" />
                <div>
                    <p className="font-bold text-[#f0f6fc]">{name}</p>
                    {email && <p className="text-sm text-slate-500 font-medium">{email}</p>}
                </div>
            </div>
            {connected ? (
                <div className="flex gap-3">
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-widest uppercase rounded flex items-center gap-1.5 border border-emerald-500/20">
                        <CheckCircle size={10} /> Connected
                    </span>
                    <button className="text-slate-500 hover:text-rose-500 p-1.5 transition-all"><Trash2 size={16} /></button>
                </div>
            ) : (
                <button className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-indigo-500/20">
                    Connect
                </button>
            )}
        </div>
    )
}
