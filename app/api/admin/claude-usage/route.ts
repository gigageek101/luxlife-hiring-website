import { NextRequest, NextResponse } from 'next/server'
import { CLAUDE_CHAT_SETTINGS, CLAUDE_MODEL } from '@/lib/claude'
import { callClaude } from '@/lib/claude-server'
import { ensureTrackingTables, getAppStatus, getSql } from '@/lib/tracking-db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/** Cost overview: totals per period, per route, recent calls, and the credit status flag. */
export async function GET() {
  const sql = getSql()
  if (!sql) return NextResponse.json({ error: 'Tracking database not configured' }, { status: 503 })
  try {
    await ensureTrackingTables()
    const totals = await sql`
      SELECT
        COUNT(*) FILTER (WHERE created_at >= date_trunc('day', NOW()))::int AS calls_today,
        COALESCE(SUM(cost_usd) FILTER (WHERE created_at >= date_trunc('day', NOW())), 0)::float AS cost_today,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS calls_week,
        COALESCE(SUM(cost_usd) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days'), 0)::float AS cost_week,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS calls_month,
        COALESCE(SUM(cost_usd) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days'), 0)::float AS cost_month,
        COUNT(*)::int AS calls_all,
        COALESCE(SUM(cost_usd), 0)::float AS cost_all,
        COALESCE(SUM(input_tokens + cache_read_tokens), 0)::bigint AS input_all,
        COALESCE(SUM(output_tokens), 0)::bigint AS output_all,
        MIN(created_at) AS since
      FROM claude_usage`
    const byRoute = await sql`
      SELECT route, COUNT(*)::int AS calls, COALESCE(SUM(cost_usd), 0)::float AS cost,
             COALESCE(SUM(input_tokens + cache_read_tokens), 0)::bigint AS input_tokens, COALESCE(SUM(output_tokens), 0)::bigint AS output_tokens,
             COUNT(*) FILTER (WHERE status <> 'ok')::int AS failures, MAX(created_at) AS last
      FROM claude_usage WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY route ORDER BY cost DESC`
    const recent = await sql`
      SELECT created_at, route, model, input_tokens, output_tokens, cache_read_tokens, cost_usd::float AS cost_usd, status, detail
      FROM claude_usage ORDER BY created_at DESC LIMIT 25`
    const lastFailure = await sql`SELECT created_at, route, status, detail FROM claude_usage WHERE status <> 'ok' ORDER BY created_at DESC LIMIT 1`
    const credit = await getAppStatus('claude_credit')
    return NextResponse.json({
      success: true,
      creditStatus: credit ?? { value: 'unknown', updatedAt: null },
      totals: totals[0],
      byRoute,
      recent,
      lastFailure: lastFailure[0] ?? null,
      pricing: 'Claude Sonnet 5.5 / Sonnet 5: $2 per million input tokens, $10 per million output tokens, $0.20 per million cached input tokens',
    })
  } catch (error) {
    console.error('Claude usage error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** { action: 'ping' } makes one tiny Claude call so the credit status is fresh. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  if (body?.action !== 'ping') return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  const result = await callClaude('admin-ping', {
    model: CLAUDE_MODEL,
    ...CLAUDE_CHAT_SETTINGS,
    max_tokens: 5,
    messages: [{ role: 'user', content: 'Reply with the single word: pong' }],
  })
  return NextResponse.json({ ok: result.ok, status: result.status, error: result.ok ? null : result.errorText.slice(0, 300) })
}
