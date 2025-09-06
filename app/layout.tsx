import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'POSTE MEDIA LLC - Helping Influencers & Theme Pages Monetize Their Following',
  description: 'Custom strategies, proven marketing methods, real growth. We help influencers and Instagram theme pages monetize their following with tailored approaches. Located in Oakland Park, FL.',
  keywords: 'influencer marketing, Instagram monetization, theme pages, social media growth, content optimization, revenue streams, Oakland Park FL, Florida marketing agency',
  authors: [{ name: 'POSTE MEDIA LLC' }],
  creator: 'POSTE MEDIA LLC',
  publisher: 'POSTE MEDIA LLC',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://postemedia.com',
    siteName: 'POSTE MEDIA LLC',
    title: 'POSTE MEDIA LLC - Helping Influencers & Theme Pages Monetize Their Following',
    description: 'Custom strategies, proven marketing methods, real growth. We help influencers and Instagram theme pages monetize their following with tailored approaches.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'POSTE MEDIA LLC - Influencer Marketing Agency',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'POSTE MEDIA LLC - Helping Influencers & Theme Pages Monetize Their Following',
    description: 'Custom strategies, proven marketing methods, real growth. We help influencers and Instagram theme pages monetize their following with tailored approaches.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
