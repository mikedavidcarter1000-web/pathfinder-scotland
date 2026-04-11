import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore SQA Subjects',
  description:
    'Browse every SQA subject from National 4 to Advanced Higher. See what each subject leads to, which universities accept it, and how it fits your pathway.',
  alternates: { canonical: '/subjects' },
  openGraph: {
    title: 'Explore SQA Subjects | Pathfinder Scotland',
    description:
      'Browse every SQA subject from National 4 to Advanced Higher. See what each subject leads to, which universities accept it, and how it fits your pathway.',
    url: '/subjects',
    type: 'website',
  },
}

export default function SubjectsLayout({ children }: { children: React.ReactNode }) {
  return children
}
