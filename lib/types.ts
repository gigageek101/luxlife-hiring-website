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

