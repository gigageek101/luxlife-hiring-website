'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] pt-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm hover:text-white transition-colors" style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="mb-4">Privacy Policy</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            Effective Date: September 6, 2025 | Last Updated: September 6, 2025
          </p>

          <div className="prose prose-invert max-w-none space-y-8" style={{ color: 'var(--text-secondary)' }}>
            <section>
              <p className="lead">
                POSTE MEDIA LLC ("POSTE MEDIA," "we," "us," or "our") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and protect personal information when you visit postemedia.com (the "Site"), contact us, or use our services for influencers and Instagram theme pages (the "Services").
              </p>
              <p>
                If you do not agree with this Policy, please do not use the Site or Services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">1. Personal Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mb-2 text-white">A. Information you provide</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Identifiers & contact data: name, email, phone, social handles, company/brand, role.</li>
                <li>Professional/marketing details: audience size, goals, budget, links to pages/accounts.</li>
                <li>Content you submit: messages, forms, files, testimonials, inquiries.</li>
                <li>Contract & payment data (if you buy Services): billing address, transaction info (processed by our payment provider; we do not store full card numbers).</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2 mt-4 text-white">B. Information collected automatically</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Usage/Device data: IP address, browser, device type, language, referring/exit pages, timestamps, approximate location (city/region), and page interactions.</li>
                <li>Cookies & similar tech: pixels/SDKs for analytics, performance, and marketing.</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2 mt-4 text-white">C. Information from third parties</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Partners & platforms: social platforms, analytics, advertising networks, and business partners who help us assess audience metrics and campaign performance.</li>
                <li>Public sources: publicly available social profiles and links you choose to share.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">2. How We Use Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve the Site and Services.</li>
                <li>Evaluate inquiries and prepare proposals or statements of work.</li>
                <li>Communicate with you (support, updates, marketing with your consent where required).</li>
                <li>Personalize content and measure campaign performance.</li>
                <li>Detect, prevent, and address fraud, abuse, or security incidents.</li>
                <li>Comply with legal obligations and enforce agreements.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">3. How We Disclose Information</h2>
              <p>We may disclose personal information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Service providers/Processors (hosting, analytics, email, payment, security, CRM) bound by contract to use data only on our instructions.</li>
                <li>Advertising/analytics partners (e.g., Google Analytics, Meta, TikTok) for measurement and ad attribution consistent with your settings and applicable law.</li>
                <li>Business transfers (merger, acquisition, financing, or sale of assets).</li>
                <li>Legal & safety (to comply with law, lawful requests, or protect rights, safety, and security).</li>
              </ul>
              <p className="mt-4">
                We do not sell personal information for money. Under CPRA, "share" can include cross-context behavioral advertising. We may share identifiers and internet activity with ad partners for this purpose unless you opt out.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">4. Cookies & Similar Technologies</h2>
              <p>We use:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Strictly necessary cookies (security, session, load balancing).</li>
                <li>Analytics cookies (e.g., Google Analytics 4) to understand traffic and performance.</li>
                <li>Marketing cookies/pixels to measure campaigns and show relevant ads.</li>
              </ul>
              <p className="mt-4">
                You can manage cookies via our cookie banner and your browser settings. Some features may not function without certain cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">5. Data Retention</h2>
              <p>
                We retain personal information only as long as necessary for the purposes above, including to meet legal/accounting obligations and enforce agreements. When no longer needed, we delete or de-identify data per our retention policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">6. Data Security</h2>
              <p>
                We use administrative, technical, and physical safeguards designed to protect personal information. However, no method of transmission or storage is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">7. Children's Privacy</h2>
              <p>
                Our Site and Services are intended for individuals 18+ and are not directed to children under 13. We do not knowingly collect children's data. If you believe a child provided information, contact us and we will delete it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">8. International Users</h2>
              <p>
                We are a US company. If you access the Site from outside the US, your information may be transferred to and processed in the United States and other countries. Where required, we rely on appropriate safeguards (e.g., Standard Contractual Clauses) for EEA/UK transfers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">9. Your Privacy Rights</h2>
              
              <h3 className="text-xl font-semibold mb-2 text-white">A. US State Privacy Rights</h3>
              <p>Residents of applicable US states may have rights to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Know/Access the categories and specific pieces of personal information we collected.</li>
                <li>Delete personal information.</li>
                <li>Correct inaccurate personal information.</li>
                <li>Opt out of targeted advertising, sale of personal information, and profiling.</li>
                <li>Limit use/disclosure of sensitive information.</li>
              </ul>
              <p className="mt-4">
                How to exercise: Email office@postemediallc.com. We may verify your request. You may designate an authorized agent. We will respond within the time required by law.
              </p>

              <h3 className="text-xl font-semibold mb-2 mt-6 text-white">B. EEA/UK GDPR Rights</h3>
              <p>
                Where GDPR applies, you have rights to access, rectify, erase, restrict or object to processing, and data portability. You may also withdraw consent where processing relies on consent. You have the right to lodge a complaint with a supervisory authority.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">10. Third-Party Links and Social Features</h2>
              <p>
                The Site may link to third-party sites or integrate plugins. We are not responsible for their privacy practices. Review their policies before providing information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">11. Changes to This Policy</h2>
              <p>
                We may update this Policy. Changes are effective when posted with a new "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">12. Contact Us</h2>
              <p>
                POSTE MEDIA LLC<br />
                Email: office@postemediallc.com
              </p>
              <p className="mt-4">
                If you are in the EEA/UK and wish to contact our EU/UK representative (if appointed), email us for details.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
