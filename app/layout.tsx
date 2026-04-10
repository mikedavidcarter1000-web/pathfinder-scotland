import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Footer } from '@/components/layout/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pathfinder Scotland - University Course Guidance',
  description: 'Discover university courses across Scotland, check your eligibility, and plan your educational journey. Designed for S3-S6 students, college students, and mature learners.',
  keywords: ['university', 'Scotland', 'courses', 'UCAS', 'higher education', 'university guidance', 'Scottish universities'],
  authors: [{ name: 'Pathfinder Scotland' }],
  openGraph: {
    title: 'Pathfinder Scotland - University Course Guidance',
    description: 'Discover university courses across Scotland, check your eligibility, and plan your educational journey.',
    url: 'https://pathfinder-scotland.com',
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
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
