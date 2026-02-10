import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// Disable caching for this route
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

    // Get user info before deleting
    const userResult = await sql`
      SELECT telegram_username, email FROM users WHERE id = ${userId}
    `

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = userResult[0]

    // Delete assessment results first
    await sql`
      DELETE FROM assessment_results 
      WHERE telegram_username = ${user.telegram_username}
      AND email = ${user.email}
    `

    // Delete user
    await sql`
      DELETE FROM users WHERE id = ${userId}
    `

    console.log(`Deleted user: ${user.telegram_username} (${user.email})`)

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
