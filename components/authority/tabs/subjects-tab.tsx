import { AuthorityBarChart } from '@/components/authority/charts/AuthorityBarChart'
import { AuthorityMetricCard } from '@/components/authority/charts/AuthorityMetricCard'
import { DataCompletenessIndicator } from '@/components/authority/data-completeness-indicator'
import { SubjectUptakeTable } from '@/components/authority/subjects/subject-uptake-table'
import { StemGenderChart } from '@/components/authority/subjects/stem-gender-chart'
import { CurriculumBreadthTable } from '@/components/authority/subjects/curriculum-breadth-table'
import { AvailabilityHeatmap } from '@/components/authority/subjects/availability-heatmap'
import { SubjectsExportButton } from '@/components/authority/subjects/subjects-export-button'
import { formatCohortValue } from '@/lib/authority/disclosure'
import type { SubjectsTabData } from '@/lib/authority/subjects-queries'

export interface SubjectsTabProps {
  data: SubjectsTabData
  totalSchoolsInLa: number
}

export function SubjectsTab({ data, totalSchoolsInLa }: SubjectsTabProps) {
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

  const noUptake = data.uptake.length === 0
  const stemBalancedLabel = data.stem_total_count === 0
    ? 'No STEM uptake yet'
    : `${data.stem_balanced_count} of ${data.stem_total_count} STEM subjects have balanced gender uptake (≥30% each)`

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
            Subject choices and curriculum
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 0' }}>
            Subject uptake, STEM gender balance, curriculum breadth and availability across {data.scope_school_count} school
            {data.scope_school_count === 1 ? '' : 's'}.
          </p>
        </div>
        <SubjectsExportButton />
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
          label="Distinct subjects"
          value={String(data.heatmap.total_subjects_in_la)}
          subtitle="Subjects with at least one student"
        />
        <AuthorityMetricCard
          label="Total students in scope"
          value={formatCohortValue(data.total_students_in_scope)}
          subtitle="After active filters"
        />
        <AuthorityMetricCard
          label="STEM gender balance"
          value={data.stem_total_count === 0 ? '—' : `${data.stem_balanced_count}/${data.stem_total_count}`}
          subtitle="STEM subjects with balanced uptake"
          colour={
            data.stem_total_count === 0
              ? 'grey'
              : data.stem_balanced_count >= Math.ceil(data.stem_total_count * 0.6)
                ? 'green'
                : data.stem_balanced_count >= Math.ceil(data.stem_total_count * 0.3)
                  ? 'amber'
                  : 'red'
          }
        />
        <AuthorityMetricCard
          label="Schools reporting"
          value={`${data.data_completeness_schools}/${totalSchoolsInLa}`}
          subtitle="Schools with subject data in view"
        />
      </div>

      {/* Subject uptake -- chart + table */}
      <Panel
        title="Subject uptake"
        completeness={{
          percentage: completenessPct,
          label: 'Subject choice data',
          tooltip: `${data.data_completeness_schools} of ${totalSchoolsInLa} schools have subject choice data for the current filters`,
        }}
        emptyMessage={
          completenessPct < 50
            ? `Subject data appears as schools complete their choice rounds. ${data.data_completeness_schools} of ${totalSchoolsInLa} schools currently report data.`
            : undefined
        }
      >
        {noUptake ? (
          <p style={emptyTextStyle}>
            No subject choices recorded for the current filters. Subject data appears as schools run their choice rounds.
          </p>
        ) : (
          <>
            <AuthorityBarChart
              data={data.uptake.slice(0, 20).map((s) => ({
                label: s.subject_name,
                value: s.student_count ?? 0,
                secondary:
                  s.percentage != null
                    ? `${formatCohortValue(s.student_count)} (${s.percentage.toFixed(1)}%)`
                    : formatCohortValue(s.student_count),
              }))}
              ariaLabel="Top 20 subjects by student count"
            />
            <p
              style={{
                margin: '12px 0 16px',
                fontSize: '0.75rem',
                color: '#94a3b8',
                fontStyle: 'italic',
                textAlign: 'right',
              }}
            >
              Showing top 20 of {data.uptake.length} subjects
            </p>
            <SubjectUptakeTable rows={data.uptake} />
          </>
        )}
      </Panel>

      {/* STEM gender analysis */}
      <Panel
        title="STEM gender balance"
        completeness={{
          percentage: completenessPct,
          label: 'STEM uptake data',
          tooltip:
            'Balance is calculated per STEM subject. Green = both genders ≥30%; amber = one gender 15–29%; red = one gender below 15%.',
        }}
      >
        <p
          style={{
            margin: '0 0 16px',
            color: '#475569',
            fontSize: '0.875rem',
          }}
        >
          {stemBalancedLabel}
        </p>
        {data.stem_gender.length === 0 ? (
          <p style={emptyTextStyle}>No STEM uptake recorded for the current filters.</p>
        ) : (
          <StemGenderChart rows={data.stem_gender} />
        )}
      </Panel>

      {/* Curriculum breadth */}
      <Panel
        title="Curriculum breadth"
        completeness={{
          percentage: completenessPct,
          label: 'Subject data',
          tooltip:
            'Breadth index normalises distinct-subjects-offered against the highest-breadth school in the LA (10 = widest curriculum in scope).',
        }}
      >
        {data.curriculum_breadth.length === 0 ? (
          <p style={emptyTextStyle}>No schools in scope.</p>
        ) : data.curriculum_breadth.length === 1 ? (
          <SingleSchoolBreadthSummary row={data.curriculum_breadth[0]} />
        ) : (
          <CurriculumBreadthTable rows={data.curriculum_breadth} />
        )}
      </Panel>

      {/* Availability heatmap */}
      <Panel
        title="Subject availability heatmap"
        completeness={{
          percentage: completenessPct,
          label: 'Subject choice data',
          tooltip: 'Each cell shows the student count at that school for that subject. Cells with fewer than 5 students are suppressed (·).',
        }}
      >
        {data.heatmap.cells.length === 0 ? (
          <p style={emptyTextStyle}>No availability data to display.</p>
        ) : (
          <AvailabilityHeatmap heatmap={data.heatmap} />
        )}
      </Panel>

      {/* Progression rates -- empty state since no source data yet */}
      <Panel title="Progression rates">
        {data.progression == null ? (
          <p style={emptyTextStyle}>
            Progression data will be available once SQA results are imported via the school portal. This view will show N5→Higher and Higher→Advanced Higher progression by subject.
          </p>
        ) : (
          <p style={emptyTextStyle}>No progression data available for the current filters.</p>
        )}
      </Panel>

      {/* Foundation Apprenticeships -- empty state since no source data yet */}
      <Panel title="Foundation Apprenticeships">
        {data.foundation_apprenticeships == null ? (
          <p style={emptyTextStyle}>
            Foundation Apprenticeship data will appear when schools record FA choices. This view will show framework uptake and the number of schools offering each FA pathway.
          </p>
        ) : (
          <p style={emptyTextStyle}>No Foundation Apprenticeship data for the current filters.</p>
        )}
      </Panel>
    </>
  )
}

function SingleSchoolBreadthSummary({ row }: { row: SubjectsTabData['curriculum_breadth'][number] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '16px',
      }}
    >
      <SummaryFigure label="Subjects offered" value={String(row.subjects_offered)} />
      <SummaryFigure
        label="Avg per student"
        value={row.avg_subjects_per_student == null ? '—' : row.avg_subjects_per_student.toFixed(1)}
      />
      <SummaryFigure label="Categories covered" value={`${row.subject_categories_covered}/8`} />
      <SummaryFigure
        label="Breadth index"
        value={row.curriculum_breadth_index == null ? '—' : `${row.curriculum_breadth_index.toFixed(1)}/10`}
      />
    </div>
  )
}

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

const emptyTextStyle: React.CSSProperties = {
  margin: 0,
  padding: '24px 0',
  color: '#94a3b8',
  fontStyle: 'italic',
  fontSize: '0.875rem',
  textAlign: 'center',
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
