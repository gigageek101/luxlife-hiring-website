import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { positionType, qualified, fullName, email, telegramUsername, failedStep, failedReason } = await request.json()

    if (!positionType || typeof qualified !== 'boolean') {
      return NextResponse.json(
        { error: 'positionType and qualified are required' },
        { status: 400 }
      )
    }

    await sql`
      INSERT INTO application_stats (position_type, qualified, full_name, email, telegram_username, failed_step, failed_reason)
      VALUES (${positionType}, ${qualified}, ${fullName || null}, ${email || null}, ${telegramUsername || null}, ${failedStep || null}, ${failedReason || null})
    `

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Track application error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
