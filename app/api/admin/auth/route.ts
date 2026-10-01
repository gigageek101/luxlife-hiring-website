import { NextRequest, NextResponse } from 'next/server'
import { findQaAccount } from '@/lib/qa-access'

// Disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

const ADMIN_EMAIL = 'luxlife.agentur@gmail.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Fym2022$$'

// Token = base64("email:timestamp:role"). /api/admin/position-status reads email + timestamp and only accepts the admin email.
function makeToken(email: string, role: 'admin' | 'qa') {
  return Buffer.from(`${email}:${Date.now()}:${role}`).toString('base64')
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    const mail = String(email).trim().toLowerCase()
    if (mail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return NextResponse.json({ success: true, role: 'admin', token: makeToken(ADMIN_EMAIL, 'admin') })
    }
    const qa = findQaAccount(mail, String(password))
    if (qa) {
      return NextResponse.json({ success: true, role: 'qa', token: makeToken(qa.email, 'qa') })
    }
    return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 })
  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
