import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
    const payload = await getUserFromRequest(req)

    if (!payload) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: payload.sub },
            include: {
                mfaSettings: {
                    where: { verified: true },
                    select: { type: true, primary: true }
                },
                tenantMembers: {
                    include: {
                        tenant: true,
                        role: true
                    }
                }
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const mfaEnabled = user.mfaSettings.length > 0
        const primaryMember = user.tenantMembers[0]

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    displayName: user.displayName,
                    avatarUrl: user.avatarUrl,
                    emailVerified: user.emailVerified,
                    createdAt: user.createdAt,
                    lastSignInAt: user.lastSignInAt,
                    mfaEnabled,
                },
                tenant: primaryMember ? {
                    id: primaryMember.tenant.id,
                    name: primaryMember.tenant.name,
                    slug: primaryMember.tenant.slug,
                    logoUrl: primaryMember.tenant.logoUrl,
                    role: primaryMember.role?.key || 'member',
                } : null,
            },
        })
    } catch (error) {
        console.error('[Me API Error]:', error)
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
    }
}
