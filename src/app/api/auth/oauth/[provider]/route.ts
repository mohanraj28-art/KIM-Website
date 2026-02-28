import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'


// Supported OAuth providers configuration
const OAUTH_CONFIGS: Record<string, {
    authUrl: string
    tokenUrl: string
    userUrl: string
    clientId: string | undefined
    clientSecret: string | undefined
    scope: string
}> = {
    google: {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        scope: 'openid email profile',
    },
    github: {
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userUrl: 'https://api.github.com/user',
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        scope: 'user:email read:user',
    },
    microsoft: {
        authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        userUrl: 'https://graph.microsoft.com/v1.0/me',
        clientId: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        scope: 'openid email profile User.Read',
    },
    linkedin: {
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        userUrl: 'https://api.linkedin.com/v2/userinfo',
        clientId: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        scope: 'openid email profile',
    },
    apple: {
        authUrl: 'https://appleid.apple.com/auth/authorize',
        tokenUrl: 'https://appleid.apple.com/auth/token',
        userUrl: '', // Apple uses id_token instead of a userUrl
        clientId: process.env.APPLE_CLIENT_ID,
        clientSecret: process.env.APPLE_CLIENT_SECRET,
        scope: 'name email',
    },
    discord: {
        authUrl: 'https://discord.com/api/oauth2/authorize',
        tokenUrl: 'https://discord.com/api/oauth2/token',
        userUrl: 'https://discord.com/api/users/@me',
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        scope: 'identify email',
    },
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    const { provider } = await params
    const config = OAUTH_CONFIGS[provider]

    if (!config || !config.clientId) {
        return NextResponse.json({ error: `Provider '${provider}' not configured` }, { status: 400 })
    }

    const state = uuidv4()
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/${provider}/callback`

    const url = new URL(config.authUrl)
    url.searchParams.set('client_id', config.clientId)
    url.searchParams.set('redirect_uri', redirectUri)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', config.scope)
    url.searchParams.set('state', state)

    const response = NextResponse.redirect(url.toString())
    response.cookies.set('oauth_state', state, { httpOnly: true, maxAge: 600, sameSite: 'lax' })
    return response
}
