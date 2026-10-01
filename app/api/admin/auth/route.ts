import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_EMAIL, signAdminToken } from '@/lib/admin-auth'
import { findQaAccount } from '@/lib/qa-access'

// Disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Fym2022$$'

/** Super-admin or QA login for /admin. Returns a signed token that carries the role. */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    const mail = String(email).trim().toLowerCase()
    if (mail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return NextResponse.json({ success: true, role: 'admin', token: signAdminToken({ email: ADMIN_EMAIL, role: 'admin', platform: 'admin' }) })
    }
    const qa = findQaAccount(mail, String(password))
    if (qa) {
      return NextResponse.json({ success: true, role: 'qa', token: signAdminToken({ email: qa.email, role: 'qa', platform: 'admin' }) })
    }
    return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 })
  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
