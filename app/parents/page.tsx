import Link from 'next/link'
import { FaqAccordion, type FaqItem } from '@/components/ui/faq-accordion'

const STAGE_TIMELINE: Array<{
  stage: string
  title: string
  description: string
}> = [
  {
    stage: 'S2 → S3',
    title: 'First big subject choice',
    description:
      'Your child picks 6 subjects plus English and Maths. This shapes which qualifications they can take from S4 onwards.',
  },
  {
    stage: 'S3 → S4',
    title: 'National 4 / 5',
    description:
      'They narrow to around 7 subjects for the National 4 / 5 exams at the end of S4. The pattern of subjects matters more than perfection in any one of them.',
  },
  {
    stage: 'S4 → S5',
    title: 'Higher year',
    description:
      'Most students pick 5 subjects at Higher. This is the year most Scottish university entry requirements are based on, so the choices matter for UCAS.',
  },
  {
    stage: 'S5 → S6',
    title: 'Advanced Higher and beyond',
    description:
      'Advanced Highers, crash Highers, or college courses. The most flexible year — students who already have offers can use it to deepen knowledge or boost grades.',
  },
]

const HELP_CARDS: Array<{ title: string; body: string; href: string; cta: string }> = [
  {
    title: 'See the full picture',
    body: 'Our pathway planner shows how today\u2019s choices connect to future qualifications and careers.',
    href: '/pathways',
    cta: 'Open the planner',
  },
  {
    title: 'Check university eligibility',
    body: 'Browse Scottish university courses and instantly see which ones your child qualifies for, including adjusted offers for widening access.',
    href: '/courses',
    cta: 'Browse courses',
  },
  {
    title: 'No school subscription needed',
    body: 'Pathfinder is free to use. Your child doesn\u2019t need their school\u2019s permission to create an account.',
    href: '/auth/sign-up',
    cta: 'Create a free account',
  },
]

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'When does my child need to make subject choices?',
    answer:
      'Most Scottish schools ask S2 students to choose S3 subjects between January and March. Your child\u2019s school will communicate the exact dates. The TOOLS system is commonly used to record choices.',
  },
  {
    question: 'How many subjects does my child choose?',
    answer:
      'In S3, typically 8 subjects (English and Maths are compulsory, plus 6 choices). This narrows to 7 in S4, 5 in S5, and 3 to 4 in S6. Each stage involves a different number of choices.',
  },
  {
    question: 'Should my child pick subjects they enjoy or subjects that are "useful"?',
    answer:
      'Both matter. Enjoyment predicts better performance. But some career and university paths require specific subjects \u2014 particularly sciences and maths for STEM degrees. Pathfinder\u2019s simulator shows the trade-offs so you can make an informed decision together.',
  },
  {
    question: "What if my child doesn't know what they want to do?",
    answer:
      'That\u2019s completely normal. Choosing a broad range of subjects across different curricular areas keeps the most options open. Our Discover tool helps students explore interests and careers.',
  },
  {
    question: 'How do I know if my child qualifies for widening access?',
    answer:
      'Enter your postcode on Pathfinder and we\u2019ll check your SIMD decile automatically. We also ask about care experience, young carer status, and first-generation university attendance. All of this is optional and confidential.',
  },
  {
    question: 'Is my child\u2019s data safe on Pathfinder?',
    answer:
      'Yes. We store data securely, never share it, and your child can download or delete everything at any time. See our privacy policy for full details.',
  },
]

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}

export default function ParentsPage() {
  return (
    <div style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />

      <Hero />
      <GuideSection />
      <FaqSection />
      <ClosingCta />
    </div>
  )
}

function Hero() {
  return (
    <section
      className="pf-section"
      style={{
        backgroundColor: 'var(--pf-blue-50)',
        paddingTop: '56px',
        paddingBottom: '40px',
      }}
    >
      <div className="pf-container">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <span className="pf-badge-blue inline-flex" style={{ marginBottom: '20px' }}>
              For parents and carers
            </span>
            <h1
              style={{
                fontSize: 'clamp(2rem, 5vw, 2.75rem)',
                lineHeight: 1.15,
                marginBottom: '16px',
                color: 'var(--pf-grey-900)',
              }}
            >
              Help your child make the right subject choices
            </h1>
            <p
              style={{
                fontSize: '1.0625rem',
                color: 'var(--pf-grey-600)',
                lineHeight: 1.6,
                marginBottom: '28px',
                maxWidth: '560px',
              }}
            >
              Pathfinder gives you the information you need to support your child through
              Scotland&apos;s subject choice process \u2014 from S3 options to university applications.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/auth/sign-up?type=parent" className="pf-btn-primary">
                Create a parent account
              </Link>
              <a href="#guide" className="pf-btn-secondary">
                Explore the guide
              </a>
            </div>
          </div>
          <HeroIllustration />
        </div>
      </div>
    </section>
  )
}

