import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Claude API Configuration
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY

// Telegram Bot Configuration (same as contact route)
const TELEGRAM_BOT_TOKEN = '8491965924:AAHBz28OuBgEKIXZywBENwl2xe-y1rVNQfk'
const TELEGRAM_CHAT_ID = '2108767741'

interface Answer {
  question: string
  correctAnswer: string
  userAnswer: string
}

interface EvaluationResult {
  isCorrect: boolean
  feedback: string
}

async function evaluateWithClaude(answers: Answer[]): Promise<EvaluationResult[]> {
  if (!CLAUDE_API_KEY) {
    console.error('Claude API key not configured')
    throw new Error('Claude API key not configured')
  }

  const prompt = `You are an expert evaluator for a training assessment. Your job is to compare student answers with correct answers and determine if they are close enough to be considered correct.

For each question, the student's answer should demonstrate understanding of the key concepts in the correct answer. Minor wording differences are acceptable as long as the core meaning is preserved.

Evaluate the following answers:

${answers.map((answer, index) => `
Question ${index + 1}: ${answer.question}

Correct Answer: ${answer.correctAnswer}

Student Answer: ${answer.userAnswer}
`).join('\n---\n')}

For each answer, return an object with:
- isCorrect: boolean (true if the answer demonstrates understanding of the key concepts, false otherwise)
- feedback: string (2-3 sentences explaining why the answer is correct or what is missing/incorrect)

Return ONLY a valid JSON array with ${answers.length} evaluation objects, no other text. Start your response with [ and end with ]`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Claude API error:', errorData)
      throw new Error(`Claude API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.content[0].text.trim()
    
    // Parse the JSON response
    let evaluations: EvaluationResult[]
    try {
      evaluations = JSON.parse(content)
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content)
      throw new Error('Failed to parse evaluation results')
    }

    // Validate the response structure
    if (!Array.isArray(evaluations) || evaluations.length !== answers.length) {
      throw new Error('Invalid evaluation results structure')
    }

    return evaluations
  } catch (error) {
    console.error('Error calling Claude API:', error)
    throw error
  }
}

async function sendTelegramNotification(submission: any) {
  try {
    const correctCount = submission.results.filter((r: any) => r.isCorrect).length
    const totalQuestions = submission.results.length
    const percentage = ((correctCount / totalQuestions) * 100).toFixed(0)
    
    // Determine pass/fail status based on total questions
    let status = ''
    let passRequirement = 5 // Default: Day 2 requires 5+ correct
    let dayNumber = '2'
    
    if (totalQuestions === 10) {
      passRequirement = 6 // Day 3 requires 6+ correct
      dayNumber = '3'
    } else if (totalQuestions === 6) {
      passRequirement = 3 // Day 4 requires 3+ correct (50%)
      dayNumber = '4'
    } else if (totalQuestions === 12) {
      passRequirement = 7 // Day 5 requires 7+ correct (58%)
      dayNumber = '5'
    }
    
    if (correctCount >= passRequirement) {
      status = '✅ *PASSED*'
    } else if (correctCount >= passRequirement - 1) {
      status = '⚠️ *ONE MORE CHANCE*'
    } else {
      status = '❌ *FAILED*'
    }

    const message = `
🎓 *NEW TRAINING DAY ${dayNumber} SUBMISSION* 🎓

${status}
📊 *Score:* ${correctCount}/${totalQuestions} (${percentage}%)

👤 *Telegram:* ${submission.telegram}
📧 *Email:* ${submission.email}

${submission.results.map((result: any, index: number) => `
*Q${index + 1}:* ${result.isCorrect ? '✅ Correct' : '❌ Incorrect'}
${result.feedback}
`).join('\n')}

⏰ *Submitted:* ${new Date(submission.timestamp).toLocaleString()}
    `.trim()

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    })

    if (!response.ok) {
      console.error('Telegram API error:', await response.text())
    } else {
      console.log('Telegram notification sent successfully!')
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { telegram, email, answers } = body

    // Validate required fields
    if (!telegram || !email || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Evaluate answers using Claude
    const evaluations = await evaluateWithClaude(answers)

    // Create submission object
    const submission = {
      telegram,
      email,
      results: evaluations,
      timestamp: new Date().toISOString(),
      score: evaluations.filter(e => e.isCorrect).length,
      total: evaluations.length
    }

    // Determine day number and if passed
    const dayNumber = submission.total === 9 ? 2 : submission.total === 10 ? 3 : submission.total === 6 ? 4 : submission.total === 12 ? 5 : 2
    const passRequirement = submission.total === 9 ? 5 : submission.total === 10 ? 6 : submission.total === 6 ? 3 : submission.total === 12 ? 7 : 5
    const passed = submission.score >= passRequirement

    // Get attempt number (how many times user took this day's test)
    try {
      const previousAttempts = await sql`
        SELECT COALESCE(MAX(attempt_number), 0) as max_attempt
        FROM assessment_results
        WHERE telegram_username = ${telegram}
        AND email = ${email}
        AND day = ${dayNumber}
      `
      const attemptNumber = (previousAttempts[0]?.max_attempt || 0) + 1

      // Save to database
      await sql`
        INSERT INTO assessment_results (
          telegram_username,
          email,
          day,
          score,
          total_questions,
          percentage,
          passed,
          attempt_number,
          answers
        ) VALUES (
          ${telegram},
          ${email},
          ${dayNumber},
          ${submission.score},
          ${submission.total},
          ${(submission.score / submission.total) * 100},
          ${passed},
          ${attemptNumber},
          ${JSON.stringify(evaluations)}
        )
      `

      console.log(`Saved Day ${dayNumber} assessment for ${telegram} (attempt #${attemptNumber})`)
    } catch (dbError) {
      console.error('Error saving to database:', dbError)
      // Continue even if database save fails
    }

    // Send Telegram notification
    await sendTelegramNotification(submission)

    // Log for monitoring
    console.log('=== NEW TRAINING SUBMISSION ===')
    console.log('Day:', dayNumber)
    console.log('Telegram:', telegram)
    console.log('Email:', email)
    console.log('Score:', submission.score, '/', submission.total)
    console.log('Passed:', passed)
    console.log('Timestamp:', submission.timestamp)
    console.log('=====================================')

    return NextResponse.json(
      { 
        success: true,
        evaluations,
        message: 'Assessment submitted successfully'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Training evaluation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    )
  }
}
