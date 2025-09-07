'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, Share2, BookOpen, AlertTriangle, Users, Zap, ExternalLink, ArrowRight } from 'lucide-react'

export default function HardworkingFilipinos() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Back Navigation */}
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

      {/* Article Header */}
      <section className="section">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Header Icon */}
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl mb-8 mx-auto shadow-lg" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                <AlertTriangle className="w-12 h-12 text-white" />
              </div>

              {/* Category */}
              <span 
                className="inline-block px-4 py-2 text-sm font-medium rounded-full mb-6"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Filipino Workers
              </span>

              {/* Title */}
              <h1 className="mb-6">
                🌟 Why Hardworking Filipinos Often Get 
                <span className="text-gradient block mt-2">Overworked 😓</span>
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary-on-white)' }}>
                  <Calendar className="w-5 h-5" />
                  <span>January 15, 2025</span>
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

            {/* Article Content */}
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
              <h2 className="mb-6 mt-8" style={{ color: 'var(--text-primary)' }}>💪 Dedication That Backfires</h2>
              
              <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--text-secondary-on-white)' }}>
                Filipinos are known worldwide for being hardworking and committed. Many remote workers push themselves to deliver top results — often working late nights and weekends. But instead of being rewarded, high performers usually get piled with even more work.
              </p>

              <p className="mb-8" style={{ color: 'var(--text-secondary-on-white)' }}>
                Over time, this leads to:
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 p-4 rounded-lg" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                  <div className="text-2xl">⏳</div>
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Unpaid Overtime</h3>
                    <p style={{ color: 'var(--text-secondary-on-white)' }}>Always "just one more task"</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                  <div className="text-2xl">💤</div>
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Off Days</h3>
                    <p style={{ color: 'var(--text-secondary-on-white)' }}>Expected to be online 24/7</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                  <div className="text-2xl">🔄</div>
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Burnout</h3>
                    <p style={{ color: 'var(--text-secondary-on-white)' }}>Energy wasted with no growth in return</p>
                  </div>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>📊 The Harsh Reality</h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="text-3xl font-bold mb-2" style={{ color: 'var(--accent)' }}>62%</div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary-on-white)' }}>of Filipino remote workers reported unpaid overtime at least once a week</p>
                </div>
                <div className="text-center p-6 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="text-3xl font-bold mb-2" style={{ color: 'var(--accent)' }}>41%</div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary-on-white)' }}>had no structured off-days — rest becomes a luxury</p>
                </div>
                <div className="text-center p-6 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="text-3xl font-bold mb-2" style={{ color: 'var(--accent)' }}>#1</div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary-on-white)' }}>Burnout is the top reason talent quits in less than a year</p>
                </div>
              </div>

              <div className="card p-6 mb-8" style={{ background: 'var(--accent-muted)', border: '1px solid var(--accent)' }}>
                <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                  Hard work is valuable. But without balance, it becomes a trap.
                </p>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>⚡ A Better Path Exists</h2>
              
              <p className="mb-6" style={{ color: 'var(--text-secondary-on-white)' }}>
                At HiringPhilippines.Careers, we built a safe Discord community to make sure ambition gets rewarded — not abused.
              </p>

              <p className="mb-4" style={{ color: 'var(--text-secondary-on-white)' }}>Inside, you'll find:</p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="text-xl">🔐</div>
                  <span style={{ color: 'var(--text-secondary-on-white)' }}><strong>Verified Employers</strong> – no scams, no shady contracts</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xl">🛡️</div>
                  <span style={{ color: 'var(--text-secondary-on-white)' }}><strong>Safe Job Listings</strong> – every post vetted by the LuxLife Association</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xl">💬</div>
                  <span style={{ color: 'var(--text-secondary-on-white)' }}><strong>Supportive Community</strong> – connect with motivated Filipinos like you</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xl">🚀</div>
                  <span style={{ color: 'var(--text-secondary-on-white)' }}><strong>Real Growth</strong> – opportunities that value performance with structure</span>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>🧑‍💻 A Real Story</h2>
              
              <div className="card p-6 mb-8" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                <p className="mb-4" style={{ color: 'var(--text-secondary-on-white)' }}>
                  Maria from Cebu gave everything to her first remote job. Within months, she was managing triple the workload — with no raise. She burned out and almost quit freelancing.
                </p>
                <p style={{ color: 'var(--text-secondary-on-white)' }}>
                  After joining our Discord, Maria found a verified employer who respected her hours, gave her weekends off, and offered career growth. Now, her hard work finally pays off.
                </p>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>🎯 Don't Let Effort Become Exploitation</h2>
              
              <p className="mb-8 text-lg" style={{ color: 'var(--text-secondary-on-white)' }}>
                If you're ready to give your best, make sure it's for people who value it.
              </p>

              <div className="card p-8 text-center" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', color: 'white' }}>
                <h3 className="mb-4 text-white">Ready to Work Where You're Valued?</h3>
                <p className="mb-6 text-white/90">
                  Join our free Discord today and find jobs that respect your talent, your time, and your future.
                </p>
                <a 
                  href="https://myallsocials.com/luxlife" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-[var(--accent)] px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors"
                >
                  👉 Join Our Discord Now
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.article>

            {/* Related Articles */}
            <motion.div
              className="mt-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-8" style={{ color: 'var(--text-primary)' }}>Continue Reading</h2>
              <Link href="/blog/match-content-audience" className="card hover-lift group block">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 group-hover:text-[var(--accent)] transition-colors">
                      The Hidden Scams That Target Hardworking Filipinos
                    </h3>
                    <p className="mb-4" style={{ color: 'var(--text-secondary-on-white)' }}>
                      Learn how to identify and avoid the common scams that exploit motivated Filipino workers.
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