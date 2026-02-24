'use client'

import { useState } from 'react'
import { Shield, AlertTriangle, Lock, Eye, Fingerprint, Ban, CheckCircle, Info, Zap, Key, RefreshCw } from 'lucide-react'

export default function SecurityPage() {
    const [mfaRequired, setMfaRequired] = useState(false)
    const [blockDisposable, setBlockDisposable] = useState(true)
    const [botDetection, setBotDetection] = useState(true)
    const [sessionDuration, setSessionDuration] = useState('30')
    const [maxAttempts, setMaxAttempts] = useState('10')
    const [saved, setSaved] = useState(false)

    const handleSave = () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    return (
        <div style={{ maxWidth: 860, animation: 'fadeIn 0.4s ease' }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Shield size={24} color="#f85149" />
                    Security Settings
                </h1>
                <p style={{ color: '#8b949e', fontSize: 14 }}>Configure authentication policies and security controls for your tenant.</p>
            </div>

            {/* Alert */}
            <div style={{
                background: 'rgba(210,153,34,0.08)', border: '1px solid rgba(210,153,34,0.2)',
                borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 28,
            }}>
                <AlertTriangle size={16} color="#d29922" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#d29922', marginBottom: 2 }}>Security Recommendations</p>
                    <p style={{ fontSize: 12, color: '#8b949e' }}>3 security improvements are available. Enable MFA enforcement and review session settings.</p>
                </div>
                <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto', flexShrink: 0 }}>Review</button>
            </div>

            {/* Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Authentication Policies */}
                <Section title="Authentication Policies" icon={Lock} iconColor="#6366f1">
                    <ToggleSetting
                        label="Require MFA for all users"
                        desc="Force all users to enroll in multi-factor authentication before accessing your app."
                        value={mfaRequired}
                        onChange={setMfaRequired}
                    />
                    <ToggleSetting
                        label="Block disposable email addresses"
                        desc="Prevent sign-ups from temporary email providers like Mailinator, Guerrilla Mail, etc."
                        value={blockDisposable}
                        onChange={setBlockDisposable}
                    />
                    <ToggleSetting
                        label="Bot & fraud detection"
                        desc="Use behavioral analysis to detect and block automated sign-up attacks."
                        value={botDetection}
                        onChange={setBotDetection}
                    />
                </Section>

                {/* Session Policy */}
                <Section title="Session Policy" icon={Key} iconColor="#3fb950">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, padding: '4px 0' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Session duration (days)</label>
                            <input type="number" value={sessionDuration} onChange={e => setSessionDuration(e.target.value)} className="input" min={1} max={365} style={{ height: 40, fontSize: 14 }} />
                            <p className="form-hint">How long until users must re-authenticate.</p>
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Max login attempts</label>
                            <input type="number" value={maxAttempts} onChange={e => setMaxAttempts(e.target.value)} className="input" min={3} max={100} style={{ height: 40, fontSize: 14 }} />
                            <p className="form-hint">Account locks after this many failed attempts.</p>
                        </div>
                    </div>
                </Section>

                {/* Password Policy */}
                <Section title="Password Policy" icon={Eye} iconColor="#8b5cf6">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { label: 'Minimum length', value: '8 characters', badge: 'badge-success' },
                            { label: 'Require uppercase', value: 'Enabled', badge: 'badge-success' },
                            { label: 'Require numbers', value: 'Enabled', badge: 'badge-success' },
                            { label: 'Require special chars', value: 'Optional', badge: 'badge-warning' },
                            { label: 'Breach detection', value: 'Enabled (HaveIBeenPwned)', badge: 'badge-primary' },
                            { label: 'Password expiry', value: 'Never', badge: 'badge-default' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                <span style={{ fontSize: 14, color: '#8b949e' }}>{item.label}</span>
                                <span className={`badge ${item.badge}`}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Allowed Auth Methods */}
                <Section title="Allowed Authentication Methods" icon={Fingerprint} iconColor="#f0883e">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                        {[
                            { name: 'Email + Password', enabled: true },
                            { name: 'Magic Links', enabled: true },
                            { name: 'Google OAuth', enabled: true },
                            { name: 'GitHub OAuth', enabled: true },
                            { name: 'SMS OTP', enabled: false },
                            { name: 'Passkeys (WebAuthn)', enabled: false },
                            { name: 'SAML SSO', enabled: false },
                            { name: 'Apple OAuth', enabled: true },
                        ].map((method, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 8, padding: '12px 14px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {method.enabled ? <CheckCircle size={14} color="#3fb950" /> : <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid #484f58' }} />}
                                    <span style={{ fontSize: 13, color: method.enabled ? '#f0f6fc' : '#484f58' }}>{method.name}</span>
                                </div>
                                <span className={`badge ${method.enabled ? 'badge-success' : 'badge-default'}`} style={{ fontSize: 10 }}>
                                    {method.enabled ? 'ON' : 'OFF'}
                                </span>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Save button */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
                    {saved && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#3fb950' }}>
                            <CheckCircle size={14} /> Settings saved!
                        </div>
                    )}
                    <button onClick={handleSave} className="btn btn-primary" style={{ gap: 8 }}>
                        <RefreshCw size={14} /> Save Settings
                    </button>
                </div>
            </div>
        </div>
    )
}

function Section({ title, icon: Icon, iconColor, children }: { title: string, icon: React.ElementType, iconColor: string, children: React.ReactNode }) {
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

function ToggleSetting({ label, desc, value, onChange }: { label: string, desc: string, value: boolean, onChange: (v: boolean) => void }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#f0f6fc', margin: 0, marginBottom: 3 }}>{label}</p>
                <p style={{ fontSize: 12, color: '#484f58', margin: 0, lineHeight: 1.5 }}>{desc}</p>
            </div>
            <div
                onClick={() => onChange(!value)}
                style={{
                    width: 44, height: 24, borderRadius: 12, cursor: 'pointer', flexShrink: 0,
                    background: value ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.1)',
                    position: 'relative', transition: 'all 0.2s ease',
                    boxShadow: value ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
                }}
            >
                <div style={{
                    position: 'absolute', top: 3, left: value ? 23 : 3,
                    width: 18, height: 18, borderRadius: '50%', background: 'white',
                    transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }} />
            </div>
        </div>
    )
}
