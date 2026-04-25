import { AuthorityBarChart } from '@/components/authority/charts/AuthorityBarChart'
import { AuthorityMetricCard } from '@/components/authority/charts/AuthorityMetricCard'
import { DataCompletenessIndicator } from '@/components/authority/data-completeness-indicator'
import { CareersExportButton } from '@/components/authority/careers/careers-export-button'
import { formatCohortValue } from '@/lib/authority/disclosure'
import type {
  CareersTabData,
  ConcentrationFlag,
  PathwaySplitData,
  PathwaySplitRow,
  SectorConcentrationRow,
  CareerSectorExplorationRow,
  SavedCoursesMetrics,
  PersonalStatementMetrics,
  DYWMetrics,
  CollegeArticulationMetrics,
} from '@/lib/authority/careers-queries'

const TOP_SECTOR_CHART_COUNT = 12

export interface CareersTabProps {
  data: CareersTabData
  totalSchoolsInLa: number
}

export function CareersTab({ data, totalSchoolsInLa }: CareersTabProps) {
  if (data.scope_school_count === 0) {
    return (
      <EmptyCard
        title="No schools in this view"
        body="Adjust the filter bar above to widen the school selection. As a QIO, you may also need to ask your LA admin to add schools to your assignment."
      />
    )
  }

  const completenessPct = totalSchoolsInLa > 0
    ? Math.round((data.data_completeness_schools / totalSchoolsInLa) * 100)
    : 0

  const exploredCount = data.total_sectors_explored
  const sectorsAvailable = data.total_sectors_available
  const topThree = data.sector_exploration
    .filter((s) => s.unique_students != null && s.unique_students > 0)
    .slice(0, 3)
    .map((s) => s.sector_name)
    .join(', ')

  const hasDywData = data.dyw != null
  const hasSavedCourses = data.saved_courses != null
  const hasPersonalStatements = data.personal_statements != null
  const hasArticulation = data.articulation != null

  return (
    <>
      {/* Page header with export button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#1a1a2e',
              margin: 0,
            }}
          >
            Career exploration and destinations
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 0' }}>
            Sector exploration, pathway split, employer engagement and personal statement
            progress across {data.scope_school_count} school
            {data.scope_school_count === 1 ? '' : 's'}.
          </p>
        </div>
        <CareersExportButton />
      </div>

      {/* Headline cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <AuthorityMetricCard
          label="Sectors explored"
          value={`${exploredCount}/${sectorsAvailable}`}
          subtitle="Of all available career sectors"
          colour={
            sectorsAvailable === 0
              ? 'grey'
              : exploredCount >= Math.ceil(sectorsAvailable * 0.6)
                ? 'green'
                : exploredCount >= Math.ceil(sectorsAvailable * 0.3)
                  ? 'amber'
                  : 'red'
          }
        />
        <AuthorityMetricCard
          label="Total students in scope"
          value={formatCohortValue(data.total_students_in_scope)}
          subtitle="After active filters"
        />
        <AuthorityMetricCard
          label="Schools reporting"
          value={`${data.data_completeness_schools}/${totalSchoolsInLa}`}
          subtitle="Schools with engagement data in view"
        />
        <AuthorityMetricCard
          label="DYW employer partnerships"
          value={hasDywData ? String(data.dyw!.total_employers) : '—'}
          subtitle={hasDywData ? 'Employers logged in scope' : 'Awaiting school data'}
        />
      </div>

      {/* Sector exploration */}
      <Panel
        title="Career sector exploration"
        completeness={{
          percentage: completenessPct,
          label: 'Engagement data',
          tooltip: 'Counts unique students who viewed a career sector page in the last 90 days. Cells with fewer than 5 students are suppressed.',
        }}
        emptyMessage={
          completenessPct < 50
            ? `Engagement data appears as students explore career content. ${data.data_completeness_schools} of ${totalSchoolsInLa} schools currently have data.`
            : undefined
        }
      >
        <p style={summaryStyle}>
          {topThree.length > 0
            ? `Students across this scope are exploring ${exploredCount} of ${sectorsAvailable} career sectors. The most popular are ${topThree}.`
            : `No sector exploration recorded yet. ${sectorsAvailable} career sectors are available to explore.`}
        </p>
        {data.sector_exploration.filter((s) => s.unique_students != null && s.unique_students > 0).length === 0 ? (
          <p style={emptyTextStyle}>
            No career sector exploration recorded for the current filters. Data appears as students view sector pages.
          </p>
        ) : (
          <>
            <AuthorityBarChart
              data={data.sector_exploration
                .filter((s) => s.unique_students != null && s.unique_students > 0)
                .slice(0, TOP_SECTOR_CHART_COUNT)
                .map((s) => ({
                  label: s.sector_name,
                  value: s.unique_students ?? 0,
                  secondary: s.percentage_of_cohort != null
                    ? `${formatCohortValue(s.unique_students)} (${s.percentage_of_cohort.toFixed(1)}%)`
                    : formatCohortValue(s.unique_students),
                }))}
              ariaLabel={`Top ${TOP_SECTOR_CHART_COUNT} career sectors by unique students`}
            />
            <SectorBreakdownTable rows={data.sector_exploration} />
          </>
        )}
      </Panel>

      {/* Sector concentration */}
      <Panel
        title="Sector concentration by school"
        completeness={{
          percentage: completenessPct,
          label: 'Engagement data',
          tooltip:
            'Average distinct sectors per exploring student at each school. Broad ≥ 4, moderate 2–3, narrow < 2.',
        }}
      >
        {data.concentration_analysis.length === 0 ? (
          <p style={emptyTextStyle}>No schools in scope.</p>
        ) : (
          <ConcentrationTable rows={data.concentration_analysis} />
        )}
      </Panel>

      {/* Pathway interest split */}
      <Panel
        title="Pathway interest split"
        completeness={{
          percentage: completenessPct,
          label: 'Engagement data',
          tooltip:
            'Each student is counted in every pathway they have explored. Mixed = students who explored 2 or more. Last 90 days.',
        }}
      >
        <PathwaySplitView split={data.pathway_split} />
      </Panel>

      {/* Pathway plans -- not yet wired */}
      <Panel title="Pathway plans created">
        {data.pathway_plans == null ? (
          <p style={emptyTextStyle}>
            Pathway plan data will appear when the pathway planner tool is wired into the
            student dashboard. This view will show plan-creation rates per school.
          </p>
        ) : (
          <p style={emptyTextStyle}>No pathway plan data for the current filters.</p>
        )}
      </Panel>

      {/* Saved courses */}
      <Panel
        title="Saved courses"
        completeness={{
          percentage: completenessPct,
          label: 'Saved courses',
          tooltip: 'Courses saved by students for later. Counts and per-school averages are suppressed when fewer than 5 students saved.',
        }}
      >
        {!hasSavedCourses ? (
          <p style={emptyTextStyle}>
            Saved-course data will appear once students start bookmarking courses from the
            university and college search pages.
          </p>
        ) : (
          <SavedCoursesView metrics={data.saved_courses!} />
        )}
      </Panel>

      {/* Personal statements */}
      <Panel
        title="Personal statement progress"
        completeness={{
          percentage: completenessPct,
          label: 'S5/S6 cohort',
          tooltip:
            'Senior phase (S5/S6) students who have started a UCAS personal statement draft. Filtered to S5/S6 by default since this is a senior-phase activity.',
        }}
      >
        {!hasPersonalStatements ? (
          <p style={emptyTextStyle}>
            Personal statement progress will appear once S5/S6 students start drafting their
            UCAS personal statements through the Pathfinder writing tool.
          </p>
        ) : (
          <PersonalStatementsView metrics={data.personal_statements!} />
        )}
      </Panel>

      {/* DYW engagement */}
      <Panel
        title="DYW employer engagement"
        completeness={{
          percentage: completenessPct,
          label: 'DYW data',
          tooltip:
            'Employer partnerships and work experience placements logged via the school portal.',
        }}
      >
        {!hasDywData ? (
          <p style={emptyTextStyle}>
            DYW engagement data will appear once schools log employer partnerships and work
            experience placements via the school portal.
          </p>
        ) : (
          <DYWView metrics={data.dyw!} />
        )}
      </Panel>

      {/* College articulation interest */}
      <Panel
        title="College articulation route interest"
        completeness={{
          percentage: completenessPct,
          label: 'Engagement data',
          tooltip:
            'Students viewing HNC/HND-to-degree articulation route content. Suppressed when fewer than 5 distinct students.',
        }}
      >
        {!hasArticulation ? (
          <p style={emptyTextStyle}>
            Articulation route interest will appear once students start exploring HNC/HND-to-degree
            content on the college pages.
          </p>
        ) : (
          <ArticulationView metrics={data.articulation!} />
        )}
      </Panel>
    </>
  )
}

