'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  DollarSign, 
  BarChart3, 
  Users, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Zap,
  Target,
  Shield,
  Sparkles
} from 'lucide-react'
import Reveal from '@/components/Reveal'

export default function ServicesPage() {
  const services = [
    {
      icon: DollarSign,
      title: 'Monetization Strategy',
      description: 'Transform your following into sustainable revenue streams.',
      features: [
        'Brand partnership development',
        'Sponsorship negotiations',
        'Product launch strategies',
        'Affiliate program setup',
        'Revenue optimization'
      ],
      cta: 'Start Monetizing'
    },
    {
      icon: BarChart3,
      title: 'Content Optimization',
      description: 'Maximize engagement and reach with data-driven content.',
      features: [
        'Algorithm optimization',
        'Content calendar planning',
        'Trend analysis & adaptation',
        'Engagement rate improvement',
        'Hashtag strategy'
      ],
      cta: 'Optimize Content'
    },
    {
      icon: Users,
      title: 'Audience Growth',
      description: 'Build a loyal, engaged community that converts.',
      features: [
        'Organic growth strategies',
        'Community management',
        'Engagement campaigns',
        'Influencer collaborations',
        'Targeted follower acquisition'
      ],
      cta: 'Grow Audience'
    },
    {
      icon: TrendingUp,
      title: 'Revenue Streams',
      description: 'Diversify income with multiple monetization channels.',
      features: [
        'Digital product creation',
        'Subscription model setup',
        'Course development',
        'Merchandise strategies',
        'Passive income systems'
      ],
      cta: 'Build Revenue'
    }
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-20">
      {/* Hero Section */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="mb-6">Our Services</h1>
              <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
                Comprehensive solutions to help influencers and theme pages 
                monetize effectively and grow sustainably.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section" style={{ background: 'var(--bg-soft)' }}>
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card group"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ background: 'var(--accent)', opacity: 0.1 }}
                  >
                    <service.icon className="w-8 h-8" style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <h3 className="mb-2">{service.title}</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      {service.description}
                    </p>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle 
                        className="w-5 h-5 mt-0.5 flex-shrink-0" 
                        style={{ color: 'var(--success)' }} 
                      />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link 
                  href="/contact" 
                  className="inline-flex items-center gap-2 font-medium"
                  style={{ color: 'var(--accent)' }}
                >
                  {service.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="mb-4">How We Work</h2>
              <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
                Our proven process for success
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Target, title: 'Analyze', desc: 'Deep dive into your current metrics' },
              { icon: Sparkles, title: 'Strategy', desc: 'Custom plan tailored to your goals' },
              { icon: Zap, title: 'Execute', desc: 'Implement with precision and speed' },
              { icon: Shield, title: 'Optimize', desc: 'Continuous improvement and scaling' }
            ].map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--surface)', border: '2px solid var(--accent)' }}
                >
                  <step.icon className="w-8 h-8" style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="mb-2 text-lg">{step.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section" style={{ background: 'var(--bg-soft)' }}>
        <div className="container">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center card">
              <h2 className="mb-4">Ready to Transform Your Social Media?</h2>
              <p className="text-xl mb-8" style={{ color: 'var(--text-secondary)' }}>
                Let's create a custom strategy for your growth and monetization.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className="btn-primary">
                  Get Started Today
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/about" className="btn-secondary">
                  Learn About Us
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}