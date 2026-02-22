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
      simulationType,
      wpm,
    } = await request.json()

    if (!telegramUsername || !email) {
      return NextResponse.json(
        { error: 'User info is required' },
        { status: 400 }
      )
    }

    await initDatabase()

    try {
      await sql`ALTER TABLE simulation_reports ADD COLUMN IF NOT EXISTS typed_count INTEGER DEFAULT 0`
      await sql`ALTER TABLE simulation_reports ADD COLUMN IF NOT EXISTS paste_count INTEGER DEFAULT 0`
      await sql`ALTER TABLE simulation_reports ADD COLUMN IF NOT EXISTS simulation_type VARCHAR(20) DEFAULT 'chatting'`
      await sql`ALTER TABLE simulation_reports ADD COLUMN IF NOT EXISTS wpm DECIMAL(5,1) DEFAULT 0`
    } catch {
      // columns may already exist
    }

    const feedbackStr = typeof overallFeedback === 'object'
      ? JSON.stringify(overallFeedback)
      : (overallFeedback || '')

    const safeScore = Math.round(Number(overallScore) || 0)
    const safeCats = Array.isArray(categories) ? categories : []

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
        paste_count,
        simulation_type,
        wpm
      ) VALUES (
        ${telegramUsername},
        ${email},
        ${safeScore},
        ${JSON.stringify(safeCats)},
        ${feedbackStr},
        ${notes || ''},
        ${JSON.stringify(conversation || [])},
        ${durationMode || 'unknown'},
        ${messageCount || 0},
        ${typedCount || 0},
        ${pasteCount || 0},
        ${simulationType || 'chatting'},
        ${wpm || 0}
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
