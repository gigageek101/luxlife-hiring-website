'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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

          <h1 className="mb-4">Terms of Service</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            Effective Date: September 6, 2025
          </p>

          <div className="prose prose-invert max-w-none space-y-8" style={{ color: 'var(--text-secondary)' }}>
            <section>
              <p className="lead">
                These Terms of Service ("Terms") govern your access to and use of postemedia.com (the "Site") and our influencer marketing and monetization services (the "Services"). By accessing the Site or using the Services, you agree to these Terms.
              </p>
              <p>
                If you are entering into these Terms on behalf of a company, you represent that you have authority to bind that company.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">1. Eligibility</h2>
              <p>
                You must be at least 18 years old and capable of forming a binding contract to use the Site or request Services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">2. Services; Proposals and SOWs</h2>
              <p>
                Descriptions on the Site are informational and non-binding. Specific Services, deliverables, timelines, and pricing are governed by a mutually executed proposal or statement of work ("SOW"). If there is a conflict, the SOW controls.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">3. Accounts & Information</h2>
              <p>
                You agree to provide accurate information and to keep it current. You are responsible for maintaining the confidentiality of any credentials and for all activity under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">4. Acceptable Use</h2>
              <p>You will not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Site/Services in violation of law or platform rules (e.g., spam, fake engagement, harassment, IP infringement).</li>
                <li>Attempt to interfere with or disrupt the Site (e.g., malware, scraping beyond robots.txt, rate-limiting circumvention).</li>
                <li>Misuse personal data obtained through the Services or violate third-party privacy rights.</li>
              </ul>
              <p className="mt-4">
                We may suspend or terminate access for violations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">5. Client Materials & Licenses</h2>
              <p>
                You grant POSTE MEDIA a non-exclusive, worldwide, royalty-free license to use your trademarks, content, and accounts solely to perform the Services and showcase results in anonymized case studies (unless your SOW prohibits publicity). You represent you own or have rights to all materials you provide and that they do not infringe third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">6. Fees & Payment</h2>
              <p>
                Fees, payment schedule, and expenses are defined in the SOW/proposal. Unless stated otherwise, invoices are due net 15. Overdue amounts may accrue 1.5% per month (or the maximum allowed by law). You are responsible for taxes, excluding our income taxes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">7. Results & Platform Risk</h2>
              <p>
                We do not guarantee specific revenue, follower growth, or campaign outcomes. Platform policies and algorithms (e.g., Instagram, TikTok) may change and are outside our control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">8. Confidentiality</h2>
              <p>
                Each party may receive non-public information from the other. The receiving party will use such information only to perform or receive the Services and will protect it with reasonable care. Exceptions apply for information that is public, independently developed, or lawfully obtained from a third party.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">9. Intellectual Property</h2>
              <p>
                Except for Client Materials, POSTE MEDIA retains all rights in the Site, methodologies, templates, software, and pre-existing IP. Subject to full payment, you receive a non-exclusive, non-transferable license to use deliverables for your internal business purposes, as specified in the SOW.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">10. Third-Party Services</h2>
              <p>
                The Services may involve third-party tools/platforms. Your use of those services is subject to their terms and policies. We are not responsible for third-party actions or changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">11. Termination</h2>
              <p>
                Either party may terminate an SOW for material breach not cured within 10 days of notice, or for convenience as stated in the SOW. Upon termination, you will pay for Services rendered and non-cancelable commitments. Sections intended to survive (including Fees, Confidentiality, IP, Disclaimers, Liability, Indemnity, Governing Law, and Dispute Resolution) survive termination.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">12. Disclaimers</h2>
              <p className="uppercase">
                THE SITE AND SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE." WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. We do not warrant uninterrupted or error-free operation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">13. Limitation of Liability</h2>
              <p className="uppercase">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, POSTE MEDIA AND ITS AFFILIATES WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL. OUR AGGREGATE LIABILITY FOR ALL CLAIMS RELATING TO THE SITE OR SERVICES WILL NOT EXCEED THE AMOUNTS YOU PAID TO POSTE MEDIA FOR THE SERVICES GIVING RISE TO THE CLAIM IN THE 12 MONTHS BEFORE THE EVENT FIRST GIVING RISE TO LIABILITY.
              </p>
              <p className="mt-4">
                Some jurisdictions do not allow certain limitations; some parts may not apply to you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">14. Indemnification</h2>
              <p>
                You will defend, indemnify, and hold harmless POSTE MEDIA and its affiliates from and against any claims, damages, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or related to: (a) Client Materials; (b) your use of the Site/Services in violation of these Terms or law; or (c) any breach of your representations or warranties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">15. DMCA / IP Complaints</h2>
              <p>
                If you believe content on the Site infringes your copyright, send a notice to our DMCA agent at office@postemediallc.com with: (i) your contact info, (ii) identification of the work and allegedly infringing material, (iii) a statement of good-faith belief, (iv) a statement under penalty of perjury that the information is accurate and you are authorized, and (v) your signature. We may remove content at our discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">16. Governing Law; Dispute Resolution</h2>
              <p>
                These Terms are governed by the laws of the State where POSTE MEDIA LLC is registered in the United States (without regard to conflicts of law).
              </p>
              <p className="mt-4">
                <strong>Arbitration:</strong> Except for small-claims matters or injunctive relief, disputes will be resolved by binding arbitration administered by JAMS under its Streamlined Rules, in the county and state of POSTE MEDIA LLC's principal place of business, in English. You and POSTE MEDIA waive class actions. Judgment on the award may be entered in any court of competent jurisdiction. You may opt out of arbitration within 30 days of first agreeing to these Terms by emailing office@postemediallc.com.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">17. Changes to the Terms</h2>
              <p>
                We may update these Terms. The "Effective Date" will be revised when changes are posted. Continued use after changes means you accept the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">18. Miscellaneous</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Entire Agreement:</strong> These Terms plus any SOW/proposal are the entire agreement.</li>
                <li><strong>Assignment:</strong> You may not assign without our prior written consent; we may assign to an affiliate or in connection with a merger, acquisition, or asset sale.</li>
                <li><strong>Severability:</strong> If any provision is unenforceable, the remainder stays in effect.</li>
                <li><strong>No Waiver:</strong> Failure to enforce is not a waiver.</li>
                <li><strong>Notices:</strong> office@postemediallc.com, unless an SOW specifies otherwise.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">19. Contact</h2>
              <p>
                POSTE MEDIA LLC<br />
                Email: office@postemediallc.com
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
