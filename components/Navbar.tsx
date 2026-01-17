'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { trackDiscordClick } from '@/utils/analytics'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Case Study', href: '/case-study' },
    { name: 'Blog', href: '/blog' },
    { name: 'FAQ', href: '#faq' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed w-full z-50 border-b"
      style={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex items-center space-x-3"
            >
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="LuxLife Agency"
                  width={40}
                  height={40}
                  className="filter drop-shadow-lg hover:scale-105 transition-transform duration-300 rounded-full"
                />
              </div>
              <div className="text-xl lg:text-2xl font-bold tracking-wide">
                <span style={{ color: 'var(--text-on-white)' }}>HiringPhilippines</span>
                <div className="text-xs -mt-1" style={{ color: 'var(--accent)' }}>by LuxLife Agency</div>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="transition-colors duration-200 font-medium relative group px-2 py-1"
                style={{ color: 'var(--text-on-white)' }}
              >
                <span className="relative z-10">{item.name}</span>
                <span className="absolute bottom-0 left-0 w-0 h-px transition-all duration-300 group-hover:w-full" style={{ background: 'var(--accent)' }}></span>
              </Link>
            ))}
            
            <Link 
              href="/choose-position"
              className="btn-primary"
              onClick={trackDiscordClick}
            >
              Apply Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg glass-effect"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden glass-effect rounded-lg mt-4 border border-white/10"
            >
              <div className="px-4 py-6 space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block transition-colors duration-200 font-medium py-2"
                style={{ color: 'var(--text-on-white)' }}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                            <Link
                              href="/choose-position"
                              className="block w-full text-center btn-primary mt-4"
                              onClick={() => {
                                trackDiscordClick();
                                setIsOpen(false);
                              }}
                            >
                              Apply Now
                            </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

export default Navbar
