import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

/** Both admin wrappers call this on load: is the stored token genuine and which role does it carry? */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    const payload = verifyAdminToken(typeof token === 'string' ? token : null)
    if (!payload) return NextResponse.json({ ok: false }, { status: 401 })
    return NextResponse.json({ ok: true, email: payload.email, role: payload.role, platform: payload.platform })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
