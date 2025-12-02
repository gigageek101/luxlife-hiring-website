'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, Share2, BookOpen, Heart, ArrowRight } from 'lucide-react'

export default function WorkHardWithoutBurnout() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <section className="pt-24 pb-8">
        <div className="container">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-[var(--accent)] hover:gap-3 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl mb-8 mx-auto shadow-lg" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <Heart className="w-12 h-12 text-white" />
              </div>

              <span 
                className="inline-block px-4 py-2 text-sm font-medium rounded-full mb-6"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Mental Health
              </span>

              <h1 className="mb-6">How to Work Hard Without Burning Out in Remote Jobs 🌱</h1>

              <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary-on-white)' }}>
                  <Calendar className="w-5 h-5" />
                  <span>January 5, 2025</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary-on-white)' }}>
                  <Clock className="w-5 h-5" />
                  <span>4 min read</span>
                </div>
                <button className="flex items-center gap-2 text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>
            </motion.div>

            <motion.article
              className="prose prose-lg max-w-none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ 
                color: 'var(--text-primary)',
                lineHeight: '1.8'
              } as React.CSSProperties}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">🚀 Ambition vs Exhaustion</h2>
                <p style={{ color: 'var(--text-secondary-on-white)' }}>
                  Filipinos love to prove themselves. But too often, ambition turns into burnout because employers push workers past their limits.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">🚩 Employer Mistakes</h2>
                <ul className="list-disc pl-6 space-y-2" style={{ color: 'var(--text-secondary-on-white)' }}>
                  <li>⏳ Rewarding performance with endless tasks</li>
                  <li>🌙 Expecting 24/7 availability</li>
                  <li>🧠 Ignoring mental health completely</li>
                </ul>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">📊 The Cost of Burnout</h2>
                <p style={{ color: 'var(--text-secondary-on-white)' }}>
                  Burnout leads to 56% higher turnover.
                </p>
                <p style={{ color: 'var(--text-secondary-on-white)' }}>
                  Replacing skilled workers costs companies double — but workers pay the real price with health and time.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">⚡ A Healthier Option</h2>
                <p style={{ color: 'var(--text-secondary-on-white)' }}>
                  Our free Discord is built for ambitious Filipinos who want to grow — without breaking themselves.
                </p>
                <p style={{ color: 'var(--text-secondary-on-white)' }}>
                  Inside you'll get:
                </p>
                <ul className="list-disc pl-6 space-y-2" style={{ color: 'var(--text-secondary-on-white)' }}>
                  <li>🛡️ Verified jobs with limits and balance</li>
                  <li>💬 Community advice on handling workload</li>
                  <li>🚀 Real opportunities that reward effort sustainably</li>
                </ul>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">🧑‍💻 Lisa's Lesson</h2>
                <p style={{ color: 'var(--text-secondary-on-white)' }}>
                  Lisa once worked for a UK firm answering emails at 3 AM. Burnout destroyed her motivation. She later joined a verified role via our Discord that respected Philippine hours. Now, she's thriving again.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">🎯 Ambition Should Build You Up</h2>
                <p style={{ color: 'var(--text-secondary-on-white)' }}>
                  Work hard, yes. But do it in the right environment.
                </p>
                <p style={{ color: 'var(--text-secondary-on-white)' }}>
                  👉 Join our free Discord today and discover roles that respect both your ambition and your well-being.
                </p>
              </div>

              <div className="card my-8 p-6" style={{ background: 'linear-gradient(135deg, var(--accent-muted), var(--accent))', color: 'white' }}>
                <h3>Ready to Work Smart, Not Just Hard?</h3>
                <p className="mb-4 text-white/90">
                  Join our Discord community and find opportunities that value your ambition while respecting your well-being and work-life balance.
                </p>
                <Link href="/apply" className="btn-primary bg-white text-[var(--accent)] hover:bg-white/90">
                  Join Our Discord Community
                </Link>
              </div>
            </motion.article>

            <motion.div
              className="mt-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-8" style={{ color: 'var(--text-primary)' }}>Continue Reading</h2>
              <Link href="/blog/monetization-strategies-2025" className="card hover-lift group block">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 group-hover:text-[var(--accent)] transition-colors">
                      Why Hardworking Filipinos Often Get Overworked
                    </h3>
                    <p className="mb-4" style={{ color: 'var(--text-secondary-on-white)' }}>
                      Learn why dedication can backfire and how to protect yourself from exploitation while still excelling at work.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 group-hover:gap-3" style={{ background: 'var(--accent)', color: 'white' }}>
                      Read Next Article
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}