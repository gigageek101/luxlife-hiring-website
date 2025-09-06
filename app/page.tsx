'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  TrendingUp, 
  Target, 
  Users, 
  DollarSign, 
  Star, 
  ArrowRight,
  CheckCircle,
  BarChart3,
  Zap,
  Search,
  Brain,
  AlertTriangle,
  Dumbbell,
  BookOpen,
  Clock
} from 'lucide-react'
import AnimatedCounter from '@/components/AnimatedCounter'
import Reveal from '@/components/Reveal'
import ParallaxText from '@/components/ParallaxText'

export default function Home() {
  const services = [
    {
      icon: DollarSign,
      title: 'Monetization Strategy',
      description: 'Transform your following into multiple revenue streams with proven strategies.',
      features: ['Brand partnerships', 'Product launches', 'Affiliate programs']
    },
    {
      icon: BarChart3,
      title: 'Content Optimization',
      description: 'Boost engagement and reach with data-driven content strategies.',
      features: ['Algorithm optimization', 'Posting schedules', 'Trend analysis']
    },
    {
      icon: Users,
      title: 'Audience Growth',
      description: 'Build a loyal, engaged community that converts.',
      features: ['Organic growth tactics', 'Community building', 'Engagement strategies']
    },
    {
      icon: TrendingUp,
      title: 'Revenue Streams',
      description: 'Diversify income with multiple monetization channels.',
      features: ['Digital products', 'Subscriptions', 'Sponsored content']
    }
  ]

  const testimonials = [
    {
      content: 'POSTE MEDIA helped us grow from 50K to 300K followers in 6 months. Their strategies actually work.',
      name: 'Sarah Johnson',
      role: 'Fashion Influencer',
      rating: 5
    },
    {
      content: 'Finally making consistent income from my Instagram. Game changer for content creators.',
      name: 'Mike Chen',
      role: 'Food Blogger',
      rating: 5
    },
    {
      content: 'The ROI was incredible. Tripled our revenue in the first quarter working with them.',
      name: 'Emma Davis',
      role: 'Lifestyle Creator',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Hero Section with increased top padding */}
      <section className="section pt-32 md:pt-40">
        <div className="container">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <motion.h1 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              Helping Influencers & <span className="text-gradient">Theme Pages</span>
              <br />Monetize Their Following
            </motion.h1>
            
            <motion.p 
              className="text-xl mb-8" 
              style={{ color: 'var(--text-secondary)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Custom strategies, proven marketing methods, real growth.
              <br />Turn your social media presence into a thriving business.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link href="/contact" className="btn-primary btn-shine hover-lift">
                Book a Free Consultation
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/services" className="btn-secondary hover-lift">
                Explore Services
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section" style={{ background: 'var(--bg-soft)' }}>
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { number: 1.4, suffix: 'M+', label: 'Followers Gained' },
              { number: 52, prefix: '+', suffix: '%', label: 'Conversion Rates Up' },
              { number: 72, prefix: '+', suffix: '%', label: 'Engagement Rates' },
              { number: 98, suffix: '%', label: 'Client Retention' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                viewport={{ once: true }}
                className="stat-card hover-lift hover-glow"
              >
                <div className="stat-number">
                  <AnimatedCounter 
                    value={stat.number} 
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    duration={2}
                  />
                </div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section">
        <div className="container">
          <ParallaxText offset={30}>
            <div className="text-center mb-16">
              <motion.h2 
                className="mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                Our Services
              </motion.h2>
              <motion.p 
                className="text-xl" 
                style={{ color: 'var(--text-secondary)' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Everything you need to monetize your social media presence
              </motion.p>
            </div>
          </ParallaxText>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                viewport={{ once: true }}
                className="card hover-lift glass-card"
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="p-4 rounded-xl flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}
                  >
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2">{service.title}</h3>
                    <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                      {service.description}
                    </p>
                    <ul className="space-y-2">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                          <CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <Reveal delay={0.3}>
            <div className="text-center mt-12">
              <Link href="/services" className="btn-primary">
                Explore All Services
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section" style={{ background: 'var(--bg-soft)' }}>
        <div className="container">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="mb-4">Client Success Stories</h2>
              <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
                Real results from real creators
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="testimonial"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-5 h-5" 
                      style={{ 
                        color: 'var(--star)',
                        fill: i < testimonial.rating ? 'var(--star)' : 'transparent'
                      }} 
                    />
                  ))}
                </div>
                
                <p className="mb-6" style={{ color: 'var(--text-primary)' }}>
                  "{testimonial.content}"
                </p>

                <div>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {testimonial.name}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {testimonial.role}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Teaser */}
      <section className="section" style={{ background: 'var(--bg-soft)' }}>
        <div className="container">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="mb-4">Latest Insights for Creators</h2>
              <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
                Discover proven strategies to grow and monetize your following
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Blog Post 1 - Monetization Strategies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Link href="/blog/monetization-strategies-2025" className="card hover-lift group block">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl mb-4 mx-auto" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <h3 className="mb-2 group-hover:text-[var(--accent)] transition-colors">
                  7 Proven Monetization Strategies
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Discover 7 proven ways to monetize your audience in 2025
                </p>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <Clock className="w-4 h-4" />
                  3 min read
                </div>
              </Link>
            </motion.div>

            {/* Blog Post 2 - Content Matching */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Link href="/blog/match-content-audience" className="card hover-lift group block">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl mb-4 mx-auto" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="mb-2 group-hover:text-[var(--accent)] transition-colors">
                  Match Content With Your Audience
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Create content your audience actually cares about
                </p>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <Clock className="w-4 h-4" />
                  2 min read
                </div>
              </Link>
            </motion.div>

            {/* Blog Post 3 - Hidden Niches */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Link href="/blog/hidden-niches-crowded-market" className="card hover-lift group block">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl mb-4 mx-auto" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="mb-2 group-hover:text-[var(--accent)] transition-colors">
                  Finding Hidden Niches
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Discover untapped niches in a crowded market
                </p>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <Clock className="w-4 h-4" />
                  3 min read
                </div>
              </Link>
            </motion.div>

            {/* Blog Post 4 - Attention Spans */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Link href="/blog/short-attention-spans-marketing" className="card hover-lift group block">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl mb-4 mx-auto" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="mb-2 group-hover:text-[var(--accent)] transition-colors">
                  Era of Short Attention Spans
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Why social media marketing changed forever
                </p>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <Clock className="w-4 h-4" />
                  2 min read
                </div>
              </Link>
            </motion.div>

            {/* Blog Post 5 - Revenue Streams */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <Link href="/blog/revenue-streams-diversify-income" className="card hover-lift group block">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl mb-4 mx-auto" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="mb-2 group-hover:text-[var(--accent)] transition-colors">
                  Diversify Your Income Streams
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Build multiple revenue channels for stability
                </p>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <Clock className="w-4 h-4" />
                  4 min read
                </div>
              </Link>
            </motion.div>

            {/* Blog Post 6 - Creator Delegation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <Link href="/blog/creator-delegation-growth" className="card hover-lift group block">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl mb-4 mx-auto" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <h3 className="mb-2 group-hover:text-[var(--accent)] transition-colors">
                  Why DIY Won't Work
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Why creators who delegate scale faster
                </p>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <Clock className="w-4 h-4" />
                  3 min read
                </div>
              </Link>
            </motion.div>
          </div>

          <Reveal delay={0.3}>
            <div className="text-center mt-12">
              <Link href="/blog" className="btn-primary">
                View All Articles
                <BookOpen className="w-5 h-5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Case Study Teaser */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="max-w-4xl mx-auto">
              <Link href="/case-study-tania" className="card hover-lift group block" style={{ background: 'linear-gradient(135deg, var(--surface), var(--bg-soft))' }}>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex items-center justify-center w-24 h-24 rounded-2xl flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                    <Dumbbell className="w-12 h-12 text-white" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-block px-3 py-1 text-xs font-medium rounded-full mb-3" style={{ background: 'var(--accent)', color: 'white' }}>
                      Success Story
                    </div>
                    <h3 className="mb-3 group-hover:text-[var(--accent)] transition-colors">
                      How Fitness Influencer Tania S Transformed Her Brand
                    </h3>
                    <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                      From burnout and 12-hour days to organized business success. Discover how POSTE MEDIA helped Tania build a sustainable creator business with better work-life balance and aligned partnerships.
                    </p>
                    <div className="inline-flex items-center gap-2 text-[var(--accent)] font-medium group-hover:gap-3 transition-all duration-300">
                      Read Success Story
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center card" style={{ background: 'var(--surface)' }}>
              <h2 className="mb-4">Ready to Grow Your Instagram?</h2>
              <p className="text-xl mb-8" style={{ color: 'var(--text-secondary)' }}>
                Join thousands of creators who've transformed their following into a business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className="btn-primary btn-shine hover-lift">
                  Get Started Today
                  <Zap className="w-5 h-5" />
                </Link>
                <Link href="/services" className="btn-secondary hover-lift">
                  Our Services
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}