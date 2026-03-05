import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

    await sql`
      WITH ranked AS (
        SELECT id,
               ROW_NUMBER() OVER (
                 PARTITION BY telegram_username, email, simulation_type
                 ORDER BY overall_score DESC
               ) as rn
        FROM simulation_reports
      ),
      keep_ids AS (
        SELECT id FROM ranked WHERE rn <= 3
      )
      DELETE FROM simulation_reports
      WHERE completed_at < ${tenDaysAgo.toISOString()}
        AND id NOT IN (SELECT id FROM keep_ids)
    `

    return NextResponse.json({ success: true, message: 'Cleanup completed' })
  } catch (error) {
    console.error('Simulation cleanup error:', error)
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
  }
}
