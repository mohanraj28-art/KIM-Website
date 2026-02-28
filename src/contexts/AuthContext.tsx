'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

export interface User {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    displayName: string | null
    avatarUrl: string | null
    emailVerified: boolean
    mfaEnabled: boolean
    createdAt: string
    lastSignInAt: string | null
}

export interface Tenant {
    id: string
    name: string
    slug: string
    logoUrl: string | null
    role: string
}

interface AuthContextType {
    user: User | null
    tenant: Tenant | null // formerly organization
    isLoaded: boolean
    isSignedIn: boolean
    accessToken: string | null
    signIn: (email: string, password: string) => Promise<void>
    signUp: (data: SignUpData) => Promise<void>
    signOut: () => Promise<void>
    switchTenant: (tenantId: string) => void
    refreshUser: () => Promise<void>
}

interface SignUpData {
    email: string
    password: string
    firstName?: string
    lastName?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEFAULT_ACCOUNT_ID = 'default' // In production, resolve from domain

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [tenant, setTenant] = useState<Tenant | null>(null)
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [isLoaded, setIsLoaded] = useState(false)

    const refreshUser = useCallback(async () => {
        const token = localStorage.getItem('kaappu_token')
        if (!token) {
            setIsLoaded(true)
            return
        }

        try {
            const res = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                setUser(data.data.user)
                setAccessToken(token)
                if (data.data.tenant) {
                    setTenant(data.data.tenant)
                }
            } else {
                localStorage.removeItem('kaappu_token')
                localStorage.removeItem('kaappu_refresh_token')
            }
        } catch {
            // Silently fail
        } finally {
            setIsLoaded(true)
        }
    }, [])

    useEffect(() => {
        refreshUser()
    }, [refreshUser])

    const signIn = async (email: string, password: string) => {
        const res = await fetch('/api/auth/sign-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, accountId: DEFAULT_ACCOUNT_ID }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)

        localStorage.setItem('kaappu_token', data.data.accessToken)
        localStorage.setItem('kaappu_refresh_token', data.data.refreshToken)
        setUser(data.data.user)
        setAccessToken(data.data.accessToken)
    }

    const signUp = async (formData: SignUpData) => {
        const res = await fetch('/api/auth/sign-up', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, accountId: DEFAULT_ACCOUNT_ID }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)

        localStorage.setItem('kaappu_token', data.data.accessToken)
        localStorage.setItem('kaappu_refresh_token', data.data.refreshToken)
        setUser(data.data.user)
        setAccessToken(data.data.accessToken)
    }

    const signOut = async () => {
        const token = localStorage.getItem('kaappu_token')
        if (token) {
            await fetch('/api/auth/sign-out', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            }).catch(() => { })
        }
        localStorage.removeItem('kaappu_token')
        localStorage.removeItem('kaappu_refresh_token')
        setUser(null)
        setAccessToken(null)
        setTenant(null)
    }

    const switchTenant = (tenantId: string) => {
        // Fetch tenant info and set
        fetch(`/api/tenants/${tenantId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
            .then(r => r.json())
            .then(data => setTenant(data.data))
            .catch(() => { })
    }

    return (
        <AuthContext.Provider value={{
            user,
            tenant,
            isLoaded,
            isSignedIn: !!user,
            accessToken,
            signIn,
            signUp,
            signOut,
            switchTenant,
            refreshUser,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
