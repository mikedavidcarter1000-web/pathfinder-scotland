import Link from 'next/link'
import type { Metadata } from 'next'
import { VerificationCaveat, VerificationBanner } from '@/components/ui/VerificationCaveat'
import { SupportGroupOffers } from '@/components/offers/support-group-offers'

export const metadata: Metadata = {
  title: 'Young Carer Support – Pathfinder Scotland',
}

const orgs = [
  { name: 'Carers Trust Scotland', site: 'carers.org', notes: 'National support and advice' },
  { name: 'Young Scot', site: 'youngscot.net/info/carers', notes: 'Information for young carers in Scotland' },
  { name: 'Social Security Scotland', site: 'socialsecurity.gov.scot', notes: 'Young Carer Grant applications' },
  { name: 'Coalition of Carers', site: 'carersnet.org', notes: 'Local group signposting' },
  { name: 'Carers UK', site: 'carersuk.org', notes: 'UK-wide support and advice' },
]

export default function YoungCarersPage() {
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
            <span style={{ color: 'var(--pf-grey-900)' }}>Young carers</span>
          </nav>
          <h1 style={{ marginBottom: '16px' }}>Support for young carers</h1>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', lineHeight: 1.7, maxWidth: '660px' }}>
            If you look after a family member or friend who has a disability, illness, mental health
            condition, or substance dependency, you are a young carer — even if no one has ever used
            that word. Caring responsibilities can make studying harder, but there is financial support
            and university routes specifically for you.
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
          <h2 style={{ marginBottom: '20px' }}>Money you may be entitled to</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Young Carer Grant</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '8px' }}>
                GBP 405.10/year from Social Security Scotland. For young carers aged 16–18 (or 19 if
                still in school) who care for someone receiving certain disability benefits.{' '}
                <a
                  href="https://www.mygov.scot/young-carer-grant"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}
                >
                  Apply at mygov.scot/young-carer-grant
                </a>
                .
              </p>
              <VerificationCaveat
                org="Social Security Scotland"
                url="https://www.mygov.scot/young-carer-grant"
                year="2026-27"
              />
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>SAAS Independent Student Bursary</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Caring responsibilities can qualify you as an independent student for SAAS purposes,
                unlocking higher loan support regardless of your parents' income.{' '}
                <Link href="/prep" style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}>
                  See /prep for detail
                </Link>
                .
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Carer Support Payment / Carer&apos;s Allowance</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '8px' }}>
                £81.90/week for people who spend at least 35 hours a week caring for someone receiving
                certain disability benefits. In Scotland this is now administered by Social Security Scotland
                as Carer Support Payment (replacing the DWP Carer&apos;s Allowance).
              </p>
              <p style={{
                color: 'var(--pf-amber-800, #92400e)',
                backgroundColor: 'var(--pf-amber-50, #fffbeb)',
                border: '1px solid var(--pf-amber-200, #fde68a)',
                borderRadius: '6px',
                padding: '10px 14px',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                marginBottom: '8px',
              }}>
                <strong>Important for students:</strong> Full-time students (studying 21+ hours/week) are
                generally not eligible. Narrow exceptions exist — check the link below or contact Social
                Security Scotland to confirm your situation before applying.
              </p>
              <a
                href="https://www.gov.uk/carers-allowance"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1"
                style={{ color: 'var(--pf-blue-700)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}
              >
                gov.uk/carers-allowance
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <VerificationCaveat
                org="Social Security Scotland / DWP"
                url="https://www.gov.uk/carers-allowance"
                year="2025-26"
              />
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>University discretionary funds</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Many universities have emergency and hardship funds for students in difficulty. Contact
                your Students' Association for details.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* University and college access */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '20px' }}>University and college access</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Contextualised admissions</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Most Scottish universities consider caring responsibilities as a widening access
                factor alongside SIMD and SWAP. Declare this on your UCAS personal statement and any
                contextual data form.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>University of Edinburgh Young Carers Project</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '8px' }}>
                Dedicated funding, support staff, and a peer network for young carers at the
                University of Edinburgh.
              </p>
              <a
                href="https://www.ed.ac.uk/student-funding/young-carers"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1"
                style={{ color: 'var(--pf-blue-700)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}
              >
                ed.ac.uk/student-funding/young-carers
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>University carer bursaries</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                University of Glasgow offers Talent Scholarships (GBP 1,500/year) and Robert Gordon University
                offers Access Scholarships (GBP 3,000/year) for young carers. Check directly with your
                chosen university for carer-specific support.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Independent student status and loan support</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                If assessed as an Independent Student due to caring, higher loan support may apply.
                Your funding is not assessed against parental income.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Going Higher recognition</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Some Scottish universities have signed the Going Higher recognition award for carer-friendly
                provision. Ask your chosen university if they are part of this scheme.
              </p>
            </div>

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

      {/* What your school can do */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>What your school can do</h2>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', lineHeight: 1.7 }}>
            Schools can offer flexible timetabling, support with catching up on missed classes, and help applying for EMA if your household qualifies. Your guidance teacher can also flag your caring role on UCAS forms, which helps universities understand your context.
          </p>
        </div>
      </section>

      {/* Offers & entitlements */}
      <SupportGroupOffers supportGroup="young-carers" background="blue" />

      {/* What to do next */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>What to do next</h2>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '32px' }}>
            Tell your school guidance teacher or university disability/wellbeing service about your
            caring role. You do not need to share details — just enough for them to note it. This
            unlocks formal support and flexible arrangements.
          </p>

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
