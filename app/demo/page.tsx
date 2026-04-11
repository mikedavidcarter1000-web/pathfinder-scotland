import type { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { DemoProgressIndicator, type DemoStep } from './demo-progress-indicator'

export const metadata: Metadata = {
  title: {
    absolute: 'Demo | Pathfinder Scotland — Subject Choice Guidance for Scottish Students',
  },
  description:
    'See how Pathfinder helps Scottish students make informed subject choices, check university eligibility, and access widening access support.',
  alternates: { canonical: '/demo' },
}

const STEPS: DemoStep[] = [
  { id: 'step-1', number: 1, shortTitle: 'The problem' },
  { id: 'step-2', number: 2, shortTitle: 'Discover' },
  { id: 'step-3', number: 3, shortTitle: 'Simulator' },
  { id: 'step-4', number: 4, shortTitle: 'Widening access' },
  { id: 'step-5', number: 5, shortTitle: 'Eligibility' },
  { id: 'step-6', number: 6, shortTitle: 'Transitions' },
  { id: 'step-7', number: 7, shortTitle: 'For parents' },
  { id: 'step-8', number: 8, shortTitle: 'Compare' },
  { id: 'step-9', number: 9, shortTitle: 'Get involved' },
]

type DemoStats = {
  subjects: number
  courses: number
  universities: number
  postcodes: number
}

async function getDemoStats(): Promise<DemoStats> {
  try {
    const supabase = await createServerSupabaseClient()
    const [subs, crs, unis, postcodes] = await Promise.all([
      supabase.from('subjects').select('id', { count: 'exact', head: true }),
      supabase.from('courses').select('id', { count: 'exact', head: true }),
      supabase.from('universities').select('id', { count: 'exact', head: true }),
      supabase.from('simd_postcodes').select('id', { count: 'exact', head: true }),
    ])
    return {
      subjects: subs.count ?? 81,
      courses: crs.count ?? 400,
      universities: unis.count ?? 16,
      postcodes: postcodes.count ?? 227066,
    }
  } catch {
    return { subjects: 81, courses: 400, universities: 16, postcodes: 227066 }
  }
}

export default async function DemoPage() {
  const stats = await getDemoStats()
  const formattedPostcodes = stats.postcodes.toLocaleString('en-GB')

  return (
    <div>
      <DemoProgressIndicator steps={STEPS} />

      {/* Hero */}
      <section
        className="py-16 sm:py-20"
        style={{
          backgroundColor: 'var(--pf-blue-50)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="pf-container relative" style={{ zIndex: 1 }}>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <span className="pf-badge-blue mb-4 inline-flex" style={{ marginBottom: '20px' }}>
                For schools and funders
              </span>
              <h1
                style={{
                  fontSize: 'clamp(1.875rem, 5vw, 3rem)',
                  lineHeight: 1.1,
                  marginBottom: '20px',
                  color: 'var(--pf-grey-900)',
                }}
              >
                See Pathfinder Scotland in action
              </h1>
              <p
                style={{
                  fontSize: '1.0625rem',
                  color: 'var(--pf-grey-600)',
                  lineHeight: 1.6,
                  marginBottom: '32px',
                  maxWidth: '560px',
                }}
              >
                A 3-minute walkthrough showing how we help Scottish students make better subject
                choices — from S2 all the way to university offers.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#step-1"
                  className="pf-btn-primary w-full sm:w-auto justify-center"
                >
                  Start the tour
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </a>
                <a
                  href="mailto:hello@pathfinderscot.co.uk?subject=Demo%20request"
                  className="pf-btn-secondary w-full sm:w-auto justify-center"
                >
                  Request a meeting
                </a>
              </div>
              <div
                className="flex flex-wrap items-center gap-x-6 gap-y-2"
                style={{ marginTop: '32px' }}
              >
                <TrustItem label="No sign-up required" />
                <TrustItem label="3 minutes end-to-end" />
                <TrustItem label="Live product data" />
              </div>
            </div>

            <div className="flex items-center justify-center">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Step 1 — The problem */}
      <Step
        id="step-1"
        number={1}
        title="The problem we solve"
        background="white"
        body="Scottish students choose subjects at the end of S2 that shape their entire future. Most get a paper form and little guidance. Pathfinder fills the gap between 'what subjects should I pick?' and 'what does that lead to?'"
      >
        <div className="grid grid-cols-2 gap-4">
          <StatCard value={`${stats.subjects}`} label="SQA subjects mapped" />
          <StatCard value={`${stats.courses}+`} label="University courses" />
          <StatCard value={`${stats.universities}`} label="Scottish universities" />
          <StatCard value={formattedPostcodes} label="Postcodes checked for widening access" compact />
        </div>
      </Step>

      {/* Step 2 — Discover */}
      <Step
        id="step-2"
        number={2}
        title="For students who don't know what they want"
        background="grey"
        body="Many S2 students have no idea what career they want. Our Discover tool gives them two paths: explore by interest or search by career goal."
        ctaLabel="Try the Discover tool"
        ctaHref="/discover"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <DiscoverPreviewCard
            tag="Career in mind"
            title="I have an idea"
            description="Search by career goal and we'll show you every path that leads there — the subjects, qualifications and universities that connect."
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
          <DiscoverPreviewCard
            tag="Still exploring"
            title="I'm still exploring"
            description="Answer a few questions about what you enjoy and we'll surface careers, subjects and courses that match your interests."
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
          />
        </div>
      </Step>

      {/* Step 3 — Simulator */}
      <Step
        id="step-3"
        number={3}
        title="See where your subjects lead"
        background="white"
        body="Our simulator is unique — no other platform shows the real-time impact of subject choices. Students see which university courses open up, which close off, and which career sectors they'd cover."
        ctaLabel="Try the Simulator"
        ctaHref="/simulator"
      >
        <SimulatorMockCard totalCourses={stats.courses} />
      </Step>

      {/* Step 4 — Widening access */}
      <Step
        id="step-4"
        number={4}
        title="Widening access built in"
        background="grey"
        body="Students from disadvantaged backgrounds may qualify for reduced university entry requirements. Pathfinder checks automatically using their postcode and personal circumstances — SIMD20/40, care experience, young carers, first-generation university."
        ctaLabel="Learn about widening access"
        ctaHref="/widening-access"
      >
        <WideningAccessMockCard />
      </Step>

      {/* Step 5 — Eligibility */}
      <Step
        id="step-5"
        number={5}
        title="From subjects to university"
        background="white"
        body="Students enter their grades and instantly see which courses they qualify for across all Scottish universities. Eligibility matching factors in widening access adjustments automatically."
        ctaLabel="Browse university courses"
        ctaHref="/courses"
      >
        <EligibilityMockCard />
      </Step>

      {/* Step 6 — Transitions */}
      <Step
        id="step-6"
        number={6}
        title="Plan every transition"
        background="grey"
        body="Pathfinder covers every subject choice point in Scottish education — from S2 into S3 right through to S6 and university. At each stage, students see exactly how many subjects to choose, what's compulsory, and what the rules are."
        ctaLabel="Try the Pathway Planner"
        ctaHref="/pathways"
      >
        <div className="grid grid-cols-2 gap-4">
          <YearCard
            year="S3"
            summary="8 subjects"
            detail="2 compulsory + 6 choices + 1 reserve"
          />
          <YearCard
            year="S4"
            summary="7 subjects"
            detail="National 4/5 exam year"
          />
          <YearCard
            year="S5"
            summary="5 subjects"
            detail="The Higher year"
          />
          <YearCard
            year="S6"
            summary="3-4 Advanced Highers"
            detail="Plus enrichment options"
          />
        </div>
      </Step>

      {/* Step 7 — Parents */}
      <Step
        id="step-7"
        number={7}
        title="For parents too"
        background="white"
        body="Parents are critical influencers in subject choices. Pathfinder gives them a plain-language guide, a dedicated parent account, and tools to explore alongside their child."
        ctaLabel="See the parent experience"
        ctaHref="/parents"
      >
        <ParentPreviewCard />
      </Step>

      {/* Step 8 — Comparison table */}
      <section
        id="step-8"
        className="pf-section pf-section-grey"
      >
        <div className="pf-container">
          <div className="text-center" style={{ marginBottom: '40px' }}>
            <span className="pf-badge-blue inline-flex" style={{ marginBottom: '16px' }}>
              Step 8
            </span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '12px' }}>
              What makes us different
            </h2>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', maxWidth: '640px', margin: '0 auto' }}>
              A direct comparison of how Pathfinder covers Scottish-specific needs that generic
              platforms miss.
            </p>
          </div>
          <ComparisonTable />
        </div>
      </section>

      {/* Step 9 — Get involved (dark) */}
      <section
        id="step-9"
        className="pf-section"
        style={{ backgroundColor: 'var(--pf-blue-900)', color: '#fff' }}
      >
        <div className="pf-container">
          <div className="text-center" style={{ marginBottom: '48px' }}>
            <span
              className="pf-badge inline-flex"
              style={{
                marginBottom: '16px',
                backgroundColor: 'rgba(255,255,255,0.12)',
                color: '#fff',
              }}
            >
              Step 9
            </span>
            <h2
              style={{
                color: '#fff',
                fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                marginBottom: '16px',
              }}
            >
              Bring Pathfinder to your school
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '1.0625rem',
                maxWidth: '640px',
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              We&apos;re building Pathfinder for every Scottish student. Whether you run a school or
              fund the sector, we&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6" style={{ marginBottom: '64px' }}>
            <InvolvedCard
              badge="For schools"
              title="I'm a school"
              description="Register interest in our pilot programme. We'll work with your guidance team to integrate Pathfinder into your subject choice process."
              ctaLabel="Register school interest"
              ctaHref="mailto:hello@pathfinderscot.co.uk?subject=Pilot%20school%20interest"
            />
            <InvolvedCard
              badge="For funders"
              title="I'm a funder"
              description="We're seeking funding to bring Pathfinder to every Scottish student, with a focus on widening access and reducing inequality in guidance."
              ctaLabel="Request a meeting"
              ctaHref="mailto:hello@pathfinderscot.co.uk?subject=Funding%20enquiry"
            />
          </div>

          <div>
            <h3
              style={{
                color: '#fff',
                fontSize: '1.25rem',
                marginBottom: '24px',
                textAlign: 'center',
              }}
            >
              Our roadmap
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <RoadmapCard
                phase="Phase 1"
                when="Now"
                items={[
                  'Subject guidance',
                  'University matching',
                  'Widening access identification',
                ]}
                active
              />
              <RoadmapCard
                phase="Phase 2"
                when="Next"
                items={[
                  'Bursary finder',
                  'School-specific timetable integration',
                  'Career profiles',
                ]}
              />
              <RoadmapCard
                phase="Phase 3"
                when="Future"
                items={[
                  'Employer connections',
                  'Scotland-wide rollout',
                  'Other UK nations',
                ]}
              />
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '56px' }}>
            <Link
              href="/"
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.9375rem',
                textDecoration: 'none',
              }}
            >
              Back to the homepage →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

