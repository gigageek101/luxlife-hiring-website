import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const { telegramUsername, email } = await request.json()

    if (!telegramUsername || !email) {
      return NextResponse.json(
        { error: 'Telegram username and email are required' },
        { status: 400 }
      )
    }

    const result = await sql`
      SELECT id, telegram_username, email
      FROM users 
      WHERE telegram_username = ${telegramUsername} 
      AND email = ${email}
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'No account found with this Telegram username and email combination. Please make sure you are registered in the training portal first.' },
        { status: 401 }
      )
    }

    const user = result[0]

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        telegramUsername: user.telegram_username,
        email: user.email,
      }
    })
  } catch (error) {
    console.error('Simulation login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
