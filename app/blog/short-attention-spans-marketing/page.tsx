'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, Share2, BookOpen, Zap, Video, Hash, MessageCircle, Brain, ArrowRight } from 'lucide-react'

export default function ShortAttentionSpansMarketing() {
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
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl mb-8 mx-auto shadow-lg" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                <Brain className="w-12 h-12 text-white" />
              </div>

              <span 
                className="inline-block px-4 py-2 text-sm font-medium rounded-full mb-6"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Career Growth
              </span>

              <h1 className="mb-6">
                Why High Performers Quit: The Balance Problem in the Philippines 😤
              </h1>

              <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary-on-white)' }}>
                  <Calendar className="w-5 h-5" />
                  <span>January 8, 2025</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary-on-white)' }}>
                  <Clock className="w-5 h-5" />
                  <span>2 min read</span>
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
                <h2 className="text-2xl font-bold mb-4">🏃‍♂️ Running Until Empty</h2>
                <p style={{ color: 'var(--text-secondary-on-white)' }}>
                  High-performing Filipinos often quit not because they lack drive — but because companies mistake dedication for endless availability.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">🚩 Why They Leave</h2>
                <ul className="list-disc pl-6 space-y-2" style={{ color: 'var(--text-secondary-on-white)' }}>
                  <li>📉 Burnout from too much workload</li>
                  <li>💸 No raises despite extra tasks</li>
                  <li>🛑 No career path, just more pressure</li>
                </ul>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">📊 Research Speaks</h2>
                <p style={{ color: 'var(--text-secondary-on-white)' }}>
                  High performers leave 2.5x faster if they feel exploited. In PH outsourcing, churn costs companies thousands — but it's the workers who suffer most.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">⚡ A Smarter Way</h2>
                <p style={{ color: 'var(--text-secondary-on-white)' }}>
                  Our HiringPhilippines.Careers Discord offers:
                </p>
                <ul className="list-disc pl-6 space-y-2" style={{ color: 'var(--text-secondary-on-white)' }}>
                  <li>🛡️ Roles that value effort with structure</li>
                  <li>📈 Growth paths, not dead ends</li>
                  <li>💬 A network of ambitious professionals like you</li>
                </ul>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">🧑‍💻 Ramon's Story</h2>
                <p style={{ color: 'var(--text-secondary-on-white)' }}>
                  Ramon, a Filipino developer, flawlessly managed two projects. His "reward"? A third project dumped on him — no raise. He left and found a new role via our Discord where performance = promotions.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">🎯 Don't Let Your Talent Go to Waste</h2>
                <p style={{ color: 'var(--text-secondary-on-white)' }}>
                  Hard workers deserve real recognition.
                </p>
                <p style={{ color: 'var(--text-secondary-on-white)' }}>
                  👉 Join our free Discord today and grow in a community that values you.
                </p>
              </div>

              <div className="card my-8 p-6" style={{ background: 'linear-gradient(135deg, var(--accent-muted), var(--accent))', color: 'white' }}>
                <h3>Ready to Find Better Opportunities?</h3>
                <p className="mb-4 text-white/90">
                  Join our Discord community and connect with verified employers who value Filipino talent and respect work-life balance.
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
              <Link href="/blog/creator-delegation-growth" className="card hover-lift group block">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 group-hover:text-[var(--accent)] transition-colors">
                      Why Doing It All Yourself as a Creator Won't Work
                    </h3>
                    <p className="mb-4" style={{ color: 'var(--text-secondary-on-white)' }}>
                      Trying to do everything yourself is the fastest way to burn out and limit your growth. Here's why creators who delegate scale faster.
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
