'use client'

import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import { LabelRow } from './LabelRow'
import { NumericBar } from './NumericBar'
import { TierBar } from './TierBar'
import { EarningsSection } from './EarningsSection'
import { RoiSection } from './RoiSection'
import { FutureOutlookSection } from './FutureOutlookSection'

type EntryQualification =
  | 'none'
  | 'national_4'
  | 'national_5'
  | 'highers'
  | 'hnc'
  | 'hnd'
  | 'degree'
  | 'degree_plus_professional'

export interface RoleComparisonData {
  id: string
  title: string
  sectorName: string | null
  minEntryQualification: EntryQualification | null
  typicalEntryQualification: EntryQualification | null
  typicalStartingSalaryGbp: number | null
  typicalExperiencedSalaryGbp: number | null
  typicalEntryAge: number
  typicalHoursPerWeek: number
  hoursPattern: string | null
  physicalDemands: string | null
  remoteHybridRealistic: string | null
  stressLevel: string | null
  workLifeBalance: string | null
  jobSecurity: string | null
  emotionallyDemanding: string | null
  salaryProgressionSpeed: string | null
  competitionLevel: string | null
  selfEmploymentViability: string | null
  aiRating2030: number | null
  aiRating2040: number | null
  roboticsRating2030: number | null
  roboticsRating2040: number | null
  isNewAiRole: boolean
}

export interface ComparisonGridProps {
  roleIds: string[]
}

const QUALIFICATION_LABELS: Record<EntryQualification, string> = {
  none: 'None',
  national_4: 'National 4',
  national_5: 'National 5',
  highers: 'Highers',
  hnc: 'HNC',
  hnd: 'HND',
  degree: 'Degree',
  degree_plus_professional: 'Degree + professional',
}

// Scales ordered low → high (index 0 = lowest, last = highest).
const SCALE_JOB_SECURITY = ['Variable', 'Moderate', 'Secure', 'Very secure'] as const
const SCALE_WORK_LIFE_BALANCE = ['Challenging', 'Variable', 'Good'] as const
const SCALE_SELF_EMPLOYMENT = ['Rare', 'Possible', 'Common'] as const
const SCALE_STRESS = ['Low', 'Moderate', 'High', 'Very High'] as const
const SCALE_COMPETITION = ['Open', 'Moderate', 'Competitive', 'Highly competitive'] as const
const SCALE_PROGRESSION = ['Flat', 'Slow', 'Moderate', 'Fast'] as const
const SCALE_REMOTE = ['No', 'Rarely', 'Hybrid only', 'Yes'] as const

function formatQualification(q: EntryQualification | null): string | null {
  return q ? QUALIFICATION_LABELS[q] : null
}

async function fetchRoles(roleIds: string[]): Promise<RoleComparisonData[]> {
  if (roleIds.length === 0) return []
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('career_roles')
    .select(
      `id, title,
       ai_rating_2030_2035, ai_rating_2040_2045,
       robotics_rating_2030_2035, robotics_rating_2040_2045,
       is_new_ai_role,
       career_sectors(name),
       role_profiles(
         min_entry_qualification, typical_entry_qualification,
         typical_starting_salary_gbp, typical_experienced_salary_gbp,
         typical_entry_age, typical_hours_per_week,
         hours_pattern, physical_demands, remote_hybrid_realistic,
         stress_level, work_life_balance, job_security, emotionally_demanding,
         salary_progression_speed, competition_level, self_employment_viability
       )`,
    )
    .in('id', roleIds)

  if (error || !data) return []

  const byId = new Map<string, RoleComparisonData>()
  for (const row of data) {
    const profile = Array.isArray(row.role_profiles)
      ? row.role_profiles[0]
      : row.role_profiles
    const sector = Array.isArray(row.career_sectors)
      ? row.career_sectors[0]
      : row.career_sectors
    if (!profile) continue
    byId.set(row.id, {
      id: row.id,
      title: row.title,
      sectorName: sector?.name ?? null,
      minEntryQualification: (profile.min_entry_qualification ?? null) as EntryQualification | null,
      typicalEntryQualification: (profile.typical_entry_qualification ?? null) as EntryQualification | null,
      typicalStartingSalaryGbp: profile.typical_starting_salary_gbp ?? null,
      typicalExperiencedSalaryGbp: profile.typical_experienced_salary_gbp ?? null,
      typicalEntryAge: profile.typical_entry_age,
      typicalHoursPerWeek: profile.typical_hours_per_week,
      hoursPattern: profile.hours_pattern,
      physicalDemands: profile.physical_demands,
      remoteHybridRealistic: profile.remote_hybrid_realistic,
      stressLevel: profile.stress_level,
      workLifeBalance: profile.work_life_balance,
      jobSecurity: profile.job_security,
      emotionallyDemanding: profile.emotionally_demanding,
      salaryProgressionSpeed: profile.salary_progression_speed,
      competitionLevel: profile.competition_level,
      selfEmploymentViability: profile.self_employment_viability,
      aiRating2030: row.ai_rating_2030_2035 ?? null,
      aiRating2040: row.ai_rating_2040_2045 ?? null,
      roboticsRating2030: row.robotics_rating_2030_2035 ?? null,
      roboticsRating2040: row.robotics_rating_2040_2045 ?? null,
      isNewAiRole: row.is_new_ai_role === true,
    })
  }
  return roleIds.map((id) => byId.get(id)).filter((r): r is RoleComparisonData => Boolean(r))
}

