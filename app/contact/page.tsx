'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Send, CheckCircle } from 'lucide-react'
import Reveal from '@/components/Reveal'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    instagram: '',
    reach: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        // Redirect to thank you page
        window.location.href = '/thank-you'
      } else {
        alert('There was an error submitting your message. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('There was an error submitting your message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-20">
      {/* Hero Section */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="mb-6">Let's Build Your Growth Plan</h1>
              <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
                Ready to transform your social media presence into a profitable business? 
                Let's discuss your goals and create a custom strategy.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="section" style={{ background: 'var(--bg-soft)' }}>
        <div className="container">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="md:col-span-1">
              <Reveal>
                <div className="card mb-6">
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 mt-1" style={{ color: 'var(--accent)' }} />
                    <div>
                      <h3 className="mb-2">Email Us</h3>
                      <a 
                        href="mailto:office@postemediallc.com"
                        className="hover:text-white transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        office@postemediallc.com
                      </a>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 mt-1" style={{ color: 'var(--accent)' }} />
                    <div>
                      <h3 className="mb-2">Visit Us</h3>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        2880 W Oakland Park Blvd<br />
                        Suite 225C<br />
                        Oakland Park, FL 33311
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              <Reveal delay={0.2}>
                <div className="card">
                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--success)' }} />
                      <h3 className="mb-2">Thank You!</h3>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        We've received your message and will get back to you within 24 hours.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border transition-colors"
                            style={{ 
                              background: 'var(--bg)',
                              borderColor: 'var(--border)',
                              color: 'var(--text-primary)'
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border transition-colors"
                            style={{ 
                              background: 'var(--bg)',
                              borderColor: 'var(--border)',
                              color: 'var(--text-primary)'
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">
                            Instagram Handle
                          </label>
                          <input
                            type="text"
                            name="instagram"
                            value={formData.instagram}
                            onChange={handleChange}
                            placeholder="@username"
                            className="w-full px-4 py-3 rounded-lg border transition-colors"
                            style={{ 
                              background: 'var(--bg)',
                              borderColor: 'var(--border)',
                              color: 'var(--text-primary)'
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">
                            Monthly Reach
                          </label>
                          <select
                            name="reach"
                            value={formData.reach}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border transition-colors"
                            style={{ 
                              background: 'var(--bg)',
                              borderColor: 'var(--border)',
                              color: 'var(--text-primary)'
                            }}
                          >
                            <option value="">Select range</option>
                            <option value="<10k">Less than 10K</option>
                            <option value="10k-50k">10K - 50K</option>
                            <option value="50k-100k">50K - 100K</option>
                            <option value="100k-500k">100K - 500K</option>
                            <option value="500k+">500K+</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-white">
                          Message *
                        </label>
                        <textarea
                          name="message"
                          required
                          rows={6}
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us about your goals..."
                          className="w-full px-4 py-3 rounded-lg border transition-colors resize-none"
                          style={{ 
                            background: 'var(--bg)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full md:w-auto"
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                        <Send className="w-5 h-5" />
                      </button>
                    </form>
                  )}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}