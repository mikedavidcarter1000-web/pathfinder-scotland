import Link from 'next/link'
import { FaqAccordion, type FaqItem } from '@/components/ui/faq-accordion'
import { PostcodeTeaser } from '@/components/PostcodeTeaser'
import { getAnonSupabase } from '@/lib/supabase-public'

function buildFaqItems(universityCount: number): FaqItem[] {
  const uniPhrase =
    universityCount > 0 ? `all ${universityCount} Scottish universities` : 'Scottish universities'
  return [
    {
      question: 'Is Pathfinder free?',
      answer:
        'Yes. The core features are completely free. You can explore subjects, plan your choices, check university entry requirements, and see if you qualify for widening access support at no cost.',
    },
    {
      question: "How does Pathfinder know which courses I'm eligible for?",
      answer: `You enter your current or predicted grades, and we compare them against the entry requirements for courses across ${uniPhrase}. If you're from a widening participation background, we automatically show you any reduced entry offers you might qualify for.`,
    },
    {
      question: 'What is widening access?',
      answer:
        'Scottish universities offer lower entry grades to students from certain backgrounds. For example, if you live in a disadvantaged area (SIMD20/40), have care experience, are a young carer, or are the first in your family to go to university. Pathfinder checks your eligibility automatically based on your postcode and profile.',
    },
    {
      question: "Can I use Pathfinder if I don't know what I want to study at university?",
      answer:
        "Absolutely. Our subject explorer and pathway planner help you see where different subject choices lead, which careers they connect to, and which university courses they open up. You don't need to have decided anything yet.",
    },
    {
      question: 'Is my data safe?',
      answer:
        'Yes. We store your data securely and never share it with anyone. You can download or delete all your data at any time from your account settings. Read our privacy policy for full details.',
    },
    {
      question: 'Which schools does Pathfinder work with?',
      answer:
        'Pathfinder works for students at any Scottish secondary school. Our subject database covers every Qualifications Scotland qualification available across Scotland, from National 4 to Advanced Higher, including college partnership courses and Foundation Apprenticeships.',
    },
    {
      question: "Do I need my school's permission to use Pathfinder?",
      answer:
        'No. Pathfinder is designed for individual students and families. You can sign up and use it independently.',
    },
  ]
}

async function getHomepageStats() {
  try {
    const supabase = getAnonSupabase()
    if (!supabase) return { universityCount: 0, courseCount: 0 }

    const [universitiesRes, coursesRes] = await Promise.all([
      supabase.from('universities').select('id', { count: 'exact', head: true }),
      supabase.from('courses').select('id', { count: 'exact', head: true }),
    ])

    return {
      universityCount: universitiesRes.count ?? 0,
      courseCount: coursesRes.count ?? 0,
    }
  } catch {
    return { universityCount: 0, courseCount: 0 }
  }
}

export const revalidate = 3600

