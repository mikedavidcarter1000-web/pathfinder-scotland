import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Subject Combination Simulator',
  description:
    'Pick subjects and instantly see which university courses and careers they open up — and what you would miss out on. The Pathfinder Scotland simulator.',
  alternates: { canonical: '/simulator' },
  openGraph: {
    title: 'Subject Combination Simulator | Pathfinder Scotland',
    description:
      'See where your subjects lead. Pick subjects and instantly see which university courses and career sectors they open up.',
    url: '/simulator',
    type: 'website',
  },
}

export default function SimulatorLayout({ children }: { children: React.ReactNode }) {
  return children
}
