'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { trackDiscordClick } from '@/utils/analytics'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative z-20" style={{ background: 'var(--bg-dark)', borderTop: '1px solid var(--border-dark)' }}>
      <div className="container py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="LuxLife Agency"
                  width={35}
                  height={35}
                  className="filter drop-shadow-lg hover:scale-105 transition-transform duration-300 rounded-full"
                />
              </div>
              <div>
                <div className="text-xl font-bold text-white">HiringPhilippines.Careers</div>
                <div className="text-xs text-orange-400">by LuxLife Agency</div>
              </div>
            </div>
            <p className="text-sm max-w-md" style={{ color: 'var(--text-secondary-on-black)' }}>
              HiringPhilippines.Careers is part of the LuxLife Association. Our mission is to connect Filipino talent with trusted employers through a safe and exclusive community platform. Join our Discord today and discover your next opportunity.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#how-it-works" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--text-secondary-on-black)' }}>
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#reviews" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--text-secondary-on-black)' }}>
                  Reviews
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--text-secondary-on-black)' }}>
                  FAQ
                </Link>
              </li>
              <li>
                <a 
                  href="https://myallsocials.com/luxlife" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors flex items-center gap-1" 
                  style={{ color: 'var(--text-secondary-on-black)' }}
                  onClick={trackDiscordClick}
                >
                  Join Discord
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>


        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm" style={{ color: 'var(--text-muted-on-black)' }}>
              © {currentYear} LuxLife Association. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--text-muted-on-black)' }}>
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--text-muted-on-black)' }}>
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}