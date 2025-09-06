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

      {/* Stats Section */}
      <section className="section-padding bg-dark-800/50">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold gradient-text mb-2">
                  {stat.number}
                </div>
                <div className="text-white/70">{stat.label}</div>
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

      {/* Testimonials */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6">
              What Our <span className="gradient-text">Clients Say</span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Real results from real influencers who trusted us with their growth
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-effect p-8 rounded-2xl hover-glow"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-white/80 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-white/60 text-sm">{testimonial.role}</div>
                  </div>
                  <div className="text-primary-400 font-semibold">
                    {testimonial.followers}
                  </div>
                </div>
              </motion.div>
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
