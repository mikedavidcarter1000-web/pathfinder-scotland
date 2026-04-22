import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient, isAdminEmail } from '@/lib/admin-auth'

export const metadata: Metadata = {
  title: 'Data Quality — Admin',
  description: 'Graduate outcomes and rankings coverage across courses and universities.',
  robots: { index: false, follow: false },
}

interface CourseRow {
  id: string
  name: string
  ucas_code: string | null
  subject_area: string | null
  employment_rate_15m: number | null
  salary_median_1yr: number | null
  salary_median_3yr: number | null
  subject_ranking_cug: number | null
  outcomes_needs_verification: boolean | null
  university_id: string
}

interface UniversityRow {
  id: string
  name: string
  slug: string
}

export default async function DataQualityPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in?redirect=/admin/data-quality')
  }
  if (!isAdminEmail(user.email)) {
    redirect('/dashboard')
  }

  const admin = getAdminClient()
  if (!admin) {
    return (
      <div className="pf-container pt-10 pb-16">
        <h1 style={{ marginBottom: '8px' }}>Data Quality</h1>
        <p style={{ color: 'var(--pf-grey-600)' }}>
          SUPABASE_SERVICE_ROLE_KEY is not configured — cannot load data.
        </p>
      </div>
    )
  }

  // Pull everything we need for counts + the missing-data list in two queries.
  const [coursesRes, unisRes] = await Promise.all([
    admin
      .from('courses')
      .select(
        'id, name, ucas_code, subject_area, employment_rate_15m, salary_median_1yr, salary_median_3yr, subject_ranking_cug, outcomes_needs_verification, university_id'
      )
      .order('name'),
    admin.from('universities').select('id, name, slug'),
  ])

  if (coursesRes.error || unisRes.error) {
    return (
      <div className="pf-container pt-10 pb-16">
        <h1 style={{ marginBottom: '8px' }}>Data Quality</h1>
        <p style={{ color: 'var(--pf-red-500, #ef4444)' }}>
          Error loading data: {coursesRes.error?.message ?? unisRes.error?.message}
        </p>
      </div>
    )
  }

  // Cast via unknown because types/database.ts does not yet include the
  // outcome columns (see MEMORY.md on never-regenerate-types).
  const courses = (coursesRes.data ?? []) as unknown as CourseRow[]
  const universities = (unisRes.data ?? []) as UniversityRow[]
  const uniById = new Map(universities.map((u) => [u.id, u]))

  // Pull ranking coverage straight from universities.
  const uniRankingsRes = await admin
    .from('universities')
    .select(
      'id, slug, name, ranking_cug, ranking_guardian, ranking_times, graduate_employment_rate, rankings_needs_verification'
    )
  const uniRanks = (uniRankingsRes.data ?? []) as unknown as Array<{
    id: string
    slug: string
    name: string
    ranking_cug: number | null
    ranking_guardian: number | null
    ranking_times: number | null
    graduate_employment_rate: number | null
    rankings_needs_verification: boolean | null
  }>

  const totalCourses = courses.length
  const withEmployment = courses.filter((c) => c.employment_rate_15m !== null).length
  const withSalary = courses.filter(
    (c) => c.salary_median_1yr !== null || c.salary_median_3yr !== null
  ).length
  const withRanking = courses.filter((c) => c.subject_ranking_cug !== null).length
  const needsVerification = courses.filter((c) => c.outcomes_needs_verification === true).length

  const uniTotal = uniRanks.length
  const uniWithAnyRanking = uniRanks.filter(
    (u) =>
      u.ranking_cug !== null ||
      u.ranking_guardian !== null ||
      u.ranking_times !== null ||
      u.graduate_employment_rate !== null
  ).length

  // Courses with at least one outcome column populated count as "has data".
  const coursesMissingAll = courses.filter(
    (c) =>
      c.employment_rate_15m === null &&
      c.salary_median_1yr === null &&
      c.salary_median_3yr === null &&
      c.subject_ranking_cug === null
  )

  // Group by university for display.
  const missingByUni = new Map<string, CourseRow[]>()
  for (const c of coursesMissingAll) {
    const existing = missingByUni.get(c.university_id) ?? []
    existing.push(c)
    missingByUni.set(c.university_id, existing)
  }
  const missingGroups = Array.from(missingByUni.entries())
    .map(([uniId, rows]) => ({
      uni: uniById.get(uniId),
      rows,
    }))
    .filter((g) => g.uni !== undefined)
    .sort((a, b) => (a.uni!.name ?? '').localeCompare(b.uni!.name ?? ''))

  return (
    <div className="pf-container pt-10 pb-16">
      <h1 style={{ marginBottom: '8px' }}>Data Quality</h1>
      <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', marginBottom: '24px' }}>
        Graduate outcomes and rankings coverage. Prioritise manual data entry against the
        list below, then set <code>outcomes_needs_verification = false</code> once spot-checked.
      </p>

      <section
        className="grid gap-3 mb-8"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
      >
        <StatBox label="Total courses" value={`${totalCourses}`} />
        <StatBox
          label="With employment data"
          value={`${withEmployment}`}
          sub={`${pct(withEmployment, totalCourses)}%`}
        />
        <StatBox
          label="With salary data"
          value={`${withSalary}`}
          sub={`${pct(withSalary, totalCourses)}%`}
        />
        <StatBox
          label="With subject ranking"
          value={`${withRanking}`}
          sub={`${pct(withRanking, totalCourses)}%`}
        />
        <StatBox
          label="Needs verification"
          value={`${needsVerification}`}
          sub={`${pct(needsVerification, totalCourses)}%`}
        />
        <StatBox
          label="Universities with any ranking"
          value={`${uniWithAnyRanking} / ${uniTotal}`}
        />
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>University rankings coverage</h2>
        <div className="pf-card-flat overflow-x-auto">
          <table style={{ width: '100%', fontSize: '0.875rem' }}>
            <thead style={{ backgroundColor: 'var(--pf-blue-50)' }}>
              <tr>
                <th style={adminThStyle}>University</th>
                <th style={adminThStyle}>CUG</th>
                <th style={adminThStyle}>Guardian</th>
                <th style={adminThStyle}>Times</th>
                <th style={adminThStyle}>Emp. rate</th>
                <th style={adminThStyle}>Verified</th>
              </tr>
            </thead>
            <tbody>
              {uniRanks
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((u) => (
                  <tr key={u.id} style={{ borderTop: '1px solid var(--pf-grey-200)' }}>
                    <td style={adminTdStyle}>{u.name}</td>
                    <td style={adminTdStyle}>{u.ranking_cug ?? '—'}</td>
                    <td style={adminTdStyle}>{u.ranking_guardian ?? '—'}</td>
                    <td style={adminTdStyle}>{u.ranking_times ?? '—'}</td>
                    <td style={adminTdStyle}>
                      {u.graduate_employment_rate !== null ? `${u.graduate_employment_rate}%` : '—'}
                    </td>
                    <td style={adminTdStyle}>
                      {u.rankings_needs_verification === false ? 'Yes' : 'No'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>
          Courses with no outcome data ({coursesMissingAll.length})
        </h2>
        <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.875rem', marginBottom: '12px' }}>
          Grouped by university. Click a course to open the Supabase Studio edit view (or use
          the data-maintenance workflow in <code>docs/data-maintenance.md</code>).
        </p>

        {missingGroups.length === 0 ? (
          <p style={{ color: 'var(--pf-grey-600)' }}>
            Every course has at least one outcome column populated.
          </p>
        ) : (
          missingGroups.map((g) => (
            <div key={g.uni!.id} style={{ marginBottom: '20px' }}>
              <h3
                style={{
                  fontSize: '1rem',
                  marginBottom: '8px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                }}
              >
                {g.uni!.name}{' '}
                <span style={{ color: 'var(--pf-grey-600)', fontWeight: 400, fontSize: '0.875rem' }}>
                  ({g.rows.length} missing)
                </span>
              </h3>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '4px',
                }}
              >
                {g.rows.map((c) => (
                  <li
                    key={c.id}
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--pf-grey-700)',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--pf-grey-100)',
                    }}
                  >
                    <Link href={`/courses/${c.id}`} style={{ color: 'var(--pf-blue-700)' }}>
                      {c.name}
                    </Link>
                    {c.ucas_code && (
                      <span style={{ marginLeft: '6px', color: 'var(--pf-grey-600)' }}>
                        ({c.ucas_code})
                      </span>
                    )}
                    {c.subject_area && (
                      <span
                        className="pf-badge-grey"
                        style={{ marginLeft: '6px', fontSize: '0.6875rem' }}
                      >
                        {c.subject_area}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  )
}

function pct(n: number, total: number): number {
  return total === 0 ? 0 : Math.round((n / total) * 100)
}

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      className="pf-card-flat"
      style={{ padding: '16px' }}
    >
      <p
        style={{
          fontSize: '0.6875rem',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          color: 'var(--pf-grey-600)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          margin: 0,
          marginBottom: '4px',
        }}
      >
        {label}
      </p>
      <p
        className="pf-data-number"
        style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--pf-grey-900)', margin: 0 }}
      >
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)', margin: '2px 0 0' }}>{sub}</p>
      )}
    </div>
  )
}

const adminThStyle: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontFamily: "'Space Grotesk', sans-serif",
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: 'var(--pf-grey-600)',
}

const adminTdStyle: React.CSSProperties = {
  padding: '10px 14px',
  color: 'var(--pf-grey-900)',
  fontSize: '0.875rem',
}
