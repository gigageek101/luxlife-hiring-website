'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, User } from 'lucide-react'

export default function Blog() {
  const blogPosts = [
    {
      id: 1,
      title: "Top 5 Ways Influencers Can Monetize Instagram in 2025",
      excerpt: "Discover the most effective strategies to turn your Instagram following into sustainable income streams. From brand partnerships to digital products.",
      author: "Sarah Martinez",
      date: "January 15, 2025",
      readTime: "8 min read",
      category: "Monetization",
      image: "/api/placeholder/600/400",
      slug: "monetize-instagram-2025"
    },
    {
      id: 2,
      title: "Why Engagement Rate Matters More Than Follower Count",
      excerpt: "Learn why brands are shifting focus from vanity metrics to meaningful engagement and how to optimize your content for better interaction rates.",
      author: "Mike Johnson",
      date: "January 12, 2025",
      readTime: "6 min read",
      category: "Strategy",
      image: "/api/placeholder/600/400",
      slug: "engagement-vs-followers"
    },
    {
      id: 3,
      title: "Theme Page Strategies: How to Scale Beyond Ads",
      excerpt: "Transform your theme page from ad-dependent to a diversified business with multiple revenue streams and sustainable growth tactics.",
      author: "Emma Davis",
      date: "January 10, 2025",
      readTime: "10 min read",
      category: "Growth",
      image: "/api/placeholder/600/400",
      slug: "theme-page-scaling"
    },
    {
      id: 4,
      title: "How to Turn Your Passion Page Into a Full-Time Income",
      excerpt: "Step-by-step guide to monetizing your niche content and building a sustainable business around your passion and expertise.",
      author: "Alex Chen",
      date: "January 8, 2025",
      readTime: "12 min read",
      category: "Business",
      image: "/api/placeholder/600/400",
      slug: "passion-to-income"
    },
    {
      id: 5,
      title: "The Psychology of Viral Content: What Makes Posts Shareable",
      excerpt: "Understand the psychological triggers that make content go viral and how to apply these principles to boost your reach and engagement.",
      author: "Dr. Lisa Park",
      date: "January 5, 2025",
      readTime: "7 min read",
      category: "Content",
      image: "/api/placeholder/600/400",
      slug: "viral-content-psychology"
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
                          <User className="w-4 h-4" />
                          {post.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {post.date}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                        <Clock className="w-4 h-4" />
                        {post.readTime}
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

      {/* Newsletter CTA */}
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
            <h2 className="mb-4 text-white">Stay Updated</h2>
            <p className="mb-6 text-white/90">
              Get the latest insights and strategies delivered to your inbox weekly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white/50"
                style={{ background: 'rgba(255,255,255,0.9)' }}
              />
              <button className="btn-primary bg-white text-[var(--accent)] hover:bg-white/90">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
