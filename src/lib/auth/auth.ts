import bcrypt from 'bcryptjs'
import { runQuery, runTransaction, toPlain } from '@/lib/db'
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt'
import { generateSlug, isDisposableEmail } from '@/lib/utils'
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
    tenantId: string
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
    const { email, password, firstName, lastName, tenantId } = input

    if (isDisposableEmail(email)) {
        throw new Error('Disposable email addresses are not allowed')
    }

    if (password) {
        const strength = getPasswordStrength(password)
        if (strength < 3) {
            throw new Error('Password is too weak. Use at least 8 characters with mixed case and numbers.')
        }
    }

    // Check if user already exists
    const existingResult = await runQuery(
        `MATCH (u:User {email: $email})-[:BELONGS_TO]->(:Tenant {id: $tenantId})
         RETURN u.id AS id LIMIT 1`,
        { email, tenantId }
    )
    if (existingResult.records.length > 0) {
        throw new Error('An account with this email already exists')
    }

    const userId = uuidv4()
    const displayName = firstName ? `${firstName} ${lastName || ''}`.trim() : email.split('@')[0]
    const now = new Date().toISOString()

    // Create user + password in one transaction
    const queries: Array<{ cypher: string; params: Record<string, unknown> }> = [
        {
            cypher: `
                MATCH (t:Tenant {id: $tenantId})
                CREATE (u:User {
                    id: $userId,
                    email: $email,
                    firstName: $firstName,
                    lastName: $lastName,
                    displayName: $displayName,
                    avatarUrl: null,
                    emailVerified: false,
                    banned: false,
                    locked: false,
                    lastSignInAt: null,
                    lastSignInIp: null,
                    createdAt: $now,
                    updatedAt: $now
                })-[:BELONGS_TO]->(t)
                RETURN u`,
            params: { tenantId, userId, email, firstName: firstName ?? null, lastName: lastName ?? null, displayName, now },
        },
    ]


    if (password) {
        const hash = await hashPassword(password)
        const pwId = uuidv4()
        queries.push({
            cypher: `
                MATCH (u:User {id: $userId})
                CREATE (p:Password {
                    id: $pwId,
                    hash: $hash,
                    strength: $strength,
                    createdAt: $now
                })<-[:HAS_PASSWORD]-(u)`,
            params: { userId, pwId, hash, strength: getPasswordStrength(password), now },
        })
    }

    await runTransaction(queries)

    const { accessToken, refreshToken, sessionId } = await createSession(
        userId,
        tenantId,
        email,
        ipAddress,
        userAgent
    )

    return {
        user: { id: userId, email, firstName: firstName ?? null, lastName: lastName ?? null, avatarUrl: null, emailVerified: false },
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
    tenantId: string,
    ipAddress?: string,
    userAgent?: string
): Promise<AuthResult> {
    const result = await runQuery(
        `MATCH (u:User {email: $email})
         OPTIONAL MATCH (u)-[:BELONGS_TO]->(t:Tenant)
         OPTIONAL MATCH (u)-[:HAS_PASSWORD]->(p:Password)
         RETURN u, p.hash AS relPasswordHash, u.passwordHash AS propPasswordHash, t.id AS tenantId
         ORDER BY p.createdAt DESC
         LIMIT 1`,
        { email, tenantId }
    )

    if (result.records.length === 0) {
        console.log('[SignIn] User not found during sign-in:', email);
        throw new Error('Invalid email or password')
    }

    const record = result.records[0]
    const user = record.get('u').properties
    const passwordHash = record.get('relPasswordHash') || record.get('propPasswordHash')
    const userTenantId = record.get('tenantId')

    // If the user exists but isn't linked to this tenant yet, link them now
    // (Common for the default admin created by the Java backend)
    if (userTenantId !== tenantId) {
        await runQuery(
            `MATCH (u:User {id: $userId}), (t:Tenant {id: $tenantId})
             MERGE (u)-[:BELONGS_TO]->(t)`,
            { userId: user.id, tenantId }
        )
    }

    if (!passwordHash) {
        console.log('[SignIn] No password hash found for user:', email);
        throw new Error('Invalid email or password')
    }
    if (user.banned) {
        throw new Error('Your account has been suspended. Please contact support.')
    }
    if (user.locked) {
        throw new Error('Your account is temporarily locked. Please try again later.')
    }

    const isValid = await verifyPassword(password, passwordHash)
    if (!isValid) {
        console.log('[SignIn] Password mismatch for user:', email);
        throw new Error('Invalid email or password')
    }
    console.log('[SignIn] Successful match for user:', email);

    const now = new Date().toISOString()
    await runQuery(
        `MATCH (u:User {id: $userId})
         SET u.lastSignInAt = $now, u.lastSignInIp = $ip, u.updatedAt = $now`,
        { userId: user.id, now, ip: ipAddress ?? null }
    )

    const { accessToken, refreshToken, sessionId } = await createSession(
        user.id,
        tenantId,
        email,
        ipAddress,
        userAgent
    )

    return {
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName ?? null,
            lastName: user.lastName ?? null,
            avatarUrl: user.avatarUrl ?? null,
            emailVerified: user.emailVerified ?? false,
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
    tenantId: string,
    email: string,
    ipAddress?: string,
    userAgent?: string
): Promise<{ accessToken: string; refreshToken: string; sessionId: string }> {
    const sessionId = uuidv4()
    const sessionToken = uuidv4()
    const refreshTokenStr = uuidv4()
    const now = new Date().toISOString()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    await runQuery(
        `MATCH (u:User {id: $userId})
         CREATE (s:Session {
             id: $sessionId,
             token: $token,
             refreshToken: $refreshToken,
             tenantId: $tenantId,
             ipAddress: $ipAddress,
             userAgent: $userAgent,
             active: true,
             expiresAt: $expiresAt,
             lastActiveAt: $now,
             createdAt: $now
         })<-[:HAS_SESSION]-(u)`,
        { userId, sessionId, token: sessionToken, refreshToken: refreshTokenStr, tenantId, ipAddress: ipAddress ?? null, userAgent: userAgent ?? null, expiresAt, now }
    )

    const accessToken = await signAccessToken({ sub: userId, tid: tenantId, email, sid: sessionId })
    const refreshToken = await signRefreshToken({ sub: userId, tid: tenantId, sid: sessionId })

    return { accessToken, refreshToken, sessionId }
}

export async function revokeSession(sessionId: string): Promise<void> {
    const now = new Date().toISOString()
    await runQuery(
        `MATCH (s:Session {id: $sessionId})
         SET s.active = false, s.revokedAt = $now`,
        { sessionId, now }
    )
}

export async function revokeAllSessions(userId: string): Promise<void> {
    const now = new Date().toISOString()
    await runQuery(
        `MATCH (u:User {id: $userId})-[:HAS_SESSION]->(s:Session {active: true})
         SET s.active = false, s.revokedAt = $now`,
        { userId, now }
    )
}