function HeroIllustration() {
  return (
    <div
      aria-hidden="true"
      style={{
        width: '100%',
        maxWidth: '340px',
        margin: '0 auto',
        backgroundColor: 'var(--pf-white)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 16px rgba(0, 45, 114, 0.1)',
      }}
    >
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.75rem',
          color: 'var(--pf-blue-700)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '12px',
        }}
      >
        Scottish subject choice timeline
      </div>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {['S2 \u2192 S3', 'S3 \u2192 S4', 'S4 \u2192 S5', 'S5 \u2192 S6'].map((label, idx) => (
          <li
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 0',
              borderBottom: idx < 3 ? '1px solid var(--pf-grey-100)' : 'none',
            }}
          >
            <span
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '9999px',
                backgroundColor: idx === 0 ? 'var(--pf-blue-700)' : 'var(--pf-blue-100)',
                color: idx === 0 ? '#fff' : 'var(--pf-blue-700)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: '0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {idx + 1}
            </span>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.875rem',
                color: 'var(--pf-grey-900)',
              }}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function GuideSection() {
  return (
    <section
      id="guide"
      style={{
        backgroundColor: 'var(--pf-white)',
        paddingTop: '56px',
        paddingBottom: '56px',
      }}
    >
      <div className="pf-container">
        <div style={{ maxWidth: '720px', marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '8px' }}>What you need to know</h2>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1rem' }}>
            A short, jargon-free guide to subject choices, widening access, and how
            Pathfinder helps.
          </p>
        </div>

        {/* a) How Scottish subject choices work */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '16px' }}>How Scottish subject choices work</h3>
          <p style={{ color: 'var(--pf-grey-600)', marginBottom: '20px', maxWidth: '720px' }}>
            Scotland\u2019s senior phase splits into four big choices. At each stage your
            child narrows their options, and subjects are usually offered in columns \u2014
            choosing one may mean losing another.
          </p>
          <ol
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gap: '16px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            }}
          >
            {STAGE_TIMELINE.map((step, idx) => (
              <li
                key={step.stage}
                className="pf-card-flat"
                style={{
                  padding: '20px',
                  borderTop: '3px solid var(--pf-blue-700)',
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: 'var(--pf-blue-700)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Step {idx + 1} \u2014 {step.stage}
                </span>
                <h4
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '1.0625rem',
                    color: 'var(--pf-grey-900)',
                    margin: '6px 0 8px',
                  }}
                >
                  {step.title}
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', margin: 0 }}>
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* b) What is widening access */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '12px' }}>What is widening access?</h3>
          <div
            style={{
              padding: '20px 24px',
              borderRadius: '8px',
              backgroundColor: 'var(--pf-blue-50)',
              borderLeft: '4px solid var(--pf-blue-700)',
              maxWidth: '760px',
            }}
          >
            <p style={{ color: 'var(--pf-grey-900)', marginBottom: '12px' }}>
              If your family lives in a less advantaged area (SIMD20 or SIMD40), your
              child has care experience, is a young carer, or would be the first in your
              family to attend university \u2014 they may qualify for reduced entry
              requirements at Scottish universities.
            </p>
            <p style={{ color: 'var(--pf-grey-600)', marginBottom: '12px', fontSize: '0.9375rem' }}>
              This is not charity. It is recognition that not everyone starts from the
              same place. Pathfinder checks this automatically using your postcode.
            </p>
            <Link
              href="/widening-access"
              style={{
                color: 'var(--pf-blue-700)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.9375rem',
              }}
            >
              Read full widening access details \u2192
            </Link>
          </div>
        </div>

        {/* c) How Pathfinder helps */}
        <div>
          <h3 style={{ marginBottom: '16px' }}>How Pathfinder helps</h3>
          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}
          >
            {HELP_CARDS.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="pf-card-hover no-underline hover:no-underline"
                style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}
              >
                <h4
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '1.0625rem',
                    color: 'var(--pf-grey-900)',
                    marginBottom: '8px',
                  }}
                >
                  {card.title}
                </h4>
                <p
                  style={{
                    fontSize: '0.9375rem',
                    color: 'var(--pf-grey-600)',
                    margin: 0,
                    marginBottom: '16px',
                    flex: 1,
                  }}
                >
                  {card.body}
                </p>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'var(--pf-blue-700)',
                  }}
                >
                  {card.cta} \u2192
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FaqSection() {
  return (
    <section
      style={{
        backgroundColor: 'var(--pf-grey-100)',
        paddingTop: '56px',
        paddingBottom: '56px',
      }}
    >
      <div className="pf-container">
        <div style={{ maxWidth: '720px', marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '8px' }}>Common questions from parents</h2>
          <p style={{ color: 'var(--pf-grey-600)' }}>
            The questions we hear most often. Don\u2019t see yours? {' '}
            <Link href="/help" style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}>
              Get in touch
            </Link>
            .
          </p>
        </div>
        <div style={{ maxWidth: '820px' }}>
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </div>
    </section>
  )
}

function ClosingCta() {
  return (
    <section
      style={{
        backgroundColor: 'var(--pf-blue-900)',
        color: '#fff',
        paddingTop: '56px',
        paddingBottom: '56px',
      }}
    >
      <div className="pf-container text-center">
        <h2 style={{ color: '#fff', marginBottom: '12px' }}>
          Ready to support your child?
        </h2>
        <p
          style={{
            color: 'rgba(255, 255, 255, 0.85)',
            maxWidth: '560px',
            margin: '0 auto 24px',
            fontSize: '1rem',
          }}
        >
          Create a free parent account in under a minute. No credit card, no school
          subscription, no fuss.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/auth/sign-up?type=parent"
            className="no-underline hover:no-underline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '14px 28px',
              backgroundColor: '#fff',
              color: 'var(--pf-blue-900)',
              borderRadius: '8px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.9375rem',
              minHeight: '48px',
            }}
          >
            Create a parent account
          </Link>
          <Link
            href="/discover"
            className="no-underline hover:no-underline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '14px 28px',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              color: '#fff',
              borderRadius: '8px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.9375rem',
              minHeight: '48px',
            }}
          >
            Or browse without an account
          </Link>
        </div>
      </div>
    </section>
  )
}
