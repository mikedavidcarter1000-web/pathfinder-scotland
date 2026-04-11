import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore Your Options',
  description:
    'Not sure what you want to study? Pick the curricular areas you enjoy and discover the subjects and career sectors they open up.',
  alternates: { canonical: '/discover/explore' },
  openGraph: {
    title: 'Explore Your Options | Pathfinder Scotland',
    description:
      'Not sure what you want to study? Pick the curricular areas you enjoy and discover the subjects and career sectors they open up.',
    url: '/discover/explore',
    type: 'website',
  },
}

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children
}
