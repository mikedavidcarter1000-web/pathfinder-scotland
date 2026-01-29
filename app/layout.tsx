import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

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
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
