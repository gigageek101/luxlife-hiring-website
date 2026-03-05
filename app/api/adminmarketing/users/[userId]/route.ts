import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/marketing-db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = parseInt(params.userId)

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    const userResult = await sql`
      SELECT telegram_username, email FROM marketing_users WHERE id = ${userId}
    `

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = userResult[0]

    await sql`
      DELETE FROM marketing_assessment_results 
      WHERE telegram_username = ${user.telegram_username}
      AND email = ${user.email}
    `

    await sql`
      DELETE FROM marketing_users WHERE id = ${userId}
    `

    console.log(`Deleted marketing user: ${user.telegram_username} (${user.email})`)

    return NextResponse.json({
      success: true,
      message: 'Marketing user deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting marketing user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
