import type { Metadata } from 'next'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import './globals.css'
import { Providers } from './providers'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { CookieConsent } from '@/components/ui/cookie-consent'

const SITE_URL = 'https://pathfinder-scotland.vercel.app'
const SITE_NAME = 'Pathfinder Scotland'
const SITE_DESCRIPTION =
  'Free guidance for Scottish students. Plan your SQA subject choices from S3 to S6, check university entry requirements, and discover widening access support.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Pathfinder Scotland | Subject Choices to University Pathways',
    template: '%s | Pathfinder Scotland',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'Scottish subjects',
    'SQA',
    'Highers',
    'Advanced Highers',
    'university entry requirements',
    'widening access',
    'SIMD',
    'course choices',
    'Scottish education',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Pathfinder Scotland | Subject Choices to University Pathways',
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pathfinder Scotland | Subject Choices to University Pathways',
    description: SITE_DESCRIPTION,
    creator: '@pathfinderscot',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: 'EducationApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'GBP',
    description: 'Freemium model — free core access with optional Student and Pro subscriptions',
  },
  inLanguage: 'en-GB',
  audience: {
    '@type': 'EducationalAudience',
    educationalRole: 'student',
  },
}

const organisationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  description: 'Guidance platform for Scottish secondary school students',
  url: SITE_URL,
  areaServed: {
    '@type': 'Country',
    name: 'Scotland',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationSchema) }}
        />
      </head>
      <body>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
          <CookieConsent />
        </Providers>
      </body>
    </html>
  )
}
