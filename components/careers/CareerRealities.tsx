'use client'

import { useState } from 'react'
import {
  getCareerRealities,
  getCareerRealitiesBySectorName,
  type CareerRealities as CareerRealitiesData,
  type JobSecurity,
  type Rating1To5,
} from '@/data/career-realities'

type IconProps = { className?: string; style?: React.CSSProperties }

// Inline SVG icons in the lucide-react style. lucide-react isn't a dependency
// in this project, so we draw them as inline strokes to match existing UI
// (e.g. components/ui/faq-accordion.tsx).
function ClockIcon({ style }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function WalletIcon({ style }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M20 12V8H6a2 2 0 0 1 0-4h12v4" />
      <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
    </svg>
  )
}

function TrendingUpIcon({ style }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}

function HeartIcon({ style }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function ChevronDownIcon({ style }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

// Colour the dots so that the meaning reads visually at a glance.
// Stress: 1 = low/good (green), 5 = high/bad (red).
// Work-life balance: 5 = good (green), 1 = bad (red).
function getDotColour(rating: Rating1To5, variant: 'stress' | 'worklife'): string {
  const stressPalette: Record<Rating1To5, string> = {
    1: 'var(--pf-green-500)',
    2: 'var(--pf-green-500)',
    3: 'var(--pf-amber-500)',
    4: 'var(--pf-amber-500)',
    5: 'var(--pf-red-500)',
  }
  const worklifePalette: Record<Rating1To5, string> = {
    1: 'var(--pf-red-500)',
    2: 'var(--pf-red-500)',
    3: 'var(--pf-amber-500)',
    4: 'var(--pf-green-500)',
    5: 'var(--pf-green-500)',
  }
  return variant === 'stress' ? stressPalette[rating] : worklifePalette[rating]
}

function RatingDots({
  rating,
  variant,
  label,
}: {
  rating: Rating1To5
  variant: 'stress' | 'worklife'
  label: string
}) {
  const colour = getDotColour(rating, variant)
  return (
    <div
      role="img"
      aria-label={`${label}: ${rating} out of 5`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= rating
        return (
          <span
            key={i}
            aria-hidden="true"
            style={{
              display: 'inline-block',
              width: '14px',
              height: '14px',
              borderRadius: '9999px',
              backgroundColor: filled ? colour : 'var(--pf-grey-100)',
              border: filled ? 'none' : '1px solid var(--pf-grey-300)',
            }}
          />
        )
      })}
      <span
        style={{
          marginLeft: '6px',
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'var(--pf-grey-600)',
        }}
      >
        {rating}/5
      </span>
    </div>
  )
}

const JOB_SECURITY_LABEL: Record<JobSecurity, string> = {
  high: 'High',
  'medium-high': 'Medium-high',
  medium: 'Medium',
  'medium-low': 'Medium-low',
  low: 'Low',
}

const JOB_SECURITY_BADGE: Record<JobSecurity, { bg: string; text: string }> = {
  high: { bg: 'rgba(16, 185, 129, 0.12)', text: '#047857' },
  'medium-high': { bg: 'rgba(16, 185, 129, 0.12)', text: '#047857' },
  medium: { bg: 'rgba(245, 158, 11, 0.12)', text: '#B45309' },
  'medium-low': { bg: 'rgba(245, 158, 11, 0.12)', text: '#B45309' },
  low: { bg: 'rgba(239, 68, 68, 0.12)', text: '#B91C1C' },
}

type DataRow = { label: string; value: string | React.ReactNode }

function DataList({ rows }: { rows: DataRow[] }) {
  return (
    <dl
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: '14px',
        margin: 0,
      }}
    >
      {rows.map((row) => (
        <div key={row.label}>
          <dt
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--pf-grey-900)',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              marginBottom: '4px',
            }}
          >
            {row.label}
          </dt>
          <dd
            style={{
              margin: 0,
              color: 'var(--pf-grey-600)',
              fontSize: '0.9375rem',
              lineHeight: 1.55,
            }}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

// Two-column "Entry / Senior" block for fields that differ between levels.
function EntrySeniorSplit({
  entryLabel,
  entryValue,
  seniorLabel,
  seniorValue,
}: {
  entryLabel: string
  entryValue: string
  seniorLabel: string
  seniorValue: string
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
      }}
    >
      {[
        { label: entryLabel, value: entryValue },
        { label: seniorLabel, value: seniorValue },
      ].map((col) => (
        <div
          key={col.label}
          style={{
            border: '1px solid var(--pf-grey-300)',
            borderRadius: '8px',
            padding: '12px 14px',
            backgroundColor: 'var(--pf-blue-50)',
          }}
        >
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--pf-blue-700)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '4px',
            }}
          >
            {col.label}
          </div>
          <div
            style={{
              color: 'var(--pf-grey-900)',
              fontSize: '0.9375rem',
              lineHeight: 1.5,
            }}
          >
            {col.value}
          </div>
        </div>
      ))}
    </div>
  )
}

type SectionKey = 'hours' | 'pay' | 'progression' | 'lifestyle'

type Section = {
  key: SectionKey
  title: string
  icon: (props: IconProps) => React.JSX.Element
  renderBody: (data: CareerRealitiesData) => React.ReactNode
}

