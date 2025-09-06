'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, User, ArrowLeft, Share2, BookOpen, TrendingUp, Users } from 'lucide-react'

export default function EngagementVsFollowers() {
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
              <span 
                className="inline-block px-4 py-2 text-sm font-medium rounded-full mb-6"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Strategy
              </span>

              <h1 className="mb-6">
                Why Engagement Rate Matters More Than 
                <span className="text-gradient block mt-2">Follower Count</span>
              </h1>

              <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <User className="w-5 h-5" />
                  <span>Mike Johnson</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Calendar className="w-5 h-5" />
                  <span>January 12, 2025</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Clock className="w-5 h-5" />
                  <span>6 min read</span>
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
              style={{ color: 'var(--text-primary)' }}
            >
              <div className="w-full h-64 md:h-96 rounded-xl mb-8 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] opacity-20"></div>

              <p className="text-xl leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
                The era of chasing follower counts is over. Smart brands and marketers now prioritize engagement rates as the true measure of influence and potential ROI. Here's why this shift matters for your success.
              </p>

              <h2 style={{ color: 'var(--text-primary)' }}>The Engagement Revolution</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                A creator with 10,000 highly engaged followers often delivers better results than someone with 100,000 passive followers. Engagement rate measures the percentage of your audience that actively interacts with your content through likes, comments, shares, and saves.
              </p>

              <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="card p-6 text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                  <h3 style={{ color: 'var(--text-primary)' }}>High Engagement</h3>
                  <p className="text-2xl font-bold mb-2" style={{ color: 'var(--accent)' }}>5-8%</p>
                  <p style={{ color: 'var(--text-secondary)' }}>Average engagement rate for quality influencers</p>
                </div>
                <div className="card p-6 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                  <h3 style={{ color: 'var(--text-primary)' }}>Low Engagement</h3>
                  <p className="text-2xl font-bold mb-2" style={{ color: 'var(--text-muted)' }}>1-2%</p>
                  <p style={{ color: 'var(--text-secondary)' }}>Typical rate for follower-focused accounts</p>
                </div>
              </div>

              <h2 style={{ color: 'var(--text-primary)' }}>Why Brands Prefer Engagement</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Brands invest in influencer partnerships to drive action—purchases, sign-ups, brand awareness. An engaged audience is more likely to trust recommendations and take action, making them infinitely more valuable than passive followers.
              </p>

              <div className="card my-8 p-6" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                <h3 style={{ color: 'var(--accent)' }}>📊 Real Example</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Creator A: 50K followers, 2% engagement = 1,000 active users<br />
                  Creator B: 15K followers, 6% engagement = 900 active users<br />
                  <strong>Creator B often gets higher brand deal rates despite fewer followers.</strong>
                </p>
              </div>

              <h2 style={{ color: 'var(--text-primary)' }}>How to Boost Your Engagement Rate</h2>
              
              <h3 style={{ color: 'var(--text-primary)' }}>1. Create Conversation Starters</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Ask questions, share opinions, and create content that naturally invites responses. Stories with polls, Q&As, and "this or that" questions drive immediate engagement.
              </p>

              <h3 style={{ color: 'var(--text-primary)' }}>2. Respond to Every Comment</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Show your audience you value their input by responding thoughtfully to comments. This encourages more people to engage and signals to the algorithm that your content sparks conversation.
              </p>

              <h3 style={{ color: 'var(--text-primary)' }}>3. Post When Your Audience is Active</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Use Instagram Insights to identify when your followers are most active. Posting during peak hours increases the likelihood of immediate engagement, which boosts your content's reach.
              </p>

              <h2 style={{ color: 'var(--text-primary)' }}>Quality Over Quantity</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Focus on attracting followers who genuinely care about your content rather than chasing vanity metrics. A smaller, engaged community will always outperform a large, disinterested audience in terms of monetization and brand partnerships.
              </p>

              <div className="card my-8 p-6" style={{ background: 'linear-gradient(135deg, var(--accent-muted), var(--accent))', color: 'white' }}>
                <h3>Ready to Optimize Your Engagement?</h3>
                <p className="mb-4 text-white/90">
                  Our team specializes in helping creators build highly engaged communities that convert. Get personalized strategies for your niche.
                </p>
                <Link href="/contact" className="btn-primary bg-white text-[var(--accent)] hover:bg-white/90">
                  Boost Your Engagement Rate
                </Link>
              </div>
            </motion.article>

            {/* Author Bio */}
            <motion.div
              className="card mt-12 p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center text-white font-bold text-xl">
                  MJ
                </div>
                <div>
                  <h3 style={{ color: 'var(--text-primary)' }}>Mike Johnson</h3>
                  <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                    Data-driven social media analyst specializing in engagement optimization and audience growth strategies.
                  </p>
                  <Link href="/contact" className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
                    Connect with Mike →
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
