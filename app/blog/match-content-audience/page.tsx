'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, Share2, BookOpen, Target, BarChart3, MessageCircle, Video, RefreshCw, TrendingUp, ArrowRight } from 'lucide-react'

export default function MatchContentAudience() {
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
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl mb-8 mx-auto shadow-lg" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                <Target className="w-12 h-12 text-white" />
              </div>

              {/* Category */}
              <span 
                className="inline-block px-4 py-2 text-sm font-medium rounded-full mb-6"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Strategy
              </span>

              {/* Title */}
              <h1 className="mb-6">
                🎯 How to Match Content With Your 
                <span className="text-gradient block mt-2">Actual Audience</span>
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Calendar className="w-5 h-5" />
                  <span>January 12, 2025</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Clock className="w-5 h-5" />
                  <span>2 min read</span>
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
              <p className="text-xl leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
                Creating content is easy. Creating content your audience actually cares about? That's the difference between scrolling past 👋 and stopping to engage ❤️.
              </p>

              <p className="mb-8 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                If you want better engagement, retention, and conversions, you need to optimize content to fit your real audience — not the audience you think you have.
              </p>

              <p className="mb-8 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Here's how to do it in 2025 👇
              </p>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>1. 📊 Study Your Analytics</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'var(--accent-muted)' }}>
                  <BarChart3 className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                    Your followers leave clues in the numbers:
                  </p>
                  <ul style={{ color: 'var(--text-secondary)' }}>
                    <li>Age, gender, and location 📍</li>
                    <li>Content types they engage with most</li>
                    <li>Watch time, click-through rates, shares</li>
                  </ul>
                  <div className="card mt-4 p-4" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      👉 Tools like Instagram Insights, TikTok Analytics, and YouTube Studio show you who's watching vs. who's ignoring.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>2. 🗣️ Ask Your Audience Directly</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'var(--accent-muted)' }}>
                  <MessageCircle className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                    Don't guess — ask.
                  </p>
                  <ul style={{ color: 'var(--text-secondary)' }}>
                    <li>Run polls in stories.</li>
                    <li>Use Q&A stickers.</li>
                    <li>Ask "What do you want more of?" in captions.</li>
                  </ul>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Fans love being heard, and you'll get real-time market research for free.
                  </p>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>3. 🎥 Test Different Content Formats</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'var(--accent-muted)' }}>
                  <Video className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                    Some audiences love quick Reels/Shorts, others prefer longer tutorials.
                  </p>
                  <ul style={{ color: 'var(--text-secondary)' }}>
                    <li>Try video, carousels, blogs, podcasts.</li>
                    <li>Track which ones get saves, shares, and comments.</li>
                    <li>Double down on the winners.</li>
                  </ul>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>4. 🎯 Adapt Your Tone & Style</h2>
              <p className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                A fitness creator speaking to busy moms won't sound the same as one speaking to hardcore athletes.
              </p>
              <ul style={{ color: 'var(--text-secondary)' }}>
                <li>Adjust language, pacing, and visuals.</li>
                <li>Stay authentic, but mirror your audience's energy.</li>
              </ul>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>5. 🔁 Iterate & Evolve</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'var(--accent-muted)' }}>
                  <RefreshCw className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                    The audience you have today isn't the same one you'll have in 6 months.
                  </p>
                  <ul style={{ color: 'var(--text-secondary)' }}>
                    <li>Re-check analytics monthly.</li>
                    <li>Stay on top of trends.</li>
                    <li>Refresh formats before people get bored.</li>
                  </ul>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>🔑 Final Thoughts</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                The most successful creators aren't the loudest — they're the ones who listen to their audience and adapt fast. Matching your content to your actual audience leads to:
              </p>
              <ul style={{ color: 'var(--text-secondary)' }}>
                <li>Higher engagement 📈</li>
                <li>Stronger community 🤝</li>
                <li>Better monetization 💰</li>
              </ul>
              <p style={{ color: 'var(--text-secondary)' }}>
                👉 In short: stop guessing, start listening.
              </p>

              <div className="card my-8 p-6" style={{ background: 'linear-gradient(135deg, var(--accent-muted), var(--accent))', color: 'white' }}>
                <h3>Ready to Optimize Your Content Strategy?</h3>
                <p className="mb-4 text-white/90">
                  Our team specializes in helping creators understand their audience and create content that converts. Get personalized insights for your niche.
                </p>
                <Link href="/contact" className="btn-primary bg-white text-[var(--accent)] hover:bg-white/90">
                  Get Your Content Audit
                </Link>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>❓FAQ: Content & Audience Matching</h2>
              <div className="space-y-4">
                <div className="card p-4">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Q1: How do I know if my content matches my audience?</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Check your engagement rates. If views are high but likes/comments are low, you're missing the mark.</p>
                </div>
                <div className="card p-4">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Q2: How often should I analyze my audience?</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>At least once per month to catch shifts early.</p>
                </div>
                <div className="card p-4">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Q3: What's the #1 mistake creators make?</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Assuming their audience wants what the creator wants — instead of testing and asking.</p>
                </div>
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
                      Finding Hidden Niches in a Crowded Market
                    </h3>
                    <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                      The online world feels oversaturated, but there are still thousands of untapped niches waiting to be discovered.
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
