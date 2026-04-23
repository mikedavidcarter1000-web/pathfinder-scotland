import Link from 'next/link'
import type { Metadata } from 'next'
import { VerificationBanner } from '@/components/ui/VerificationCaveat'

export const metadata: Metadata = {
  title: 'Gypsy Roma Traveller Student Support',
  alternates: { canonical: '/support/grt' },
}

const orgs = [
  { name: 'STEP (Scottish Traveller Education Programme)', site: 'step.education.ed.ac.uk', notes: 'Education support for GRT communities; University of Edinburgh based' },
  { name: 'Friends, Families and Travellers', site: 'gypsy-traveller.org', notes: 'UK-wide GRT advice; Scotland services directory' },
  { name: 'MECOPP', site: 'mecopp.org.uk', notes: 'GRT community health and carer support in Scotland' },
  { name: 'Romano Lav', site: 'romanolav.org', notes: 'Roma-led charity in Glasgow; education and employability' },
  { name: 'Article 12 in Scotland', site: 'article12.org', notes: 'Rights-based work with GRT young people' },
  { name: 'Ando Glaso', site: 'andoglaso.org', notes: 'Roma cultural support in Glasgow' },
]

export default function GrtPage() {
  return (
    <>
      {/* Header */}
      <section
        style={{
          backgroundColor: 'var(--pf-white)',
          borderBottom: '1px solid var(--pf-grey-300)',
          paddingTop: '56px',
          paddingBottom: '40px',
        }}
      >
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <nav
            aria-label="Breadcrumb"
            style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginBottom: '16px' }}
          >
            <Link href="/" style={{ color: 'var(--pf-grey-600)' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link href="/support" style={{ color: 'var(--pf-grey-600)' }}>Support</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--pf-grey-900)' }}>Gypsy, Roma and Traveller students</span>
          </nav>
          <h1 style={{ marginBottom: '16px' }}>Support for Gypsy, Roma and Traveller students</h1>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', lineHeight: 1.7, maxWidth: '660px' }}>
            Gypsy, Roma and Traveller (GRT) students face some of the biggest barriers in Scottish
            education, including the highest rates of non-qualification and the lowest positive
            destination rates. This page maps every source of support that genuinely exists.
          </p>
        </div>
      </section>

      {/* Verification Banner */}
      <section className="pf-section pf-section-white" style={{ paddingTop: '24px', paddingBottom: '0' }}>
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <VerificationBanner />
        </div>
      </section>

      {/* Honest picture on funding */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>The honest picture on funding</h2>
          <div className="pf-card" style={{ padding: '20px 24px', marginBottom: '16px' }}>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '12px' }}>
              There are currently <strong>no dedicated GRT bursaries</strong> at Scottish universities.
              Scotland&apos;s widening access framework focuses on SIMD (deprivation), care experience,
              and school type rather than ethnic background. However, GRT students from deprived
              postcodes will typically qualify for SIMD-based contextualised admissions and standard
              widening access funding.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="pf-card" style={{ padding: '16px 24px' }}>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Standard SAAS bursaries and loans apply.
              </p>
            </div>
            <div className="pf-card" style={{ padding: '16px 24px' }}>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                If from a SIMD 1–2 postcode, contextualised admissions (typically 2 grades lower than
                standard entry) applies at most Scottish universities.
              </p>
            </div>
            <div className="pf-card" style={{ padding: '16px 24px' }}>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                University discretionary/hardship funds are available to any student in need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Flexible learning */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '8px' }}>Flexible learning options</h2>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '20px' }}>
            If regular attendance is difficult:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>University of the Highlands and Islands (UHI)</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Blended and distance learning across 13 campuses. The most accessible university
                structure in Scotland for students who cannot relocate.{' '}
                <a
                  href="https://uhi.ac.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}
                >
                  uhi.ac.uk
                </a>
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Open University Scotland</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Fully distance learning. No attendance required. Full SAAS funding available.{' '}
                <a
                  href="https://ou.ac.uk/scotland"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}
                >
                  ou.ac.uk/scotland
                </a>
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>FE colleges</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Many offer part-time and evening options.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Article 12 (STEP) — ATTRAs</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Achievement Awards (ATTRAs) delivered at home sites for young people not in school.{' '}
                <a
                  href="https://step.education.ed.ac.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}
                >
                  step.education.ed.ac.uk
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support organisations */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '20px' }}>Support organisations</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--pf-grey-200)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: 'var(--pf-grey-700)', whiteSpace: 'nowrap' }}>Organisation</th>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: 'var(--pf-grey-700)', whiteSpace: 'nowrap' }}>Website</th>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: 'var(--pf-grey-700)' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((org) => (
                  <tr key={org.name} style={{ borderBottom: '1px solid var(--pf-grey-100)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--pf-grey-900)' }}>{org.name}</td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <a
                        href={`https://${org.site}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--pf-blue-700)' }}
                      >
                        {org.site}
                      </a>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--pf-grey-600)' }}>{org.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* At-school support */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>At-school support</h2>
          <div className="pf-card" style={{ padding: '20px 24px' }}>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Dedicated GRT education support workers exist in some councils: confirmed in Fife (GATE
              team), South Lanarkshire (GTEG), and Edinburgh. STEP provides support and resources to
              schools and local authorities nationwide. If your school does not know how to support
              you, they can contact STEP directly.
            </p>
          </div>
        </div>
      </section>

      {/* University pledge */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>University pledge</h2>
          <div className="pf-card" style={{ padding: '20px 24px' }}>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              The University of Strathclyde has signed the GTRSB into Higher Education Pledge,
              committing to outreach, data monitoring, and cultural celebration. Ask other universities
              whether they have signed.
            </p>
          </div>
        </div>
      </section>

      {/* Back to support */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <Link
            href="/support"
            className="inline-flex items-center gap-2"
            style={{ color: 'var(--pf-blue-700)', fontWeight: 600, fontSize: '0.9375rem', textDecoration: 'none' }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to support hub
          </Link>
        </div>
      </section>
    </>
  )
}
