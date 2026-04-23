import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Privacy -- What You Need to Know',
  description:
    'A plain-language guide for young people explaining what Pathfinder Scotland collects, who can see it, and how to delete your account.',
  alternates: { canonical: '/privacy/young-persons' },
}

const sections = [
  {
    heading: 'What we collect',
    items: [
      'Your name and email address',
      'Your school year (for example, S3 or S5)',
      'Your postcode -- but only if you choose to add it',
      'The subjects, courses and careers you save on Pathfinder',
    ],
  },
  {
    heading: 'What we do NOT collect',
    items: [
      'Where you are right now',
      'What you look at on other websites',
      'Anything from your social media',
    ],
  },
  {
    heading: 'Who can see your information',
    items: [
      'Only you can see your account by default',
      'If you invite a parent or carer, they can see your saved courses and grades',
      'If you link your account to your school, your guidance teacher can see your subject choices',
      'You are in control -- you choose who to invite',
    ],
  },
  {
    heading: 'Sensitive information',
    items: [
      'You can choose to tell us things like whether you are care-experienced or have a disability',
      'This is completely optional -- you never have to share it',
      'Your school and your parents cannot see this. Only you can.',
    ],
  },
  {
    heading: 'How to delete your account',
    items: [
      'Go to Settings in your account and click "Delete my account"',
      'Or email us at privacy@pathfinderscot.co.uk',
      'We will delete all your information within 30 days',
    ],
  },
  {
    heading: 'Questions?',
    items: [
      'Email us at privacy@pathfinderscot.co.uk -- we will always reply',
      'Or talk to a trusted adult, like a parent, carer, or teacher',
    ],
  },
]

export default function YoungPersonsPrivacyPage() {
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
            <Link href="/" style={{ color: 'var(--pf-grey-600)' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link href="/privacy" style={{ color: 'var(--pf-grey-600)' }}>Privacy Policy</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--pf-grey-900)' }}>Young Person&apos;s Summary</span>
          </nav>
          <h1 style={{ marginBottom: '8px' }}>Your privacy -- what you need to know</h1>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
            A short, plain-English guide for students using Pathfinder Scotland.
          </p>
        </div>
      </section>

      {/* Body */}
      <section style={{ paddingTop: '48px', paddingBottom: '80px' }}>
        <div className="pf-container" style={{ maxWidth: '760px' }}>

          {/* Intro callout */}
          <div
            style={{
              backgroundColor: 'var(--pf-blue-100)',
              borderLeft: '3px solid var(--pf-blue-700)',
              padding: '16px 20px',
              borderRadius: '8px',
              marginBottom: '32px',
              lineHeight: 1.6,
              color: 'var(--pf-blue-900)',
            }}
          >
            <strong>We keep your information safe.</strong> We only collect what we need to help you
            with your school and university choices. We never sell your data.
          </div>

          {/* Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sections.map((section) => (
              <div
                key={section.heading}
                className="pf-card"
                style={{ padding: '24px 28px' }}
              >
                <h2 style={{ marginBottom: '12px', fontSize: '1.125rem' }}>{section.heading}</h2>
                <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: 1.75 }}>
                  {section.items.map((item) => (
                    <li key={item} style={{ marginBottom: '6px', color: 'var(--pf-grey-800)' }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Full policy link */}
          <p style={{ marginTop: '40px', fontSize: '0.9375rem', color: 'var(--pf-grey-600)' }}>
            Want to read the full details?{' '}
            <Link href="/privacy" style={{ color: 'var(--pf-blue-500)' }}>
              Read the full Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  )
}
