import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Results Day 2026 | Pathfinder Scotland',
  description:
    'Enter your SQA exam results and instantly see which Scottish university courses you qualify for. Clearing guidance, widening access support, and next steps.',
  keywords: [
    'SQA results day 2026',
    'Scottish exam results',
    'Higher results Scotland',
    'SQA results checker',
    'university eligibility Scotland',
    'UCAS Clearing Scotland',
  ],
}

export default function ResultsDayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
