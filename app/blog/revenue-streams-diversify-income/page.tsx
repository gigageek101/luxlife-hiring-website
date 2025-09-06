'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, Share2, BookOpen, TrendingUp, Lock, GraduationCap, Shirt, Zap, ArrowRight } from 'lucide-react'

export default function RevenueStreamsDiversifyIncome() {
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
            <Link href="/blog" className="inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors group">
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Blog
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Blog Post Content */}
      <section className="section pt-0">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Header Icon */}
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl mb-8 mx-auto shadow-lg" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                <TrendingUp className="w-12 h-12 text-white" />
              </div>

              {/* Category */}
              <span 
                className="inline-block px-4 py-2 text-sm font-medium rounded-full mb-6"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Revenue
              </span>

              <h1 className="mb-6">💵 Revenue Streams: How to Diversify Your Income as a Creator</h1>
              <div className="flex items-center gap-4 text-sm mb-12" style={{ color: 'var(--text-muted)' }}>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  January 7, 2025
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  4 min read
                </div>
                <button className="flex items-center gap-1 hover:text-[var(--accent)] transition-colors">
                  <Share2 className="w-4 h-4" />
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
                If you're a creator, influencer, or running an Instagram theme page, relying on one single income source is like building a house on one leg of a chair — unstable and risky.
              </p>

              <p className="mb-8 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                👉 Algorithms change. Platforms die. Brands ghost. Trends shift.
              </p>

              <p className="mb-8 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                The creators who thrive long-term are the ones who diversify their revenue streams. By building multiple income channels, you not only earn more but also protect yourself from sudden disruptions.
              </p>

              <p className="mb-8 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Here's a breakdown of the five most powerful revenue streams for creators in 2025 — with practical ways to start today:
              </p>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>1. 📕 Digital Product Creation</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'var(--accent-muted)' }}>
                  <BookOpen className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                    Digital products are the backbone of creator income because they're:
                  </p>
                  <ul style={{ color: 'var(--text-secondary)' }}>
                    <li><strong>Scalable</strong> → one-time creation, infinite sales.</li>
                    <li><strong>High-margin</strong> → no inventory or shipping costs.</li>
                    <li><strong>Authority-building</strong> → positions you as an expert.</li>
                  </ul>
                  <p className="text-sm mt-4" style={{ color: 'var(--text-muted)' }}>
                    💡 Examples: Ebooks (fitness plans, photography guides, growth hacks), Templates (Lightroom presets, Canva designs, Notion dashboards), Resource packs (stock photos, caption banks, planners).
                  </p>
                  <p className="text-sm mt-4" style={{ color: 'var(--accent)' }}>
                    ✅ Action Step: Start by solving one problem for your audience and turn it into a $9–$49 product. It's simple, affordable, and easy to scale.
                  </p>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>2. 🔒 Subscription Models</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'var(--accent-muted)' }}>
                  <Lock className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                    Recurring revenue = financial stability. Subscriptions allow fans to pay monthly for exclusive access.
                  </p>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    🔥 Platforms: Patreon, Fanhouse, Substack, Memberstack, or even private Discord servers.
                  </p>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    💡 Offerings: Early access to content, Bonus behind-the-scenes clips, VIP communities with Q&As, Discounts on merch or products
                  </p>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Why it works: Predictable cash flow. Even 500 subscribers paying $5/month = $2,500/month stable income.
                  </p>
                  <p className="text-sm mt-4" style={{ color: 'var(--accent)' }}>
                    ✅ Action Step: Launch a low-cost subscription tier to test demand, then add higher-priced VIP tiers later.
                  </p>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>3. 🎓 Course Development</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'var(--accent-muted)' }}>
                  <GraduationCap className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                    Courses are high-ticket revenue streams that let you monetize your expertise in a structured way.
                  </p>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    💡 Examples: A 6-week fitness challenge with video tutorials, A "Monetize Your Instagram" growth course, A design masterclass for beginners.
                  </p>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Why it works: You get higher upfront payments ($99–$499 or more), Courses establish you as an authority in your niche, Students = highly loyal fans who often buy more later.
                  </p>
                  <p className="text-sm mt-4" style={{ color: 'var(--accent)' }}>
                    ✅ Action Step: Don't start with a huge course. Instead, create a mini-course (2–3 hours) and price it affordably. Expand once you validate demand.
                  </p>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>4. 👕 Merchandise Strategies</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'var(--accent-muted)' }}>
                  <Shirt className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                    Merch is more than T-shirts — it's brand identity made physical. It lets fans feel like part of your tribe.
                  </p>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    💡 Options: Branded clothing (hoodies, shirts, hats), Lifestyle products (mugs, notebooks, tote bags), Limited drops (scarcity creates hype and urgency).
                  </p>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Why it works: Merch is both revenue + marketing. Every hoodie worn is a walking billboard for your brand.
                  </p>
                  <p className="text-sm mt-4" style={{ color: 'var(--accent)' }}>
                    ✅ Action Step: Use print-on-demand platforms (Printful, Teespring, Merch by Amazon) to avoid inventory risks. Start with 1–2 items tied to a catchphrase, logo, or inside joke your audience already loves.
                  </p>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>5. 💤 Passive Income Systems</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'var(--accent-muted)' }}>
                  <Zap className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                    This is the holy grail of creator income — money flowing in while you sleep.
                  </p>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    💡 Examples: Affiliate Marketing → promote products & earn commissions (Amazon, Impact, ShareASale), Ad Revenue → from YouTube, blogs, or podcasts, Automated Sales Funnels → email sequences that sell digital products on autopilot.
                  </p>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Why it works: Passive systems free up time so you can focus on content creation — your highest ROI activity.
                  </p>
                  <p className="text-sm mt-4" style={{ color: 'var(--accent)' }}>
                    ✅ Action Step: Start with affiliate links for products you already use. Once you see results, build an email funnel that sells your digital product or course automatically.
                  </p>
                </div>
              </div>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>🔑 Final Thoughts</h2>
              <p className="mb-8 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                The days of surviving on just brand deals are over. The most successful creators in 2025 are building 5+ income streams that complement each other.
              </p>
              <p className="mb-8 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                👉 Start small: pick one stream (digital products or subscriptions), validate it, then expand.
              </p>
              <p className="mb-8 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Within a year, you could have a stack of reliable revenue sources generating both active and passive income.
              </p>
              <p className="mb-8 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Remember: content attracts the audience, but diversified monetization builds the business.
              </p>

              <h2 className="mb-6 mt-12" style={{ color: 'var(--text-primary)' }}>❓FAQ: Creator Revenue Streams</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Q1: What's the easiest revenue stream to start?</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Digital products or affiliate marketing — low cost, fast to launch, beginner-friendly.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Q2: How many income streams should a creator have?</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Aim for at least 3–5 to stay stable, but don't overwhelm yourself by starting them all at once.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Q3: Which revenue stream is best for long-term growth?</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Subscriptions and courses. Subscriptions = recurring cash flow. Courses = high-ticket, authority-building products.</p>
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
              <Link href="/blog/creator-delegation-growth" className="card hover-lift group block">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 group-hover:text-[var(--accent)] transition-colors">
                      Why Doing It All Yourself as a Creator Won't Work
                    </h3>
                    <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Trying to do everything yourself is the fastest way to burn out and limit your growth.
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
