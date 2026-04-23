import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Results Day 2026',
  description:
    'Enter your Qualifications Scotland exam results and instantly see which Scottish university courses you qualify for. Clearing guidance, widening access support, and next steps.',
  alternates: { canonical: '/results-day' },
  keywords: [
    'Qualifications Scotland results day 2026',
    'Scottish exam results',
    'Higher results Scotland',
    'Qualifications Scotland results checker',
    'university eligibility Scotland',
    'UCAS Clearing Scotland',
  ],
}

export default function ResultsDayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
