'use client'

import { useCallback, useMemo, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthorityBarChart } from '@/components/authority/charts/AuthorityBarChart'
import { formatCohortValue } from '@/lib/authority/disclosure'

const METRICS = [
  { key: 'students', label: 'Total students', formatter: (v: number | null) => (v == null ? '—' : formatCohortValue(v)), unit: '' },
  { key: 'active_pct', label: 'Active in last 30 days', formatter: (v: number | null) => (v == null ? '—' : `${v.toFixed(1)}%`), unit: '%' },
  { key: 'simd_q1_pct', label: 'SIMD Q1 share', formatter: (v: number | null) => (v == null ? '—' : `${v.toFixed(1)}%`), unit: '%' },
] as const

type MetricKey = (typeof METRICS)[number]['key']

const CHALLENGE_PRESET = (authorities: Array<{ code: string; is_challenge_authority: boolean }>) =>
  authorities.filter((a) => a.is_challenge_authority).map((a) => a.code)

export interface CompareBuilderClientProps {
  authorities: Array<{ code: string; name: string; is_challenge_authority: boolean }>
  selectedCodes: string[]
  selectedMetrics: MetricKey[]
  includeNational: boolean
  scorecards: Array<{
    authority_code: string
    authority_name: string
    is_challenge_authority: boolean
    student_count: number | null
    active_pct_30d: number | null
    simd_q1_pct: number | null
  }>
  nationalAverage: {
    students: number | null
    active_pct_30d: number | null
    simd_q1_pct: number | null
  }
}

export function CompareBuilderClient({
  authorities,
  selectedCodes,
  selectedMetrics,
  includeNational,
  scorecards,
  nationalAverage,
}: CompareBuilderClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updateUrl = useCallback(
    (codes: string[], metrics: MetricKey[], national: boolean) => {
      const sp = new URLSearchParams(searchParams.toString())
      if (codes.length > 0) sp.set('compare', codes.join(','))
      else sp.delete('compare')
      if (metrics.length > 0) sp.set('metrics', metrics.join(','))
      else sp.delete('metrics')
      if (national) sp.set('national', '1')
      else sp.delete('national')
      const qs = sp.toString()
      startTransition(() => {
        router.replace(qs ? `?${qs}` : '?', { scroll: false })
      })
    },
    [router, searchParams],
  )

  const onToggleAuthority = (code: string, checked: boolean) => {
    let next = checked ? Array.from(new Set([...selectedCodes, code])) : selectedCodes.filter((c) => c !== code)
    next = next.slice(0, 5)
    updateUrl(next, selectedMetrics, includeNational)
  }

  const onToggleMetric = (key: MetricKey, checked: boolean) => {
    const next = checked ? Array.from(new Set([...selectedMetrics, key])) : selectedMetrics.filter((m) => m !== key)
    updateUrl(selectedCodes, next, includeNational)
  }

  const onChallengePreset = () => {
    const codes = CHALLENGE_PRESET(authorities).slice(0, 5)
    // The preset can be > 5; we keep the first 5 to honour the cap.
    updateUrl(codes, selectedMetrics, includeNational)
  }

  const onClear = () => updateUrl([], selectedMetrics, false)

  const showCharts = scorecards.length >= 2

  const cards = useMemo(
    () =>
      selectedMetrics.map((mKey) => {
        const m = METRICS.find((x) => x.key === mKey)!
        const data = scorecards.map((s) => {
          const value =
            mKey === 'students' ? s.student_count :
            mKey === 'active_pct' ? s.active_pct_30d :
            s.simd_q1_pct
          return {
            label: s.authority_name + (s.is_challenge_authority ? ' ★' : ''),
            value: value ?? 0,
            secondary: m.formatter(value),
          }
        })
        const natValue =
          mKey === 'students' ? nationalAverage.students :
          mKey === 'active_pct' ? nationalAverage.active_pct_30d :
          nationalAverage.simd_q1_pct
        const dataWithNational = includeNational && natValue != null
          ? [...data, { label: 'National average', value: natValue, secondary: m.formatter(natValue), colour: '#94a3b8' }]
          : data
        return { metric: m, data: dataWithNational }
      }),
    [selectedMetrics, scorecards, includeNational, nationalAverage],
  )

  return (
    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <section
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 16px' }}>
          1. Select 2-5 local authorities
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
          <button
            type="button"
            onClick={onChallengePreset}
            style={{
              padding: '8px 14px',
              border: '1px solid #1d4ed8',
              backgroundColor: '#1d4ed8',
              color: '#fff',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Load Challenge Authorities (first 5)
          </button>
          <button
            type="button"
            onClick={onClear}
            style={{
              padding: '8px 14px',
              border: '1px solid #d1d5db',
              backgroundColor: '#fff',
              color: '#475569',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Clear selection
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
          {authorities.map((a) => {
            const checked = selectedCodes.includes(a.code)
            const disabled = !checked && selectedCodes.length >= 5
            return (
              <label
                key={a.code}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  backgroundColor: checked ? '#eff6ff' : 'transparent',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.4 : 1,
                  fontSize: '0.875rem',
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={(e) => onToggleAuthority(a.code, e.target.checked)}
                />
                <span>{a.name}</span>
                {a.is_challenge_authority && <span style={{ color: '#1d4ed8', fontSize: '0.6875rem', fontWeight: 600 }}>★</span>}
              </label>
            )
          })}
        </div>
      </section>

      <section
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 16px' }}>
          2. Choose metrics to compare
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {METRICS.map((m) => {
            const checked = selectedMetrics.includes(m.key)
            return (
              <label
                key={m.key}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  backgroundColor: checked ? '#eff6ff' : '#fff',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => onToggleMetric(m.key, e.target.checked)}
                />
                {m.label}
              </label>
            )
          })}
        </div>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '14px', fontSize: '0.875rem' }}>
          <input
            type="checkbox"
            checked={includeNational}
            onChange={(e) => updateUrl(selectedCodes, selectedMetrics, e.target.checked)}
          />
          Include national average as a reference bar
        </label>
      </section>

      <section
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 16px' }}>
          3. Side-by-side comparison
        </h2>
        {!showCharts ? (
          <p style={{ color: '#64748b', fontStyle: 'italic' }}>
            {selectedCodes.length === 0
              ? 'Select at least two authorities above to render a comparison.'
              : selectedCodes.length === 1
                ? 'Select at least one more authority — comparisons need a minimum of two.'
                : 'No data returned for the selected authorities under the current dashboard filters.'}
            {isPending && <span style={{ marginLeft: '8px' }}>Updating…</span>}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {cards.map(({ metric, data }) => (
              <div key={metric.key}>
                <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1a1a2e', margin: '0 0 8px', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {metric.label}
                </h3>
                <AuthorityBarChart data={data} emptyMessage="No data for this metric." />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
