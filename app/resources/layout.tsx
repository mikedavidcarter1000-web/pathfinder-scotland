import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resources & Useful Links',
  description:
    'A curated directory of trusted Scottish education, careers, widening access, and student support organisations. Links to SQA, SAAS, UCAS, My World of Work, LEAPS, FOCUS West, and more.',
  alternates: { canonical: '/resources' },
  openGraph: {
    title: 'Resources & Useful Links | Pathfinder Scotland',
    description:
      'A curated directory of trusted Scottish education, careers, widening access, and student support organisations.',
    url: '/resources',
    type: 'website',
  },
}

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
