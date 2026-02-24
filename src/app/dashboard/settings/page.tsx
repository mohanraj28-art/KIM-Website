'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Settings, Globe, Palette, Bell, Shield, User, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react'

export default function SettingsPage() {
    const { user } = useAuth()
    const [saved, setSaved] = useState<string | null>(null)
    const [orgName, setOrgName] = useState('My Company')
    const [primaryColor, setPrimaryColor] = useState('#6366f1')
    const [sessionDuration, setSessionDuration] = useState('30')
    const [notifSignIn, setNotifSignIn] = useState(true)
    const [notifNewDevice, setNotifNewDevice] = useState(true)
    const [notifBilling, setNotifBilling] = useState(true)

    const handleSave = (section: string) => {
        setSaved(section)
        setTimeout(() => setSaved(null), 2500)
    }

    return (
        <div style={{ maxWidth: 860, animation: 'fadeIn 0.4s ease' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Settings size={24} color="#8b949e" />
                    Settings
                </h1>
                <p style={{ color: '#8b949e', fontSize: 14 }}>Manage your tenant configuration, branding, and preferences.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* General */}
                <SettingsSection title="General" icon={Globe} iconColor="#6366f1">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Tenant name</label>
                            <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} className="input" style={{ height: 40 }} />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Tenant slug</label>
                            <input type="text" defaultValue="my-company" className="input" style={{ height: 40 }} />
                            <p className="form-hint">Cannot be changed after creation.</p>
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Support email</label>
                            <input type="email" defaultValue="support@mycompany.com" className="input" style={{ height: 40 }} />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Custom domain</label>
                            <input type="text" defaultValue="" placeholder="auth.mycompany.com" className="input" style={{ height: 40 }} />
                            <p className="form-hint">Pro plan required.</p>
                        </div>
                    </div>
                    <SaveButton onSave={() => handleSave('general')} saved={saved === 'general'} />
                </SettingsSection>

                {/* Branding */}
                <SettingsSection title="Branding" icon={Palette} iconColor="#ec4899">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Primary color</label>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                                    style={{ width: 40, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'none' }} />
                                <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="input" style={{ height: 40, fontFamily: 'monospace', fontSize: 13 }} />
                            </div>
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Logo URL</label>
                            <input type="url" placeholder="https://..." className="input" style={{ height: 40 }} />
                        </div>
                    </div>
                    <div style={{ marginTop: 16, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p style={{ fontSize: 12, color: '#8b949e', marginBottom: 8 }}>Preview</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'white' }}>K</div>
                            <div>
                                <button style={{ background: primaryColor, color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                    Sign in
                                </button>
                            </div>
                        </div>
                    </div>
                    <SaveButton onSave={() => handleSave('branding')} saved={saved === 'branding'} />
                </SettingsSection>

                {/* Notifications */}
                <SettingsSection title="Notification Preferences" icon={Bell} iconColor="#d29922">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {[
                            { label: 'New sign-in alerts', desc: 'Get notified when someone signs into your account.', value: notifSignIn, onChange: setNotifSignIn },
                            { label: 'New device detected', desc: 'Alert when a new device signs in to your account.', value: notifNewDevice, onChange: setNotifNewDevice },
                            { label: 'Billing updates', desc: 'Receive receipts, renewal reminders, and billing changes.', value: notifBilling, onChange: setNotifBilling },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                <div>
                                    <p style={{ fontSize: 14, fontWeight: 600, color: '#f0f6fc', margin: 0, marginBottom: 2 }}>{item.label}</p>
                                    <p style={{ fontSize: 12, color: '#484f58', margin: 0 }}>{item.desc}</p>
                                </div>
                                <div onClick={() => item.onChange(!item.value)} style={{
                                    width: 44, height: 24, borderRadius: 12, cursor: 'pointer', flexShrink: 0,
                                    background: item.value ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.1)',
                                    position: 'relative', transition: 'all 0.2s ease',
                                }}>
                                    <div style={{
                                        position: 'absolute', top: 3, left: item.value ? 23 : 3,
                                        width: 18, height: 18, borderRadius: '50%', background: 'white',
                                        transition: 'left 0.2s ease',
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <SaveButton onSave={() => handleSave('notifications')} saved={saved === 'notifications'} />
                </SettingsSection>

                {/* Danger Zone */}
                <div style={{ background: 'rgba(248,81,73,0.03)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(248,81,73,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <AlertTriangle size={16} color="#f85149" />
                        <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 15, margin: 0, color: '#f85149' }}>Danger Zone</h2>
                    </div>
                    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {[
                            { label: 'Export all data', desc: 'Download a complete export of your tenant data in JSON format.', btn: 'Export data', variant: 'secondary' },
                            { label: 'Delete all sessions', desc: 'Immediately revoke all active sessions for all users.', btn: 'Revoke all', variant: 'danger' },
                            { label: 'Delete tenant', desc: 'Permanently delete this tenant and all associated data. This action cannot be undone.', btn: 'Delete tenant', variant: 'danger' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
                                <div>
                                    <p style={{ fontSize: 14, fontWeight: 600, color: '#f0f6fc', margin: 0, marginBottom: 2 }}>{item.label}</p>
                                    <p style={{ fontSize: 12, color: '#484f58', margin: 0 }}>{item.desc}</p>
                                </div>
                                <button className={`btn btn-${item.variant} btn-sm`} style={{ flexShrink: 0 }}>{item.btn}</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function SettingsSection({ title, icon: Icon, iconColor, children }: { title: string, icon: React.ElementType, iconColor: string, children: React.ReactNode }) {
    return (
        <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${iconColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={14} color={iconColor} />
                </div>
                <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 15, margin: 0 }}>{title}</h2>
            </div>
            <div style={{ padding: 24 }}>{children}</div>
        </div>
    )
}

function SaveButton({ onSave, saved }: { onSave: () => void, saved: boolean }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.04)', alignItems: 'center', gap: 12 }}>
            {saved && <span style={{ fontSize: 13, color: '#3fb950', display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle size={14} /> Saved!</span>}
            <button onClick={onSave} className="btn btn-primary btn-sm" style={{ gap: 6 }}>
                <RefreshCw size={12} /> Save changes
            </button>
        </div>
    )
}
