import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 })
    }
    await sql`DELETE FROM simulation_reports WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting simulation report:', error)
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Ensure new columns exist on already-created tables
    try {
      await sql`ALTER TABLE simulation_reports ADD COLUMN IF NOT EXISTS typed_count INTEGER DEFAULT 0`
      await sql`ALTER TABLE simulation_reports ADD COLUMN IF NOT EXISTS paste_count INTEGER DEFAULT 0`
    } catch {
      // columns may already exist
    }

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
        typed_count,
        paste_count,
        completed_at
      FROM simulation_reports
      ORDER BY completed_at DESC
    `

    const processed = reports.map((r: any) => {
      let feedback = r.overall_feedback
      if (typeof feedback === 'string') {
        try { feedback = JSON.parse(feedback) } catch { /* keep as string */ }
      }
      return {
        id: r.id,
        telegramUsername: r.telegram_username,
        email: r.email,
        overallScore: r.overall_score,
        categories: typeof r.categories === 'string' ? JSON.parse(r.categories) : r.categories,
        overallFeedback: feedback,
        notes: r.notes,
        conversation: typeof r.conversation === 'string' ? JSON.parse(r.conversation) : r.conversation,
        durationMode: r.duration_mode,
        messageCount: r.message_count,
        typedCount: r.typed_count || 0,
        pasteCount: r.paste_count || 0,
        completedAt: r.completed_at,
      }
    })

    return NextResponse.json({ success: true, reports: processed })
  } catch (error) {
    console.error('Error fetching simulation reports:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
