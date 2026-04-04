import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const leads = await sql`
      SELECT * FROM inbound_leads
      ORDER BY created_at DESC
    `

    const stats = await sql`
      SELECT
        position_type,
        qualified,
        COUNT(*)::int as count
      FROM application_stats
      GROUP BY position_type, qualified
    `

    const statsMap: Record<string, { attempted: number; qualified: number; failed: number }> = {}

    for (const row of stats) {
      if (!statsMap[row.position_type]) {
        statsMap[row.position_type] = { attempted: 0, qualified: 0, failed: 0 }
      }
      if (row.qualified) {
        statsMap[row.position_type].qualified += row.count
      } else {
        statsMap[row.position_type].failed += row.count
      }
      statsMap[row.position_type].attempted += row.count
    }

    let totalAttempted = 0
    let totalQualified = 0
    let totalFailed = 0
    for (const key of Object.keys(statsMap)) {
      totalAttempted += statsMap[key].attempted
      totalQualified += statsMap[key].qualified
      totalFailed += statsMap[key].failed
    }

    const response = NextResponse.json({
      leads,
      stats: {
        byPosition: statsMap,
        total: {
          attempted: totalAttempted,
          qualified: totalQualified,
          failed: totalFailed,
          passRate: totalAttempted > 0
            ? Math.round((totalQualified / totalAttempted) * 100)
            : 0
        }
      }
    })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    return response
  } catch (error) {
    console.error('Error fetching inbound leads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 })
    }
    await sql`DELETE FROM inbound_leads WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting lead:', error)
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
  }
}
