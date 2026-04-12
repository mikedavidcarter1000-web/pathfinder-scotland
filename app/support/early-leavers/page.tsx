import Link from 'next/link'
import type { Metadata } from 'next'
import { VerificationCaveat } from '@/components/ui/VerificationCaveat'

export const metadata: Metadata = {
  title: 'Support for School Leavers Without a Destination – Pathfinder Scotland',
}

const orgs = [
  { name: 'Skills Development Scotland', site: 'myworldofwork.co.uk', notes: 'Free careers advice; your first contact' },
  { name: 'Apprenticeships Scotland', site: 'apprenticeships.scot', notes: 'All apprenticeship types and vacancies' },
  { name: 'mygov.scot', site: 'mygov.scot/find-your-local-council', notes: 'Find your local NOLB contact' },
]

export default function EarlyLeaversPage() {
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
            <span style={{ color: 'var(--pf-grey-900)' }}>Early Leavers</span>
          </nav>
          <h1 style={{ marginBottom: '16px' }}>Left school without a destination?</h1>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', lineHeight: 1.7, maxWidth: '660px' }}>
            If you left school and are not in education, employment or training — or if you are
            thinking about leaving — there is a structured support system in Scotland designed
            specifically for you. You are not stuck.
          </p>
        </div>
      </section>

      {/* Activity Agreements and No One Left Behind */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>Activity Agreements and No One Left Behind</h2>
          <div className="pf-card" style={{ padding: '20px 24px' }}>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '16px' }}>
              Scotland&apos;s No One Left Behind (NOLB) framework means every 16–19 year old without
              a destination should be offered personalised support through their Local Employability
              Partnership (LEP). This includes Activity Agreements — a one-to-one programme with
              a Trusted Professional (Key Worker) that you design together.
            </p>
            <p style={{ color: 'var(--pf-grey-700)', fontSize: '0.9375rem', fontWeight: 500, marginBottom: '8px' }}>
              What an Activity Agreement involves:
            </p>
            <ul style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.8, paddingLeft: '20px', marginBottom: '16px' }}>
              <li>One-to-one support from a Key Worker throughout</li>
              <li>Personalised programme: work experience, college tasters, volunteering, confidence building, skills development</li>
              <li>No fixed structure — built around your interests and goals</li>
              <li>EMA of £30/week (up to 52 weeks, means-tested — more generous than school EMA which is term-time only)</li>
              <li>Referrals to Modern Apprenticeship or college opportunities</li>
            </ul>
            <VerificationCaveat
              org="your Local Employability Partnership"
              url="https://www.mygov.scot/ema"
              customText="EMA availability and amounts are locally administered. Confirm with your Local Employability Partnership."
            />
          </div>
        </div>
      </section>

      {/* How to Access Support */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>How to access support</h2>
          <div className="pf-card" style={{ padding: '20px 24px' }}>
            <ol style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.8, paddingLeft: '20px' }}>
              <li style={{ marginBottom: '12px' }}>
                Contact Skills Development Scotland (SDS) — your local careers adviser will help.
                Free. No referral needed.{' '}
                <a
                  href="https://www.myworldofwork.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--pf-blue-700)' }}
                >
                  myworldofwork.co.uk
                </a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                Your local council also has a No One Left Behind co-ordinator.
              </li>
              <li>
                Free bus travel: all under-22s in Scotland get free bus travel — transport is
                not a barrier.
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Routes Back into Education */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>Routes back into education</h2>
          <div className="pf-card" style={{ padding: '20px 24px' }}>
            <ul style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', lineHeight: 1.8, paddingLeft: '20px' }}>
              <li style={{ marginBottom: '10px' }}>
                <strong style={{ color: 'var(--pf-grey-900)' }}>College:</strong> Every 16–19 year old without a qualification is guaranteed a college offer
                under Opportunities for All. Colleges accept applications year-round.
              </li>
              <li style={{ marginBottom: '10px' }}>
                <strong style={{ color: 'var(--pf-grey-900)' }}>Modern Apprenticeship:</strong> Paid job plus training. No formal qualifications required.
                Over 100 frameworks available.{' '}
                <a
                  href="https://www.apprenticeships.scot"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--pf-blue-700)' }}
                >
                  apprenticeships.scot
                </a>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <strong style={{ color: 'var(--pf-grey-900)' }}>Foundation Apprenticeship:</strong> Available in S5/S6 or via college. SCQF Level 6.
              </li>
              <li>
                <strong style={{ color: 'var(--pf-grey-900)' }}>Graduate Apprenticeship:</strong> Degree-level qualification while working.
              </li>
            </ul>
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
