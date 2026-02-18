import { NextRequest, NextResponse } from 'next/server'
import { sql, initDatabase } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const {
      telegramUsername,
      email,
      overallScore,
      categories,
      overallFeedback,
      notes,
      conversation,
      durationMode,
      messageCount,
    } = await request.json()

    if (!telegramUsername || !email) {
      return NextResponse.json(
        { error: 'User info is required' },
        { status: 400 }
      )
    }

    await initDatabase()

    await sql`
      INSERT INTO simulation_reports (
        telegram_username,
        email,
        overall_score,
        categories,
        overall_feedback,
        notes,
        conversation,
        duration_mode,
        message_count
      ) VALUES (
        ${telegramUsername},
        ${email},
        ${overallScore || 0},
        ${JSON.stringify(categories || {})},
        ${overallFeedback || ''},
        ${notes || ''},
        ${JSON.stringify(conversation || [])},
        ${durationMode || 'unknown'},
        ${messageCount || 0}
      )
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving simulation report:', error)
    return NextResponse.json(
      { error: 'Failed to save report' },
      { status: 500 }
    )
  }
}
