'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, Share2, BookOpen, Shield, AlertTriangle, Users, ExternalLink, ArrowRight } from 'lucide-react'

export default function HiddenScams() {
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
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl mb-8 mx-auto shadow-lg" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                <Shield className="w-12 h-12 text-white" />
              </div>

              {/* Category */}
              <span 
                className="inline-block px-4 py-2 text-sm font-medium rounded-full mb-6"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Scam Prevention
              </span>

              {/* Title */}
              <h1 className="mb-6">
                🕵️‍♂️ The Hidden Scams That Target 
                <span className="text-gradient block mt-2">Hardworking Filipinos 🚨</span>
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Calendar className="w-5 h-5" />
                  <span>January 12, 2025</span>
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
              <h2 className="mb-6 mt-8" style={{ color: 'var(--text-primary)' }}>😠 When Motivation Meets Manipulation</h2>
              
              <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
                Ambitious Filipinos chase opportunities online every day. But scammers know this — and they exploit it. The harder you're willing to work, the more likely you are to get targeted with fake promises.
              </p>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>🚩 Common Scams</h2>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4 p-6 rounded-lg" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                  <div className="text-2xl">💸</div>
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Fake Job Posts</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Too-good-to-be-true offers that ask for "training fees"</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 rounded-lg" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                  <div className="text-2xl">👻</div>
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Ghost Employers</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Work gets done, but payments never arrive</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 rounded-lg" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                  <div className="text-2xl">📄</div>
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Contracts</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Leaving workers with zero protection</p>
                  </div>
                </div>
              </div>

              <div className="card p-6 mb-8" style={{ background: 'var(--accent-muted)', border: '1px solid var(--accent)' }}>
                <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                  The result? Motivated Filipinos lose money, energy, and trust.
                </p>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>📊 Why High Performers Suffer Most</h2>
              
              <p className="mb-8 text-lg" style={{ color: 'var(--text-secondary)' }}>
                Scammers love ambitious people. If you're the type to show up early, stay late, and prove yourself — you're the type they exploit hardest. Instead of building a career, you waste energy on traps.
              </p>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>🛡️ The Safer Option</h2>
              
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                That's why we created HiringPhilippines.Careers. Inside our free Discord, every single posting is verified.
              </p>

              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Here's what you get:</p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="text-xl">🔐</div>
                  <span style={{ color: 'var(--text-secondary)' }}><strong>Security</strong> – only trusted employers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xl">🛡️</div>
                  <span style={{ color: 'var(--text-secondary)' }}><strong>Protection</strong> – no fake training fees, no ghost jobs</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xl">💬</div>
                  <span style={{ color: 'var(--text-secondary)' }}><strong>A Network</strong> – people helping each other grow</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xl">🚀</div>
                  <span style={{ color: 'var(--text-secondary)' }}><strong>Speed</strong> – real opportunities posted the moment they're live</span>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>🧑‍💻 Jerome's Story</h2>
              
              <div className="card p-6 mb-8" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Jerome from Cebu lost ₱5,000 to a "job training program" that turned out fake. He nearly gave up freelancing. After joining our Discord, he found a verified role in two weeks — with real pay, a contract, and a future.
                </p>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  His lesson? Hard work deserves security.
                </p>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>🎯 Stop Letting Scams Win</h2>
              
              <p className="mb-8 text-lg" style={{ color: 'var(--text-secondary)' }}>
                If you're ready to work hard, do it in the right place.
              </p>

              <div className="card p-8 text-center" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', color: 'white' }}>
                <h3 className="mb-4 text-white">Protect Your Hard Work</h3>
                <p className="mb-6 text-white/90">
                  Join our free Discord today and turn effort into opportunity.
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
                <h3 className="mb-4" style={{ color: 'var(--text-primary)' }}>🚨 Red Flags to Watch For:</h3>
                <ul className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
                  <li>• Jobs asking for upfront payments or "training fees"</li>
                  <li>• Employers who won't provide company details or contracts</li>
                  <li>• Promises of unrealistic earnings with minimal work</li>
                  <li>• Pressure to "act fast" or "limited time offers"</li>
                  <li>• Communication only through messaging apps, never official channels</li>
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
              <Link href="/blog/hidden-niches-crowded-market" className="card hover-lift group block">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 group-hover:text-[var(--accent)] transition-colors">
                      No Days Off? The Dark Side of Outsourcing in the Philippines
                    </h3>
                    <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Discover why many Filipino remote workers face constant pressure to stay online every day.
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