'use client'

import Link from 'next/link'
import { WideningAccessCard } from './widening-access-card'
import { SCHOOL_STAGES } from '@/lib/constants'
import type { Tables } from '@/types/database'

type Student = Tables<'students'>

const STAGE_KEY_DATES: Array<{
  stage: keyof typeof SCHOOL_STAGES
  dates: string
  description: string
}> = [
  {
    stage: 's2',
    dates: 'January \u2013 March (S2 year)',
    description:
      'Most schools open S3 subject choices in the second half of S2. Your child will pick 6 subjects plus English and Maths.',
  },
  {
    stage: 's3',
    dates: 'February \u2013 April (S3 year)',
    description:
      'Schools confirm National 4 / 5 subjects for S4. Around 7 subjects continue, including any compulsory ones.',
  },
  {
    stage: 's4',
    dates: 'February \u2013 May (S4 year)',
    description:
      'Higher choices for S5. This is the year most Scottish university entry requirements are based on.',
  },
  {
    stage: 's5',
    dates: 'March \u2013 June (S5 year)',
    description:
      'Advanced Higher and crash Higher choices for S6. UCAS applications open in early September of S6.',
  },
  {
    stage: 's6',
    dates: 'September \u2013 January (S6 year)',
    description:
      'UCAS application window. The 15 January deadline applies for most undergraduate courses.',
  },
]

const STAGE_GUIDANCE: Record<string, { title: string; copy: string }> = {
  s2: {
    title: 'S3 subject choices coming up',
    copy: 'In the next few months your child will pick 6 subjects plus English and Maths. The Pathways planner shows what is available in each curricular area.',
  },
  s3: {
    title: 'National 4 / 5 year ahead',
    copy: 'Your child narrows to about 7 subjects. The simulator helps compare combinations \u2014 it is worth running a few options together.',
  },
  s4: {
    title: 'Higher year is the big one',
    copy: 'Most Scottish university entry requirements are based on Higher results. The Courses page lists what each course needs.',
  },
  s5: {
    title: 'Advanced Highers and applications',
    copy: 'Advanced Highers add depth and crash Highers can boost grades. UCAS applications open in early September.',
  },
  s6: {
    title: 'Application year',
    copy: 'UCAS applications close on 15 January for most courses. The Saved page lets your child track shortlists.',
  },
}

const PARENT_QUICK_ACTIONS: Array<{
  href: string
  title: string
  subtitle: string
  icon: React.ReactNode
}> = [
  {
    href: '/pathways',
    title: 'Explore subject choices',
    subtitle: 'See what is available at each stage',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: '/courses',
    title: 'Check university courses',
    subtitle: 'Browse Scottish entry requirements',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    href: '/widening-access',
    title: 'See widening access support',
    subtitle: 'Adjusted offers for SIMD20/40 and more',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    href: '/simulator',
    title: 'Use the simulator',
    subtitle: 'Compare different subject combinations',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 14l3-3 4 4 6-6" />
      </svg>
    ),
  },
  {
    href: '/parents',
    title: 'Read the parent guide',
    subtitle: 'Plain-language overview and FAQs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
]

