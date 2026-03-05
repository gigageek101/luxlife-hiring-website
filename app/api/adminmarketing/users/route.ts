import { NextResponse } from 'next/server'
import { sql, initMarketingDatabase } from '@/lib/marketing-db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    try {
      await initMarketingDatabase()
    } catch { /* already initialized */ }

    const usersResult = await sql`
      SELECT id, telegram_username, email, created_at
      FROM marketing_users
      ORDER BY created_at DESC
    `

    const usersWithAssessments = await Promise.all(
      usersResult.map(async (user: any) => {
        const assessments = await sql`
          SELECT day, score, total_questions, percentage, passed,
                 attempt_number, answers, completed_at
          FROM marketing_assessment_results
          WHERE telegram_username = ${user.telegram_username}
          AND email = ${user.email}
          ORDER BY day, attempt_number
        `
        return { ...user, assessments: assessments || [] }
      })
    )

    const processedUsers = usersWithAssessments.map((user: any) => {
      const assessmentsByDay: any = { day1: [], day2: [] }

      if (user.assessments && Array.isArray(user.assessments)) {
        user.assessments.forEach((assessment: any) => {
          const dayKey = `day${assessment.day}` as keyof typeof assessmentsByDay
          if (assessmentsByDay[dayKey]) {
            let parsedAnswers = assessment.answers
            if (typeof parsedAnswers === 'string') {
              try { parsedAnswers = JSON.parse(parsedAnswers) } catch { /* keep as-is */ }
            }
            assessmentsByDay[dayKey].push({ ...assessment, answers: parsedAnswers || [] })
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

    return NextResponse.json({ success: true, users: processedUsers })
  } catch (error) {
    console.error('Error fetching marketing users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