/* -------------------------------------------------------------- */
/* Section wrapper                                                  */
/* -------------------------------------------------------------- */

function Step({
  id,
  number,
  title,
  background,
  body,
  ctaLabel,
  ctaHref,
  children,
}: {
  id: string
  number: number
  title: string
  background: 'white' | 'grey'
  body: string
  ctaLabel?: string
  ctaHref?: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className={`pf-section ${background === 'white' ? 'pf-section-white' : 'pf-section-grey'}`}
      style={{ scrollMarginTop: '80px' }}
    >
      <div className="pf-container">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <span className="pf-badge-blue inline-flex" style={{ marginBottom: '16px' }}>
              Step {number}
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                marginBottom: '16px',
                color: 'var(--pf-grey-900)',
              }}
            >
              {title}
            </h2>
            <p
              style={{
                fontSize: '1.0625rem',
                color: 'var(--pf-grey-600)',
                lineHeight: 1.6,
                marginBottom: ctaLabel ? '24px' : 0,
              }}
            >
              {body}
            </p>
            {ctaLabel && ctaHref && (
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
                style={{
                  color: 'var(--pf-blue-700)',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  textDecoration: 'none',
                }}
              >
                {ctaLabel}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            )}
          </div>
          <div>{children}</div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------- */
/* Visual components                                                */
/* -------------------------------------------------------------- */

function TrustItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <svg
        className="w-4 h-4"
        style={{ color: 'var(--pf-green-500)' }}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <span style={{ fontSize: '0.875rem', color: 'var(--pf-grey-900)', fontWeight: 500 }}>
        {label}
      </span>
    </div>
  )
}

function StatCard({
  value,
  label,
  compact,
}: {
  value: string
  label: string
  compact?: boolean
}) {
  return (
    <div
      className="pf-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '120px',
      }}
    >
      <div
        className="pf-data-number"
        style={{
          fontSize: compact ? '1.5rem' : '2rem',
          fontWeight: 700,
          color: 'var(--pf-blue-700)',
          lineHeight: 1.1,
          marginBottom: '6px',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: '0.875rem',
          color: 'var(--pf-grey-600)',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 500,
          lineHeight: 1.3,
        }}
      >
        {label}
      </div>
    </div>
  )
}

function DiscoverPreviewCard({
  tag,
  title,
  description,
  icon,
}: {
  tag: string
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="pf-card">
      <div
        className="flex items-center justify-center mb-4"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '10px',
          backgroundColor: 'var(--pf-blue-100)',
          color: 'var(--pf-blue-700)',
        }}
      >
        {icon}
      </div>
      <span
        className="pf-badge-blue inline-flex"
        style={{ marginBottom: '12px' }}
      >
        {tag}
      </span>
      <h3 style={{ marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.5 }}>
        {description}
      </p>
    </div>
  )
}

