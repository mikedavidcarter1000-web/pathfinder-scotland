import type { Metadata } from 'next'

// Career sectors are essentially static reference data — refresh hourly.
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Career Sectors',
  description:
    'Explore career sectors and see which Scottish subjects, qualifications, and university courses lead there. Find your path from school to work.',
  alternates: { canonical: '/careers' },
  openGraph: {
    title: 'Career Sectors | Pathfinder Scotland',
    description:
      'Explore career sectors and see which Scottish subjects, qualifications, and university courses lead there.',
    url: '/careers',
    type: 'website',
  },
}

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children
}
