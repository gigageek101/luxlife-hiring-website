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
    question: "When a growth mindset person faces something new and complex, what do they do differently than a fixed mindset person?",
    correctAnswer: "A fixed mindset person looks at something new and complex — a new tool, a new process, a new way of working — and their first thought is \"this is way too complicated for me.\" They label themselves as not smart enough, not technical enough, or not creative enough, and they don't even try. They shut down before they start. A growth mindset person looks at the exact same thing with the exact same complexity and says \"I don't understand all of this yet, but I can figure it out.\" The key difference is they don't try to learn everything on day one. They just take the first step — they read the first document, watch the first walkthrough, try one thing. Then they try the next thing. By the end of the week, they've made real progress. Not because they're smarter, but because they started instead of shutting down. Same challenge, same complexity, completely different outcome — because of how they chose to approach it."
  },
  {
    id: 2,
    question: "Describe both the fixed mindset and the growth mindset response when someone tells you your work isn't right.",
    correctAnswer: "The fixed mindset response is to blame everything except yourself. They say things like \"I followed the steps — the instructions weren't clear enough\" or \"the tools didn't work properly.\" They protect their ego by pointing at the process, the software, the brief — anything around them. They never look at what they personally could have done differently, which means nothing actually changes in their approach. The growth mindset response is to turn inward and ask honest questions. They say \"Okay, let me look at what I did. Where did I go off track? What did I miss? How do I make sure the next one is better?\" They go back to the instructions, they study what went wrong, and they make a specific improvement. The key difference is ownership — one person made excuses to protect their ego, while the other person used the feedback to actually get better."
  },
  {
    id: 3,
    question: "A fixed mindset person tries something new three times and then stops. Why does the growth mindset person keep going, and what happens when they do?",
    correctAnswer: "The fixed mindset person tries something three times, gets decent but not amazing results, and concludes \"if I was meant to be good at this, it would come naturally by now.\" They interpret the effort required as proof that they aren't talented enough. The growth mindset person understands that mastery doesn't happen in three tries. They keep going — ten times, twenty, thirty. With each repetition, they get noticeably better and start seeing patterns they never would have spotted if they'd stopped early. They built a real skill because they put in the reps. The growth mindset person sees effort as the path to mastery, not as proof of weakness."
  },
  {
    id: 4,
    question: "When someone else on the team starts producing amazing work, how does a fixed mindset person react versus a growth mindset person?",
    correctAnswer: "The fixed mindset person feels threatened by the other person's success. They dismiss it by saying \"they just got lucky\" or \"they're naturally better at this.\" They don't study it, don't learn from it, and might feel resentful. The growth mindset person reacts with curiosity instead of jealousy. They want to understand why that person's work is so good. They ask specific questions, study what's working, and apply those lessons to their own work. They reverse-engineer the success instead of dismissing it. One person saw a threat, the other person saw a free masterclass."
  },
  {
    id: 5,
    question: "What is the number one A-Player trait, and why is it more important than creativity?",
    correctAnswer: "The number one A-Player trait is following instructions to the letter before adding any creative input of your own. When given specific steps and requirements, the A-Player delivers exactly that first — no changes, no shortcuts. This matters more than creativity because trust is built on reliability. If someone gives you clear instructions and you change things without asking, you become unreliable. The right approach is to deliver exactly what was asked for first, and then bring creative ideas as a bonus on top. Reliability comes before creativity — always."
  },
  {
    id: 6,
    question: "What does it mean to \"obsess over what actually works,\" and how is that different from just completing assignments?",
    correctAnswer: "\"Obsessing over what actually works\" means paying close attention to results and using that data to make better decisions, rather than just doing tasks and hoping for the best. A good employee completes the assignment. A great employee completes the assignment and then studies the outcome — what performed well, what didn't, and why. An A-Player notices patterns, spots trends before anyone tells them to look, and makes decisions based on what the results are actually telling them. They use evidence to improve, which means they get better with every cycle."
  },
  {
    id: 7,
    question: "When something goes wrong, what is the A-Player's three-sentence response, and why does it build more trust than a year of perfect work?",
    correctAnswer: "The A-Player's three-sentence response is: \"I see the mistake. It's fixed. Here's what I'm changing so it doesn't happen again.\" No long story, no excuses, no blaming tools or teammates. This builds more trust than a year of perfect work because it demonstrates self-awareness, initiative, and growth. A manager who hears those three sentences thinks \"this person is responsible, proactive, and always improving.\" Meanwhile, the person who spends five minutes explaining why the mistake wasn't really their fault erodes trust with every sentence."
  },
  {
    id: 8,
    question: "What is the difference between \"bringing problems\" and \"bringing solutions\"? Give an example of each.",
    correctAnswer: "Bringing a problem means identifying that something is wrong and dropping it on someone else: \"This isn't working.\" Just the problem, no diagnosis, no proposed fix. Bringing a solution means identifying the problem, thinking about why it's happening, and proposing options: \"This isn't working. I think the issue is X. Here are two or three ways we could fix it — which direction do you prefer?\" Even if the proposed solutions aren't perfect, the fact that someone thought about the problem, diagnosed a cause, and came with options shows initiative and ownership."
  },
  {
    id: 9,
    question: "Walk through all three steps of the victim response when receiving feedback, and explain why each step prevents growth.",
    correctAnswer: "Step one is DEFEND — the victim explains why they did it that way, building a case for why their work is acceptable instead of acknowledging the issue. Step two is DEFLECT — they shift blame to the brief, the tools, teammates, or the process. As long as the problem is always someone else's fault, there's nothing for them to change. Step three is NO GROWTH — because they never accepted the feedback, nothing in their process changes. The same mistakes keep happening. Eventually the feedback giver stops investing the effort, which is the death of growth."
  },
  {
    id: 10,
    question: "Walk through the three steps of the learning response to the same feedback. What specific things does the learner say and do?",
    correctAnswer: "Step one is LISTEN AND ACKNOWLEDGE: \"You're right, I see what you mean. I'm sorry about that — let me fix it.\" No explanation, no \"but.\" Step two is CLARIFY AND UNDERSTAND: \"Can you walk me through what the correct version should look like? I want to make sure I understand the standard so I hit it next time.\" They're learning, not defending. Step three is PRESENT ACTION STEPS: Within minutes, they come back with specific changes — like double-checking requirements before submitting, confirming understanding upfront, asking before assuming. Clean, specific, actionable."
  },
  {
    id: 11,
    question: "What is the three-part feedback response formula, and why does completing it in under sixty seconds matter so much?",
    correctAnswer: "The three-part formula is: First — \"Got it, I see the issue\" (acknowledge). Second — \"Can you help me understand the standard?\" (clarify). Third — \"Here's specifically what I'll do differently\" (act). Completing this in under sixty seconds matters because that tiny window reveals everything about how fast someone is going to grow. The person who can do this builds trust rapidly — people keep investing in their development. The person who defends and deflects for ten minutes destroys trust, and eventually people stop giving them feedback entirely. Once feedback stops, growth stops."
  },
  {
    id: 12,
    question: "Why does the training describe it as \"the death of your growth\" when people stop giving you feedback?",
    correctAnswer: "Feedback is the single fastest way to improve at anything. When someone takes the time to review your work and tell you what needs to change, they're giving you a shortcut — pointing directly at the gap between where you are and where you need to be. When a person consistently responds with defending and deflecting, the feedback giver eventually realizes their effort isn't leading anywhere and stops. From the outside it might feel fine — no one's criticizing you. But the reality is people haven't stopped because you're doing great — they've stopped because they've given up on you getting better. Once that happens, you're stuck while everyone who accepts feedback keeps improving."
  },
  {
    id: 13,
    question: "What is Stage 1 of the learning process, and what is the one rule you must follow during this stage?",
    correctAnswer: "Stage 1 is \"Consume and Capture.\" This is your first exposure to new material. The one critical rule is: you never just watch or read passively. While going through the material, you must write notes in your own words — not copy-pasting, not highlighting, but actually writing what you understand. This forces your brain to actively process the information instead of just letting it wash over you. At this stage, you'll understand maybe 40 to 60 percent of the material, and that is completely normal."
  },
  {
    id: 14,
    question: "What happens during Stage 2, and why is it the step that most people skip?",
    correctAnswer: "Stage 2 is \"Revisit and Reinforce.\" Within 24 to 48 hours, you go back through the exact same material and make completely fresh notes, separate from your first set. You notice things you missed, concepts that confused you before suddenly click, and specific details that went over your head. Your understanding jumps from about 60% to 80-85%. Most people skip this step because they feel like they've already \"seen it.\" But this second pass is where real learning happens — the first pass was just raw data collection; the second is where your brain starts organizing, connecting, and truly understanding."
  },
  {
    id: 15,
    question: "Describe exactly what Stage 3 looks like in practice. What do you do first, and what do you do immediately after?",
    correctAnswer: "Stage 3 is \"Repeat It to Yourself and Apply It.\" First, you close everything and say what you learned back to yourself from memory — out loud, in a voice note, or written summary. If you get stuck, that tells you where your knowledge gap is. Second, you immediately apply it on real work — actually do the thing, use the tool, follow the process. This creates learning that reading alone cannot provide. Your hands learn, your instincts develop, you build practical knowledge. The combination of verbal repetition plus hands-on application creates 90-95% retention."
  },
  {
    id: 16,
    question: "What are the four retention levels after one week, and what does each mean practically?",
    correctAnswer: "Level 1 — Just watching once, no notes: 10-20% retention. You've forgotten almost everything. Level 2 — Watching and taking notes: 40-50% retention. You know the overall structure but miss half the important details. Level 3 — Watching, notes, revisiting within 24-48 hours with fresh notes: 70-80% retention. You actually understand the material solidly. Level 4 — The full three-stage process (consume with notes, revisit with fresh notes, repeat from memory, immediately apply): 90-95% retention after a full week. This is where real mastery begins."
  },
  {
    id: 17,
    question: "The training says \"mindset is a choice you make every single day.\" What does that actually mean in practice?",
    correctAnswer: "It means mindset isn't a personality trait — it's a decision you make in specific moments. Every time you face a challenge, you choose: shut down or take the first step. Every time you receive feedback, you choose: get defensive or listen. Every time something doesn't work, you choose: quit or try a different approach. In practice, it's about recognizing the moment when your brain wants to shut down and consciously choosing a different response. It's not about never having fixed mindset thoughts — it's about noticing them and choosing the growth response instead. That choice, made repeatedly, is what separates people who improve dramatically from those who stay where they are."
  },
  {
    id: 18,
    question: "The training says \"problems should never be a surprise.\" What does proactive communication look like in practice?",
    correctAnswer: "Proactive communication means sharing information — especially problems — before anyone has to ask. If something is going wrong, they should hear from you first, early enough that something can still be done. For example, if you're going to miss a deadline, you say something at 10 AM — not at 11:59 PM. The message is: \"I'm running behind. I'll have most done by end of day but need until tomorrow for the last part. Want me to prioritize anything?\" That early message shows awareness, solutions thinking, and gives the other person time to adjust. Proactive communication also means sending progress updates without being asked and flagging potential problems before they become actual ones."
  },
  {
    id: 19,
    question: "The victim response and the learner response both start with the same situation — the same feedback about the same mistake. Why do they end up in completely different places?",
    correctAnswer: "They end up differently because of what happens in the first sixty seconds. The victim defends and deflects, never accepting the problem is theirs — so nothing changes and the same mistake repeats. Over time, the feedback giver stops investing. The learner acknowledges immediately, asks a clarifying question, and presents action steps — so the same mistake doesn't repeat. The feedback giver sees improvement and invests more. The gap compounds: after ten rounds, the learner has improved ten times while the victim makes the same mistakes from round one. Same starting point, same feedback, but one person used it to grow and the other used it to build a wall around their ego."
  },
  {
    id: 20,
    question: "The training says \"if you're not writing notes, you're not learning — you're just being entertained.\" Explain why passive consumption feels like learning but doesn't actually work.",
    correctAnswer: "Passive consumption feels like learning because your brain recognizes the information as it comes in — you follow along, things make sense, and you get a feeling of understanding. But recognition and recall are completely different brain functions. Recognizing information is easy; recalling it later requires your brain to have actually encoded and stored it. That encoding only happens when your brain actively processes the information — which is what writing notes in your own words does. It forces your brain to organize, categorize, and translate. Without it, information passes through like water through a sieve. That's why passive watchers retain only 10-20% after a week while the full three-stage process pushes retention to 90-95%."
  }
]

