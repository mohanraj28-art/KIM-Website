import { NextRequest, NextResponse } from 'next/server'
import { runQuery } from '@/lib/db'
import { createSession } from '@/lib/auth/auth'
import { v4 as uuidv4 } from 'uuid'

const OAUTH_CONFIGS: Record<string, {
    tokenUrl: string
    userUrl: string
    clientId: string | undefined
    clientSecret: string | undefined
}> = {
    google: {
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    github: {
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userUrl: 'https://api.github.com/user',
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
    microsoft: {
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        userUrl: 'https://graph.microsoft.com/v1.0/me',
        clientId: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    },
    discord: {
        tokenUrl: 'https://discord.com/api/oauth2/token',
        userUrl: 'https://discord.com/api/users/@me',
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
    },
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    const { provider } = await params
    const config = OAUTH_CONFIGS[provider]
    if (!config || !config.clientId) {
        return NextResponse.redirect(new URL('/sign-in?error=provider_not_configured', process.env.NEXT_PUBLIC_APP_URL!))
    }

    const { searchParams } = req.nextUrl
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const savedState = req.cookies.get('oauth_state')?.value

    if (!code || !state || state !== savedState) {
        return NextResponse.redirect(new URL('/sign-in?error=invalid_state', process.env.NEXT_PUBLIC_APP_URL!))
    }

    try {
        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/${provider}/callback`

        // Exchange code for token
        const tokenRes = await fetch(config.tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
            body: new URLSearchParams({
                code,
                client_id: config.clientId!,
                client_secret: config.clientSecret!,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        })

        const tokenData = await tokenRes.json()
        if (!tokenData.access_token) {
            return NextResponse.redirect(new URL('/sign-in?error=token_exchange_failed', process.env.NEXT_PUBLIC_APP_URL!))
        }

        // Fetch provider user info
        const userRes = await fetch(config.userUrl, {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        })
        const providerUser = await userRes.json()

        const email = (providerUser.email || providerUser.mail || '').toLowerCase()
        const providerUserId = String(providerUser.id || providerUser.sub || '')
        const firstName = providerUser.given_name || providerUser.name?.split(' ')[0] || ''
        const lastName = providerUser.family_name || providerUser.name?.split(' ').slice(1).join(' ') || ''
        const avatarUrl = providerUser.picture || providerUser.avatar_url || null

        if (!email) {
            return NextResponse.redirect(new URL('/sign-in?error=no_email', process.env.NEXT_PUBLIC_APP_URL!))
        }

        const tenantId = 'default'
        const now = new Date().toISOString()

        // Ensure default tenant node
        await runQuery(
            `MERGE (t:Tenant {id: $tenantId})
             ON CREATE SET t.name = 'Default', t.slug = $tenantId, t.createdAt = $now`,
            { tenantId, now }
        )

        // Find existing user or create new one
        const existingResult = await runQuery(
            `MATCH (u:User {email: $email})-[:BELONGS_TO]->(:Tenant {id: $tenantId})
             RETURN u LIMIT 1`,
            { email, tenantId }
        )

        let userId: string
        if (existingResult.records.length > 0) {
            userId = existingResult.records[0].get('u').properties.id

            // Upsert social account node
            await runQuery(
                `MATCH (u:User {id: $userId})
                 MERGE (u)-[:HAS_SOCIAL]->(sa:SocialAccount {provider: $provider})
                 ON CREATE SET
                     sa.id = $saId,
                     sa.providerUserId = $providerUserId,
                     sa.accessToken = $accessToken,
                     sa.refreshToken = $refreshToken,
                     sa.createdAt = $now
                 ON MATCH SET
                     sa.providerUserId = $providerUserId,
                     sa.accessToken = $accessToken,
                     sa.updatedAt = $now`,
                {
                    userId, saId: uuidv4(), provider: provider.toUpperCase(),
                    providerUserId, accessToken: tokenData.access_token,
                    refreshToken: tokenData.refresh_token ?? null, now
                }
            )
        } else {
            // Create new user with social account
            userId = uuidv4()
            await runQuery(
                `MATCH (t:Tenant {id: $tenantId})
                 CREATE (u:User {
                     id: $userId,
                     email: $email,
                     firstName: $firstName,
                     lastName: $lastName,
                     displayName: $displayName,
                     avatarUrl: $avatarUrl,
                     emailVerified: true,
                     banned: false,
                     locked: false,
                     createdAt: $now,
                     updatedAt: $now
                 })-[:BELONGS_TO]->(t)
                 CREATE (u)-[:HAS_SOCIAL]->(sa:SocialAccount {
                     id: $saId,
                     provider: $provider,
                     providerUserId: $providerUserId,
                     accessToken: $accessToken,
                     refreshToken: $refreshToken,
                     createdAt: $now
                 })`,
                {
                    tenantId, userId, email,
                    firstName: firstName || null, lastName: lastName || null,
                    displayName: firstName || email.split('@')[0],
                    avatarUrl, now, saId: uuidv4(),
                    provider: provider.toUpperCase(),
                    providerUserId, accessToken: tokenData.access_token,
                    refreshToken: tokenData.refresh_token ?? null,
                }
            )
        }

        // Update last sign in
        await runQuery(
            `MATCH (u:User {id: $userId}) SET u.lastSignInAt = $now`,
            { userId, now }
        )

        const ip = req.headers.get('x-forwarded-for') ?? undefined
        const ua = req.headers.get('user-agent') ?? undefined
        const { accessToken, refreshToken } = await createSession(userId, tenantId, email, ip, ua)

        // Audit log
        await runQuery(
            `MATCH (u:User {id: $userId})
             CREATE (a:AuditLog {
                 id: $id, action: $action, result: 'SUCCESS',
                 ipAddress: $ip, tenantId: $tenantId, createdAt: $now
             })<-[:HAS_AUDIT_LOG]-(u)`,
            { id: uuidv4(), userId, action: `user.signed_in.${provider}`, ip: ip ?? null, tenantId, now }
        )

        const response = NextResponse.redirect(new URL('/dashboard?oauth=success', process.env.NEXT_PUBLIC_APP_URL!))
        response.cookies.set('kip_token', accessToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 15,
            path: '/',
        })
        response.cookies.set('kip_refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
        })
        response.cookies.delete('oauth_state')

        return response
    } catch (error) {
        console.error('OAuth callback error:', error)
        return NextResponse.redirect(new URL('/sign-in?error=oauth_failed', process.env.NEXT_PUBLIC_APP_URL!))
    }
}
