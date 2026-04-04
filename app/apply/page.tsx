'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ApplicantData, educationTypes, englishRatings, MemoryTestResult, TypingTestResult, SpeedTestResult } from '@/lib/types'
import { quizQuestions } from '@/lib/quiz-questions'
import { config } from '@/lib/config'
import { typingTestTexts } from '@/lib/typing-test-texts'

const TOTAL_STEPS = 10

const initialData: ApplicantData = {
  currentStep: 1,
  isDisqualified: false,
  isCompleted: false,
}

export default function ApplyPage() {
  const [applicantData, setApplicantData] = useState<ApplicantData>(initialData)
  const [loading, setLoading] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<any[]>([])
  const [memoryTestResult, setMemoryTestResult] = useState<MemoryTestResult | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [hasAcknowledgedWarning, setHasAcknowledgedWarning] = useState(false)
  const router = useRouter()

  // Ensure we're on the client side to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load existing application data on mount (client-side only)
  useEffect(() => {
    if (!isClient) return
    
    // Check if user already completed an application
    const completedApplication = localStorage.getItem('luxlife-application-completed')
    if (completedApplication) {
      // User already completed - redirect to thank you page
      router.push('/thank-you')
      return
    }
    
    const savedData = localStorage.getItem('luxlife-application-data')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setApplicantData(parsed)
        if (parsed.quizAnswers) {
          setQuizAnswers(parsed.quizAnswers)
        }
      } catch (error) {
        console.error('Error loading saved data:', error)
      }
    }
  }, [isClient, router])

  const saveToLocalStorage = (data: ApplicantData) => {
    try {
      localStorage.setItem('luxlife-application-data', JSON.stringify(data))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  const checkDisqualification = (data: ApplicantData, step: number): { disqualified: boolean, reason?: string } => {
    switch (step) {
      case 2:
        if (data.age && (data.age < config.minAge || data.age > config.maxAge)) {
          return { disqualified: true, reason: `Age must be between ${config.minAge} and ${config.maxAge} years old.` }
        }
        break
      case 3:
        if (data.hasFinishedEducation === false) {
          return { disqualified: true, reason: 'You must have finished your education to apply.' }
        }
        if (data.educationType === 'Student') {
          return { disqualified: true, reason: 'Current students are not eligible to apply.' }
        }
        break
      case 4:
        if (data.englishRating === 'Very Bad' || data.englishRating === 'Bad') {
          return { disqualified: true, reason: 'Good English skills are required for this position.' }
        }
        break
      case 5:
        if (data.hasWorkingPc === false) {
          return { disqualified: true, reason: 'A working PC or laptop is required for this position.' }
        }
        break
      case 6:
        if (data.quizAnswers && data.quizAnswers.length > 0) {
          const correctAnswers = data.quizAnswers.filter((answer: any) => answer.isCorrect).length
          if (correctAnswers < config.englishMinCorrect) {
            return { disqualified: true, reason: `You need to answer at least ${config.englishMinCorrect} out of ${data.quizAnswers.length} questions correctly on the English quiz.` }
          }
        }
        break
      case 7:
        if (data.memoryTestResult && data.memoryTestResult.correctCount < config.memoryTestMinCorrect) {
          return { disqualified: true, reason: `You need to get at least ${config.memoryTestMinCorrect} out of ${data.memoryTestResult.totalCount} correct on the memory test.` }
        }
        break
      case 8:
        if (data.typingTestResult && data.typingTestResult.wpm < config.typingMinWpm) {
          return { disqualified: true, reason: `You need at least ${config.typingMinWpm} WPM on the typing test. You got ${Math.round(data.typingTestResult.wpm)} WPM.` }
        }
        break
      case 9:
        if (data.speedTestResult && data.speedTestResult.downloadSpeed < config.speedMinDownload) {
          return { disqualified: true, reason: `You need at least ${config.speedMinDownload} Mbps download speed. Your speed was ${data.speedTestResult.downloadSpeed.toFixed(1)} Mbps.` }
        }
        break
    }
    return { disqualified: false }
  }

  const handleNext = async (stepData: Partial<ApplicantData>) => {
    const updatedData = { ...applicantData, ...stepData }
    
    // Check for disqualification
    const disqualificationCheck = checkDisqualification(updatedData, updatedData.currentStep)
    
    if (disqualificationCheck.disqualified) {
      updatedData.isDisqualified = true
      updatedData.disqualificationReason = disqualificationCheck.reason
    }
    
    updatedData.currentStep += 1

    setApplicantData(updatedData)
    saveToLocalStorage(updatedData)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // Track attempt as soon as results page is reached (before user can close tab)
    if (updatedData.currentStep === TOTAL_STEPS) {
      const isQualified = !updatedData.isDisqualified
      fetch('/api/track-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionType: 'backend', qualified: isQualified })
      }).catch(() => {})
    }

    if (updatedData.currentStep > TOTAL_STEPS) {
      updatedData.isCompleted = true
      saveToLocalStorage(updatedData)
      
      const isQualified = !updatedData.isDisqualified
      localStorage.setItem('luxlife-application-completed', 'true')
      localStorage.setItem('luxlife-application-qualified', isQualified ? 'true' : 'false')
      
      router.push('/thank-you')
    }
  }

  const handleQuizSubmit = () => {
    // Ensure we have all 8 questions answered
    const finalAnswers = [...quizAnswers]
    
    // Fill any missing questions as incorrect
    for (let i = finalAnswers.length; i < quizQuestions.length; i++) {
      finalAnswers.push({
        questionId: quizQuestions[i].id,
        selectedOption: -1,
        answer: 'Not answered',
        isCorrect: false
      })
    }
    
    const correctAnswers = finalAnswers.filter(answer => answer.isCorrect).length
    const score = Math.round((correctAnswers / quizQuestions.length) * 100)
    
    // Pass if at least half correct (4 out of 8)
    const passed = correctAnswers >= config.englishMinCorrect
    
    const updatedData: Partial<ApplicantData> = {
      quizScore: score,
      quizAnswers: finalAnswers
    }

    if (!passed) {
      updatedData.isDisqualified = true
      updatedData.disqualificationReason = `English Quiz: You need at least half correct (${config.englishMinCorrect} out of ${quizQuestions.length}). You got ${correctAnswers}.`
    }
    
    handleNext(updatedData)
  }

  const handleMemoryTestSubmit = (result: MemoryTestResult) => {
    const score = Math.round((result.correctCount / result.totalCount) * 100)
    
    // Pass if at least half correct (3 out of 6)
    const passed = result.correctCount >= config.memoryTestMinCorrect
    
    const updatedData: Partial<ApplicantData> = {
      memoryTestScore: score,
      memoryTestResult: result
    }

    if (!passed) {
      updatedData.isDisqualified = true
      updatedData.disqualificationReason = `Memory Test: You need at least half correct (${config.memoryTestMinCorrect} out of ${result.totalCount}). You got ${result.correctCount}.`
    }
    
    setMemoryTestResult(result)
    handleNext(updatedData)
  }

  if (loading || !isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--accent)' }}></div>
          <p style={{ color: 'var(--text-primary)' }}>Loading your application...</p>
        </div>
      </div>
    )
  }

  if (!hasAcknowledgedWarning) {
    return (
      <div className="min-h-screen pt-24 md:pt-32 pb-8" style={{ background: 'var(--bg-primary)' }}>
        <div className="mx-auto max-w-2xl px-4 md:px-6">
          <div className="rounded-xl shadow-lg p-6 md:p-10" style={{ background: 'var(--surface)' }}>
            <div className="text-center mb-8">
              <img src="/images/warning-focus.png" alt="Focus" className="w-36 h-36 mx-auto mb-5 rounded-2xl object-cover" />
              <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Before You Begin
              </h1>
              <p className="text-sm md:text-base" style={{ color: 'var(--text-muted)' }}>
                Please read the following carefully
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="rounded-lg p-4 border-l-4" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' }}>
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">1️⃣</span>
                  <div>
                    <h3 className="font-bold text-base md:text-lg" style={{ color: '#ef4444' }}>You only have ONE attempt</h3>
                    <p className="text-sm md:text-base mt-1" style={{ color: 'var(--text-secondary)' }}>
                      This application cannot be retaken. Make sure you are fully prepared before starting.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg p-4 border-l-4" style={{ background: 'rgba(255, 107, 0, 0.1)', borderColor: 'var(--accent)' }}>
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">🤫</span>
                  <div>
                    <h3 className="font-bold text-base md:text-lg" style={{ color: 'var(--accent)' }}>Find a quiet, focused space</h3>
                    <p className="text-sm md:text-base mt-1" style={{ color: 'var(--text-secondary)' }}>
                      Sit somewhere calm with no distractions. Close unnecessary tabs and put your phone on silent.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg p-4 border-l-4" style={{ background: 'rgba(59, 130, 246, 0.1)', borderColor: '#3b82f6' }}>
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">⏱️</span>
                  <div>
                    <h3 className="font-bold text-base md:text-lg" style={{ color: '#3b82f6' }}>You have approximately 11 minutes</h3>
                    <p className="text-sm md:text-base mt-1" style={{ color: 'var(--text-secondary)' }}>
                      The entire application includes questions and timed skill tests. Stay focused throughout and give it your best effort.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg p-4 border-l-4" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: '#10b981' }}>
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">💻</span>
                  <div>
                    <h3 className="font-bold text-base md:text-lg" style={{ color: '#10b981' }}>Stable internet required</h3>
                    <p className="text-sm md:text-base mt-1" style={{ color: 'var(--text-secondary)' }}>
                      Part of this application includes an internet speed test. Make sure you have a reliable connection.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setHasAcknowledgedWarning(true)}
              className="w-full py-4 rounded-xl text-white font-bold text-base md:text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', boxShadow: '0 4px 15px rgba(255, 107, 0, 0.4)' }}
            >
              I understand — Start Application
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="mx-auto max-w-2xl px-4 md:px-6">
        {/* Progress Bar */}
        <div className="mb-6 md:mb-8 rounded-xl p-4 md:p-6" style={{ background: 'var(--surface)', border: '2px solid var(--accent)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <span className="text-sm md:text-base font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
              📋 Step {applicantData.currentStep} of {TOTAL_STEPS}
            </span>
            <span className="px-3 py-1 rounded-full text-xs md:text-sm font-semibold inline-block w-fit whitespace-nowrap" style={{ background: 'var(--accent)', color: 'white' }}>
              {Math.round((applicantData.currentStep / TOTAL_STEPS) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 md:h-3 shadow-inner overflow-hidden">
            <div 
              className="h-2 md:h-3 rounded-full transition-all duration-500 shadow-lg"
              style={{ 
                width: `${(applicantData.currentStep / TOTAL_STEPS) * 100}%`,
                background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                boxShadow: '0 2px 8px rgba(255, 107, 0, 0.4)'
              }}
            ></div>
          </div>
          <div className="mt-2 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            ⏱️ Time remaining: ~{Math.max(0, 8 - Math.round((applicantData.currentStep / TOTAL_STEPS) * 8))} min
          </div>
        </div>

        {/* Purpose Statement */}
        <div className="rounded-xl border p-4 md:p-6 mb-4 md:mb-6" style={{ background: 'var(--surface)', borderColor: 'var(--accent)' }}>
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Why we need this information</h3>
              <p className="mt-1 text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
                We use these details to find the <span className="font-medium" style={{ color: 'var(--accent)' }}>perfectly fitting opportunity</span> for your skills and preferences.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl shadow-lg p-4 md:p-8" style={{ background: 'var(--surface)' }}>
          {applicantData.currentStep === 1 && <Step1 onNext={handleNext} data={applicantData} />}
          {applicantData.currentStep === 2 && <Step2 onNext={handleNext} data={applicantData} />}
          {applicantData.currentStep === 3 && <Step3 onNext={handleNext} data={applicantData} />}
          {applicantData.currentStep === 4 && <Step4 onNext={handleNext} data={applicantData} />}
          {applicantData.currentStep === 5 && <Step5 onNext={handleNext} data={applicantData} />}
          {applicantData.currentStep === 6 && (
            <Step6 
              onNext={handleNext} 
              data={applicantData}
              currentQuestionIndex={currentQuestionIndex}
              setCurrentQuestionIndex={setCurrentQuestionIndex}
              quizAnswers={quizAnswers}
              setQuizAnswers={setQuizAnswers}
              onQuizSubmit={handleQuizSubmit}
            />
          )}
          {applicantData.currentStep === 7 && <Step7 onMemoryTestSubmit={handleMemoryTestSubmit} data={applicantData} />}
          {applicantData.currentStep === 8 && <StepTypingTest onNext={handleNext} data={applicantData} />}
          {applicantData.currentStep === 9 && <StepInternetSpeed onNext={handleNext} data={applicantData} />}
          {applicantData.currentStep === TOTAL_STEPS && <StepResults onNext={handleNext} data={applicantData} />}
        </div>
      </div>
    </div>
  )
}

// Step Components
function Step1({ onNext, data }: { onNext: (data: any) => void, data: ApplicantData }) {
  const [formData, setFormData] = useState({
    fullName: data.fullName || '',
    email: data.email || '',
    city: data.city || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ color: 'var(--text-primary)' }}>Personal Information</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg focus:ring-2 focus:border-transparent text-base"
            style={{ 
              background: 'var(--bg-primary)', 
              borderColor: 'var(--text-muted)',
              color: 'var(--text-primary)'
            }}
            placeholder="Enter your full name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Email Address *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg focus:ring-2 focus:border-transparent text-base"
            style={{ 
              background: 'var(--bg-primary)', 
              borderColor: 'var(--text-muted)',
              color: 'var(--text-primary)'
            }}
            placeholder="Enter your email address"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            City *
          </label>
          <input
            type="text"
            required
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg focus:ring-2 focus:border-transparent text-base"
            style={{ 
              background: 'var(--bg-primary)', 
              borderColor: 'var(--text-muted)',
              color: 'var(--text-primary)'
            }}
            placeholder="Enter your city"
          />
        </div>
      </div>
      
      <button
        type="submit"
        className="mt-6 w-full text-white font-semibold py-3 md:py-3.5 px-6 rounded-lg transition-all duration-200 cursor-pointer text-base md:text-lg"
        style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}
      >
        Continue
      </button>
    </form>
  )
}

function Step2({ onNext, data }: { onNext: (data: any) => void, data: ApplicantData }) {
  const [age, setAge] = useState(data.age || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext({ age: parseInt(age.toString()) })
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ color: 'var(--text-primary)' }}>Age Verification</h2>
      
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          How old are you? *
        </label>
        <input
          type="number"
          required
          min="16"
          max="65"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg focus:ring-2 focus:border-transparent text-base"
          style={{ 
            background: 'var(--bg-primary)', 
            borderColor: 'var(--text-muted)',
            color: 'var(--text-primary)'
          }}
          placeholder="Enter your age in years"
        />
      </div>
      
      <button
        type="submit"
        className="mt-6 w-full text-white font-semibold py-3 md:py-3.5 px-6 rounded-lg transition-all duration-200 cursor-pointer text-base md:text-lg"
        style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}
      >
        Continue
      </button>
    </form>
  )
}

