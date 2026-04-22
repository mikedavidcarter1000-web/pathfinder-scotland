import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'For parents and carers | Pathfinder Scotland',
  description:
    'How Pathfinder helps Scottish students, and how you can support your child — whether they’re under 16 or already at university age.',
}

interface InfoCard {
  heading: string
  body: string
}

const WHAT_STUDENTS_GET: InfoCard[] = [
  {
    heading: 'Subjects chosen with confidence',
    body: 'From S2 subject choices to Advanced Higher. Pathfinder shows how today’s choices open or close future career and university routes.',
  },
  {
    heading: 'Widening access built in',
    body: 'Automatic SIMD lookup, care-experienced and young-carer routes, first-generation offers — all surfaced based on their postcode and profile.',
  },
  {
    heading: 'Courses, bursaries, and careers matched',
    body: 'Predicted grades compared against every Scottish university course, plus named bursaries they may be eligible for.',
  },
]

const WHY_MATTERS: InfoCard[] = [
  {
    heading: 'Scotland’s system is distinct',
    body: 'English-focused careers sites don’t cover Highers, Advanced Highers, or Scottish-only widening-access schemes like SWAP and REACH. Pathfinder is built for Scotland first.',
  },
  {
    heading: 'Information gaps close doors',
    body: 'Many families don’t hear about reduced-grade offers, college-to-uni routes, or named bursaries until it’s too late. Our goal is to put that information in front of every student who needs it.',
  },
  {
    heading: 'Free to use',
    body: 'Pathfinder is free for individual students. No school subscription required. You can support your child without needing permission from their school.',
  },
]

const HOW_YOU_HELP: InfoCard[] = [
  {
    heading: 'Under 16? Sign them up together',
    body: 'You can create their account with them and walk through the first setup. Pathfinder stores only what’s needed to match courses and bursaries.',
  },
  {
    heading: '16 or older? Share the link',
    body: 'Older students typically want to set things up themselves. Forwarding the sign-up link and letting them explore is usually the most effective.',
  },
  {
    heading: 'Prefer a full parent guide?',
    body: 'Our parent guide walks through the Scottish timeline, what each stage means, and the conversations to have with your child at each point.',
  },
]

export default function ForParentsPage() {
  return (
    <div style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      {/* Hero */}
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
            For parents and carers
          </span>
          <h1
            style={{
              color: '#fff',
              fontSize: 'clamp(1.875rem, 5vw, 2.75rem)',
              marginBottom: '12px',
            }}
          >
            Supporting your child through Scotland’s education system
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
            Pathfinder is a free platform for Scottish students, S2 through S6. It
            matches subject choices, university courses, bursaries, and careers to
            each student’s circumstances — including widening-access routes.
          </p>
        </div>
      </section>

      {/* Three sections */}
      <Section title="What students get" cards={WHAT_STUDENTS_GET} />
      <Section title="Why it matters for widening access" cards={WHY_MATTERS} grey />
      <Section title="How you can help" cards={HOW_YOU_HELP} />

      {/* CTA */}
      <section style={{ padding: '56px 0', backgroundColor: 'var(--pf-blue-900)' }}>
        <div className="pf-container" style={{ maxWidth: '760px', textAlign: 'center' }}>
          <h2 style={{ color: '#fff', marginBottom: '14px' }}>
            Ready to get your child started?
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: '1rem',
              marginBottom: '28px',
            }}
          >
            Create a free account together (under 16) or share the sign-up link
            with your young person (16+).
          </p>
          <div
            className="flex flex-col sm:flex-row items-center justify-center"
            style={{ gap: '12px' }}
          >
            <Link
              href="/auth/sign-up"
              className="pf-btn-primary"
              style={{ minHeight: '48px' }}
            >
              Sign up your child
            </Link>
            <Link
              href="/parents"
              className="no-underline"
              style={{
                color: '#fff',
                borderBottom: '1px solid rgba(255,255,255,0.35)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.9375rem',
                paddingBottom: '2px',
              }}
            >
              Read the full parent guide
            </Link>
          </div>
        </div>
      </section>

      {/* Footer nav */}
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
