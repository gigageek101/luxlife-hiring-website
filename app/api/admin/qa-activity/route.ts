import { NextRequest, NextResponse } from 'next/server'
import { adminFromRequest, isSuperAdmin } from '@/lib/admin-auth'
import { ensureTrackingTables, getSql } from '@/lib/tracking-db'

export const dynamic = 'force-dynamic'

const num = (v: unknown) => Number(v) || 0
const iso = (v: unknown) => (v ? new Date(String(v)).toISOString() : null)

function mapEvent(r: Record<string, unknown>) {
  return { id: num(r.id), sid: String(r.session_id), email: String(r.qa_email), type: String(r.event_type), label: (r.label as string) || '', path: (r.path as string) || '', detail: r.detail ?? null, dur: r.duration_ms === null || r.duration_ms === undefined ? null : num(r.duration_ms), t: iso(r.client_ts) }
}

/** Super-admin only: sessions, per-account totals, time per page, the live feed, or one session's full timeline. */
export async function GET(request: NextRequest) {
  if (!isSuperAdmin(adminFromRequest(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sql = getSql()
  if (!sql) return NextResponse.json({ accounts: [], sessions: [], pageTime: [], recent: [], events: [] })
  try {
    await ensureTrackingTables()
    const q = request.nextUrl.searchParams
    const from = new Date(q.get('from') || 0)
    const to = new Date(q.get('to') || Date.now() + 86400000)
    const fromIso = (Number.isFinite(from.getTime()) ? from : new Date(0)).toISOString()
    const toIso = (Number.isFinite(to.getTime()) ? to : new Date(Date.now() + 86400000)).toISOString()
    const email = (q.get('email') || '').trim().toLowerCase()
    const sid = (q.get('sid') || '').trim()

    if (sid) {
      const rows = (await sql`
        SELECT id, session_id, qa_email, event_type, label, path, detail, duration_ms, client_ts
        FROM qa_activity WHERE session_id = ${sid} ORDER BY client_ts ASC, id ASC LIMIT 5000`) as Record<string, unknown>[]
      return NextResponse.json({ events: rows.map(mapEvent) })
    }

    const [accounts, sessions, pageTime, recent] = await Promise.all([
      sql`
        SELECT qa_email, COUNT(DISTINCT session_id)::int AS sessions, COUNT(*)::int AS events, MIN(client_ts) AS first_seen, MAX(client_ts) AS last_seen,
               (COUNT(*) FILTER (WHERE event_type = 'heartbeat' AND label = 'active'))::int * 15000 AS active_ms
        FROM qa_activity GROUP BY qa_email ORDER BY last_seen DESC`,
      sql`
        SELECT session_id, qa_email, platform, MIN(client_ts) AS start_ts, MAX(client_ts) AS end_ts, COUNT(*)::int AS events,
               (COUNT(*) FILTER (WHERE event_type = 'heartbeat' AND label = 'active'))::int * 15000 AS active_ms,
               (COUNT(*) FILTER (WHERE event_type = 'click'))::int AS clicks,
               (COUNT(*) FILTER (WHERE event_type = 'page_view'))::int AS page_views,
               (COUNT(*) FILTER (WHERE event_type IN ('input', 'change', 'paste')))::int AS inputs,
               (COUNT(*) FILTER (WHERE event_type = 'api_call'))::int AS api_calls,
               ARRAY_AGG(DISTINCT path) FILTER (WHERE path IS NOT NULL AND event_type = 'page_view') AS paths,
               MAX(user_agent) AS ua, MAX(ip) AS ip
        FROM qa_activity
        WHERE client_ts >= ${fromIso} AND client_ts < ${toIso} AND (${email} = '' OR qa_email = ${email})
        GROUP BY session_id, qa_email, platform ORDER BY start_ts DESC LIMIT 300`,
      sql`
        SELECT path, SUM(COALESCE(duration_ms, 0))::bigint AS ms, COUNT(*)::int AS views
        FROM qa_activity
        WHERE event_type = 'page_leave' AND client_ts >= ${fromIso} AND client_ts < ${toIso} AND (${email} = '' OR qa_email = ${email})
        GROUP BY path ORDER BY ms DESC LIMIT 40`,
      sql`
        SELECT id, session_id, qa_email, event_type, label, path, detail, duration_ms, client_ts
        FROM qa_activity
        WHERE client_ts >= ${fromIso} AND client_ts < ${toIso} AND (${email} = '' OR qa_email = ${email}) AND event_type <> 'heartbeat'
        ORDER BY client_ts DESC, id DESC LIMIT 150`,
    ]) as [Record<string, unknown>[], Record<string, unknown>[], Record<string, unknown>[], Record<string, unknown>[]]

    return NextResponse.json({
      accounts: accounts.map((r) => ({ email: String(r.qa_email), sessions: num(r.sessions), events: num(r.events), firstSeen: iso(r.first_seen), lastSeen: iso(r.last_seen), activeMs: num(r.active_ms) })),
      sessions: sessions.map((r) => ({
        sid: String(r.session_id), email: String(r.qa_email), platform: String(r.platform), start: iso(r.start_ts), end: iso(r.end_ts),
        totalMs: Math.max(0, new Date(String(r.end_ts)).getTime() - new Date(String(r.start_ts)).getTime()),
        activeMs: num(r.active_ms), events: num(r.events), clicks: num(r.clicks), pageViews: num(r.page_views), inputs: num(r.inputs), apiCalls: num(r.api_calls),
        paths: Array.isArray(r.paths) ? (r.paths as string[]) : [], ua: (r.ua as string) || '', ip: (r.ip as string) || '',
      })),
      pageTime: pageTime.map((r) => ({ path: String(r.path || ''), ms: num(r.ms), views: num(r.views) })),
      recent: recent.map(mapEvent),
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('qa-activity read error:', error)
    return NextResponse.json({ error: 'Failed to load QA activity' }, { status: 500 })
  }
}
