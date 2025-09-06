'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  CheckCircle,
  Instagram,
  Twitter,
  Linkedin,
  MessageSquare,
  Calendar,
  Zap
} from 'lucide-react'

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    instagramHandle: '',
    monthlyReach: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      content: 'info@postemedia.com',
      description: 'Send us an email anytime'
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '+1 (555) 123-4567',
      description: 'Mon-Fri from 9am to 6pm EST'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      content: 'New York, NY',
      description: 'Schedule an in-person meeting'
    },
    {
      icon: Clock,
      title: 'Response Time',
      content: 'Within 24 hours',
      description: 'We respond to all inquiries quickly'
    }
  ]

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, href: '#', color: 'hover:text-pink-400' },
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-blue-400' },
    { name: 'LinkedIn', icon: Linkedin, href: '#', color: 'hover:text-blue-600' }
  ]

  const faqs = [
    {
      question: 'How quickly can I see results?',
      answer: 'Most clients see initial improvements within 30 days, with significant growth typically occurring within 90 days.'
    },
    {
      question: 'Do you work with small influencers?',
      answer: 'Yes! We work with creators of all sizes, from emerging influencers to established personalities with millions of followers.'
    },
    {
      question: 'What makes you different from other agencies?',
      answer: 'Our data-driven approach, personalized strategies, and proven track record of 500+ successful campaigns set us apart.'
    },
    {
      question: 'Is there a minimum contract length?',
      answer: 'We offer flexible packages starting from 3 months, with most clients seeing the best results with 6-12 month partnerships.'
    }
  ]

  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="glass-effect p-8 rounded-2xl">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
            <h2 className="text-2xl font-display font-bold mb-4">Thank You!</h2>
            <p className="text-white/80 mb-6">
              We've received your message and will get back to you within 24 hours with a personalized growth strategy.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="btn-primary"
            >
              Send Another Message
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

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
              Let's Build Your <span className="gradient-text">Growth Plan</span> Today
            </h1>
            <p className="text-xl lg:text-2xl text-white/80 leading-relaxed">
              Have questions? Ready to grow? Our team is here to help you design a personalized 
              strategy for Instagram success.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="glass-effect p-8 rounded-2xl">
                <h2 className="text-2xl font-display font-bold mb-6">
                  Get Your Free Growth Strategy Quote
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="fullName" className="block text-white/80 font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-primary-400 transition-colors duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-white/80 font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-primary-400 transition-colors duration-200"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="instagramHandle" className="block text-white/80 font-medium mb-2">
                      Instagram Handle
                    </label>
                    <input
                      type="text"
                      id="instagramHandle"
                      name="instagramHandle"
                      value={formData.instagramHandle}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-primary-400 transition-colors duration-200"
                      placeholder="@yourusername"
                    />
                  </div>

                  <div>
                    <label htmlFor="monthlyReach" className="block text-white/80 font-medium mb-2">
                      Monthly Reach (Approximate)
                    </label>
                    <select
                      id="monthlyReach"
                      name="monthlyReach"
                      value={formData.monthlyReach}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-400 transition-colors duration-200"
                    >
                      <option value="">Select your reach</option>
                      <option value="0-10k">0 - 10K</option>
                      <option value="10k-50k">10K - 50K</option>
                      <option value="50k-100k">50K - 100K</option>
                      <option value="100k-500k">100K - 500K</option>
                      <option value="500k-1m">500K - 1M</option>
                      <option value="1m+">1M+</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-white/80 font-medium mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-primary-400 transition-colors duration-200 resize-none"
                      placeholder="Tell us about your goals and how we can help you grow..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary py-4 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <div className="loading-dots">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-display font-bold mb-6">
                  Get in Touch
                </h2>
                <p className="text-white/80 leading-relaxed mb-8">
                  Ready to transform your social media presence into a thriving business? 
                  We're here to help you every step of the way.
                </p>
              </div>

              {/* Contact Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={info.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="glass-effect p-6 rounded-xl hover-glow"
                  >
                    <info.icon className="w-8 h-8 text-primary-400 mb-4" />
                    <h3 className="font-semibold mb-2">{info.title}</h3>
                    <p className="text-primary-400 font-medium mb-1">{info.content}</p>
                    <p className="text-white/60 text-sm">{info.description}</p>
                  </motion.div>
                ))}
              </div>

              {/* Social Links */}
              <div className="glass-effect p-6 rounded-xl">
                <h3 className="font-semibold mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      className={`p-3 glass-effect rounded-lg hover:bg-white/10 transition-all duration-200 ${social.color}`}
                    >
                      <social.icon className="w-6 h-6" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="glass-effect p-6 rounded-xl">
                <h3 className="font-semibold mb-4">Why Choose Us?</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-primary-400" />
                    <span className="text-white/80">24-hour response time</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary-400" />
                    <span className="text-white/80">500+ successful campaigns</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-primary-400" />
                    <span className="text-white/80">Free strategy consultation</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-dark-800/30">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Get answers to common questions about our services and process
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-effect p-6 rounded-xl"
              >
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <MessageSquare className="w-5 h-5 text-primary-400 mr-3" />
                  {faq.question}
                </h3>
                <p className="text-white/80 leading-relaxed pl-8">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
              Ready to Start Your <span className="gradient-text">Success Story</span>?
            </h2>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Don't wait any longer. Your competitors are already growing. 
              Let's create a strategy that puts you ahead of the game.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="mailto:info@postemedia.com" className="btn-primary text-lg px-8 py-4">
                Email Us Directly
                <Mail className="ml-2 w-5 h-5" />
              </a>
              <a href="tel:+15551234567" className="btn-secondary text-lg px-8 py-4">
                Call Now
                <Phone className="ml-2 w-5 h-5" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
