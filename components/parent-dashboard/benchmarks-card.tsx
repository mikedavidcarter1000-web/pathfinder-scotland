'use client'

import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import type { LinkedChild } from '@/hooks/use-parent-link'
import leaverDestinations from '@/data/leaver-destinations.json'
import n5HigherProgression from '@/data/n5-higher-progression.json'

interface LeaverRow {
  council: string
  university_pct: number
  college_pct: number
  employment_pct: number
  training_pct: number
  other_pct: number
  needs_verification?: boolean
}

interface ProgressionRow {
  subject: string
  n5_A_to_higher_pass: number
  n5_B_to_higher_pass: number
  n5_C_to_higher_pass: number
  notes?: string
  needs_verification?: boolean
}

function contextualCopy(simdDecile: number | null): string {
  if (simdDecile === null) {
    return "Postcode hasn't been shared. Ask your child to add it so we can show widening-access guidance."
  }
  if (simdDecile <= 4) {
    return "Your child's postcode is in one of the areas that Scottish universities actively support through widening access programmes. This means they may qualify for lower entry grades, additional bursaries, and dedicated support schemes like SWAP and REACH."
  }
  if (simdDecile <= 7) {
    return "Your child's postcode falls in the middle range. They may qualify for some contextualised admissions support at certain universities, and all household-income-based bursaries are available."
  }
  return "Your child's postcode does not currently qualify for SIMD-based contextual offers, but all SAAS funding and income-based bursaries remain available."
}

