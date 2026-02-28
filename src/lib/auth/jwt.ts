import { jwtVerify, SignJWT } from 'jose'
import { NextRequest } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'kip-dev-secret-change-in-production'
)
const JWT_REFRESH_SECRET = new TextEncoder().encode(
    process.env.JWT_REFRESH_SECRET || 'kip-dev-refresh-secret-change-in-production'
)



export interface JWTPayload {
    sub: string       // User ID
    tid: string       // Tenant ID
    email: string
    sid: string       // Session ID
    iat?: number
    exp?: number
}

export interface RefreshTokenPayload {
    sub: string
    tid: string
    sid: string
    iat?: number
    exp?: number
}

export async function signAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(process.env.JWT_EXPIRES_IN || '15m')
        .sign(JWT_SECRET)
}

export async function signRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(process.env.JWT_REFRESH_EXPIRES_IN || '30d')
        .sign(JWT_REFRESH_SECRET)
}

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        return payload as unknown as JWTPayload
    } catch (err: any) {
        console.error(`[JWT] Verification failed: ${err.message}`);
        return null
    }
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET)
        return payload as unknown as RefreshTokenPayload
    } catch {
        return null
    }
}

export function getTokenFromRequest(req: NextRequest): string | null {
    // Check Authorization header first
    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice(7)
    }

    // Check cookie
    const cookieToken = req.cookies.get('kaappu_token')?.value
    if (cookieToken) return cookieToken

    // Debug: Log all cookie names if token is missing
    const allCookieNames = req.cookies.getAll().map(c => c.name)
    console.log(`[JWT] No token found in request. Cookies present: ${allCookieNames.join(', ') || 'none'}`);

    return null
}

export async function getUserFromRequest(req: NextRequest): Promise<JWTPayload | null> {
    const token = getTokenFromRequest(req)
    if (!token) return null
    return await verifyAccessToken(token)
}
