import { NextRequest, NextResponse } from 'next/server'

// Telegram Bot Configuration (same as Poste Media)
const TELEGRAM_BOT_TOKEN = '8491965924:AAHBz28OuBgEKIXZywBENwl2xe-y1rVNQfk'
const TELEGRAM_CHAT_ID = '2108767741'

async function sendTelegramNotification(applicantData: any) {
  try {
    const isQualified = applicantData.isQualified
    const readyToBook = applicantData.readyToBook
    
    // If this is a "ready to book" notification, send a different message
    if (readyToBook && applicantData.termsAgreed) {
      const message = `
🎯 *APPLICANT READY TO BOOK CALL!* 🎯

━━━━━━━━━━━━━━━━━━━━
👤 *APPLICANT DETAILS*
━━━━━━━━━━━━━━━━━━━━

📝 *Name:* ${applicantData.fullName || 'N/A'}
📧 *Email:* ${applicantData.email || 'N/A'}
🏙️ *City:* ${applicantData.city || 'N/A'}
🎂 *Age:* ${applicantData.age || 'N/A'} years

━━━━━━━━━━━━━━━━━━━━
✅ *STATUS UPDATE*
━━━━━━━━━━━━━━━━━━━━

✅ Application Completed & Qualified
✅ Terms & Conditions Agreed
✅ Ready to Schedule Interview
📅 Booking Link: https://cal.com/luxlife-agency-ddefis/15min

━━━━━━━━━━━━━━━━━━━━
⚡ *ACTION REQUIRED*
━━━━━━━━━━━━━━━━━━━━

🔔 Watch for their booking confirmation
📞 Prepare for introduction call
💼 Have onboarding materials ready

⏰ *Updated:* ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })} (Manila Time)
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
        console.log('Terms agreement notification sent successfully!')
        return true
      }
    }
    
    // Create executive summary with emojis
    const statusEmoji = isQualified ? '✅' : '❌'
    const statusText = isQualified ? '*QUALIFIED APPLICANT*' : '*NOT QUALIFIED*'
    
    // Calculate scores
    const englishScore = applicantData.quizAnswers 
      ? `${applicantData.quizAnswers.filter((a: any) => a.isCorrect).length}/8`
      : 'N/A'
    
    const memoryScore = applicantData.memoryTestResult
      ? `${applicantData.memoryTestResult.correctCount}/6`
      : 'N/A'
    
    // Build detailed message
    let message = `
${statusEmoji} *NEW APPLICATION COMPLETED* ${statusEmoji}

🎯 *STATUS:* ${statusText}

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

📚 *English Quiz:* ${englishScore} ${applicantData.quizAnswers && applicantData.quizAnswers.filter((a: any) => a.isCorrect).length >= 4 ? '✅' : '❌'}
🧠 *Memory Test:* ${memoryScore} ${applicantData.memoryTestResult && applicantData.memoryTestResult.correctCount >= 3 ? '✅' : '❌'}
🎓 *Education:* ${applicantData.educationType || 'N/A'} ${applicantData.hasFinishedEducation ? '✅' : '❌'}
💻 *Equipment:* ${applicantData.hasWorkingPc ? 'Has PC ✅' : 'No PC ❌'}
🗣️ *English Level:* ${applicantData.englishRating || 'N/A'}

━━━━━━━━━━━━━━━━━━━━
📈 *QUALIFICATION BREAKDOWN*
━━━━━━━━━━━━━━━━━━━━
`

    // Add detailed breakdown
    const englishCorrect = applicantData.quizAnswers ? applicantData.quizAnswers.filter((a: any) => a.isCorrect).length : 0
    const englishPassed = englishCorrect >= 4
    const memoryCorrect = applicantData.memoryTestResult ? applicantData.memoryTestResult.correctCount : 0
    const memoryPassed = memoryCorrect >= 3
    const ageQualified = applicantData.age >= 19 && applicantData.age <= 50
    const educationQualified = applicantData.hasFinishedEducation && applicantData.educationType !== 'Student'
    const englishRatingQualified = applicantData.englishRating !== 'Very Bad' && applicantData.englishRating !== 'Bad'
    const equipmentQualified = applicantData.hasWorkingPc === true

    message += `
${englishPassed ? '✅' : '❌'} English Quiz: ${englishCorrect}/8 (Need 4+)
${memoryPassed ? '✅' : '❌'} Memory Test: ${memoryCorrect}/6 (Need 3+)
${ageQualified ? '✅' : '❌'} Age: ${applicantData.age} (19-50 required)
${educationQualified ? '✅' : '❌'} Education: Completed
${englishRatingQualified ? '✅' : '❌'} English Self-Rating: ${applicantData.englishRating}
${equipmentQualified ? '✅' : '❌'} Equipment: Working PC/Laptop
`

    if (isQualified) {
      message += `
━━━━━━━━━━━━━━━━━━━━
🎉 *NEXT STEPS*
━━━━━━━━━━━━━━━━━━━━

✅ Applicant can now book a call
📅 They will schedule via Cal.com
📋 They must agree to terms first
🤝 Ready for onboarding!
`
    } else {
      message += `
━━━━━━━━━━━━━━━━━━━━
⚠️ *DISQUALIFICATION REASON*
━━━━━━━━━━━━━━━━━━━━

${applicantData.disqualificationReason || 'Did not meet minimum requirements'}

💡 Applicant was informed course is full
🔄 Can reapply after improving skills
`
    }

    message += `
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
    console.log('Received application notification request')
    
    // Send Telegram notification
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

