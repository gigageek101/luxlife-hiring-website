import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reportId = parseInt(id, 10)
    if (isNaN(reportId)) {
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 })
    }

    const rows = await sql`
      SELECT session_recording
      FROM simulation_reports
      WHERE id = ${reportId}
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    let recording = rows[0].session_recording
    if (typeof recording === 'string') {
      try { recording = JSON.parse(recording) } catch { recording = null }
    }

    if (!recording) {
      return NextResponse.json({ error: 'No recording available' }, { status: 404 })
    }

    return NextResponse.json({ success: true, recording })
  } catch (error) {
    console.error('Error fetching recording:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
