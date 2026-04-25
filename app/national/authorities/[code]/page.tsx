// Authority-16: per-LA detail view, surfaced from the national dashboard.
// Read-only summary -- national staff cannot drill into school-level data
// from here (that requires LA-level access).

import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getNationalStaffContext } from '@/lib/national/auth'
import { getAdminClient } from '@/lib/admin-auth'
import { parseNationalFilters } from '@/lib/national/filters'
import { loadOptedInAuthorities, getAuthorityDetail } from '@/lib/national/queries'
import { formatCohortValue } from '@/lib/authority/disclosure'

export const dynamic = 'force-dynamic'

export default async function NationalAuthorityDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { code: codeRaw } = await params
  const code = decodeURIComponent(codeRaw)
  const sp = await searchParams

  const ctx = await getNationalStaffContext()
  if (!ctx) redirect(`/auth/sign-in?redirect=/national/authorities/${encodeURIComponent(code)}`)

  const admin = getAdminClient()
  if (!admin) return <p style={{ padding: '32px' }}>Service unavailable.</p>

  const filters = parseNationalFilters(sp)
  const authorities = await loadOptedInAuthorities(admin)
  const detail = await getAuthorityDetail(admin, code, authorities, filters)

  if (!detail) notFound()

  const { authority, scorecard, national_average, top_subjects } = detail

  const compareDelta = (la: number | null, nat: number | null): { value: string; tone: 'pos' | 'neg' | 'neutral' } => {
    if (la == null || nat == null) return { value: '—', tone: 'neutral' }
    const diff = Math.round((la - nat) * 10) / 10
    return {
      value: `${diff > 0 ? '+' : ''}${diff.toFixed(1)} pp`,
      tone: diff > 0 ? 'pos' : diff < 0 ? 'neg' : 'neutral',
    }
  }

  const activeDelta = compareDelta(scorecard?.active_pct_30d ?? null, national_average.active_pct_30d)
  const q1Delta = compareDelta(scorecard?.simd_q1_pct ?? null, national_average.simd_q1_pct)

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div className="pf-container" style={{ padding: '40px 16px', maxWidth: '960px' }}>
        <Link
          href="/national/dashboard"
          style={{ color: '#1d4ed8', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-block', marginBottom: '16px' }}
        >
          ← Back to national dashboard
        </Link>

        <header style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#1a1a2e',
                margin: 0,
              }}
            >
              {authority.name}
            </h1>
            {authority.is_challenge_authority && (
              <span
                style={{
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Challenge Authority
              </span>
            )}
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>· {authority.urban_rural}</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '8px' }}>
            Code: {authority.code} · {authority.school_count} school{authority.school_count === 1 ? '' : 's'} on Pathfinder
          </p>
        </header>

        <section
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            marginBottom: '24px',
          }}
        >
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1rem',
              fontWeight: 700,
              color: '#1a1a2e',
              margin: '0 0 16px',
            }}
          >
            Headline metrics vs national average
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <Stat
              label="Students"
              value={scorecard?.student_count == null ? '—' : formatCohortValue(scorecard.student_count)}
            />
            <Stat
              label="Active 30d"
              value={scorecard?.active_pct_30d == null ? '—' : `${scorecard.active_pct_30d.toFixed(1)}%`}
              delta={activeDelta}
              natValue={national_average.active_pct_30d == null ? '—' : `${national_average.active_pct_30d.toFixed(1)}%`}
            />
            <Stat
              label="SIMD Q1 share"
              value={scorecard?.simd_q1_pct == null ? '—' : `${scorecard.simd_q1_pct.toFixed(1)}%`}
              delta={q1Delta}
              natValue={national_average.simd_q1_pct == null ? '—' : `${national_average.simd_q1_pct.toFixed(1)}%`}
            />
          </div>
        </section>

        <section
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            marginBottom: '24px',
          }}
        >
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1rem',
              fontWeight: 700,
              color: '#1a1a2e',
              margin: '0 0 16px',
            }}
          >
            Top subjects
          </h2>
          {top_subjects.length === 0 ? (
            <p style={{ color: '#64748b', fontStyle: 'italic' }}>Not enough subject data to display.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {top_subjects.map((s) => (
                <li
                  key={s.subject_name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <span>{s.subject_name}</span>
                  <span style={{ color: '#475569', fontWeight: 600 }}>{formatCohortValue(s.student_count)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>
          National staff see aggregate LA metrics only. Drilling into individual schools requires LA-level access via the authority portal.
        </p>
      </div>
    </main>
  )
}

function Stat({
  label,
  value,
  delta,
  natValue,
}: {
  label: string
  value: string
  delta?: { value: string; tone: 'pos' | 'neg' | 'neutral' }
  natValue?: string
}) {
  const colour = delta?.tone === 'pos' ? '#166534' : delta?.tone === 'neg' ? '#991b1b' : '#64748b'
  return (
    <div>
      <p style={{ color: '#94a3b8', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, fontWeight: 600 }}>
        {label}
      </p>
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e', margin: '6px 0 0' }}>
        {value}
      </p>
      {delta && (
        <p style={{ fontSize: '0.75rem', color: colour, fontWeight: 600, margin: '4px 0 0' }}>
          {delta.value} vs national {natValue ? `(${natValue})` : ''}
        </p>
      )}
    </div>
  )
}
