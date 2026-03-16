import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { telegram_username, email, day } = body

    if (!telegram_username || !email || !day) {
      return NextResponse.json(
        { error: 'Missing required fields: telegram_username, email, day' },
        { status: 400 }
      )
    }

    await sql`
      DELETE FROM assessment_results
      WHERE telegram_username = ${telegram_username}
        AND email = ${email}
        AND day = ${day}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error granting retry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
