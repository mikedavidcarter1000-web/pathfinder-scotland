import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Pathfinder Scotland collects, uses and protects your personal data. Your rights under UK GDPR.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <main style={{ backgroundColor: 'var(--pf-teal-50)' }}>
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
            <span style={{ color: 'var(--pf-grey-900)' }}>Privacy Policy</span>
          </nav>
          <h1 style={{ marginBottom: '8px' }}>Privacy Policy</h1>
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
            <p style={{ marginBottom: '24px', fontSize: '1rem' }}>
              Pathfinder Scotland is a free platform that helps Scottish secondary school students plan
              their subject choices and university applications. Your privacy matters to us. This page
              explains — in plain English — what we collect, why we collect it, and what rights you have.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>What we collect</h2>
            <p style={{ marginBottom: '16px' }}>
              We only collect the data you give us directly:
            </p>
            <ul style={{ marginBottom: '24px', paddingLeft: '24px', listStyleType: 'disc' }}>
              <li style={{ marginBottom: '8px' }}>Your name and email address</li>
              <li style={{ marginBottom: '8px' }}>Your school stage (S3, S4, S5, S6 or college)</li>
              <li style={{ marginBottom: '8px' }}>
                Your home postcode (used solely for a SIMD lookup — see below)
              </li>
              <li style={{ marginBottom: '8px' }}>
                Your SQA grades and predicted grades, if you choose to enter them
              </li>
              <li style={{ marginBottom: '8px' }}>
                Widening access criteria you tell us about (e.g. care experience, first-generation status)
              </li>
              <li style={{ marginBottom: '8px' }}>Courses and subjects you save to your account</li>
            </ul>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Why we collect it</h2>
            <p style={{ marginBottom: '16px' }}>
              Every piece of data has a clear purpose:
            </p>
            <ul style={{ marginBottom: '24px', paddingLeft: '24px', listStyleType: 'disc' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>Personalised guidance:</strong> matching subject and pathway suggestions to your stage and interests
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Eligibility matching:</strong> checking your grades against course entry requirements
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Widening access identification:</strong> surfacing programmes you may qualify for through SIMD, care experience, or first-generation status
              </li>
            </ul>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>How we use your postcode</h2>
            <div
              style={{
                backgroundColor: 'var(--pf-teal-100)',
                borderLeft: '3px solid var(--pf-teal-700)',
                padding: '16px 20px',
                borderRadius: '8px',
                marginBottom: '24px',
              }}
            >
              <p style={{ color: 'var(--pf-teal-900)' }}>
                We use your postcode <strong>only</strong> to look up your SIMD decile (Scottish Index of
                Multiple Deprivation) so we can tell you whether you qualify for widening access
                programmes. We do not store location history, do not track your whereabouts, and do not
                share your postcode with anyone.
              </p>
            </div>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>How we store your data</h2>
            <p style={{ marginBottom: '24px' }}>
              Your data is stored on Supabase infrastructure hosted in the European Union and encrypted
              at rest. Access is restricted to authenticated requests tied to your account.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Who we share your data with</h2>
            <p style={{ marginBottom: '24px' }}>
              <strong>Nobody.</strong> We do not sell personal data. We do not share it with advertisers,
              data brokers, or third-party marketing platforms. Payment details for subscriptions are
              handled directly by Stripe — we never see or store card numbers.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Cookies</h2>
            <p style={{ marginBottom: '24px' }}>
              We use a small number of cookies solely to keep you signed in. We do not use tracking
              cookies, advertising cookies, or cross-site analytics cookies.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Analytics</h2>
            <p style={{ marginBottom: '24px' }}>
              We do not currently use any analytics tracking. If that ever changes, we will update this
              page and notify users before enabling it.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Your rights under UK GDPR</h2>
            <p style={{ marginBottom: '16px' }}>You have the right to:</p>
            <ul style={{ marginBottom: '24px', paddingLeft: '24px', listStyleType: 'disc' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>Access</strong> the personal data we hold about you
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Rectify</strong> any information that is incorrect
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Erase</strong> your account and all associated data
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Port</strong> your data — export everything we hold in a machine-readable format
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Object</strong> to any processing you are uncomfortable with
              </li>
            </ul>
            <p style={{ marginBottom: '24px' }}>
              You can exercise these rights any time from your{' '}
              <Link href="/dashboard/settings" style={{ color: 'var(--pf-teal-500)' }}>
                account settings
              </Link>
              , which includes both a data export tool and an account deletion option.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Data retention</h2>
            <p style={{ marginBottom: '24px' }}>
              We keep your data for as long as your account is active. When you delete your account, all
              associated personal data is removed from our live database. Anonymised audit logs may be
              retained for a short period for security purposes, then deleted automatically.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Children&apos;s data</h2>
            <p style={{ marginBottom: '24px' }}>
              Pathfinder is designed for users aged 13 and over. In line with UK GDPR and the ICO&apos;s
              Age Appropriate Design Code, users under 16 should have parental or guardian consent before
              creating an account. We collect the minimum data needed to provide guidance and apply
              age-appropriate defaults to privacy settings.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Contact</h2>
            <p style={{ marginBottom: '24px' }}>
              Questions about privacy or your data? Email us at{' '}
              <a
                href="mailto:hello@pathfinderscotland.co.uk"
                style={{ color: 'var(--pf-teal-500)' }}
              >
                hello@pathfinderscotland.co.uk
              </a>
              .
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Changes to this policy</h2>
            <p style={{ marginBottom: '0' }}>
              If we update this policy, we will change the date at the top of this page and notify
              signed-in users before any material change takes effect.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
