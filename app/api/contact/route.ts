import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, instagramHandle, monthlyReach, message } = body

    // Validate required fields
    if (!fullName || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Email content
    const emailContent = `
New Contact Form Submission - POSTE MEDIA LLC

Name: ${fullName}
Email: ${email}
Instagram Handle: ${instagramHandle || 'Not provided'}
Monthly Reach: ${monthlyReach || 'Not provided'}

Message:
${message}

---
Sent from POSTE MEDIA LLC website contact form
    `.trim()

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #000000, #1a1a2e, #16213e); color: white; padding: 20px; border-radius: 10px;">
      <h2 style="color: #ff0080; text-align: center; margin-bottom: 30px;">New Contact Form Submission</h2>
      <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #00ffff; margin-top: 0;">Contact Details</h3>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Instagram Handle:</strong> ${instagramHandle || 'Not provided'}</p>
        <p><strong>Monthly Reach:</strong> ${monthlyReach || 'Not provided'}</p>
      </div>
      <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 8px;">
        <h3 style="color: #00ffff; margin-top: 0;">Message</h3>
        <p style="line-height: 1.6;">${message}</p>
      </div>
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.2);">
        <p style="color: #888; font-size: 12px;">Sent from POSTE MEDIA LLC website contact form</p>
      </div>
    </div>
    `

    // For now, we'll use a simpler approach that works in development
    // In production, you should set up proper email service credentials
    
    // Log the email content for now (you can see this in Vercel logs)
    console.log('=== NEW CONTACT FORM SUBMISSION ===')
    console.log('To: luxlife.agentur@gmail.com')
    console.log('From:', email)
    console.log('Subject: New Lead from POSTE MEDIA LLC website')
    console.log('Content:', emailContent)
    console.log('=====================================')

    // You can also send this to a webhook service like Zapier, Make.com, or n8n
    // Example webhook call:
    try {
      // Uncomment and replace with your webhook URL if you want to use a service
      /*
      await fetch('YOUR_WEBHOOK_URL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'luxlife.agentur@gmail.com',
          from: email,
          subject: `New Lead: ${fullName} - POSTE MEDIA LLC`,
          message: emailContent,
          formData: { fullName, email, instagramHandle, monthlyReach, message }
        })
      })
      */
      
      console.log('Contact form data processed successfully')
    } catch (error) {
      console.error('Processing error:', error)
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Thank you for your message! We will get back to you within 24 hours.' 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
