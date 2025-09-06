'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Search,
  Tag
} from 'lucide-react'

export default function Blog() {
  const blogPosts = [
    {
      id: 'monetize-instagram-2025',
      title: 'Top 5 Ways Influencers Can Monetize Instagram in 2025',
      excerpt: 'Discover the latest and most effective strategies for turning your Instagram following into a sustainable income stream in 2025.',
      content: 'The landscape of Instagram monetization continues to evolve rapidly. In 2025, successful influencers are leveraging new features, platforms, and strategies to maximize their earning potential...',
      author: 'Sarah Chen',
      date: '2024-01-15',
      readTime: '8 min read',
      category: 'Monetization',
      tags: ['Instagram', 'Monetization', 'Influencer Marketing', '2025 Trends'],
      featured: true,
      image: '/blog-1.jpg'
    },
    {
      id: 'engagement-vs-followers',
      title: 'Why Engagement Rate Matters More Than Follower Count',
      excerpt: 'Learn why brands are prioritizing engagement over follower count and how to optimize your engagement rate for better partnerships.',
      content: 'In the world of influencer marketing, a common misconception persists: more followers equals more success. However, savvy brands and marketers have shifted their focus...',
      author: 'Marcus Rodriguez',
      date: '2024-01-12',
      readTime: '6 min read',
      category: 'Strategy',
      tags: ['Engagement', 'Analytics', 'Brand Partnerships'],
      featured: false,
      image: '/blog-2.jpg'
    },
    {
      id: 'theme-page-strategies',
      title: 'Theme Page Strategies: How to Scale Beyond Ads',
      excerpt: 'Transform your theme page from a simple ad-revenue model to a diversified business with multiple income streams.',
      content: 'Theme pages have become incredibly popular on Instagram, but many creators struggle to monetize beyond basic sponsored posts. The key to scaling...',
      author: 'Alex Johnson',
      date: '2024-01-10',
      readTime: '10 min read',
      category: 'Business Growth',
      tags: ['Theme Pages', 'Scaling', 'Revenue Diversification'],
      featured: false,
      image: '/blog-3.jpg'
    },
    {
      id: 'passion-to-income',
      title: 'How to Turn Your Passion Page Into a Full-Time Income',
      excerpt: 'A step-by-step guide to transforming your hobby Instagram account into a sustainable business that supports your lifestyle.',
      content: 'Many successful influencers started with a simple passion project. The journey from hobby to full-time income requires strategic planning...',
      author: 'Sarah Chen',
      date: '2024-01-08',
      readTime: '12 min read',
      category: 'Business Development',
      tags: ['Passion Projects', 'Full-time Income', 'Business Planning'],
      featured: false,
      image: '/blog-4.jpg'
    },
    {
      id: 'content-optimization-guide',
      title: 'The Complete Guide to Content Optimization for Maximum Reach',
      excerpt: 'Master the art and science of content optimization to dramatically increase your reach, engagement, and growth on Instagram.',
      content: 'Content optimization is both an art and a science. It requires understanding your audience, platform algorithms, and current trends...',
      author: 'Marcus Rodriguez',
      date: '2024-01-05',
      readTime: '15 min read',
      category: 'Content Strategy',
      tags: ['Content Optimization', 'Algorithm', 'Reach'],
      featured: false,
      image: '/blog-5.jpg'
    },
    {
      id: 'brand-partnership-secrets',
      title: 'Brand Partnership Secrets: How to Land High-Paying Collaborations',
      excerpt: 'Insider tips and strategies for securing lucrative brand partnerships and building long-term relationships with top companies.',
      content: 'Securing high-paying brand partnerships is often the holy grail for influencers. However, the process involves much more than just having a large following...',
      author: 'Alex Johnson',
      date: '2024-01-03',
      readTime: '9 min read',
      category: 'Partnerships',
      tags: ['Brand Partnerships', 'Collaborations', 'Negotiation'],
      featured: false,
      image: '/blog-6.jpg'
    }
  ]

  const categories = [
    'All Posts',
    'Monetization',
    'Strategy',
    'Business Growth',
    'Content Strategy',
    'Partnerships'
  ]

  const featuredPost = blogPosts.find(post => post.featured)
  const regularPosts = blogPosts.filter(post => !post.featured)

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6">
              Insights & Strategies for <span className="gradient-text">Influencers</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/80 leading-relaxed">
              Stay ahead of the curve with expert insights, proven strategies, and actionable tips 
              to grow your influence and income.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-12 bg-dark-800/30">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-primary-400 transition-colors duration-200"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  className="px-4 py-2 bg-white/5 hover:bg-primary-500/20 border border-white/10 hover:border-primary-400 rounded-lg text-white/80 hover:text-white transition-all duration-200"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="section-padding">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-2xl font-display font-bold mb-8 text-center">
                <span className="gradient-text">Featured Article</span>
              </h2>
              
              <div className="glass-effect rounded-2xl overflow-hidden hover-glow">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  {/* Image */}
                  <div className="aspect-video lg:aspect-square bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center">
                    <BarChart3 className="w-24 h-24 text-primary-400" />
                  </div>
                  
                  {/* Content */}
                  <div className="p-8 lg:p-12">
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="bg-primary-500/20 text-primary-300 text-sm px-3 py-1 rounded-full">
                        {featuredPost.category}
                      </span>
                      <div className="flex items-center text-white/60 text-sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(featuredPost.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-white/60 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {featuredPost.readTime}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl lg:text-3xl font-display font-bold mb-4 leading-tight">
                      {featuredPost.title}
                    </h3>
                    
                    <p className="text-white/80 mb-6 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-white/60 text-sm">
                        By {featuredPost.author}
                      </div>
                      <Link 
                        href={`/blog/${featuredPost.id}`}
                        className="inline-flex items-center text-primary-400 hover:text-primary-300 font-medium"
                      >
                        Read More
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="section-padding bg-dark-800/30">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl font-display font-bold text-center mb-4">
              Latest <span className="gradient-text">Articles</span>
            </h2>
            <p className="text-white/70 text-center max-w-2xl mx-auto">
              Expert insights and actionable strategies to help you grow your influence and income
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-effect rounded-2xl overflow-hidden hover-glow group"
              >
                {/* Image */}
                <div className="aspect-video bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center">
                  {post.category === 'Monetization' && <DollarSign className="w-12 h-12 text-primary-400" />}
                  {post.category === 'Strategy' && <TrendingUp className="w-12 h-12 text-primary-400" />}
                  {post.category === 'Business Growth' && <BarChart3 className="w-12 h-12 text-primary-400" />}
                  {post.category === 'Content Strategy' && <Users className="w-12 h-12 text-primary-400" />}
                  {post.category === 'Partnerships' && <Users className="w-12 h-12 text-primary-400" />}
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-3">
                    <span className="bg-primary-500/20 text-primary-300 text-xs px-2 py-1 rounded-full">
                      {post.category}
                    </span>
                    <div className="flex items-center text-white/60 text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3 leading-tight group-hover:text-primary-400 transition-colors duration-200">
                    {post.title}
                  </h3>
                  
                  <p className="text-white/70 text-sm mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-white/60 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {post.readTime}
                    </div>
                    <Link 
                      href={`/blog/${post.id}`}
                      className="inline-flex items-center text-primary-400 hover:text-primary-300 text-sm font-medium group-hover:translate-x-1 transition-transform duration-200"
                    >
                      Read More
                      <ArrowRight className="ml-1 w-3 h-3" />
                    </Link>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-4">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs text-white/50 bg-white/5 px-2 py-1 rounded">
                        #{tag.replace(/\s+/g, '').toLowerCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6">
              Ready to Apply These <span className="gradient-text">Strategies</span>?
            </h2>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Reading about success is just the first step. Let us help you implement these strategies 
              and achieve real results for your brand.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/contact" className="btn-primary text-lg px-8 py-4">
                Get Expert Help Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/services" className="btn-secondary text-lg px-8 py-4">
                Explore Our Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
