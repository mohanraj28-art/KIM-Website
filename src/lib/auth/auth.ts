import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt'
import { isDisposableEmail } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
}

export function getPasswordStrength(password: string): number {
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++
    return Math.min(score, 5)
}

export interface SignUpInput {
    email: string
    password?: string
    firstName?: string
    lastName?: string
    accountId: string // formerly tenantId
}

export interface AuthResult {
    user: {
        id: string
        email: string
        firstName: string | null
        lastName: string | null
        avatarUrl: string | null
        emailVerified: boolean
    }
    accessToken: string
    refreshToken: string
    sessionId: string
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGN UP
// ─────────────────────────────────────────────────────────────────────────────
export async function signUpWithPassword(
    input: SignUpInput,
    ipAddress?: string,
    userAgent?: string
): Promise<AuthResult> {
    const { email, password, firstName, lastName, accountId } = input

    if (isDisposableEmail(email)) {
        throw new Error('Disposable email addresses are not allowed')
    }

    if (password) {
        const strength = getPasswordStrength(password)
        if (strength < 3) {
            throw new Error('Password is too weak. Use at least 8 characters with mixed case and numbers.')
        }
    }

    // Check if user already exists in this account
    const existingUser = await prisma.user.findFirst({
        where: {
            email,
            accountId
        }
    })

    if (existingUser) {
        throw new Error('An account with this email already exists')
    }

    const displayName = firstName ? `${firstName} ${lastName || ''}`.trim() : email.split('@')[0]

    // Create user and password together (atomic)
    const newUser = await prisma.user.create({
        data: {
            email,
            firstName,
            lastName,
            displayName,
            accountId,
            emailVerified: false,
            passwords: password ? {
                create: {
                    hash: await hashPassword(password),
                    strength: getPasswordStrength(password)
                }
            } : undefined
        }
    })

    const { accessToken, refreshToken, sessionId } = await createSession(
        newUser.id,
        accountId,
        email,
        ipAddress,
        userAgent
    )

    return {
        user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            avatarUrl: newUser.avatarUrl,
            emailVerified: newUser.emailVerified
        },
        accessToken,
        refreshToken,
        sessionId,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGN IN
// ─────────────────────────────────────────────────────────────────────────────
export async function signInWithPassword(
    email: string,
    password: string,
    accountId: string, // formerly tenantId
    ipAddress?: string,
    userAgent?: string
): Promise<AuthResult> {
    const user = await prisma.user.findFirst({
        where: { email },
        include: {
            passwords: {
                orderBy: { createdAt: 'desc' },
                take: 1
            },
            account: true
        }
    })

    if (!user) {
        console.log('[SignIn] User not found during sign-in:', email);
        throw new Error('Invalid email or password')
    }

    // If the user exists but isn't linked to this account yet, link them now
    if (user.accountId !== accountId) {
        // In this multi-account model, a user belongs to one account. 
        throw new Error('Invalid email or password for this workspace')
    }

    const passwordRecord = user.passwords[0]
    if (!passwordRecord) {
        console.log('[SignIn] No password hash found for user:', email);
        throw new Error('Invalid email or password')
    }

    if (user.banned) {
        throw new Error('Your account has been suspended. Please contact support.')
    }
    if (user.locked) {
        throw new Error('Your account is temporarily locked. Please try again later.')
    }

    const isValid = await verifyPassword(password, passwordRecord.hash)
    if (!isValid) {
        console.log('[SignIn] Password mismatch for user:', email);
        throw new Error('Invalid email or password')
    }

    // Update last sign in info
    await prisma.user.update({
        where: { id: user.id },
        data: {
            lastSignInAt: new Date(),
            lastSignInIp: ipAddress
        }
    })

    const { accessToken, refreshToken, sessionId } = await createSession(
        user.id,
        accountId,
        email,
        ipAddress,
        userAgent
    )

    return {
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
            emailVerified: user.emailVerified,
        },
        accessToken,
        refreshToken,
        sessionId,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SESSION MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
export async function createSession(
    userId: string,
    accountId: string,
    email: string,
    ipAddress?: string,
    userAgent?: string
): Promise<{ accessToken: string; refreshToken: string; sessionId: string }> {
    const sessionToken = uuidv4()
    const refreshTokenStr = uuidv4()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const session = await prisma.session.create({
        data: {
            userId,
            accountId,
            token: sessionToken,
            refreshToken: refreshTokenStr,
            ipAddress,
            userAgent,
            expiresAt,
            active: true
        }
    })

    const accessToken = await signAccessToken({ sub: userId, tid: accountId, email, sid: session.id })
    const refreshToken = await signRefreshToken({ sub: userId, tid: accountId, sid: session.id })

    return { accessToken, refreshToken, sessionId: session.id }
}

export async function revokeSession(sessionId: string): Promise<void> {
    await prisma.session.update({
        where: { id: sessionId },
        data: {
            active: false,
            revokedAt: new Date()
        }
    })
}

export async function revokeAllSessions(userId: string): Promise<void> {
    await prisma.session.updateMany({
        where: { userId, active: true },
        data: {
            active: false,
            revokedAt: new Date()
        }
    })
}
