import Link from 'next/link'
import type { Metadata } from 'next'
import { VerificationBanner, VerificationCaveat } from '@/components/ui/VerificationCaveat'

export const metadata: Metadata = {
  title: 'Home-Educated Student Support – Pathfinder Scotland',
}

const orgs = [
  { name: 'Schoolhouse Home Education Association', site: 'schoolhouse.org.uk', notes: 'Scottish home education support and advice' },
  { name: 'Education Scotland', site: 'education.gov.scot', notes: 'Curriculum framework context' },
  { name: 'SAAS', site: 'saas.gov.uk', notes: 'Funding for home-educated students entering HE' },
  { name: 'NowrongPath', site: 'nowrongpath.scot', notes: 'Alternative entry routes into Scottish universities' },
]

export default function HomeEducatedPage() {
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
            <span style={{ color: 'var(--pf-grey-900)' }}>Home Educated</span>
          </nav>
          <h1 style={{ marginBottom: '16px' }}>Support for home-educated students</h1>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', lineHeight: 1.7, maxWidth: '660px' }}>
            If you have been home educated, you can apply to Scottish universities and colleges.
            There is no legal requirement to have attended school. What matters is your
            qualifications and how you present your learning to admissions teams.
          </p>
        </div>
      </section>

      {/* Verification Banner */}
      <section className="pf-section pf-section-white" style={{ paddingTop: '24px', paddingBottom: '0' }}>
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <VerificationBanner />
        </div>
      </section>

      {/* Qualifications */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>Qualifications</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '12px' }}>
                You can sit SQA qualifications (Nationals, Highers, Advanced Highers) as a private
                candidate through a local school or college acting as an exam centre. Some FE colleges
                accept home-educated students directly onto HNC/HND courses. The Open University
                offers introductory modules with no entry requirements.
              </p>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Contact your local council to ask about accessing SQA exams as a home-educated
                student. Some councils have a dedicated home education officer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* University Admissions */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>University admissions</h2>
          <div className="pf-card" style={{ padding: '20px 24px' }}>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '12px' }}>
              Scottish universities assess home-educated applicants individually. Most will consider:
            </p>
            <ul style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.8, paddingLeft: '20px', marginBottom: '12px' }}>
              <li>SQA qualifications gained as a private candidate</li>
              <li>Portfolio of work or independent projects</li>
              <li>Personal statement explaining your educational background</li>
              <li>Interview (some universities offer this as standard for non-traditional applicants)</li>
            </ul>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Contact the admissions team of any university you are considering before applying.
              Explain your background early.
            </p>
          </div>
        </div>
      </section>

      {/* SAAS Funding */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>SAAS funding</h2>
          <div className="pf-card" style={{ padding: '20px 24px' }}>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Home-educated students who gain a place at a Scottish university are eligible for
              standard SAAS funding — the same as any other student. Age and independence criteria
              apply in the same way.
            </p>
          </div>
        </div>
      </section>

      {/* College as a Route */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>College as a route</h2>
          <div className="pf-card" style={{ padding: '20px 24px' }}>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              FE college is often the most direct route from home education to university. Colleges
              are generally more flexible on entry requirements than universities. A college HNC or
              HND can then progress to Year 2 or 3 at university.
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
