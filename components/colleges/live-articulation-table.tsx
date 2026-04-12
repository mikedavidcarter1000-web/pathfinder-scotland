'use client'

import Link from 'next/link'
import { useArticulationExamples } from '@/hooks/use-colleges'
import { Skeleton } from '@/components/ui/loading-skeleton'

export function LiveArticulationTable() {
  const { data: routes, isLoading, error } = useArticulationExamples(15)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} width="100%" height={44} rounded="md" />
        ))}
      </div>
    )
  }

  if (error || !routes || routes.length === 0) {
    return null // Fall back to static content in the parent
  }

  return (
    <div>
      <div
        style={{
          overflowX: 'auto',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          backgroundColor: 'var(--pf-white)',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.9375rem',
            minWidth: '720px',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: 'var(--pf-blue-50)' }}>
              <th style={thStyle}>College</th>
              <th style={thStyle}>Qualification</th>
              <th style={thStyle}>University degree</th>
              <th style={thStyle}>University</th>
              <th style={thStyle}>Entry year</th>
              <th style={thStyle}>WP?</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route, idx) => (
              <tr
                key={route.id}
                style={{
                  borderTop: idx === 0 ? 'none' : '1px solid var(--pf-grey-100)',
                }}
              >
                <td style={tdStyle}>
                  <Link
                    href={`/colleges/${route.college_id}`}
                    style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}
                  >
                    {route.college_name}
                  </Link>
                </td>
                <td style={tdStyle}>
                  <span style={{ fontWeight: 600 }}>{route.college_qualification}</span>
                  <span className="pf-badge-blue" style={{ marginLeft: '6px' }}>
                    SCQF {route.college_scqf_level}
                  </span>
                </td>
                <td style={tdStyle}>{route.university_degree}</td>
                <td style={tdStyle}>
                  <Link
                    href={`/universities/${route.university_id}`}
                    style={{ color: 'var(--pf-blue-700)' }}
                  >
                    {route.university_name}
                  </Link>
                </td>
                <td style={tdStyle}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                    Year {route.entry_year}
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  {route.is_widening_participation ? (
                    <span className="pf-badge-amber">WP</span>
                  ) : (
                    <span style={{ color: 'var(--pf-grey-300)' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p
        style={{
          fontSize: '0.8125rem',
          color: 'var(--pf-grey-600)',
          marginTop: '12px',
          fontStyle: 'italic',
        }}
      >
        These are examples from our database — see individual college pages for full route listings.
      </p>
      <div style={{ marginTop: '16px' }}>
        <Link
          href="/colleges"
          className="pf-btn-secondary inline-flex items-center gap-1"
          style={{ fontSize: '0.875rem' }}
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

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 16px',
  fontWeight: 600,
  fontSize: '0.8125rem',
  color: 'var(--pf-grey-600)',
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  color: 'var(--pf-grey-900)',
}
