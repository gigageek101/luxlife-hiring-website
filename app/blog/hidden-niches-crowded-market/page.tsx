'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, Share2, BookOpen, Moon, Users, Zap, ExternalLink, ArrowRight } from 'lucide-react'

export default function NoDaysOff() {
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
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl mb-8 mx-auto shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                <Moon className="w-12 h-12 text-white" />
              </div>

              {/* Category */}
              <span 
                className="inline-block px-4 py-2 text-sm font-medium rounded-full mb-6"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Work-Life Balance
              </span>

              {/* Title */}
              <h1 className="mb-6">
                🗓️ No Days Off? The Dark Side of 
                <span className="text-gradient block mt-2">Outsourcing in the Philippines 😵‍💫</span>
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Calendar className="w-5 h-5" />
                  <span>January 10, 2025</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Clock className="w-5 h-5" />
                  <span>3 min read</span>
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
              <h2 className="mb-6 mt-8" style={{ color: 'var(--text-primary)' }}>🕒 Always Online, Always Exhausted</h2>
              
              <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
                Many Filipinos enter remote work dreaming of freedom. But instead, they face constant pressure to stay online every day — even weekends. Over time, rest disappears, and burnout takes over.
              </p>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>🚩 The Reality of "No Off Days"</h2>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4 p-6 rounded-lg" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                  <div className="text-2xl">⏳</div>
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>24/7 Availability Expected</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Employers expect availability around the clock</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 rounded-lg" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                  <div className="text-2xl">📉</div>
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Productivity Drops</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Performance suffers after endless hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 rounded-lg" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                  <div className="text-2xl">🧠</div>
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Stress Replaces Motivation</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Mental health deteriorates without proper rest</p>
                  </div>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>📊 Proof in the Numbers</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="text-center p-6 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="text-4xl font-bold mb-2" style={{ color: 'var(--accent)' }}>50%</div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>of freelancers in PH work 6–7 days a week</p>
                </div>
                <div className="text-center p-6 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="text-4xl font-bold mb-2" style={{ color: 'var(--accent)' }}>#1</div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Burnout is the fastest way to lose top talent in outsourcing</p>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>⚡ Where Balance Exists</h2>
              
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                Inside our free HiringPhilippines.Careers Discord, opportunities come with respect for structure.
              </p>

              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>You'll find:</p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="text-xl">🛡️</div>
                  <span style={{ color: 'var(--text-secondary)' }}><strong>Verified jobs</strong> that protect your rest days</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xl">💬</div>
                  <span style={{ color: 'var(--text-secondary)' }}><strong>Community advice</strong> on setting boundaries</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xl">🚀</div>
                  <span style={{ color: 'var(--text-secondary)' }}><strong>Roles designed</strong> for long-term growth</span>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>🧑‍💻 Anna's Lesson</h2>
              
              <div className="card p-6 mb-8" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Anna worked every Sunday for an e-commerce company. Burnout hit hard, and she quit. Through our Discord, she found a verified role with a structured 5-day week.
                </p>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Now, she performs better — because she finally rests.
                </p>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>🎯 Work Hard, Rest Hard</h2>
              
              <p className="mb-8 text-lg" style={{ color: 'var(--text-secondary)' }}>
                Hard work builds careers — but only if balanced with recovery.
              </p>

              <div className="card p-8 text-center" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', color: 'white' }}>
                <h3 className="mb-4 text-white">Find Balance in Your Career</h3>
                <p className="mb-6 text-white/90">
                  Join our free Discord today and discover opportunities that respect both your ambition and your need for rest.
                </p>
                <a 
                  href="https://discord.gg/luxlife" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-[var(--accent)] px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors"
                >
                  👉 Join Our Discord Now
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="mt-12 p-6 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h3 className="mb-4" style={{ color: 'var(--text-primary)' }}>💡 Tips for Setting Boundaries:</h3>
                <ul className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
                  <li>• Clearly communicate your working hours from day one</li>
                  <li>• Set up separate work and personal communication channels</li>
                  <li>• Use "Do Not Disturb" modes during off-hours</li>
                  <li>• Document your availability in your contract</li>
                  <li>• Join communities that support work-life balance</li>
                </ul>
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
              <Link href="/blog/short-attention-spans-marketing" className="card hover-lift group block">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 group-hover:text-[var(--accent)] transition-colors">
                      Why High Performers Quit: The Balance Problem in the Philippines
                    </h3>
                    <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Discover why talented Filipino workers leave and how to find employers who value both performance and well-being.
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