function Step3({ onNext, data }: { onNext: (data: any) => void, data: ApplicantData }) {
  const [hasFinishedEducation, setHasFinishedEducation] = useState<boolean | null>(
    data.hasFinishedEducation ?? null
  )
  const [educationType, setEducationType] = useState(data.educationType || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext({ hasFinishedEducation, educationType })
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ color: 'var(--text-primary)' }}>Education</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
            Have you finished your education? *
          </label>
          <div className="space-y-2">
            <label className="flex items-center" style={{ color: 'var(--text-primary)' }}>
              <input
                type="radio"
                name="education"
                value="yes"
                checked={hasFinishedEducation === true}
                onChange={() => setHasFinishedEducation(true)}
                className="mr-3"
                required
              />
              Yes
            </label>
            <label className="flex items-center" style={{ color: 'var(--text-primary)' }}>
              <input
                type="radio"
                name="education"
                value="no"
                checked={hasFinishedEducation === false}
                onChange={() => setHasFinishedEducation(false)}
                className="mr-3"
                required
              />
              No
            </label>
          </div>
        </div>

        {hasFinishedEducation === true && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              What type of education have you completed? *
            </label>
            <select
              required
              value={educationType}
              onChange={(e) => setEducationType(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent"
              style={{ 
                background: 'var(--bg-primary)', 
                borderColor: 'var(--text-muted)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="">Select education type</option>
              {educationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <button
        type="submit"
        className="mt-6 w-full text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 cursor-pointer"
        style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}
      >
        Continue
      </button>
    </form>
  )
}

function Step4({ onNext, data }: { onNext: (data: any) => void, data: ApplicantData }) {
  const [englishRating, setEnglishRating] = useState(data.englishRating || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext({ englishRating })
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ color: 'var(--text-primary)' }}>English Skills</h2>
      
      <div>
        <label className="block text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
          How would you rate your English skills? *
        </label>
        <div className="space-y-2">
          {englishRatings.map((rating) => (
            <label key={rating} className="flex items-center" style={{ color: 'var(--text-primary)' }}>
              <input
                type="radio"
                name="english"
                value={rating}
                checked={englishRating === rating}
                onChange={() => setEnglishRating(rating)}
                className="mr-3"
                required
              />
              {rating}
            </label>
          ))}
        </div>
      </div>
      
      <button
        type="submit"
        className="mt-6 w-full text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 cursor-pointer"
        style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}
      >
        Continue
      </button>
    </form>
  )
}

