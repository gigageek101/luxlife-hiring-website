import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { verifyPassword, generateToken } from '@/lib/auth'

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const { telegramUsername, email, masterPassword } = await request.json()

    // Validate inputs
    if (!telegramUsername || !email || !masterPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Find user
    const result = await sql`
      SELECT id, telegram_username, email, password_hash 
      FROM users 
      WHERE telegram_username = ${telegramUsername} 
      AND email = ${email}
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const user = result[0]

    // Verify password
    const isValidPassword = await verifyPassword(masterPassword, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken(user.id, user.telegram_username, user.email)

    return NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: user.id,
          telegramUsername: user.telegram_username,
          email: user.email
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
