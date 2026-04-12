'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

interface SupportGroupCardProps {
  title: string
  description: string
  href: string
  icon?: string | ReactNode
  highlighted?: boolean
}

export function SupportGroupCard({
  title,
  description,
  href,
  icon,
  highlighted = false,
}: SupportGroupCardProps) {
  return (
    <Link
      href={href}
      className="pf-card pf-card-hover no-underline hover:no-underline flex flex-col"
      style={{
        gap: '12px',
        backgroundColor: highlighted ? 'var(--pf-blue-50)' : 'var(--pf-white)',
        borderLeft: highlighted
          ? '3px solid var(--pf-blue-500)'
          : '3px solid transparent',
      }}
    >
      {icon !== undefined && (
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: highlighted ? 'var(--pf-blue-100)' : 'var(--pf-grey-100)',
            color: highlighted ? 'var(--pf-blue-700)' : 'var(--pf-grey-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: typeof icon === 'string' ? '1.25rem' : undefined,
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      <div className="flex-1">
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '1rem',
            color: 'var(--pf-grey-900)',
            marginBottom: '4px',
          }}
        >
          {title}
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', lineHeight: 1.5 }}>
          {description}
        </p>
      </div>

      {highlighted && (
        <span
          className="pf-badge-blue"
          style={{ alignSelf: 'flex-start', fontSize: '0.75rem' }}
        >
          Relevant for you
        </span>
      )}
    </Link>
  )
}
