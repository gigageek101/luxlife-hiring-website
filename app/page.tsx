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
  Shield
} from 'lucide-react'

export default function Home() {
  const services = [
    {
      icon: DollarSign,
      title: 'Monetization Strategy',
      description: 'Unlock new income streams tailored to your audience.',
      features: ['Audience Analysis', 'Revenue Optimization', 'Custom Strategies']
    },
    {
      icon: BarChart3,
      title: 'Content Optimization',
      description: 'Improve performance with data-driven insights.',
      features: ['Performance Analytics', 'Trend Analysis', 'Content Planning']
    },
    {
      icon: Users,
      title: 'Audience Growth',
      description: 'Build a loyal community through organic and paid methods.',
      features: ['Organic Growth', 'Paid Campaigns', 'Community Building']
    },
    {
      icon: TrendingUp,
      title: 'Revenue Streams',
      description: 'Scale your brand with partnerships, products, and collaborations.',
      features: ['Brand Partnerships', 'Product Development', 'Collaboration Networks']
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Fashion Influencer',
      content: 'POSTE MEDIA helped us grow 5x in three months. Their strategies actually work.',
      rating: 5,
      followers: '250K'
    },
    {
      name: 'Mike Chen',
      role: 'Tech Theme Page Owner',
      content: 'Incredible results! My revenue increased by 300% within 6 months.',
      rating: 5,
      followers: '180K'
    },
    {
      name: 'Emma Rodriguez',
      role: 'Lifestyle Creator',
      content: 'Professional, results-driven, and genuinely care about our success.',
      rating: 5,
      followers: '420K'
    }
  ]

  const stats = [
    { number: '500+', label: 'Successful Campaigns' },
    { number: '2M+', label: 'Followers Grown' },
    { number: '300%', label: 'Average Revenue Increase' },
    { number: '98%', label: 'Client Satisfaction' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0">
          <div className="gradient-bg absolute inset-0"></div>
        </div>

        <div className="relative z-10 container-custom text-center">
          {/* Hero card with white surface */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="surface-card max-w-4xl mx-auto"
          >
            <h1 className="mb-6">
              Helping Influencers &{' '}
              <span className="gradient-text">Theme Pages</span>{' '}
              Monetize Their Following
            </h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-body-lg text-ink-soft mb-8 max-w-prose-wide mx-auto"
            >
              Custom strategies, proven marketing methods, real growth.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/contact" className="button button--primary">
                Get a Free Quote
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/case-studies" className="button button--secondary">
                View Case Studies
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Gentle Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border border-pastel-coral/50 rounded-full flex justify-center pastel-glow">
            <div className="w-1 h-3 bg-pastel-coral/80 rounded-full mt-2 animate-gentle-bounce"></div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section - Always on white cards */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-soft)' }}>
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="stats-card"
              >
                <div className="stats-number">
                  {stat.number}
                </div>
                <div className="stats-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Short Intro */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6">
              Turning Influence Into <span className="gradient-text">Income</span>
            </h2>
            <p className="text-xl text-white/80 leading-relaxed">
              At POSTE MEDIA LLC, we specialize in turning influence into income. Whether you're an Instagram influencer, 
              content creator, or theme page owner, our strategies are designed to maximize your reach, engagement, 
              and revenue potential.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="section-padding bg-bg-soft">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="mb-6">
              Our <span className="gradient-text">Services</span>
            </h2>
            <p className="text-body-lg text-ink-soft max-w-prose-wide mx-auto">
              Comprehensive solutions designed to maximize your social media potential
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const cardVariants = [
                'service-card--coral',
                'service-card--peach', 
                'service-card--mint',
                'service-card--aqua'
              ];
              
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`service-card ${cardVariants[index % 4]} group cursor-pointer`}
                >
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-brand/10 rounded-lg mr-4 group-hover:bg-brand/20 transition-colors duration-200">
                      <service.icon className="w-8 h-8 text-ink" />
                    </div>
                    <h3>{service.title}</h3>
                  </div>
                  
                  <p className="text-ink-soft mb-6 max-w-prose">
                    {service.description}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start text-ink text-small">
                        <CheckCircle className="w-4 h-4 text-brand mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link 
                    href="/services" 
                    className="button button--tertiary group-hover:translate-x-1 transition-transform duration-200"
                  >
                    Learn More →
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/services" className="button button--primary">
              Learn More About Our Services
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials - WCAG Compliant */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-soft)' }}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="mb-6">
              What Our <span className="gradient-text">Clients Say</span>
            </h2>
            <p className="text-body-lg max-w-prose-wide mx-auto" style={{ color: 'var(--ink-soft)' }}>
              Real results from real influencers who trusted us with their growth
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.article
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="testimonial-card"
              >
                <div className="testimonial-rating" aria-label={`Rating: ${testimonial.rating} out of 5`}>
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      width="18" 
                      height="18" 
                      aria-hidden="true" 
                      className="testimonial-star"
                      style={{ fill: i < testimonial.rating ? 'var(--star)' : '#e5e7eb' }}
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="testimonial-rating-text">4.9 · 126 reviews</span>
                </div>
                
                <p className="testimonial-quote">
                  "{testimonial.content}"
                </p>

                <div className="testimonial-author">
                  <img 
                    src={`https://images.unsplash.com/photo-${1500000000000 + index}?w=72&h=72&fit=crop&crop=face`} 
                    alt="" 
                    className="testimonial-avatar"
                  />
                  <div>
                    <div className="testimonial-author-name">{testimonial.name}</div>
                    <div className="testimonial-author-handle">@{testimonial.name.toLowerCase().replace(' ', '')} • {testimonial.role}</div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-gradient-to-r from-primary-600/20 to-primary-500/20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6">
              Ready to Start Growing Your Instagram Into a <span className="gradient-text">Business</span>?
            </h2>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Join hundreds of successful influencers who have transformed their social media presence 
              into thriving businesses with our proven strategies.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/contact" className="btn-primary text-lg px-8 py-4">
                Request a Quote Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/case-studies" className="btn-secondary text-lg px-8 py-4">
                View Success Stories
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 mt-12 pt-8 border-t border-white/10">
              <div className="flex items-center space-x-2 text-white/60">
                <Shield className="w-5 h-5 text-primary-400" />
                <span>100% Confidential</span>
              </div>
              <div className="flex items-center space-x-2 text-white/60">
                <Zap className="w-5 h-5 text-primary-400" />
                <span>Fast Results</span>
              </div>
              <div className="flex items-center space-x-2 text-white/60">
                <CheckCircle className="w-5 h-5 text-primary-400" />
                <span>Proven Strategies</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