// ---------------------------------------------------------------------------
// Sector breakdown table
// ---------------------------------------------------------------------------

function SectorBreakdownTable({ rows }: { rows: CareerSectorExplorationRow[] }) {
  const visibleRows = rows.filter((r) => r.unique_students != null && r.unique_students > 0)
  if (visibleRows.length === 0) return null
  return (
    <div style={{ overflowX: 'auto', marginTop: '20px' }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Sector</th>
            <th style={thStyleRight}>Students</th>
            <th style={thStyleRight}>% of cohort</th>
            <th style={thStyleRight}>Female</th>
            <th style={thStyleRight}>Male</th>
            <th style={thStyleRight}>Q1</th>
            <th style={thStyleRight}>Q5</th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((r) => (
            <tr key={r.sector_id}>
              <td style={tdStyle}>{r.sector_name}</td>
              <td style={tdStyleRight}>{formatCohortValue(r.unique_students)}</td>
              <td style={tdStyleRight}>{r.percentage_of_cohort != null ? `${r.percentage_of_cohort.toFixed(1)}%` : '—'}</td>
              <td style={tdStyleRight}>{formatCohortValue(r.gender_breakdown.female)}</td>
              <td style={tdStyleRight}>{formatCohortValue(r.gender_breakdown.male)}</td>
              <td style={tdStyleRight}>{formatCohortValue(r.simd_breakdown.Q1)}</td>
              <td style={tdStyleRight}>{formatCohortValue(r.simd_breakdown.Q5)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Concentration table
// ---------------------------------------------------------------------------

function ConcentrationTable({ rows }: { rows: SectorConcentrationRow[] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>School</th>
            <th style={thStyleRight}>Cohort</th>
            <th style={thStyleRight}>Exploring</th>
            <th style={thStyleRight}>Sectors</th>
            <th style={thStyleRight}>Avg / student</th>
            <th style={thStyle}>Concentration</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.school_id}>
              <td style={tdStyle}>{r.school_name}</td>
              <td style={tdStyleRight}>{formatCohortValue(r.student_count)}</td>
              <td style={tdStyleRight}>{formatCohortValue(r.exploring_students)}</td>
              <td style={tdStyleRight}>{r.sectors_explored != null ? r.sectors_explored : '—'}</td>
              <td style={tdStyleRight}>{r.avg_sectors_per_student != null ? r.avg_sectors_per_student.toFixed(1) : '—'}</td>
              <td style={tdStyle}>
                <ConcentrationBadge flag={r.concentration_flag} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ConcentrationBadge({ flag }: { flag: ConcentrationFlag | null }) {
  if (!flag) {
    return <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>—</span>
  }
  const colours = flag === 'broad'
    ? { bg: '#f0fdf4', fg: '#166534', border: '#bbf7d0' }
    : flag === 'moderate'
      ? { bg: '#fffbeb', fg: '#92400e', border: '#fde68a' }
      : { bg: '#fef2f2', fg: '#991b1b', border: '#fecaca' }
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '999px',
        backgroundColor: colours.bg,
        color: colours.fg,
        border: `1px solid ${colours.border}`,
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'capitalize',
      }}
    >
      {flag}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Pathway split view
// ---------------------------------------------------------------------------

function PathwaySplitView({ split }: { split: PathwaySplitData }) {
  const allSuppressed = split.rows.every((r) => r.unique_students == null)
  if (allSuppressed) {
    return (
      <p style={emptyTextStyle}>
        Pathway exploration data is suppressed (cohorts below 5). Adjust filters to widen
        the cohort.
      </p>
    )
  }

  const NAVY = '#1B3A5C'
  const SLATE = '#85AAD0'
  const GREEN = '#15803d'
  const PURPLE = '#7c3aed'
  const GREY = '#94a3b8'
  const COLOURS: Record<string, string> = {
    university: NAVY,
    college: SLATE,
    apprenticeship: GREEN,
    mixed: PURPLE,
    no_exploration: GREY,
  }

  return (
    <div>
      <AuthorityBarChart
        data={split.rows
          .filter((r) => r.unique_students != null)
          .map((r) => ({
            label: r.label,
            value: r.unique_students ?? 0,
            secondary: r.percentage != null
              ? `${formatCohortValue(r.unique_students)} (${r.percentage.toFixed(1)}%)`
              : formatCohortValue(r.unique_students),
            colour: COLOURS[r.key],
          }))}
        ariaLabel="Pathway interest split"
      />

      <PathwayTable rows={split.rows} />

      {split.q1 && split.q5 && (
        <>
          <h4 style={subSectionTitle}>Q1 vs Q5 pathway split</h4>
          <p style={summaryStyle}>
            Are SIMD Q1 students less likely to explore university? Compare side by side
            (suppressed when either quintile cohort is below 5).
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            <SimdSplitCard label={`Q1 (${split.q1.cohort_size})`} rows={split.q1.rows} />
            <SimdSplitCard label={`Q5 (${split.q5.cohort_size})`} rows={split.q5.rows} />
          </div>
        </>
      )}
      {(!split.q1 || !split.q5) && (
        <p style={{ ...summaryStyle, marginTop: '16px' }}>
          SIMD Q1 vs Q5 comparison is suppressed: at least one of the cohorts is below the
          disclosure threshold of 5 students.
        </p>
      )}
    </div>
  )
}

function PathwayTable({ rows }: { rows: PathwaySplitRow[] }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: '20px' }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Pathway</th>
            <th style={thStyleRight}>Students</th>
            <th style={thStyleRight}>% of cohort</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <td style={tdStyle}>{r.label}</td>
              <td style={tdStyleRight}>{formatCohortValue(r.unique_students)}</td>
              <td style={tdStyleRight}>{r.percentage != null ? `${r.percentage.toFixed(1)}%` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SimdSplitCard({ label, rows }: { label: string; rows: PathwaySplitRow[] }) {
  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '14px 16px',
      }}
    >
      <h5
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '0.875rem',
          color: '#1a1a2e',
          margin: '0 0 10px',
        }}
      >
        {label}
      </h5>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8125rem' }}>
        {rows.map((r) => (
          <li
            key={r.key}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '4px 0',
              color: '#1a1a2e',
            }}
          >
            <span>{r.label}</span>
            <span style={{ fontWeight: 600 }}>
              {r.percentage != null ? `${r.percentage.toFixed(1)}%` : '—'}
              <span style={{ marginLeft: '6px', color: '#64748b', fontWeight: 400 }}>
                ({formatCohortValue(r.unique_students)})
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Saved courses view
// ---------------------------------------------------------------------------

function SavedCoursesView({ metrics }: { metrics: SavedCoursesMetrics }) {
  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <SummaryFigure label="Total saves" value={formatCohortValue(metrics.total_saves)} />
        <SummaryFigure
          label="Students saving"
          value={formatCohortValue(metrics.unique_students_saving)}
        />
        <SummaryFigure
          label="Avg saves / student"
          value={metrics.avg_saves_per_student != null
            ? metrics.avg_saves_per_student.toFixed(1)
            : '—'}
        />
      </div>

      {metrics.per_school.length > 0 && (
        <>
          <h4 style={subSectionTitle}>Per school</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>School</th>
                  <th style={thStyleRight}>Students saving</th>
                  <th style={thStyleRight}>Avg saves</th>
                </tr>
              </thead>
              <tbody>
                {metrics.per_school.map((r) => (
                  <tr key={r.school_id}>
                    <td style={tdStyle}>{r.school_name}</td>
                    <td style={tdStyleRight}>{formatCohortValue(r.saving_students)}</td>
                    <td style={tdStyleRight}>{r.avg_saves != null ? r.avg_saves.toFixed(1) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {metrics.top_courses.length > 0 && (
        <>
          <h4 style={{ ...subSectionTitle, marginTop: '20px' }}>Top saved courses</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Course</th>
                  <th style={thStyle}>Institution</th>
                  <th style={thStyleRight}>Saves</th>
                </tr>
              </thead>
              <tbody>
                {metrics.top_courses.map((c) => (
                  <tr key={c.course_id}>
                    <td style={tdStyle}>{c.course_name}</td>
                    <td style={tdStyle}>{c.university_name ?? '—'}</td>
                    <td style={tdStyleRight}>{formatCohortValue(c.save_count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {metrics.top_courses.length === 0 && metrics.per_school.length === 0 && (
        <p style={emptyTextStyle}>No saved courses recorded for the current filters.</p>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Personal statements view
// ---------------------------------------------------------------------------

function PersonalStatementsView({ metrics }: { metrics: PersonalStatementMetrics }) {
  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <SummaryFigure
          label="Senior phase students"
          value={formatCohortValue(metrics.senior_phase_total)}
        />
        <SummaryFigure
          label="Started a draft"
          value={formatCohortValue(metrics.started_count)}
        />
        <SummaryFigure
          label="% started"
          value={metrics.started_percentage != null
            ? `${metrics.started_percentage.toFixed(1)}%`
            : '—'}
        />
      </div>

      <h4 style={subSectionTitle}>Per school (S5/S6 only)</h4>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>School</th>
              <th style={thStyleRight}>S5/S6 cohort</th>
              <th style={thStyleRight}>Started</th>
              <th style={thStyleRight}>% started</th>
            </tr>
          </thead>
          <tbody>
            {metrics.per_school.map((r) => (
              <tr key={r.school_id}>
                <td style={tdStyle}>{r.school_name}</td>
                <td style={tdStyleRight}>{formatCohortValue(r.senior_phase_total)}</td>
                <td style={tdStyleRight}>{formatCohortValue(r.started_count)}</td>
                <td style={tdStyleRight}>{r.percentage != null ? `${r.percentage.toFixed(1)}%` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// DYW view
// ---------------------------------------------------------------------------

function DYWView({ metrics }: { metrics: DYWMetrics }) {
  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <SummaryFigure label="Employers" value={String(metrics.total_employers)} />
        <SummaryFigure label="Placements" value={formatCohortValue(metrics.total_placements)} />
        <SummaryFigure
          label="Students placed"
          value={formatCohortValue(metrics.unique_placement_students)}
        />
        <SummaryFigure
          label="Sectors covered"
          value={String(metrics.sectors_covered.length)}
        />
      </div>

      {metrics.sectors_covered.length > 0 && (
        <>
          <h4 style={subSectionTitle}>Sectors covered by employer partnerships</h4>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Sector</th>
                  <th style={thStyleRight}>Employers</th>
                </tr>
              </thead>
              <tbody>
                {metrics.sectors_covered.map((s) => (
                  <tr key={s.sector_id}>
                    <td style={tdStyle}>{s.sector_name}</td>
                    <td style={tdStyleRight}>{s.employer_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h4 style={subSectionTitle}>Per school</h4>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>School</th>
              <th style={thStyleRight}>Employers</th>
              <th style={thStyleRight}>Placements</th>
              <th style={thStyleRight}>Students placed</th>
            </tr>
          </thead>
          <tbody>
            {metrics.per_school.map((r) => (
              <tr key={r.school_id}>
                <td style={tdStyle}>{r.school_name}</td>
                <td style={tdStyleRight}>{r.employer_count}</td>
                <td style={tdStyleRight}>{formatCohortValue(r.placement_count)}</td>
                <td style={tdStyleRight}>{formatCohortValue(r.placement_students)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Articulation view
// ---------------------------------------------------------------------------

function ArticulationView({ metrics }: { metrics: CollegeArticulationMetrics }) {
  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <SummaryFigure label="Students viewing" value={formatCohortValue(metrics.unique_students)} />
        <SummaryFigure label="Total views" value={formatCohortValue(metrics.total_events)} />
      </div>

      {metrics.top_routes.length === 0 ? (
        <p style={emptyTextStyle}>No articulation routes have been viewed by 5 or more students yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Articulation route</th>
                <th style={thStyleRight}>Unique students</th>
                <th style={thStyleRight}>Views</th>
              </tr>
            </thead>
            <tbody>
              {metrics.top_routes.map((r) => (
                <tr key={r.detail_key}>
                  <td style={tdStyle}>{r.display_label}</td>
                  <td style={tdStyleRight}>{formatCohortValue(r.unique_students)}</td>
                  <td style={tdStyleRight}>{formatCohortValue(r.view_count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Shared primitives (Panel, EmptyCard, SummaryFigure, table styling)
// ---------------------------------------------------------------------------

function SummaryFigure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          margin: 0,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#1a1a2e',
          margin: '4px 0 0',
        }}
      >
        {value}
      </p>
    </div>
  )
}

const summaryStyle: React.CSSProperties = {
  margin: '0 0 16px',
  color: '#475569',
  fontSize: '0.875rem',
  lineHeight: 1.5,
}

const subSectionTitle: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 700,
  color: '#1a1a2e',
  margin: '0 0 12px',
}

const emptyTextStyle: React.CSSProperties = {
  margin: 0,
  padding: '24px 0',
  color: '#94a3b8',
  fontStyle: 'italic',
  fontSize: '0.875rem',
  textAlign: 'center',
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.8125rem',
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 10px',
  fontWeight: 700,
  color: '#475569',
  borderBottom: '1px solid #e2e8f0',
  whiteSpace: 'nowrap',
}

const thStyleRight: React.CSSProperties = {
  ...thStyle,
  textAlign: 'right',
}

const tdStyle: React.CSSProperties = {
  padding: '8px 10px',
  color: '#1a1a2e',
  borderBottom: '1px solid #f1f5f9',
}

const tdStyleRight: React.CSSProperties = {
  ...tdStyle,
  textAlign: 'right',
}

function Panel({
  title,
  completeness,
  emptyMessage,
  children,
}: {
  title: string
  completeness?: { percentage: number; label: string; tooltip?: string }
  emptyMessage?: string
  children: React.ReactNode
}) {
  return (
    <section
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        <h3
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '1rem',
            color: '#1a1a2e',
            margin: 0,
          }}
        >
          {title}
        </h3>
        {completeness && (
          <DataCompletenessIndicator
            completenessPercentage={completeness.percentage}
            label={completeness.label}
            tooltipText={completeness.tooltip}
          />
        )}
      </div>
      {emptyMessage && (
        <p
          style={{
            margin: '0 0 12px',
            fontSize: '0.8125rem',
            color: '#92400e',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            padding: '10px 12px',
          }}
        >
          {emptyMessage}
        </p>
      )}
      {children}
    </section>
  )
}

function EmptyCard({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '40px 28px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '1.125rem',
          fontWeight: 700,
          color: '#1a1a2e',
          margin: 0,
        }}
      >
        {title}
      </h2>
      <p style={{ color: '#475569', margin: '12px auto 0', maxWidth: '520px', lineHeight: 1.6 }}>
        {body}
      </p>
    </div>
  )
}
