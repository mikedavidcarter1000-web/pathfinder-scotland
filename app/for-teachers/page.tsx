import type { Metadata } from 'next'
import Link from 'next/link'
import { PilotInterestForm } from '@/components/pilot-interest-form'

export const metadata: Metadata = {
  title: 'For teachers',
  description:
    'How teachers and guidance staff in Scottish secondaries can use Pathfinder in lessons — and register interest in a school pilot.',
  alternates: { canonical: '/for-teachers' },
}

interface InfoCard {
  heading: string
  body: string
}

const WHAT_STUDENTS_GET: InfoCard[] = [
  {
    heading: 'Built for the Scottish system',
    body: 'Every CfE curricular area, every Qualifications Scotland subject, every Scottish university course, and the widening-access schemes your school already signposts.',
  },
  {
    heading: 'Personalised to each pupil',
    body: 'Postcode-driven SIMD lookup, care-experienced and young-carer routes, grade-aware course matching. No generic careers-site flattening.',
  },
  {
    heading: 'Bursaries and funding matched',
    body: 'Named Scottish bursaries matched to each pupil based on their profile. SAAS support modelled. Takes pressure off the funding conversation.',
  },
]

const WHY_MATTERS: InfoCard[] = [
  {
    heading: 'Pupils from SIMD20 and SIMD40 areas',
    body: 'Automatic SIMD lookup surfaces reduced-grade offers at every Scottish university. Pupils see exactly where they qualify for adjusted entry.',
  },
  {
    heading: 'First-in-family applicants',
    body: 'First-generation students often miss information that other pupils get at home. Pathfinder closes the gap by putting eligibility and named bursaries in plain view.',
  },
  {
    heading: 'Care-experienced and young carers',
    body: 'Protected-characteristic routes and dedicated bursaries are flagged automatically. No pupil has to self-identify in a classroom to get that information.',
  },
]

const HOW_TEACHERS_USE: InfoCard[] = [
  {
    heading: 'In guidance / PSE lessons',
    body: 'Walk a year group through subject-choice implications on a big screen. Each pupil can then log in later to personalise to their own postcode and predicted grades.',
  },
  {
    heading: 'As a conversation starter',
    body: 'When a pupil is undecided, the subject simulator lets them try combinations and see the implications. Teachers report it moves conversations from "any ideas?" to "which of these feels right?".',
  },
  {
    heading: 'Alongside SDS resources',
    body: 'Pathfinder complements My World of Work and SDS careers adviser sessions. Pupils can arrive at adviser meetings with a shortlist already drafted.',
  },
]

export default function ForTeachersPage() {
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
            For teachers
          </span>
          <h1
            style={{
              color: '#fff',
              fontSize: 'clamp(1.875rem, 5vw, 2.75rem)',
              marginBottom: '12px',
            }}
          >
            A practical tool for guidance and subject-choice lessons
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
            Pathfinder is a free platform for Scottish students. It models subject
            choices, university eligibility, bursaries, and widening-access routes
            against each pupil&rsquo;s own circumstances.
          </p>
        </div>
      </section>

      <Section title="What students get" cards={WHAT_STUDENTS_GET} />
      <Section title="Why it matters for widening access" cards={WHY_MATTERS} grey />
      <Section title="How teachers can use it" cards={HOW_TEACHERS_USE} />

      <section style={{ padding: '48px 0', backgroundColor: 'var(--pf-white)' }}>
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <PilotInterestForm
            role="teacher"
            heading="Register interest in a pilot for your school"
            description="We’re working with a small number of Scottish secondaries this year. Leave your details and we’ll email you with next steps."
            organisationLabel="School or local authority"
            submitLabel="Register school interest"
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
