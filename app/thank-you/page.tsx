'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink, CheckCircle, XCircle } from 'lucide-react'

export default function ThankYouPage() {
  const router = useRouter()
  const [isQualified, setIsQualified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showTerms, setShowTerms] = useState(true)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

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
    
    // Check if already agreed to terms
    const termsAgreed = localStorage.getItem('luxlife-terms-agreed')
    if (termsAgreed === 'true') {
      setShowTerms(false)
      setAgreedToTerms(true)
    }
    
    setLoading(false)
  }, [router])

  const handleAgreeToTerms = async () => {
    localStorage.setItem('luxlife-terms-agreed', 'true')
    setAgreedToTerms(true)
    setShowTerms(false)
    
    // Send notification that user agreed to terms and is ready to book
    try {
      const applicantData = JSON.parse(localStorage.getItem('luxlife-application-data') || '{}')
      console.log('Sending notification with data:', applicantData)
      
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...applicantData,
          isQualified: true,
          termsAgreed: true,
          readyToBook: true
        })
      })
      
      const result = await response.json()
      console.log('Notification response:', result)
    } catch (error) {
      console.error('Failed to send terms agreement notification:', error)
    }
  }

  const handleDisagreeToTerms = () => {
    if (confirm('Are you sure? You will not be able to book a call without agreeing to the terms.')) {
      router.push('/')
    }
  }

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
    <div className="min-h-screen pt-24 md:pt-32 pb-8 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="rounded-xl shadow-lg p-6 md:p-8 mb-8" style={{ background: 'var(--surface)' }}>
          {isQualified ? (
            showTerms ? (
              // SHOW TERMS AGREEMENT FIRST
              <div className="space-y-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#10b981' }}>
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <h1 className="text-2xl md:text-4xl font-bold text-center" style={{ color: 'var(--text-primary)' }}>
                  🎉 Congratulations! You Qualified!
                </h1>
                
                <p className="text-lg md:text-xl text-center mb-8" style={{ color: 'var(--text-secondary)' }}>
                  Before scheduling your call, please review and agree to the following terms:
                </p>

                {/* Terms Section */}
                <div className="space-y-4">
                  {/* Term 1 */}
                  <div className="rounded-xl p-4 md:p-6 border-2" style={{ background: 'var(--bg-primary)', borderColor: 'var(--accent)' }}>
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
                        <span className="text-xl md:text-2xl">📝</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base md:text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                          1. OnlyFans Chatter Position
                        </h3>
                        <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
                          You will be working as a professional chatter for OnlyFans creators. This role involves engaging with subscribers through messages to build relationships and drive revenue. You must be comfortable with the adult content industry and maintain strict professionalism.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Term 2 */}
                  <div className="rounded-xl p-4 md:p-6 border-2" style={{ background: 'var(--bg-primary)', borderColor: 'var(--accent)' }}>
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
                        <span className="text-xl md:text-2xl">🤐</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base md:text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                          2. Non-Disclosure Agreement (NDA)
                        </h3>
                        <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
                          You agree to sign an NDA and maintain complete confidentiality about your work, clients, strategies, and any information related to this position. You cannot discuss your job details with anyone outside the company, including friends and family.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Term 3 - Salary */}
                  <div className="rounded-xl p-4 md:p-6 border-2" style={{ background: 'var(--bg-primary)', borderColor: 'var(--accent)' }}>
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
                        <span className="text-xl md:text-2xl">💰</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base md:text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                          3. Performance-Based Salary Structure
                        </h3>
                        <p className="mb-4 text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
                          Your hourly rate is based on the revenue you generate per shift. The more successful you are, the higher your earnings. Payment is bi-weekly to your Philippine bank account or in crypto to binance (you will receive a setup guide on how to setup binance).
                        </p>
                        <div className="overflow-x-auto -mx-2 md:mx-0">
                          <table className="w-full text-xs md:text-sm border-collapse min-w-[500px]">
                            <thead>
                              <tr style={{ background: 'var(--accent)' }}>
                                <th className="p-2 md:p-3 text-left text-white font-semibold">Revenue Generated</th>
                                <th className="p-2 md:p-3 text-left text-white font-semibold">Hourly Rate</th>
                                <th className="p-2 md:p-3 text-left text-white font-semibold">Monthly (160h)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                ['$0–499', '₱85.29/hr', '₱13,646'],
                                ['$500–999', '₱113.72/hr', '₱18,195'],
                                ['$1000–1499', '₱170.58/hr', '₱27,293'],
                                ['$1500–1999', '₱199.01/hr', '₱31,842'],
                                ['$2000–2499', '₱227.44/hr', '₱36,390'],
                                ['$2500–2999', '₱284.30/hr', '₱45,488'],
                                ['$3000–3499', '₱369.59/hr', '₱59,134'],
                                ['$3500–3999', '₱454.88/hr', '₱72,781'],
                                ['$4000–4499', '₱568.60/hr', '₱90,976'],
                                ['$4500–4999', '₱625.46/hr', '₱100,074'],
                                ['$5000–5499', '₱682.32/hr', '₱109,171'],
                                ['$5500–5999', '₱824.47/hr', '₱131,939'],
                                ['$6000–6499', '₱966.62/hr', '₱154,707'],
                                ['$6500+', '₱1,108.77/hr', '₱177,475'],
                              ].map((row, i) => (
                                <tr key={i} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--bg-soft)' }}>
                                  <td className="p-2 md:p-3 whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{row[0]}</td>
                                  <td className="p-2 md:p-3 font-semibold whitespace-nowrap" style={{ color: 'var(--accent)' }}>{row[1]}</td>
                                  <td className="p-2 md:p-3 font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{row[2]}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-4 p-3 md:p-4 rounded-lg" style={{ background: 'var(--surface)', border: '2px solid var(--accent)' }}>
                          <p className="text-sm md:text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                            🎁 Team Success Bonus
                          </p>
                          <p className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>
                            When the whole team works together and meets the monthly revenue goals (set fairly according to each creator), everyone receives an additional success bonus! This encourages teamwork and rewards collective achievement.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Term 4 */}
                  <div className="rounded-xl p-4 md:p-6 border-2" style={{ background: 'var(--bg-primary)', borderColor: 'var(--accent)' }}>
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
                        <span className="text-xl md:text-2xl">⏱️</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base md:text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                          4. Time Tracking with TimeDoctor
                        </h3>
                        <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
                          Your work hours will be tracked using TimeDoctor software to ensure accurate payment and productivity. You must work exclusively for us during paid hours - no multitasking with other jobs or personal activities. Screenshots and activity levels are monitored.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Term 5 */}
                  <div className="rounded-xl p-4 md:p-6 border-2" style={{ background: 'var(--bg-primary)', borderColor: 'var(--accent)' }}>
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
                        <span className="text-xl md:text-2xl">⚡</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base md:text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                          5. Fast Response Time Requirement
                        </h3>
                        <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
                          You must maintain an average response time of <strong>90 seconds or faster</strong> to subscriber messages. Optimal performance is under 60 seconds. Quick, engaging responses are crucial for subscriber retention and revenue generation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agreement Buttons */}
                <div className="rounded-xl p-6 md:p-8 mt-8" style={{ background: 'var(--bg-soft)', border: '2px solid var(--accent)' }}>
                  <h3 className="text-lg md:text-xl font-bold mb-4 text-center" style={{ color: 'var(--text-primary)' }}>
                    Do you agree to all the terms above?
                  </h3>
                  <p className="text-center mb-6 text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
                    By clicking "I Agree", you confirm that you have read, understood, and accept all terms and conditions.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleAgreeToTerms}
                      className="inline-flex items-center justify-center gap-2 text-white text-base md:text-lg font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                    >
                      <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                      I Agree - Continue
                    </button>
                    <button
                      onClick={handleDisagreeToTerms}
                      className="inline-flex items-center justify-center gap-2 text-white text-base md:text-lg font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                    >
                      <XCircle className="w-5 h-5 md:w-6 md:h-6" />
                      I Do Not Agree
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // SHOW BOOKING LINK AFTER TERMS AGREED
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#10b981' }}>
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  🎉 You're All Set!
                </h1>
                
                <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
                  Thank you for agreeing to the terms. Now let's schedule your introduction call!
                </p>

                <div className="rounded-lg p-6 my-8" style={{ background: 'var(--bg-primary)', border: '2px solid var(--accent)' }}>
                  <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                    🚀 Schedule Your 15-Minute Call
                  </h2>
                  <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                    Book a time that works best for you to discuss:
                  </p>
                  <ul className="text-left mb-6 space-y-2" style={{ color: 'var(--text-secondary)' }}>
                    <li className="flex items-start">
                      <span className="mr-2" style={{ color: 'var(--accent)' }}>✓</span>
                      <span>Your assigned creator and account details</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2" style={{ color: 'var(--accent)' }}>✓</span>
                      <span>Training schedule and onboarding process</span>
              </li>
                    <li className="flex items-start">
                      <span className="mr-2" style={{ color: 'var(--accent)' }}>✓</span>
                      <span>Contract signing and NDA</span>
              </li>
                    <li className="flex items-start">
                      <span className="mr-2" style={{ color: 'var(--accent)' }}>✓</span>
                      <span>Answer any questions you have</span>
              </li>
            </ul>
                  
                  <a 
                    href="https://cal.com/luxlife-agency-ddefis/15min" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center text-white text-xl font-bold px-12 py-5 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl gap-3"
                    style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}
                  >
                    📅 Schedule Your Call Now
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
            )
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
