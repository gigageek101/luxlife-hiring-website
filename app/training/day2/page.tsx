'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, Send } from 'lucide-react'
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
    question: "Why is it important to get to know a subscriber before trying to sell them content?",
    correctAnswer: "Because building a relationship increases their lifetime value (LTV), makes it easier to re-engage them later, and increases the likelihood that they will spend more money over time."
  },
  {
    id: 2,
    question: "According to the text, when is a subscriber most likely to spend money?",
    correctAnswer: "When they are horny or emotionally in love / emotionally attached."
  },
  {
    id: 3,
    question: "Why should you let the subscriber raise the topic of sexting instead of initiating it yourself?",
    correctAnswer: "Because it puts you in a position of power, confirms their interest, and increases the likelihood that they will buy content willingly."
  },
  {
    id: 4,
    question: "What is the purpose of taking notes about subscribers?",
    correctAnswer: "To remember their preferences, personalize future conversations, strengthen the emotional connection, and increase future sales."
  },
  {
    id: 5,
    question: "Why should you continue talking to the subscriber after they finish a sexting session?",
    correctAnswer: "To maintain the emotional connection, avoid making them feel used, and increase the chances they will return and spend money again in the future."
  },
  {
    id: 6,
    question: "What is the mirror effect and why is it important?",
    correctAnswer: "The mirror effect is matching the subscriber's energy, tone, and communication style to build trust, comfort, and increase the likelihood of making a sale."
  },
  {
    id: 7,
    question: "Why are open-ended questions important in chatting with subscribers?",
    correctAnswer: "Because they encourage longer responses, create deeper conversations, help build emotional connection, and provide more information to increase engagement and sales."
  },
  {
    id: 8,
    question: "What is the importance of taking notes about each subscriber?",
    correctAnswer: "Taking notes is important for keeping track of each subscriber's preferences, spending, and other relevant information for future reference."
  },
  {
    id: 9,
    question: "What did I explain about the importance of building relationships with newbies?",
    correctAnswer: "Building relationships with newbies is crucial because their first interaction can determine whether they become long-term subscribers or not. They are potential whales, and a good relationship with them can significantly boost earnings."
  }
]

export default function TrainingDay2() {
  const [telegram, setTelegram] = useState('')
  const [email, setEmail] = useState('')
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const [results, setResults] = useState<{ [key: number]: { correct: boolean, feedback: string } } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [score, setScore] = useState(0)

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    if (!telegram || !email) {
      alert('Please enter your Telegram username and email.')
      return
    }

    const unanswered = questions.filter(q => !answers[q.id] || answers[q.id].trim() === '')
    if (unanswered.length > 0) {
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
            userAnswer: answers[q.id]
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
    if (score >= 5) return 'text-yellow-600'
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
                Training Day 2 Assessment
              </h1>
              <p className="text-xl" style={{ color: 'var(--text-secondary-on-white)' }}>
                Complete this assessment to test your understanding of subscriber relationship building
              </p>
            </div>
          </Reveal>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card glass-card"
          >
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
                  ) : score >= 5 ? (
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
