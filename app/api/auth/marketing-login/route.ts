import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/marketing-db'
import { verifyPassword, generateMarketingToken } from '@/lib/marketing-auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const { telegramUsername, email, masterPassword } = await request.json()

    if (!telegramUsername || !email || !masterPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const result = await sql`
      SELECT id, telegram_username, email, password_hash 
      FROM marketing_users 
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

    const isValidPassword = await verifyPassword(masterPassword, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

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
      { status: 200 }
    )
  } catch (error) {
    console.error('Marketing login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
