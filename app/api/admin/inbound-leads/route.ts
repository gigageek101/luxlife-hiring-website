import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function computeStats() {
  const failedStats = await sql`
    SELECT position_type, COUNT(*)::int as count
    FROM application_stats
    WHERE qualified = false
    GROUP BY position_type
  `

  const qualifiedLeads = await sql`
    SELECT position_type, terms_accepted, COUNT(*)::int as count
    FROM inbound_leads
    GROUP BY position_type, terms_accepted
  `

  const statsMap: Record<string, { attempted: number; qualified: number; failed: number; termsNotAccepted: number }> = {}

  for (const row of failedStats) {
    if (!statsMap[row.position_type]) {
      statsMap[row.position_type] = { attempted: 0, qualified: 0, failed: 0, termsNotAccepted: 0 }
    }
    statsMap[row.position_type].failed += row.count
    statsMap[row.position_type].attempted += row.count
  }

  for (const row of qualifiedLeads) {
    if (!statsMap[row.position_type]) {
      statsMap[row.position_type] = { attempted: 0, qualified: 0, failed: 0, termsNotAccepted: 0 }
    }
    statsMap[row.position_type].attempted += row.count
    if (row.terms_accepted) {
      statsMap[row.position_type].qualified += row.count
    } else {
      statsMap[row.position_type].termsNotAccepted += row.count
    }
  }

  let totalAttempted = 0
  let totalQualified = 0
  let totalFailed = 0
  let totalTermsNA = 0
  for (const key of Object.keys(statsMap)) {
    totalAttempted += statsMap[key].attempted
    totalQualified += statsMap[key].qualified
    totalFailed += statsMap[key].failed
    totalTermsNA += statsMap[key].termsNotAccepted
  }

  return {
    byPosition: statsMap,
    total: {
      attempted: totalAttempted,
      qualified: totalQualified,
      failed: totalFailed,
      termsNotAccepted: totalTermsNA,
      passRate: totalAttempted > 0
        ? Math.round((totalQualified / totalAttempted) * 100)
        : 0
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (type === 'failed') {
      const failedAttempts = await sql`
        SELECT id, position_type, full_name, email, failed_step, failed_reason, created_at
        FROM application_stats
        WHERE qualified = false AND full_name IS NOT NULL
        ORDER BY created_at DESC
      `
      return NextResponse.json({ failedAttempts })
    }

    if (type === 'terms-not-accepted') {
      const entries = await sql`
        SELECT * FROM inbound_leads
        WHERE terms_accepted = false
        ORDER BY created_at DESC
      `
      return NextResponse.json({ termsNotAccepted: entries })
    }

    const leads = await sql`
      SELECT * FROM inbound_leads
      WHERE terms_accepted = true
      ORDER BY created_at DESC
    `

    const statsData = await computeStats()

    const response = NextResponse.json({ leads, stats: statsData })
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
    const { id, source } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    if (source === 'failed') {
      await sql`DELETE FROM application_stats WHERE id = ${id}`
      const stats = await computeStats()
      return NextResponse.json({ success: true, stats })
    }

    if (source === 'terms-not-accepted') {
      const lead = await sql`SELECT position_type FROM inbound_leads WHERE id = ${id}`
      await sql`DELETE FROM inbound_leads WHERE id = ${id}`
      if (lead.length > 0) {
        await sql`
          DELETE FROM application_stats WHERE id = (
            SELECT id FROM application_stats
            WHERE position_type = ${lead[0].position_type} AND qualified = true
            LIMIT 1
          )
        `
      }
      const stats = await computeStats()
      return NextResponse.json({ success: true, stats })
    }

    const lead = await sql`
      SELECT position_type, qualified FROM inbound_leads WHERE id = ${id}
    `
    if (lead.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const { position_type, qualified } = lead[0]

    await sql`DELETE FROM inbound_leads WHERE id = ${id}`

    await sql`
      DELETE FROM application_stats
      WHERE id = (
        SELECT id FROM application_stats
        WHERE position_type = ${position_type} AND qualified = ${qualified}
        LIMIT 1
      )
    `

    const stats = await computeStats()
    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error('Error deleting lead:', error)
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
  }
}
