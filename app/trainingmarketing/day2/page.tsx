'use client'

import { motion } from 'framer-motion'
import { ExternalLink, BookOpen, AlertCircle } from 'lucide-react'
import DynamicBackground from '@/components/DynamicBackground'
import Reveal from '@/components/Reveal'
import Link from 'next/link'

export default function MarketingDay2() {
  return (
    <div className="min-h-screen relative">
      <DynamicBackground />
      
      <section className="section pt-32 md:pt-40 relative z-10">
        <div className="container max-w-4xl">
          <Reveal>
            <div className="text-center mb-12">
              <h1 className="mb-4">Welcome to Day 2</h1>
              <p className="text-xl" style={{ color: 'var(--text-secondary-on-white)' }}>
                Advanced Marketing Strategies
              </p>
            </div>
          </Reveal>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card glass-card space-y-8"
          >
            <div className="p-6 bg-blue-50 border-2 border-blue-500 rounded-xl">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-blue-900 mb-2">Important Instructions</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li>• Please follow the link below and study all materials carefully</li>
                    <li>• Make sure to make actual notes of everything you see</li>
                    <li>• Take your time to understand each concept thoroughly</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-500" />
                Day 2 Training Materials
              </h3>
              <a
                href="https://pentagonal-thief-156.notion.site/INTRODUCTION-SOFTWARE-AND-TASK-317b6586b06d80879bd3cef45f3f2e69?source=copy_link"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-8 rounded-lg font-semibold text-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all inline-flex items-center gap-3 justify-center"
              >
                <ExternalLink className="w-5 h-5" />
                Open Day 2 Training Materials
              </a>
            </div>

            <div className="text-center pt-6 border-t border-gray-200">
              <Link
                href="/trainingmarketing"
                className="px-8 py-3 rounded-lg font-semibold border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all inline-flex items-center gap-2"
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
