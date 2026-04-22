import { NextResponse } from 'next/server'
import { sql, initDatabase } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type PositionRow = { position_type: string; is_open: boolean }

async function fetchStatus() {
  const rows = (await sql`
    SELECT position_type, is_open FROM position_status
  `) as PositionRow[]

  const result = { backend: true, marketing: true }
  for (const row of rows) {
    if (row.position_type === 'backend') result.backend = row.is_open
    if (row.position_type === 'marketing') result.marketing = row.is_open
  }
  return result
}

export async function GET() {
  try {
    try {
      const status = await fetchStatus()
      return NextResponse.json(status, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      })
    } catch (firstErr) {
      // Table may not exist yet — auto-init the DB then retry once
      await initDatabase()
      const status = await fetchStatus()
      return NextResponse.json(status, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      })
    }
  } catch (error) {
    console.error('Error fetching position status:', error)
    // Fail open: if DB is unreachable, assume both open so we don't block applicants
    return NextResponse.json({ backend: true, marketing: true })
  }
}
