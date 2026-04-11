'use client'

import Link from 'next/link'

export default function DiscoverPage() {
  return (
    <div style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      {/* Hero */}
      <section className="pf-section" style={{ paddingBottom: '32px' }}>
        <div className="pf-container text-center">
          <span className="pf-badge-blue inline-flex" style={{ marginBottom: '20px' }}>
            Discover
          </span>
          <h1
            style={{
              fontSize: 'clamp(1.875rem, 5vw, 2.75rem)',
              lineHeight: 1.15,
              marginBottom: '16px',
              color: 'var(--pf-grey-900)',
              maxWidth: '760px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Where do you want to go?
          </h1>
          <p
            style={{
              fontSize: '1.0625rem',
              color: 'var(--pf-grey-600)',
              lineHeight: 1.6,
              maxWidth: '620px',
              margin: '0 auto',
            }}
          >
            Whether you know exactly what you want or you&apos;re still figuring it out,
            we&apos;ll help you find the right path.
          </p>
        </div>
      </section>

      {/* Dual-path cards */}
      <section style={{ paddingBottom: '80px' }}>
        <div className="pf-container">
          <div className="grid gap-6 md:grid-cols-3 md:gap-6" style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <PathCard
              href="/discover/career-search"
              eyebrow="Path 1"
              title="I have an idea"
              description="I know what career or degree I'm interested in. Show me which subjects I need."
              cta="Find my subjects"
              icon={
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.24 7.76l-2.12 5.66-5.66 2.12 2.12-5.66 5.66-2.12z" />
                  <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
                </svg>
              }
            />

            <PathCard
              href="/discover/explore"
              eyebrow="Path 2"
              title="I'm still exploring"
              description="I'm not sure yet. Help me explore my options and see what's out there."
              cta="Help me explore"
              icon={
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75l-5.25 2.25v11.25l5.25-2.25m0-11.25l6 2.25m-6-2.25v11.25m6-9l5.25-2.25v11.25L15 20.25m0-11.25v11.25m0-11.25l-6-2.25m6 13.5l-6-2.25" />
                </svg>
              }
            />

            <PathCard
              href="/simulator"
              eyebrow="Path 3"
              title="Compare subject combinations"
              description="See how different subject combinations open or close university courses and career sectors."
              cta="Try the simulator"
              icon={
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 14l3-3 4 4 6-6" />
                  <circle cx="20" cy="9" r="1.2" fill="currentColor" stroke="none" />
                </svg>
              }
            />
          </div>

          <p
            className="text-center"
            style={{
              marginTop: '40px',
              color: 'var(--pf-grey-600)',
              fontSize: '0.9375rem',
            }}
          >
            Not sure which to pick? Either option works — you can switch between them any time.
          </p>
        </div>
      </section>

      {/* Read our guides */}
      <section
        style={{
          backgroundColor: 'var(--pf-white)',
          paddingTop: '64px',
          paddingBottom: '64px',
          borderTop: '1px solid var(--pf-grey-300)',
        }}
      >
        <div className="pf-container">
          <div
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
            style={{ marginBottom: '32px' }}
          >
            <div>
              <span className="pf-badge-blue inline-flex" style={{ marginBottom: '12px' }}>
                Read our guides
              </span>
              <h2 style={{ marginBottom: '8px', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
                Not sure where to start?
              </h2>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '1rem', margin: 0, maxWidth: '560px' }}>
                Plain-language guides on subject choices, university pathways, and careers.
              </p>
            </div>
            <Link
              href="/blog"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                color: 'var(--pf-blue-700)',
                fontSize: '0.9375rem',
              }}
            >
              All articles →
            </Link>
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            <DiscoverGuideCard
              href="/blog/how-to-choose-s3-subjects"
              eyebrow="Subject Choices"
              title="How to choose your S3 subjects"
              description="A complete guide to the S2 to S3 transition, the column system, and common mistakes to avoid."
            />
            <DiscoverGuideCard
              href="/blog/highers-guide"
              eyebrow="University"
              title="Highers: how many do you need?"
              description="Which Highers carry the most weight, grade requirements by university, and crash Higher pros and cons."
            />
            <DiscoverGuideCard
              href="/blog/ai-changing-careers"
              eyebrow="AI & Future"
              title="How AI is changing careers"
              description="An honest, balanced take on what AI means for Scottish students choosing their path."
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function DiscoverGuideCard({
  href,
  eyebrow,
  title,
  description,
}: {
  href: string
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="pf-card-hover no-underline hover:no-underline flex flex-col h-full"
      style={{ padding: '20px' }}
    >
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.6875rem',
          color: 'var(--pf-blue-700)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '8px',
        }}
      >
        {eyebrow}
      </span>
      <h3
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '1rem',
          color: 'var(--pf-grey-900)',
          marginBottom: '8px',
          lineHeight: 1.3,
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', margin: 0, lineHeight: 1.5 }}>
        {description}
      </p>
    </Link>
  )
}

function PathCard({
  href,
  eyebrow,
  title,
  description,
  cta,
  icon,
}: {
  href: string
  eyebrow: string
  title: string
  description: string
  cta: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="pf-card-hover no-underline hover:no-underline flex flex-col h-full group"
      aria-label={`${title}: ${cta}`}
      style={{
        padding: '32px',
        border: '1px solid transparent',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--pf-blue-700)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'transparent'
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '16px',
          backgroundColor: 'var(--pf-blue-100)',
          color: 'var(--pf-blue-700)',
          marginBottom: '24px',
        }}
      >
        {icon}
      </div>

      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.75rem',
          color: 'var(--pf-blue-700)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '8px',
        }}
      >
        {eyebrow}
      </span>

      <h2
        style={{
          fontSize: '1.625rem',
          color: 'var(--pf-grey-900)',
          marginBottom: '12px',
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>

      <p
        style={{
          color: 'var(--pf-grey-600)',
          fontSize: '1rem',
          lineHeight: 1.6,
          marginBottom: '24px',
          flex: 1,
        }}
      >
        {description}
      </p>

      <div
        className="inline-flex items-center gap-2"
        style={{
          color: 'var(--pf-blue-700)',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.9375rem',
        }}
      >
        {cta}
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}
