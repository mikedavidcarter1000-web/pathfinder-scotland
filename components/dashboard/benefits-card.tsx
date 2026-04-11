'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { useCurrentStudent } from '@/hooks/use-student'
import type { Tables } from '@/types/database'
import { personalisedBenefitList } from '@/app/benefits/benefit-recommendations'

type Benefit = Tables<'student_benefits'>
type Student = Tables<'students'>

const MAX_VISIBLE = 3

export function BenefitsCard() {
  const supabase = getSupabaseClient()
  const { user } = useAuth()
  const { data: student } = useCurrentStudent() as { data: Student | null | undefined }

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-benefits', user?.id],
    queryFn: async () => {
      // Top active benefits — fetch more than we need so the personalisation
      // sort has something to work with.
      const benefitsRes = await supabase
        .from('student_benefits')
        .select('*')
        .eq('is_active', true)
        .order('priority_score', { ascending: false })
        .limit(40)

      if (benefitsRes.error) throw benefitsRes.error
      const benefits = (benefitsRes.data ?? []) as Benefit[]

      // Subjects the student has recorded grades for (proxy for interest).
      let subjectNames: string[] = []
      if (user?.id) {
        const gradesRes = await supabase
          .from('student_grades')
          .select('subject_id')
          .eq('student_id', user.id)
        const subjectIds = (gradesRes.data ?? [])
          .map((g) => g.subject_id)
          .filter((v): v is string => !!v)
        if (subjectIds.length > 0) {
          const { data: subjectRows } = await supabase
            .from('subjects')
            .select('name')
            .in('id', subjectIds)
          subjectNames = (subjectRows ?? [])
            .map((s) => s.name)
            .filter((v): v is string => !!v)
        }
      }

      // Exclude benefits the student has already clicked — show the next
      // most relevant ones they haven't engaged with.
      let clickedIds = new Set<string>()
      if (user?.id) {
        const clicksRes = await supabase
          .from('benefit_clicks')
          .select('benefit_id')
          .eq('student_id', user.id)
        clickedIds = new Set(
          (clicksRes.data ?? []).map((c) => c.benefit_id).filter(Boolean)
        )
      }

      const unclicked = benefits.filter((b) => !clickedIds.has(b.id))
      const ranked = personalisedBenefitList(unclicked, student ?? null, subjectNames)
      return ranked.slice(0, MAX_VISIBLE)
    },
    enabled: !!user?.id && !!student,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading || !data || data.length === 0) return null

  return (
    <div className="pf-card">
      <div className="flex items-start gap-3 mb-3">
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: 'var(--pf-blue-100)',
            color: 'var(--pf-blue-700)',
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 6.375v11.25c0 .621-.504 1.125-1.125 1.125H4.875A1.125 1.125 0 013.75 17.625V6.375C3.75 5.754 4.254 5.25 4.875 5.25h14.25c.621 0 1.125.504 1.125 1.125z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 9.75h16.5M7.5 14.25h3"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h2 style={{ fontSize: '1.125rem', marginBottom: '2px' }}>
            Benefits you might be missing
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
            Based on your profile.
          </p>
        </div>
      </div>

      <ul className="space-y-2 mb-3">
        {data.map((b) => (
          <li key={b.id}>
            <Link
              href="/benefits"
              className="flex items-start gap-3 no-underline hover:no-underline"
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--pf-blue-50)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'var(--pf-grey-900)',
                    marginBottom: '2px',
                  }}
                >
                  {b.name}
                </p>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--pf-grey-600)',
                  }}
                >
                  {b.discount_value}
                </p>
              </div>
              <svg
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color: 'var(--pf-blue-700)' }}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/benefits"
        className="no-underline hover:no-underline"
        style={{
          color: 'var(--pf-blue-500)',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.875rem',
        }}
      >
        See all benefits →
      </Link>
    </div>
  )
}
