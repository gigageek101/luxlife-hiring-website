'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Instagram, Twitter, Linkedin, ArrowUp } from 'lucide-react'

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const footerLinks = {
    services: [
      { name: 'Monetization Strategy', href: '/services#monetization' },
      { name: 'Content Optimization', href: '/services#content' },
      { name: 'Audience Growth', href: '/services#growth' },
      { name: 'Revenue Streams', href: '/services#revenue' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Case Studies', href: '/case-studies' },
      { name: 'Blog', href: '/blog' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
    ],
  }

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
  ]

  return (
    <footer className="relative bg-dark-900 border-t border-white/10">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent"></div>
      </div>

      <div className="relative">
        {/* Main Footer Content */}
        <div className="section-padding">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {/* Company Info */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <Link href="/" className="inline-block mb-6">
                    <div className="text-2xl font-display font-bold gradient-text">
                      POSTE MEDIA
                    </div>
                  </Link>
                  <p className="text-white/70 mb-6 leading-relaxed">
                    Helping influencers and Instagram theme pages monetize their following 
                    with custom strategies and proven marketing methods.
                  </p>
                  
                  {/* Contact Info */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-white/70">
                      <Mail className="w-4 h-4 text-primary-400" />
                      <span>info@postemedia.com</span>
                    </div>
                    <div className="flex items-center space-x-3 text-white/70">
                      <Phone className="w-4 h-4 text-primary-400" />
                      <span>+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center space-x-3 text-white/70">
                      <MapPin className="w-4 h-4 text-primary-400" />
                      <span>New York, NY</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Services Links */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-lg font-semibold text-white mb-6">Services</h3>
                  <ul className="space-y-3">
                    {footerLinks.services.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-white/70 hover:text-primary-400 transition-colors duration-200"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Company Links */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-lg font-semibold text-white mb-6">Company</h3>
                  <ul className="space-y-3">
                    {footerLinks.company.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-white/70 hover:text-primary-400 transition-colors duration-200"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Newsletter & Social */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-lg font-semibold text-white mb-6">Stay Updated</h3>
                  <p className="text-white/70 mb-4">
                    Get the latest insights and strategies delivered to your inbox.
                  </p>
                  
                  {/* Newsletter Signup */}
                  <form className="mb-6">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-primary-400 transition-colors duration-200"
                      />
                      <button
                        type="submit"
                        className="btn-primary whitespace-nowrap"
                      >
                        Subscribe
                      </button>
                    </div>
                  </form>

                  {/* Social Links */}
                  <div className="flex space-x-4">
                    {socialLinks.map((social) => (
                      <Link
                        key={social.name}
                        href={social.href}
                        className="p-2 glass-effect rounded-lg hover:bg-white/10 transition-colors duration-200 group"
                      >
                        <social.icon className="w-5 h-5 text-white/70 group-hover:text-primary-400 transition-colors duration-200" />
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="container-custom">
            <div className="flex flex-col sm:flex-row items-center justify-between py-6 space-y-4 sm:space-y-0">
              <div className="text-white/60 text-sm">
                © 2024 POSTE MEDIA LLC. All rights reserved.
              </div>
              
              <div className="flex items-center space-x-6">
                {footerLinks.legal.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll to Top Button */}
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 glass-effect rounded-full hover:bg-white/10 transition-colors duration-200 z-40"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowUp className="w-5 h-5 text-primary-400" />
        </motion.button>
      </div>
    </footer>
  )
}

export default Footer