const SECTIONS: Section[] = [
  {
    key: 'hours',
    title: 'Hours and patterns',
    icon: ClockIcon,
    renderBody: (data) => (
      <DataList
        rows={[
          { label: 'Contracted weekly hours', value: data.weeklyHoursContractual },
          { label: 'Hours in reality', value: data.weeklyHoursReality },
          { label: 'Work pattern', value: data.workPattern },
          { label: 'Remote or hybrid', value: data.remoteHybrid },
          { label: 'Weekend and evening work', value: data.weekendEvening },
        ]}
      />
    ),
  },
  {
    key: 'pay',
    title: 'Pay and benefits',
    icon: WalletIcon,
    renderBody: (data) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <EntrySeniorSplit
          entryLabel="Entry salary"
          entryValue={data.entrySalary}
          seniorLabel="Senior salary"
          seniorValue={data.seniorSalary}
        />
        <DataList
          rows={[
            { label: 'Pension', value: data.pension },
            { label: 'Sick pay', value: data.sickPay },
            { label: 'Maternity and paternity', value: data.maternityPaternity },
            { label: 'Overtime pay', value: data.overtimePay },
            { label: 'Notable perks', value: data.notablePerks },
          ]}
        />
      </div>
    ),
  },
  {
    key: 'progression',
    title: 'Progression and security',
    icon: TrendingUpIcon,
    renderBody: (data) => (
      <DataList
        rows={[
          { label: 'Progression speed', value: data.progressionSpeed },
          {
            label: 'Job security',
            value: (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  borderRadius: '9999px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  padding: '4px 12px',
                  backgroundColor: JOB_SECURITY_BADGE[data.jobSecurity].bg,
                  color: JOB_SECURITY_BADGE[data.jobSecurity].text,
                }}
              >
                {JOB_SECURITY_LABEL[data.jobSecurity]}
              </span>
            ),
          },
          { label: 'Redundancy risk', value: data.redundancyRisk },
          { label: 'CPD requirements', value: data.cpdRequirements },
          { label: 'Qualification costs', value: data.qualificationCosts },
          { label: 'Notice period', value: data.noticePeriod },
        ]}
      />
    ),
  },
  {
    key: 'lifestyle',
    title: 'Lifestyle impact',
    icon: HeartIcon,
    renderBody: (data) => (
      <DataList
        rows={[
          {
            label: 'Stress level',
            value: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <RatingDots rating={data.stressLevel} variant="stress" label="Stress level" />
                <span>{data.stressExplanation}</span>
              </div>
            ),
          },
          {
            label: 'Work-life balance',
            value: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <RatingDots
                  rating={data.workLifeBalance}
                  variant="worklife"
                  label="Work-life balance"
                />
                <span>{data.workLifeExplanation}</span>
              </div>
            ),
          },
          { label: 'Physical demands', value: data.physicalDemands },
          { label: 'Dress code', value: data.dressCode },
          { label: 'Travel requirements', value: data.travelRequirements },
          { label: 'Part-time availability', value: data.partTimeAvailability },
          { label: 'Union representation', value: data.unionRepresentation },
        ]}
      />
    ),
  },
]

export interface CareerRealitiesProps {
  sectorSlug?: string
  // Allows the page to pass the DB `career_sectors.name` value directly --
  // the component resolves the data slug via SECTOR_NAME_TO_REALITIES_SLUG.
  sectorName?: string | null
}

export function CareerRealities({ sectorSlug, sectorName }: CareerRealitiesProps) {
  const data = sectorSlug
    ? getCareerRealities(sectorSlug)
    : getCareerRealitiesBySectorName(sectorName)
  // All cards collapsed by default -- student opens the ones they care about.
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set())

  if (!data) {
    return null
  }

  const toggle = (key: SectionKey) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  return (
    <section aria-labelledby="career-realities-heading">
      <div style={{ marginBottom: '20px' }}>
        <h2
          id="career-realities-heading"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--pf-grey-900)',
            margin: 0,
            marginBottom: '6px',
          }}
        >
          What&rsquo;s the work actually like?
        </h2>
        <p
          style={{
            margin: 0,
            color: 'var(--pf-grey-600)',
            fontSize: '0.9375rem',
            lineHeight: 1.55,
          }}
        >
          The honest details about working in this sector -- hours, pay, progression, and
          lifestyle.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {SECTIONS.map((section) => {
          const isOpen = openSections.has(section.key)
          const panelId = `career-realities-panel-${section.key}`
          const buttonId = `career-realities-button-${section.key}`
          const Icon = section.icon

          return (
            <div
              key={section.key}
              className="pf-card-flat"
              style={{
                backgroundColor: 'var(--pf-white)',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden',
              }}
            >
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(section.key)}
                className="focus-ring"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  padding: '18px 22px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '1.0625rem',
                  color: 'var(--pf-grey-900)',
                  lineHeight: 1.4,
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '9999px',
                      backgroundColor: 'var(--pf-blue-100)',
                      color: 'var(--pf-blue-700)',
                      flexShrink: 0,
                    }}
                  >
                    <Icon />
                  </span>
                  <span>{section.title}</span>
                </span>
                <ChevronDownIcon
                  style={{
                    flexShrink: 0,
                    color: 'var(--pf-blue-700)',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease',
                  }}
                />
              </button>

              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                style={{
                  display: 'grid',
                  gridTemplateRows: isOpen ? '1fr' : '0fr',
                  transition: 'grid-template-rows 0.25s ease',
                }}
              >
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '0 22px 22px' }}>{section.renderBody(data)}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <p
        style={{
          marginTop: '16px',
          marginBottom: 0,
          color: 'var(--pf-grey-600)',
          fontSize: '0.8125rem',
          lineHeight: 1.5,
          fontStyle: 'italic',
        }}
      >
        Working conditions vary by employer, location, and role. These are typical ranges
        based on national data and industry agreements, not guarantees.
      </p>
    </section>
  )
}

export default CareerRealities
