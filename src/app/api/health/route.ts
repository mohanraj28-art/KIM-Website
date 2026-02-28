import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
    try {
        await prisma.$queryRaw`SELECT 1 as ping`
        return NextResponse.json({ status: 'ok', database: 'postgresql', connected: true })
    } catch (error) {
        console.error('[health] Database error:', error)
        return NextResponse.json({
            status: 'error',
            database: 'postgresql',
            connected: false,
            error: String(error)
        }, { status: 500 })
    }
}
