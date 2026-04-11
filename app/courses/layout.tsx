import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'University Courses in Scotland',
  description:
    'Search thousands of undergraduate courses at Scottish universities. Check entry requirements, widening access offers, and eligibility against your grades.',
  alternates: { canonical: '/courses' },
  openGraph: {
    title: 'University Courses in Scotland | Pathfinder Scotland',
    description:
      'Search thousands of undergraduate courses at Scottish universities. Check entry requirements, widening access offers, and eligibility against your grades.',
    url: '/courses',
    type: 'website',
  },
}

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return children
}
