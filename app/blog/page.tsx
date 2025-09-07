'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, User, DollarSign, Target, Search, Brain, AlertTriangle, TrendingUp } from 'lucide-react'

export default function Blog() {
  const blogPosts = [
    {
      id: 1,
      title: "Why Hardworking Filipinos Often Get Overworked 😓",
      excerpt: "Filipinos are known worldwide for being hardworking and committed. But instead of being rewarded, high performers usually get piled with even more work.",
      date: "January 15, 2025",
      readTime: "4 min read",
      category: "Filipino Workers",
      slug: "monetization-strategies-2025",
      icon: AlertTriangle,
      iconColor: "linear-gradient(135deg, #f97316, #ea580c)"
    },
    {
      id: 2,
      title: "The Hidden Scams That Target Hardworking Filipinos 🚨",
      excerpt: "Ambitious Filipinos chase opportunities online every day. But scammers know this — and they exploit it. Learn how to stay safe.",
      date: "January 12, 2025",
      readTime: "3 min read",
      category: "Scam Prevention",
      slug: "match-content-audience",
      icon: Target,
      iconColor: "linear-gradient(135deg, #ef4444, #dc2626)"
    },
    {
      id: 3,
      title: "No Days Off? The Dark Side of Outsourcing in the Philippines 😵‍💫",
      excerpt: "Many Filipinos enter remote work dreaming of freedom. But instead, they face constant pressure to stay online every day — even weekends.",
      date: "January 10, 2025",
      readTime: "3 min read",
      category: "Work-Life Balance",
      slug: "hidden-niches-crowded-market",
      icon: Search,
      iconColor: "linear-gradient(135deg, #6366f1, #4f46e5)"
    },
    {
      id: 4,
      title: "Why High Performers Quit: The Balance Problem in the Philippines 😤",
      excerpt: "High-performing Filipinos often quit not because they lack drive — but because companies mistake dedication for endless availability.",
      date: "January 8, 2025",
      readTime: "3 min read",
      category: "Career Growth",
      slug: "short-attention-spans-marketing",
      icon: Brain,
      iconColor: "linear-gradient(135deg, #8b5cf6, #7c3aed)"
    },
    {
      id: 5,
      title: "No Structure, No Success: Why Filipinos Deserve Better 📉",
      excerpt: "When companies don't set proper structure, Filipino workers end up confused, frustrated, and underperforming — even when they give their all.",
      date: "January 7, 2025",
      readTime: "3 min read",
      category: "Workplace Structure",
      slug: "revenue-streams-diversify-income",
      icon: TrendingUp,
      iconColor: "linear-gradient(135deg, #3b82f6, #1d4ed8)"
    },
    {
      id: 6,
      title: "How to Work Hard Without Burning Out in Remote Jobs 🌱",
      excerpt: "Filipinos love to prove themselves. But too often, ambition turns into burnout because employers push workers past their limits.",
      date: "January 5, 2025",
      readTime: "4 min read",
      category: "Mental Health",
      slug: "creator-delegation-growth",
      icon: DollarSign,
      iconColor: "linear-gradient(135deg, #10b981, #059669)"
    }
  ]

  const categories = ["All", "Filipino Workers", "Scam Prevention", "Work-Life Balance", "Career Growth", "Mental Health"]

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Hero Section */}
      <section className="section pt-32 md:pt-40">
        <div className="container">
          <motion.div
            className="max-w-4xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="mb-6">
              Career Insights for 
              <span className="text-gradient block mt-2">Hardworking Filipinos</span>
            </h1>
            <p 
              className="text-xl max-w-2xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              Real stories, practical advice, and insights to help Filipino workers find better opportunities and avoid common pitfalls.
            </p>
          </motion.div>

        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="section" style={{ background: 'var(--bg-soft)' }}>
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                className="card hover-lift group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/blog/${post.slug}`}>
                  {/* Post Header with Icon */}
                  <div className="relative overflow-hidden rounded-lg mb-6 flex items-center justify-center h-48" style={{ background: post.iconColor }}>
                    <post.icon className="w-16 h-16 text-white" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span 
                        className="px-3 py-1 text-xs font-medium rounded-full"
                        style={{ 
                          background: 'rgba(255,255,255,0.2)', 
                          color: 'white',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="space-y-4">
                    <h3 className="group-hover:text-[var(--accent)] transition-colors duration-300">
                      {post.title}
                    </h3>
                    
                    <p style={{ color: 'var(--text-secondary)' }}>
                      {post.excerpt}
                    </p>

                    {/* Meta Information */}
                    <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {post.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </div>
                      </div>
                    </div>

                    {/* Read More */}
                    <div className="flex items-center gap-2 text-[var(--accent)] font-medium group-hover:gap-3 transition-all duration-300">
                      Read More
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

        </div>
      </section>

      {/* Contact CTA */}
      <section className="section">
        <div className="container">
          <motion.div
            className="card text-center max-w-2xl mx-auto"
            style={{ background: 'linear-gradient(135deg, var(--accent-muted), var(--accent))' }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-white">Ready to Find Better Opportunities?</h2>
            <p className="mb-6 text-white/90">
              Join our Discord community and connect with verified employers who value Filipino talent.
            </p>
            <a 
              href="https://discord.gg/luxlife" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary bg-white text-[var(--accent)] hover:bg-white/90"
            >
              Join Our Discord Community
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
