'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, Share2, BookOpen, AlertTriangle, TrendingDown, Zap, Target, Rocket, ArrowRight, DollarSign } from 'lucide-react'

export default function CreatorDelegationGrowth() {
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
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl mb-8 mx-auto shadow-lg" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                <AlertTriangle className="w-12 h-12 text-white" />
              </div>

              <span 
                className="inline-block px-4 py-2 text-sm font-medium rounded-full mb-6"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Business
              </span>

              <h1 className="mb-6">
                🚫 Why Doing It All Yourself as a Creator 
                <span className="text-gradient block mt-2">Won't Work</span>
              </h1>

              <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary-on-white)' }}>
                  <Calendar className="w-5 h-5" />
                  <span>January 5, 2025</span>
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
              <p className="text-xl leading-relaxed mb-8" style={{ color: 'var(--text-secondary-on-white)' }}>
                Here's the hard truth: if you're a creator or running an Instagram theme page, trying to do everything yourself is the fastest way to burn out and limit your growth.
              </p>

              <p className="mb-8 text-lg leading-relaxed" style={{ color: 'var(--text-secondary-on-white)' }}>
                Yes, you can manage your own marketing, outreach, and monetization. But should you? ❌ Not if you want real ROI.
              </p>

              <p className="mb-8 text-lg leading-relaxed" style={{ color: 'var(--text-secondary-on-white)' }}>
                The creators who win in 2025 are the ones who focus on what they do best: creating content their audience loves.
              </p>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>1. ⏳ Time Is Your Scarcest Resource</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'var(--accent-muted)' }}>
                  <Clock className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                    Content creation alone takes hours: filming, editing, posting, engaging.
                    Now add:
                  </p>
                  <ul style={{ color: 'var(--text-secondary-on-white)' }}>
                    <li>Marketing strategy 📊</li>
                    <li>Negotiating brand deals 💼</li>
                    <li>Tracking analytics 📈</li>
                    <li>Monetization management 💵</li>
                  </ul>
                  <div className="card mt-4 p-4" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                    <p className="text-sm" style={{ color: 'var(--accent)' }}>
                      👉 If you split your energy across all of this, quality suffers everywhere.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>2. 📉 DIY Leads to Slow Growth</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'var(--accent-muted)' }}>
                  <TrendingDown className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                    Creators who try to do it all themselves usually:
                  </p>
                  <ul style={{ color: 'var(--text-secondary-on-white)' }}>
                    <li>Post inconsistently.</li>
                    <li>Miss out on new monetization opportunities.</li>
                    <li>Burn out from managing too many moving parts.</li>
                  </ul>
                  <p style={{ color: 'var(--text-secondary-on-white)' }}>
                    Meanwhile, those who delegate or get support scale faster because they spend 80% of time on content creation (the thing that actually drives growth).
                  </p>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>3. 💰 The ROI Is in Content, Not Admin Work</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'var(--accent-muted)' }}>
                  <DollarSign className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Ask yourself:</p>
                  <ul style={{ color: 'var(--text-secondary-on-white)' }}>
                    <li>Is your time better spent editing a Reel that hits 1M views…</li>
                    <li>Or answering endless emails from brands?</li>
                  </ul>
                  <p style={{ color: 'var(--text-secondary-on-white)' }}>
                    The content is what attracts the audience, drives engagement, and makes deals possible. Without strong content, no monetization strategy matters.
                  </p>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>4. 🧑‍🎨 Focus on Your Genius Zone</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'var(--accent-muted)' }}>
                  <Target className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                    Every successful creator has one genius zone:
                  </p>
                  <ul style={{ color: 'var(--text-secondary-on-white)' }}>
                    <li>Being entertaining 🎭</li>
                    <li>Educating 👩‍🏫</li>
                    <li>Inspiring 🌟</li>
                  </ul>
                  <div className="card mt-4 p-4" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                    <p className="text-sm" style={{ color: 'var(--accent)' }}>
                      👉 That's where your energy should go. The rest can be systemized, automated, or outsourced.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>5. 🚀 High ROI Comes From Doubling Down</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'var(--accent-muted)' }}>
                  <Rocket className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                    The creators who scale to 6- and 7-figures focus on maximizing the one thing only they can do: making content that resonates with their audience.
                  </p>
                  <p style={{ color: 'var(--text-secondary-on-white)' }}>
                    Everything else — scheduling, outreach, monetization, optimization — should be handled by systems, tools, or a team.
                  </p>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>🔑 Final Thoughts</h2>
              <p style={{ color: 'var(--text-secondary-on-white)' }}>
                Doing it yourself feels "safe" — but it's also slow and costly.
              </p>
              <p style={{ color: 'var(--text-secondary-on-white)' }}>
                👉 The real ROI comes when you focus 100% on content creation while letting experts, tools, or partners handle growth and monetization.
              </p>
              <p style={{ color: 'var(--text-secondary-on-white)' }}>
                Content is the magnet. Everything else is just logistics.
              </p>

              <div className="card my-8 p-6" style={{ background: 'linear-gradient(135deg, var(--accent-muted), var(--accent))', color: 'white' }}>
                <h3>Tired of Theory and Wanna Know a Real Success Story?</h3>
                <p className="mb-4 text-white/90">
                  Find out how our client Tania went from burnout fitness influencer to organized business woman.
                </p>
                <Link href="/case-study-tania" className="btn-primary bg-white text-[var(--accent)] hover:bg-white/90 inline-flex items-center gap-2">
                  Read Tania's Success Story
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>❓FAQ: Should Creators Do It Themselves?</h2>
              <div className="space-y-4">
                <div className="card p-4">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Q1: Can a creator handle everything alone at the start?</h3>
                  <p style={{ color: 'var(--text-secondary-on-white)' }}>Yes, but it quickly caps growth. The faster you systemize, the faster you scale.</p>
                </div>
                <div className="card p-4">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Q2: What should creators never outsource?</h3>
                  <p style={{ color: 'var(--text-secondary-on-white)' }}>Your voice and creativity. Audiences follow you for you.</p>
                </div>
                <div className="card p-4">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Q3: What's the first thing to delegate?</h3>
                  <p style={{ color: 'var(--text-secondary-on-white)' }}>Low-ROI tasks: scheduling, outreach, and analytics tracking.</p>
                </div>
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
                      7 Proven Monetization Strategies for Creators in 2025
                    </h3>
                    <p className="mb-4" style={{ color: 'var(--text-secondary-on-white)' }}>
                      The creator economy is growing faster than ever. Discover 7 proven ways to monetize your audience whether you have 1,000 followers or 1M+.
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
