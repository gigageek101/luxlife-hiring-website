'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, User } from 'lucide-react'

export default function Blog() {
  const blogPosts = [
    {
      id: 1,
      title: "7 Proven Monetization Strategies for Creators in 2025",
      excerpt: "The creator economy is growing faster than ever. Discover 7 proven ways to monetize your audience whether you have 1,000 followers or 1M+.",
      date: "January 15, 2025",
      readTime: "3 min read",
      category: "Monetization",
      slug: "monetization-strategies-2025"
    },
    {
      id: 2,
      title: "How to Match Content With Your Actual Audience",
      excerpt: "Creating content your audience actually cares about is the difference between scrolling past and stopping to engage. Here's how to optimize.",
      date: "January 12, 2025",
      readTime: "2 min read",
      category: "Strategy",
      slug: "match-content-audience"
    },
    {
      id: 3,
      title: "Finding Hidden Niches in a Crowded Market",
      excerpt: "The online world feels oversaturated, but there are still thousands of untapped niches waiting to be discovered. Here's how to find them.",
      date: "January 10, 2025",
      readTime: "3 min read",
      category: "Growth",
      slug: "hidden-niches-crowded-market"
    },
    {
      id: 4,
      title: "Why Social Media Marketing Changed: The Era of Short Attention Spans",
      excerpt: "Audiences have an average attention span of 8 seconds or less. Here's why social media marketing has changed forever and how to adapt.",
      date: "January 8, 2025",
      readTime: "2 min read",
      category: "Strategy",
      slug: "short-attention-spans-marketing"
    },
    {
      id: 5,
      title: "Why Doing It All Yourself as a Creator Won't Work",
      excerpt: "Trying to do everything yourself is the fastest way to burn out and limit your growth. Here's why creators who delegate scale faster.",
      date: "January 5, 2025",
      readTime: "3 min read",
      category: "Business",
      slug: "creator-delegation-growth"
    }
  ]

  const categories = ["All", "Monetization", "Strategy", "Growth", "Business", "Content"]

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
              Insights & Strategies for 
              <span className="text-gradient block mt-2">Influencer Success</span>
            </h1>
            <p 
              className="text-xl max-w-2xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              Expert tips, proven strategies, and industry insights to help you grow your influence and monetize your following.
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {categories.map((category, index) => (
              <button
                key={category}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  index === 0 
                    ? 'bg-[var(--accent)] text-white' 
                    : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                {category}
              </button>
            ))}
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
                  {/* Post Image */}
                  <div className="relative overflow-hidden rounded-lg mb-6">
                    <div 
                      className="w-full h-48 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span 
                        className="px-3 py-1 text-xs font-medium rounded-full"
                        style={{ 
                          background: 'var(--accent)', 
                          color: 'white' 
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

          {/* Load More Button */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <button className="btn-secondary hover-lift">
              Load More Articles
            </button>
          </motion.div>
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
            <h2 className="mb-4 text-white">Ready to Grow Your Influence?</h2>
            <p className="mb-6 text-white/90">
              Get personalized strategies to monetize your following and scale your creator business.
            </p>
            <Link href="/contact" className="btn-primary bg-white text-[var(--accent)] hover:bg-white/90">
              Get Your Free Strategy Call
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
