import type { Metadata } from 'next'
import { FeedbackWidget } from '@/components/ui/feedback-widget'

export const metadata: Metadata = {
  title: 'Support – Pathfinder Scotland',
  description:
    'Specialist support and guidance for Scottish students in every situation.',
}

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FeedbackWidget />
    </>
  )
}
