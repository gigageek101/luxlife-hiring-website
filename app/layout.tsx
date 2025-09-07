import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Script from 'next/script'

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
  title: 'HiringPhilippines.Careers | Verified Job Opportunities in the Philippines – Join Our Discord',
  description: 'Discover verified job opportunities in the Philippines with HiringPhilippines.Careers – powered by LuxLife Association. Join our free Discord community today and connect with trusted employers.',
  keywords: 'jobs Philippines, remote work PH, verified careers Philippines, hiring community PH, join hiring Discord, Filipino job opportunities, work from home jobs Philippines, safe job postings Philippines',
  authors: [{ name: 'LuxLife Association' }],
  creator: 'LuxLife Association',
  publisher: 'HiringPhilippines.Careers',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hiringphilippines.careers',
    siteName: 'HiringPhilippines.Careers',
    title: 'HiringPhilippines.Careers | Verified Job Opportunities in the Philippines – Join Our Discord',
    description: 'Discover verified job opportunities in the Philippines with HiringPhilippines.Careers – powered by LuxLife Association. Join our free Discord community today and connect with trusted employers.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'HiringPhilippines.Careers - Verified Job Opportunities in the Philippines',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HiringPhilippines.Careers | Verified Job Opportunities in the Philippines – Join Our Discord',
    description: 'Discover verified job opportunities in the Philippines with HiringPhilippines.Careers – powered by LuxLife Association. Join our free Discord community today and connect with trusted employers.',
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
      <head>
        {/* Google Analytics - Only loads script, doesn't auto-track */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17447817661"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            // Note: We don't call gtag('config') here - only on Discord button clicks
          `}
        </Script>
      </head>
      <body className="antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
