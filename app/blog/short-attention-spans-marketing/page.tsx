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
                Strategy
              </span>

              <h1 className="mb-6">
                ⏳ Why Social Media Marketing Changed: The Era of 
                <span className="text-gradient block mt-2">Short Attention Spans</span>
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
              <p className="text-xl leading-relaxed mb-8" style={{ color: 'var(--text-secondary-on-white)' }}>
                Let's face it: the way people use social media in 2025 is completely different than just a few years ago.
              </p>

              <p className="mb-8 text-lg leading-relaxed" style={{ color: 'var(--text-secondary-on-white)' }}>
                Today, audiences have an average attention span of 8 seconds or less 🧠⚡. That means if your content doesn't grab attention instantly… it's gone 👋.
              </p>

              <p className="mb-8 text-lg leading-relaxed" style={{ color: 'var(--text-secondary-on-white)' }}>
                Here's why social media marketing has changed forever — and how you can adapt.
              </p>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>1. ⚡ Instant Hooks Are Everything</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'var(--accent-muted)' }}>
                  <Zap className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                    The first 3 seconds of your post or video decide if someone keeps watching.
                  </p>
                  <ul style={{ color: 'var(--text-secondary-on-white)' }}>
                    <li>Start with a pattern break (unexpected visuals or bold text).</li>
                    <li>Ask a direct question ("Would you quit your job for this?").</li>
                    <li>Use captions to preview the value.</li>
                  </ul>
                  <div className="card mt-4 p-4" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                    <p className="text-sm" style={{ color: 'var(--accent)' }}>
                      👉 If you don't hook, you don't convert.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>2. 🎥 Short-Form Video Rules</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'var(--accent-muted)' }}>
                  <Video className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                    Platforms like TikTok, Instagram Reels, and YouTube Shorts dominate.
                  </p>
                  <ul style={{ color: 'var(--text-secondary-on-white)' }}>
                    <li>Short clips get higher reach.</li>
                    <li>Algorithms push fast, snackable content.</li>
                    <li>Long-form still works — but only if you earn attention first.</li>
                  </ul>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>3. 🧩 Micro-Content &gt; Long Walls of Text</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'var(--accent-muted)' }}>
                  <Hash className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                    Forget long essays on Instagram captions. People skim.
                  </p>
                  <ul style={{ color: 'var(--text-secondary-on-white)' }}>
                    <li>Use bullet points ✅</li>
                    <li>Break text with emojis 🎯</li>
                    <li>Keep it mobile-friendly 📱</li>
                  </ul>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>4. 🔊 Sound & Trends Drive Reach</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'var(--accent-muted)' }}>
                  <Hash className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                    Audiences respond to:
                  </p>
                  <ul style={{ color: 'var(--text-secondary-on-white)' }}>
                    <li>Trending audio 🔥</li>
                    <li>Memes + cultural references</li>
                    <li>Relatable moments that feel authentic</li>
                  </ul>
                  <div className="card mt-4 p-4" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      👉 Marketing has shifted from perfectly polished to raw & real.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>5. 🤝 Engagement Beats Perfection</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'var(--accent-muted)' }}>
                  <MessageCircle className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                    With short attention spans, the goal is interaction — not perfection.
                  </p>
                  <ul style={{ color: 'var(--text-secondary-on-white)' }}>
                    <li>Add polls, Q&As, comment triggers.</li>
                    <li>Reply quickly to comments & DMs.</li>
                    <li>Make your audience feel part of the story.</li>
                  </ul>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>🔑 Final Thoughts</h2>
              <p style={{ color: 'var(--text-secondary-on-white)' }}>
                Social media marketing has evolved into a game of attention. If you can capture interest in seconds, you'll win followers, engagement, and sales.
              </p>
              <p style={{ color: 'var(--text-secondary-on-white)' }}>
                👉 The new rule: be quick, be real, be engaging.
              </p>

              <div className="card my-8 p-6" style={{ background: 'linear-gradient(135deg, var(--accent-muted), var(--accent))', color: 'white' }}>
                <h3>Ready to Master Short-Form Content?</h3>
                <p className="mb-4 text-white/90">
                  Our team specializes in creating attention-grabbing content that converts in the first 3 seconds. Get strategies tailored to your audience.
                </p>
                <Link href="/contact" className="btn-primary bg-white text-[var(--accent)] hover:bg-white/90">
                  Boost Your Engagement
                </Link>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>❓FAQ: Short Attention Span Marketing</h2>
              <div className="space-y-4">
                <div className="card p-4">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Q1: How long should social media videos be?</h3>
                  <p style={{ color: 'var(--text-secondary-on-white)' }}>Best performing: 7–30 seconds on TikTok/Reels.</p>
                </div>
                <div className="card p-4">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Q2: Are long posts dead?</h3>
                  <p style={{ color: 'var(--text-secondary-on-white)' }}>Not dead — but break them into bite-sized sections so users can skim.</p>
                </div>
                <div className="card p-4">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Q3: What's the #1 tip for grabbing attention?</h3>
                  <p style={{ color: 'var(--text-secondary-on-white)' }}>Use a strong hook in the first 3 seconds. Surprise, curiosity, or bold claims work best.</p>
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
