import { NextResponse } from 'next/server'
import { initMarketingDatabase } from '@/lib/marketing-db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    await initMarketingDatabase()
    return NextResponse.json({ success: true, message: 'Marketing database initialized' })
  } catch (error) {
    console.error('Marketing DB init error:', error)
    return NextResponse.json({ error: 'Failed to initialize marketing database' }, { status: 500 })
  }
}