function Step5({ onNext, data }: { onNext: (data: any) => void, data: ApplicantData }) {
  const [hasWorkingPc, setHasWorkingPc] = useState<boolean | null>(
    data.hasWorkingPc ?? null
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext({ hasWorkingPc })
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ color: 'var(--text-primary)' }}>Equipment</h2>
      
      <div>
        <label className="block text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
          Do you have a working PC or laptop? *
        </label>
        <div className="space-y-2">
          <label className="flex items-center" style={{ color: 'var(--text-primary)' }}>
            <input
              type="radio"
              name="pc"
              value="yes"
              checked={hasWorkingPc === true}
              onChange={() => setHasWorkingPc(true)}
              className="mr-3"
              required
            />
            Yes, I have a working PC/laptop
          </label>
          <label className="flex items-center" style={{ color: 'var(--text-primary)' }}>
            <input
              type="radio"
              name="pc"
              value="no"
              checked={hasWorkingPc === false}
              onChange={() => setHasWorkingPc(false)}
              className="mr-3"
              required
            />
            No, I don't have a working PC/laptop
          </label>
        </div>
      </div>
      
      <button
        type="submit"
        className="mt-6 w-full text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 cursor-pointer"
        style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}
      >
        Continue
      </button>
    </form>
  )
}

