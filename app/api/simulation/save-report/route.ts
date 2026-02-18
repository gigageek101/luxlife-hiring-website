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
      typedCount,
      pasteCount,
    } = await request.json()

    if (!telegramUsername || !email) {
      return NextResponse.json(
        { error: 'User info is required' },
        { status: 400 }
      )
    }

    await initDatabase()

    // Ensure new columns exist on already-created tables
    try {
      await sql`ALTER TABLE simulation_reports ADD COLUMN IF NOT EXISTS typed_count INTEGER DEFAULT 0`
      await sql`ALTER TABLE simulation_reports ADD COLUMN IF NOT EXISTS paste_count INTEGER DEFAULT 0`
    } catch {
      // columns may already exist
    }

    const feedbackStr = typeof overallFeedback === 'object'
      ? JSON.stringify(overallFeedback)
      : (overallFeedback || '')

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
        message_count,
        typed_count,
        paste_count
      ) VALUES (
        ${telegramUsername},
        ${email},
        ${overallScore || 0},
        ${JSON.stringify(categories || {})},
        ${feedbackStr},
        ${notes || ''},
        ${JSON.stringify(conversation || [])},
        ${durationMode || 'unknown'},
        ${messageCount || 0},
        ${typedCount || 0},
        ${pasteCount || 0}
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
