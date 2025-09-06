import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, instagram, reach, message } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create submission object
    const submission = {
      id: Date.now().toString(),
      name,
      email,
      instagram: instagram || 'Not provided',
      reach: reach || 'Not provided',
      message,
      timestamp: new Date().toISOString(),
      status: 'new'
    }

    // Define the path for storing submissions
    const dataDir = path.join(process.cwd(), 'data')
    const filePath = path.join(dataDir, 'submissions.json')
    
    // Ensure data directory exists
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
    }
    
    // Read existing submissions or create new array
    let submissions = []
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8')
      submissions = JSON.parse(fileContent)
    } catch {
      // File doesn't exist yet, start with empty array
      submissions = []
    }
    
    // Add new submission
    submissions.push(submission)
    
    // Save updated submissions
    await fs.writeFile(filePath, JSON.stringify(submissions, null, 2))
    
    // Log for monitoring
    console.log('=== NEW CONTACT FORM SUBMISSION ===')
    console.log('ID:', submission.id)
    console.log('Name:', name)
    console.log('Email:', email)
    console.log('Instagram:', instagram)
    console.log('Reach:', reach)
    console.log('Message:', message)
    console.log('Timestamp:', submission.timestamp)
    console.log('=====================================')

    // Optional: Send email notification to office@postemediallc.com
    // You can integrate with SendGrid, Resend, or other email services here

    return NextResponse.json(
      { 
        success: true,
        id: submission.id,
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