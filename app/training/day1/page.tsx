'use client'

import { motion } from 'framer-motion'
import { ExternalLink, BookOpen, AlertCircle } from 'lucide-react'
import DynamicBackground from '@/components/DynamicBackground'
import Reveal from '@/components/Reveal'
import Link from 'next/link'

export default function TrainingDay1() {
  return (
    <div className="min-h-screen relative">
      <DynamicBackground />
      
      <section className="section pt-32 md:pt-40 relative z-10">
        <div className="container max-w-4xl">
          <Reveal>
            <div className="text-center mb-12">
              <h1 className="mb-4">
                Welcome to Day 1
              </h1>
              <p className="text-xl" style={{ color: 'var(--text-secondary-on-white)' }}>
                Start your training journey here
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
                  </ul>
                </div>
              </div>
            </div>

            {/* Training Link */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                Day 1 Training Materials
              </h3>
              <a
                href="https://pentagonal-thief-156.notion.site/Chatting-course-Day-1-24eb6586b06d8014a601f1096525b73f?source=copy_link"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary hover-lift text-lg px-8 py-4 inline-flex items-center gap-3 w-full justify-center"
              >
                <ExternalLink className="w-5 h-5" />
                Open Day 1 Training Videos
              </a>
            </div>

            {/* No Assessment Notice */}
            <div className="p-6 bg-yellow-50 border-2 border-yellow-500 rounded-xl">
              <h3 className="text-lg font-bold text-yellow-900 mb-2">📌 Note About Day 1</h3>
              <p className="text-yellow-800 mb-3">
                Day 1 has <strong>no assessment</strong>. After completing the training videos, check Telegram for updates on when you can start Day 2.
              </p>
              <p className="text-yellow-800">
                You will find Day 2 at: <Link href="/training/day2" className="font-semibold underline hover:text-yellow-900">hiringphilippines.careers/training/day2</Link>
              </p>
            </div>

            {/* Back to Dashboard */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-lg mb-4" style={{ color: 'var(--text-secondary-on-white)' }}>
                After completing Day 1, check Telegram for admin approval to continue
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
