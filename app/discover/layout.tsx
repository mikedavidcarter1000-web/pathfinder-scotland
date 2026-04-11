import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Discover Your Path',
  description:
    'Explore careers, subjects, and university courses across Scotland. Whether you know what you want or you&apos;re still figuring it out, Pathfinder helps you find the right path.',
  alternates: { canonical: '/discover' },
  openGraph: {
    title: 'Discover Your Path | Pathfinder Scotland',
    description:
      'Explore careers, subjects, and university courses across Scotland. Whether you know what you want or you&apos;re still figuring it out, Pathfinder helps you find the right path.',
    url: '/discover',
    type: 'website',
  },
}

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return children
}
