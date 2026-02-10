import { NextRequest, NextResponse } from 'next/server'

// Disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

const ADMIN_EMAIL = 'luxlife.agentur@gmail.com'
const ADMIN_PASSWORD = 'Fym2022$$'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Generate simple token
      const token = Buffer.from(`${ADMIN_EMAIL}:${Date.now()}`).toString('base64')

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
    console.error('Admin auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
