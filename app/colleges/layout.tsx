import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Scottish Colleges | Pathfinder Scotland',
  description:
    'Browse all 24 Scottish colleges. Find courses, apprenticeships, and direct routes into university through college.',
  alternates: { canonical: '/colleges' },
  openGraph: {
    title: 'Scottish Colleges | Pathfinder Scotland',
    description:
      'Browse all 24 Scottish colleges. Find courses, apprenticeships, and direct routes into university through college.',
    url: '/colleges',
    type: 'website',
  },
}

export default function CollegesLayout({ children }: { children: React.ReactNode }) {
  return children
}
