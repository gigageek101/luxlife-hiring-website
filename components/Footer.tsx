'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer style={{ background: 'var(--bg-soft)', borderTop: '1px solid var(--border)' }}>
      <div className="container py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <img
                  src="/luxlife-logo.svg"
                  alt="LuxLife Agency"
                  width={50}
                  height={30}
                  className="filter drop-shadow-lg"
                />
              </div>
              <div>
                <div className="text-xl font-bold text-white">HiringPhilippines.Careers</div>
                <div className="text-xs text-orange-400">by LuxLife Agency</div>
              </div>
            </div>
            <p className="text-sm max-w-md" style={{ color: 'var(--text-secondary)' }}>
              HiringPhilippines.Careers is part of the LuxLife Association. Our mission is to connect Filipino talent with trusted employers through a safe and exclusive community platform. Join our Discord today and discover your next opportunity.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#how-it-works" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--text-secondary)' }}>
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#reviews" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--text-secondary)' }}>
                  Reviews
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--text-secondary)' }}>
                  FAQ
                </Link>
              </li>
              <li>
                <a 
                  href="https://myallsocials.com/luxlife" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors flex items-center gap-1" 
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Join Discord
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* SEO Footer Content */}
        <div className="mt-8 p-6 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <strong className="text-white">SEO Keywords:</strong> job opportunities Philippines, careers in PH, verified employers PH, remote work Philippines, hiring Discord, Filipino career growth, LuxLife Association hiring
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              © {currentYear} LuxLife Association. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}>
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}>
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}