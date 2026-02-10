import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { hashPassword, verifyMasterPassword, generateToken } from '@/lib/auth'
import { initDatabase } from '@/lib/db'

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    // Auto-initialize database if not already done
    try {
      await initDatabase()
    } catch (dbInitError) {
      console.log('Database already initialized or error:', dbInitError)
    }

    const { telegramUsername, email, masterPassword } = await request.json()

    // Validate inputs
    if (!telegramUsername || !email || !masterPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Verify master password
    if (!verifyMasterPassword(masterPassword)) {
      return NextResponse.json(
        { error: 'Invalid master password' },
        { status: 401 }
      )
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users 
      WHERE telegram_username = ${telegramUsername} 
      OR email = ${email}
    `

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this Telegram username or email already exists' },
        { status: 409 }
      )
    }

    // Hash the master password for storage
    const passwordHash = await hashPassword(masterPassword)

    // Create new user
    const result = await sql`
      INSERT INTO users (telegram_username, email, password_hash)
      VALUES (${telegramUsername}, ${email}, ${passwordHash})
      RETURNING id, telegram_username, email
    `

    const user = result[0]

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
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
