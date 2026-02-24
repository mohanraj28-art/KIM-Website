import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'

const PUBLIC_PATHS = ['/', '/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/accept-invitation', '/verify-email']
const AUTH_PATHS = ['/sign-in', '/sign-up']
const API_AUTH_PATHS = ['/api/auth/sign-in', '/api/auth/sign-up', '/api/auth/magic-link', '/api/auth/reset-password']

export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl

    // Skip static files
    if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
        return NextResponse.next()
    }

    // Skip public API routes (Stripe webhooks, etc.)
    if (pathname.startsWith('/api/billing/webhooks')) {
        return NextResponse.next()
    }

    // Allow auth API routes
    if (API_AUTH_PATHS.some(p => pathname.startsWith(p))) {
        return NextResponse.next()
    }

    const user = await getUserFromRequest(req)
    console.log(`[Proxy] ${pathname} - User: ${user ? 'Authenticated' : 'Logged out'}`);
    if (!user) {
        const hasToken = req.cookies.has('kip_token')
        console.log(`[Proxy] Cookie 'kip_token' found: ${hasToken}`);
    }

    // Redirect logged-in users away from auth pages
    if (AUTH_PATHS.some(p => pathname.startsWith(p)) && user) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Protect dashboard routes
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/users') || pathname.startsWith('/api/organizations')) {
        if (!user) {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
            const url = new URL('/sign-in', req.url)
            url.searchParams.set('redirect', pathname)
            return NextResponse.redirect(url)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
