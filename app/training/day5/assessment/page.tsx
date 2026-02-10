'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, Send, Clock } from 'lucide-react'
import DynamicBackground from '@/components/DynamicBackground'
import Reveal from '@/components/Reveal'

interface Question {
  id: number
  question: string
  correctAnswer: string
}

const questions: Question[] = [
  {
    id: 1,
    question: "A sub asks: \"where are you from?\" Why is it important to answer based on the model's background and not invent random things?",
    correctAnswer: "Because everything has to stay consistent with the model's life. If you randomly say things that don't match her background, later it won't make sense and the sub can notice something feels off. The goal is to make it feel like he's talking to the same real person every time, not someone making things up."
  },
  {
    id: 2,
    question: "The sub replies with something dry like: \"just chilling.\" What should you do next?",
    correctAnswer: "Ask something about what he just said to get him to talk more. For example: \"what do you usually do when you're chilling?\" or \"are you alone or relaxing after work?\" The goal is to get him to open up more."
  },
  {
    id: 3,
    question: "The sub starts talking about being stressed from work. How should you respond?",
    correctAnswer: "Show you understand him and care. For example: \"that sounds exhausting honestly… long days like that drain you 😔\" then continue asking about it so he keeps talking. This builds emotional connection."
  },
  {
    id: 4,
    question: "The sub buys a ppv and finishes watching it. What should you do right after?",
    correctAnswer: "Stay with him emotionally. Don't disappear and don't instantly sell again. Say something like: \"did you like it? 🥺\" or \"that was just for you… how did it make you feel?\" Make him feel special and connected. This makes him want more later."
  },
  {
    id: 5,
    question: "The sub says: \"you sound fake.\" What is the correct way to respond?",
    correctAnswer: "Stay soft, human, and calm. For example: \"nooo why would you say that 🥺 im just a bit shy sometimes honestly\" then keep talking normally. Don't argue, don't get defensive."
  },
  {
    id: 6,
    question: "The sub opens up and tells you something personal about his life. What should you do?",
    correctAnswer: "Listen, acknowledge it, and show emotional understanding. For example: \"that must have been really hard for you…\" then continue asking about it. This builds trust and attachment."
  },
  {
    id: 7,
    question: "The sub finishes one ppv. Why should you not immediately send another one without interaction?",
    correctAnswer: "Because you need to keep the emotional connection going first. If you instantly send another ppv, it feels like you only care about money. Engagement always comes before the next sale."
  },
  {
    id: 8,
    question: "The sub says: \"you take long to reply.\" What is the correct response style?",
    correctAnswer: "Be soft and human. For example: \"sorryy i got distracted honestly 😭 im here now though. what were you doing?\" then continue normally."
  },
  {
    id: 9,
    question: "Why is making the sub feel special so important?",
    correctAnswer: "Because when he feels special and emotionally connected, he stays longer and spends more over time. People don't just buy content, they buy the feeling."
  },
  {
    id: 10,
    question: "Why should you use things he said earlier later in the conversation?",
    correctAnswer: "Because it shows you remember him and care. It makes it feel personal, not generic."
  },
  {
    id: 11,
    question: "What is the main goal of chatting overall?",
    correctAnswer: "To build emotional connection so he stays, trusts you, and keeps coming back again and again."
  },
  {
    id: 12,
    question: "Please write following things in american accent: you / right now / oh my god / i don't know",
    correctAnswer: "you = u, right now = rn, oh my god = omg, i don't know = idk"
  }
]

