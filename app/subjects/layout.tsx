import type { Metadata } from 'next'

// Subject taxonomy changes rarely — let the static shell revalidate hourly.
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Explore Qualifications Scotland Subjects',
  description:
    'Browse every Qualifications Scotland subject from National 4 to Advanced Higher. See what each subject leads to, which universities accept it, and how it fits your pathway.',
  alternates: { canonical: '/subjects' },
  openGraph: {
    title: 'Explore Qualifications Scotland Subjects | Pathfinder Scotland',
    description:
      'Browse every Qualifications Scotland subject from National 4 to Advanced Higher. See what each subject leads to, which universities accept it, and how it fits your pathway.',
    url: '/subjects',
    type: 'website',
  },
}

export default function SubjectsLayout({ children }: { children: React.ReactNode }) {
  return children
}
