import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search',
  description:
    'Search Pathfinder Scotland for subjects, courses, universities, and careers.',
  alternates: { canonical: '/search' },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