export function ParentBenchmarksCard({ child }: { child: LinkedChild }) {
  const supabase = getSupabaseClient()

  // Parent is allowed to read grades via RLS -- pull both N5 + Higher for progression notes
  const { data: grades } = useQuery({
    queryKey: ['parent-benchmark-grades', child.student_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_grades')
        .select('id, subject, grade, qualification_type, predicted')
        .eq('student_id', child.student_id)
        .in('qualification_type', ['national_5', 'higher'])
      if (error) throw error
      return data
    },
  })

  // Child's council is only on `students.local_authority`, which parents can't
  // read via RLS (students RLS is owner-only). Pull council from the
  // parent-accessible `get_linked_children` RPC's already-returned child.
  // We'll fall back to "your area" language if no council is available.
  const { data: councilFromChild } = useQuery({
    queryKey: ['parent-child-council', child.student_id],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any).rpc('get_child_council_area', {
        p_student_id: child.student_id,
      })
      return (data as string | null) ?? null
    },
  })

  const simdDecile = child.simd_decile ?? null
  const councilName = councilFromChild ?? null

  const councilRow = councilName
    ? ((leaverDestinations.councils as LeaverRow[]).find(
        (c) => c.council === councilName
      ) ?? null)
    : null

  // Match N5 -> Higher pairs for this child
  type Grade = { subject: string; grade: string; qualification_type: string }
  const gradesList = (grades ?? []) as Grade[]
  const n5Map = new Map<string, string>()
  const higherMap = new Map<string, string>()
  for (const g of gradesList) {
    const key = (g.subject || '').toLowerCase().trim()
    if (!key) continue
    if (g.qualification_type === 'national_5') n5Map.set(key, g.grade.toUpperCase())
    if (g.qualification_type === 'higher') higherMap.set(key, g.grade.toUpperCase())
  }
  const progressionMatches: Array<{
    subject: string
    n5Grade: string
    higherGrade: string
    passRate: number | null
    note: string | null
  }> = []
  for (const [key, n5Grade] of n5Map.entries()) {
    if (!higherMap.has(key)) continue
    const row = (n5HigherProgression.subjects as ProgressionRow[]).find(
      (r) => r.subject.toLowerCase() === key
    )
    if (!row) continue
    const pass =
      n5Grade === 'A'
        ? row.n5_A_to_higher_pass
        : n5Grade === 'B'
          ? row.n5_B_to_higher_pass
          : n5Grade === 'C'
            ? row.n5_C_to_higher_pass
            : null
    progressionMatches.push({
      subject: row.subject,
      n5Grade,
      higherGrade: higherMap.get(key)!,
      passRate: pass,
      note: row.notes ?? null,
    })
  }

  return (
    <section className="pf-card" aria-labelledby="parent-benchmarks-heading">
      <h2 id="parent-benchmarks-heading" style={{ marginBottom: '4px' }}>
        Putting things in context
      </h2>
      <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.875rem', marginBottom: '14px' }}>
        National figures for reference. Every child&apos;s path is different.
      </p>

      {/* Section 1: school leaver destinations */}
      <details
        open
        style={{
          borderTop: '1px solid var(--pf-grey-100)',
          paddingTop: '12px',
          marginTop: '8px',
        }}
      >
        <summary
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '0.9375rem',
            cursor: 'pointer',
          }}
        >
          School leaver destinations {councilName ? `in ${councilName}` : 'in Scotland'}
        </summary>
        <div style={{ paddingTop: '8px' }}>
          {councilRow ? (
            <>
              <p style={{ fontSize: '0.875rem', marginBottom: '10px' }}>
                Last year in {councilRow.council},{' '}
                <strong>{councilRow.university_pct}%</strong> of school leavers went to
                university and <strong>{councilRow.college_pct}%</strong> went to college.
              </p>
              <div
                aria-label="Destinations breakdown"
                style={{
                  display: 'flex',
                  width: '100%',
                  height: '16px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  backgroundColor: 'var(--pf-grey-100)',
                }}
              >
                <div
                  title={`University ${councilRow.university_pct}%`}
                  style={{ width: `${councilRow.university_pct}%`, backgroundColor: 'var(--pf-blue-700)' }}
                />
                <div
                  title={`College ${councilRow.college_pct}%`}
                  style={{ width: `${councilRow.college_pct}%`, backgroundColor: 'var(--pf-blue-500)' }}
                />
                <div
                  title={`Employment ${councilRow.employment_pct}%`}
                  style={{ width: `${councilRow.employment_pct}%`, backgroundColor: 'var(--pf-green-600, #059669)' }}
                />
                <div
                  title={`Training ${councilRow.training_pct}%`}
                  style={{ width: `${councilRow.training_pct}%`, backgroundColor: 'var(--pf-amber-500, #f59e0b)' }}
                />
                <div
                  title={`Other ${councilRow.other_pct}%`}
                  style={{ width: `${councilRow.other_pct}%`, backgroundColor: 'var(--pf-grey-300)' }}
                />
              </div>
              <ul
                className="mt-2"
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '8px 0 0 0',
                  fontSize: '0.75rem',
                  color: 'var(--pf-grey-700)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '2px',
                }}
              >
                <li>University {councilRow.university_pct}%</li>
                <li>College {councilRow.college_pct}%</li>
                <li>Employment {councilRow.employment_pct}%</li>
                <li>Training {councilRow.training_pct}%</li>
                <li>Other {councilRow.other_pct}%</li>
              </ul>
              {councilRow.needs_verification && (
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--pf-grey-600)',
                    marginTop: '8px',
                    fontStyle: 'italic',
                  }}
                >
                  Indicative figures based on SFC school-leaver destinations. Refer to{' '}
                  <a
                    href="https://www.sfc.ac.uk/publications-statistics/statistical-publications/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    SFC publications
                  </a>{' '}
                  for the most recent data.
                </p>
              )}
            </>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
              We don&apos;t yet have a council area for your child. Once their postcode has
              been saved, we can show destinations data for the right area.
            </p>
          )}
        </div>
      </details>

      {/* Section 2: SIMD copy */}
      <details
        style={{
          borderTop: '1px solid var(--pf-grey-100)',
          paddingTop: '12px',
          marginTop: '12px',
        }}
      >
        <summary
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '0.9375rem',
            cursor: 'pointer',
          }}
        >
          What does your child&apos;s postcode mean for university entry?
        </summary>
        <p style={{ fontSize: '0.875rem', marginTop: '8px', color: 'var(--pf-grey-700)' }}>
          {contextualCopy(simdDecile)}
        </p>
      </details>

      {/* Section 3: N5 -> Higher progression */}
      {progressionMatches.length > 0 && (
        <details
          style={{
            borderTop: '1px solid var(--pf-grey-100)',
            paddingTop: '12px',
            marginTop: '12px',
          }}
        >
          <summary
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.9375rem',
              cursor: 'pointer',
            }}
          >
            Are your child&apos;s predicted grades on track?
          </summary>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '8px 0 0 0',
              fontSize: '0.875rem',
            }}
          >
            {progressionMatches.map((m) => (
              <li key={m.subject} style={{ padding: '8px 0', borderTop: '1px solid var(--pf-grey-100)' }}>
                <p style={{ fontWeight: 600, margin: 0 }}>
                  {m.subject} — N5 {m.n5Grade}, Higher {m.higherGrade}
                </p>
                {m.passRate !== null && (
                  <p style={{ color: 'var(--pf-grey-700)', margin: '2px 0' }}>
                    Nationally, around <strong>{m.passRate}%</strong> of pupils who got a{' '}
                    {m.n5Grade} at National 5 {m.subject} went on to pass the Higher.
                  </p>
                )}
                {m.note && (
                  <p
                    style={{
                      color: 'var(--pf-grey-600)',
                      fontSize: '0.8125rem',
                      margin: '2px 0',
                    }}
                  >
                    {m.note}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--pf-grey-600)',
              marginTop: '10px',
              fontStyle: 'italic',
            }}
          >
            Indicative pass rates from SQA attainment analysis. Actual outcomes vary by
            school and cohort.
          </p>
        </details>
      )}
    </section>
  )
}
