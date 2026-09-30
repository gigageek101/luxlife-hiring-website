import { NextRequest, NextResponse } from 'next/server'
import { guideBySlug } from '@/lib/guides'
import { ensureTrackingTables, getSql } from '@/lib/tracking-db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const clampInt = (value: unknown, max: number) => Math.max(0, Math.min(max, Math.round(Number(value) || 0)))

/** One row per reading session, updated as the reader scrolls (also via sendBeacon on leave). */
export async function POST(request: NextRequest) {
  const sql = getSql()
  if (!sql) return NextResponse.json({ error: 'Tracking database not configured' }, { status: 503 })
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  const { sessionId, slug, telegramUsername, email } = body as Record<string, unknown>
  if (typeof sessionId !== 'string' || sessionId.length < 8 || sessionId.length > 64) return NextResponse.json({ error: 'Bad session' }, { status: 400 })
  if (typeof slug !== 'string' || !guideBySlug(slug)) return NextResponse.json({ error: 'Unknown guide' }, { status: 400 })
  if (typeof telegramUsername !== 'string' || !telegramUsername.trim() || typeof email !== 'string' || !email.trim()) {
    return NextResponse.json({ error: 'Reader identity required' }, { status: 400 })
  }
  const maxScroll = clampInt(body.maxScroll, 100)
  const seconds = clampInt(body.seconds, 24 * 3600)
  const completed = body.completed === true
  await ensureTrackingTables()
  await sql`
    INSERT INTO guide_views (session_id, telegram_username, email, slug, max_scroll, seconds, completed)
    VALUES (${sessionId}, ${telegramUsername.trim()}, ${email.trim().toLowerCase()}, ${slug}, ${maxScroll}, ${seconds}, ${completed})
    ON CONFLICT (session_id) DO UPDATE SET
      last_seen_at = NOW(),
      max_scroll = GREATEST(guide_views.max_scroll, EXCLUDED.max_scroll),
      seconds = GREATEST(guide_views.seconds, EXCLUDED.seconds),
      completed = guide_views.completed OR EXCLUDED.completed`
  return NextResponse.json({ success: true })
}
