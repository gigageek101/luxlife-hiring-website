export interface ApplicantData {
  fullName?: string
  email?: string
  city?: string
  age?: number
  hasFinishedEducation?: boolean
  educationType?: string
  englishRating?: string
  hasWorkingPc?: boolean
  quizScore?: number
  quizAnswers?: QuizAnswer[]
  memoryTestScore?: number
  memoryTestResult?: MemoryTestResult
  typingTestResult?: TypingTestResult
  speedTestResult?: SpeedTestResult
  creativityTestResult?: CreativityTestResult
  currentStep: number
  isDisqualified: boolean
  disqualificationReason?: string
  isCompleted: boolean
}

export interface QuizAnswer {
  questionId: number
  answer: string
  selectedOption: number
  isCorrect: boolean
}

export interface MemoryTestResult {
  sequence: string[]
  userAnswer: string[]
  correctCount: number
  totalCount: number
  passed: boolean
}

export interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer: number
}

export interface TypingTestResult {
  wpm: number
  accuracy: number
  totalCharacters: number
  correctCharacters: number
  passed: boolean
}

export interface SpeedTestResult {
  downloadSpeed: number
  uploadSpeed: number
  passed: boolean
}

export interface CreativityTestResult {
  object: string
  alternateUses: string[]
  fluencyScore: number
  scenario: string
  captions: string[]
  passed: boolean
}

export const educationTypes = [
  'High School',
  'University',
  'Trade School',
  'Student', // This will trigger disqualification
]

export const englishRatings = [
  'Very Bad', // Will trigger disqualification
  'Bad',      // Will trigger disqualification
  'Okay',
  'Good',
  'Very Good',
]

