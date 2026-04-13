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
            <span style={{ color: 'var(--pf-grey-900)' }}>Privacy Policy</span>
          </nav>
          <h1 style={{ marginBottom: '8px' }}>Privacy Policy</h1>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
            Last updated: 13 April 2026
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
              Pathfinder Scotland is a platform that helps Scottish secondary school students plan
              their subject choices and university applications. Your privacy matters to us. This page
              explains — in plain English — what we collect, why we collect it, who we share it with,
              and what rights you have under UK data protection law.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Who we are</h2>
            <p style={{ marginBottom: '16px' }}>
              Pathfinder Scotland is the <strong>data controller</strong> for the personal information
              collected through this website. That means we decide what data is collected and how it
              is used.
            </p>
            <p style={{ marginBottom: '24px' }}>
              If you have a privacy question, want to exercise your rights, or need to report a
              concern, email us at{' '}
              <a href="mailto:privacy@pathfinderscot.co.uk" style={{ color: 'var(--pf-blue-500)' }}>
                privacy@pathfinderscot.co.uk
              </a>
              .
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>What personal data we collect</h2>
            <p style={{ marginBottom: '16px' }}>
              We only collect data you give us directly. We group it into four categories:
            </p>
            <ul style={{ marginBottom: '24px', paddingLeft: '24px', listStyleType: 'disc' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>Account data:</strong> your name, email address, password (stored hashed),
                and your school stage (S3, S4, S5, S6 or college).
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Educational data:</strong> your school, Qualifications Scotland grades, predicted grades, subject
                choices, and any courses or universities you save to your account.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>SIMD and postcode data:</strong> your home postcode, which we match against
                the Scottish Index of Multiple Deprivation to identify widening access eligibility.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Sensitive demographic data (optional):</strong> information such as household
                income, disability, care experience, young carer status, estrangement from family, or
                refugee/asylum status. This is{' '}
                <strong>special category data under Article 9 of UK GDPR</strong> and we only collect
                it with your explicit consent to help surface widening access routes you may qualify
                for.
              </li>
            </ul>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Legal basis for processing</h2>
            <p style={{ marginBottom: '16px' }}>
              We must have a lawful basis for every piece of personal data we process. Ours are:
            </p>
            <ul style={{ marginBottom: '24px', paddingLeft: '24px', listStyleType: 'disc' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>Legitimate interests</strong> — for the core service: running your account,
                matching your grades against courses, and providing pathway guidance.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Contract</strong> — for paid features: delivering any subscription you
                purchase and keeping records of that transaction.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Explicit consent</strong> — for sensitive demographic data (UK GDPR
                Article 9). You do not have to share this, and you can withdraw consent at any time
                from your settings.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Legal obligation</strong> — for record-keeping required by HMRC, fraud
                prevention, or safeguarding.
              </li>
            </ul>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Why we use your data</h2>
            <ul style={{ marginBottom: '24px', paddingLeft: '24px', listStyleType: 'disc' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>Personalised guidance:</strong> matching subject and pathway suggestions to
                your stage, grades, and interests.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Widening access eligibility:</strong> surfacing programmes you may qualify
                for through SIMD, care experience, first-generation, or other routes.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Course recommendations:</strong> checking your grades against real Scottish
                university entry requirements.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Service operation:</strong> keeping you signed in, sending essential
                transactional emails, and handling any subscription payments you make.
              </li>
            </ul>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>How we use your postcode</h2>
            <div
              style={{
                backgroundColor: 'var(--pf-blue-100)',
                borderLeft: '3px solid var(--pf-blue-700)',
                padding: '16px 20px',
                borderRadius: '8px',
                marginBottom: '24px',
              }}
            >
              <p style={{ color: 'var(--pf-blue-900)' }}>
                We use your postcode <strong>only</strong> to look up your SIMD decile (Scottish Index
                of Multiple Deprivation) so we can tell you whether you qualify for widening access
                programmes. We do not store location history, do not track your whereabouts, and do
                not share your postcode with anyone.
              </p>
            </div>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Third-party processors</h2>
            <p style={{ marginBottom: '16px' }}>
              We use a small number of trusted third parties to run the service. Each one only sees
              the data it needs to do its job, and each is bound by a data processing agreement:
            </p>
            <ul style={{ marginBottom: '16px', paddingLeft: '24px', listStyleType: 'disc' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>Supabase</strong> — database and authentication. Hosted in the EU region.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Vercel</strong> — website hosting and delivery.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Stripe</strong> — payment processing. Stripe is an{' '}
                <strong>independent data controller</strong> for the payment details you enter, not a
                processor acting on our behalf. We never see or store your card details. Their own
                privacy notice at{' '}
                <a
                  href="https://stripe.com/gb/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--pf-blue-500)' }}
                >
                  stripe.com/gb/privacy
                </a>{' '}
                applies to that data.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Resend</strong> — transactional email (account verification, password resets,
                receipts). Your email address is shared only when we need to send you something.
              </li>
            </ul>
            <p style={{ marginBottom: '24px' }}>
              We do not sell personal data, and we do not share it with advertisers, data brokers, or
              marketing platforms.
            </p>

            <h2 id="cookies" style={{ marginTop: '40px', marginBottom: '12px', scrollMarginTop: '96px' }}>Cookies</h2>
            <p style={{ marginBottom: '24px' }}>
              We use essential cookies only — enough to keep you signed in and to remember your
              cookie-consent choice. We do not use tracking cookies, advertising cookies, or
              cross-site analytics cookies.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Data retention</h2>
            <p style={{ marginBottom: '24px' }}>
              We keep your account data for as long as your account is active. When you delete your
              account, all associated personal data is removed from our live database. Anonymised
              audit logs and aggregate analytics (which cannot identify you) may be retained for
              service improvement and security monitoring, then deleted automatically.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Your rights under UK GDPR</h2>
            <p style={{ marginBottom: '16px' }}>You have the right to:</p>
            <ul style={{ marginBottom: '24px', paddingLeft: '24px', listStyleType: 'disc' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>Access</strong> the personal data we hold about you.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Rectify</strong> any information that is incorrect.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Erase</strong> your account and all associated data.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Port</strong> your data — export everything we hold in a machine-readable
                format.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Object</strong> to any processing you are uncomfortable with.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Withdraw consent</strong> at any time for anything we process on the basis of
                consent (such as sensitive demographic data).
              </li>
            </ul>
            <p style={{ marginBottom: '24px' }}>
              You can exercise most of these rights in one click from your{' '}
              <Link href="/dashboard/settings" style={{ color: 'var(--pf-blue-500)' }}>
                account settings
              </Link>
              , which includes an automated <strong>data export</strong> tool and an automated{' '}
              <strong>account deletion</strong> option. For anything you can&apos;t do there, email{' '}
              <a href="mailto:privacy@pathfinderscot.co.uk" style={{ color: 'var(--pf-blue-500)' }}>
                privacy@pathfinderscot.co.uk
              </a>{' '}
              and we will respond within 30 days.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Children&apos;s data</h2>
            <p style={{ marginBottom: '16px' }}>
              Pathfinder is designed for Scottish students aged 13 and over. We ask for the minimum
              data needed to give useful guidance, and we apply age-appropriate privacy defaults in
              line with the ICO&apos;s Age Appropriate Design Code.
            </p>
            <p style={{ marginBottom: '24px' }}>
              If you are under 16, you should have your parent or guardian&apos;s consent before
              creating an account. Parents and guardians can contact us at any time to review or
              delete a child&apos;s data.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Regulatory framework</h2>
            <p style={{ marginBottom: '24px' }}>
              This policy is written to comply with the <strong>UK General Data Protection
              Regulation (UK GDPR)</strong> and the <strong>Data Protection Act 2018</strong>, which
              together set the rules for handling personal data in Scotland and the rest of the UK.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Complaints and the ICO</h2>
            <p style={{ marginBottom: '16px' }}>
              If you are unhappy with how we have handled your data, please email us first at{' '}
              <a href="mailto:privacy@pathfinderscot.co.uk" style={{ color: 'var(--pf-blue-500)' }}>
                privacy@pathfinderscot.co.uk
              </a>{' '}
              so we can try to put things right.
            </p>
            <p style={{ marginBottom: '16px' }}>
              You also have the right to complain directly to our supervisory authority, the{' '}
              <strong>Information Commissioner&apos;s Office (ICO)</strong>:
            </p>
            <ul style={{ marginBottom: '24px', paddingLeft: '24px', listStyleType: 'disc' }}>
              <li style={{ marginBottom: '8px' }}>
                Website:{' '}
                <a
                  href="https://ico.org.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--pf-blue-500)' }}
                >
                  ico.org.uk
                </a>
              </li>
              <li style={{ marginBottom: '8px' }}>Helpline: 0303 123 1113</li>
              <li style={{ marginBottom: '8px' }}>
                Post: Information Commissioner&apos;s Office, Wycliffe House, Water Lane, Wilmslow,
                Cheshire, SK9 5AF
              </li>
            </ul>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Changes to this policy</h2>
            <p style={{ marginBottom: '0' }}>
              If we update this policy, we will change the date at the top of this page and notify
              signed-in users before any material change takes effect.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
