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

export const metadata: Metadata = {
  title: 'Pathfinder Scotland - University Course Guidance',
  description: 'Discover university courses across Scotland, check your eligibility, and plan your educational journey. Designed for S3-S6 students, college students, and mature learners.',
  keywords: ['university', 'Scotland', 'courses', 'UCAS', 'higher education', 'university guidance', 'Scottish universities'],
  authors: [{ name: 'Pathfinder Scotland' }],
  openGraph: {
    title: 'Pathfinder Scotland - University Course Guidance',
    description: 'Discover university courses across Scotland, check your eligibility, and plan your educational journey.',
    url: 'https://pathfinderscot.co.uk',
    siteName: 'Pathfinder Scotland',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pathfinder Scotland',
    description: 'Your guide to Scottish university courses',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
