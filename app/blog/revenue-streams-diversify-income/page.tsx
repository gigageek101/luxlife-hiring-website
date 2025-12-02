'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, Share2, BookOpen, TrendingUp, ArrowRight } from 'lucide-react'

export default function NoStructureNoSuccess() {
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
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl mb-8 mx-auto shadow-lg" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                <TrendingUp className="w-12 h-12 text-white" />
              </div>

              <span 
                className="inline-block px-4 py-2 text-sm font-medium rounded-full mb-6"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Workplace Structure
              </span>

              <h1 className="mb-6">No Structure, No Success: Why Filipinos Deserve Better 📉</h1>

              <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary-on-white)' }}>
                  <Calendar className="w-5 h-5" />
                  <span>January 7, 2025</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary-on-white)' }}>
                  <Clock className="w-5 h-5" />
                  <span>3 min read</span>
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
                <h2 className="text-2xl font-bold mb-4">🌀 The Chaos of Unclear Roles</h2>
                <p style={{ color: 'var(--text-secondary-on-white)' }}>
                  When companies don't set proper structure, Filipino workers end up confused, frustrated, and underperforming — even when they give their all.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">🚩 The Problems</h2>
                <ul className="list-disc pl-6 space-y-2" style={{ color: 'var(--text-secondary-on-white)' }}>
                  <li>❓ No clear manager = lost direction</li>
                  <li>🔄 Tasks change daily = no focus</li>
                  <li>📉 Turnover rises = no growth</li>
                </ul>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">📊 Business Truth</h2>
                <p style={{ color: 'var(--text-secondary-on-white)' }}>
                  Companies with structured workflows see 40% less turnover. Filipino workers want clarity, not chaos.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">⚡ What You'll Find Inside</h2>
                <p style={{ color: 'var(--text-secondary-on-white)' }}>
                  Our application and introduction call solves this by connecting Filipinos to structured, verified opportunities.
                </p>
                <ul className="list-disc pl-6 space-y-2" style={{ color: 'var(--text-secondary-on-white)' }}>
                  <li>🛡️ Clear roles from day one</li>
                  <li>📈 Defined growth paths</li>
                  <li>💬 Support on staying organized</li>
                </ul>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">🧑‍💻 Mark's Lesson</h2>
                <p style={{ color: 'var(--text-secondary-on-white)' }}>
                  Mark started as a VA with no clear tasks. One day he handled social media, the next — accounting. Frustrated, he quit. Inside our application process, he found a structured marketing assistant role — and thrived.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">🎯 Structure Builds Careers</h2>
                <p style={{ color: 'var(--text-secondary-on-white)' }}>
                  Ambition grows where systems exist.
                </p>
                <p style={{ color: 'var(--text-secondary-on-white)' }}>
                  👉 Join our free application today and find opportunities with clarity.
                </p>
              </div>

              <div className="card my-8 p-6" style={{ background: 'linear-gradient(135deg, var(--accent-muted), var(--accent))', color: 'white' }}>
                <h3>Ready to Find Structured Opportunities?</h3>
                <p className="mb-4 text-white/90">
                  Apply now for a 15-minute introduction call and connect with employers who provide clear roles, defined growth paths, and proper structure from day one.
                </p>
                <Link href="/apply" className="btn-primary bg-white text-[var(--accent)] hover:bg-white/90">
                  Apply Now (Takes 5 Minutes)
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
              <Link href="/blog/creator-delegation-growth" className="card hover-lift group block">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 group-hover:text-[var(--accent)] transition-colors">
                      How to Work Hard Without Burning Out in Remote Jobs
                    </h3>
                    <p className="mb-4" style={{ color: 'var(--text-secondary-on-white)' }}>
                      Learn how to maintain your ambition while protecting your well-being in remote work environments.
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