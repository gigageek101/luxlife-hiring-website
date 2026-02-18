import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const reports = await sql`
      SELECT 
        id,
        telegram_username,
        email,
        overall_score,
        categories,
        overall_feedback,
        notes,
        conversation,
        duration_mode,
        message_count,
        completed_at
      FROM simulation_reports
      ORDER BY completed_at DESC
    `

    const processed = reports.map((r: any) => ({
      id: r.id,
      telegramUsername: r.telegram_username,
      email: r.email,
      overallScore: r.overall_score,
      categories: typeof r.categories === 'string' ? JSON.parse(r.categories) : r.categories,
      overallFeedback: r.overall_feedback,
      notes: r.notes,
      conversation: typeof r.conversation === 'string' ? JSON.parse(r.conversation) : r.conversation,
      durationMode: r.duration_mode,
      messageCount: r.message_count,
      completedAt: r.completed_at,
    }))

    return NextResponse.json({ success: true, reports: processed })
  } catch (error) {
    console.error('Error fetching simulation reports:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
