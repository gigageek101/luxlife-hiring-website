import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // Get all users with their assessment results
    const users = await sql`
      SELECT 
        u.id,
        u.telegram_username,
        u.email,
        u.created_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'day', ar.day,
              'score', ar.score,
              'total_questions', ar.total_questions,
              'percentage', ar.percentage,
              'passed', ar.passed,
              'attempt_number', ar.attempt_number,
              'completed_at', ar.completed_at
            ) ORDER BY ar.day, ar.attempt_number
          ) FILTER (WHERE ar.id IS NOT NULL),
          '[]'
        ) as assessments
      FROM users u
      LEFT JOIN assessment_results ar ON u.telegram_username = ar.telegram_username 
        AND u.email = ar.email
      GROUP BY u.id, u.telegram_username, u.email, u.created_at
      ORDER BY u.created_at DESC
    `

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
