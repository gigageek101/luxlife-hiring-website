import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { positionType, qualified } = body

    if (!positionType || typeof qualified !== 'boolean') {
      return NextResponse.json(
        { error: 'positionType and qualified are required' },
        { status: 400 }
      )
    }

    await sql`
      INSERT INTO application_stats (position_type, qualified, full_name, email, telegram_username, failed_step, failed_reason)
      VALUES (${positionType}, ${qualified}, ${body.fullName || null}, ${body.email || null}, ${body.telegramUsername || null}, ${body.failedStep || null}, ${body.failedReason || null})
    `

    if (qualified) {
      const englishScore = body.quizAnswers
        ? body.quizAnswers.filter((a: any) => a.isCorrect).length
        : null
      const memoryScore = body.memoryTestResult?.correctCount ?? null

      const creativityData = body.creativityTestResult ? {
        object: body.creativityTestResult.object,
        alternateUses: body.creativityTestResult.alternateUses,
        scenario: body.creativityTestResult.scenario,
        captions: body.creativityTestResult.captions,
      } : null
      const claudeEvaluation = body.creativityTestResult?.claudeEvaluation || null

      await sql`
        INSERT INTO inbound_leads (
          full_name, email, telegram_username, city, age, position_type,
          english_quiz_score, english_quiz_total,
          memory_test_score, memory_test_total,
          education_type, english_rating, quiz_answers, qualified,
          typing_wpm, typing_accuracy, typing_passed,
          download_speed, upload_speed, speed_passed,
          creativity_score, creativity_data, creativity_passed,
          claude_evaluation, terms_accepted
        ) VALUES (
          ${body.fullName || null},
          ${body.email || null},
          ${body.telegramUsername || null},
          ${body.city || null},
          ${body.age || null},
          ${positionType},
          ${englishScore},
          ${8},
          ${memoryScore},
          ${6},
          ${body.educationType || null},
          ${body.englishRating || null},
          ${JSON.stringify(body.quizAnswers || [])},
          ${true},
          ${body.typingTestResult?.wpm ?? null},
          ${body.typingTestResult?.accuracy ?? null},
          ${body.typingTestResult?.passed ?? null},
          ${body.speedTestResult?.downloadSpeed ?? null},
          ${body.speedTestResult?.uploadSpeed ?? null},
          ${body.speedTestResult?.passed ?? null},
          ${body.creativityTestResult?.fluencyScore ?? null},
          ${creativityData ? JSON.stringify(creativityData) : null},
          ${body.creativityTestResult?.passed ?? null},
          ${claudeEvaluation ? JSON.stringify(claudeEvaluation) : null},
          ${false}
        )
      `
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Track application error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
