import Link from 'next/link'
import type { Metadata } from 'next'
import { VerificationBanner } from '@/components/ui/VerificationCaveat'

export const metadata: Metadata = {
  title: 'ESOL and EAL Student Support – Pathfinder Scotland',
}

const pathway = [
  'ESOL course at a Scottish college (free, no prior qualifications needed)',
  'National Qualifications (National 4/5) if needed',
  'Highers (1–2 years)',
  'College HNC/HND (articulates to Year 2 or 3 at university)',
  'University degree',
]

const orgs = [
  { name: 'Adult Learning Scotland', site: 'als.scot', notes: 'ESOL provision for adults' },
  { name: 'Scottish Refugee Council', site: 'scottishrefugeecouncil.org.uk', notes: 'Advice on ESOL routes for refugees' },
  { name: 'BEMIS Scotland', site: 'bemis.org.uk', notes: 'Support for ethnic minorities and new Scots' },
  { name: 'Education Scotland EAL guidance', site: 'education.gov.scot', notes: 'Resources for learners and teachers' },
]

export default function EsolEalPage() {
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
            <span style={{ color: 'var(--pf-grey-900)' }}>ESOL and EAL students</span>
          </nav>
          <h1 style={{ marginBottom: '16px' }}>Support for ESOL and EAL students</h1>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', lineHeight: 1.7, maxWidth: '660px' }}>
            If English is an Additional Language (EAL) for you, or if you are studying English for
            Speakers of Other Languages (ESOL), there are routes into college and university in
            Scotland designed for your situation.
          </p>
        </div>
      </section>

      {/* Verification Banner */}
      <section className="pf-section pf-section-white" style={{ paddingTop: '24px', paddingBottom: '0' }}>
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <VerificationBanner />
        </div>
      </section>

      {/* What is ESOL? */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>What is ESOL?</h2>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', lineHeight: 1.7 }}>
            ESOL courses at Scottish colleges are a recognised starting point. They are free to access
            and lead to qualifications that can progress you into National Qualifications, HNC/HND
            programmes, and then to university.
          </p>
        </div>
      </section>

      {/* The ESOL Pathway */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '20px' }}>The ESOL pathway</h2>
          <ol
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {pathway.map((step, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  padding: '16px 20px',
                  backgroundColor: 'var(--pf-white)',
                  border: '1px solid var(--pf-grey-200)',
                  borderRadius: '10px',
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--pf-blue-100)',
                    color: 'var(--pf-blue-700)',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-800)', lineHeight: 1.6, paddingTop: '3px' }}>
                  {step}
                </span>
              </li>
            ))}
          </ol>
          <p
            style={{
              marginTop: '20px',
              fontSize: '0.9375rem',
              color: 'var(--pf-grey-600)',
              lineHeight: 1.6,
              padding: '14px 18px',
              borderRadius: '8px',
              backgroundColor: 'var(--pf-blue-50)',
              border: '1px solid var(--pf-blue-100)',
            }}
          >
            This route typically takes 2–4 years from starting ESOL. It is a legitimate,
            well-supported pathway.
          </p>
        </div>
      </section>

      {/* EAL support at school */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '20px' }}>EAL support at school</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Additional support entitlement</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Scottish schools must provide additional support for EAL pupils. Ask your guidance
                teacher about EAL support staff at your school.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Qualifications Scotland assessment arrangements</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Qualifications Scotland assessment arrangements include language support for EAL candidates in some
                circumstances. Ask your school's Qualifications Scotland co-ordinator about what is available.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* English language requirements */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>English language requirements at university</h2>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', lineHeight: 1.7 }}>
            Universities set their own English language requirements. If you have studied in Scotland
            for two or more years at school level, many universities will waive external test
            requirements. Check directly with each university.
          </p>
        </div>
      </section>

      {/* Organisations */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '20px' }}>Organisations that can help</h2>
          <div style={{ overflowX: 'auto', marginBottom: '32px' }}>
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

          {/* See also */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '8px',
              backgroundColor: 'var(--pf-blue-50)',
              border: '1px solid var(--pf-blue-100)',
              marginBottom: '32px',
            }}
          >
            <p style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-800)', lineHeight: 1.6, margin: 0 }}>
              See also:{' '}
              <Link
                href="/support/refugees-asylum-seekers"
                style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}
              >
                support for refugees and asylum seekers
              </Link>
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
