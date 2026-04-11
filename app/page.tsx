import Link from 'next/link'
import { FaqAccordion, type FaqItem } from '@/components/ui/faq-accordion'

const faqItems: FaqItem[] = [
  {
    question: 'Is Pathfinder free?',
    answer:
      'Yes — the core features are completely free. You can explore subjects, plan your choices, check university entry requirements, and see if you qualify for widening access support at no cost.',
  },
  {
    question: "How does Pathfinder know which courses I'm eligible for?",
    answer:
      "You enter your current or predicted grades, and we compare them against the entry requirements for courses across all 15 Scottish universities. If you're from a widening participation background, we automatically show you any reduced entry offers you might qualify for.",
  },
  {
    question: 'What is widening access?',
    answer:
      'Scottish universities offer lower entry grades to students from certain backgrounds — for example, if you live in a disadvantaged area (SIMD20/40), have care experience, are a young carer, or are the first in your family to go to university. Pathfinder checks your eligibility automatically based on your postcode and profile.',
  },
  {
    question: "Can I use Pathfinder if I don't know what I want to study at university?",
    answer:
      "Absolutely. Our subject explorer and pathway planner help you see where different subject choices lead — which careers they connect to and which university courses they open up. You don't need to have decided anything yet.",
  },
  {
    question: 'Is my data safe?',
    answer:
      'Yes. We store your data securely and never share it with anyone. You can download or delete all your data at any time from your account settings. Read our privacy policy for full details.',
  },
  {
    question: 'Which schools does Pathfinder work with?',
    answer:
      'Pathfinder works for students at any Scottish secondary school. Our subject database covers every SQA qualification available across Scotland, from National 4 to Advanced Higher, including college partnership courses and Foundation Apprenticeships.',
  },
  {
    question: "Do I need my school's permission to use Pathfinder?",
    answer:
      'No. Pathfinder is designed for individual students and families. You can sign up and use it independently.',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}

export default function HomePage() {
  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: 'Plan Your Subjects',
      description:
        'See how your S3 choices connect to Highers, Advanced Highers, and university entry. Our pathway planner shows you the full picture.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Check Eligibility',
      description:
        'Enter your grades and instantly see which courses you qualify for. We factor in widening access schemes automatically.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: 'Build Your Shortlist',
      description:
        'Save courses, compare options, and build your UCAS shortlist with confidence.',
    },
  ]

  const unis = [
    'Edinburgh', 'Glasgow', 'St Andrews', 'Aberdeen', 'Dundee',
    'Strathclyde', 'Heriot-Watt', 'Stirling', 'GCU', 'Napier',
    'RGU', 'UWS', 'QMU', 'UHI', 'RCS',
  ]

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Section -- teal-50 */}
      <section
        style={{
          backgroundColor: 'var(--pf-teal-50)',
          paddingTop: '64px',
          paddingBottom: '64px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="pf-container relative" style={{ zIndex: 1 }}>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <div>
              <span
                className="pf-badge-teal mb-4 inline-flex"
                style={{ marginBottom: '20px' }}
              >
                Built for Scottish students
              </span>
              <h1
                style={{
                  fontSize: 'clamp(2rem, 5vw, 3rem)',
                  lineHeight: 1.1,
                  marginBottom: '20px',
                  color: 'var(--pf-grey-900)',
                }}
              >
                Find your path to Scottish universities.
              </h1>
              <p
                style={{
                  fontSize: '1.125rem',
                  color: 'var(--pf-grey-600)',
                  lineHeight: 1.6,
                  marginBottom: '32px',
                  maxWidth: '520px',
                }}
              >
                Clear, free guidance for Scottish students and their families — from S3 subject
                choices through to university offers.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/pathways" className="pf-btn-primary">
                  Start planning free
                </Link>
                <Link href="/subjects" className="pf-btn-secondary">
                  Explore subjects
                </Link>
              </div>

              {/* Trust bar */}
              <div
                className="flex flex-wrap items-center gap-x-6 gap-y-2"
                style={{ marginTop: '32px' }}
              >
                <TrustItem label="15 Scottish universities" />
                <TrustItem label="100+ courses" />
                <TrustItem label="Widening access built in" />
              </div>
            </div>

            {/* Pathway illustration */}
            <div className="hidden lg:flex items-center justify-center">
              <PathwayIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* How Pathfinder helps -- white */}
      <section className="pf-section pf-section-white">
        <div className="pf-container">
          <div className="text-center" style={{ marginBottom: '48px' }}>
            <h2 style={{ marginBottom: '12px', fontSize: '2rem' }}>
              How Pathfinder helps
            </h2>
            <p
              style={{
                color: 'var(--pf-grey-600)',
                fontSize: '1.0625rem',
                maxWidth: '560px',
                margin: '0 auto',
              }}
            >
              From discovering courses to checking entry requirements, Pathfinder guides you every step of the way.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="pf-card">
                <div
                  className="flex items-center justify-center mb-4"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--pf-teal-100)',
                    color: 'var(--pf-teal-700)',
                  }}
                >
                  {feature.icon}
                </div>
                <h3 style={{ marginBottom: '8px' }}>{feature.title}</h3>
                <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Widening Access Section -- dark teal-900 */}
      <section
        className="pf-section"
        style={{ backgroundColor: 'var(--pf-teal-900)' }}
      >
        <div className="pf-container">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span
                className="pf-badge inline-flex mb-4"
                style={{
                  marginBottom: '16px',
                  backgroundColor: 'rgba(245, 158, 11, 0.18)',
                  color: 'var(--pf-amber-500)',
                }}
              >
                Widening Access
              </span>
              <h2
                style={{
                  marginBottom: '16px',
                  color: '#fff',
                  fontSize: '2rem',
                }}
              >
                Lower entry requirements could be available to you.
              </h2>
              <p
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '1.0625rem',
                  marginBottom: '24px',
                  lineHeight: 1.6,
                }}
              >
                If you live in an SIMD20 or SIMD40 area, have care experience, are a young carer, or
                are the first in your family to attend university, you may qualify for reduced entry
                requirements at many Scottish universities.
              </p>
              <ul className="space-y-3" style={{ marginBottom: '28px' }}>
                {[
                  'Automatic SIMD lookup from your postcode',
                  'See adjusted offers based on your circumstances',
                  'Learn about access programmes like SWAP and REACH',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="flex-shrink-0"
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        color: '#fff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '2px',
                      }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.9)' }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/widening-access"
                className="inline-flex items-center gap-2 no-underline hover:no-underline"
                style={{
                  backgroundColor: '#fff',
                  color: 'var(--pf-teal-900)',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                }}
              >
                Check your eligibility
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                padding: '28px',
              }}
            >
              <div style={{ marginBottom: '20px' }}>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Example
                </span>
                <h3
                  style={{
                    color: '#fff',
                    marginTop: '6px',
                    marginBottom: 0,
                  }}
                >
                  Computer Science at Edinburgh
                </h3>
              </div>
              <div className="space-y-3">
                <DarkOfferRow label="Standard offer" value="AAAA" />
                <DarkOfferRow label="SIMD40 offer" value="AAAB" highlight />
                <DarkOfferRow label="SIMD20 offer" value="AABB" highlight />
                <DarkOfferRow label="Care experienced" value="AABB" highlight last />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Universities Section -- white */}
      <section className="pf-section pf-section-white">
        <div className="pf-container">
          <div className="text-center" style={{ marginBottom: '40px' }}>
            <h2 style={{ marginBottom: '12px', fontSize: '2rem' }}>All 15 Scottish universities</h2>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem' }}>
              From ancient institutions to modern universities, explore them all.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {unis.map((uni) => (
              <Link
                key={uni}
                href="/universities"
                className="pf-card-hover flex flex-col items-center justify-center gap-3 text-center no-underline hover:no-underline"
                style={{ padding: '20px' }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--pf-teal-100)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: '1.25rem',
                      color: 'var(--pf-teal-700)',
                    }}
                  >
                    {uni.charAt(0)}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'var(--pf-grey-900)',
                  }}
                >
                  {uni}
                </p>
              </Link>
            ))}
          </div>

          <div className="text-center" style={{ marginTop: '40px' }}>
            <Link href="/universities" className="pf-btn-secondary">
              Explore universities
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Credibility Section -- grey */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container">
          <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '2rem' }}>
              Built for Scottish students, by people who understand the system
            </h2>
            <p
              style={{
                color: 'var(--pf-grey-600)',
                fontSize: '1.0625rem',
                lineHeight: 1.6,
                marginBottom: '40px',
              }}
            >
              There&apos;s a gap between the subjects pupils pick in S2 and the university pathways
              those choices actually open up. Pathfinder closes that gap with clear, honest
              guidance — grounded in the Scottish curriculum and the real entry requirements
              universities publish.
            </p>

            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
              style={{ marginTop: '8px' }}
            >
              <Stat number="81" label="SQA subjects" />
              <Stat number="15" label="Scottish universities" />
              <Stat number="100+" label="Courses" />
              <Stat number="All" label="Scottish postcodes checked" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section -- white */}
      <section className="pf-section pf-section-white">
        <div className="pf-container">
          <div
            style={{
              maxWidth: '760px',
              margin: '0 auto',
            }}
          >
            <div className="text-center" style={{ marginBottom: '40px' }}>
              <span
                className="pf-badge-teal inline-flex"
                style={{ marginBottom: '16px' }}
              >
                FAQ
              </span>
              <h2 style={{ marginBottom: '12px', fontSize: '2rem' }}>
                Frequently asked questions
              </h2>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem' }}>
                Everything you need to know before getting started.
              </p>
            </div>

            <FaqAccordion items={faqItems} />

            <p
              style={{
                textAlign: 'center',
                marginTop: '32px',
                color: 'var(--pf-grey-600)',
                fontSize: '0.9375rem',
              }}
            >
              Still have questions?{' '}
              <Link
                href="/help"
                style={{
                  color: 'var(--pf-teal-500)',
                  fontWeight: 600,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Visit the help centre
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA -- dark teal */}
      <section
        className="pf-section"
        style={{ backgroundColor: 'var(--pf-teal-900)' }}
      >
        <div className="pf-container text-center">
          <h2 style={{ color: '#fff', marginBottom: '16px', fontSize: '2rem' }}>
            Ready to find your path?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', marginBottom: '32px' }}>
            Create your free account and start planning in minutes.
          </p>
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 no-underline hover:no-underline"
            style={{
              backgroundColor: '#fff',
              color: 'var(--pf-teal-900)',
              padding: '14px 28px',
              borderRadius: '8px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            Get started for free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}

/* -------------------------------------------------------------- */

function TrustItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <svg
        className="w-4 h-4"
        style={{ color: 'var(--pf-green-500)' }}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <span style={{ fontSize: '0.875rem', color: 'var(--pf-grey-900)', fontWeight: 500 }}>
        {label}
      </span>
    </div>
  )
}

function DarkOfferRow({
  label,
  value,
  highlight,
  last,
}: {
  label: string
  value: string
  highlight?: boolean
  last?: boolean
}) {
  return (
    <div
      className="flex justify-between items-center"
      style={{
        paddingBottom: last ? 0 : '12px',
        borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9375rem' }}>{label}</span>
      <span
        className="pf-data-number"
        style={{
          fontSize: '1rem',
          color: highlight ? 'var(--pf-green-500)' : '#fff',
          fontWeight: 600,
        }}
      >
        {value}
      </span>
    </div>
  )
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div
        className="pf-data-number"
        style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--pf-teal-700)',
          lineHeight: 1.1,
          marginBottom: '6px',
        }}
      >
        {number}
      </div>
      <div
        style={{
          fontSize: '0.875rem',
          color: 'var(--pf-grey-600)',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </div>
  )
}

function PathwayIllustration() {
  return (
    <svg
      viewBox="0 0 440 400"
      width="100%"
      style={{ maxWidth: '440px', height: 'auto' }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pf-line" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#14907E" />
          <stop offset="100%" stopColor="#0F6B5E" />
        </linearGradient>
      </defs>

      {/* Background shape */}
      <circle cx="220" cy="200" r="180" fill="#E6F5F2" opacity="0.5" />
      <circle cx="220" cy="200" r="130" fill="#E6F5F2" opacity="0.6" />

      {/* Connecting lines (pathways) */}
      <path d="M 60 200 Q 140 80, 220 200 T 380 200" stroke="url(#pf-line)" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M 60 200 Q 140 320, 220 200 T 380 200" stroke="url(#pf-line)" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M 60 200 L 220 200 L 380 200" stroke="#14907E" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" strokeDasharray="4 6" />

      {/* Nodes -- S2 -> S6 -> University */}
      <g>
        {/* Start (S2) */}
        <circle cx="60" cy="200" r="22" fill="#0F6B5E" />
        <circle cx="60" cy="200" r="26" fill="none" stroke="#0F6B5E" strokeWidth="2" opacity="0.25" />
        <text x="60" y="205" textAnchor="middle" fill="#fff" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="13">
          S2
        </text>

        {/* Middle (S4) */}
        <circle cx="220" cy="80" r="18" fill="#14907E" />
        <text x="220" y="85" textAnchor="middle" fill="#fff" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="11">
          S4
        </text>

        <circle cx="220" cy="200" r="22" fill="#14907E" />
        <text x="220" y="205" textAnchor="middle" fill="#fff" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="13">
          S5
        </text>

        <circle cx="220" cy="320" r="18" fill="#14907E" />
        <text x="220" y="325" textAnchor="middle" fill="#fff" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="11">
          S6
        </text>

        {/* End (University) */}
        <circle cx="380" cy="200" r="28" fill="#0C4A42" />
        <circle cx="380" cy="200" r="34" fill="none" stroke="#0C4A42" strokeWidth="2" opacity="0.25" />
        <g transform="translate(380 200)">
          <path
            d="M -12 4 L 0 -4 L 12 4 L 12 10 L 0 14 L -12 10 Z"
            fill="#fff"
          />
          <path d="M -12 4 L 12 4" stroke="#fff" strokeWidth="1" />
        </g>
      </g>

      {/* Subject dots floating */}
      <g opacity="0.7">
        <circle cx="130" cy="140" r="6" fill="#3B82F6" />
        <circle cx="150" cy="270" r="6" fill="#10B981" />
        <circle cx="300" cy="135" r="6" fill="#6366F1" />
        <circle cx="310" cy="265" r="6" fill="#F59E0B" />
      </g>
    </svg>
  )
}
