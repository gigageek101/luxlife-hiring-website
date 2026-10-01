import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function parseJson<T>(raw: unknown, fallback: T): T {
  if (raw && typeof raw === 'object') return raw as T
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) as T } catch { return fallback }
  }
  return fallback
}

/** All simulation reports of one trainee, oldest first, for the per-user analytics page. */
export async function GET(request: NextRequest) {
  try {
    const raw = request.nextUrl.searchParams.get('username') || ''
    const handle = raw.trim().replace(/^@+/, '').toLowerCase()
    if (!handle) return NextResponse.json({ error: 'username is required' }, { status: 400 })

    const users = (await sql`
      SELECT id, telegram_username, email, created_at FROM users
      WHERE LOWER(LTRIM(TRIM(telegram_username), '@')) = ${handle} LIMIT 1`) as Record<string, unknown>[]
    const rows = (await sql`
      SELECT id, telegram_username, email, simulation_type, completed_at, categories, overall_feedback, notes,
             message_count, typed_count, paste_count, wpm, duration_mode
      FROM simulation_reports
      WHERE LOWER(LTRIM(TRIM(telegram_username), '@')) = ${handle}
      ORDER BY completed_at ASC, id ASC`) as Record<string, unknown>[]

    const u = users[0]
    const user = u
      ? { id: u.id, telegramUsername: u.telegram_username, email: u.email, createdAt: u.created_at }
      : rows.length > 0
        ? { id: null, telegramUsername: rows[0].telegram_username, email: rows[0].email, createdAt: null }
        : null

    const reports = rows.map((r) => {
      const categories = parseJson<unknown>(r.categories, [])
      return {
        id: r.id,
        simulationType: r.simulation_type || 'chatting',
        completedAt: r.completed_at,
        categories: Array.isArray(categories) ? categories : [],
        overallFeedback: parseJson<unknown>(r.overall_feedback, null),
        notes: r.notes || '',
        messageCount: r.message_count || 0,
        typedCount: r.typed_count || 0,
        pasteCount: r.paste_count || 0,
        wpm: Number(r.wpm) || 0,
        durationMode: r.duration_mode || '',
      }
    })
    return NextResponse.json({ user, reports })
  } catch (error) {
    console.error('user-analytics error:', error)
    return NextResponse.json({ error: 'Failed to load user analytics' }, { status: 500 })
  }
}
