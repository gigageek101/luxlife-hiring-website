'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Dumbbell, Clock, AlertTriangle, Target, Calendar, MessageCircle, Users, TrendingUp, CheckCircle, Heart, ArrowRight } from 'lucide-react'

export default function CaseStudyTania() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Back Navigation */}
      <section className="pt-24 pb-8">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors group">
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Case Study Content */}
      <section className="section pt-0">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Header Icon */}
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl mb-8 mx-auto shadow-lg" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                <Dumbbell className="w-12 h-12 text-white" />
              </div>

              {/* Category */}
              <span 
                className="inline-block px-4 py-2 text-sm font-medium rounded-full mb-6"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Case Study
              </span>

              <h1 className="mb-8">💪 How Fitness Influencer Tania S Transformed Her Brand with POSTE MEDIA LLC</h1>
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
              {/* Background Section */}
              <div className="card mb-12" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'var(--accent-muted)' }}>
                    <Clock className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <h2 className="mb-0" style={{ color: 'var(--text-primary)' }}>🕰️ Background – From Burnout to Balance</h2>
                  </div>
                </div>
                
                <p className="mb-6 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Tania S, a rising fitness influencer, struggled with the dark side of influencer marketing: burnout, shady supplement deals, and endless hours of research. Without a clear system, she felt pressured to monetize her following by taking sponsorships that didn't align with her values.
                </p>

                <div className="p-6 rounded-lg" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                  <p className="italic text-lg mb-0" style={{ color: 'var(--text-primary)' }}>
                    "I remember working 12-hour days, bouncing between content creation, emails, negotiations, and endless scrolling to figure out what trend might work next. It was exhausting. I felt anxious, like I was always one bad deal away from losing credibility with my audience."
                  </p>
                  <p className="text-sm mt-4 font-medium" style={{ color: 'var(--accent)' }}>– Tania S</p>
                </div>
              </div>

              {/* Challenge Section */}
              <div className="card mb-12" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="mb-0" style={{ color: 'var(--text-primary)' }}>🚨 The Challenge – Why Tania Needed Support</h2>
                  </div>
                </div>

                <p className="mb-6 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Before working with POSTE MEDIA LLC, Tania faced the same issues many creators in the fitness niche experience:
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center mt-1 flex-shrink-0" style={{ background: '#ef4444' }}>
                      <span className="text-white text-sm font-bold">✗</span>
                    </div>
                    <div>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Shady supplement deals</p>
                      <p style={{ color: 'var(--text-secondary)' }}>Offers that didn't reflect her values.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center mt-1 flex-shrink-0" style={{ background: '#ef4444' }}>
                      <span className="text-white text-sm font-bold">✗</span>
                    </div>
                    <div>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Burnout risk</p>
                      <p style={{ color: 'var(--text-secondary)' }}>12-hour days filled with anxiety and scattered focus.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center mt-1 flex-shrink-0" style={{ background: '#ef4444' }}>
                      <span className="text-white text-sm font-bold">✗</span>
                    </div>
                    <div>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>No clear content direction</p>
                      <p style={{ color: 'var(--text-secondary)' }}>Wasting hours researching trends that might not work.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Solution Section */}
              <div className="card mb-12" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="mb-0" style={{ color: 'var(--text-primary)' }}>🤝 The Solution – Partnering with POSTE MEDIA LLC</h2>
                  </div>
                </div>

                <p className="mb-6 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  When Tania signed with POSTE MEDIA LLC, her workflow and mindset completely changed. The agency provided her with a system that turned her influencer brand into a sustainable business.
                </p>

                <h3 className="mb-4" style={{ color: 'var(--text-primary)' }}>What POSTE MEDIA LLC did for her:</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Target className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                    <div>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>🔎 Niche Refinement</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Positioned Tania as an expert in functional strength and lifestyle balance.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                    <div>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>📅 Content Strategy</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Delivered a roadmap of trend-driven fitness content so she didn't waste time guessing.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                    <div>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>💬 Audience Engagement Boost</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Helped her connect authentically with her community, increasing likes, shares, and comments.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                    <div>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>🤝 Aligned Partnerships</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Introduced her to ethical fitness brands she could proudly represent.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transformation Section */}
              <div className="card mb-12" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="mb-0" style={{ color: 'var(--text-primary)' }}>🌟 The Transformation – From 12-Hour Days to Real Business</h2>
                  </div>
                </div>

                <p className="mb-6 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  After implementing POSTE MEDIA LLC's strategies, Tania experienced a major shift:
                </p>

                <div className="p-6 rounded-lg mb-6" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                  <p className="italic text-lg mb-0" style={{ color: 'var(--text-primary)' }}>
                    "I don't feel like I'm burning out anymore. I wake up knowing exactly what type of content to focus on, what trends are relevant, and what partnerships actually make sense for me. It's like I finally got my time and peace of mind back."
                  </p>
                  <p className="text-sm mt-4 font-medium" style={{ color: 'var(--accent)' }}>– Tania S</p>
                </div>

                <h3 className="mb-4" style={{ color: 'var(--text-primary)' }}>Key Results:</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: 'var(--success)' }} />
                    <div>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>📈 Higher Engagement</p>
                      <p style={{ color: 'var(--text-secondary)' }}>Her audience interacts more actively with her content.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: 'var(--success)' }} />
                    <div>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>✅ Better Brand Deals</p>
                      <p style={{ color: 'var(--text-secondary)' }}>Partnerships with fitness and wellness companies she actually trusts.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: 'var(--success)' }} />
                    <div>
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>🧘 Work-Life Balance</p>
                      <p style={{ color: 'var(--text-secondary)' }}>A regulated, sustainable schedule instead of anxiety-filled 12-hour workdays.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Outcome Section */}
              <div className="card mb-12" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="mb-0" style={{ color: 'var(--text-primary)' }}>🚀 The Outcome – Building a Brand She's Proud Of</h2>
                  </div>
                </div>

                <p className="mb-6 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Today, Tania runs what she proudly calls a real business instead of just a social media profile. Her brand is consistent, her audience is loyal, and her income is built on partnerships that reflect her values.
                </p>

                <div className="p-6 rounded-lg" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                  <p className="italic text-lg mb-0" style={{ color: 'var(--text-primary)' }}>
                    "Working with POSTE MEDIA turned my career around. I went from surviving deal to deal, feeling anxious all the time, to building a sustainable business I can be proud of. Now I get to focus on what I do best – creating fitness content and connecting with my audience."
                  </p>
                  <p className="text-sm mt-4 font-medium" style={{ color: 'var(--accent)' }}>– Tania S</p>
                </div>
              </div>

              {/* CTA Section */}
              <div className="text-center">
                <motion.div
                  className="card max-w-2xl mx-auto"
                  style={{ background: 'linear-gradient(135deg, var(--accent-muted), var(--accent))' }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <h2 className="mb-4 text-white">Want to Become the Next Success Story?</h2>
                  <p className="mb-6 text-white/90 text-lg">
                    Get a free quote to find out if we can help. Just a button click can change your life same as Tania did.
                  </p>
                  <Link href="/contact" className="btn-primary bg-white text-[var(--accent)] hover:bg-white/90 inline-flex items-center gap-2">
                    Get Your Free Quote
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              </div>
            </motion.article>
          </div>
        </div>
      </section>
    </div>
  )
}
