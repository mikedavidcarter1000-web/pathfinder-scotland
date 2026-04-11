import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Guides & Articles',
  description:
    'Expert guidance on Scottish subject choices, university pathways, widening access, and careers — written for students, parents, and guidance teachers.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Guides & Articles | Pathfinder Scotland',
    description:
      'Expert guidance on Scottish subject choices, university pathways, widening access, and careers.',
    url: '/blog',
    type: 'website',
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
