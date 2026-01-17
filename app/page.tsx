'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Shield, 
  Users, 
  Zap, 
  MessageCircle, 
  Star, 
  ArrowRight,
  CheckCircle,
  Clock,
  BookOpen,
  AlertTriangle,
  Dumbbell,
  Search,
  Brain,
  TrendingUp,
  DollarSign,
  Target,
  ExternalLink
} from 'lucide-react'
import AnimatedCounter from '@/components/AnimatedCounter'
import Reveal from '@/components/Reveal'
import ParallaxText from '@/components/ParallaxText'
import DynamicBackground from '@/components/DynamicBackground'
import ApplicationModal from '@/components/ApplicationModal'
import { trackDiscordClick } from '@/utils/analytics'

export default function Home() {
  const [showModal, setShowModal] = useState(false)
  const benefits = [
    {
      icon: Shield,
      title: 'Exclusive Access',
      description: 'Find opportunities you won\'t see in random Facebook groups or spammy websites.'
    },
    {
      icon: CheckCircle,
      title: 'Verified Employers',
      description: 'Every post is vetted by the LuxLife Association to keep you safe from scams.'
    },
    {
      icon: Users,
      title: 'Career Community',
      description: 'Connect with others, exchange tips, and grow together.'
    },
    {
      icon: Zap,
      title: 'Fast Announcements',
      description: 'See opportunities the moment they go live.'
    }
  ]

  const steps = [
    {
      number: '1',
      title: 'Complete the Application',
      description: 'Takes just 5 minutes to complete our qualification process.'
    },
    {
      number: '2',
      title: 'Pass the Quick Tests',
      description: 'Simple English and memory tests to ensure you\'re a good fit.'
    },
    {
      number: '3',
      title: 'Schedule Your 15-Min Call',
      description: 'Book a personal introduction call with our team to get started.'
    }
  ]

  const testimonials = [
    {
      content: 'Finally, a safe place to find work online. I applied and within a week I had my introduction call and started training.',
      name: 'Andrea',
      location: 'Manila',
      rating: 5
    },
    {
      content: 'I used to waste time on Facebook job groups. Here, everything is clear and organized. No scams, no nonsense.',
      name: 'Jerome',
      location: 'Cebu',
      rating: 5
    },
    {
      content: 'I didn\'t just find opportunities—I found a network. People here actually help each other succeed.',
      name: 'Clara',
      location: 'Davao',
      rating: 5
    },
    {
      content: 'Joining was the best decision I made. It gave me focus and direction in my career search.',
      name: 'Rafael',
      location: 'Iloilo',
      rating: 5
    }
  ]

  const faqs = [
    {
      question: 'Is the application free?',
      answer: 'Yes, it\'s 100% free. The application and introduction call cost nothing.'
    },
    {
      question: 'Do I need experience to apply?',
      answer: 'Not always. Many employers welcome motivated beginners.'
    },
    {
      question: 'What happens after I apply?',
      answer: 'If you qualify, you\'ll schedule a 15-minute introduction call where we discuss opportunities and next steps.'
    },
    {
      question: 'How do I know it\'s not a scam?',
      answer: 'Every post inside the community is verified by the LuxLife Association.'
    },
    {
      question: 'Why should I check regularly?',
      answer: 'Because opportunities can disappear quickly once filled. Staying active means staying ahead.'
    }
  ]

  return (
    <div className="min-h-screen relative">
      <DynamicBackground />
      
      {/* Hero Section */}
      <section className="section pt-32 md:pt-40 relative z-10">
        <div className="container">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <motion.h1 
              className="mb-6 text-6xl md:text-7xl font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <span style={{ color: '#000000', textShadow: '0 2px 4px rgba(255, 255, 255, 0.3)' }}>Find Your Next</span>{' '}
              <span className="elegant-text">Career Opportunity</span>
              <br />
              <span style={{ color: '#000000', textShadow: '0 2px 4px rgba(255, 255, 255, 0.3)' }} className="inline-flex items-center gap-3">
                in the Philippines
                <span className="text-4xl md:text-5xl">🇵🇭</span>
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl mb-8" 
              style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Verified employers. Real opportunities. One trusted community.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <button 
                className="btn-primary hover-lift hover-glow text-xl px-12 py-6 font-bold"
                onClick={() => {
                  trackDiscordClick()
                  setShowModal(true)
                }}
              >
                👉 Apply Now (Takes 5 Minutes)
                <ExternalLink className="w-6 h-6" />
              </button>
            </motion.div>

            <motion.div 
              className="mt-6 text-sm"
              style={{ color: '#ffffff', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <span className="inline-flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}></div>
                Powered by LuxLife Association
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why HiringPhilippines Section */}
      <section className="section relative z-10" style={{ background: 'var(--bg-primary)' }}>
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
                🚀 Why Thousands of Filipinos Trust Our Platform
              </motion.h2>
              <motion.p 
                className="text-xl max-w-4xl mx-auto" 
                style={{ color: 'var(--text-secondary-on-white)' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Most job seekers in the Philippines waste hours scrolling through unverified ads, fake listings, and dead-end opportunities. That's why we created HiringPhilippines.Careers – a secure, community-first space where real talent connects with real opportunities.
              </motion.p>
            </div>
          </ParallaxText>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                viewport={{ once: true }}
                className="card hover-lift hover-glow glass-card"
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="p-4 rounded-xl flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}
                  >
                    <benefit.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2">{benefit.title}</h3>
                    <p style={{ color: 'var(--text-secondary-on-white)' }}>
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section">
        <div className="container">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="mb-4">⚡ Here's How to Get Started in Minutes</h2>
              <p className="text-xl" style={{ color: 'var(--text-secondary-on-white)' }}>
                💡 Tip: The people who succeed are the ones who take action and apply today.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}
                >
                  {step.number}
                </div>
                <h3 className="mb-4">{step.title}</h3>
                <p style={{ color: 'var(--text-secondary-on-white)' }}>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

          <Reveal delay={0.3}>
            <div className="text-center mt-12">
              <button 
                className="btn-primary btn-shine hover-lift text-lg px-8 py-4"
                onClick={() => {
                  trackDiscordClick()
                  setShowModal(true)
                }}
              >
                🔥 Apply Now (Takes 5 Minutes) →
                <ExternalLink className="w-5 h-5" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="reviews" className="section" style={{ background: 'var(--bg-soft)' }}>
        <div className="container">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="mb-4">💬 What Our Members Say About Us</h2>
              <p className="text-xl" style={{ color: 'var(--text-secondary-on-white)' }}>
                Real results from real Filipino workers
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-8">
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
                  <div className="text-sm" style={{ color: 'var(--text-secondary-on-white)' }}>
                    {testimonial.location}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Teaser */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="mb-4">Career Insights for Hardworking Filipinos</h2>
              <p className="text-xl" style={{ color: 'var(--text-secondary-on-white)' }}>
                Real stories and practical advice to help you find better opportunities
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Blog Post 1 - Overworked Filipinos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Link href="/blog/monetization-strategies-2025" className="card hover-lift group block">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl mb-4 mx-auto" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <h3 className="mb-2 group-hover:text-[var(--accent)] transition-colors">
                  Why Hardworking Filipinos Get Overworked
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary-on-white)' }}>
                  Instead of being rewarded, high performers get piled with more work
                </p>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted-on-white)' }}>
                  <Clock className="w-4 h-4" />
                  4 min read
                </div>
              </Link>
            </motion.div>

            {/* Blog Post 2 - Hidden Scams */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Link href="/blog/match-content-audience" className="card hover-lift group block">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl mb-4 mx-auto" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="mb-2 group-hover:text-[var(--accent)] transition-colors">
                  Hidden Scams That Target Filipinos
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary-on-white)' }}>
                  Learn how scammers exploit hardworking Filipino job seekers
                </p>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted-on-white)' }}>
                  <Clock className="w-4 h-4" />
                  3 min read
                </div>
              </Link>
            </motion.div>

            {/* Blog Post 3 - No Days Off */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Link href="/blog/hidden-niches-crowded-market" className="card hover-lift group block">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl mb-4 mx-auto" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="mb-2 group-hover:text-[var(--accent)] transition-colors">
                  No Days Off? The Dark Side of Outsourcing
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary-on-white)' }}>
                  Why many Filipinos face pressure to work every day
                </p>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted-on-white)' }}>
                  <Clock className="w-4 h-4" />
                  3 min read
                </div>
              </Link>
            </motion.div>

            {/* Blog Post 4 - High Performers Quit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Link href="/blog/short-attention-spans-marketing" className="card hover-lift group block">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl mb-4 mx-auto" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="mb-2 group-hover:text-[var(--accent)] transition-colors">
                  Why High Performers Quit
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary-on-white)' }}>
                  The balance problem in Philippine outsourcing
                </p>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted-on-white)' }}>
                  <Clock className="w-4 h-4" />
                  3 min read
                </div>
              </Link>
            </motion.div>

            {/* Blog Post 5 - No Structure */}
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
                  No Structure, No Success
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary-on-white)' }}>
                  Why Filipinos deserve better workplace structure
                </p>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted-on-white)' }}>
                  <Clock className="w-4 h-4" />
                  3 min read
                </div>
              </Link>
            </motion.div>

            {/* Blog Post 6 - Work Without Burnout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <Link href="/blog/creator-delegation-growth" className="card hover-lift group block">
                <div className="flex items-center justify-center w-16 h-16 rounded-xl mb-4 mx-auto" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <h3 className="mb-2 group-hover:text-[var(--accent)] transition-colors">
                  Work Hard Without Burning Out
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary-on-white)' }}>
                  How to stay ambitious without breaking yourself
                </p>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted-on-white)' }}>
                  <Clock className="w-4 h-4" />
                  4 min read
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
      <section className="section" style={{ background: 'var(--bg-soft)' }}>
        <div className="container">
          <Reveal>
            <div className="max-w-4xl mx-auto">
              <Link href="/case-study" className="card hover-lift group block" style={{ background: 'linear-gradient(135deg, var(--surface), var(--bg-soft))' }}>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex items-center justify-center w-24 h-24 rounded-2xl flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                    <TrendingUp className="w-12 h-12 text-white" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-block px-3 py-1 text-xs font-medium rounded-full mb-3" style={{ background: 'var(--accent)', color: 'white' }}>
                      Success Story
                    </div>
                    <h3 className="mb-3 group-hover:text-[var(--accent)] transition-colors">
                      How Nik Turned Struggles Into a Career Path 🚀
                    </h3>
                    <p className="mb-4" style={{ color: 'var(--text-secondary-on-white)' }}>
                      From unpaid overtime and scams to a structured role in digital marketing analytics. Discover how HiringPhilippines.Careers helped Nik build a sustainable career with 3x income increase and real work-life balance.
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

      {/* FAQ Section */}
      <section id="faq" className="section">
        <div className="container">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="mb-4">🙋 Frequently Asked Questions</h2>
            </div>
          </Reveal>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card"
              >
                <h3 className="mb-3 text-lg">{faq.question}</h3>
                <p style={{ color: 'var(--text-secondary-on-white)' }}>{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section" style={{ background: 'var(--bg-soft)' }}>
        <div className="container">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center card" style={{ background: 'var(--surface)' }}>
              <h2 className="mb-4">🎯 Don't Leave Your Career to Chance – Join the Community That Works</h2>
              <p className="text-xl mb-8" style={{ color: 'var(--text-secondary-on-white)' }}>
                You've seen the fake ads. You've wasted time on spam. Now it's time to step into a safe, trusted space designed for Filipino talent.
              </p>
                <button 
                  className="btn-primary btn-shine hover-lift text-lg px-8 py-4"
                  onClick={() => {
                    trackDiscordClick()
                    setShowModal(true)
                  }}
                >
                  👉 Apply Now (Takes 5 Minutes)
                  <ExternalLink className="w-5 h-5" />
                </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Application Modal */}
      <ApplicationModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}