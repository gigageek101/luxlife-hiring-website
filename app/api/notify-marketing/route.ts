import { NextRequest, NextResponse } from 'next/server'

// Telegram Bot Configuration for Marketing Applications
const TELEGRAM_BOT_TOKEN = '8551143975:AAHzwcyRz01naNrYdWXbfGcd4VLOINDyiXM'
const TELEGRAM_CHAT_ID = '2108767741'

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
🎯 *NEW QUALIFIED MARKETING APPLICANT - READY TO BOOK!* 🎯

━━━━━━━━━━━━━━━━━━━━
👤 *APPLICANT DETAILS*
━━━━━━━━━━━━━━━━━━━━

📝 *Name:* ${applicantData.fullName || 'N/A'}
📧 *Email:* ${applicantData.email || 'N/A'}
🏙️ *City:* ${applicantData.city || 'N/A'}
🎂 *Age:* ${applicantData.age || 'N/A'} years

━━━━━━━━━━━━━━━━━━━━
📊 *TEST RESULTS*
━━━━━━━━━━━━━━━━━━━━

📚 *English Quiz:* ${englishScore} ✅
🧠 *Memory Test:* ${memoryScore} ✅
🎓 *Education:* ${applicantData.educationType || 'N/A'} ✅
💻 *Equipment:* Has PC ✅
🗣️ *English Level:* ${applicantData.englishRating || 'N/A'}

━━━━━━━━━━━━━━━━━━━━
✅ *STATUS*
━━━━━━━━━━━━━━━━━━━━

✅ All Tests Passed
✅ Terms & Conditions Agreed
✅ Ready to Schedule Interview
📅 Booking Link: https://cal.com/luxlifeagency/15min

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received marketing application notification request')
    
    // Send Telegram notification (only if terms agreed)
    const sent = await sendTelegramNotification(body)
    
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
