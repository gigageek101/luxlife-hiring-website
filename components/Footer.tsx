'use client'

import Link from 'next/link'
import { Instagram, Twitter, Linkedin, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer style={{ background: 'var(--bg-soft)', borderTop: '1px solid var(--border)' }}>
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="text-2xl font-bold mb-4">
              <span className="text-white">POSTE</span>
              <span className="text-blue-500 ml-2">MEDIA</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Helping influencers and theme pages monetize their following with proven strategies.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--text-secondary)' }}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-sm hover:text-white transition-colors" style={{ color: 'var(--text-secondary)' }}>
                  Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Services</h4>
            <ul className="space-y-2">
              <li className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Monetization Strategy
              </li>
              <li className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Content Optimization
              </li>
              <li className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Audience Growth
              </li>
              <li className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Revenue Streams
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Contact</h4>
            <div className="space-y-3">
              <a 
                href="mailto:office@postemediallc.com" 
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Mail className="w-4 h-4" />
                office@postemediallc.com
              </a>
              <div className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>
                  2880 W Oakland Park Blvd<br />
                  Suite 225C<br />
                  Oakland Park, FL 33311
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              © {currentYear} POSTE MEDIA LLC. All rights reserved.
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