import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Subject Choice Worksheet',
  description:
    'Plan your subject choices with this interactive worksheet. See which university courses and careers each combination opens up. Designed for S3, S4, S5, and S6 students in Scotland.',
  alternates: { canonical: '/tools/subject-choice-worksheet' },
  keywords: [
    'subject choice worksheet Scotland',
    'S3 S4 S5 S6 subject choices',
    'National 5 Higher Advanced Higher planning',
    'Scottish curriculum planner',
  ],
}

export default function SubjectChoiceWorksheetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
