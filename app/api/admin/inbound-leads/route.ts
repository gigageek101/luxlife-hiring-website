import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

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

    return NextResponse.json({
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
  } catch (error) {
    console.error('Error fetching inbound leads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
