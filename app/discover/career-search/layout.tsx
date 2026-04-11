import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find My Subjects',
  description:
    'Start from a career or degree and see which subjects you need. Reverse lookup from careers to school subjects and Scottish university courses.',
  alternates: { canonical: '/discover/career-search' },
  openGraph: {
    title: 'Find My Subjects | Pathfinder Scotland',
    description:
      'Start from a career or degree and see which subjects you need. Reverse lookup from careers to school subjects and Scottish university courses.',
    url: '/discover/career-search',
    type: 'website',
  },
}

export default function CareerSearchLayout({ children }: { children: React.ReactNode }) {
  return children
}
