import { NextRequest, NextResponse } from 'next/server'
import { sql, initDatabase } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const ADMIN_EMAIL = 'luxlife.agentur@gmail.com'

function isValidAdminToken(token: string | null): boolean {
  if (!token) return false
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [email, tsStr] = decoded.split(':')
    if (email !== ADMIN_EMAIL) return false
    const ts = parseInt(tsStr, 10)
    if (!Number.isFinite(ts)) return false
    // Tokens are valid for 30 days from creation
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
    if (Date.now() - ts > THIRTY_DAYS) return false
    return true
  } catch {
    return false
  }
}

function getBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization') || req.headers.get('Authorization')
  if (!auth) return null
  const match = auth.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : null
}

type PositionRow = { position_type: string; is_open: boolean }

async function fetchStatus() {
  const rows = (await sql`
    SELECT position_type, is_open FROM position_status
  `) as PositionRow[]
  const result = { backend: true, marketing: true }
  for (const row of rows) {
    if (row.position_type === 'backend') result.backend = row.is_open
    if (row.position_type === 'marketing') result.marketing = row.is_open
  }
  return result
}

export async function GET(request: NextRequest) {
  if (!isValidAdminToken(getBearerToken(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    try {
      return NextResponse.json(await fetchStatus())
    } catch {
      await initDatabase()
      return NextResponse.json(await fetchStatus())
    }
  } catch (error) {
    console.error('Error fetching position status (admin):', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isValidAdminToken(getBearerToken(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { position, isOpen } = body as { position?: string; isOpen?: boolean }

    if (position !== 'backend' && position !== 'marketing') {
      return NextResponse.json(
        { error: "Invalid 'position'. Must be 'backend' or 'marketing'." },
        { status: 400 }
      )
    }
    if (typeof isOpen !== 'boolean') {
      return NextResponse.json(
        { error: "Invalid 'isOpen'. Must be a boolean." },
        { status: 400 }
      )
    }

    const upsert = async () => sql`
      INSERT INTO position_status (position_type, is_open, updated_at)
      VALUES (${position}, ${isOpen}, CURRENT_TIMESTAMP)
      ON CONFLICT (position_type)
      DO UPDATE SET is_open = EXCLUDED.is_open, updated_at = CURRENT_TIMESTAMP
    `

    try {
      await upsert()
    } catch {
      await initDatabase()
      await upsert()
    }

    return NextResponse.json({ success: true, ...(await fetchStatus()) })
  } catch (error) {
    console.error('Error updating position status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
