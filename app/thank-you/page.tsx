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
            // QUALIFIED USER - Show Discord link
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
            // DISQUALIFIED USER - Generic thank you message
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--accent)' }}>
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Thank You for Applying
              </h1>
              
              <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
                We appreciate you taking the time to complete our application process.
              </p>

              <div className="rounded-lg p-6 my-8" style={{ background: 'var(--bg-primary)' }}>
                <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Your application has been received and is under review. We will get back to you soon if there's a match.
                </p>
                <p style={{ color: 'var(--text-muted)' }}>
                  In the meantime, feel free to explore our website for career tips and insights.
                </p>
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