function Step6({ 
  onNext, 
  data, 
  currentQuestionIndex, 
  setCurrentQuestionIndex,
  quizAnswers,
  setQuizAnswers,
  onQuizSubmit 
}: { 
  onNext: (data: any) => void
  data: ApplicantData
  currentQuestionIndex: number
  setCurrentQuestionIndex: (index: number) => void
  quizAnswers: any[]
  setQuizAnswers: (answers: any[]) => void
  onQuizSubmit: () => void
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(90) // 90 seconds timer
  const [timerStarted, setTimerStarted] = useState(false)
  
  const currentQuestion = quizQuestions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1

  // Timer effect
  useEffect(() => {
    if (!timerStarted && currentQuestionIndex === 0) {
      setTimerStarted(true)
    }
    
    if (timerStarted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      
      return () => clearTimeout(timer)
    } else if (timerStarted && timeLeft === 0) {
      // Time's up! Auto-submit
      const remainingAnswers = [...quizAnswers]
      for (let i = quizAnswers.length; i < quizQuestions.length; i++) {
        remainingAnswers.push({
          questionId: quizQuestions[i].id,
          selectedOption: -1,
          answer: 'Time expired',
          isCorrect: false
        })
      }
      setQuizAnswers(remainingAnswers)
      onQuizSubmit()
    }
  }, [timerStarted, timeLeft, currentQuestionIndex, onQuizSubmit, quizAnswers, setQuizAnswers])

  useEffect(() => {
    const existingAnswer = quizAnswers[currentQuestionIndex]
    if (existingAnswer) {
      setSelectedAnswer(existingAnswer.selectedOption)
    } else {
      setSelectedAnswer(null)
    }
  }, [currentQuestionIndex, quizAnswers])

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedAnswer(optionIndex)
  }

  const handleNext = () => {
    if (selectedAnswer === null) return

    const newAnswer = {
      questionId: currentQuestion.id,
      selectedOption: selectedAnswer,
      answer: currentQuestion.options[selectedAnswer],
      isCorrect: selectedAnswer === currentQuestion.correctAnswer
    }

    const updatedAnswers = [...quizAnswers]
    updatedAnswers[currentQuestionIndex] = newAnswer
    setQuizAnswers(updatedAnswers)

    if (isLastQuestion) {
      onQuizSubmit()
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const timerColor = timeLeft <= 30 ? '#ef4444' : timeLeft <= 60 ? '#f97316' : '#10b981'

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>English Quiz</h2>
        {timerStarted && (
          <div className="text-lg font-bold px-4 py-2 rounded-lg border-2" style={{ color: timerColor, borderColor: timerColor }}>
            ⏰ {formatTime(timeLeft)}
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
          <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
          <span>Need {config.englishMinCorrect}/{quizQuestions.length} correct</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%`,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))'
            }}
          ></div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          {currentQuestion.question}
        </h3>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <label key={index} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-opacity-50 transition-colors" style={{ borderColor: 'var(--text-muted)', background: selectedAnswer === index ? 'var(--accent-dark)' : 'transparent' }}>
              <input
                type="radio"
                name="quiz-answer"
                value={index}
                checked={selectedAnswer === index}
                onChange={() => handleAnswerSelect(index)}
                className="mr-4"
              />
              <span style={{ color: 'var(--text-primary)' }}>{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-3 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderColor: 'var(--text-muted)', color: 'var(--text-primary)' }}
        >
          Previous
        </button>
        
        <button
          onClick={handleNext}
          disabled={selectedAnswer === null}
          className="text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}
        >
          {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
        </button>
      </div>
    </div>
  )
}

function Step7({ onMemoryTestSubmit, data }: { onMemoryTestSubmit: (result: MemoryTestResult) => void, data: ApplicantData }) {
  const [gameState, setGameState] = useState<'intro' | 'memorize' | 'wait' | 'answer' | 'complete'>('intro')
  const [sequence, setSequence] = useState<string[]>([])
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [currentMemoryIndex, setCurrentMemoryIndex] = useState(0)
  const [showSequence, setShowSequence] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [memorizeCountdown, setMemorizeCountdown] = useState(5)
  
  const memoryItems = ['🔴', '🔵', '⚪', '🟢', '🟡', '🟣']
  const sequenceLength = 6
  const memorizeTime = 5 // 5 seconds to memorize
  
  const startMemoryTest = () => {
    const newSequence = Array.from({ length: sequenceLength }, () => 
      memoryItems[Math.floor(Math.random() * memoryItems.length)]
    )
    setSequence(newSequence)
    setUserAnswers([])
    setGameState('memorize')
    setCurrentMemoryIndex(0)
    setShowSequence(true)
    setMemorizeCountdown(memorizeTime)
    
    // Countdown timer during memorization
    const memorizeInterval = setInterval(() => {
      setMemorizeCountdown(prev => {
        if (prev <= 1) {
          clearInterval(memorizeInterval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    setTimeout(() => {
      clearInterval(memorizeInterval)
      setShowSequence(false)
      setGameState('wait')
      setCountdown(3)
      
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            setGameState('answer')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, memorizeTime * 1000)
  }
  
  const handleAnswerSelect = (item: string) => {
    const newAnswers = [...userAnswers, item]
    setUserAnswers(newAnswers)
    
    if (newAnswers.length === sequenceLength) {
      const correctCount = newAnswers.filter((answer, index) => answer === sequence[index]).length
      const result: MemoryTestResult = {
        sequence,
        userAnswer: newAnswers,
        correctCount,
        totalCount: sequenceLength,
        passed: correctCount >= config.memoryTestMinCorrect
      }
      
      onMemoryTestSubmit(result)
    }
  }
  
  if (gameState === 'intro') {
    return (
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ color: 'var(--text-primary)' }}>Memory Test</h2>
        
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--accent)' }}>
            🧠
          </div>
          <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
            We'll now test your short-term memory. You'll see a sequence of colored circles for 4 seconds, 
            then you'll need to repeat the sequence in the correct order.
          </p>
          <div className="rounded-lg p-4 mb-6" style={{ background: 'var(--bg-primary)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              <strong>Instructions:</strong><br/>
              1. Memorize the sequence of {sequenceLength} colored circles<br/>
              2. You have 5 seconds to memorize the sequence<br/>
              3. After the timer ends, the sequence disappears<br/>
              4. Click the circles in the same order you saw them<br/>
              5. You need at least {config.memoryTestMinCorrect} correct to pass
            </p>
          </div>
        </div>
        
        <button
          onClick={startMemoryTest}
          className="w-full text-white text-lg font-semibold py-4 px-8 rounded-lg transition-all duration-200"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}
        >
          Start Memory Test
        </button>
      </div>
    )
  }
  
  if (gameState === 'memorize') {
    return (
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ color: 'var(--text-primary)' }}>Memorize This Sequence</h2>
        
        <div className="border-2 rounded-lg p-6 mb-8" style={{ background: 'var(--bg-primary)', borderColor: 'var(--accent)' }}>
          <div className="mb-6">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-4" style={{ background: 'var(--accent)', boxShadow: '0 4px 12px rgba(255, 107, 0, 0.3)' }}>
              <span className="text-2xl">⏱️</span>
              <span className="text-3xl font-bold text-white">{memorizeCountdown}</span>
              <span className="text-sm text-white font-semibold">seconds</span>
            </div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Memorize the sequence before time runs out!
            </p>
          </div>
          
          <p className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Study this sequence carefully:</p>
          <div className="flex justify-center space-x-4 mb-4">
            {showSequence && sequence.map((item, index) => (
              <div 
                key={index} 
                className="w-16 h-16 flex items-center justify-center text-4xl rounded-full shadow-lg border-2"
                style={{ background: 'var(--surface)', borderColor: 'var(--accent)' }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  if (gameState === 'wait') {
    return (
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ color: 'var(--text-primary)' }}>Get Ready!</h2>
        
        <div className="border-2 rounded-lg p-8 mb-8" style={{ background: 'var(--bg-primary)', borderColor: 'var(--accent)' }}>
          <div className="text-6xl font-bold mb-4" style={{ color: 'var(--accent)' }}>{countdown}</div>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Get ready to repeat the sequence...</p>
        </div>
      </div>
    )
  }
  
  if (gameState === 'answer') {
    return (
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ color: 'var(--text-primary)' }}>
          Repeat the Sequence ({userAnswers.length}/{sequenceLength})
        </h2>
        
        <div className="mb-8">
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Click the circles in the same order you saw them:</p>
          
          <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto mb-6">
            {memoryItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(item)}
                className="w-16 h-16 flex items-center justify-center text-4xl rounded-full shadow-lg border-2 transition-all duration-200 transform hover:scale-105"
                style={{ background: 'var(--surface)', borderColor: 'var(--text-muted)' }}
              >
                {item}
              </button>
            ))}
          </div>
          
          <div className="rounded-lg p-4" style={{ background: 'var(--bg-primary)' }}>
            <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Your sequence so far:</p>
            <div className="flex justify-center space-x-2">
              {userAnswers.map((answer, index) => (
                <div key={index} className="w-10 h-10 flex items-center justify-center text-2xl rounded-full shadow border" style={{ background: 'var(--surface)' }}>
                  {answer}
                </div>
              ))}
              {Array.from({ length: sequenceLength - userAnswers.length }, (_, index) => (
                <div key={`empty-${index}`} className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-dashed" style={{ borderColor: 'var(--text-muted)' }}>
                  ?
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return null
}

function StepTypingTest({ onNext, data }: { onNext: (data: any) => void, data: ApplicantData }) {
  const [phase, setPhase] = useState<'intro' | 'typing' | 'done'>('intro')
  const [textToType] = useState(() => typingTestTexts[Math.floor(Math.random() * typingTestTexts.length)])
  const [typed, setTyped] = useState('')
  const [timeLeft, setTimeLeft] = useState(config.typingTestDuration)
  const [startTime, setStartTime] = useState<number | null>(null)

  useEffect(() => {
    if (phase !== 'typing' || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setPhase('done')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [phase, timeLeft])

  const startTest = () => {
    setPhase('typing')
    setStartTime(Date.now())
  }

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (phase !== 'typing') return
    setTyped(e.target.value)
  }

  useEffect(() => {
    if (phase !== 'done') return
    let correct = 0
    const len = Math.min(typed.length, textToType.length)
    for (let i = 0; i < len; i++) {
      if (typed[i] === textToType[i]) correct++
    }
    const minutes = config.typingTestDuration / 60
    const wpm = minutes > 0 ? (correct / 5) / minutes : 0
    const accuracy = typed.length > 0 ? (correct / typed.length) * 100 : 0
    const passed = wpm >= config.typingMinWpm

    const result: TypingTestResult = { wpm: Math.round(wpm * 10) / 10, accuracy: Math.round(accuracy * 10) / 10, totalCharacters: typed.length, correctCharacters: correct, passed }
    onNext({ typingTestResult: result })
  }, [phase])

  if (phase === 'intro') {
    return (
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Typing Speed Test</h2>
        <img src="/images/test-typing.png" alt="Typing Test" className="w-28 h-28 mx-auto mb-3 rounded-2xl object-cover" />
        <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
          You will have <strong>60 seconds</strong> to type the paragraph shown on screen as quickly and accurately as possible.
        </p>
        <div className="rounded-lg p-4 mb-6 text-left" style={{ background: 'var(--bg-primary)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            <strong>Instructions:</strong><br/>
            1. A paragraph of text will appear on screen<br/>
            2. Type it as fast and accurately as you can<br/>
            3. You have 60 seconds<br/>
            4. You need at least <strong>{config.typingMinWpm} words per minute</strong> to pass
          </p>
        </div>
        <button onClick={startTest} className="w-full text-white text-lg font-semibold py-4 px-8 rounded-lg transition-all duration-200" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
          Start Typing Test
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Typing Speed Test</h2>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: timeLeft <= 10 ? '#ef4444' : 'var(--accent)' }}>
          <span className="text-xl">⏱️</span>
          <span className="text-xl font-bold text-white">{timeLeft}s</span>
        </div>
      </div>
      <div className="rounded-lg p-4 mb-4 font-mono text-sm md:text-base leading-relaxed" style={{ background: 'var(--bg-primary)', border: '2px solid var(--accent)' }}>
        {textToType.split('').map((char, i) => {
          let color = 'var(--text-muted)'
          if (i < typed.length) {
            color = typed[i] === char ? '#10b981' : '#ef4444'
          }
          return <span key={i} style={{ color, background: i === typed.length ? 'rgba(255,107,0,0.3)' : 'transparent' }}>{char}</span>
        })}
      </div>
      <textarea
        autoFocus
        value={typed}
        onChange={handleTyping}
        disabled={phase === 'done'}
        placeholder="Start typing here..."
        className="w-full p-4 rounded-lg text-sm md:text-base font-mono resize-none outline-none"
        style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '2px solid var(--text-muted)', minHeight: '120px' }}
        onPaste={(e) => e.preventDefault()}
      />
      <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
        {typed.length} / {textToType.length} characters typed
      </p>
    </div>
  )
}

function SpeedGauge({ speed, maxSpeed = 200, label }: { speed: number, maxSpeed?: number, label: string }) {
  const clampedSpeed = Math.min(speed, maxSpeed)
  const angle = -135 + (clampedSpeed / maxSpeed) * 270
  const cx = 140, cy = 140, r = 110

  const ticks = [0, 25, 50, 75, 100, 150, 200]
  const getTickPos = (val: number) => {
    const a = (-135 + (Math.min(val, maxSpeed) / maxSpeed) * 270) * (Math.PI / 180)
    return {
      x1: cx + (r - 12) * Math.cos(a),
      y1: cy + (r - 12) * Math.sin(a),
      x2: cx + (r - 2) * Math.cos(a),
      y2: cy + (r - 2) * Math.sin(a),
      lx: cx + (r - 28) * Math.cos(a),
      ly: cy + (r - 28) * Math.sin(a),
    }
  }

  const arcPath = (startAngle: number, endAngle: number) => {
    const s = (startAngle * Math.PI) / 180
    const e = (endAngle * Math.PI) / 180
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s)
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e)
    const large = endAngle - startAngle > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
  }

  const needleAngle = angle * (Math.PI / 180)
  const needleLen = r - 25
  const nx = cx + needleLen * Math.cos(needleAngle)
  const ny = cy + needleLen * Math.sin(needleAngle)

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 280 200" className="w-full max-w-[260px]">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="30%" stopColor="#f59e0b" />
            <stop offset="60%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <path d={arcPath(-135, 135)} fill="none" stroke="#2a2a3a" strokeWidth="14" strokeLinecap="round" />
        <path d={arcPath(-135, 135)} fill="none" stroke="url(#gaugeGrad)" strokeWidth="8" strokeLinecap="round" opacity="0.9" />

        {ticks.map(val => {
          const t = getTickPos(val)
          return (
            <g key={val}>
              <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#9ca3af" strokeWidth="2" />
              <text x={t.lx} y={t.ly} fill="#9ca3af" fontSize="10" textAnchor="middle" dominantBaseline="middle">{val}</text>
            </g>
          )
        })}

        <line
          x1={cx} y1={cy} x2={nx} y2={ny}
          stroke="var(--accent, #ff6b00)" strokeWidth="3" strokeLinecap="round"
          filter="url(#glow)"
          style={{ transition: 'x2 0.8s cubic-bezier(0.34,1.56,0.64,1), y2 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}
        />

        <circle cx={cx} cy={cy} r="8" fill="var(--accent, #ff6b00)" />
        <circle cx={cx} cy={cy} r="4" fill="#1a1a2e" />

        <text x={cx} y={cy + 35} fill="var(--accent, #ff6b00)" fontSize="28" fontWeight="bold" textAnchor="middle">{speed.toFixed(1)}</text>
        <text x={cx} y={cy + 52} fill="#9ca3af" fontSize="12" textAnchor="middle">Mbps</text>
      </svg>
      <p className="text-sm font-semibold mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
    </div>
  )
}

function StepInternetSpeed({ onNext, data }: { onNext: (data: any) => void, data: ApplicantData }) {
  const [phase, setPhase] = useState<'intro' | 'download' | 'upload' | 'done'>('intro')
  const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null)
  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null)
  const [liveSpeed, setLiveSpeed] = useState(0)
  const [sampleCount, setSampleCount] = useState(0)

  const runSamplesFor = async (direction: 'download' | 'upload', durationMs: number) => {
    const speeds: number[] = []
    const deadline = performance.now() + durationMs
    const PARALLEL = 3

    while (performance.now() < deadline) {
      try {
        const batch = Array.from({ length: PARALLEL }, async () => {
          if (direction === 'download') {
            const start = performance.now()
            const res = await fetch('/api/speedtest/download?t=' + Math.random(), { cache: 'no-store' })
            const blob = await res.blob()
            const elapsed = (performance.now() - start) / 1000
            return elapsed > 0 ? (blob.size * 8) / elapsed / 1_000_000 : 0
          } else {
            const payload = new Uint8Array(5 * 1024 * 1024)
            const start = performance.now()
            await fetch('/api/speedtest/upload', { method: 'POST', body: payload })
            const elapsed = (performance.now() - start) / 1000
            return elapsed > 0 ? (payload.length * 8) / elapsed / 1_000_000 : 0
          }
        })

        const start = performance.now()
        const results = await Promise.all(batch)
        const elapsed = (performance.now() - start) / 1000
        const totalBytes = direction === 'download' ? 10 * 1024 * 1024 * PARALLEL : 5 * 1024 * 1024 * PARALLEL
        const combinedMbps = elapsed > 0 ? (totalBytes * 8) / elapsed / 1_000_000 : 0

        if (combinedMbps > 0) {
          speeds.push(combinedMbps)
          setLiveSpeed(combinedMbps)
        }
        setSampleCount(speeds.length)
      } catch { break }
    }

    if (speeds.length === 0) return 0
    const avg = speeds.reduce((a, b) => a + b, 0) / speeds.length
    return Math.round(avg * 10) / 10
  }

  const runTest = async () => {
    setPhase('download')
    setLiveSpeed(0)
    setSampleCount(0)

    const dl = await runSamplesFor('download', 15000)
    setDownloadSpeed(dl)
    setLiveSpeed(dl)

    setPhase('upload')
    setLiveSpeed(0)
    setSampleCount(0)

    const ul = await runSamplesFor('upload', 15000)
    setUploadSpeed(ul)
    setLiveSpeed(ul)

    setPhase('done')
  }

  const handleContinue = () => {
    const dl = downloadSpeed ?? 0
    const ul = uploadSpeed ?? 0
    const result: SpeedTestResult = { downloadSpeed: dl, uploadSpeed: ul, passed: dl >= config.speedMinDownload }
    onNext({ speedTestResult: result })
  }

  if (phase === 'intro') {
    return (
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Internet Speed Test</h2>
        <img src="/images/test-speed.png" alt="Speed Test" className="w-28 h-28 mx-auto mb-3 rounded-2xl object-cover" />
        <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
          We'll now measure your internet connection speed. This takes about <strong>30 seconds</strong>.
        </p>
        <div className="rounded-lg p-4 mb-6 text-left" style={{ background: 'var(--bg-primary)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            <strong>Requirements:</strong><br/>
            • Minimum <strong>{config.speedMinDownload} Mbps</strong> download speed<br/>
            • Make sure no large downloads are running<br/>
            • Close other tabs using bandwidth for best results
          </p>
        </div>
        <button onClick={runTest} className="w-full text-white text-lg font-semibold py-4 px-8 rounded-lg transition-all duration-200" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
          Start Speed Test
        </button>
      </div>
    )
  }

  if (phase === 'done') {
    const dlPassed = (downloadSpeed ?? 0) >= config.speedMinDownload
    return (
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Speed Test Results</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl p-5" style={{ background: 'var(--bg-primary)', border: `2px solid ${dlPassed ? '#10b981' : '#ef4444'}` }}>
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Download</p>
            <p className="text-3xl font-bold" style={{ color: dlPassed ? '#10b981' : '#ef4444' }}>{downloadSpeed}</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Mbps</p>
          </div>
          <div className="rounded-xl p-5" style={{ background: 'var(--bg-primary)', border: '2px solid var(--text-muted)' }}>
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Upload</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{uploadSpeed}</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Mbps</p>
          </div>
        </div>
        <button onClick={handleContinue} className="w-full text-white text-lg font-semibold py-4 px-8 rounded-lg transition-all duration-200" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
          Continue
        </button>
      </div>
    )
  }

  return (
    <div className="text-center">
      <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        {phase === 'download' ? 'Testing Download Speed...' : 'Testing Upload Speed...'}
      </h2>
      <SpeedGauge
        speed={liveSpeed}
        label={phase === 'download' ? `⬇ Download — Sample ${sampleCount}` : `⬆ Upload — Sample ${sampleCount}`}
      />
      {downloadSpeed !== null && phase === 'upload' && (
        <p className="text-sm mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>Download result: {downloadSpeed} Mbps</p>
      )}
    </div>
  )
}

function StepResults({ onNext, data }: { onNext: (data: any) => void, data: ApplicantData }) {
  const englishCorrect = data.quizAnswers ? data.quizAnswers.filter((answer: any) => answer.isCorrect).length : 0
  const englishTotal = config.englishTotalQuestions
  const englishPassed = englishCorrect >= config.englishMinCorrect
  
  const memoryCorrect = data.memoryTestResult ? data.memoryTestResult.correctCount : 0
  const memoryTotal = config.memoryTestTotalItems
  const memoryPassed = memoryCorrect >= config.memoryTestMinCorrect

  const typingWpm = data.typingTestResult?.wpm ?? 0
  const typingPassed = typingWpm >= config.typingMinWpm

  const dlSpeed = data.speedTestResult?.downloadSpeed ?? 0
  const speedPassed = dlSpeed >= config.speedMinDownload
  
  const ageQualified = data.age ? (data.age >= config.minAge && data.age <= config.maxAge) : false
  const educationQualified = data.hasFinishedEducation === true && data.educationType !== 'Student'
  const englishRatingQualified = data.englishRating !== 'Very Bad' && data.englishRating !== 'Bad'
  const equipmentQualified = data.hasWorkingPc === true
  
  const isQualified = ageQualified && educationQualified && englishRatingQualified && equipmentQualified && englishPassed && memoryPassed && typingPassed && speedPassed

  return (
    <div className="text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: isQualified ? '#10b981' : '#ef4444' }}>
        {isQualified ? (
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>
      
      <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        {isQualified ? '🎉 Congratulations!' : '❌ Application Not Approved'}
      </h2>
      
      <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
        {isQualified 
          ? 'You have successfully passed all qualification requirements!' 
          : 'Unfortunately, you did not meet all the qualification requirements.'}
      </p>
      
      <div className="rounded-lg p-6 mb-6 text-left" style={{ background: 'var(--bg-primary)', border: '2px solid ' + (isQualified ? '#10b981' : '#ef4444') }}>
        <h3 className="font-bold mb-4 text-center" style={{ color: 'var(--text-primary)' }}>
          📊 Your Results:
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>English Quiz:</span>
            <span className={`font-semibold ${englishPassed ? 'text-green-500' : 'text-red-500'}`}>
              {englishCorrect}/{englishTotal} {englishPassed ? '✓ Passed' : '✗ Failed'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Memory Test:</span>
            <span className={`font-semibold ${memoryPassed ? 'text-green-500' : 'text-red-500'}`}>
              {memoryCorrect}/{memoryTotal} {memoryPassed ? '✓ Passed' : '✗ Failed'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Typing Speed:</span>
            <span className={`font-semibold ${typingPassed ? 'text-green-500' : 'text-red-500'}`}>
              {typingWpm} WPM {typingPassed ? '✓ Passed' : `✗ Failed (need ${config.typingMinWpm})`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Internet Speed:</span>
            <span className={`font-semibold ${speedPassed ? 'text-green-500' : 'text-red-500'}`}>
              {dlSpeed} Mbps {speedPassed ? '✓ Passed' : `✗ Failed (need ${config.speedMinDownload})`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Age Requirement:</span>
            <span className={`font-semibold ${ageQualified ? 'text-green-500' : 'text-red-500'}`}>
              {ageQualified ? '✓ Met' : '✗ Not Met'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Education:</span>
            <span className={`font-semibold ${educationQualified ? 'text-green-500' : 'text-red-500'}`}>
              {educationQualified ? '✓ Met' : '✗ Not Met'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Equipment:</span>
            <span className={`font-semibold ${equipmentQualified ? 'text-green-500' : 'text-red-500'}`}>
              {equipmentQualified ? '✓ Met' : '✗ Not Met'}
            </span>
          </div>
        </div>
      </div>
      
      {!isQualified && (
        <div className="rounded-lg p-6 mb-6" style={{ background: 'var(--bg-soft)' }}>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            <strong>Note:</strong> The course is currently full. We appreciate your interest and encourage you to improve your skills and try again in the future.
          </p>
        </div>
      )}
      
      <button
        onClick={() => onNext({ isCompleted: true, isDisqualified: !isQualified })}
        className="w-full text-white text-lg font-semibold py-4 px-8 rounded-lg transition-all duration-200"
        style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}
      >
        {isQualified ? 'Continue to Booking' : 'Finish'}
      </button>
    </div>
  )
}

