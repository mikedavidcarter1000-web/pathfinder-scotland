'use client'

import Link from 'next/link'
import { useWideningAccessEligibility, useCurrentStudent } from '@/hooks/use-student'
import { SIMD_DESCRIPTIONS } from '@/lib/constants'
import { findShepByPostcode } from '@/lib/shep'
import type { Tables } from '@/types/database'

type Student = Tables<'students'>

interface CriterionRow {
  key: string
  label: string
  detail: string
}

export function WideningAccessCard() {
  const { data: student } = useCurrentStudent() as { data: Student | null | undefined }
  const wideningAccess = useWideningAccessEligibility()

  if (!wideningAccess?.isEligible || !student) return null

  const shep = findShepByPostcode(student.postcode ?? null)

  const rows: CriterionRow[] = []

  if (wideningAccess.isSIMD20 && student.simd_decile) {
    rows.push({
      key: 'simd20',
      label: 'SIMD20',
      detail: `${SIMD_DESCRIPTIONS[student.simd_decile as keyof typeof SIMD_DESCRIPTIONS]} (decile ${student.simd_decile})`,
    })
  } else if (wideningAccess.isSIMD40 && student.simd_decile) {
    rows.push({
      key: 'simd40',
      label: 'SIMD40',
      detail: `${SIMD_DESCRIPTIONS[student.simd_decile as keyof typeof SIMD_DESCRIPTIONS]} (decile ${student.simd_decile})`,
    })
  }

  if (wideningAccess.hasCareExperience) {
    rows.push({
      key: 'care',
      label: 'Care experienced',
      detail: 'You have experience of being in care at some point',
    })
  }

  if (wideningAccess.isYoungCarer) {
    rows.push({
      key: 'carer',
      label: 'Young carer',
      detail: 'You provide unpaid care for a family member',
    })
  }

  if (wideningAccess.isFirstGeneration) {
    rows.push({
      key: 'first-gen',
      label: 'First generation',
      detail: 'You would be the first in your immediate family at university',
    })
  }

  return (
    <section
      className="rounded-lg p-5 sm:p-6"
      style={{
        backgroundColor: 'var(--pf-white)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        borderLeft: '4px solid var(--pf-amber-500)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
      }}
      aria-labelledby="wa-card-title"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className="flex-shrink-0 rounded-full flex items-center justify-center"
          style={{
            width: '44px',
            height: '44px',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            color: 'var(--pf-amber-500)',
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <h2
            id="wa-card-title"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: 'clamp(1.0625rem, 3vw, 1.25rem)',
              color: 'var(--pf-grey-900)',
              margin: 0,
              marginBottom: '6px',
              lineHeight: 1.3,
            }}
          >
            You may qualify for reduced entry requirements
          </h2>
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--pf-grey-600)',
              lineHeight: 1.6,
              margin: 0,
              marginBottom: '16px',
            }}
          >
            Many Scottish universities offer lower grade requirements for students with your
            background. We&apos;ve highlighted adjusted offers throughout the platform.
          </p>

          <div className="space-y-2 mb-4">
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--pf-grey-600)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                margin: 0,
              }}
            >
              Criteria you meet
            </p>
            <ul
              className="space-y-2"
              style={{ listStyle: 'none', padding: 0, margin: 0 }}
            >
              {rows.map((row) => (
                <li key={row.key} className="flex items-start gap-3">
                  <span
                    className="pf-badge-amber flex-shrink-0"
                    style={{ marginTop: '2px' }}
                  >
                    {row.label}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--pf-grey-900)', lineHeight: 1.5 }}>
                    {row.detail}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {shep && (
            <div
              className="rounded-lg mb-4"
              style={{
                padding: '14px 16px',
                backgroundColor: 'var(--pf-blue-50)',
                border: '1px solid var(--pf-blue-100)',
                borderLeft: '3px solid var(--pf-blue-700)',
              }}
            >
              <p
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: 'var(--pf-blue-700)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  margin: 0,
                  marginBottom: '4px',
                }}
              >
                Your SHEP region
              </p>
              <p
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: 'var(--pf-grey-900)',
                  margin: 0,
                  marginBottom: '4px',
                }}
              >
                {shep.name} — {shep.region}
              </p>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--pf-grey-600)',
                  margin: 0,
                  marginBottom: '10px',
                  lineHeight: 1.55,
                }}
              >
                Participation itself can trigger reduced offers at Scottish universities.
              </p>
              <a
                href={shep.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1"
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--pf-blue-700)',
                  fontWeight: 600,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Register with {shep.name} to strengthen your university applications
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/widening-access"
              className="pf-btn-secondary pf-btn-sm"
              style={{
                borderColor: 'var(--pf-amber-500)',
                color: 'var(--pf-amber-500)',
              }}
            >
              Learn about each scheme
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/courses?eligibility=eligible_via_wa"
              className="pf-btn-ghost pf-btn-sm"
              style={{ color: 'var(--pf-blue-700)' }}
            >
              Browse matching courses
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
