import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_EMAIL, signAdminToken } from '@/lib/admin-auth'
import { findQaAccount } from '@/lib/qa-access'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const ADMIN_PASSWORD = 'Fym2022$$'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const mail = String(email).trim().toLowerCase()
    if (mail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return NextResponse.json({ success: true, role: 'admin', token: signAdminToken({ email: ADMIN_EMAIL, role: 'admin', platform: 'marketing' }) })
    }
    const qa = findQaAccount(mail, String(password))
    if (qa) {
      return NextResponse.json({ success: true, role: 'qa', token: signAdminToken({ email: qa.email, role: 'qa', platform: 'marketing' }) })
    }
    return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 })
  } catch (error) {
    console.error('Marketing admin auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
