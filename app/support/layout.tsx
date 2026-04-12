import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support – Pathfinder Scotland',
  description:
    'Specialist support and guidance for Scottish students in every situation.',
}

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
