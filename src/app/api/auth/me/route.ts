import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/jwt'
import { runQuery } from '@/lib/db'

export async function GET(req: NextRequest) {
    const payload = await getUserFromRequest(req)

    if (!payload) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const result = await runQuery(
            `MATCH (u:User {id: $userId})
             OPTIONAL MATCH (u)-[:HAS_MFA]->(m:MfaSetting {verified: true})
             OPTIONAL MATCH (u)-[:IS_MEMBER]->(org:Organization)
             OPTIONAL MATCH (u)-[:IS_MEMBER]->(org)-[:HAS_ROLE]->(r:Role)
             RETURN u,
                    collect(DISTINCT {type: m.type, primary: m.primary}) AS mfaSettings,
                    collect(DISTINCT {
                        id: org.id, name: org.name, slug: org.slug,
                        logoUrl: org.logoUrl, role: r.key
                    }) AS organizations`,
            { userId: payload.sub }
        )

        if (result.records.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const rec = result.records[0]
        const u = rec.get('u').properties
        const mfaSettings = (rec.get('mfaSettings') as Array<{ type: string; primary: boolean }>)
            .filter(m => m.type !== null)
        const organizations = (rec.get('organizations') as Array<{ id: string; name: string; slug: string; logoUrl: string | null; role: string | null }>)
            .filter(o => o.id !== null)

        const mfaEnabled = mfaSettings.length > 0

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: u.id,
                    email: u.email,
                    firstName: u.firstName ?? null,
                    lastName: u.lastName ?? null,
                    displayName: u.displayName ?? null,
                    avatarUrl: u.avatarUrl ?? null,
                    emailVerified: u.emailVerified ?? false,
                    createdAt: u.createdAt,
                    lastSignInAt: u.lastSignInAt ?? null,
                    mfaEnabled,
                },
                organization: organizations[0] ? {
                    id: organizations[0].id,
                    name: organizations[0].name,
                    slug: organizations[0].slug,
                    logoUrl: organizations[0].logoUrl,
                    role: organizations[0].role || 'member',
                } : null,
            },
        })
    } catch {
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
    }
}
