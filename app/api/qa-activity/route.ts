import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'
import { logQaEvents, QaActivityRow } from '@/lib/tracking-db'

export const dynamic = 'force-dynamic'

const MAX_EVENTS = 200
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : v === undefined || v === null ? null : String(v).slice(0, max))

/** Ingest endpoint for the QA activity tracker. Only events from a genuine QA token are stored. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payload = verifyAdminToken(typeof body?.token === 'string' ? body.token : null)
    if (!payload || payload.role !== 'qa') return new NextResponse(null, { status: 204 })
    const sessionId = str(body.sid, 64)
    const events = Array.isArray(body.events) ? body.events.slice(0, MAX_EVENTS) : []
    if (!sessionId || events.length === 0) return NextResponse.json({ ok: true, stored: 0 })
    const ip = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '').split(',')[0].trim().slice(0, 64) || null
    const userAgent = str(body.ua, 300) || str(request.headers.get('user-agent'), 300)
    const rows: QaActivityRow[] = []
    for (const e of events) {
      if (!e || typeof e !== 'object') continue
      const type = str(e.type, 40)
      if (!type) continue
      const ts = new Date(typeof e.t === 'string' || typeof e.t === 'number' ? e.t : Date.now())
      let detail: string | null = null
      if (e.detail && typeof e.detail === 'object') {
        detail = JSON.stringify(e.detail)
        if (detail.length > 4000) detail = JSON.stringify({ truncated: true, preview: detail.slice(0, 3800) })
      }
      rows.push({
        sessionId,
        email: payload.email,
        platform: str(body.platform, 20) || payload.platform,
        type,
        label: str(e.label, 400),
        path: str(e.path, 500),
        detail,
        durationMs: Number.isFinite(Number(e.dur)) ? Math.round(Number(e.dur)) : null,
        clientTs: (Number.isFinite(ts.getTime()) ? ts : new Date()).toISOString(),
        userAgent,
        ip,
      })
    }
    await logQaEvents(rows)
    return NextResponse.json({ ok: true, stored: rows.length })
  } catch (error) {
    console.error('qa-activity ingest error:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
