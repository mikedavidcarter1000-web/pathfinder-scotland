'use client'

import { hasAnyUniversityRanking, pickUniversityRankings } from '@/lib/outcomes'

interface UniversityRankingsSectionProps {
  university: unknown
}

export function UniversityRankingsSection({ university }: UniversityRankingsSectionProps) {
  const r = pickUniversityRankings(university)
  if (!hasAnyUniversityRanking(r)) return null

  const rows: Array<{ label: string; value: string }> = []
  if (r.ranking_cug !== null) {
    rows.push({
      label: 'Complete University Guide (UK)',
      value: r.ranking_cug_scotland !== null
        ? `${r.ranking_cug} (#${r.ranking_cug_scotland} in Scotland)`
        : `${r.ranking_cug}`,
    })
  }
  if (r.ranking_guardian !== null) {
    rows.push({ label: 'Guardian University Guide (UK)', value: `${r.ranking_guardian}` })
  }
  if (r.ranking_times !== null) {
    rows.push({ label: 'Times / Sunday Times (UK)', value: `${r.ranking_times}` })
  }
  if (r.graduate_employment_rate !== null) {
    rows.push({
      label: 'Graduate employment rate',
      value: `${r.graduate_employment_rate}%`,
    })
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Rankings and outcomes</h2>
      <div
        className="pf-card-flat overflow-hidden"
        style={{ backgroundColor: 'var(--pf-white)' }}
      >
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {rows.map((row, idx) => (
            <li
              key={row.label}
              className="flex justify-between items-center"
              style={{
                padding: '14px 20px',
                borderTop: idx === 0 ? 'none' : '1px solid var(--pf-grey-300)',
              }}
            >
              <span style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
                {row.label}
              </span>
              <span
                className="pf-data-number"
                style={{ fontWeight: 700, color: 'var(--pf-grey-900)', fontSize: '1rem' }}
              >
                {row.value}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)', marginTop: '12px' }}>
        Rankings from the {r.rankings_year ?? '2026'} guides. Rankings change annually and should
        be one factor among many in your decision.
      </p>
    </section>
  )
}
