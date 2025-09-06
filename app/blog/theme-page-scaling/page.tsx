'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, User, ArrowLeft, Share2, BookOpen, Target, DollarSign, Zap } from 'lucide-react'

export default function ThemePageScaling() {
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
              <span 
                className="inline-block px-4 py-2 text-sm font-medium rounded-full mb-6"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Growth
              </span>

              <h1 className="mb-6">
                Theme Page Strategies: How to 
                <span className="text-gradient block mt-2">Scale Beyond Ads</span>
              </h1>

              <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <User className="w-5 h-5" />
                  <span>Emma Davis</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Calendar className="w-5 h-5" />
                  <span>January 10, 2025</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Clock className="w-5 h-5" />
                  <span>10 min read</span>
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
                Theme pages that rely solely on ad revenue are leaving money on the table. The most successful theme page owners diversify their income streams and build sustainable businesses that aren't dependent on fluctuating ad rates.
              </p>

              <h2 style={{ color: 'var(--text-primary)' }}>The Problem with Ad-Only Revenue</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Relying exclusively on ad revenue creates several vulnerabilities: algorithm changes can tank your reach overnight, ad rates fluctuate seasonally, and you have no direct relationship with your audience. Smart theme page owners treat ads as just one piece of a larger revenue puzzle.
              </p>

              <div className="grid md:grid-cols-3 gap-6 my-8">
                <div className="card p-6 text-center">
                  <Target className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                  <h3 style={{ color: 'var(--text-primary)' }}>Affiliate Marketing</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Promote relevant products and earn commissions</p>
                </div>
                <div className="card p-6 text-center">
                  <DollarSign className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                  <h3 style={{ color: 'var(--text-primary)' }}>Digital Products</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Create and sell your own content</p>
                </div>
                <div className="card p-6 text-center">
                  <Zap className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                  <h3 style={{ color: 'var(--text-primary)' }}>Brand Partnerships</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Direct collaborations with companies</p>
                </div>
              </div>

              <h2 style={{ color: 'var(--text-primary)' }}>Strategy 1: Build an Email List</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Your Instagram followers don't belong to you—they belong to Instagram. An email list gives you direct access to your audience regardless of algorithm changes. Offer exclusive content, early access to deals, or free resources in exchange for email addresses.
              </p>

              <div className="card my-8 p-6" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                <h3 style={{ color: 'var(--accent)' }}>💡 Implementation Tip</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Create a simple landing page offering a free resource related to your niche. Use tools like ConvertKit or Mailchimp to manage your list and send regular newsletters.
                </p>
              </div>

              <h2 style={{ color: 'var(--text-primary)' }}>Strategy 2: Develop Your Own Products</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Transform your expertise into sellable products. If you run a fitness theme page, create workout guides. Food pages can sell recipe collections. The key is understanding what your audience struggles with and creating solutions.
              </p>

              <h3 style={{ color: 'var(--text-primary)' }}>Digital Product Ideas by Niche:</h3>
              <ul style={{ color: 'var(--text-secondary)' }}>
                <li><strong>Fitness:</strong> Workout plans, meal prep guides, form check videos</li>
                <li><strong>Business:</strong> Templates, courses, one-on-one coaching</li>
                <li><strong>Lifestyle:</strong> Planners, checklists, habit trackers</li>
                <li><strong>Travel:</strong> Itineraries, packing lists, budget guides</li>
              </ul>

              <h2 style={{ color: 'var(--text-primary)' }}>Strategy 3: Strategic Affiliate Marketing</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Don't just promote random products for quick commissions. Build trust by only recommending products you genuinely use and believe in. Create detailed reviews, tutorials, and comparison content that helps your audience make informed decisions.
              </p>

              <h2 style={{ color: 'var(--text-primary)' }}>Strategy 4: Premium Community Access</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Create exclusive Discord servers, Facebook groups, or subscription-based communities where your most engaged followers can access premium content, direct interaction with you, and networking opportunities with like-minded individuals.
              </p>

              <div className="card my-8 p-6" style={{ background: 'linear-gradient(135deg, var(--accent-muted), var(--accent))', color: 'white' }}>
                <h3>Ready to Scale Your Theme Page?</h3>
                <p className="mb-4 text-white/90">
                  Our team has helped dozens of theme page owners diversify their revenue and build sustainable businesses. Get a custom scaling strategy for your niche.
                </p>
                <Link href="/contact" className="btn-primary bg-white text-[var(--accent)] hover:bg-white/90">
                  Get Your Scaling Plan
                </Link>
              </div>

              <h2 style={{ color: 'var(--text-primary)' }}>The Long-Term Vision</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Think of your theme page as the marketing arm of a larger business. Use it to build brand awareness, drive traffic to your products, and nurture relationships with your audience. The most successful theme page owners eventually become recognized experts in their niches, opening doors to speaking opportunities, book deals, and high-value partnerships.
              </p>
            </motion.article>

            <motion.div
              className="card mt-12 p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center text-white font-bold text-xl">
                  ED
                </div>
                <div>
                  <h3 style={{ color: 'var(--text-primary)' }}>Emma Davis</h3>
                  <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                    Business strategist who has helped 50+ theme page owners scale beyond six figures through diversified revenue streams.
                  </p>
                  <Link href="/contact" className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
                    Work with Emma →
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
