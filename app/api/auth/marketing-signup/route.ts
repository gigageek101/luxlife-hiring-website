import { NextRequest, NextResponse } from 'next/server'
import { sql, initMarketingDatabase } from '@/lib/marketing-db'
import { hashPassword, verifyMarketingMasterPassword, generateMarketingToken } from '@/lib/marketing-auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    try {
      await initMarketingDatabase()
    } catch (dbInitError) {
      console.log('Marketing database already initialized or error:', dbInitError)
    }

    const { telegramUsername, email, masterPassword } = await request.json()

    if (!telegramUsername || !email || !masterPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (!verifyMarketingMasterPassword(masterPassword)) {
      return NextResponse.json(
        { error: 'Invalid master password' },
        { status: 401 }
      )
    }

    const existingUser = await sql`
      SELECT id FROM marketing_users 
      WHERE telegram_username = ${telegramUsername} 
      OR email = ${email}
    `

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this Telegram username or email already exists' },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(masterPassword)

    const result = await sql`
      INSERT INTO marketing_users (telegram_username, email, password_hash)
      VALUES (${telegramUsername}, ${email}, ${passwordHash})
      RETURNING id, telegram_username, email
    `

    const user = result[0]
    const token = generateMarketingToken(user.id, user.telegram_username, user.email)

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
    console.error('Marketing signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
