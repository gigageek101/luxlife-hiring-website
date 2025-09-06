'use client'

import Link from 'next/link'
import { 
  Target, 
  Lightbulb, 
  Trophy, 
  Heart,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import Reveal from '@/components/Reveal'

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: 'Results-Driven',
      description: 'Every strategy is designed with measurable outcomes in mind.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We stay ahead of trends to keep you ahead of the competition.'
    },
    {
      icon: Trophy,
      title: 'Excellence',
      description: 'We deliver nothing but the best for our clients.'
    },
    {
      icon: Heart,
      title: 'Transparency',
      description: 'Clear processes, honest communication, no hidden agendas.'
    }
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-20">
      {/* Hero Section */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="mb-6">About POSTE MEDIA LLC</h1>
              <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
                We are passionate about helping creators succeed in the digital age. 
                Our agency is built for influencers and Instagram theme pages who want 
                more than just likes—they want sustainable growth and real revenue.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section" style={{ background: 'var(--bg-soft)' }}>
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Reveal>
              <div>
                <h2 className="mb-6">Our Mission</h2>
                <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                  To empower influencers with strategies that turn their online presence 
                  into thriving businesses. We believe every creator has the potential to 
                  build something extraordinary.
                </p>
                <ul className="space-y-3">
                  {[
                    'Custom strategies for every creator',
                    'Data-driven approach to growth',
                    'Long-term sustainable monetization',
                    'Continuous support and optimization'
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5" style={{ color: 'var(--success)' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            
            <Reveal delay={0.2}>
              <div className="card">
                <h3 className="mb-4">Why Choose Us?</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  We don't believe in one-size-fits-all. Every influencer is unique, 
                  and so are our solutions. With years of experience and hundreds of 
                  successful campaigns, we know what works.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="mb-4">Our Values</h2>
              <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
                The principles that guide everything we do
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--surface)' }}
                >
                  <value.icon className="w-8 h-8" style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="mb-2">{value.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="section" style={{ background: 'var(--bg-soft)' }}>
        <div className="container">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="mb-6">Our Location</h2>
              <div className="card">
                <p className="text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
                  POSTE MEDIA LLC
                </p>
                <p style={{ color: 'var(--text-secondary)' }}>
                  2880 W Oakland Park Blvd<br />
                  Suite 225C<br />
                  Oakland Park, FL 33311
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="text-center">
              <h2 className="mb-4">Ready to Work Together?</h2>
              <p className="text-xl mb-8" style={{ color: 'var(--text-secondary)' }}>
                Let's discuss how we can help you grow your influence and income.
              </p>
              <Link href="/contact" className="btn-primary">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}