function SimulatorMockCard({ totalCourses }: { totalCourses: number }) {
  const selected = [
    { name: 'English', area: 'languages' },
    { name: 'Maths', area: 'mathematics' },
    { name: 'Biology', area: 'sciences' },
    { name: 'Chemistry', area: 'sciences' },
    { name: 'History', area: 'social' },
    { name: 'French', area: 'languages' },
  ] as const

  return (
    <div className="pf-card" style={{ padding: '28px' }}>
      <div style={{ marginBottom: '20px' }}>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '0.75rem',
            color: 'var(--pf-grey-600)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Selected subjects
        </span>
      </div>
      <div className="flex flex-wrap gap-2" style={{ marginBottom: '24px' }}>
        {selected.map((s) => (
          <span key={s.name} className={`pf-area-badge pf-area-${s.area}-badge`}>
            {s.name}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '20px' }}>
        <div
          style={{
            backgroundColor: 'var(--pf-blue-50)',
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <div
            className="pf-data-number"
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--pf-blue-700)',
              lineHeight: 1.1,
            }}
          >
            351
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginTop: '4px' }}>
            of {totalCourses}+ courses eligible
          </div>
        </div>
        <div
          style={{
            backgroundColor: 'var(--pf-blue-50)',
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <div
            className="pf-data-number"
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--pf-blue-700)',
              lineHeight: 1.1,
            }}
          >
            12 / 16
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginTop: '4px' }}>
            career sectors covered
          </div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          borderLeft: '3px solid var(--pf-green-500)',
          borderRadius: '6px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}
      >
        <svg
          className="w-5 h-5 flex-shrink-0"
          style={{ color: 'var(--pf-green-500)', marginTop: '1px' }}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <div style={{ fontSize: '0.875rem', color: 'var(--pf-grey-900)', lineHeight: 1.5 }}>
          <strong style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
            Adding Physics
          </strong>{' '}
          would open <strong>43 more courses</strong> including Engineering and Physics degrees.
        </div>
      </div>
    </div>
  )
}