export default async function HomePage() {
  const { universityCount, courseCount } = await getHomepageStats()
  const universitiesLabel = universityCount > 0 ? `${universityCount} Scottish universities` : '18 Scottish universities'
  const coursesLabel = courseCount > 0 ? `${courseCount}+ courses` : '410+ courses'

  const faqItems = buildFaqItems(universityCount > 0 ? universityCount : 18)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Results Day banner */}
      <div
        style={{
          backgroundColor: 'var(--pf-blue-900)',
          padding: '14px 0',
        }}
      >
        <div className="pf-container">
          <Link
            href="/results-day"
            className="flex items-center justify-center gap-3 no-underline hover:no-underline"
          >
            <span
              style={{
                color: '#fff',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.9375rem',
              }}
            >
              Results Day 2026: Enter your results and see your options instantly
            </span>
            <svg
              className="w-4 h-4"
              style={{ color: '#fff' }}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* 1. Hero */}
      <section
        className="pt-12 sm:pt-16 pb-6"
        style={{
          backgroundColor: 'var(--pf-blue-50)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="pf-container">
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            <span
              className="pf-badge-blue inline-flex"
              style={{ marginBottom: '20px' }}
            >
              Built for Scottish students
            </span>
            <h1
              style={{
                fontSize: 'clamp(1.875rem, 5.5vw, 3.25rem)',
                lineHeight: 1.1,
                marginBottom: '20px',
                color: 'var(--pf-grey-900)',
              }}
            >
              Scottish students: subjects, bursaries, courses, careers - personalised
            </h1>
            <p
              style={{
                fontSize: '1.0625rem',
                color: 'var(--pf-grey-600)',
                lineHeight: 1.6,
                marginBottom: '32px',
                maxWidth: '640px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              From S2 subject choices to university offers. Widening access and bursary matching built in. Free to use.
            </p>
            <div
              className="flex flex-col sm:flex-row items-center justify-center"
              style={{ gap: '12px' }}
            >
              <Link
                href="/auth/sign-up"
                className="pf-btn-primary w-full sm:w-auto justify-center"
                style={{ minHeight: '48px' }}
              >
                Start free - takes 60 seconds
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="#try-it"
                className="no-underline"
                style={{
                  color: 'var(--pf-blue-700)',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  minHeight: '44px',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Or try it without signing up
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Sample personalisation */}
      <section className="pf-section-white" style={{ paddingTop: '16px', paddingBottom: '64px' }}>
        <div className="pf-container">
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <PostcodeTeaser />
          </div>
        </div>
      </section>

      {/* 3. How it works */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container">
          <div className="text-center" style={{ marginBottom: '48px' }}>
            <h2 style={{ marginBottom: '12px', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
              How it works
            </h2>
            <p
              style={{
                color: 'var(--pf-grey-600)',
                fontSize: '1.0625rem',
                maxWidth: '560px',
                margin: '0 auto',
              }}
            >
              Three steps from curious to confident.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <HowStep
              number="1"
              title="Tell us about you"
              description="Postcode, year group, predicted or actual grades. Takes under a minute."
            />
            <HowStep
              number="2"
              title="We match you"
              description="Widening access adjustments, eligible courses, named bursaries, and career sectors that fit."
            />
            <HowStep
              number="3"
              title="Plan with confidence"
              description="Save courses, compare options, track deadlines, and explore alternatives."
            />
          </div>
        </div>
      </section>

      {/* 4. Segmented entry */}
      <section className="pf-section pf-section-white">
        <div className="pf-container">
          <div className="text-center" style={{ marginBottom: '40px' }}>
            <h2 style={{ marginBottom: '12px', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
              Where are you starting from?
            </h2>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem' }}>
              Jump to the guidance that fits your stage.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <SegmentCard
              eyebrow="Student"
              heading="I'm in S2 or S3"
              subhead="Choosing subjects for S3 or S4"
              cta="Explore subject choices"
              href="/pathways"
            />
            <SegmentCard
              eyebrow="Student"
              heading="I'm in S4, S5 or S6"
              subhead="Highers, university, careers"
              cta="See what matches me"
              href="#try-it"
            />
            <SegmentCard
              eyebrow="Parent or carer"
              heading="I'm a parent or carer"
              subhead="Supporting your young person"
              cta="Read the parent guide"
              href="/parents"
            />
            <SegmentCard
              eyebrow="School or funder"
              heading="I'm a teacher or funder"
              subhead="See Pathfinder in action"
              cta="Take the 3-minute tour"
              href="/demo"
            />
          </div>
        </div>
      </section>

      {/* 5. Credibility strip */}
      <section
        className="pf-section"
        style={{ backgroundColor: 'var(--pf-blue-900)' }}
      >
        <div className="pf-container">
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            style={{ marginBottom: '32px' }}
          >
            <CredStat number={universityCount > 0 ? String(universityCount) : '18'} label="Scottish universities" />
            <CredStat number={courseCount > 0 ? `${courseCount}+` : '410+'} label="Courses" />
            <CredStat number="81" label="Qualifications Scotland subjects" />
            <CredStat number="227,000+" label="Postcodes checked" />
          </div>
          <p
            style={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '0.9375rem',
              margin: 0,
            }}
          >
            Built in Scotland, for Scottish students. Free for individuals. Widening access at the core.
          </p>
        </div>
      </section>

      {/* 6. Widening access explainer */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            <div>
              <span
                className="pf-badge inline-flex"
                style={{
                  marginBottom: '16px',
                  backgroundColor: 'rgba(245, 158, 11, 0.18)',
                  color: 'var(--pf-amber-500)',
                }}
              >
                Widening Access
              </span>
              <h2
                style={{
                  marginBottom: '16px',
                  fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                }}
              >
                Lower entry requirements could be available to you.
              </h2>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '1.0625rem',
                  marginBottom: '24px',
                  lineHeight: 1.6,
                }}
              >
                If you live in an SIMD20 or SIMD40 area, have care experience, are a young carer,
                or are the first in your family to attend university, you may qualify for reduced
                entry requirements at many Scottish universities.
              </p>
              <ul className="space-y-3" style={{ marginBottom: '28px', listStyle: 'none', padding: 0 }}>
                {[
                  'Automatic SIMD lookup from your postcode',
                  'See adjusted offers based on your circumstances',
                  'Learn about access programmes like SWAP and REACH',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="flex-shrink-0"
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '9999px',
                        backgroundColor: 'var(--pf-green-500)',
                        color: '#fff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '1px',
                      }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span style={{ color: 'var(--pf-grey-900)' }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/widening-access"
                className="pf-btn-secondary w-full sm:w-auto justify-center"
                style={{ minHeight: '48px' }}
              >
                Check your eligibility
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div
              className="pf-card"
              style={{ padding: '24px' }}
            >
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
                  Computer Science at Edinburgh
                </h3>
              </div>
              <div className="space-y-3">
                <OfferRow label="Standard offer" value="AAAA" />
                <OfferRow label="SIMD40 offer" value="AAAB" highlight />
                <OfferRow label="SIMD20 offer" value="AABB" highlight />
                <OfferRow label="Care experienced" value="AABB" highlight last />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Secondary exploration strip */}
      <section className="pf-section pf-section-white">
        <div className="pf-container">
          <div className="text-center" style={{ marginBottom: '32px' }}>
            <h2 style={{ marginBottom: '8px', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
              Explore without signing up
            </h2>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '1rem', margin: 0 }}>
              Browse our content and directories openly.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ExploreTile href="/blog" label="Guides and articles" />
            <ExploreTile href="/careers" label="Browse careers" />
            <ExploreTile href="/universities" label="Browse universities" />
            <ExploreTile href="/colleges" label="Browse colleges" />
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container">
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <div className="text-center" style={{ marginBottom: '40px' }}>
              <span
                className="pf-badge-blue inline-flex"
                style={{ marginBottom: '16px' }}
              >
                FAQ
              </span>
              <h2 style={{ marginBottom: '12px', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
                Frequently asked questions
              </h2>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem' }}>
                Everything you need to know before getting started.
              </p>
            </div>

            <FaqAccordion items={faqItems} />

            <p
              style={{
                textAlign: 'center',
                marginTop: '32px',
                color: 'var(--pf-grey-600)',
                fontSize: '0.9375rem',
              }}
            >
              Still have questions?{' '}
              <Link
                href="/help"
                style={{
                  color: 'var(--pf-blue-500)',
                  fontWeight: 600,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Visit the help centre
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* 9. Final CTA */}
      <section
        className="pf-section"
        style={{ backgroundColor: 'var(--pf-blue-900)' }}
      >
        <div className="pf-container text-center">
          <h2 style={{ color: '#fff', marginBottom: '16px', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
            Ready to find your path?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.0625rem', marginBottom: '32px' }}>
            Create your free account and start planning in minutes.
          </p>
          <div
            className="flex flex-col sm:flex-row items-center justify-center"
            style={{ gap: '12px' }}
          >
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center gap-2 no-underline hover:no-underline w-full sm:w-auto"
              style={{
                backgroundColor: '#fff',
                color: 'var(--pf-blue-900)',
                padding: '14px 28px',
                borderRadius: '8px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: '48px',
              }}
            >
              Get started for free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <span
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.875rem',
              }}
            >
              {universitiesLabel} - {coursesLabel}
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}

/* -------------------------------------------------------------- */

function HowStep({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="pf-card" style={{ padding: '24px' }}>
      <div
        aria-hidden="true"
        className="flex items-center justify-center"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '9999px',
          backgroundColor: 'var(--pf-blue-100)',
          color: 'var(--pf-blue-700)',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '1.125rem',
          marginBottom: '16px',
        }}
      >
        {number}
      </div>
      <h3 style={{ marginBottom: '8px', fontSize: '1.125rem' }}>{title}</h3>
      <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, margin: 0 }}>
        {description}
      </p>
    </div>
  )
}

function SegmentCard({
  eyebrow,
  heading,
  subhead,
  cta,
  href,
}: {
  eyebrow: string
  heading: string
  subhead: string
  cta: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="pf-card-hover flex flex-col h-full no-underline hover:no-underline"
      style={{ padding: '24px', minHeight: '180px' }}
    >
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.75rem',
          color: 'var(--pf-blue-700)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '8px',
        }}
      >
        {eyebrow}
      </span>
      <h3 style={{ marginBottom: '6px', fontSize: '1.1875rem' }}>{heading}</h3>
      <p
        style={{
          color: 'var(--pf-grey-600)',
          fontSize: '0.9375rem',
          marginBottom: '16px',
          flex: 1,
          margin: '0 0 16px',
        }}
      >
        {subhead}
      </p>
      <span
        className="inline-flex items-center"
        style={{
          color: 'var(--pf-blue-700)',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.9375rem',
          gap: '6px',
        }}
      >
        {cta}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  )
}

function CredStat({ number, label }: { number: string; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        className="pf-data-number"
        style={{
          fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
          fontWeight: 700,
          color: '#fff',
          lineHeight: 1.1,
          marginBottom: '6px',
        }}
      >
        {number}
      </div>
      <div
        style={{
          fontSize: '0.875rem',
          color: 'rgba(255,255,255,0.75)',
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
        borderBottom: last ? 'none' : '1px solid var(--pf-grey-200)',
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

function ExploreTile({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="pf-card-hover no-underline hover:no-underline flex items-center justify-center text-center"
      style={{
        padding: '20px 16px',
        minHeight: '80px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 600,
        fontSize: '0.9375rem',
        color: 'var(--pf-grey-900)',
      }}
    >
      {label}
    </Link>
  )
}
