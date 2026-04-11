import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'For Parents and Carers',
  description:
    'Pathfinder gives parents and carers in Scotland the information they need to support their child through subject choices, university applications, and widening access.',
  alternates: { canonical: '/parents' },
  openGraph: {
    title: 'For Parents and Carers | Pathfinder Scotland',
    description:
      'Plain-language guide to Scottish subject choices, widening access, and university applications — for parents and carers.',
    url: '/parents',
    type: 'website',
  },
}

export default function ParentsLayout({ children }: { children: React.ReactNode }) {
  return children
}
