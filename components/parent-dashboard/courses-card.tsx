'use client'

import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import type { LinkedChild } from '@/hooks/use-parent-link'
import { Skeleton } from '@/components/ui/loading-skeleton'

interface SavedCourseRow {
  id: string
  course_id: string
  course: {
    id: string
    name: string
    entry_requirements: Record<string, unknown> | null
    widening_access_requirements: Record<string, unknown> | null
    course_url: string | null
    university: { name: string } | null
  } | null
}

interface StudentGrade {
  id: string
  subject: string
  grade: string
  qualification_type: string
  predicted: boolean | null
}

const HIGHER_GRADE_ORDER = ['A', 'B', 'C', 'D', 'NA']

function parseGradeList(raw: unknown): string | null {
  // entry_requirements typically looks like { highers: "AABB", ucas_points: 120 }
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  if (typeof obj.highers === 'string') return obj.highers
  if (typeof obj.standard === 'string') return obj.standard
  if (typeof obj.typical === 'string') return obj.typical
  return null
}

function parseContextualOffer(
  raw: unknown,
  simdDecile: number | null
): { label: string; grades: string } | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  if (simdDecile !== null && simdDecile <= 2 && typeof obj.simd20_offer === 'string') {
    return { label: 'Contextual offer (SIMD20)', grades: obj.simd20_offer }
  }
  if (simdDecile !== null && simdDecile <= 4 && typeof obj.simd40_offer === 'string') {
    return { label: 'Contextual offer (SIMD40)', grades: obj.simd40_offer }
  }
  if (typeof obj.contextual_offer === 'string') {
    return { label: 'Contextual offer', grades: obj.contextual_offer as string }
  }
  return null
}

// Very rough comparison of two Higher grade strings like "AABB" vs "ABBB".
// Returns 'green' | 'amber' | 'red'.
function compareGrades(required: string, predicted: string[]): 'green' | 'amber' | 'red' {
  const req = required.toUpperCase().replace(/[^A-DN]/g, '').split('')
  if (req.length === 0 || predicted.length === 0) return 'amber'

  // Sort predicted grades best-first
  const sorted = [...predicted].sort(
    (a, b) => HIGHER_GRADE_ORDER.indexOf(a) - HIGHER_GRADE_ORDER.indexOf(b)
  )
  let meets = 0
  let oneOff = 0
  for (let i = 0; i < req.length; i++) {
    const need = HIGHER_GRADE_ORDER.indexOf(req[i])
    const have = sorted[i] ? HIGHER_GRADE_ORDER.indexOf(sorted[i]) : 999
    if (have <= need) meets++
    else if (have === need + 1) oneOff++
  }
  if (meets === req.length) return 'green'
  if (meets + oneOff >= req.length) return 'amber'
  return 'red'
}

const TRAFFIC_LIGHT: Record<
  'green' | 'amber' | 'red',
  { color: string; icon: string; label: string }
> = {
  green: { color: 'var(--pf-green-600, #059669)', icon: '✓', label: 'On track' },
  amber: { color: 'var(--pf-amber-600, #b45309)', icon: '–', label: 'Close — one grade off' },
  red: { color: 'var(--pf-red-500, #ef4444)', icon: '✕', label: 'Below typical requirement' },
}

