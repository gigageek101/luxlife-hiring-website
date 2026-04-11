import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// Telegram Bot Configuration for Backend Applications
const TELEGRAM_BOT_TOKEN = '8596760228:AAH9R77vvMcRAAtPGhwUhD9qc-or4ZRMQww'
const TELEGRAM_CHAT_ID = '8603718832'

async function sendTelegramNotification(applicantData: any) {
  try {
    // Only send notification if terms were agreed (qualified applicants only)
    if (!applicantData.termsAgreed) {
      console.log('Skipping notification - terms not agreed yet')
      return true
    }

    // Calculate scores
    const englishScore = applicantData.quizAnswers 
      ? `${applicantData.quizAnswers.filter((a: any) => a.isCorrect).length}/8`
      : 'N/A'
    
    const memoryScore = applicantData.memoryTestResult
      ? `${applicantData.memoryTestResult.correctCount}/6`
      : 'N/A'
    
    // Build detailed message for qualified applicant who agreed to terms
    const message = `
🎯 *NEW QUALIFIED APPLICANT - READY TO BOOK!* 🎯

━━━━━━━━━━━━━━━━━━━━
👤 *APPLICANT DETAILS*
━━━━━━━━━━━━━━━━━━━━

📝 *Name:* ${applicantData.fullName || 'N/A'}
📧 *Email:* ${applicantData.email || 'N/A'}
💬 *Telegram:* @${applicantData.telegramUsername || 'N/A'}
🏙️ *City:* ${applicantData.city || 'N/A'}
🎂 *Age:* ${applicantData.age || 'N/A'} years

━━━━━━━━━━━━━━━━━━━━
📊 *TEST RESULTS*
━━━━━━━━━━━━━━━━━━━━

📚 *English Quiz:* ${englishScore} ✅
🧠 *Memory Test:* ${memoryScore} ✅
⌨️ *Typing Speed:* ${applicantData.typingTestResult?.wpm || 'N/A'} WPM ✅
🌐 *Download Speed:* ${applicantData.speedTestResult?.downloadSpeed || 'N/A'} Mbps ✅
🎓 *Education:* ${applicantData.educationType || 'N/A'} ✅
💻 *Equipment:* Has PC ✅
🗣️ *English Level:* ${applicantData.englishRating || 'N/A'}

━━━━━━━━━━━━━━━━━━━━
✅ *STATUS*
━━━━━━━━━━━━━━━━━━━━

✅ All Tests Passed
✅ Terms & Conditions Agreed
✅ Ready to Schedule Interview
📅 Booking Link: https://cal.com/luxlife-agency-ddefis/15min

━━━━━━━━━━━━━━━━━━━━
⚡ *ACTION REQUIRED*
━━━━━━━━━━━━━━━━━━━━

🔔 Watch for their Cal.com booking
📞 Prepare for introduction call
💼 Have onboarding materials ready
🤝 Ready to discuss next steps on call

━━━━━━━━━━━━━━━━━━━━
⏰ *Submitted:* ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })} (Manila Time)
━━━━━━━━━━━━━━━━━━━━
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
      return false
    } else {
      console.log('Telegram notification sent successfully!')
      return true
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error)
    return false
  }
}

async function markTermsAccepted(applicantData: any) {
  try {
    const email = applicantData.email || null
    const fullName = applicantData.fullName || null

    const updated = await sql`
      UPDATE inbound_leads SET terms_accepted = true
      WHERE position_type = 'backend' AND terms_accepted = false
        AND (email = ${email} OR full_name = ${fullName})
    `

    if (updated.length === 0) {
      console.log('No pending lead found to update, inserting fresh row')
      const englishScore = applicantData.quizAnswers
        ? applicantData.quizAnswers.filter((a: any) => a.isCorrect).length
        : null
      const memoryScore = applicantData.memoryTestResult?.correctCount ?? null
      await sql`
        INSERT INTO inbound_leads (
          full_name, email, telegram_username, city, age, position_type,
          english_quiz_score, english_quiz_total,
          memory_test_score, memory_test_total,
          education_type, english_rating, quiz_answers, qualified,
          typing_wpm, typing_accuracy, typing_passed,
          download_speed, upload_speed, speed_passed, terms_accepted
        ) VALUES (
          ${fullName}, ${email},
          ${applicantData.telegramUsername || null},
          ${applicantData.city || null}, ${applicantData.age || null},
          ${'backend'}, ${englishScore}, ${8}, ${memoryScore}, ${6},
          ${applicantData.educationType || null}, ${applicantData.englishRating || null},
          ${JSON.stringify(applicantData.quizAnswers || [])}, ${true},
          ${applicantData.typingTestResult?.wpm ?? null},
          ${applicantData.typingTestResult?.accuracy ?? null},
          ${applicantData.typingTestResult?.passed ?? null},
          ${applicantData.speedTestResult?.downloadSpeed ?? null},
          ${applicantData.speedTestResult?.uploadSpeed ?? null},
          ${applicantData.speedTestResult?.passed ?? null},
          ${true}
        )
      `
    }
    console.log('Lead terms accepted')
  } catch (error) {
    console.error('Error updating lead:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received application notification request')
    
    // Send Telegram notification (only if terms agreed)
    const sent = await sendTelegramNotification(body)
    
    if (body.termsAgreed) {
      await markTermsAccepted(body)
    }
    
    if (sent) {
      return NextResponse.json(
        { success: true, message: 'Notification sent' },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to send notification' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Notification API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
