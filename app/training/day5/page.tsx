'use client'

import { motion } from 'framer-motion'
import { ExternalLink, BookOpen, AlertCircle, ClipboardCheck } from 'lucide-react'
import DynamicBackground from '@/components/DynamicBackground'
import Reveal from '@/components/Reveal'
import Link from 'next/link'

export default function TrainingDay5() {
  return (
    <div className="min-h-screen relative">
      <DynamicBackground />
      
      <section className="section pt-32 md:pt-40 relative z-10">
        <div className="container max-w-4xl">
          <Reveal>
            <div className="text-center mb-12">
              <h1 className="mb-4">
                Welcome to Day 5
              </h1>
              <p className="text-xl" style={{ color: 'var(--text-secondary-on-white)' }}>
                Complete your training journey
              </p>
            </div>
          </Reveal>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card glass-card space-y-8"
          >
            {/* Instructions */}
            <div className="p-6 bg-blue-50 border-2 border-blue-500 rounded-xl">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-blue-900 mb-2">Important Instructions</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li>• Please follow the link below and watch every video</li>
                    <li>• You cannot do anything else while watching the videos</li>
                    <li>• Make sure to make actual notes of everything you see (you will need them)</li>
                    <li>• After completing the videos, take the assessment below</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Training Link */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                Day 5 Training Materials
              </h3>
              <a
                href="https://pentagonal-thief-156.notion.site/FINAL-DAY-DAY-5-24eb6586b06d8048b9e1c707c909b85f?source=copy_link"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary hover-lift text-lg px-8 py-4 inline-flex items-center gap-3 w-full justify-center"
              >
                <ExternalLink className="w-5 h-5" />
                Open Day 5 Training Videos
              </a>
            </div>

            {/* Assessment Link */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ClipboardCheck className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                Day 5 Assessment
              </h3>
              <Link
                href="/training/day5/assessment"
                className="btn-primary btn-shine hover-lift text-lg px-8 py-4 inline-flex items-center gap-3 w-full justify-center"
              >
                Take Day 5 Assessment
                <ExternalLink className="w-5 h-5" />
              </Link>
            </div>

            {/* Completion Notice */}
            <div className="p-6 bg-green-50 border-2 border-green-500 rounded-xl text-center mb-6">
              <h3 className="text-lg font-bold text-green-900 mb-2">🎉 Final Day!</h3>
              <p className="text-green-800">
                After completing Day 5 and passing the assessment, you will have finished all training modules. Check Telegram for next steps!
              </p>
            </div>

            {/* Back to Dashboard */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-lg mb-4" style={{ color: 'var(--text-secondary-on-white)' }}>
                Return to dashboard and await admin instructions
              </p>
              <Link
                href="/training"
                className="btn-secondary hover-lift px-8 py-3 inline-flex items-center gap-2"
              >
                Back to Training Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
