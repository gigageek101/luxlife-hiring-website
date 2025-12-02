'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ApplicantData, educationTypes, englishRatings, MemoryTestResult } from '@/lib/types'
import { quizQuestions } from '@/lib/quiz-questions'
import { config } from '@/lib/config'

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
    
    // Always continue to next step
    updatedData.currentStep += 1

    setApplicantData(updatedData)
    saveToLocalStorage(updatedData)

    if (updatedData.currentStep > 8) {
      // Application completed
      updatedData.isCompleted = true
      saveToLocalStorage(updatedData)
      
      // Mark application as completed in localStorage
      const isQualified = !updatedData.isDisqualified
      localStorage.setItem('luxlife-application-completed', 'true')
      localStorage.setItem('luxlife-application-qualified', isQualified ? 'true' : 'false')
      
      // Note: Telegram notification will be sent only when user agrees to terms
      // This ensures we only get notified about serious applicants
      
      // Redirect to thank-you page
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

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="mx-auto max-w-2xl px-4 md:px-6">
        {/* Progress Bar */}
        <div className="mb-6 md:mb-8 rounded-xl p-4 md:p-6" style={{ background: 'var(--surface)', border: '2px solid var(--accent)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <span className="text-sm md:text-base font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
              📋 Step {applicantData.currentStep} of 8
            </span>
            <span className="px-3 py-1 rounded-full text-xs md:text-sm font-semibold inline-block w-fit whitespace-nowrap" style={{ background: 'var(--accent)', color: 'white' }}>
              {Math.round((applicantData.currentStep / 8) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 md:h-3 shadow-inner overflow-hidden">
            <div 
              className="h-2 md:h-3 rounded-full transition-all duration-500 shadow-lg"
              style={{ 
                width: `${(applicantData.currentStep / 8) * 100}%`,
                background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                boxShadow: '0 2px 8px rgba(255, 107, 0, 0.4)'
              }}
            ></div>
          </div>
          <div className="mt-2 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            ⏱️ Time remaining: ~{Math.max(0, 5 - Math.round((applicantData.currentStep / 8) * 5))} min
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
          {applicantData.currentStep === 8 && <Step8 onNext={handleNext} data={applicantData} />}
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
  
  const memoryItems = ['🔴', '🔵', '⚪', '🟢', '🟡', '🟣']
  const sequenceLength = 6
  
  const startMemoryTest = () => {
    const newSequence = Array.from({ length: sequenceLength }, () => 
      memoryItems[Math.floor(Math.random() * memoryItems.length)]
    )
    setSequence(newSequence)
    setUserAnswers([])
    setGameState('memorize')
    setCurrentMemoryIndex(0)
    setShowSequence(true)
    
    setTimeout(() => {
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
    }, 4000)
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
              2. After 4 seconds, the sequence disappears<br/>
              3. Click the circles in the same order you saw them<br/>
              4. You need at least {config.memoryTestMinCorrect} correct to pass
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
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sequence will disappear in a few seconds...</p>
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

function Step8({ onNext, data }: { onNext: (data: any) => void, data: ApplicantData }) {
  // Calculate qualification status
  const englishCorrect = data.quizAnswers ? data.quizAnswers.filter((answer: any) => answer.isCorrect).length : 0
  const englishTotal = config.englishTotalQuestions
  const englishPassed = englishCorrect >= config.englishMinCorrect
  
  const memoryCorrect = data.memoryTestResult ? data.memoryTestResult.correctCount : 0
  const memoryTotal = config.memoryTestTotalItems
  const memoryPassed = memoryCorrect >= config.memoryTestMinCorrect
  
  // Check all disqualification criteria
  const ageQualified = data.age ? (data.age >= config.minAge && data.age <= config.maxAge) : false
  const educationQualified = data.hasFinishedEducation === true && data.educationType !== 'Student'
  const englishRatingQualified = data.englishRating !== 'Very Bad' && data.englishRating !== 'Bad'
  const equipmentQualified = data.hasWorkingPc === true
  
  // Final qualification: ALL criteria must pass
  const isQualified = ageQualified && educationQualified && englishRatingQualified && equipmentQualified && englishPassed && memoryPassed

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
      
      {/* Show detailed results */}
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

