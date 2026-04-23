'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import type { LinkedChild } from '@/hooks/use-parent-link'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { getSupabaseClient } from '@/lib/supabase'

interface BursaryMatch {
  id: string
  name: string
  administering_body: string
  amount_description: string | null
  award_type: string
  is_repayable: boolean
  url: string | null
}

interface MatchResponse {
  matches: BursaryMatch[]
  income_band: string | null
  simd_decile: number | null
  school_stage: string | null
}

const SAAS_COPY: Record<string, { bursary: string; loan: string }> = {
  under_21000: {
    bursary: 'Your child could receive a bursary of up to £2,000 per year (non-repayable)',
    loan: 'plus a student loan of up to £9,400 per year.',
  },
  '21000_24000': {
    bursary: 'Your child could receive a bursary of up to £1,125 per year (non-repayable)',
    loan: 'plus a student loan of up to £9,400 per year.',
  },
  '24000_34000': {
    bursary: 'Your child could receive a bursary of up to £500 per year (non-repayable)',
    loan: 'plus a student loan of up to £9,400 per year.',
  },
  '34000_45000': {
    bursary: 'Your child is eligible for',
    loan: 'a student loan of up to £8,400 per year.',
  },
  over_45000: {
    bursary: 'Your child is eligible for',
    loan: 'a student loan of up to £8,400 per year.',
  },
}

