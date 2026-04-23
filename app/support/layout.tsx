import type { Metadata } from 'next'
import { FeedbackWidget } from '@/components/ui/feedback-widget'

export const metadata: Metadata = {
  title: 'Support',
  description:
    'Specialist support and guidance for Scottish students in every situation.',
  alternates: { canonical: '/support' },
}

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FeedbackWidget />
    </>
  )
}
