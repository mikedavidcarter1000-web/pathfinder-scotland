import Link from 'next/link'
import type { Metadata } from 'next'
import { VerificationBanner, VerificationCaveat } from '@/components/ui/VerificationCaveat'

export const metadata: Metadata = {
  title: 'Rural and Island Student Support – Pathfinder Scotland',
}

const orgs = [
  { name: 'UHI', site: 'uhi.ac.uk', notes: 'University designed for Highland and Island students' },
  { name: 'SAAS', site: 'saas.gov.uk', notes: 'Travel and accommodation support' },
  { name: 'Open University Scotland', site: 'ou.ac.uk/scotland', notes: 'Distance learning with SAAS funding' },
  { name: 'Highlands and Islands Enterprise', site: 'hie.co.uk', notes: 'Economic and educational support in rural Scotland' },
]

export default function RuralIslandPage() {
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
            <span style={{ color: 'var(--pf-grey-900)' }}>Rural and Island</span>
          </nav>
          <h1 style={{ marginBottom: '16px' }}>Support for rural and island students</h1>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', lineHeight: 1.7, maxWidth: '660px' }}>
            Studying from a rural or island location in Scotland comes with specific costs and
            challenges. There is additional funding for travel and accommodation, and a university
            built specifically for your situation.
          </p>
        </div>
      </section>

      {/* Verification Banner */}
      <section className="pf-section pf-section-white" style={{ paddingTop: '24px', paddingBottom: '0' }}>
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <VerificationBanner />
        </div>
      </section>

      {/* SAAS Travel and Accommodation Support */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>SAAS travel and accommodation support</h2>
          <div className="pf-card" style={{ padding: '20px 24px' }}>
            <ul style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.8, paddingLeft: '20px', marginBottom: '16px' }}>
              <li style={{ marginBottom: '10px' }}>
                <strong style={{ color: 'var(--pf-grey-900)' }}>Summer Accommodation Grant:</strong> £1,330/year (full-time) or £665 (part-time) if
                you cannot return home during vacations due to distance. Apply through SAAS.
              </li>
              <li>
                <strong style={{ color: 'var(--pf-grey-900)' }}>Island students:</strong> Additional support available where ferry or air travel is required
                to attend university or college. Contact SAAS directly.
              </li>
            </ul>
            <VerificationCaveat
              org="SAAS"
              url="https://www.saas.gov.uk"
              year="2025-26"
              customText="Travel and accommodation support amounts vary. Confirm current figures and eligibility directly with SAAS."
            />
          </div>
        </div>
      </section>

      {/* UHI */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>University of the Highlands and Islands (UHI)</h2>
          <div className="pf-card" style={{ padding: '20px 24px' }}>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '12px' }}>
              UHI is Scotland&apos;s university specifically designed for students in remote and rural
              areas. It operates across 13 academic partner campuses from Shetland to Argyll. Many
              courses are available fully online or in blended format — you do not need to relocate.
            </p>
            <ul style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.8, paddingLeft: '20px' }}>
              <li>Study locally at your nearest campus or entirely from home</li>
              <li>Full SAAS funding available</li>
              <li>
                <a
                  href="https://www.uhi.ac.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--pf-blue-700)' }}
                >
                  uhi.ac.uk
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Open University Scotland */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>Open University Scotland</h2>
          <div className="pf-card" style={{ padding: '20px 24px' }}>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Fully distance learning. No campus attendance required. Full SAAS funding available
              for eligible students.{' '}
              <a
                href="https://www.ou.ac.uk/scotland"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--pf-blue-700)' }}
              >
                ou.ac.uk/scotland
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Free Bus Travel */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>Free bus travel</h2>
          <div className="pf-card" style={{ padding: '20px 24px' }}>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              All under-22s in Scotland qualify for free bus travel. This significantly reduces
              the transport cost of commuting to a local school, college, or UHI campus.
            </p>
          </div>
        </div>
      </section>

      {/* Digital Access */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>Digital access</h2>
          <div className="pf-card" style={{ padding: '20px 24px' }}>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              If you need help accessing devices or broadband connectivity for study, contact your
              local council. Connecting Scotland has provided devices and broadband support to
              digitally excluded households across Scotland.
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