export function ParentFundingCard({ child }: { child: LinkedChild }) {
  const supabase = getSupabaseClient()
  const { data, isLoading } = useQuery({
    queryKey: ['parent-bursary-match', child.student_id],
    queryFn: async (): Promise<MatchResponse> => {
      const res = await fetch(
        `/api/parent/bursary-match?student_id=${encodeURIComponent(child.student_id)}`
      )
      if (!res.ok) throw new Error('Failed to load funding information')
      return res.json()
    },
  })

  // Pull salary_median_3yr off the child's saved courses so the ROI callout
  // can quote a real range instead of a generic national figure.
  const { data: savedSalaryRange } = useQuery({
    queryKey: ['parent-saved-salary-range', child.student_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_courses')
        .select('course:courses(salary_median_3yr)')
        .eq('student_id', child.student_id)
      if (error) throw error
      type Row = { course: { salary_median_3yr: number | null } | null }
      const values = ((data as unknown as Row[]) || [])
        .map((r) => r.course?.salary_median_3yr ?? null)
        .filter((v): v is number => typeof v === 'number')
      if (values.length === 0) return null
      return { min: Math.min(...values), max: Math.max(...values) }
    },
  })

  const incomeBand = data?.income_band
  const saasCopy = incomeBand && SAAS_COPY[incomeBand] ? SAAS_COPY[incomeBand] : null
  const grantMatches = (data?.matches ?? []).filter((m) => !m.is_repayable)
  const loanMatches = (data?.matches ?? []).filter((m) => m.is_repayable)

  // Sum of named minimums where available (rough indicative only)
  const estimatedMin = (data?.matches ?? []).reduce((acc, m) => {
    // amount parsing is best-effort; many rows use description-only amounts
    const desc = m.amount_description ?? ''
    const match = desc.match(/£\s*([0-9,]+)/)
    if (match) {
      const val = Number(match[1].replace(/,/g, ''))
      if (!Number.isNaN(val) && val < 20000) return acc + val
    }
    return acc
  }, 0)

  return (
    <section className="pf-card" aria-labelledby="parent-funding-heading">
      <h2 id="parent-funding-heading" style={{ marginBottom: '4px' }}>
        Funding {child.first_name ? `${child.first_name}` : 'your child'} could receive
      </h2>
      <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.875rem', marginBottom: '14px' }}>
        Indicative only. Final amounts depend on SAAS assessment and individual scheme rules.
      </p>

      {/* Always-shown tuition banner */}
      <div
        className="rounded-lg mb-4"
        style={{
          padding: '12px 14px',
          backgroundColor: 'var(--pf-green-50, #ecfdf5)',
          border: '1px solid var(--pf-green-200, #a7f3d0)',
          fontSize: '0.875rem',
        }}
      >
        <strong>Tuition is free for Scottish students at Scottish universities.</strong>{' '}
        SAAS pays the fees directly to the university. There is nothing to repay on tuition.
      </div>

      {isLoading ? (
        <Skeleton variant="text" lines={3} />
      ) : (
        <>
          {saasCopy ? (
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '0.9375rem', marginBottom: '6px' }}>
                SAAS living-cost support
              </h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-900)', margin: 0 }}>
                {saasCopy.bursary} {saasCopy.loan}
              </p>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--pf-grey-600)',
                  marginTop: '4px',
                }}
              >
                Loans are repayable from a minimum salary threshold (Scotland: Plan 4).
              </p>
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginBottom: '16px' }}>
              Household income hasn&apos;t been entered yet. Your child can add it from their
              funding profile to see an estimated SAAS figure.
            </p>
          )}

          {grantMatches.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <h3 style={{ fontSize: '0.9375rem', marginBottom: '8px' }}>
                Named grants and bursaries your child may qualify for
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {grantMatches.slice(0, 10).map((m) => (
                  <li
                    key={m.id}
                    style={{
                      padding: '8px 0',
                      borderTop: '1px solid var(--pf-grey-100)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <p style={{ fontWeight: 600, margin: 0 }}>{m.name}</p>
                    <p style={{ color: 'var(--pf-grey-600)', margin: 0 }}>
                      {m.administering_body}
                      {m.amount_description ? ` — ${m.amount_description}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {loanMatches.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <h3 style={{ fontSize: '0.9375rem', marginBottom: '8px' }}>
                Loans and repayable support available
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {loanMatches.slice(0, 6).map((m) => (
                  <li
                    key={m.id}
                    style={{
                      padding: '8px 0',
                      borderTop: '1px solid var(--pf-grey-100)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <p style={{ fontWeight: 600, margin: 0 }}>{m.name}</p>
                    <p style={{ color: 'var(--pf-grey-600)', margin: 0 }}>
                      {m.administering_body}
                      {m.amount_description ? ` — ${m.amount_description}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {estimatedMin > 0 && (
            <p
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: 'var(--pf-blue-900)',
                fontFamily: "'Space Grotesk', sans-serif",
                marginTop: '12px',
              }}
            >
              Estimated annual named support: £{estimatedMin.toLocaleString('en-GB')}+
            </p>
          )}

          {(() => {
            let roiText: string
            if (savedSalaryRange) {
              const minK = Math.round(savedSalaryRange.min / 1000)
              const maxK = Math.round(savedSalaryRange.max / 1000)
              roiText =
                minK === maxK
                  ? `Graduates from Scottish universities have among the highest employment rates in the UK, and your child's tuition is free. The typical graduate salary 3 years after finishing one of their saved courses is around £${minK},000.`
                  : `Graduates from Scottish universities have among the highest employment rates in the UK, and your child's tuition is free. The typical graduate salary 3 years after finishing is £${minK},000 to £${maxK},000 across their saved courses.`
            } else {
              roiText =
                "Graduates from Scottish universities have among the highest employment rates in the UK, and your child's tuition is free. The median graduate salary in Scotland is around £28,000 three years after graduation."
            }
            return (
              <div
                className="rounded-lg"
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'var(--pf-blue-50)',
                  border: '1px solid var(--pf-blue-100)',
                  marginTop: '14px',
                }}
              >
                <p
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    color: 'var(--pf-blue-700)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    margin: 0,
                    marginBottom: '4px',
                  }}
                >
                  Return on investment
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-900)', margin: 0 }}>
                  {roiText}
                </p>
              </div>
            )
          })()}

          <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginTop: '12px' }}>
            <Link href="/blog/saas-funding-application-guide-scotland" style={{ color: 'var(--pf-blue-700)' }}>
              Read the SAAS application guide →
            </Link>
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginTop: '4px' }}>
            <Link href="/tools/living-costs" style={{ color: 'var(--pf-blue-700)' }}>
              See how far your child&apos;s funding goes at different universities →
            </Link>
          </p>
        </>
      )}
    </section>
  )
}
