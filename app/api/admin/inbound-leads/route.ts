import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function computeStats() {
  const allStats = await sql`
    SELECT position_type, qualified, COUNT(*)::int as count
    FROM application_stats
    GROUP BY position_type, qualified
  `

  const qualifiedLeads = await sql`
    SELECT position_type, COUNT(*)::int as count
    FROM inbound_leads
    GROUP BY position_type
  `

  const qualifiedLeadMap: Record<string, number> = {}
  for (const row of qualifiedLeads) {
    qualifiedLeadMap[row.position_type] = row.count
  }

  const qualifiedStatCounts = await sql`
    SELECT position_type, COUNT(*)::int as cnt
    FROM application_stats
    WHERE qualified = true
    GROUP BY position_type
  `

  let totalTermsNotAccepted = 0
  const termsNotAcceptedByPosition: Record<string, number> = {}
  for (const stat of qualifiedStatCounts) {
    const leadCount = qualifiedLeadMap[stat.position_type] || 0
    const excess = stat.cnt - leadCount
    if (excess > 0) {
      termsNotAcceptedByPosition[stat.position_type] = excess
      totalTermsNotAccepted += excess
    }
  }

  const statsMap: Record<string, { attempted: number; qualified: number; failed: number; termsNotAccepted: number }> = {}

  for (const row of allStats) {
    if (!statsMap[row.position_type]) {
      statsMap[row.position_type] = { attempted: 0, qualified: 0, failed: 0, termsNotAccepted: 0 }
    }
    statsMap[row.position_type].attempted += row.count
    if (!row.qualified) {
      statsMap[row.position_type].failed += row.count
    }
  }

  for (const [pos, count] of Object.entries(qualifiedLeadMap)) {
    if (!statsMap[pos]) {
      statsMap[pos] = { attempted: count, qualified: 0, failed: 0, termsNotAccepted: 0 }
    }
    statsMap[pos].qualified = count
  }

  for (const [pos, count] of Object.entries(termsNotAcceptedByPosition)) {
    if (statsMap[pos]) {
      statsMap[pos].termsNotAccepted = count
    }
  }

  let totalAttempted = 0
  let totalQualified = 0
  let totalFailed = 0
  for (const key of Object.keys(statsMap)) {
    totalAttempted += statsMap[key].attempted
    totalQualified += statsMap[key].qualified
    totalFailed += statsMap[key].failed
  }

  return {
    byPosition: statsMap,
    total: {
      attempted: totalAttempted,
      qualified: totalQualified,
      failed: totalFailed,
      termsNotAccepted: totalTermsNotAccepted,
      passRate: totalAttempted > 0
        ? Math.round((totalQualified / totalAttempted) * 100)
        : 0
    }
  }
}

async function getTermsNotAccepted() {
  const qualifiedLeadMap: Record<string, number> = {}
  const leads = await sql`
    SELECT position_type, COUNT(*)::int as count FROM inbound_leads GROUP BY position_type
  `
  for (const row of leads) {
    qualifiedLeadMap[row.position_type] = row.count
  }

  const qualifiedStatCounts = await sql`
    SELECT position_type, COUNT(*)::int as cnt
    FROM application_stats WHERE qualified = true GROUP BY position_type
  `

  const results: { id: number; position_type: string; full_name: string | null; email: string | null; telegram_username: string | null; created_at: string }[] = []

  for (const stat of qualifiedStatCounts) {
    const leadCount = qualifiedLeadMap[stat.position_type] || 0
    const excess = stat.cnt - leadCount
    if (excess > 0) {
      const rows = await sql`
        SELECT id, position_type, full_name, email, telegram_username, created_at
        FROM application_stats
        WHERE qualified = true AND position_type = ${stat.position_type}
        ORDER BY created_at ASC
        LIMIT ${excess}
      `
      for (const r of rows) {
        results.push(r as typeof results[0])
      }
    }
  }

  return results
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
      const entries = await getTermsNotAccepted()
      return NextResponse.json({ termsNotAccepted: entries })
    }

    const leads = await sql`
      SELECT * FROM inbound_leads
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

    if (source === 'failed' || source === 'terms-not-accepted') {
      await sql`DELETE FROM application_stats WHERE id = ${id}`
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