export function ParentCoursesCard({ child }: { child: LinkedChild }) {
  const supabase = getSupabaseClient()

  const { data, isLoading } = useQuery({
    queryKey: ['parent-courses', child.student_id],
    queryFn: async () => {
      const [coursesRes, gradesRes] = await Promise.all([
        supabase
          .from('saved_courses')
          .select(
            `
            id, course_id,
            course:courses(
              id, name, entry_requirements, widening_access_requirements, course_url,
              university:universities(name)
            )
            `
          )
          .eq('student_id', child.student_id)
          .order('created_at', { ascending: false }),
        supabase
          .from('student_grades')
          .select('id, subject, grade, qualification_type, predicted')
          .eq('student_id', child.student_id)
          .eq('qualification_type', 'higher')
          .eq('predicted', true),
      ])

      if (coursesRes.error) throw coursesRes.error
      if (gradesRes.error) throw gradesRes.error
      return {
        saved: (coursesRes.data ?? []) as unknown as SavedCourseRow[],
        grades: (gradesRes.data ?? []) as StudentGrade[],
      }
    },
  })

  const simdDecile = child.simd_decile ?? null
  const predictedGrades = (data?.grades ?? []).map((g) => g.grade.toUpperCase())
  const qualifiesContextual = simdDecile !== null && simdDecile <= 4

  return (
    <section
      className="pf-card"
      aria-labelledby="parent-courses-heading"
    >
      <h2 id="parent-courses-heading" style={{ marginBottom: '4px' }}>
        {child.first_name ? `${child.first_name}'s` : 'Your child\'s'} saved courses
      </h2>
      <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.875rem', marginBottom: '14px' }}>
        Courses they have saved, compared against their predicted Higher grades.
      </p>

      {qualifiesContextual && (
        <div
          className="rounded-lg mb-4"
          style={{
            padding: '10px 12px',
            backgroundColor: 'var(--pf-blue-50)',
            border: '1px solid var(--pf-blue-100)',
            fontSize: '0.875rem',
          }}
        >
          Based on your postcode, your child may qualify for reduced entry requirements at
          some Scottish universities.
        </div>
      )}

      {isLoading ? (
        <Skeleton variant="text" lines={3} />
      ) : !data || data.saved.length === 0 ? (
        <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', margin: 0 }}>
          No saved courses yet. Your child can browse courses and save the ones that interest
          them from their dashboard.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {data.saved.slice(0, 20).map((sc) => {
            const standard = parseGradeList(sc.course?.entry_requirements)
            const contextual = parseContextualOffer(
              sc.course?.widening_access_requirements,
              simdDecile
            )
            const effective = contextual?.grades ?? standard
            let light: 'green' | 'amber' | 'red' | null = null
            if (effective && predictedGrades.length > 0) {
              light = compareGrades(effective, predictedGrades)
            }

            return (
              <li
                key={sc.id}
                style={{
                  padding: '12px 0',
                  borderTop: '1px solid var(--pf-grey-100)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        fontSize: '1rem',
                        color: 'var(--pf-grey-900)',
                        margin: 0,
                      }}
                    >
                      {sc.course?.name ?? 'Unknown course'}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', margin: 0 }}>
                      {sc.course?.university?.name ?? ''}
                    </p>
                  </div>
                  {light && (
                    <span
                      aria-label={TRAFFIC_LIGHT[light].label}
                      title={TRAFFIC_LIGHT[light].label}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: '999px',
                        backgroundColor: TRAFFIC_LIGHT[light].color,
                        color: 'var(--pf-white)',
                        fontWeight: 700,
                        fontSize: '0.9375rem',
                        flexShrink: 0,
                      }}
                    >
                      {TRAFFIC_LIGHT[light].icon}
                    </span>
                  )}
                </div>
                <div
                  className="mt-2"
                  style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-700)' }}
                >
                  {standard && (
                    <p style={{ margin: '2px 0' }}>
                      <strong>Standard offer:</strong> {standard}
                    </p>
                  )}
                  {contextual && (
                    <p style={{ margin: '2px 0' }}>
                      <strong>{contextual.label}:</strong> {contextual.grades}
                    </p>
                  )}
                  {predictedGrades.length > 0 && (
                    <p style={{ margin: '2px 0' }}>
                      <strong>Predicted Highers:</strong> {predictedGrades.join(' ')}
                    </p>
                  )}
                  {!standard && !contextual && (
                    <p style={{ margin: '2px 0', color: 'var(--pf-grey-600)' }}>
                      Entry requirements not available for this course.
                    </p>
                  )}
                </div>
              </li>
            )
          })}
          {data.saved.length > 20 && (
            <li
              style={{ padding: '8px 0', fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}
            >
              + {data.saved.length - 20} more saved courses
            </li>
          )}
        </ul>
      )}
    </section>
  )
}