function WideningAccessMockCard() {
  return (
    <div className="pf-card" style={{ padding: '28px' }}>
      <div style={{ marginBottom: '20px' }}>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '0.75rem',
            color: 'var(--pf-grey-600)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Example
        </span>
        <h3 style={{ marginTop: '6px', marginBottom: 0 }}>
          Medicine at University of Aberdeen
        </h3>
      </div>
      <div className="space-y-3">
        <OfferRow label="Standard offer" value="AAAAB" />
        <OfferRow label="SIMD20 adjusted offer" value="AABBB" highlight />
        <OfferRow label="Care experienced offer" value="AABBB" highlight last />
      </div>
      <div
        style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--pf-grey-300)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.8125rem',
          color: 'var(--pf-grey-600)',
        }}
      >
        <svg
          className="w-4 h-4 flex-shrink-0"
          style={{ color: 'var(--pf-amber-500)' }}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Adjustments shown automatically based on postcode and circumstances.</span>
      </div>
    </div>
  )
}

function OfferRow({
  label,
  value,
  highlight,
  last,
}: {
  label: string
  value: string
  highlight?: boolean
  last?: boolean
}) {
  return (
    <div
      className="flex justify-between items-center"
      style={{
        paddingBottom: last ? 0 : '12px',
        borderBottom: last ? 'none' : '1px solid var(--pf-grey-300)',
      }}
    >
      <span style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>{label}</span>
      <span
        className="pf-data-number"
        style={{
          fontSize: '1rem',
          color: highlight ? 'var(--pf-green-500)' : 'var(--pf-grey-900)',
          fontWeight: 600,
        }}
      >
        {value}
      </span>
    </div>
  )
}

function EligibilityMockCard() {
  const grades = [
    { subject: 'Higher English', grade: 'A' },
    { subject: 'Higher Maths', grade: 'B' },
    { subject: 'Higher Chemistry', grade: 'A' },
    { subject: 'Higher Biology', grade: 'B' },
    { subject: 'Higher History', grade: 'C' },
  ]

  const matches = [
    { course: 'Biomedical Sciences', uni: 'University of Edinburgh' },
    { course: 'Chemistry', uni: 'University of Glasgow' },
    { course: 'Pharmacology', uni: 'University of Strathclyde' },
  ]

  return (
    <div className="pf-card" style={{ padding: '28px' }}>
      <div style={{ marginBottom: '20px' }}>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '0.75rem',
            color: 'var(--pf-grey-600)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Your grades
        </span>
      </div>

      <div className="space-y-2" style={{ marginBottom: '20px' }}>
        {grades.map((g) => (
          <div
            key={g.subject}
            className="flex justify-between items-center"
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--pf-blue-50)',
              borderRadius: '6px',
            }}
          >
            <span style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-900)' }}>{g.subject}</span>
            <span
              className="pf-data-number"
              style={{
                fontSize: '0.9375rem',
                color: 'var(--pf-blue-700)',
                fontWeight: 700,
              }}
            >
              {g.grade}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          borderLeft: '3px solid var(--pf-green-500)',
          borderRadius: '6px',
          padding: '14px 16px',
          marginBottom: '20px',
        }}
      >
        <div
          className="pf-data-number"
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--pf-green-500)',
            lineHeight: 1.1,
          }}
        >
          Eligible for 52 courses
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginTop: '4px' }}>
          Including 12 via widening access
        </div>
      </div>

      <div>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '0.75rem',
            color: 'var(--pf-grey-600)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '10px',
          }}
        >
          Example matches
        </div>
        <div className="space-y-2">
          {matches.map((m) => (
            <div
              key={m.course}
              className="flex justify-between items-center"
              style={{
                padding: '10px 0',
                borderBottom: '1px solid var(--pf-grey-300)',
                fontSize: '0.875rem',
              }}
            >
              <span style={{ color: 'var(--pf-grey-900)', fontWeight: 500 }}>{m.course}</span>
              <span style={{ color: 'var(--pf-grey-600)' }}>{m.uni}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function YearCard({
  year,
  summary,
  detail,
}: {
  year: string
  summary: string
  detail: string
}) {
  return (
    <div className="pf-card" style={{ padding: '20px' }}>
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '1.5rem',
          color: 'var(--pf-blue-700)',
          marginBottom: '8px',
        }}
      >
        {year}
      </div>
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '1rem',
          color: 'var(--pf-grey-900)',
          marginBottom: '4px',
        }}
      >
        {summary}
      </div>
      <div style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', lineHeight: 1.4 }}>
        {detail}
      </div>
    </div>
  )
}

