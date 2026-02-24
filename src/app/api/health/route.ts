import { NextResponse } from 'next/server'
import { runQuery } from '@/lib/db'

export async function GET() {
    try {
        const result = await runQuery('RETURN 1 AS ping', {})
        const ping = result.records[0]?.get('ping')
        return NextResponse.json({ status: 'ok', neo4j: 'connected', ping: String(ping) })
    } catch (error) {
        console.error('[health] Neo4j error:', error)
        return NextResponse.json({
            status: 'error',
            neo4j: 'failed',
            error: String(error),
            uri: process.env.NEO4J_URI,
            user: process.env.NEO4J_USERNAME,
        }, { status: 500 })
    }
}
