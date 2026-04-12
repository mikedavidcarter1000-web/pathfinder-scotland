'use client'

import Link from 'next/link'
import { useCollegesForAreas } from '@/hooks/use-colleges'
import type { Tables } from '@/types/database'

type College = Tables<'colleges'>

interface Props {
  sectorName: string
}

// Map career sector names to likely college course area terms
const SECTOR_TO_COLLEGE_AREAS: Record<string, string[]> = {
  'Healthcare': ['Health', 'Nursing', 'Care', 'Pharmacy'],
  'Engineering': ['Engineering', 'Mechanical', 'Electrical', 'Renewable'],
  'Computing and Digital': ['Computing', 'IT', 'Digital', 'Cyber', 'Software'],
  'Business and Finance': ['Business', 'Accounting', 'Finance', 'Management'],
  'Creative Industries': ['Art', 'Design', 'Creative', 'Media', 'Music', 'Drama'],
  'Construction': ['Construction', 'Built Environment', 'Plumbing', 'Electrical'],
  'Education': ['Education', 'Childcare', 'Community'],
  'Social Care': ['Social Care', 'Social Sciences', 'Community'],
  'Hospitality and Tourism': ['Hospitality', 'Tourism', 'Professional Cookery'],
  'Science': ['Science', 'Laboratory', 'Biotechnology', 'Environmental'],
  'Legal': ['Law', 'Social Sciences'],
  'Sport': ['Sport', 'Fitness', 'Health'],
  'Agriculture': ['Agriculture', 'Horticulture', 'Land-based', 'Animal Care'],
}

export function CareerCollegesSection({ sectorName }: Props) {
  // Try to match sector name to college course areas
  const matchedTerms = Object.entries(SECTOR_TO_COLLEGE_AREAS).find(
    ([key]) => sectorName.toLowerCase().includes(key.toLowerCase())
  )
  const courseTerms = matchedTerms?.[1] || [sectorName]

  const { data: colleges, isLoading } = useCollegesForAreas(courseTerms)

  if (isLoading || !colleges || colleges.length === 0) return null

  const shown = colleges.slice(0, 4)

  return (
    <div
      className="pf-card"
      style={{
        padding: '24px',
        borderLeft: '3px solid var(--pf-green-500)',
        backgroundColor: 'rgba(16, 185, 129, 0.04)',
      }}
    >
      <h3 style={{ fontSize: '1.0625rem', marginBottom: '4px', color: 'var(--pf-green-500)' }}>
        College routes into this career
      </h3>
      <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.875rem', marginBottom: '16px' }}>
        You don&apos;t have to go straight to university. These colleges offer HNC, HND,
        and apprenticeship routes — many with direct entry to university year 2 or 3.
      </p>

      <div className="space-y-3">
        {shown.map((college) => (
          <Link
            key={college.id}
            href={`/colleges/${college.id}`}
            className="flex items-center justify-between gap-3 no-underline hover:no-underline"
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'var(--pf-white)',
              transition: 'box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
          >
            <div>
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  color: 'var(--pf-grey-900)',
                  margin: 0,
                }}
              >
                {college.name}
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', margin: 0 }}>
                {college.city}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {college.has_swap && <span className="pf-badge-amber" style={{ fontSize: '0.6875rem' }}>SWAP</span>}
              <svg className="w-4 h-4" style={{ color: 'var(--pf-blue-500)' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: '12px' }}>
        <Link
          href="/colleges"
          style={{
            color: 'var(--pf-blue-700)',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '0.8125rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Browse all colleges
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
