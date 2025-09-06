'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, User, ArrowLeft, Share2, Heart, TrendingUp, Users, Target } from 'lucide-react'

export default function PassionToIncome() {
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
                Business
              </span>

              <h1 className="mb-6">
                How to Turn Your Passion Page Into a 
                <span className="text-gradient block mt-2">Full-Time Income</span>
              </h1>

              <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <User className="w-5 h-5" />
                  <span>Alex Chen</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Calendar className="w-5 h-5" />
                  <span>January 8, 2025</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Clock className="w-5 h-5" />
                  <span>12 min read</span>
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
                You started your page because you love what you do. Whether it's photography, cooking, fitness, or any other passion, you've built an audience that shares your interests. Now it's time to turn that passion into sustainable income without losing the authenticity that got you here.
              </p>

              <h2 style={{ color: 'var(--text-primary)' }}>The Passion-to-Profit Mindset Shift</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Many creators feel guilty about monetizing their passion, thinking it will somehow "sell out" their authentic voice. The truth is, monetization allows you to invest more time and resources into creating better content for your audience. When done right, it's a win-win situation.
              </p>

              <div className="card my-8 p-6" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                <h3 style={{ color: 'var(--accent)' }}>🎯 Reframe Your Thinking</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Instead of "I'm selling to my audience," think "I'm providing valuable solutions to people who trust my expertise." Your audience follows you because they want to learn from you—help them succeed.
                </p>
              </div>

              <h2 style={{ color: 'var(--text-primary)' }}>Phase 1: Validate Your Market (Months 1-2)</h2>
              
              <h3 style={{ color: 'var(--text-primary)' }}>Understand Your Audience's Pain Points</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Use Instagram Stories polls, Q&As, and direct messages to understand what your followers struggle with. What questions do they ask repeatedly? What challenges do they face in your niche? This research becomes the foundation for your products and services.
              </p>

              <h3 style={{ color: 'var(--text-primary)' }}>Test with Free Value First</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Before creating paid products, offer free resources that solve smaller versions of your audience's problems. This builds trust and gives you feedback on what resonates most with your community.
              </p>

              <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="card p-6">
                  <Heart className="w-12 h-12 mb-4" style={{ color: 'var(--accent)' }} />
                  <h3 style={{ color: 'var(--text-primary)' }}>Passion-First Approach</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Create content you love and find ways to monetize it authentically</p>
                </div>
                <div className="card p-6">
                  <Target className="w-12 h-12 mb-4" style={{ color: 'var(--accent)' }} />
                  <h3 style={{ color: 'var(--text-primary)' }}>Problem-Solution Fit</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Identify specific problems you can solve better than anyone else</p>
                </div>
              </div>

              <h2 style={{ color: 'var(--text-primary)' }}>Phase 2: Create Your First Revenue Stream (Months 3-4)</h2>
              
              <h3 style={{ color: 'var(--text-primary)' }}>Start with What You Know Best</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Your first product should be something you could create in your sleep. If you're a fitness enthusiast, start with a beginner workout guide. If you're into photography, offer editing presets or a mini-course on composition.
              </p>

              <h3 style={{ color: 'var(--text-primary)' }}>Low-Risk Product Ideas:</h3>
              <ul style={{ color: 'var(--text-secondary)' }}>
                <li><strong>Digital Downloads:</strong> Templates, presets, checklists, guides</li>
                <li><strong>Mini-Courses:</strong> 3-5 video lessons on a specific topic</li>
                <li><strong>One-on-One Consultations:</strong> Leverage your expertise directly</li>
                <li><strong>Affiliate Partnerships:</strong> Promote tools you already use and love</li>
              </ul>

              <h2 style={{ color: 'var(--text-primary)' }}>Phase 3: Scale and Diversify (Months 5-8)</h2>
              
              <p style={{ color: 'var(--text-secondary)' }}>
                Once you've validated that people will pay for your expertise, it's time to scale. Create systems that allow you to help more people without trading time for money directly.
              </p>

              <h3 style={{ color: 'var(--text-primary)' }}>Scaling Strategies:</h3>
              <ul style={{ color: 'var(--text-secondary)' }}>
                <li><strong>Group Coaching:</strong> Help multiple people simultaneously</li>
                <li><strong>Comprehensive Courses:</strong> Create once, sell repeatedly</li>
                <li><strong>Membership Communities:</strong> Recurring revenue from ongoing value</li>
                <li><strong>Done-for-You Services:</strong> Higher-ticket offerings for premium clients</li>
              </ul>

              <div className="card my-8 p-6" style={{ background: 'linear-gradient(135deg, var(--accent-muted), var(--accent))', color: 'white' }}>
                <h3>Ready to Monetize Your Passion?</h3>
                <p className="mb-4 text-white/90">
                  We've helped hundreds of passion-driven creators build sustainable businesses. Get a personalized roadmap for turning your expertise into income.
                </p>
                <Link href="/contact" className="btn-primary bg-white text-[var(--accent)] hover:bg-white/90">
                  Get Your Monetization Strategy
                </Link>
              </div>

              <h2 style={{ color: 'var(--text-primary)' }}>Phase 4: Build a Sustainable Business (Months 9-12)</h2>
              
              <p style={{ color: 'var(--text-secondary)' }}>
                The final phase is about creating systems and processes that allow your business to run without your constant involvement. This includes automating sales processes, creating evergreen content, and potentially hiring team members.
              </p>

              <h3 style={{ color: 'var(--text-primary)' }}>Key Milestones to Track:</h3>
              <ul style={{ color: 'var(--text-secondary)' }}>
                <li>Monthly recurring revenue of $3,000+ (enough to replace part-time income)</li>
                <li>Email list of 1,000+ engaged subscribers</li>
                <li>3+ different revenue streams to reduce risk</li>
                <li>Automated sales funnels that convert while you sleep</li>
              </ul>

              <h2 style={{ color: 'var(--text-primary)' }}>Maintaining Authenticity While Scaling</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                As you grow, remember why you started. Continue creating content you're passionate about, stay connected with your community, and only promote products and services you genuinely believe in. Your authenticity is your competitive advantage—don't sacrifice it for short-term gains.
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
                  AC
                </div>
                <div>
                  <h3 style={{ color: 'var(--text-primary)' }}>Alex Chen</h3>
                  <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                    Former corporate executive turned passion economy expert. Helps creators build sustainable businesses around their interests and expertise.
                  </p>
                  <Link href="/contact" className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
                    Learn from Alex →
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
