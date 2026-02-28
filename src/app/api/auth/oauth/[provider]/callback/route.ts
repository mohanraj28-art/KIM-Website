import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createSession } from '@/lib/auth/auth'
import { OAuthProvider } from '@prisma/client'

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
    linkedin: {
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        userUrl: 'https://api.linkedin.com/v2/userinfo',
        clientId: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    },
    apple: {
        tokenUrl: 'https://appleid.apple.com/auth/token',
        userUrl: '',
        clientId: process.env.APPLE_CLIENT_ID,
        clientSecret: process.env.APPLE_CLIENT_SECRET,
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

        const accountId = 'default'

        // Ensure default account exists
        await prisma.account.upsert({
            where: { id: accountId },
            create: {
                id: accountId,
                name: 'Default',
                slug: accountId,
            },
            update: {}
        })

        const oauthProvider = provider.toUpperCase() as OAuthProvider

        // Find existing user or create new one
        let user = await prisma.user.findFirst({
            where: {
                email,
                accountId
            }
        })

        if (user) {
            // Update user and upsert social account
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    lastSignInAt: new Date(),
                    socialAccounts: {
                        upsert: {
                            where: {
                                provider_providerUserId: {
                                    provider: oauthProvider,
                                    providerUserId
                                }
                            },
                            create: {
                                provider: oauthProvider,
                                providerUserId,
                                accessToken: tokenData.access_token,
                                refreshToken: tokenData.refresh_token ?? null,
                            },
                            update: {
                                accessToken: tokenData.access_token,
                                refreshToken: tokenData.refresh_token ?? null,
                                updatedAt: new Date()
                            }
                        }
                    }
                }
            })
        } else {
            // Create new user with social account
            user = await prisma.user.create({
                data: {
                    email,
                    firstName: firstName || null,
                    lastName: lastName || null,
                    displayName: firstName || email.split('@')[0],
                    avatarUrl,
                    emailVerified: true,
                    accountId,
                    lastSignInAt: new Date(),
                    socialAccounts: {
                        create: {
                            provider: oauthProvider,
                            providerUserId,
                            accessToken: tokenData.access_token,
                            refreshToken: tokenData.refresh_token ?? null,
                        }
                    }
                }
            })
        }

        const ip = req.headers.get('x-forwarded-for') ?? undefined
        const ua = req.headers.get('user-agent') ?? undefined
        const sessionResult = await createSession(user.id, accountId, email, ip, ua)

        // Audit log
        await prisma.auditLog.create({
            data: {
                action: `user.signed_in.${provider}`,
                result: 'SUCCESS',
                ipAddress: ip,
                accountId: accountId,
                userId: user.id
            }
        })

        const response = NextResponse.redirect(new URL('/dashboard?oauth=success', process.env.NEXT_PUBLIC_APP_URL!))
        response.cookies.set('kaappu_token', sessionResult.accessToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 15,
            path: '/',
        })
        response.cookies.set('kaappu_refresh_token', sessionResult.refreshToken, {
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
