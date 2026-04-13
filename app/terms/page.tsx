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
            <p style={{ marginBottom: '24px' }}>
              These terms explain what you can expect from Pathfinder Scotland, and what we ask of
              you in return. By creating an account or using the site, you agree to them. We have
              tried to keep them short and plain — if anything is unclear, email us at{' '}
              <a href="mailto:hello@pathfinderscot.co.uk" style={{ color: 'var(--pf-blue-500)' }}>
                hello@pathfinderscot.co.uk
              </a>
              .
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>What Pathfinder is</h2>
            <p style={{ marginBottom: '24px' }}>
              Pathfinder Scotland is an <strong>educational guidance platform</strong> for Scottish
              students. It helps you explore Qualifications Scotland subjects, plan your S3 to S6 pathway, and check your
              eligibility against Scottish university entry requirements. It is{' '}
              <strong>not</strong> a substitute for professional careers advice, your school&apos;s
              guidance team, or an official offer from a university.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Important disclaimer</h2>
            <div
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                borderLeft: '3px solid var(--pf-amber-500)',
                padding: '16px 20px',
                borderRadius: '8px',
                marginBottom: '16px',
              }}
            >
              <p style={{ color: 'var(--pf-grey-900)' }}>
                Course information, entry requirements, and widening access criteria are provided{' '}
                <strong>for guidance only</strong>. We aggregate publicly available data from
                universities, Qualifications Scotland, UCAS, and the Scottish Government. Entry
                requirements change, and only the university itself can make a binding offer. Always
                confirm the current requirements directly with the university before applying.
              </p>
            </div>
            <p style={{ marginBottom: '24px' }}>
              Pathfinder is not a regulated careers service. Nothing on the site should be treated as
              professional, financial, or legal advice.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Who can use Pathfinder</h2>
            <p style={{ marginBottom: '16px' }}>
              You can use Pathfinder if you are <strong>aged 13 or over</strong>. If you are under
              16, you should have your parent or guardian&apos;s consent before creating an account,
              in line with UK GDPR and the ICO&apos;s Age Appropriate Design Code.
            </p>
            <p style={{ marginBottom: '24px' }}>
              Pathfinder is designed around the Scottish education system. You are welcome to use it
              from anywhere, but the guidance it gives is specific to Scotland.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Your account</h2>
            <p style={{ marginBottom: '16px' }}>When you sign up, you agree to:</p>
            <ul style={{ marginBottom: '16px', paddingLeft: '24px', listStyleType: 'disc' }}>
              <li style={{ marginBottom: '8px' }}>
                Give us <strong>accurate information</strong> about your stage, school, and grades —
                the guidance only works if the inputs are honest.
              </li>
              <li style={{ marginBottom: '8px' }}>
                Keep <strong>one account per person</strong>. Do not create duplicates or impersonate
                anyone else.
              </li>
              <li style={{ marginBottom: '8px' }}>
                Keep your login details secure and not share them with anyone.
              </li>
            </ul>
            <p style={{ marginBottom: '24px' }}>
              If you think someone else has accessed your account, change your password and contact
              us. You can delete your account at any time from your settings page.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Acceptable use</h2>
            <p style={{ marginBottom: '16px' }}>Please do not:</p>
            <ul style={{ marginBottom: '24px', paddingLeft: '24px', listStyleType: 'disc' }}>
              <li style={{ marginBottom: '8px' }}>Scrape, crawl, or bulk-download the platform.</li>
              <li style={{ marginBottom: '8px' }}>
                Share your account credentials with anyone else.
              </li>
              <li style={{ marginBottom: '8px' }}>
                Use Pathfinder to harass other users or impersonate anyone.
              </li>
              <li style={{ marginBottom: '8px' }}>
                Attempt to bypass security, authentication, or access controls.
              </li>
              <li style={{ marginBottom: '8px' }}>
                Republish Pathfinder&apos;s data as your own product or service.
              </li>
            </ul>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Subscriptions and payments</h2>
            <p style={{ marginBottom: '16px' }}>
              Most of Pathfinder is free to use. Some features sit behind a paid subscription (see
              our{' '}
              <Link href="/pricing" style={{ color: 'var(--pf-blue-500)' }}>
                pricing page
              </Link>
              ). If you subscribe:
            </p>
            <ul style={{ marginBottom: '16px', paddingLeft: '24px', listStyleType: 'disc' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>Payments are handled by Stripe.</strong> We never see or store your card
                details.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Billing is recurring</strong> (monthly or annual, depending on the plan you
                choose) until you cancel.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>You can cancel at any time</strong> from your account settings. Your
                subscription stays active until the end of the period you have already paid for, and
                renewal is then stopped.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Refunds:</strong> UK consumer law gives you a 14-day right to cancel a new
                subscription for a refund, unless you have already used the paid features within that
                period. After 14 days, we do not offer refunds for partial periods, but you keep
                access until the end of the one you have paid for.
              </li>
            </ul>
            <p style={{ marginBottom: '16px' }}>
              <strong>Promo codes</strong> are subject to these rules:
            </p>
            <ul style={{ marginBottom: '24px', paddingLeft: '24px', listStyleType: 'disc' }}>
              <li style={{ marginBottom: '8px' }}>
                They apply only to the specific plan and period advertised.
              </li>
              <li style={{ marginBottom: '8px' }}>
                They have no cash value and cannot be transferred or resold.
              </li>
              <li style={{ marginBottom: '8px' }}>
                We may withdraw or expire a code at any time. Codes already redeemed are honoured for
                the term shown at checkout.
              </li>
            </ul>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Intellectual property</h2>
            <p style={{ marginBottom: '16px' }}>
              The <strong>Pathfinder Scotland</strong> name, logo, branding, platform code, design
              system, and original written content belong to us. Course and subject information is
              sourced from publicly available data published by Qualifications Scotland, UCAS,
              Scottish universities and colleges, and the Scottish Government — we curate and
              present it, but we do not claim ownership of the underlying facts.
            </p>
            <p style={{ marginBottom: '24px' }}>
              <strong>The data you enter about yourself belongs to you.</strong> You can export it or
              delete it at any time. Using Pathfinder does not give us any ownership of your personal
              information — we hold it only to provide you with the service, as described in our{' '}
              <Link href="/privacy" style={{ color: 'var(--pf-blue-500)' }}>
                Privacy Policy
              </Link>
              .
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Limitation of liability</h2>
            <p style={{ marginBottom: '24px' }}>
              Pathfinder is provided on an &ldquo;as-is&rdquo; basis. To the extent permitted by law,
              we are not liable for decisions made purely on the basis of information shown on the
              platform — you are responsible for verifying anything that affects your application.
              Our total liability to you in any 12-month period will not exceed the fees you have
              paid to us during that period (if any). Nothing in these terms limits rights you have
              under UK consumer law, or our liability for death, personal injury, fraud, or anything
              else that cannot be limited by law.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Termination</h2>
            <p style={{ marginBottom: '24px' }}>
              You can stop using Pathfinder at any time by deleting your account. We may suspend or
              close accounts that misuse the platform, break these terms, or put other users at risk.
              Where possible we will tell you why first. If we close a paid account for misuse, we
              will not refund the remaining period.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Changes to these terms</h2>
            <p style={{ marginBottom: '24px' }}>
              If we update these terms in a material way, we will update the date at the top of this
              page and notify signed-in users before the changes take effect. Continuing to use the
              platform after that means you accept the new terms.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Governing law</h2>
            <p style={{ marginBottom: '24px' }}>
              These terms are governed by the laws of Scotland, and any disputes fall under the
              exclusive jurisdiction of the Scottish courts.
            </p>

            <h2 style={{ marginTop: '40px', marginBottom: '12px' }}>Contact</h2>
            <p style={{ marginBottom: '0' }}>
              Questions about these terms? Email{' '}
              <a href="mailto:hello@pathfinderscot.co.uk" style={{ color: 'var(--pf-blue-500)' }}>
                hello@pathfinderscot.co.uk
              </a>{' '}
              or send us a message via our{' '}
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
