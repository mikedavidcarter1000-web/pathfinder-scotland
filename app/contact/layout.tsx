import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with Pathfinder Scotland — for students, parents, schools, funders, and partners.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Us | Pathfinder Scotland',
    description:
      'Get in touch with Pathfinder Scotland — for students, parents, schools, funders, and partners.',
    url: '/contact',
    type: 'website',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
