import Link from 'next/link'
import type { Metadata } from 'next'
import { VerificationCaveat, VerificationBanner } from '@/components/ui/VerificationCaveat'
import { SupportGroupOffers } from '@/components/offers/support-group-offers'

export const metadata: Metadata = {
  title: 'Estranged Student Support',
  alternates: { canonical: '/support/estranged-students' },
}

const orgs = [
  { name: 'NNECL (National Network for the Education of Care Leavers)', site: 'nnecl.org', notes: 'National network supporting care-experienced and estranged students into and through higher education' },
  { name: 'SAAS', site: 'saas.gov.uk', notes: 'Apply for funding; declare estrangement on application' },
  { name: 'NUS Scotland', site: 'nus-scotland.org.uk', notes: 'Student rights and welfare advice' },
  { name: 'Citizens Advice Scotland', site: 'cas.org.uk', notes: 'Free independent advice on benefits and housing' },
]

export default function EstrangedStudentsPage() {
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
            <span style={{ color: 'var(--pf-grey-900)' }}>Estranged students</span>
          </nav>
          <h1 style={{ marginBottom: '16px' }}>Support for estranged students</h1>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', lineHeight: 1.7, maxWidth: '660px' }}>
            An estranged student is someone who has lost contact with both parents or guardians and
            has no family financial support. If this is you, SAAS treats you differently — you access
            higher loan support and a dedicated bursary, regardless of your parents' income.
          </p>
        </div>
      </section>

      {/* Verification banner */}
      <section className="pf-section pf-section-white" style={{ paddingTop: '24px', paddingBottom: '0' }}>
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <VerificationBanner />
        </div>
      </section>

      {/* Financial support */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '20px' }}>Financial support</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Independent Student status</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Estranged students qualify as Independent Students for SAAS. Your funding is not
                assessed against parental income.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>SAAS total support</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '8px' }}>
                Up to GBP 11,400 per year (loan + bursary combined) for household incomes under GBP 21,000.
              </p>
              <VerificationCaveat
                org="SAAS"
                url="https://www.saas.gov.uk"
                year="2025-26"
              />
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Estranged Student Bursary top-up</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                GBP 1,000/year additional from SAAS. Declare estrangement on your SAAS application.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Stand Alone Pledge bursaries</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '8px' }}>
                15 of Scotland&apos;s 18 universities have signed the Stand Alone Legacy Pledge. They
                offer bursaries, accommodation guarantees, and dedicated support for estranged
                students. Ask the admissions team of each university you are considering whether they
                have signed the pledge and what support is available.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* What SAAS needs */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>What SAAS needs from you</h2>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '0' }}>
            SAAS will ask you to self-declare. You do not need a court order or a solicitor's letter.
            A short written statement explaining your situation is usually sufficient.
          </p>
        </div>
      </section>

      {/* University support */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '20px' }}>University support</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Named contact for estranged students</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Many Scottish universities have a named contact for estranged students. Search
                "[university name] estranged students" or ask the Students' Association when you arrive.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Year-round accommodation</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Stand Alone Pledge universities offer 365-day accommodation guarantees — accommodation
                is available during holidays, not just term time. This is essential if you cannot return
                home. Check directly with your university's accommodation team for details.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Hub for SUCCESS</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '8px' }}>
                Based at the University of Edinburgh, Hub for SUCCESS offers tailored support for care-experienced
                and estranged students. They provide mentoring, community, and practical help navigating
                university life.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>NNECL (National Network for the Education of Care Leavers)</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '8px' }}>
                National network supporting care-experienced and estranged students into and through
                higher education. Publishes a guide to which universities have signed the
                estrangement pledge and offer dedicated support.
              </p>
              <a
                href="https://www.nnecl.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1"
                style={{ color: 'var(--pf-blue-700)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}
              >
                nnecl.org
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Unite Foundation housing scholarship</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '8px' }}>
                The Unite Foundation offers free housing scholarships for estranged students. This
                support is in addition to university accommodation guarantees.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* What your school can do */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>What your school can do</h2>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', lineHeight: 1.7 }}>
            Tell a trusted adult at school — a guidance teacher, school counsellor, or senior staff member. Schools have pastoral support, can help you access hardship funds, and can flag your situation on UCAS forms to help universities provide appropriate support.
          </p>
        </div>
      </section>

      {/* Offers & entitlements */}
      <SupportGroupOffers supportGroup="estranged-students" background="blue" />

      {/* Organisations */}
      <section className="pf-section pf-section-white">
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

          <p style={{ marginTop: '32px', fontSize: '0.875rem', color: 'var(--pf-grey-500, #6b7280)' }}>
            If you need to leave this page quickly, use the &ldquo;Leave this site&rdquo; button at the bottom-left of your screen.
          </p>

          <div style={{ marginTop: '16px' }}>
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
