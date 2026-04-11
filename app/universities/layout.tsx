import type { Metadata } from 'next'

// Universities catalogue is essentially static — refresh the shell hourly.
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Scottish Universities',
  description:
    'Explore all 15 Scottish universities. Compare locations, course catalogues, widening access programmes, and typical entry requirements.',
  alternates: { canonical: '/universities' },
  openGraph: {
    title: 'Scottish Universities | Pathfinder Scotland',
    description:
      'Explore all 15 Scottish universities. Compare locations, course catalogues, widening access programmes, and typical entry requirements.',
    url: '/universities',
    type: 'website',
  },
}

export default function UniversitiesLayout({ children }: { children: React.ReactNode }) {
  return children
}
