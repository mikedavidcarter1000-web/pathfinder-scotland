import type { Metadata } from 'next'
import Link from 'next/link'
import { PilotInterestForm } from '@/components/pilot-interest-form'

export const metadata: Metadata = {
  title: 'For careers advisers',
  description:
    'How SDS and school-based careers advisers can use Pathfinder with the young people they work with — and register interest in a pilot.',
  alternates: { canonical: '/for-advisers' },
}

interface InfoCard {
  heading: string
  body: string
}

const WHAT_STUDENTS_GET: InfoCard[] = [
  {
    heading: 'Scotland-specific pathway modelling',
    body: 'National 5, Higher and Advanced Higher routes, college-to-uni transitions, Foundation Apprenticeships, Modern Apprenticeships, and university — not a generic UK careers site.',
  },
  {
    heading: 'Profile-matched opportunities',
    body: 'Each young person sees reduced-grade offers, named bursaries, and widening-access schemes they qualify for — based on postcode, care experience, and other circumstances.',
  },
  {
    heading: 'Career comparisons in one place',
    body: 'Side-by-side earnings, hours, progression, entry requirements, and AI exposure for 269 roles across 19 sectors. Saves a careers meeting from turning into 12 browser tabs.',
  },
]

const WHY_MATTERS: InfoCard[] = [
  {
    heading: 'Closes the information gap',
    body: 'Young people who aren&rsquo;t getting pathway advice at home often don&rsquo;t know reduced-grade offers exist. Pathfinder makes eligibility visible without waiting for an adviser appointment.',
  },
  {
    heading: 'Prepared meetings',
    body: 'Young people can arrive at adviser sessions with a shortlist they&rsquo;ve already explored. Meetings shift from "where to start" to "let&rsquo;s pressure-test this plan".',
  },
  {
    heading: 'Aligns with SDS priorities',
    body: 'Complements My World of Work, Career Matches, and the SDS adviser toolkit. The widening-access and funding layers fill a frequent request from advisers and young people.',
  },
]

const HOW_ADVISERS_USE: InfoCard[] = [
  {
    heading: 'As shared prep',
    body: 'Send the young person a link ahead of the meeting so they can explore subjects, courses, or careers in advance. Come to the meeting with their saved shortlist.',
  },
  {
    heading: 'In-session as a second screen',
    body: 'Use Pathfinder during an adviser session to pressure-test a stated plan — what Highers are needed, what bursaries apply, what the reduced-grade offers actually are.',
  },
  {
    heading: 'To check widening access routes',
    body: 'Enter the young person&rsquo;s postcode and see SIMD band, named bursaries, and the schools&rsquo; widening-access schemes they qualify for without having to cross-reference multiple sites.',
  },
]

export default function ForAdvisersPage() {
  return (
    <div style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      <section
        style={{
          backgroundColor: 'var(--pf-blue-900)',
          color: '#fff',
          padding: '64px 0',
        }}
      >
        <div className="pf-container" style={{ maxWidth: '820px', textAlign: 'center' }}>
          <span
            className="inline-flex items-center"
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255,255,255,0.12)',
              color: '#fff',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.75rem',
              letterSpacing: '0.04em',
              marginBottom: '16px',
            }}
          >
            For careers advisers
          </span>
          <h1
            style={{
              color: '#fff',
              fontSize: 'clamp(1.875rem, 5vw, 2.75rem)',
              marginBottom: '12px',
            }}
          >
            Support for the young people you work with
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: '1.0625rem',
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '0 auto',
            }}
          >
            Pathfinder is a free platform for Scottish students. It models Scotland-specific
            pathways — Qualifications Scotland subjects, reduced-grade offers, bursaries, and
            widening-access routes — against each young person&rsquo;s circumstances.
          </p>
        </div>
      </section>

      <Section title="What students get" cards={WHAT_STUDENTS_GET} />
      <Section title="Why it matters for widening access" cards={WHY_MATTERS} grey />
      <Section title="How careers advisers can use it" cards={HOW_ADVISERS_USE} />

      <section style={{ padding: '48px 0', backgroundColor: 'var(--pf-white)' }}>
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <PilotInterestForm
            role="adviser"
            heading="Register interest in a pilot"
            description="We&rsquo;re keen to work with SDS and school-based advisers through 2026. Leave your details and we&rsquo;ll email you with next steps."
            organisationLabel="SDS region, local authority, or school"
            submitLabel="Register adviser interest"
          />
        </div>
      </section>

      <FooterSegmentSwitch />
    </div>
  )
}

function Section({
  title,
  cards,
  grey,
}: {
  title: string
  cards: InfoCard[]
  grey?: boolean
}) {
  return (
    <section
      style={{
        padding: '56px 0',
        backgroundColor: grey ? 'var(--pf-grey-100)' : 'var(--pf-white)',
      }}
    >
      <div className="pf-container">
        <h2 style={{ marginBottom: '28px', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
          {title}
        </h2>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}
        >
          {cards.map((c) => (
            <div key={c.heading} className="pf-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '8px' }}>
                {c.heading}
              </h3>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FooterSegmentSwitch() {
  return (
    <section
      style={{
        padding: '32px 0',
        backgroundColor: 'var(--pf-white)',
        borderTop: '1px solid var(--pf-grey-100)',
      }}
    >
      <div className="pf-container" style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', margin: 0 }}>
          Not what you&rsquo;re looking for?{' '}
          <Link
            href="/auth/sign-up"
            style={{
              color: 'var(--pf-blue-700)',
              fontWeight: 600,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Student sign-up
          </Link>
        </p>
      </div>
    </section>
  )
}
