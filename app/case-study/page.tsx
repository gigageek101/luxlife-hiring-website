'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Clock, AlertTriangle, Target, Calendar, MessageCircle, Users, CheckCircle, Heart, ArrowRight, ExternalLink, BarChart3 } from 'lucide-react'

export default function CaseStudyNik() {
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
                <TrendingUp className="w-12 h-12 text-white" />
              </div>

              {/* Category */}
              <span 
                className="inline-block px-4 py-2 text-sm font-medium rounded-full mb-6"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Success Story
              </span>

              <h1 className="mb-8">💡 How Nik Turned Struggles Into a Career Path 🚀</h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="prose prose-lg max-w-none"
              style={{ 
                color: 'var(--text-primary)',
                lineHeight: '1.8'
              } as React.CSSProperties}
            >
              {/* The Problem */}
              <div className="mb-12">
                <h2 className="mb-6" style={{ color: 'var(--text-primary)' }}>😓 From Chaos to Clarity</h2>
                
                <p className="text-lg mb-6" style={{ color: 'var(--text-secondary-on-white)' }}>
                  Nik was like many ambitious Filipinos — hardworking, eager to learn, and hungry to succeed. He started his remote journey full of energy, ready to give his best.
                </p>

                <p className="mb-6" style={{ color: 'var(--text-secondary-on-white)' }}>
                  But instead of growth, he found frustration:
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="card p-6 text-center" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                    <Clock className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                    <h3 className="mb-2" style={{ color: 'var(--text-primary)' }}>🕒 Unpaid Overtime</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary-on-white)' }}>
                      Employers kept pushing "just one more task"
                    </p>
                  </div>

                  <div className="card p-6 text-center" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                    <AlertTriangle className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                    <h3 className="mb-2" style={{ color: 'var(--text-primary)' }}>❌ No Structure</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary-on-white)' }}>
                      Every day brought random assignments with no direction
                    </p>
                  </div>

                  <div className="card p-6 text-center" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                    <Target className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                    <h3 className="mb-2" style={{ color: 'var(--text-primary)' }}>💸 Scams</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary-on-white)' }}>
                      He once paid for a "training program" that turned out fake
                    </p>
                  </div>
                </div>

                <div className="card p-6 mb-8" style={{ background: 'var(--accent-muted)', border: '1px solid var(--accent)' }}>
                  <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                    The harder Nik worked, the more drained he felt. He was motivated, but the system was against him.
                  </p>
                </div>
              </div>

              {/* The Solution */}
              <div className="mb-12">
                <h2 className="mb-6" style={{ color: 'var(--text-primary)' }}>🔑 The Turning Point</h2>
                
                <p className="text-lg mb-6" style={{ color: 'var(--text-secondary-on-white)' }}>
                  Nik realized he didn't just need work — he needed a path. That's when he joined the HiringPhilippines.Careers Discord community.
                </p>

                <p className="mb-4" style={{ color: 'var(--text-secondary-on-white)' }}>Inside, things were different:</p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4 p-4 rounded-lg" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                    <div className="text-2xl">🔐</div>
                    <div>
                      <p style={{ color: 'var(--text-secondary-on-white)' }}>
                        Every opportunity was verified by the LuxLife Association
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-lg" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                    <div className="text-2xl">🛡️</div>
                    <div>
                      <p style={{ color: 'var(--text-secondary-on-white)' }}>
                        Jobs came with clear contracts, structured schedules, and defined roles
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-lg" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                    <div className="text-2xl">💬</div>
                    <div>
                      <p style={{ color: 'var(--text-secondary-on-white)' }}>
                        He connected with others who faced the same struggles — and found mentors willing to guide him
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* The Results */}
              <div className="mb-12">
                <h2 className="mb-6" style={{ color: 'var(--text-primary)' }}>📈 The Transformation</h2>
                
                <p className="text-lg mb-6" style={{ color: 'var(--text-secondary-on-white)' }}>
                  Through the community, Nik landed a structured role in a growing industry: digital marketing analytics.
                </p>

                <div className="card p-6 mb-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <p className="mb-4" style={{ color: 'var(--text-secondary-on-white)' }}>
                    At first, he started small — assisting with campaign reports. But because the job had clear KPIs, proper training, and weekends off, he thrived. Over time, he learned a unique skill: data interpretation for online advertising.
                  </p>
                  <p style={{ color: 'var(--text-secondary-on-white)' }}>
                    That skill set him apart. Today, Nik works in a well-paid niche industry where demand is only growing. His future isn't just about having a job — it's about building a career with security, balance, and opportunity.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <BarChart3 className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                    <div className="text-2xl font-bold mb-2" style={{ color: 'var(--accent)' }}>3x</div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary-on-white)' }}>Income increase within 6 months</p>
                  </div>
                  <div className="text-center p-6 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <Calendar className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                    <div className="text-2xl font-bold mb-2" style={{ color: 'var(--accent)' }}>5</div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary-on-white)' }}>Day work week with real weekends</p>
                  </div>
                  <div className="text-center p-6 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <CheckCircle className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--accent)' }} />
                    <div className="text-2xl font-bold mb-2" style={{ color: 'var(--accent)' }}>100%</div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary-on-white)' }}>Job security with growth path</p>
                  </div>
                </div>
              </div>

              {/* Testimonial */}
              <div className="mb-12">
                <h2 className="mb-6" style={{ color: 'var(--text-primary)' }}>🌟 Nik's Words</h2>
                
                <div className="card p-8" style={{ background: 'linear-gradient(135deg, var(--surface), var(--bg-soft))', border: '1px solid var(--border)' }}>
                  <MessageCircle className="w-12 h-12 mb-6" style={{ color: 'var(--accent)' }} />
                  <blockquote className="text-xl italic mb-6" style={{ color: 'var(--text-primary)' }}>
                    "Before, I thought working hard just meant taking on more and more tasks. Now, I understand that structure, skills, and the right environment matter even more. Joining the Discord changed everything for me — I stopped wasting energy and started building my future."
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
                      <span className="text-white font-bold">N</span>
                    </div>
                    <div>
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Nik</div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary-on-white)' }}>Digital Marketing Analyst</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* The Lesson */}
              <div className="mb-12">
                <h2 className="mb-6" style={{ color: 'var(--text-primary)' }}>🎯 The Lesson for Every Hardworking Filipino</h2>
                
                <p className="text-lg mb-8" style={{ color: 'var(--text-secondary-on-white)' }}>
                  Nik's story proves one thing: ambition needs the right platform. Hard work alone isn't enough — you need structure, verified opportunities, and a community that supports your growth.
                </p>

                <div className="card p-8 text-center" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', color: 'white' }}>
                  <h3 className="mb-4 text-white">Ready to Follow Nik's Path?</h3>
                  <p className="mb-6 text-white/90">
                    Join our free Discord today and take the first step, just like Nik did. Because your effort deserves to create not just income — but a future.
                  </p>
                  <a 
                    href="https://myallsocials.com/luxlife" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-[var(--accent)] px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors"
                  >
                    👉 Join Our Discord Now
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Key Takeaways */}
              <div className="mb-12">
                <h2 className="mb-6" style={{ color: 'var(--text-primary)' }}>🔑 Key Takeaways</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="card p-6" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                    <CheckCircle className="w-8 h-8 mb-4" style={{ color: 'var(--accent)' }} />
                    <h3 className="mb-3" style={{ color: 'var(--text-primary)' }}>Structure Matters</h3>
                    <p style={{ color: 'var(--text-secondary-on-white)' }}>
                      Clear roles, defined schedules, and proper training make all the difference in career growth.
                    </p>
                  </div>

                  <div className="card p-6" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                    <Users className="w-8 h-8 mb-4" style={{ color: 'var(--accent)' }} />
                    <h3 className="mb-3" style={{ color: 'var(--text-primary)' }}>Community Support</h3>
                    <p style={{ color: 'var(--text-secondary-on-white)' }}>
                      Having mentors and peers who understand your struggles accelerates success.
                    </p>
                  </div>

                  <div className="card p-6" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                    <Target className="w-8 h-8 mb-4" style={{ color: 'var(--accent)' }} />
                    <h3 className="mb-3" style={{ color: 'var(--text-primary)' }}>Verified Opportunities</h3>
                    <p style={{ color: 'var(--text-secondary-on-white)' }}>
                      Working with trusted employers eliminates scams and builds real career foundations.
                    </p>
                  </div>

                  <div className="card p-6" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                    <Heart className="w-8 h-8 mb-4" style={{ color: 'var(--accent)' }} />
                    <h3 className="mb-3" style={{ color: 'var(--text-primary)' }}>Work-Life Balance</h3>
                    <p style={{ color: 'var(--text-secondary-on-white)' }}>
                      Sustainable success comes from jobs that respect your time and well-being.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              className="mt-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-center">
                <h2 className="mb-4" style={{ color: 'var(--text-primary)' }}>Start Your Own Success Story</h2>
                <p className="text-xl mb-8" style={{ color: 'var(--text-secondary-on-white)' }}>
                  Join thousands of Filipinos who've found their path to career success.
                </p>
                <Link href="/" className="btn-primary btn-shine hover-lift">
                  Explore More Success Stories
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}