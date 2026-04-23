// Content note: This page covers practical support resources only. No policy commentary.
// LGBTQ+ content should be reviewed annually to ensure organisations and services are current
import Link from 'next/link'
import type { Metadata } from 'next'
import { VerificationBanner, VerificationCaveat } from '@/components/ui/VerificationCaveat'
import { SupportGroupOffers } from '@/components/offers/support-group-offers'

export const metadata: Metadata = {
  title: 'LGBTQ+ Student Support',
  alternates: { canonical: '/support/lgbtq' },
}

const orgs = [
  { name: 'LGBT Youth Scotland', site: 'lgbtyouth.org.uk', notes: 'Support for LGBTQ+ young people aged 13–25 in Scotland' },
  { name: 'LGBT Health and Wellbeing', site: 'lgbthealth.org.uk', notes: 'Wellbeing services, 16+' },
  { name: 'NUS Scotland', site: 'nus-scotland.org.uk', notes: 'Student rights and LGBTQ+ campaigns' },
  { name: 'AKT (Albert Kennedy Trust)', site: 'akt.org.uk', notes: 'Housing and support for LGBTQ+ young people at risk of homelessness' },
]

export default function LgbtqPage() {
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
            <span style={{ color: 'var(--pf-grey-900)' }}>LGBTQ+</span>
          </nav>
          <h1 style={{ marginBottom: '16px' }}>Support for LGBTQ+ students</h1>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', lineHeight: 1.7, maxWidth: '660px' }}>
            Every Scottish university and college has LGBTQ+ support. This page points you to
            practical resources: societies, support contacts, and the limited but real financial
            support that exists.
          </p>
        </div>
      </section>

      {/* Verification Banner */}
      <section className="pf-section pf-section-white" style={{ paddingTop: '24px', paddingBottom: '0' }}>
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <VerificationBanner />
        </div>
      </section>

      {/* Support at university */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '8px' }}>Support at university</h2>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '20px' }}>
            Every Scottish university has an LGBTQ+ student society and an Equality, Diversity and
            Inclusion (EDI) service.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>University of Strathclyde</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '6px' }}>
                <strong>Ask Alex</strong> service for trans, non-binary and gender-diverse students
                (strath.ac.uk/askalex).
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>University of Edinburgh</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Trans and Non-Binary Campaign with elected officer. LGBTQ+ Peer Mentoring at{' '}
                <a
                  href="https://lgbtqmentor.eusa.ed.ac.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}
                >
                  lgbtqmentor.eusa.ed.ac.uk
                </a>
                .
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>University of the Highlands and Islands (UHI)</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                <strong>HISA Gender Expression Fund</strong> — up to <strong>£100</strong> for
                trans/non-binary UHI students for gender expression items (clothing, binders, etc.).
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>All universities</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Contact your Students&apos; Association LGBTQ+ society or the EDI service directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Financial support */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '8px' }}>Financial support</h2>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '20px' }}>
            Dedicated LGBTQ+-specific financial support in Scotland is very limited. The following is
            what currently exists:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Edinburgh Business School LGBTQ+ MSc Scholarship</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                <strong>£10,000</strong> towards fees. 2 available per year. Postgraduate (MSc) only.
                Open to any nationality.{' '}
                <a
                  href="https://business-school.ed.ac.uk/scholarships/msc-lgbt"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}
                >
                  business-school.ed.ac.uk/scholarships/msc-lgbt
                </a>
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>HISA Gender Expression Fund</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Up to <strong>£100</strong> for trans/non-binary UHI students.{' '}
                <a
                  href="https://hisa.uhi.ac.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}
                >
                  hisa.uhi.ac.uk
                </a>
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Standard SAAS funding and hardship funds</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                General SAAS bursaries and loans apply to all students regardless of LGBTQ+ status.
                University hardship/discretionary funds are open to any student in financial
                difficulty.
              </p>
            </div>
          </div>
          <VerificationCaveat
            org="the relevant institution"
            url="https://www.saas.gov.uk"
            customText="LGBTQ+-specific funding is limited and subject to change. Confirm availability directly with the relevant institution."
          />
        </div>
      </section>

      {/* National organisations */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '20px' }}>National organisations</h2>
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
      <SupportGroupOffers supportGroup="lgbtq" background="blue" />

      {/* If you need support now */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>If you need support now</h2>
          <div className="pf-card" style={{ padding: '20px 24px', marginBottom: '32px' }}>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              If you are struggling, your Students&apos; Association LGBTQ+ society or EDI service is
              a good first contact. You can also contact{' '}
              <strong>Switchboard</strong> (LGBTQ+ helpline) on{' '}
              <a href="tel:08000119100" style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}>
                0800 0119 100
              </a>{' '}
              (10am–10pm, every day).
            </p>
          </div>

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
