import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const ADMIN_EMAIL = 'luxlife.agentur@gmail.com'
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

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = Buffer.from(`${ADMIN_EMAIL}:marketing:${Date.now()}`).toString('base64')

      return NextResponse.json({
        success: true,
        token
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Marketing admin auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
