import Link from 'next/link'
import type { Metadata } from 'next'
import { VerificationBanner, VerificationCaveat } from '@/components/ui/VerificationCaveat'

export const metadata: Metadata = {
  title: 'Disabled Student Support – Pathfinder Scotland',
}

const dsaRows = [
  {
    component: 'Specialist equipment and software',
    max: '£5,160 (whole course)',
    covers: 'Laptops, Dragon dictation, ergonomic furniture',
  },
  {
    component: 'Non-Medical Personal Help',
    max: '£20,520/year',
    covers: 'BSL interpreters, note-takers, autism mentors, study skills support',
  },
  {
    component: 'Consumables',
    max: '£1,725/year',
    covers: 'Braille paper, printer ink, USB drives',
  },
  {
    component: 'Travel',
    max: 'No stated cap',
    covers: 'Taxi costs where public transport is not accessible',
  },
]

const orgs = [
  { name: 'SAAS DSA', site: 'saas.gov.uk/guides/disabled-students-allowance', notes: 'Apply for DSA' },
  { name: 'ILF Scotland', site: 'ilf.scot/transition-fund', notes: 'Transition Fund applications' },
  { name: 'CALL Scotland', site: 'callscotland.org.uk', notes: 'Assistive technology advice and free equipment loan' },
  { name: 'Lead Scotland', site: 'lead.org.uk', notes: 'DSA guidance and disability support advice' },
  { name: 'Equality and Human Rights Commission', site: 'equalityhumanrights.com', notes: 'Your rights under the Equality Act' },
]

export default function DisabilityPage() {
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
            <span style={{ color: 'var(--pf-grey-900)' }}>Disability</span>
          </nav>
          <h1 style={{ marginBottom: '16px' }}>Support for disabled students</h1>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', lineHeight: 1.7, maxWidth: '660px' }}>
            If you have a disability, long-term health condition, mental health condition, or specific
            learning difficulty such as dyslexia, there is significant financial and practical support
            available. You do not need a formal diagnosis to ask for help — but evidence does help
            unlock the maximum support.
          </p>
        </div>
      </section>

      {/* Verification Banner */}
      <section className="pf-section pf-section-white" style={{ paddingTop: '24px', paddingBottom: '0' }}>
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <VerificationBanner />
        </div>
      </section>

      {/* DSA — Higher Education */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '8px' }}>Disabled Students&apos; Allowance (DSA) — higher education</h2>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '20px' }}>
            DSA is a non-repayable, non-income-assessed grant from SAAS for students studying at HNC
            level or above.
          </p>
          <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--pf-grey-200)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: 'var(--pf-grey-700)', whiteSpace: 'nowrap' }}>Component</th>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: 'var(--pf-grey-700)', whiteSpace: 'nowrap' }}>Maximum (full-time)</th>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: 'var(--pf-grey-700)' }}>What it covers</th>
                </tr>
              </thead>
              <tbody>
                {dsaRows.map((row) => (
                  <tr key={row.component} style={{ borderBottom: '1px solid var(--pf-grey-100)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--pf-grey-900)', whiteSpace: 'nowrap' }}>{row.component}</td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: 'var(--pf-grey-900)' }}>{row.max}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--pf-grey-600)' }}>{row.covers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Part-time students studying at least 50% of full-time load: same equipment allowance,
              50% of other allowances.
            </p>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              DSA does not cover further education (SVQs, National Certificates, access programmes).
              See section below for FE support.
            </p>
          </div>
          <VerificationCaveat
            org="SAAS"
            url="https://www.saas.gov.uk/guides/disabled-students-allowance"
            year="2025-26"
          />
        </div>
      </section>

      {/* ILF Scotland */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>ILF Scotland Transition Fund</h2>
          <div className="pf-card" style={{ padding: '20px 24px' }}>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '12px' }}>
              For disabled young people aged 15–25 leaving school or children&apos;s services. One-off
              grant of up to <strong>£4,000</strong>. Rolling applications — no fixed closing date.
              First-time applicants only since January 2024.
            </p>
            <VerificationCaveat
              org="ILF Scotland"
              url="https://ilf.scot/transition-fund/"
            />
          </div>
        </div>
      </section>

      {/* Further Education */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>Further education (college)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '8px' }}>
                DSA does not cover FE. Colleges provide disability support from their own budgets under
                the Additional Support Needs for Learning Allowance (ASNLA). This is not a
                student-facing grant — the college arranges it. Contact your college&apos;s learning
                support team directly.
              </p>
            </div>
            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                From AY 2026–27, FE support transfers from SFC to SAAS. Application processes may
                change.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Assessment Arrangements */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>Assessment arrangements in exams</h2>
          <div className="pf-card" style={{ padding: '20px 24px' }}>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '12px' }}>
              If you need extra support in exams, your school or college can apply for Assessment
              Arrangements from SQA/Qualifications Scotland. These are not a concession — they are an
              adjustment to let you demonstrate your abilities fairly.
            </p>
            <p style={{ color: 'var(--pf-grey-700)', fontSize: '0.9375rem', fontWeight: 500, marginBottom: '8px' }}>
              Available arrangements include:
            </p>
            <ul style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.8, paddingLeft: '20px', marginBottom: '12px' }}>
              <li>Extra time</li>
              <li>Rest breaks</li>
              <li>Word processor</li>
              <li>Reader</li>
              <li>Scribe</li>
              <li>Separate accommodation</li>
              <li>Screen readers</li>
              <li>Adapted question papers (Braille, large print, coloured paper)</li>
              <li>Sign language support</li>
            </ul>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Your school&apos;s ASN teacher or SQA co-ordinator manages this process. Apply well
              before exam diets — the deadline is typically January for the May/June diet.
            </p>
          </div>
        </div>
      </section>

      {/* Legal Rights */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>Your legal rights</h2>
          <div className="pf-card" style={{ padding: '20px 24px' }}>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Under the Equality Act 2010, universities and colleges have an <strong>anticipatory
              duty</strong> to make reasonable adjustments for disabled students. They must act
              proactively — you do not need to wait to be refused before asking for support. Contact
              the disability or learning support service at your institution as early as possible.
            </p>
          </div>
        </div>
      </section>

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
        </div>
      </section>

      {/* Back to support */}
      <section className="pf-section pf-section-grey">
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
