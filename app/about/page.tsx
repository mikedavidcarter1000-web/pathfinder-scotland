import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Pathfinder Scotland exists to close the guidance gap — giving every Scottish student access to the same quality of advice on subject choices, university pathways, and widening access support.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section
        style={{
          backgroundColor: 'var(--pf-blue-900)',
          paddingTop: '72px',
          paddingBottom: '72px',
        }}
      >
        <div className="pf-container" style={{ maxWidth: '760px', textAlign: 'center' }}>
          <span
            style={{
              display: 'inline-block',
              marginBottom: '20px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.25)',
              padding: '4px 14px',
              borderRadius: '999px',
              fontSize: '0.8125rem',
              fontWeight: 500,
            }}
          >
            About Pathfinder Scotland
          </span>
          <h1
            style={{
              color: '#fff',
              marginBottom: '20px',
              fontSize: '2.25rem',
              lineHeight: 1.2,
            }}
          >
            Helping every Scottish student find their path to university
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '1.125rem',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Built for the students who need guidance most
          </p>
        </div>
      </section>

      {/* The problem */}
      <section
        style={{
          backgroundColor: 'var(--pf-white)',
          paddingTop: '64px',
          paddingBottom: '64px',
        }}
      >
        <div className="pf-container" style={{ maxWidth: '760px' }}>
          <h2 style={{ marginBottom: '24px' }}>The guidance gap</h2>
          <div style={{ lineHeight: 1.8, color: 'var(--pf-grey-900)', fontSize: '1rem' }}>
            <p style={{ marginBottom: '20px' }}>
              Scottish students choose their Highers at 14–15 with limited guidance. Those decisions
              shape which universities they can apply to and which careers are open to them — yet most
              students make them without a clear picture of the consequences.
            </p>
            <p style={{ marginBottom: '20px' }}>
              Students from disadvantaged backgrounds are less likely to know which subjects open
              which doors, which universities offer adjusted entry requirements, or what financial
              support they&apos;re entitled to. The information exists, but it&apos;s scattered, jargon-heavy,
              and hard to navigate without someone in your corner.
            </p>
            <p style={{ marginBottom: 0 }}>
              Current tools either handle the admin side (built for schools) or are too generic to
              help with Scotland-specific decisions. Pathfinder is different: it&apos;s designed around
              the Scottish curriculum and the students who stand to benefit most from better guidance.
            </p>
          </div>
        </div>
      </section>

      {/* What Pathfinder does */}
      <section
        style={{
          backgroundColor: 'var(--pf-blue-50)',
          paddingTop: '64px',
          paddingBottom: '64px',
        }}
      >
        <div className="pf-container" style={{ maxWidth: '900px' }}>
          <h2 style={{ marginBottom: '8px', textAlign: 'center' }}>What Pathfinder does</h2>
          <p
            style={{
              textAlign: 'center',
              color: 'var(--pf-grey-600)',
              marginBottom: '40px',
              fontSize: '1rem',
            }}
          >
            One platform, built for the Scottish system
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            <div className="pf-card" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--pf-blue-100)',
                  color: 'var(--pf-blue-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.0625rem' }}>Subject to career pathways</h3>
              <p style={{ margin: 0, color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.65 }}>
                See exactly which careers and university courses each subject combination leads to — before you pick your Highers.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--pf-blue-100)',
                  color: 'var(--pf-blue-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.0625rem' }}>Automatic widening access check</h3>
              <p style={{ margin: 0, color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.65 }}>
                Enter your postcode and Pathfinder automatically checks your SIMD eligibility — no forms, no digging through PDFs.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--pf-blue-100)',
                  color: 'var(--pf-blue-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.0625rem' }}>Adjusted entry requirements</h3>
              <p style={{ margin: 0, color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.65 }}>
                See the realistic offer you&apos;d receive — not just the headline entry requirement that assumes no widening access context.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--pf-blue-100)',
                  color: 'var(--pf-blue-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.0625rem' }}>Built for the Scottish curriculum</h3>
              <p style={{ margin: 0, color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.65 }}>
                Nationals, Highers, Advanced Highers, SQA grading, SAAS funding — Pathfinder understands the Scottish system, not a UK-generic version of it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Widening access commitment */}
      <section
        style={{
          backgroundColor: 'var(--pf-white)',
          paddingTop: '64px',
          paddingBottom: '64px',
          borderTop: '1px solid var(--pf-grey-300)',
        }}
      >
        <div className="pf-container" style={{ maxWidth: '760px' }}>
          <div
            style={{
              borderLeft: '4px solid var(--pf-blue-500)',
              paddingLeft: '24px',
              marginBottom: '32px',
            }}
          >
            <h2 style={{ marginBottom: '16px' }}>Our widening access commitment</h2>
            <p
              style={{
                fontSize: '1.125rem',
                color: 'var(--pf-grey-900)',
                lineHeight: 1.75,
                fontStyle: 'italic',
                margin: 0,
              }}
            >
              Pathfinder Scotland exists to close the guidance gap.
            </p>
          </div>
          <div style={{ lineHeight: 1.8, color: 'var(--pf-grey-900)', fontSize: '1rem' }}>
            <p style={{ marginBottom: '20px' }}>
              Students from SIMD20 areas, care-experienced students, carers, estranged students, and
              those from underrepresented backgrounds deserve the same quality of guidance as
              everyone else. The system has more support built into it than most people realise —
              adjusted offers, guaranteed interviews, bursaries — but that support is invisible
              unless you know where to look.
            </p>
            <p style={{ marginBottom: 0 }}>
              Pathfinder checks eligibility automatically, so students see what&apos;s really available to
              them rather than just the headline entry requirements. We don&apos;t ask students to
              self-identify or navigate complex forms. We do the work so they can focus on their
              applications.
            </p>
          </div>
          <div style={{ marginTop: '32px' }}>
            <Link href="/widening-access" className="pf-btn pf-btn-secondary" style={{ display: 'inline-block' }}>
              Learn about widening access programmes
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section
        style={{
          backgroundColor: 'var(--pf-blue-50)',
          paddingTop: '64px',
          paddingBottom: '80px',
        }}
      >
        <div className="pf-container" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '16px' }}>Get in touch</h2>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '1rem',
              lineHeight: 1.75,
              marginBottom: '32px',
            }}
          >
            Questions, feedback, or interested in piloting Pathfinder in your school? We&apos;d love to
            hear from you.
          </p>
          <a
            href="mailto:hello@pathfinderscot.co.uk"
            className="pf-btn pf-btn-primary"
            style={{ display: 'inline-block' }}
          >
            hello@pathfinderscot.co.uk
          </a>
        </div>
      </section>
    </div>
  )
}