function ParentPreviewCard() {
  return (
    <div
      className="pf-card"
      style={{ padding: '32px', backgroundColor: 'var(--pf-blue-50)' }}
    >
      <span className="pf-badge-blue inline-flex" style={{ marginBottom: '16px' }}>
        For parents and carers
      </span>
      <h3 style={{ fontSize: '1.375rem', marginBottom: '12px' }}>
        Help your child choose well — without feeling in the dark.
      </h3>
      <p
        style={{
          color: 'var(--pf-grey-600)',
          fontSize: '0.9375rem',
          lineHeight: 1.5,
          marginBottom: '20px',
        }}
      >
        Plain-English explanations of Scottish subject choices, Highers and university entry —
        designed for parents who didn&apos;t go through the system themselves.
      </p>
      <ul className="space-y-2">
        {[
          'Dedicated parent account',
          'Plain-language subject guide',
          'Share your child\'s plan safely',
          'Widening access explained',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2">
            <svg
              className="w-4 h-4 flex-shrink-0"
              style={{ color: 'var(--pf-green-500)', marginTop: '3px' }}
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-900)' }}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ComparisonTable() {
  const rows = [
    ['S2/S3 subject guidance', 'Not available or basic', 'Full interactive planner'],
    ['Subject combination simulator', 'Not available', 'Real-time trade-off analysis'],
    ['Scottish widening access', 'Not available', 'Automatic SIMD + criteria checking'],
    ['University entry matching', 'Post-application only', 'Instant eligibility with adjusted offers'],
    ['Free for individual students', 'School subscription required', 'Always free'],
    ['Parent experience', 'Limited or none', 'Dedicated portal and guide'],
    ['Subject → career → university chain', 'Fragmented across sites', 'End-to-end in one platform'],
  ]

  return (
    <div
      className="pf-card"
      style={{ padding: 0, overflow: 'hidden' }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '680px',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: 'var(--pf-blue-50)' }}>
              <th
                style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'var(--pf-grey-900)',
                  borderBottom: '1px solid var(--pf-grey-300)',
                }}
              >
                Feature
              </th>
              <th
                style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'var(--pf-grey-600)',
                  borderBottom: '1px solid var(--pf-grey-300)',
                }}
              >
                Other platforms
              </th>
              <th
                style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'var(--pf-blue-700)',
                  borderBottom: '1px solid var(--pf-grey-300)',
                }}
              >
                Pathfinder Scotland
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td
                  style={{
                    padding: '16px 20px',
                    fontSize: '0.9375rem',
                    color: 'var(--pf-grey-900)',
                    fontWeight: 500,
                    borderBottom:
                      i < rows.length - 1 ? '1px solid var(--pf-grey-300)' : 'none',
                  }}
                >
                  {row[0]}
                </td>
                <td
                  style={{
                    padding: '16px 20px',
                    fontSize: '0.875rem',
                    color: 'var(--pf-grey-600)',
                    borderBottom:
                      i < rows.length - 1 ? '1px solid var(--pf-grey-300)' : 'none',
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: 'var(--pf-grey-300)' }}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {row[1]}
                  </span>
                </td>
                <td
                  style={{
                    padding: '16px 20px',
                    fontSize: '0.875rem',
                    color: 'var(--pf-grey-900)',
                    fontWeight: 500,
                    borderBottom:
                      i < rows.length - 1 ? '1px solid var(--pf-grey-300)' : 'none',
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: 'var(--pf-green-500)' }}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {row[2]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function InvolvedCard({
  badge,
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  badge: string
  title: string
  description: string
  ctaLabel: string
  ctaHref: string
}) {
  return (
    <div
      style={{
        backgroundColor: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '12px',
        padding: '32px',
      }}
    >
      <span
        className="pf-badge inline-flex"
        style={{
          marginBottom: '16px',
          backgroundColor: 'rgba(255,255,255,0.12)',
          color: '#fff',
        }}
      >
        {badge}
      </span>
      <h3 style={{ color: '#fff', marginBottom: '12px', fontSize: '1.375rem' }}>{title}</h3>
      <p
        style={{
          color: 'rgba(255,255,255,0.8)',
          fontSize: '0.9375rem',
          lineHeight: 1.6,
          marginBottom: '24px',
        }}
      >
        {description}
      </p>
      <a
        href={ctaHref}
        className="inline-flex items-center justify-center gap-2 no-underline hover:no-underline"
        style={{
          backgroundColor: '#fff',
          color: 'var(--pf-blue-900)',
          padding: '12px 24px',
          borderRadius: '8px',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.9375rem',
          minHeight: '44px',
        }}
      >
        {ctaLabel}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  )
}

function RoadmapCard({
  phase,
  when,
  items,
  active,
}: {
  phase: string
  when: string
  items: string[]
  active?: boolean
}) {
  return (
    <div
      style={{
        backgroundColor: active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
        border: active
          ? '1px solid rgba(255,255,255,0.25)'
          : '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '1rem',
            color: '#fff',
          }}
        >
          {phase}
        </span>
        <span
          className="pf-badge"
          style={{
            backgroundColor: active ? 'var(--pf-amber-500)' : 'rgba(255,255,255,0.1)',
            color: active ? 'var(--pf-blue-900)' : 'rgba(255,255,255,0.7)',
            fontWeight: 600,
          }}
        >
          {when}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item}
            style={{
              fontSize: '0.875rem',
              color: 'rgba(255,255,255,0.85)',
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-start',
            }}
          >
            <span
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255,255,255,0.6)',
                marginTop: '8px',
                flexShrink: 0,
              }}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 440 400"
      width="100%"
      style={{ maxWidth: '440px', height: 'auto' }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pf-demo-line" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0072CE" />
          <stop offset="100%" stopColor="#005EB8" />
        </linearGradient>
      </defs>
      <circle cx="220" cy="200" r="180" fill="#E0EDF7" opacity="0.5" />
      <circle cx="220" cy="200" r="130" fill="#E0EDF7" opacity="0.6" />

      {/* Step dots in a row */}
      <g>
        {[60, 115, 170, 225, 280, 335, 390].map((x, i) => (
          <g key={x}>
            {i > 0 && (
              <line
                x1={x - 55}
                y1="200"
                x2={x}
                y2="200"
                stroke="url(#pf-demo-line)"
                strokeWidth="2"
                opacity="0.4"
              />
            )}
            <circle cx={x} cy="200" r={i === 3 ? 18 : 12} fill={i === 3 ? '#005EB8' : '#0072CE'} opacity={i === 3 ? 1 : 0.6} />
            <text
              x={x}
              y={205}
              textAnchor="middle"
              fill="#fff"
              fontFamily="Space Grotesk, sans-serif"
              fontWeight="700"
              fontSize={i === 3 ? 12 : 10}
            >
              {i + 1}
            </text>
          </g>
        ))}
      </g>

      {/* Floating info cards */}
      <g>
        <rect x="40" y="70" width="140" height="60" rx="8" fill="#fff" stroke="#E0EDF7" strokeWidth="1" />
        <circle cx="60" cy="92" r="8" fill="#E0EDF7" />
        <rect x="76" y="84" width="90" height="6" rx="3" fill="#005EB8" />
        <rect x="76" y="96" width="70" height="4" rx="2" fill="#D1D1DB" />
        <rect x="76" y="108" width="50" height="4" rx="2" fill="#D1D1DB" />

        <rect x="260" y="280" width="140" height="60" rx="8" fill="#fff" stroke="#E0EDF7" strokeWidth="1" />
        <circle cx="280" cy="302" r="8" fill="#E0EDF7" />
        <rect x="296" y="294" width="90" height="6" rx="3" fill="#005EB8" />
        <rect x="296" y="306" width="60" height="4" rx="2" fill="#D1D1DB" />
        <rect x="296" y="318" width="80" height="4" rx="2" fill="#D1D1DB" />
      </g>
    </svg>
  )
}
