import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { GUIDES } from '@/lib/guides'
import { ensureTrackingTables } from '@/lib/tracking-db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const key = (telegram: unknown, email: unknown) => `${String(telegram).trim().toLowerCase()}|${String(email).trim().toLowerCase()}`
const DAY = 24 * 3600 * 1000

/** Per-user overview: which guides were opened / finished, which simulations were done, assessments, flags. */
export async function GET() {
  try {
    await ensureTrackingTables()
    const users = await sql`SELECT id, telegram_username, email, created_at FROM users ORDER BY created_at`
    const views = await sql`
      SELECT telegram_username, email, slug, COUNT(*)::int AS opens, BOOL_OR(completed) AS completed,
             MAX(max_scroll)::int AS max_scroll, COALESCE(SUM(seconds), 0)::int AS seconds, MAX(last_seen_at) AS last_seen
      FROM guide_views GROUP BY telegram_username, email, slug`
    const sims = await sql`
      SELECT telegram_username, email, simulation_type, COUNT(*)::int AS count, ROUND(AVG(overall_score))::int AS avg,
             MAX(overall_score)::int AS best, MAX(completed_at) AS last
      FROM simulation_reports GROUP BY telegram_username, email, simulation_type`
    const assessments = await sql`
      SELECT telegram_username, email, COUNT(*)::int AS attempts, COUNT(DISTINCT day)::int AS days,
             BOOL_OR(passed) AS any_passed, MAX(completed_at) AS last
      FROM assessment_results GROUP BY telegram_username, email`

    const now = Date.now()
    const result = users.map((user) => {
      const k = key(user.telegram_username, user.email)
      const guideRows = views.filter((v) => key(v.telegram_username, v.email) === k)
      const simRows = sims.filter((s) => key(s.telegram_username, s.email) === k)
      const assess = assessments.find((a) => key(a.telegram_username, a.email) === k)
      const guides = Object.fromEntries(guideRows.map((v) => [v.slug, { opens: v.opens, completed: Boolean(v.completed), maxScroll: v.max_scroll, seconds: v.seconds, lastSeen: v.last_seen }]))
      const simulations = Object.fromEntries(simRows.map((s) => [s.simulation_type, { count: s.count, avg: s.avg, best: s.best, last: s.last }]))
      const timestamps = [...guideRows.map((v) => v.last_seen), ...simRows.map((s) => s.last), assess?.last].filter(Boolean).map((t) => new Date(t as string).getTime())
      const lastActivity = timestamps.length ? new Date(Math.max(...timestamps)).toISOString() : null
      const flags: string[] = []
      if (guideRows.length === 0) flags.push('never opened a guide')
      else if (!guideRows.some((v) => v.completed)) flags.push('never finished a guide')
      if (simRows.length === 0) flags.push('never did a simulation')
      if (!assess) flags.push('no assessments')
      if (!lastActivity) flags.push('no activity at all')
      else if (now - new Date(lastActivity).getTime() > 14 * DAY) flags.push('inactive 14+ days')
      return {
        id: user.id,
        telegramUsername: user.telegram_username,
        email: user.email,
        createdAt: user.created_at,
        guides,
        guidesOpened: guideRows.length,
        guidesCompleted: guideRows.filter((v) => v.completed).length,
        simulations,
        simulationsTotal: simRows.reduce((sum, s) => sum + s.count, 0),
        assessments: assess ? { attempts: assess.attempts, days: assess.days, anyPassed: Boolean(assess.any_passed), last: assess.last } : null,
        lastActivity,
        flags,
      }
    })
    const knownUsers = new Set(users.map((user) => key(user.telegram_username, user.email)))
    const guideStats = GUIDES.map((guide) => {
      const rows = views.filter((v) => v.slug === guide.slug && knownUsers.has(key(v.telegram_username, v.email)))
      return { slug: guide.slug, title: guide.title, emoji: guide.emoji, step: guide.step, readers: rows.length, finished: rows.filter((v) => v.completed).length, opens: rows.reduce((sum, v) => sum + v.opens, 0) }
    })
    return NextResponse.json({ success: true, users: result, guides: guideStats, totalGuides: GUIDES.length, generatedAt: new Date().toISOString() })
  } catch (error) {
    console.error('Accountability error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