function Section({
  title,
  defaultOpen,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  return (
    <details
      open={defaultOpen}
      style={{
        border: '1px solid var(--pf-grey-300)',
        borderRadius: '10px',
        background: 'var(--pf-white)',
        marginBottom: '12px',
        overflow: 'hidden',
      }}
    >
      <summary
        style={{
          cursor: 'pointer',
          padding: '14px 16px',
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--pf-grey-900)',
          listStyle: 'none',
        }}
      >
        {title}
      </summary>
      <div style={{ padding: '0 16px 12px' }}>{children}</div>
    </details>
  )
}

export function ComparisonGrid({ roleIds }: ComparisonGridProps) {
  const cacheKey = [...roleIds].sort().join('|')
  const { data: roles, isLoading } = useQuery({
    queryKey: ['comparison-grid', cacheKey],
    queryFn: () => fetchRoles(roleIds),
    staleTime: 1000 * 60 * 10,
  })

  if (isLoading) {
    return (
      <div
        style={{
          padding: '16px',
          border: '1px dashed var(--pf-grey-300)',
          borderRadius: '8px',
          color: 'var(--pf-grey-600)',
          fontSize: '0.875rem',
        }}
      >
        Loading comparison&hellip;
      </div>
    )
  }

  if (!roles || roles.length < 2) {
    return (
      <div
        style={{
          padding: '16px',
          border: '1px dashed var(--pf-grey-300)',
          borderRadius: '8px',
          color: 'var(--pf-grey-600)',
          fontSize: '0.875rem',
        }}
      >
        Could not load role data for the selected comparison.
      </div>
    )
  }

  const names = roles.map((r) => r.title)
  const hasCommonSelfEmployment = roles.some(
    (r) => r.selfEmploymentViability === 'Common',
  )
  const commonSelfEmploymentNames = roles
    .filter((r) => r.selfEmploymentViability === 'Common')
    .map((r) => r.title)

  return (
    <section
      aria-label="Career comparison grid"
      style={{ marginTop: '8px' }}
      className="pf-comparison-grid"
    >
      <Section title="Headline summary" defaultOpen>
        <LabelRow
          fieldName="Role"
          entries={roles.map((r) => ({
            careerName: r.title,
            value: r.isNewAiRole ? `${r.title}  • New AI role` : r.title,
          }))}
        />
        <LabelRow
          fieldName="Sector"
          entries={roles.map((r) => ({ careerName: r.title, value: r.sectorName }))}
        />
        <LabelRow
          fieldName="Minimum entry"
          entries={roles.map((r) => ({
            careerName: r.title,
            value: formatQualification(r.minEntryQualification)
              ? `Minimum: ${formatQualification(r.minEntryQualification)}`
              : null,
          }))}
        />
        <LabelRow
          fieldName="Typical entry"
          entries={roles.map((r) => ({
            careerName: r.title,
            value: formatQualification(r.typicalEntryQualification)
              ? `Typical: ${formatQualification(r.typicalEntryQualification)}`
              : null,
          }))}
        />
      </Section>

      <Section title="Earnings" defaultOpen>
        <EarningsSection roles={roles} />
      </Section>

      <Section title="Return on investment">
        <RoiSection roles={roles} />
      </Section>

      <Section title="Daily work">
        <NumericBar
          fieldName="Hours per week"
          entries={roles.map((r) => ({
            careerName: r.title,
            value: r.typicalHoursPerWeek,
            displayLabel: `${r.typicalHoursPerWeek} hours/week typical`,
          }))}
          maxForScale={60}
          referenceValue={37}
          referenceLabel="UK avg full-time (37 h)"
          unitSuffix=" hours/week"
        />
        <LabelRow
          fieldName="Hours pattern"
          entries={roles.map((r) => ({ careerName: r.title, value: r.hoursPattern }))}
        />
        <LabelRow
          fieldName="Physical demands"
          entries={roles.map((r) => ({
            careerName: r.title,
            value: r.physicalDemands,
          }))}
        />
        <TierBar
          fieldName="Remote / hybrid"
          scale={SCALE_REMOTE}
          direction="neutral"
          entries={roles.map((r) => ({
            careerName: r.title,
            tierLabel: r.remoteHybridRealistic,
          }))}
        />
      </Section>

      <Section title="Wellbeing">
        <TierBar
          fieldName="Stress level"
          scale={SCALE_STRESS}
          direction="negative"
          entries={roles.map((r) => ({
            careerName: r.title,
            tierLabel: r.stressLevel,
          }))}
        />
        <TierBar
          fieldName="Work-life balance"
          scale={SCALE_WORK_LIFE_BALANCE}
          direction="positive"
          entries={roles.map((r) => ({
            careerName: r.title,
            tierLabel: r.workLifeBalance,
          }))}
        />
        <TierBar
          fieldName="Job security"
          scale={SCALE_JOB_SECURITY}
          direction="positive"
          entries={roles.map((r) => ({
            careerName: r.title,
            tierLabel: r.jobSecurity,
          }))}
        />
        <LabelRow
          fieldName="Emotionally demanding"
          entries={roles.map((r) => ({
            careerName: r.title,
            value: r.emotionallyDemanding,
          }))}
        />
      </Section>

      <Section title="Career progression">
        <TierBar
          fieldName="Salary progression"
          scale={SCALE_PROGRESSION}
          direction="neutral"
          entries={roles.map((r) => ({
            careerName: r.title,
            tierLabel: r.salaryProgressionSpeed,
          }))}
        />
        <TierBar
          fieldName="Competition"
          scale={SCALE_COMPETITION}
          direction="negative"
          entries={roles.map((r) => ({
            careerName: r.title,
            tierLabel: r.competitionLevel,
          }))}
        />
        {hasCommonSelfEmployment ? (
          <div
            role="note"
            style={{
              margin: '8px 0 0',
              padding: '8px 12px',
              background: 'var(--pf-blue-50)',
              border: '1px solid var(--pf-blue-100)',
              borderRadius: '6px',
              color: 'var(--pf-blue-900)',
              fontSize: '0.8125rem',
            }}
          >
            Earnings for {commonSelfEmploymentNames.join(', ')} vary widely due to
            self-employment.
          </div>
        ) : null}
        <TierBar
          fieldName="Self-employment"
          scale={SCALE_SELF_EMPLOYMENT}
          direction="positive"
          entries={roles.map((r) => ({
            careerName: r.title,
            tierLabel: r.selfEmploymentViability,
          }))}
        />
      </Section>

      <Section title="Future outlook">
        <FutureOutlookSection roles={roles} />
      </Section>

      <Section title="Assumptions and caveats">
        <div
          style={{
            padding: '8px 0 4px',
            fontSize: '0.8125rem',
            color: 'var(--pf-grey-600)',
            lineHeight: 1.55,
          }}
        >
          <p style={{ margin: '6px 0' }}>
            Hours per week, stress level, work-life balance, and related tiers are
            UK-wide typical estimates from public sources, curated by the
            Pathfinder team. Individual roles, employers, and regions will vary.
          </p>
          <p style={{ margin: '6px 0' }}>
            Salary figures (entry and experienced) are typical UK values rounded to
            the nearest &pound;1,000. Scottish salaries can vary by employer,
            region, and sector.
          </p>
          <p style={{ margin: '6px 0' }}>
            For roles where self-employment is common (e.g. trades, creative, legal
            practice), actual earnings depend heavily on client base, marketing, and
            business overheads.
          </p>
          <p style={{ margin: '6px 0' }}>
            Roles in comparison: {names.join(', ')}.
          </p>
        </div>
      </Section>
    </section>
  )
}