export default function TrainingDay5() {
  const [telegram, setTelegram] = useState('')
  const [email, setEmail] = useState('')
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const [results, setResults] = useState<{ [key: number]: { correct: boolean, feedback: string } } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [score, setScore] = useState(0)
  const [timerStarted, setTimerStarted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(20 * 60) // 20 minutes in seconds
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const autoSubmitRef = useRef(false)

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    
    // Start timer on first character typed in first question
    if (!timerStarted && telegram && email && value.length === 1) {
      setTimerStarted(true)
    }
  }

  // Timer effect
  useEffect(() => {
    if (timerStarted && !showSummary) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up - auto submit
            if (!autoSubmitRef.current) {
              autoSubmitRef.current = true
              handleAutoSubmit()
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current)
        }
      }
    }
  }, [timerStarted, showSummary])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAutoSubmit = async () => {
    const form = document.querySelector('form') as HTMLFormElement
    if (form) {
      const event = new Event('submit', { bubbles: true, cancelable: true })
      form.dispatchEvent(event)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Stop timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
    
    // Validate all fields
    if (!telegram || !email) {
      alert('Please enter your Telegram username and email.')
      return
    }

    const unanswered = questions.filter(q => !answers[q.id] || answers[q.id].trim() === '')
    if (unanswered.length > 0 && !autoSubmitRef.current) {
      alert(`Please answer all questions. Missing: ${unanswered.length} question(s)`)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/training/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram,
          email,
          answers: questions.map(q => ({
            question: q.question,
            correctAnswer: q.correctAnswer,
            userAnswer: answers[q.id] || '' // Send empty string for unanswered questions
          }))
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to evaluate answers')
      }

      // Process results
      const evaluationResults: { [key: number]: { correct: boolean, feedback: string } } = {}
      let correctCount = 0

      data.evaluations.forEach((evaluation: any, index: number) => {
        evaluationResults[questions[index].id] = {
          correct: evaluation.isCorrect,
          feedback: evaluation.feedback
        }
        if (evaluation.isCorrect) correctCount++
      })

      setResults(evaluationResults)
      setScore(correctCount)
      setShowSummary(true)

    } catch (error) {
      console.error('Error submitting test:', error)
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      alert(`Error submitting test: ${errorMsg}\n\nPlease check the console for more details or contact support.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getScoreColor = () => {
    if (score >= 7) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleRetakeTest = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen relative">
      <DynamicBackground />
      
      <section className="section pt-32 md:pt-40 relative z-10">
        <div className="container max-w-4xl">
          <Reveal>
            <div className="text-center mb-12">
              <h1 className="mb-4">
                Training Day 5 Assessment
              </h1>
              <p className="text-xl" style={{ color: 'var(--text-secondary-on-white)' }}>
                Complete this assessment to test your understanding of conversation handling and emotional connection
              </p>
            </div>
          </Reveal>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card glass-card"
          >
            {/* Timer Display */}
            {timerStarted && !showSummary && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-xl border-2 ${
                  timeRemaining <= 300 ? 'bg-red-50 border-red-500' : 
                  timeRemaining <= 600 ? 'bg-yellow-50 border-yellow-500' : 
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <Clock className={`w-6 h-6 ${
                    timeRemaining <= 300 ? 'text-red-600' : 
                    timeRemaining <= 600 ? 'text-yellow-600' : 
                    'text-blue-600'
                  }`} />
                  <div>
                    <div className={`text-2xl font-bold ${
                      timeRemaining <= 300 ? 'text-red-600' : 
                      timeRemaining <= 600 ? 'text-yellow-600' : 
                      'text-blue-600'
                    }`}>
                      {formatTime(timeRemaining)}
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary-on-white)' }}>
                      You have to finish this in the next 20 minutes. It will auto submit all your answers if not completed on time and you will likely not pass, so please hurry up!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <div className="space-y-4 pb-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold">Contact Information</h3>
                <div>
                  <label htmlFor="telegram" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Telegram Username *
                  </label>
                  <input
                    type="text"
                    id="telegram"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="@username"
                    required
                    disabled={showSummary}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="your.email@example.com"
                    required
                    disabled={showSummary}
                  />
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Assessment Questions</h3>
                {questions.map((question, index) => (
                  <div key={question.id} className="space-y-3">
                    <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      <span className="inline-flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white" style={{ background: 'var(--accent)' }}>
                          {index + 1}
                        </span>
                        {question.question}
                      </span>
                    </label>
                    <textarea
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all min-h-[100px]"
                      placeholder="Type your answer here..."
                      required
                      disabled={showSummary}
                    />
                    
                    {/* Show result if available */}
                    {results && results[question.id] && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg ${results[question.id].correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
                      >
                        <div className="flex items-start gap-3">
                          {results[question.id].correct ? (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className={`font-semibold mb-1 ${results[question.id].correct ? 'text-green-800' : 'text-red-800'}`}>
                              {results[question.id].correct ? 'Correct!' : 'Needs Improvement'}
                            </p>
                            <p className={`text-sm ${results[question.id].correct ? 'text-green-700' : 'text-red-700'}`}>
                              {results[question.id].feedback}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              {!showSummary && (
                <div className="flex justify-center pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary hover-lift text-lg px-12 py-4 inline-flex items-center gap-3"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Evaluating Answers...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Assessment
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Summary Section */}
              {showSummary && results && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mt-8 p-8 rounded-2xl border-2"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.05), rgba(255, 107, 53, 0.1))',
                    borderColor: 'var(--accent)'
                  }}
                >
                  <h3 className="text-2xl font-bold mb-4 text-center">Assessment Results</h3>
                  
                  <div className="text-center mb-6">
                    <div className={`text-6xl font-bold mb-2 ${getScoreColor()}`}>
                      {score}/{questions.length}
                    </div>
                    <p className="text-lg" style={{ color: 'var(--text-secondary-on-white)' }}>
                      {((score / questions.length) * 100).toFixed(0)}% Correct
                    </p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <span className="font-medium">Correct Answers</span>
                      </div>
                      <span className="text-xl font-bold text-green-600">{score}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <XCircle className="w-6 h-6 text-red-600" />
                        <span className="font-medium">Incorrect Answers</span>
                      </div>
                      <span className="text-xl font-bold text-red-600">{questions.length - score}</span>
                    </div>
                  </div>

                  {score >= 7 ? (
                    <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
                      <p className="text-lg font-semibold text-green-800 mb-2">
                        🎉 Test Passed!
                      </p>
                      <p className="text-green-700">
                        You've demonstrated a strong understanding of the material. Your responses will be reviewed by our team.
                      </p>
                    </div>
                  ) : score >= 6 ? (
                    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                      <p className="text-lg font-semibold text-yellow-800 mb-2">
                        ⚠️ One More Chance
                      </p>
                      <p className="text-yellow-700 mb-4">
                        You have one more chance to redo the training.
                      </p>
                      <button
                        onClick={handleRetakeTest}
                        className="btn-primary hover-lift px-8 py-3"
                      >
                        🔄 Retake Training
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
                      <p className="text-lg font-semibold text-red-800 mb-2">
                        ❌ Training Not Passed
                      </p>
                      <p className="text-red-700">
                        You likely didn't pay full attention to the training! This training is unfortunately over for now. Maybe next time. Thanks for applying.
                      </p>
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-white rounded-lg">
                    <p className="text-sm text-center" style={{ color: 'var(--text-secondary-on-white)' }}>
                      Your submission has been recorded for <strong>{email}</strong> (Telegram: <strong>{telegram}</strong>)
                    </p>
                  </div>
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
