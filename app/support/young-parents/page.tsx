import Link from 'next/link'
import type { Metadata } from 'next'
import { VerificationCaveat, VerificationBanner } from '@/components/ui/VerificationCaveat'
import { SupportGroupOffers } from '@/components/offers/support-group-offers'

export const metadata: Metadata = {
  title: 'Young Parent and Lone Parent Support',
  alternates: { canonical: '/support/young-parents' },
}

const orgs = [
  { name: 'SAAS', site: 'saas.gov.uk', notes: 'Lone Parents Grant and Childcare Grant' },
  { name: 'Social Security Scotland', site: 'socialsecurity.gov.scot', notes: 'Best Start Grant, Scottish Child Payment' },
  { name: 'One Parent Families Scotland', site: 'opfs.org.uk', notes: 'Dedicated advice for lone parents in Scotland' },
  { name: 'Gingerbread Scotland', site: 'gingerbread.org.uk/scotland', notes: 'Support for single parents' },
]

export default function YoungParentsPage() {
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
            <span style={{ color: 'var(--pf-grey-900)' }}>Young parents and lone parents</span>
          </nav>
          <h1 style={{ marginBottom: '16px' }}>Support for young parents and lone parents</h1>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', lineHeight: 1.7, maxWidth: '660px' }}>
            Being a parent or expecting a child does not stop you from studying. Scotland has more
            financial support for student parents than most people realise. This page covers what
            you can claim at school, college, and university.
          </p>
        </div>
      </section>

      {/* Verification banner */}
      <section className="pf-section pf-section-white" style={{ paddingTop: '24px', paddingBottom: '0' }}>
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <VerificationBanner />
        </div>
      </section>

      {/* University support (SAAS) */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '20px' }}>University support (SAAS-funded)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Lone Parents Grant</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Up to GBP 1,305/year, income-assessed, for single parents in full-time undergraduate
                study. Apply through SAAS alongside your main application.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Lone Parents Childcare Grant</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Up to GBP 1,215/year towards registered childcare costs. Apply through SAAS alongside
                your main application.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Discretionary Childcare Fund</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Universities can also offer up to GBP 3,000 from their Discretionary Childcare Fund
                for additional childcare support. Ask your university's student funding team about eligibility.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Independent Student Bursary</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                As a lone parent you likely qualify as an Independent Student for SAAS — higher loan
                support is available regardless of parental income.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Childcare Fund (university)</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '8px' }}>
                Additional income-assessed childcare support available directly from your university.
                Apply to your university's student funding team.
              </p>
              <VerificationCaveat
                org="SAAS"
                url="https://www.saas.gov.uk"
                year="2025-26"
              />
            </div>

          </div>
        </div>
      </section>

      {/* Benefits while studying */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '20px' }}>Benefits while studying</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Best Start Grant (pregnancy and first child)</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                GBP 767.50 one-off payment at three key stages (pregnancy, birth, and early years). Means-tested. Apply via Social Security Scotland.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Best Start Foods</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                GBP 4.95–9.90/week in healthy food vouchers. Apply via Social Security Scotland.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Scottish Child Payment</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '8px' }}>
                GBP 28.20/week per child under 16. Means-tested. Apply via Social Security Scotland.
              </p>
              <VerificationCaveat
                org="Social Security Scotland"
                url="https://www.socialsecurity.gov.scot"
                year="2026-27"
              />
            </div>

          </div>
        </div>
      </section>

      {/* College students */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '20px' }}>College students</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>FE Bursary dependant allowance</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                The Further Education bursary includes a dependant allowance of up to £67.55/week
                for eligible students.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Childcare Fund at college</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Apply to your college's student funding team for additional childcare support.
                Note: EMA is not available alongside college bursary maintenance.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Secondary school */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '20px' }}>Secondary school (S5/S6)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Education Maintenance Allowance (EMA)</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                EMA (£30/week) is available in S5/S6 if household income qualifies. Speak to your
                guidance teacher about eligibility.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Flexible arrangements</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Speak to your guidance teacher about flexible timetabling, remote learning options,
                and pastoral support specific to your situation.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* What your school can do */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>What your school can do</h2>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', lineHeight: 1.7 }}>
            Tell your guidance teacher. Schools can arrange flexible timetabling, access to crèche or early years support, childcare help, and pastoral support. Your school can also help you navigate benefits and signpost local childcare resources.
          </p>
        </div>
      </section>

      {/* Offers & entitlements */}
      <SupportGroupOffers supportGroup="young-parents" background="blue" />

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

          <div style={{ marginTop: '40px' }}>
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
        </div>
      </section>
    </>
  )
}
