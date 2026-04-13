import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms and conditions for using Pathfinder Scotland — in plain English.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <div style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      {/* Page header */}
      <section
        style={{
          backgroundColor: 'var(--pf-white)',
          borderBottom: '1px solid var(--pf-grey-300)',
          paddingTop: '56px',
          paddingBottom: '40px',
        }}
      >
        <div className="pf-container" style={{ maxWidth: '760px' }}>
          <nav
            aria-label="Breadcrumb"
            style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginBottom: '16px' }}
          >
            <Link href="/" style={{ color: 'var(--pf-grey-600)' }}>
              Home
            </Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--pf-grey-900)' }}>Terms of Service</span>
          </nav>
          <h1 style={{ marginBottom: '8px' }}>Terms of Service</h1>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
            Last updated: April 2026
          </p>
        </div>
      </section>

      {/* Body */}
      <section style={{ paddingTop: '48px', paddingBottom: '80px' }}>
        <div className="pf-container" style={{ maxWidth: '760px' }}>
          <div
            className="pf-card"
            style={{ padding: '40px', lineHeight: 1.75, color: 'var(--pf-grey-900)' }}
          >
            <p style={{ marginBottom: '24px' }}>
              These terms explain what you can expect from Pathfinder Scotland, and what we ask of you
              in return. By creating an account or using the site, you agree to them. We have tried to
              keep them short and plain — if anything is unclear, email us.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>What Pathfinder is</h2>
            <p style={{ marginBottom: '24px' }}>
              Pathfinder Scotland is a free guidance tool for Scottish students. It helps you explore
              SQA subjects, plan your S3 to S6 pathway, and check your eligibility against Scottish
              university entry requirements. It is <strong>not</strong> a substitute for formal careers
              advice or an official offer from a university.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Important disclaimer</h2>
            <div
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                borderLeft: '3px solid var(--pf-amber-500)',
                padding: '16px 20px',
                borderRadius: '8px',
                marginBottom: '24px',
              }}
            >
              <p style={{ color: 'var(--pf-grey-900)' }}>
                Course information, entry requirements, and widening access criteria are provided{' '}
                <strong>for guidance only</strong>. We make every reasonable effort to keep data
                accurate and up to date, but we cannot guarantee it. Always confirm the current
                requirements directly with the university before applying.
              </p>
            </div>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Your account</h2>
            <p style={{ marginBottom: '24px' }}>
              You are responsible for keeping your login details secure. If you think someone else has
              accessed your account, please change your password and contact us. You can delete your
              account at any time from your settings page.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Acceptable use</h2>
            <p style={{ marginBottom: '16px' }}>Please do not:</p>
            <ul style={{ marginBottom: '24px', paddingLeft: '24px', listStyleType: 'disc' }}>
              <li style={{ marginBottom: '8px' }}>Scrape, crawl, or bulk-download the platform</li>
              <li style={{ marginBottom: '8px' }}>Share your account credentials with others</li>
              <li style={{ marginBottom: '8px' }}>
                Use Pathfinder to harass other users or impersonate anyone
              </li>
              <li style={{ marginBottom: '8px' }}>
                Attempt to bypass security, authentication, or access controls
              </li>
              <li style={{ marginBottom: '8px' }}>
                Republish Pathfinder&apos;s data as your own product or service
              </li>
            </ul>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Intellectual property</h2>
            <p style={{ marginBottom: '24px' }}>
              The Pathfinder Scotland name, logo, branding, and platform code belong to us. Course and
              subject information is sourced from publicly available data published by Qualifications Scotland, UCAS,
              and Scottish universities — we curate and present it, but we do not claim ownership of
              the underlying facts.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Limitation of liability</h2>
            <p style={{ marginBottom: '24px' }}>
              Because Pathfinder is a free guidance tool provided on an &ldquo;as-is&rdquo; basis, we
              cannot accept liability for decisions made purely on the basis of the information shown
              here. You are responsible for verifying anything that affects your application. Nothing
              in these terms limits rights you have under UK consumer law.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Termination</h2>
            <p style={{ marginBottom: '24px' }}>
              You can stop using Pathfinder at any time. We may suspend or close accounts that misuse
              the platform, break these terms, or put other users at risk. Where possible we will tell
              you why first.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Governing law</h2>
            <p style={{ marginBottom: '24px' }}>
              These terms are governed by the laws of Scotland, and any disputes fall under the
              jurisdiction of the Scottish courts.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Contact</h2>
            <p style={{ marginBottom: '0' }}>
              Questions about these terms? Send us a message via our{' '}
              <Link href="/contact" style={{ color: 'var(--pf-blue-500)' }}>
                contact form
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
