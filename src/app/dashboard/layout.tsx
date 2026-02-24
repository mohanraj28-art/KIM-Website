'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    LayoutDashboard, Users, Building2, Shield, Activity,
    Settings, Key, Bell, LogOut, ChevronDown, Menu, X,
    BarChart3, FileText, Zap, Lock, Globe, CreditCard, Webhook
} from 'lucide-react'
import { getInitials } from '@/lib/utils'

const NAV_ITEMS = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { href: '/dashboard/users', icon: Users, label: 'Users' },
    { href: '/dashboard/organizations', icon: Building2, label: 'Organizations' },
    { href: '/dashboard/sessions', icon: Activity, label: 'Sessions' },
    { href: '/dashboard/audit-logs', icon: FileText, label: 'Audit Logs' },
    { href: '/dashboard/security', icon: Shield, label: 'Security' },
    { href: '/dashboard/api-keys', icon: Key, label: 'API Keys' },
    { href: '/dashboard/webhooks', icon: Webhook, label: 'Webhooks' },
    { href: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoaded, isSignedIn, signOut } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/sign-in')
        }
    }, [isLoaded, isSignedIn, router])

    if (!isLoaded) {
        return (
            <div style={{
                height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#030712',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12, margin: '0 auto 16px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, fontWeight: 800, color: 'white',
                        animation: 'pulse 2s ease infinite',
                    }}>K</div>
                    <p style={{ color: '#8b949e', fontSize: 14 }}>Loading KIP Platform...</p>
                </div>
            </div>
        )
    }

    if (!isSignedIn) return null

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#030712', overflow: 'hidden' }}>
            {/* Sidebar */}
            <aside style={{
                width: 240, flexShrink: 0, height: '100vh', display: 'flex', flexDirection: 'column',
                background: '#0d1117', borderRight: '1px solid rgba(255,255,255,0.06)',
                overflowY: 'auto', position: 'relative', zIndex: 50,
            }}>
                {/* Logo */}
                <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 16, fontWeight: 800, color: 'white',
                            boxShadow: '0 0 16px rgba(99,102,241,0.4)',
                        }}>K</div>
                        <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', color: '#f0f6fc' }}>
                            KIP Platform
                        </span>
                    </Link>
                </div>

                {/* Nav Items */}
                <nav style={{ padding: '12px 8px', flex: 1 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#484f58', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 12px 8px' }}>
                        Navigation
                    </p>
                    {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                        const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                        return (
                            <Link
                                key={href}
                                href={href}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                                    borderRadius: 8, margin: '1px 0', textDecoration: 'none',
                                    fontSize: 14, fontWeight: 500,
                                    background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                                    color: isActive ? '#818cf8' : '#8b949e',
                                    border: isActive ? '1px solid rgba(99,102,241,0.15)' : '1px solid transparent',
                                    transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                                        e.currentTarget.style.color = '#f0f6fc'
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent'
                                        e.currentTarget.style.color = '#8b949e'
                                    }
                                }}
                            >
                                <Icon size={16} />
                                {label}
                            </Link>
                        )
                    })}
                </nav>

                {/* User Section */}
                <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <div
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                            borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s ease',
                            background: userMenuOpen ? 'rgba(255,255,255,0.06)' : 'transparent',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = userMenuOpen ? 'rgba(255,255,255,0.06)' : 'transparent'}
                    >
                        <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                getInitials(`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'U')
                            )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#f0f6fc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}
                            </p>
                            <p style={{ fontSize: 11, color: '#484f58', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user?.email}
                            </p>
                        </div>
                        <ChevronDown size={14} color="#484f58" />
                    </div>

                    {userMenuOpen && (
                        <div style={{
                            background: '#161b22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
                            padding: 6, marginTop: 4, animation: 'fadeIn 0.15s ease',
                        }}>
                            <Link href="/dashboard/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, fontSize: 13, color: '#8b949e', textDecoration: 'none' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#f0f6fc' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8b949e' }}>
                                <Users size={14} /> Profile
                            </Link>
                            <Link href="/dashboard/settings" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, fontSize: 13, color: '#8b949e', textDecoration: 'none' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#f0f6fc' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8b949e' }}>
                                <Settings size={14} /> Settings
                            </Link>
                            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '4px 0' }} />
                            <button
                                onClick={async () => { await signOut(); router.push('/') }}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, fontSize: 13, color: '#f85149', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,81,73,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <LogOut size={14} /> Sign out
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main content */}
            <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {/* Top bar */}
                <header style={{
                    height: 60, borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 24px', background: '#0d1117', flexShrink: 0, position: 'sticky', top: 0, zIndex: 40,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontSize: 13, color: '#484f58' }}>
                            {NAV_ITEMS.find(n => n.href === pathname || (pathname.startsWith(n.href) && n.href !== '/dashboard'))?.label || 'Overview'}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }}>
                            <Bell size={16} />
                            <div style={{
                                position: 'absolute', top: 6, right: 6, width: 7, height: 7,
                                borderRadius: '50%', background: '#6366f1',
                            }} />
                        </button>
                        <Link href="/" className="btn btn-ghost" style={{ fontSize: 13, gap: 6 }}>
                            <Globe size={14} /> Visit site
                        </Link>
                    </div>
                </header>

                {/* Page content */}
                <div style={{ padding: 24, flex: 1 }}>
                    {children}
                </div>
            </main>
        </div>
    )
}