export function ParentDashboard({ student }: { student: Student }) {
  const stage = (student.school_stage ?? 's4') as keyof typeof SCHOOL_STAGES
  const stageLabel = SCHOOL_STAGES[stage]?.label ?? 'Senior phase'
  const guidance = STAGE_GUIDANCE[stage] ?? STAGE_GUIDANCE.s4
  const upcomingDates = STAGE_KEY_DATES.filter(
    (d) => stageOrder(d.stage) >= stageOrder(stage)
  )
  const datesToShow = upcomingDates.length > 0 ? upcomingDates : STAGE_KEY_DATES
  const displayName = student.first_name || 'there'

  return (
    <div className="pf-container pt-8 sm:pt-10 pb-12 sm:pb-16">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <span className="pf-badge-blue inline-flex" style={{ marginBottom: '12px' }}>
          Parent / carer dashboard
        </span>
        <h1
          style={{ marginBottom: '4px', fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}
          className="break-words"
        >
          Welcome back, {displayName}
        </h1>
        <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
          Your child is currently in <strong>{stageLabel}</strong>. Here is what to know
          and where to look next.
        </p>
      </div>

      {/* Quick actions */}
      <div className="pf-card mb-6">
        <h2 style={{ marginBottom: '16px', fontSize: '1.125rem' }}>Quick actions</h2>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
        >
          {PARENT_QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 transition-colors no-underline hover:no-underline"
              style={{
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid var(--pf-grey-300)',
                backgroundColor: 'var(--pf-white)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--pf-blue-50)'
                e.currentTarget.style.borderColor = 'var(--pf-blue-700)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--pf-white)'
                e.currentTarget.style.borderColor = 'var(--pf-grey-300)'
              }}
            >
              <div
                className="rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'var(--pf-blue-100)',
                  color: 'var(--pf-blue-700)',
                }}
              >
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    color: 'var(--pf-grey-900)',
                    fontSize: '0.9375rem',
                  }}
                >
                  {action.title}
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                  {action.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Widening access (re-uses student card; hidden if not eligible) */}
      <div className="mb-6">
        <WideningAccessCard />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stage-specific guidance */}
          <div className="pf-card">
            <h2 style={{ marginBottom: '8px', fontSize: '1.125rem' }}>
              Understanding your child&apos;s options
            </h2>
            <p
              style={{
                color: 'var(--pf-blue-700)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.875rem',
                marginBottom: '4px',
              }}
            >
              {guidance.title}
            </p>
            <p style={{ color: 'var(--pf-grey-600)', marginBottom: '16px' }}>
              {guidance.copy}
            </p>
            <Link
              href="/pathways"
              className="pf-btn pf-btn-secondary pf-btn-sm"
              style={{ minHeight: '40px' }}
            >
              Open the pathway planner
            </Link>
          </div>

          {/* Key dates */}
          <div className="pf-card">
            <h2 style={{ marginBottom: '8px', fontSize: '1.125rem' }}>Key dates</h2>
            <p style={{ color: 'var(--pf-grey-600)', marginBottom: '16px', fontSize: '0.9375rem' }}>
              When subject choices typically happen in Scottish schools. Your child&apos;s
              school will share the exact dates.
            </p>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {datesToShow.map((d, idx) => (
                <li
                  key={d.stage}
                  style={{
                    display: 'flex',
                    gap: '14px',
                    padding: '12px 0',
                    borderTop: idx === 0 ? 'none' : '1px solid var(--pf-grey-100)',
                  }}
                >
                  <span
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '9999px',
                      backgroundColor:
                        d.stage === stage ? 'var(--pf-blue-700)' : 'var(--pf-blue-100)',
                      color: d.stage === stage ? '#fff' : 'var(--pf-blue-700)',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {SCHOOL_STAGES[d.stage]?.label ?? d.stage.toUpperCase()}
                  </span>
                  <div>
                    <p
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        color: 'var(--pf-grey-900)',
                        margin: 0,
                      }}
                    >
                      {d.dates}
                    </p>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--pf-grey-600)',
                        margin: '2px 0 0',
                      }}
                    >
                      {d.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Parent-student linking note */}
          <div
            className="pf-card"
            style={{
              backgroundColor: 'var(--pf-blue-50)',
              borderLeft: '4px solid var(--pf-blue-700)',
            }}
          >
            <h2 style={{ marginBottom: '8px', fontSize: '1.0625rem' }}>
              Want to see your child&apos;s subject choices?
            </h2>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', marginBottom: 0 }}>
              Ask them to share their Pathfinder simulator link with you. They can copy
              a read-only link from their own dashboard with their saved subjects
              pre-loaded \u2014 no account linking required.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile summary card */}
          <div className="pf-card">
            <h2 style={{ marginBottom: '12px', fontSize: '1.125rem' }}>Your details</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <ProfileRow label="Name" value={`${student.first_name ?? ''} ${student.last_name ?? ''}`.trim() || '\u2014'} />
              <ProfileRow label="Email" value={student.email} />
              <ProfileRow label="Child's stage" value={stageLabel} />
              {student.school_name && (
                <ProfileRow label="School" value={student.school_name} />
              )}
              {student.postcode && <ProfileRow label="Postcode" value={student.postcode} />}
              {student.simd_decile != null && (
                <ProfileRow label="SIMD decile" value={String(student.simd_decile)} />
              )}
            </ul>
          </div>

          {/* External school link */}
          {student.school_name && (
            <div
              className="pf-card"
              style={{ backgroundColor: 'var(--pf-blue-900)', color: '#fff' }}
            >
              <h2 style={{ color: '#fff', marginBottom: '8px', fontSize: '1rem' }}>
                Check your school&apos;s website
              </h2>
              <p
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.875rem',
                  marginBottom: '12px',
                }}
              >
                {student.school_name} will publish exact dates for subject choices on
                their website.
              </p>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(
                  student.school_name + ' Scotland subject choices'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#fff',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textDecoration: 'underline',
                }}
              >
                Search the school website
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <li
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '8px 0',
        borderBottom: '1px solid var(--pf-grey-100)',
        fontSize: '0.875rem',
      }}
    >
      <span style={{ color: 'var(--pf-grey-600)' }}>{label}</span>
      <span
        style={{
          color: 'var(--pf-grey-900)',
          fontWeight: 500,
          textAlign: 'right',
          maxWidth: '60%',
          overflowWrap: 'anywhere',
        }}
      >
        {value}
      </span>
    </li>
  )
}

const STAGE_INDEX = ['s2', 's3', 's4', 's5', 's6'] as const
function stageOrder(stage: string): number {
  const idx = STAGE_INDEX.indexOf(stage as (typeof STAGE_INDEX)[number])
  return idx >= 0 ? idx : 99
}
