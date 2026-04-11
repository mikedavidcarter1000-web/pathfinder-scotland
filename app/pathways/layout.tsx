import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Plan Your Subject Choices',
  description:
    'Build your S3 to S6 subject pathway. See how your choices unlock university courses, meet column rules, and keep your options open.',
  alternates: { canonical: '/pathways' },
  openGraph: {
    title: 'Plan Your Subject Choices | Pathfinder Scotland',
    description:
      'Build your S3 to S6 subject pathway. See how your choices unlock university courses, meet column rules, and keep your options open.',
    url: '/pathways',
    type: 'website',
  },
}

export default function PathwaysLayout({ children }: { children: React.ReactNode }) {
  return children
}
