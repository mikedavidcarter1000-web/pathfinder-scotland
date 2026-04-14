import Link from 'next/link'
import type { Metadata } from 'next'
import { VerificationCaveat, VerificationBanner } from '@/components/ui/VerificationCaveat'
import { SupportGroupOffers } from '@/components/offers/support-group-offers'

export const metadata: Metadata = {
  title: 'Refugee and Asylum Seeker Support – Pathfinder Scotland',
}

const orgs = [
  { name: 'Scottish Refugee Council', site: 'scottishrefugeecouncil.org.uk', notes: 'Specialist advice; can help check fee eligibility' },
  { name: 'Bridges Programmes', site: 'bridgesprogrammes.org.uk', notes: 'University preparation for refugees in Edinburgh' },
  { name: 'BEMIS Scotland', site: 'bemis.org.uk', notes: 'Ethnic minority and new Scots support' },
  { name: 'Universities Scotland Sanctuary', site: 'universities-scotland.ac.uk/our-priorities/widening-access/sanctuary-scholarships/', notes: 'Scottish university sanctuary provisions' },
  { name: 'mygov.scot', site: 'mygov.scot/asylum-seekers-and-refugees', notes: 'Scottish Government information' },
]

export default function RefugeesAsylumSeekersPage() {
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
            <span style={{ color: 'var(--pf-grey-900)' }}>Refugees and asylum seekers</span>
          </nav>

          {/* Visible notice */}
          <div
            role="note"
            style={{
              padding: '14px 18px',
              borderRadius: '8px',
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              marginBottom: '24px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
              style={{ flexShrink: 0, marginTop: '2px', color: 'var(--pf-amber-500)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-900)', lineHeight: 1.6, margin: 0 }}>
              Your eligibility for funding depends on your immigration status. This page gives general
              information — always check with an immigration adviser or the organisation named before
              applying.
            </p>
          </div>

          <h1 style={{ marginBottom: '16px' }}>Support for refugees and asylum seekers</h1>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', lineHeight: 1.7, maxWidth: '660px' }}>
            Scotland's universities and colleges want to welcome refugees and people seeking asylum.
            Access to funding depends on your immigration status, but there are dedicated scholarships
            and support organisations specifically for you.
          </p>
        </div>
      </section>

      {/* Verification banner */}
      <section className="pf-section pf-section-white" style={{ paddingTop: '24px', paddingBottom: '0' }}>
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <VerificationBanner />
        </div>
      </section>

      {/* Immigration status and fees */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '20px' }}>Immigration status and fees</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Refugee status (granted) / Humanitarian Protection</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Eligible for home fees and SAAS funding at most Scottish universities. Treated the
                same as a settled UK resident.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Asylum seeker (decision pending)</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Not eligible for SAAS funding. Some universities offer fee waivers for asylum seekers.
                Check directly with each university.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Leave to Remain (various types)</h3>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '8px' }}>
                Eligibility varies depending on the type of leave. Confirm with the university
                admissions team before applying.
              </p>
              <VerificationCaveat
                org="SAAS and your university admissions team"
                url="https://www.saas.gov.uk"
                customText="Funding eligibility depends on immigration status. Confirm your entitlement directly with SAAS and your university before applying."
              />
            </div>

          </div>
        </div>
      </section>

      {/* Sanctuary scholarships */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>Sanctuary scholarships</h2>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '16px' }}>
            Many Scottish universities offer sanctuary scholarships for asylum seekers and refugees.
            Amounts vary — check each university directly.
          </p>
          <p style={{ color: 'var(--pf-grey-700)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '16px' }}>
            Universities with confirmed sanctuary provision include: University of Edinburgh,
            University of Glasgow, University of St Andrews, University of Strathclyde, Heriot-Watt,
            Glasgow Caledonian, Robert Gordon, UHI, and others.
          </p>
          <p style={{ color: 'var(--pf-grey-700)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '12px' }}>
            Master list:{' '}
            <a
              href="https://www.universities-scotland.ac.uk/our-priorities/widening-access/sanctuary-scholarships/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}
            >
              universities-scotland.ac.uk/our-priorities/widening-access/sanctuary-scholarships/
            </a>
          </p>
          <VerificationCaveat
            org="each university directly"
            url="https://www.universities-scotland.ac.uk/our-priorities/widening-access/sanctuary-scholarships/"
            customText="Scholarship availability and amounts change each year. Check directly with the university you are applying to."
          />
        </div>
      </section>

      {/* ESOL and language support */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>ESOL and language support</h2>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', lineHeight: 1.7 }}>
            If English is not your first language, see also{' '}
            <Link href="/support/esol-eal" style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}>
              /support/esol-eal
            </Link>
            . College ESOL courses are a recognised pathway to university.
          </p>
        </div>
      </section>

      {/* What your school can do */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>What your school can do</h2>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', lineHeight: 1.7 }}>
            Tell your guidance teacher or school leadership. Scottish schools are experienced in supporting newly-arrived students with ESOL, settling-in support, and can flag your circumstances on UCAS forms so universities can provide appropriate backing.
          </p>
        </div>
      </section>

      {/* Offers & entitlements */}
      <SupportGroupOffers supportGroup="refugees-asylum-seekers" background="blue" />

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
                    <td style={{ padding: '12px 16px' }}>
                      <a
                        href={`https://${org.site}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--pf-blue-700)', wordBreak: 'break-word' }}
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
