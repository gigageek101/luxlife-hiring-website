import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // First get all users
    const usersResult = await sql`
      SELECT 
        id,
        telegram_username,
        email,
        created_at
      FROM users
      ORDER BY created_at DESC
    `

    // Then get assessments for each user
    const usersWithAssessments = await Promise.all(
      usersResult.map(async (user: any) => {
        const assessments = await sql`
          SELECT 
            day,
            score,
            total_questions,
            percentage,
            passed,
            attempt_number,
            completed_at
          FROM assessment_results
          WHERE telegram_username = ${user.telegram_username}
          AND email = ${user.email}
          ORDER BY day, attempt_number
        `

        return {
          ...user,
          assessments: assessments || []
        }
      })
    )

    const users = usersWithAssessments

    // Process the results to organize by day
    const processedUsers = users.map((user: any) => {
      const assessmentsByDay: any = {
        day2: [],
        day3: [],
        day4: [],
        day5: []
      }

      if (user.assessments && Array.isArray(user.assessments)) {
        user.assessments.forEach((assessment: any) => {
          const dayKey = `day${assessment.day}` as keyof typeof assessmentsByDay
          if (assessmentsByDay[dayKey]) {
            assessmentsByDay[dayKey].push(assessment)
          }
        })
      }

      return {
        id: user.id,
        telegramUsername: user.telegram_username,
        email: user.email,
        createdAt: user.created_at,
        assessments: assessmentsByDay
      }
    })

    return NextResponse.json({
      success: true,
      users: processedUsers
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
