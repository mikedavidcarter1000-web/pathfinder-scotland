import Link from 'next/link'
import type { Metadata } from 'next'
import { VerificationBanner, VerificationCaveat } from '@/components/ui/VerificationCaveat'
import { SupportGroupOffers } from '@/components/offers/support-group-offers'

export const metadata: Metadata = {
  title: 'Mature Student Support',
  alternates: { canonical: '/support/mature-students' },
}

const orgs = [
  { name: 'SWAP', site: 'scottishwideraccess.org', notes: 'Access courses with guaranteed university places' },
  { name: 'SAAS', site: 'saas.gov.uk', notes: 'Independent Student and part-time funding' },
  { name: 'Open University Scotland', site: 'www.open.ac.uk', notes: 'Part-time degree study, no entry requirements' },
  { name: 'NowrongPath', site: 'nowrongpath.scot', notes: 'Alternative routes into Scottish universities' },
  { name: 'College Development Network', site: 'cdn.ac.uk', notes: 'FE college information' },
]

export default function MatureStudentsPage() {
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
            <span style={{ color: 'var(--pf-grey-900)' }}>Mature students</span>
          </nav>
          <h1 style={{ marginBottom: '16px' }}>Support for mature students and adult returners</h1>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', lineHeight: 1.7, maxWidth: '660px' }}>
            If you are 21 or older, or returning to education after a gap, Scotland has more routes
            into university than school leavers typically use — and dedicated funding to match.
          </p>
        </div>
      </section>

      {/* Verification Banner */}
      <section className="pf-section pf-section-white" style={{ paddingTop: '24px', paddingBottom: '0' }}>
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <VerificationBanner />
        </div>
      </section>

      {/* What counts as mature? */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>What counts as a mature student?</h2>
          <div className="pf-card" style={{ padding: '20px 24px' }}>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '12px' }}>
              SAAS defines a mature student as someone who does not meet all the criteria for the
              Young Student Bursary. In practice, if you are 21 or over at the start of your course,
              your funding is not assessed against your parents&apos; income.
            </p>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              You may also qualify as an Independent Student if you are: married or in a civil
              partnership, estranged from your parents, have been self-supporting for 3 years, or
              have dependent children. Independent Student classification unlocks funding assessed
              only on your own income.
            </p>
          </div>
        </div>
      </section>

      {/* Routes into university */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '20px' }}>Routes into university</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>SWAP — Scottish Wider Access Programme</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Free one-year access courses at colleges for adults with few or no formal
                qualifications. Guaranteed university place on completion. Four regions: SWAP East,
                SWAP West, SWAP North, SWAP South.{' '}
                <a
                  href="https://scottishwideraccess.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}
                >
                  scottishwideraccess.org
                </a>
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>HNC/HND articulation</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                College HNC progresses to Year 2 at university; HND to Year 3. Used by roughly a
                third of Scottish university entrants.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>RPL — Recognition of Prior Learning</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Some universities credit work or life experience toward a degree. Ask the admissions
                team directly.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Direct entry</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Many Scottish universities assess mature applicants on experience and motivation
                rather than qualifications alone. Contact admissions directly to explain your
                background.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Open University Scotland</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Part-time degree study with no formal entry requirements. Study while working or
                caring. Available across all subject areas.{' '}
                <a
                  href="https://www.open.ac.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}
                >
                  open.ac.uk
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Funding */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '20px' }}>Funding</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Independent Student Bursary (SAAS)</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Up to <strong>£1,000/year</strong> bursary (income-assessed) plus up to{' '}
                <strong>£10,400 loan</strong>. Total up to <strong>£11,400</strong> for household
                income under £21,000.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Part-time SAAS support</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Available if studying at least 50% of a full-time equivalent course. Loan only —
                no bursary for part-time.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>FE Bursary (college)</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Up to <strong>£125.55/week</strong> maintenance if self-supporting.
              </p>
            </div>
          </div>
          <VerificationCaveat org="SAAS" url="https://www.saas.gov.uk" year="2025-26" />
        </div>
      </section>

      {/* Part-time study */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>Part-time study</h2>
          <div className="pf-card" style={{ padding: '20px 24px' }}>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Part-time degrees are available at most Scottish universities. You can study while
              working. SAAS provides a loan (not a bursary) for part-time study. Eligibility requires
              studying at least 50% of the equivalent full-time course.
            </p>
          </div>
        </div>
      </section>

      {/* Organisations */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '20px' }}>Organisations that can help</h2>
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
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--pf-grey-900)', whiteSpace: 'nowrap' }}>{org.name}</td>
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

      {/* Offers & entitlements */}
      <SupportGroupOffers supportGroup="mature-students" background="blue" />

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
