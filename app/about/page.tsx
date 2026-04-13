import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Pathfinder Scotland',
  description:
    'Pathfinder Scotland helps every Scottish student make informed subject choices, regardless of background. Built in Scotland, for Scotland.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Pathfinder Scotland',
    description:
      'Pathfinder Scotland helps every Scottish student make informed subject choices, regardless of background. Built in Scotland, for Scotland.',
    url: '/about',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section
        style={{
          backgroundColor: 'var(--pf-blue-50)',
          paddingTop: '72px',
          paddingBottom: '72px',
          borderBottom: '1px solid var(--pf-grey-300)',
        }}
      >
        <div className="pf-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="pf-badge-blue" style={{ marginBottom: '20px' }}>
                About Pathfinder Scotland
              </span>
              <h1 style={{ marginTop: '16px', marginBottom: '16px', lineHeight: 1.15 }}>
                Guidance for every Scottish student — no matter where you start.
              </h1>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '1.125rem',
                  lineHeight: 1.65,
                  marginBottom: '32px',
                }}
              >
                Pathfinder Scotland is a free platform that helps S3 to S6 students turn SQA subject
                choices into a clear plan for university — from the first Nat 5 options right through
                to a UCAS application.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/pathways" className="pf-btn-primary">
                  Plan your choices
                </Link>
                <Link href="/subjects" className="pf-btn-secondary">
                  Explore subjects
                </Link>
              </div>
            </div>

            {/* Decorative SVG — abstract pathway */}
            <div className="hidden md:flex justify-center">
              <svg
                viewBox="0 0 360 300"
                width="100%"
                style={{ maxWidth: '420px' }}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="pf-about-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--pf-blue-100)" />
                    <stop offset="100%" stopColor="var(--pf-blue-50)" />
                  </linearGradient>
                </defs>

                {/* Background card */}
                <rect
                  x="20"
                  y="20"
                  width="320"
                  height="260"
                  rx="16"
                  fill="url(#pf-about-grad)"
                />

                {/* Year dots + line */}
                <g>
                  <line
                    x1="60"
                    y1="210"
                    x2="300"
                    y2="90"
                    stroke="var(--pf-blue-700)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {[
                    { x: 60, y: 210, label: 'S3' },
                    { x: 140, y: 170, label: 'S4' },
                    { x: 220, y: 130, label: 'S5' },
                    { x: 300, y: 90, label: 'S6' },
                  ].map((dot) => (
                    <g key={dot.label}>
                      <circle
                        cx={dot.x}
                        cy={dot.y}
                        r="14"
                        fill="var(--pf-white)"
                        stroke="var(--pf-blue-700)"
                        strokeWidth="3"
                      />
                      <text
                        x={dot.x}
                        y={dot.y + 4}
                        textAnchor="middle"
                        fontFamily="Space Grotesk, sans-serif"
                        fontWeight="600"
                        fontSize="11"
                        fill="var(--pf-blue-900)"
                      >
                        {dot.label}
                      </text>
                    </g>
                  ))}
                </g>

                {/* Subject chips */}
                <g fontFamily="Space Grotesk, sans-serif" fontWeight="500" fontSize="11">
                  <rect x="45" y="55" width="74" height="24" rx="12" fill="var(--pf-white)" />
                  <text x="82" y="71" textAnchor="middle" fill="var(--pf-area-sciences)">
                    Sciences
                  </text>

                  <rect x="135" y="45" width="88" height="24" rx="12" fill="var(--pf-white)" />
                  <text x="179" y="61" textAnchor="middle" fill="var(--pf-area-mathematics)">
                    Mathematics
                  </text>

                  <rect x="235" y="55" width="84" height="24" rx="12" fill="var(--pf-white)" />
                  <text x="277" y="71" textAnchor="middle" fill="var(--pf-area-languages)">
                    Languages
                  </text>
                </g>

                {/* Goal flag */}
                <g>
                  <circle cx="300" cy="90" r="22" fill="var(--pf-blue-700)" opacity="0.15" />
                  <path
                    d="M294 80 L294 100 M294 80 L308 84 L300 88 L308 92"
                    stroke="var(--pf-blue-900)"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '820px' }}>
          <span className="pf-badge-blue">Our mission</span>
          <h2 style={{ marginTop: '16px', marginBottom: '16px' }}>
            Helping every Scottish student make informed subject choices
          </h2>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', marginBottom: '16px' }}>
            Your background should not decide your options. Pathfinder exists to make the same level
            of guidance available to every student in Scotland — whether you have a parent who went to
            university, a school careers team with capacity, or neither.
          </p>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1rem', marginBottom: '12px' }}>
            We work alongside Scotland&rsquo;s official guidance services:
          </p>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            {[
              { label: 'Qualifications Scotland', url: 'https://www.sqa.org.uk' },
              { label: 'Education Scotland', url: 'https://education.gov.scot' },
              { label: 'Skills Development Scotland', url: 'https://www.skillsdevelopmentscotland.co.uk' },
              { label: 'My World of Work', url: 'https://www.myworldofwork.co.uk' },
            ].map((item) => (
              <li key={item.url}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pf-badge-blue inline-flex items-center gap-1 no-underline hover:no-underline"
                  style={{ fontWeight: 500 }}
                >
                  {item.label}
                  <svg
                    width="11"
                    height="11"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.875rem',
              marginTop: '16px',
            }}
          >
            See our full{' '}
            <Link href="/resources" style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}>
              resources directory
            </Link>{' '}
            for the organisations behind Scottish education.
          </p>
        </div>
      </section>

      {/* The guidance gap */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '820px' }}>
          <span className="pf-badge-amber">The gap we fill</span>
          <h2 style={{ marginTop: '16px', marginBottom: '16px' }}>
            Schools collect choices. They rarely explain them.
          </h2>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', marginBottom: '16px' }}>
            Most Scottish secondary schools use online tools to gather S3 and S4 subject choices. The
            tools are fine at collecting a form. They are not designed to explain{' '}
            <em>what those choices mean</em> — which doors open, which close, and which pathways stay
            realistic.
          </p>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem' }}>
            Pathfinder fills that gap. Pick a subject and we will show you the courses it unlocks, the
            universities that accept it, and how it fits alongside your other choices.
          </p>
        </div>
      </section>

      {/* Widening access */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '820px' }}>
          <span className="pf-badge-green">Widening access</span>
          <h2 style={{ marginTop: '16px', marginBottom: '16px' }}>
            You may qualify for extra support — automatically.
          </h2>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', marginBottom: '24px' }}>
            Scottish universities reserve a share of places for students who face additional
            barriers. Pathfinder automatically identifies students who may qualify through:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                title: 'SIMD',
                body: 'If your home postcode is in the 20% most-deprived areas, many universities offer reduced entry requirements.',
              },
              {
                title: 'Care experienced',
                body: 'Guaranteed interviews and adjusted offers at every Scottish university for care-experienced applicants.',
              },
              {
                title: 'First generation',
                body: 'Additional support and contextual offers for students who would be the first in their family to attend university.',
              },
            ].map((item) => (
              <div key={item.title} className="pf-card">
                <h3 style={{ marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '960px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="pf-badge-blue">How it works</span>
            <h2 style={{ marginTop: '16px' }}>Three steps to a clearer path</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                n: '1',
                title: 'Tell us your stage',
                body: 'Let us know which year you are going into — S3, S4, S5 or S6 — and a few basics about you.',
              },
              {
                n: '2',
                title: 'Explore subjects and pathways',
                body: 'Browse SQA subjects, see what they lead to, and build a personalised pathway for the next few years.',
              },
              {
                n: '3',
                title: 'Check university eligibility',
                body: 'Match your grades against thousands of Scottish courses and see where you qualify — including widening access offers.',
              },
            ].map((step) => (
              <div key={step.n} className="pf-card">
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--pf-blue-100)',
                    color: 'var(--pf-blue-700)',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}
                >
                  {step.n}
                </div>
                <h3 style={{ marginBottom: '8px' }}>{step.title}</h3>
                <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Policy alignment */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '960px' }}>
          <span className="pf-badge-blue">Policy alignment</span>
          <h2 style={{ marginTop: '16px', marginBottom: '12px' }}>
            Aligned with Scottish education policy
          </h2>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '1.0625rem',
              marginBottom: '40px',
              maxWidth: '680px',
            }}
          >
            Pathfinder Scotland supports the direction of travel in Scottish education. Our platform
            addresses challenges identified by national reviews and aligns with current policy
            priorities.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Curriculum for Excellence',
                body: "CfE's Broad General Education entitles every student to learning across all eight curricular areas through to the end of S3. Pathfinder helps students understand how their BGE experience connects to the Senior Phase and beyond — supporting informed personalisation and choice rather than premature narrowing.",
                linkLabel: 'Education Scotland — Curriculum for Excellence',
                url: 'https://education.gov.scot/curriculum-for-excellence/',
              },
              {
                title: 'The Hayward Review',
                body: "The Independent Review of Qualifications and Assessment (2023) found that early curriculum narrowing is 'incongruent with the aims of CfE.' Pathfinder encourages breadth by showing students how wider subject combinations open more doors — not fewer.",
                linkLabel: 'Hayward Review — gov.scot',
                url: 'https://www.gov.scot/publications/independent-review-qualifications-assessment-scotland/',
              },
              {
                title: 'Qualifications Scotland',
                body: 'With the establishment of Qualifications Scotland (December 2025) to replace the SQA, the qualifications landscape is evolving. Pathfinder maps every current SQA qualification and will update as the new body introduces changes.',
                linkLabel: 'Qualifications Scotland',
                url: 'https://www.qualificationsscotland.gov.scot/',
              },
              {
                title: 'Widening Access and the Commission on Widening Access',
                body: "Scotland's Commission on Widening Access set targets for university participation from disadvantaged backgrounds. Pathfinder automatically identifies students who may qualify for reduced entry offers, ensuring no eligible student misses out because they didn't know the support existed.",
                linkLabel: 'Scottish Funding Council — widening access',
                url: 'https://www.sfc.ac.uk/widening-access/',
              },
            ].map((card) => (
              <div key={card.title} className="pf-card">
                <h3 style={{ marginBottom: '10px' }}>{card.title}</h3>
                <p
                  style={{
                    color: 'var(--pf-grey-600)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.6,
                    marginBottom: '16px',
                  }}
                >
                  {card.body}
                </p>
                <a
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1"
                  style={{
                    color: 'var(--pf-blue-700)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  {card.linkLabel}
                  <svg
                    width="11"
                    height="11"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Evidence base */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '820px' }}>
          <span className="pf-badge-blue">Research</span>
          <h2 style={{ marginTop: '16px', marginBottom: '12px' }}>
            The evidence behind Pathfinder
          </h2>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '1.0625rem',
              marginBottom: '40px',
            }}
          >
            Pathfinder is built on a growing body of Scottish education research. These are the key
            findings that shaped what we built.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              {
                source: 'University of Stirling / Nuffield Foundation (2023)',
                quote:
                  'Broader curricula are associated with better National 5 performance, higher Higher and Advanced Higher enrolment, and better post-school destinations. Narrower curricula disproportionately affect students from disadvantaged areas.',
                linkLabel: 'Nuffield Foundation — curriculum breadth in Scotland',
                url: 'https://www.nuffieldfoundation.org/project/curriculum-breadth-scotland',
              },
              {
                source: 'OECD Review of Curriculum for Excellence (2021)',
                quote:
                  'Identified the disconnect between Broad General Education and the Senior Phase as a central challenge — one that particularly risks disadvantaging students who lack access to informed guidance.',
                linkLabel: "OECD — Scotland\u2019s Curriculum for Excellence",
                url: 'https://www.oecd.org/education/scotland-s-curriculum-for-excellence-9789264506015-en.htm',
              },
              {
                source: 'HM Inspectorate of Education (2023)',
                quote:
                  'Staff in schools must ensure that all children and young people receive their full entitlement to a broad general education up to and including S3.',
                linkLabel: 'Education Scotland — inspection and review',
                url: 'https://education.gov.scot/inspection-and-review/',
              },
              {
                source: 'Hayward Review (2023)',
                quote:
                  'The narrowing of the S3 curriculum is incongruent with the aims of CfE. Students are being asked to specialise before they have had the breadth of experience the curriculum intended.',
                linkLabel: 'Hayward Review response — gov.scot',
                url: 'https://www.gov.scot/publications/independent-review-qualifications-assessment-scotland/',
              },
              {
                source: 'Skills Development Scotland — My World of Work',
                quote:
                  'My World of Work provides careers guidance but does not offer subject combination analysis or widening access eligibility checking. Pathfinder is designed to complement, not replace, existing services.',
                linkLabel: 'My World of Work',
                url: 'https://www.myworldofwork.co.uk',
              },
            ].map((item) => (
              <div
                key={item.source}
                className="pf-card"
                style={{
                  borderLeft: '4px solid var(--pf-blue-500)',
                  borderRadius: '0 8px 8px 0',
                }}
              >
                <p
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'var(--pf-blue-700)',
                    marginBottom: '8px',
                  }}
                >
                  {item.source}
                </p>
                <p
                  style={{
                    color: 'var(--pf-grey-600)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                    marginBottom: '12px',
                  }}
                >
                  &ldquo;{item.quote}&rdquo;
                </p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1"
                  style={{
                    color: 'var(--pf-blue-700)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  {item.linkLabel}
                  <svg
                    width="11"
                    height="11"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="pf-section pf-section-dark" style={{ textAlign: 'center' }}>
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ color: 'var(--pf-white)', marginBottom: '12px' }}>
            Built in Scotland, for Scotland.
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '1.0625rem', marginBottom: '28px' }}>
            SQA qualifications, Scottish universities, SIMD, SWAP, REACH — Pathfinder is built around
            the things that actually matter here, not a generic UK-wide view.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/pathways" className="pf-btn-primary">
              Get started
            </Link>
            <Link
              href="/help"
              className="pf-btn"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--pf-white)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              Help centre
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