const PASS_THRESHOLD = 12

export default function MarketingDay1Assessment() {
  const [telegram, setTelegram] = useState('')
  const [email, setEmail] = useState('')
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const [results, setResults] = useState<{ [key: number]: { correct: boolean, feedback: string } } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [score, setScore] = useState(0)
  const [timerStarted, setTimerStarted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(40 * 60)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const autoSubmitRef = useRef(false)

  useEffect(() => {
    const userData = localStorage.getItem('marketing_training_user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        if (user.telegramUsername) setTelegram(user.telegramUsername)
        if (user.email) setEmail(user.email)
      } catch { /* ignore */ }
    }
  }, [])

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    if (!timerStarted && telegram && email && value.length === 1) {
      setTimerStarted(true)
    }
  }

  useEffect(() => {
    if (timerStarted && !showSummary) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
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
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      }
    }
  }, [timerStarted, showSummary])

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
    
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    
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
      const response = await fetch('/api/marketing/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram,
          email,
          day: 1,
          answers: questions.map(q => ({
            question: q.question,
            correctAnswer: q.correctAnswer,
            userAnswer: answers[q.id] || ''
          }))
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to evaluate answers')
      }

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
    if (score >= PASS_THRESHOLD) return 'text-green-600'
    if (score >= PASS_THRESHOLD - 2) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen relative">
      <DynamicBackground />
      
      <section className="section pt-32 md:pt-40 relative z-10">
        <div className="container max-w-4xl">
          <Reveal>
            <div className="text-center mb-12">
              <h1 className="mb-4">Marketing Day 1 Assessment</h1>
              <p className="text-xl" style={{ color: 'var(--text-secondary-on-white)' }}>
                20 questions on mindset, A-player traits, feedback, and learning strategies. You need {PASS_THRESHOLD}/20 to pass.
              </p>
            </div>
          </Reveal>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card glass-card"
          >
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
                      You have 40 minutes to complete all 20 questions. Auto-submits when time runs out!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
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
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="your.email@example.com"
                    required
                    disabled={showSummary}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Assessment Questions (20)</h3>
                {questions.map((question, index) => (
                  <div key={question.id} className="space-y-3">
                    <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      <span className="inline-flex items-center gap-2">
                        <span className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white bg-blue-500">
                          {index + 1}
                        </span>
                        {question.question}
                      </span>
                    </label>
                    <textarea
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[100px]"
                      placeholder="Type your answer here..."
                      required
                      disabled={showSummary}
                    />
                    
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

              {!showSummary && (
                <div className="flex justify-center pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-12 py-4 rounded-lg font-semibold text-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all inline-flex items-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Evaluating with AI...
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

              {showSummary && results && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mt-8 p-8 rounded-2xl border-2 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300"
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

                  {score >= PASS_THRESHOLD ? (
                    <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
                      <p className="text-lg font-semibold text-green-800 mb-2">
                        Test Passed!
                      </p>
                      <p className="text-green-700">
                        You've demonstrated a strong understanding of the material. Your responses will be reviewed by our team.
                      </p>
                    </div>
                  ) : score >= PASS_THRESHOLD - 2 ? (
                    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                      <p className="text-lg font-semibold text-yellow-800 mb-2">
                        One More Chance
                      </p>
                      <p className="text-yellow-700 mb-4">
                        You were close! You can retake the assessment one more time.
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 transition-all"
                      >
                        Retake Assessment
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
                      <p className="text-lg font-semibold text-red-800 mb-2">
                        Assessment Not Passed
                      </p>
                      <p className="text-red-700">
                        You likely didn't pay full attention to the training! This assessment is unfortunately over for now. Maybe next time. Thanks for applying.
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
