'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export default function ThankYouPage() {
  const router = useRouter()
  const [isQualified, setIsQualified] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user completed the application
    const completed = localStorage.getItem('luxlife-application-completed')
    if (!completed) {
      router.push('/apply')
      return
    }

    // Check if user is qualified
    const qualified = localStorage.getItem('luxlife-application-qualified')
    setIsQualified(qualified === 'true')
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--accent)' }}></div>
          <p style={{ color: 'var(--text-primary)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-xl shadow-lg p-8 mb-8" style={{ background: 'var(--surface)' }}>
          {isQualified ? (
            // QUALIFIED USER - Show Cal.com booking link
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#10b981' }}>
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                🎉 Congratulations! You Qualified!
              </h1>
              
              <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
                You've successfully passed all our qualification tests. Welcome to the HiringPhilippines community!
              </p>

              <div className="rounded-lg p-6 my-8" style={{ background: 'var(--bg-primary)', border: '2px solid var(--accent)' }}>
                <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  🚀 Next Step: Schedule Your Introduction Call
                </h2>
                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Congratulations on passing the qualification! The next step is to schedule a 15-minute introduction call with our team to discuss:
                </p>
                <ul className="text-left mb-6 space-y-2" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-start">
                    <span className="mr-2" style={{ color: 'var(--accent)' }}>✓</span>
                    <span>Available job opportunities that match your profile</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2" style={{ color: 'var(--accent)' }}>✓</span>
                    <span>Next steps in the hiring process</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2" style={{ color: 'var(--accent)' }}>✓</span>
                    <span>Answer any questions you may have</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2" style={{ color: 'var(--accent)' }}>✓</span>
                    <span>Access to our exclusive Discord community</span>
                  </li>
                </ul>
                
                <a 
                  href="https://cal.com/luxlife-agency-ddefis/15min" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-white text-xl font-bold px-12 py-5 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl gap-3"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}
                >
                  📅 Schedule Your 15-Minute Call
                  <ExternalLink className="w-6 h-6" />
                </a>
              </div>

              <div className="rounded-lg p-6" style={{ background: 'var(--bg-soft)' }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  📌 Important Reminders:
                </h3>
                <ul className="text-left space-y-2" style={{ color: 'var(--text-secondary)' }}>
                  <li>• Pick a time that works best for you</li>
                  <li>• Make sure you're in a quiet place for the call</li>
                  <li>• Have your questions ready</li>
                  <li>• Be on time - punctuality matters!</li>
                </ul>
              </div>

              <div className="pt-6">
                <Link 
                  href="/"
                  className="inline-flex items-center gap-2 text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          ) : (
            // DISQUALIFIED USER - Course is full message
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#ef4444' }}>
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Application Not Approved
              </h1>
              
              <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
                Thank you for your interest in joining our program.
              </p>

              <div className="rounded-lg p-6 my-8" style={{ background: 'var(--bg-primary)', border: '2px solid #ef4444' }}>
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Course Currently Full
                </h3>
                <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Unfortunately, you did not meet all the qualification requirements at this time. Our course is currently at full capacity.
                </p>
                <p style={{ color: 'var(--text-muted)' }}>
                  We encourage you to work on improving your skills and qualifications. You're welcome to reapply in the future when new spots open up.
                </p>
              </div>

              <div className="rounded-lg p-6 mb-6" style={{ background: 'var(--bg-soft)' }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  💡 Tips for Next Time:
                </h3>
                <ul className="text-left space-y-2" style={{ color: 'var(--text-secondary)' }}>
                  <li>• Practice your English skills - aim for at least 50% on the quiz</li>
                  <li>• Work on your memory and attention to detail</li>
                  <li>• Ensure you meet all basic requirements</li>
                  <li>• Check our blog for career development tips</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/"
                  className="inline-flex items-center justify-center text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}
                >
                  Back to Home
                </Link>
                <Link 
                  href="/blog"
                  className="inline-flex items-center justify-center font-semibold px-8 py-3 rounded-lg border-2 transition-all duration-300"
                  style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                >
                  Read Our Blog
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
