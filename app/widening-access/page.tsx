'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useUniversities } from '@/hooks/use-universities'
import { useCourses } from '@/hooks/use-courses'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { SlowLoadingNotice } from '@/components/ui/slow-loading-notice'
import { classifyError } from '@/lib/errors'
import { SHEP_PROGRAMMES } from '@/lib/shep'
import { UNIVERSITY_TYPES } from '@/lib/constants'
import type { Tables } from '@/types/database'

type University = Tables<'universities'>
type Course = Tables<'courses'>

interface UniversityWideningInfo {
  programme_name?: string
  programme_short?: string
  url?: string
  description?: string
}

// University type ordering + copy for the grouped comparison section.
const TYPE_GROUPS: Array<{
  key: 'ancient' | 'established' | 'modern' | 'specialist'
  label: string
  blurb: string
}> = [
  {
    key: 'ancient',
    label: 'Ancient Universities',
    blurb: 'Founded before 1600 — Edinburgh, Glasgow, St Andrews and Aberdeen.',
  },
  {
    key: 'established',
    label: 'Established Universities',
    blurb: 'Post-war chartered — Strathclyde, Dundee, Heriot-Watt and Stirling.',
  },
  {
    key: 'modern',
    label: 'Modern Universities',
    blurb: 'Post-1992 — GCU, Napier, QMU, RGU, UWS, Abertay and UHI.',
  },
  {
    key: 'specialist',
    label: 'Specialist Institutions',
    blurb: 'Focused providers — RCS, Glasgow School of Art and SRUC.',
  },
]

// Quote-style care-experienced examples pulled straight from the universities
// that have the most specific, distinctive guarantees. These are deliberately
// hand-picked rather than looped from the full list so each highlights a
// different mechanism (guaranteed unconditional, lowest threshold, 3-Higher
// minimum). The full per-university detail is on each university page.
type CareExperiencedExample = {
  slug: string
  quote: string
}
const CARE_EXPERIENCED_EXAMPLES: CareExperiencedExample[] = [
  {
    slug: 'glasgow',
    quote:
      'Glasgow — care-experienced Priority 1 applicants receive the lowest published thresholds of any ancient university, with guaranteed offers at BBBB (Arts/Sciences).',
  },
  {
    slug: 'aberdeen',
    quote:
      'Aberdeen — care-experienced applicants receive guaranteed unconditional offers at BBC, plus free university accommodation for SIMD20 students.',
  },
  {
    slug: 'abertay',
    quote:
      'Abertay — care-experienced applicants need just 3 Highers, the lowest published threshold in Scotland, with the Frank Buttle Trust Quality Mark.',
  },
]

// Grade-reduction patterns table data, directly from the research brief.
const GRADE_REDUCTION_ROWS: Array<{
  type: string
  examples: string
  reduction: string
  detail: string
}> = [
  {
    type: 'Ancient',
    examples: 'Edinburgh, Glasgow, St Andrews, Aberdeen',
    reduction: '1–2 grades',
    detail: 'Edinburgh AAAB → AABB via Plus Flag',
  },
  {
    type: 'Established',
    examples: 'Strathclyde, Dundee, Heriot-Watt, Stirling',
    reduction: '1–3 grades',
    detail: 'Dundee AABB → BBBB (Engineering / Science)',
  },
  {
    type: 'Modern',
    examples: 'GCU, Napier, UWS, Abertay, RGU, UHI, QMU',
    reduction: '2–3 grades or fewer Highers',
    detail: 'UWS BBBB → CC plus a named WA programme',
  },
  {
    type: 'Specialist',
    examples: 'RCS, GSA, SRUC',
    reduction: 'Portfolio / audition + reduced academic',
    detail: 'GSA ABBB → BBCC across all programmes',
  },
]

// Articulation highlights — the universities where the HNC/HND college route
// is most clearly structured, with a short one-line why. Linked by slug so the
// card can deep-link into each uni page.
const ARTICULATION_HIGHLIGHTS: Array<{
  slug: string
  title: string
  body: string
}> = [
  {
    slug: 'uhi',
    title: 'UHI — seamless integration',
    body: 'HNC = Year 1, HND = Year 2 across the same institution. The most accessible university in Scotland.',
  },
  {
    slug: 'rgu',
    title: 'RGU + NESCol',
    body: 'Over 400 advanced-entry students per year via NESCol — the strongest college articulation partnership in Scotland.',
  },
  {
    slug: 'glasgow',
    title: 'Glasgow bespoke HNC',
    body: 'Bespoke HNC programmes with Glasgow colleges in Life Sciences, Social Sciences, and Engineering. Students are UofG-enrolled from day one.',
  },
  {
    slug: 'gcu',
    title: 'GCU Pathways',
    body: 'Enrol at GCU from day one, study your HND at a partner college for two years, then enter Year 3.',
  },
]

// Fallback widening access programme notes for each Scottish university.
// Used only when the `universities.widening_access_info` JSONB is empty.
const DEFAULT_WA_NOTES: Record<string, string> = {
  edinburgh: 'Runs the REACH programme for S4\u2013S6, plus contextual offers up to two grades below standard for eligible students.',
  glasgow: 'Participates in FOCUS West and REACH, with adjusted offers for SIMD20/40 and care-experienced students.',
  'st-andrews': 'First Chances Fife programme for S4\u2013S6, plus contextual offers up to two grades below standard.',
  strathclyde: 'Top Up programmes, FOCUS West participation, and the Strathclyde Cares guarantee for care-experienced applicants.',
  dundee: 'Discovery summer school and adjusted offers for SIMD20/40, care-experienced, and young-carer applicants.',
  aberdeen: 'Runs Aspire North for north-east Scotland schools and adjusted offers across most programmes.',
  'heriot-watt': 'Heriot-Watt Access programme with guaranteed interviews and adjusted offers for widening access applicants.',
  stirling: 'Access Stirling supports SIMD20/40, care-experienced, and estranged students with lower entry requirements and bursaries.',
  gcu: 'GCU Access and GCU Caledonian Club support students from SIMD20/40 postcodes through school partnerships.',
  napier: 'Edinburgh Napier LEAPS and care-experienced guarantee, with adjusted offers on most undergraduate courses.',
  rgu: 'RGU Access and Aspire North partnership support widening access students with adjusted offers and mentoring.',
  uws: 'UWS has one of the highest SIMD20 intake rates in the UK and offers adjusted entry on almost every degree.',
  qmu: 'Small, supportive campus offering adjusted offers and the care-experienced student guarantee.',
  uhi: 'University of the Highlands and Islands runs flexible access routes including HNC/HND top-up for widening access students.',
  rcs: 'Royal Conservatoire of Scotland runs Transitions Programme and care-experienced access routes.',
}

function resolveUniWideningInfo(uni: University): {
  programmeShort: string
  url: string | null
  description: string
} {
  const info = uni.widening_access_info as UniversityWideningInfo | null
  const preferredUrl = uni.widening_access_url ?? info?.url ?? uni.website_url ?? uni.website ?? null
  if (info?.description) {
    return {
      programmeShort: info.programme_short ?? info.programme_name ?? '',
      url: preferredUrl,
      description: info.description,
    }
  }
  return {
    programmeShort: '',
    url: preferredUrl,
    description: DEFAULT_WA_NOTES[uni.slug] ?? 'Offers contextual admissions and adjusted entry for students from widening participation backgrounds.',
  }
}

const NATIONAL_PROGRAMMES: Array<{
  name: string
  region: string
  url: string
  description: string
}> = [
  {
    name: 'LEAPS',
    region: 'Edinburgh & South-East Scotland',
    url: 'https://www.leapsonline.org',
    description:
      'Lothian Equal Access Programme for Schools — S4 to S6 students in Edinburgh, the Borders, Lothians and Fife.',
  },
  {
    name: 'FOCUS West',
    region: 'West of Scotland',
    url: 'https://www.focuswest.org.uk',
    description:
      'Runs with Glasgow, Strathclyde, GCU, UWS and RCS — supports pupils from S4 onwards with mentoring, visits, and events.',
  },
  {
    name: 'REACH Scotland',
    region: 'Aberdeen and North-East',
    url: 'https://www.abdn.ac.uk/reach',
    description:
      "University of Aberdeen's schools engagement programme — aims at careers in law, medicine, dentistry, and veterinary medicine.",
  },
  {
    name: 'LIFT OFF',
    region: 'Tayside',
    url: 'https://www.dundee.ac.uk/widening-access',
    description:
      "University of Dundee's widening access programme — summer schools, mentoring and subject tasters.",
  },
  {
    name: 'Who Cares? Scotland',
    region: 'National — care experienced',
    url: 'https://www.whocaresscotland.org',
    description:
      'Advocacy, independent advice and peer support for care experienced children, young people and adults.',
  },
  {
    name: 'Carers Trust Scotland',
    region: 'National — young carers',
    url: 'https://carers.org/about-us/about-carers-trust-scotland',
    description:
      'Support for young carers including Young Carer Statements, respite funding, and transition support.',
  },
  {
    name: 'SAAS',
    region: 'Funding',
    url: 'https://www.saas.gov.uk',
    description:
      'Student Awards Agency for Scotland — applies your tuition funding and checks bursary eligibility.',
  },
  {
    name: 'Care Experienced students — UCAS',
    region: 'UK-wide application guidance',
    url: 'https://www.ucas.com/undergraduate/applying-university/individual-needs/care-experienced-students',
    description:
      "UCAS's guidance on declaring care experience on your application and the support universities must offer.",
  },
]

export default function WideningAccessPage() {
  const { user } = useAuth()
  const {
    data: universities,
    isLoading: universitiesLoading,
    error: universitiesError,
    refetch: refetchUniversities,
  } = useUniversities()

  // Pull Medicine courses so we can highlight the 4 Gateway Medicine programmes.
  const { data: medicineCourses } = useCourses({ subjectArea: 'Medicine' }) as {
    data: (Course & { university: University })[] | undefined
  }

  const gatewayMedicineCourses = useMemo(() => {
    if (!medicineCourses) return []
    return medicineCourses.filter((c) =>
      /gateway|foundation/i.test(c.name)
    )
  }, [medicineCourses])

  // Group universities by university_type for the comparison grid. We fall
  // back to the legacy `type` enum when the new column is empty, mapping
  // "traditional" -> "established" so both naming conventions slot in.
  const universitiesByType = useMemo(() => {
    const groups: Record<string, University[]> = {
      ancient: [],
      established: [],
      modern: [],
      specialist: [],
    }
    if (!universities) return groups
    for (const uni of universities) {
      const raw = uni.university_type ?? uni.type ?? null
      const key = raw === 'traditional' ? 'established' : raw
      if (key && key in groups) groups[key].push(uni)
    }
    return groups
  }, [universities])

  const careExperiencedExamples = useMemo(() => {
    if (!universities) return []
    return CARE_EXPERIENCED_EXAMPLES.map((ex) => {
      const uni = universities.find((u) => u.slug === ex.slug)
      return { ...ex, university: uni ?? null }
    }).filter((ex) => ex.university)
  }, [universities])

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
          <div className="grid md:grid-cols-5 gap-10 items-center">
            <div className="md:col-span-3">
              <span className="pf-badge-amber" style={{ marginBottom: '20px' }}>
                Widening Access
              </span>
              <h1 style={{ marginTop: '16px', marginBottom: '16px', lineHeight: 1.15 }}>
                Lower entry requirements for students from every background.
              </h1>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '1.125rem',
                  lineHeight: 1.65,
                  marginBottom: '32px',
                }}
              >
                Scottish universities offer reduced entry requirements, guaranteed interviews, and
                extra support to students from under-represented backgrounds. We check your
                eligibility automatically and show adjusted offers on every course you view.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href={user ? '/dashboard' : '/onboarding'} className="pf-btn-primary">
                  Check your eligibility
                </Link>
                <Link href="/courses" className="pf-btn-secondary">
                  Browse courses
                </Link>
              </div>
            </div>

            {/* Decorative SVG: scales (fair access) */}
            <div className="hidden md:flex justify-center md:col-span-2">
              <svg
                viewBox="0 0 360 300"
                width="100%"
                style={{ maxWidth: '360px' }}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="pf-wa-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgba(245, 158, 11, 0.18)" />
                    <stop offset="100%" stopColor="var(--pf-blue-100)" />
                  </linearGradient>
                </defs>

                <rect x="20" y="20" width="320" height="260" rx="16" fill="url(#pf-wa-grad)" />

                {/* Standing pillar */}
                <line
                  x1="180"
                  y1="60"
                  x2="180"
                  y2="240"
                  stroke="var(--pf-blue-700)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                {/* Cross-beam */}
                <line
                  x1="80"
                  y1="100"
                  x2="280"
                  y2="100"
                  stroke="var(--pf-blue-700)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                {/* Left pan — standard requirements */}
                <g>
                  <line x1="110" y1="100" x2="110" y2="140" stroke="var(--pf-blue-700)" strokeWidth="2" />
                  <ellipse cx="110" cy="145" rx="38" ry="8" fill="var(--pf-blue-700)" opacity="0.15" />
                  <rect x="80" y="125" width="60" height="24" rx="6" fill="var(--pf-white)" stroke="var(--pf-grey-300)" strokeWidth="1" />
                  <text
                    x="110"
                    y="142"
                    textAnchor="middle"
                    fontFamily="Space Grotesk, sans-serif"
                    fontWeight="700"
                    fontSize="13"
                    fill="var(--pf-grey-900)"
                  >
                    AAAA
                  </text>
                  <text
                    x="110"
                    y="172"
                    textAnchor="middle"
                    fontFamily="Inter, sans-serif"
                    fontSize="10"
                    fill="var(--pf-grey-600)"
                  >
                    Standard
                  </text>
                </g>
                {/* Right pan — adjusted offer */}
                <g>
                  <line x1="250" y1="100" x2="250" y2="165" stroke="var(--pf-blue-700)" strokeWidth="2" />
                  <ellipse cx="250" cy="170" rx="38" ry="8" fill="var(--pf-amber-500)" opacity="0.2" />
                  <rect x="220" y="150" width="60" height="24" rx="6" fill="var(--pf-white)" stroke="var(--pf-amber-500)" strokeWidth="2" />
                  <text
                    x="250"
                    y="167"
                    textAnchor="middle"
                    fontFamily="Space Grotesk, sans-serif"
                    fontWeight="700"
                    fontSize="13"
                    fill="var(--pf-amber-500)"
                  >
                    AABB
                  </text>
                  <text
                    x="250"
                    y="197"
                    textAnchor="middle"
                    fontFamily="Inter, sans-serif"
                    fontSize="10"
                    fill="var(--pf-grey-600)"
                  >
                    Your offer
                  </text>
                </g>
                {/* Base */}
                <rect x="130" y="236" width="100" height="10" rx="4" fill="var(--pf-blue-700)" />
                <rect x="150" y="246" width="60" height="6" rx="3" fill="var(--pf-blue-900)" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* What is widening access */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '820px' }}>
          <span className="pf-badge-blue">In plain language</span>
          <h2 style={{ marginTop: '16px', marginBottom: '16px' }}>
            What widening access actually means
          </h2>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', marginBottom: '16px' }}>
            Your postcode, your family circumstances, and the support you&apos;ve had at home all affect
            your chances of reaching university. Widening access is Scotland&apos;s response: a
            commitment by the Scottish Government and every Scottish university to consider your
            circumstances <em>alongside</em> your grades.
          </p>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem', marginBottom: '16px' }}>
            In practice, this means reduced grade requirements, guaranteed interviews, dedicated
            summer schools, mentoring, and bursaries &mdash; all for students from backgrounds where
            fewer people historically went on to higher education.
          </p>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1.0625rem' }}>
            <strong>Important:</strong> widening access isn&apos;t a handout. You still need to meet the
            course&apos;s core requirements and demonstrate your ability. It&apos;s about being judged fairly
            against the odds you&apos;ve already had to overcome.
          </p>
        </div>
      </section>

      {/* National programmes */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container">
          <div className="text-center" style={{ marginBottom: '40px', maxWidth: '680px', marginLeft: 'auto', marginRight: 'auto' }}>
            <span className="pf-badge-blue">National programmes</span>
            <h2 style={{ marginTop: '16px', marginBottom: '16px' }}>
              Direct links to the main widening access organisations
            </h2>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '1rem' }}>
              These are the programmes that support students into Scottish universities. All run
              independently of Pathfinder &mdash; we just help you find the right door to knock on.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {NATIONAL_PROGRAMMES.map((p) => (
              <a
                key={p.url}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="pf-card-hover no-underline hover:no-underline"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  color: 'var(--pf-grey-900)',
                  borderLeft: '3px solid var(--pf-amber-500)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '12px',
                    marginBottom: '4px',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontSize: '1.0625rem',
                      color: 'var(--pf-grey-900)',
                      margin: 0,
                    }}
                  >
                    {p.name}
                  </h3>
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    style={{ color: 'var(--pf-blue-500)', flexShrink: 0, marginTop: '4px' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--pf-blue-700)',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    marginBottom: '8px',
                  }}
                >
                  {p.region}
                </span>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--pf-grey-600)',
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {p.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* The schemes */}
      <section className="pf-section pf-section-white">
        <div className="pf-container">
          <div className="text-center" style={{ marginBottom: '40px', maxWidth: '680px', marginLeft: 'auto', marginRight: 'auto' }}>
            <span className="pf-badge-blue">Who qualifies</span>
            <h2 style={{ marginTop: '16px', marginBottom: '16px' }}>
              The main widening access schemes
            </h2>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '1rem' }}>
              Students can qualify through one or more of these routes. Most universities recognise
              all of them.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <SchemeCard
              title="SIMD20 & SIMD40"
              subtitle="Based on your postcode"
              body={
                <>
                  <p style={{ marginBottom: '12px' }}>
                    The <strong>Scottish Index of Multiple Deprivation (SIMD)</strong> divides
                    Scotland into 6,976 small areas called datazones, each ranked from most deprived
                    (1) to least deprived (6,976). These are grouped into deciles &mdash; bands of 10%.
                  </p>
                  <p style={{ marginBottom: '12px' }}>
                    <strong style={{ color: 'var(--pf-amber-500)' }}>SIMD20</strong> means your
                    postcode is in the 20% most deprived areas (deciles 1&ndash;2).{' '}
                    <strong style={{ color: 'var(--pf-amber-500)' }}>SIMD40</strong> means the 40%
                    most deprived (deciles 1&ndash;4). Your SIMD decile is determined automatically
                    when you enter your postcode on Pathfinder.
                  </p>
                  <div
                    className="rounded-lg"
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'var(--pf-blue-50)',
                      fontSize: '0.8125rem',
                      color: 'var(--pf-blue-900)',
                      marginBottom: '8px',
                    }}
                  >
                    <a
                      href="https://www.gov.scot/collections/scottish-index-of-multiple-deprivation-2020/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1"
                      style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}
                    >
                      Official SIMD lookup tool
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </>
              }
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />

            <SchemeCard
              title="Care Experienced"
              subtitle="Care-experienced student guarantee"
              body={
                <>
                  <p style={{ marginBottom: '12px' }}>
                    You qualify as care experienced if you&apos;ve been in care at any point in your
                    life &mdash; including foster care, kinship care, residential care, or looked-after-at-home arrangements. This applies whether you were in care for a week or many years.
                  </p>
                  <p style={{ marginBottom: '12px' }}>
                    Scottish universities operate a <strong>Care-Experienced Student Guarantee</strong>:
                    if you meet the minimum entry requirements, you are guaranteed an unconditional
                    offer at most institutions. You&apos;ll also typically get dedicated support,
                    year-round accommodation, and bursaries.
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                    Declare care experience on your UCAS form and contact the university&apos;s widening
                    access team as early as you can &mdash; they&apos;ll walk you through the extra support.
                  </p>
                </>
              }
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              }
            />

            <SchemeCard
              title="First Generation"
              subtitle="First in the family to attend university"
              body={
                <>
                  <p style={{ marginBottom: '12px' }}>
                    You count as first generation if neither of your parents or carers completed a
                    full undergraduate degree. Step-parents, grandparents and older siblings don&apos;t
                    count against you &mdash; only the people who raised you.
                  </p>
                  <p style={{ marginBottom: '12px' }}>
                    Universities verify this from your UCAS application, which asks about your
                    parents&apos; highest qualification. There&apos;s nothing extra to provide, but you should
                    answer honestly &mdash; this flag triggers additional consideration during
                    admissions.
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                    First-generation students often get access to dedicated mentoring, peer support
                    groups, and transition programmes during first year.
                  </p>
                </>
              }
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
            />

            <SchemeCard
              title="Young Carers"
              subtitle="Unpaid care for a family member"
              body={
                <>
                  <p style={{ marginBottom: '12px' }}>
                    A young carer is anyone under 25 who provides unpaid care for a family member
                    with a disability, long-term illness, mental-health condition, or addiction.
                    This includes emotional support, personal care, and managing household tasks &mdash;
                    not just the obvious &quot;physical&quot; care.
                  </p>
                  <p style={{ marginBottom: '12px' }}>
                    Evidence is usually a <strong>Young Carer Statement</strong> from your local
                    authority, a letter from a young carers&apos; service (like a local Carers Centre),
                    or confirmation from your school&apos;s pupil support team.
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                    Universities offer flexible deadlines, dedicated bursaries, and transition support
                    so you can manage your caring role alongside study.
                  </p>
                </>
              }
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* How each university compares */}
      <section className="pf-section pf-section-grey" id="universities">
        <div className="pf-container">
          <div className="text-center" style={{ marginBottom: '40px', maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}>
            <span className="pf-badge-blue">By university tier</span>
            <h2 style={{ marginTop: '16px', marginBottom: '16px' }}>
              How widening access works at each university
            </h2>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '1rem' }}>
              Scroll through by tier to see where you&apos;ll get the biggest grade reductions.
              Each card links to the full widening access details for that institution.
            </p>
          </div>

          {universitiesLoading && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="pf-card" style={{ padding: '20px' }}>
                    <Skeleton width="60%" height={20} rounded="md" />
                    <div style={{ height: '8px' }} />
                    <Skeleton width="35%" height={14} rounded="sm" />
                    <div style={{ height: '12px' }} />
                    <Skeleton variant="text" lines={2} />
                  </div>
                ))}
              </div>
              <SlowLoadingNotice isLoading={universitiesLoading} />
            </>
          )}

          {!universitiesLoading && universitiesError && (
            <ErrorState
              title={classifyError(universitiesError).title}
              message="Something went wrong loading universities. Please try again."
              retryAction={() => refetchUniversities()}
            />
          )}

          {!universitiesLoading && !universitiesError && universities && (
            <div className="space-y-10">
              {TYPE_GROUPS.map((group) => {
                const groupUnis = universitiesByType[group.key] ?? []
                if (groupUnis.length === 0) return null
                return (
                  <div key={group.key}>
                    <div className="flex items-baseline gap-3 mb-4 flex-wrap">
                      <h3
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 600,
                          fontSize: '1.25rem',
                          color: 'var(--pf-grey-900)',
                          margin: 0,
                        }}
                      >
                        {group.label}
                      </h3>
                      <span
                        className="pf-badge"
                        style={{
                          backgroundColor: 'var(--pf-blue-100)',
                          color: 'var(--pf-blue-700)',
                          fontWeight: 600,
                        }}
                      >
                        {groupUnis.length} institutions
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--pf-grey-600)',
                        margin: 0,
                        marginBottom: '16px',
                      }}
                    >
                      {group.blurb}
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {groupUnis.map((uni) => (
                        <UniversityWaCard key={uni.id} uni={uni} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Care experienced guarantee */}
      <section className="pf-section pf-section-white" id="care-experienced">
        <div className="pf-container" style={{ maxWidth: '960px' }}>
          <div className="text-center" style={{ marginBottom: '40px', maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}>
            <span
              className="pf-badge"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#047857',
                fontWeight: 600,
              }}
            >
              The most powerful WA instrument
            </span>
            <h2 style={{ marginTop: '16px', marginBottom: '16px' }}>
              The care-experienced guarantee
            </h2>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '1rem', lineHeight: 1.65 }}>
              Every Scottish university guarantees an offer to care-experienced applicants who meet
              the minimum entry requirements. At most institutions, this is the single biggest
              grade reduction available — and it applies whether you were in care for a week or
              many years.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {careExperiencedExamples.map((ex) =>
              ex.university ? (
                <Link
                  key={ex.slug}
                  href={`/universities/${ex.university.id}`}
                  className="pf-card-hover no-underline hover:no-underline"
                  style={{
                    padding: '20px',
                    color: 'var(--pf-grey-900)',
                    borderLeft: '4px solid var(--pf-green-500)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#047857',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {ex.university.name}
                  </span>
                  <p
                    style={{
                      fontSize: '0.9375rem',
                      color: 'var(--pf-grey-900)',
                      lineHeight: 1.55,
                      margin: 0,
                    }}
                  >
                    {ex.quote.replace(/^[^—]*—\s*/, '')}
                  </p>
                </Link>
              ) : null
            )}
          </div>

          <div
            className="rounded-lg mt-8"
            style={{
              padding: '20px 24px',
              backgroundColor: 'var(--pf-blue-50)',
              border: '1px solid var(--pf-blue-100)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--pf-grey-900)',
                margin: 0,
                marginBottom: '12px',
                lineHeight: 1.6,
              }}
            >
              Support, advocacy, and independent advice for care experienced students is available
              from <strong>Who Cares? Scotland</strong>.
            </p>
            <a
              href="https://www.whocaresscotland.org"
              target="_blank"
              rel="noopener noreferrer"
              className="pf-btn-secondary pf-btn-sm"
              style={{ display: 'inline-flex' }}
            >
              Visit Who Cares? Scotland
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* SHEP regional programmes */}
      <section className="pf-section pf-section-grey" id="shep">
        <div className="pf-container">
          <div className="text-center" style={{ marginBottom: '40px', maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}>
            <span className="pf-badge-blue">SHEP regional programmes</span>
            <h2 style={{ marginTop: '16px', marginBottom: '16px' }}>
              Four regional partnerships cover every Scottish school
            </h2>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '1rem' }}>
              The Scottish Higher Education Programmes (SHEP) are four regional partnerships that
              support students from under-represented backgrounds. Register with your local
              programme — participation itself can trigger reduced offers at all Scottish
              universities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {SHEP_PROGRAMMES.map((p) => (
              <div
                key={p.key}
                className="pf-card"
                style={{ padding: '24px', borderLeft: '4px solid var(--pf-blue-700)' }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontSize: '1.125rem',
                      color: 'var(--pf-grey-900)',
                      margin: 0,
                    }}
                  >
                    {p.name}
                  </h3>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1"
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--pf-blue-700)',
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    Visit site
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
                <p
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--pf-blue-700)',
                    margin: 0,
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {p.region}
                </p>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--pf-grey-600)',
                    lineHeight: 1.6,
                    margin: 0,
                    marginBottom: '12px',
                  }}
                >
                  {p.description}
                </p>
                <div
                  className="rounded-lg"
                  style={{
                    padding: '10px 12px',
                    backgroundColor: 'var(--pf-blue-50)',
                    border: '1px solid var(--pf-blue-100)',
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--pf-blue-700)',
                      margin: 0,
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    What it offers
                  </p>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--pf-grey-900)',
                      lineHeight: 1.55,
                      margin: 0,
                    }}
                  >
                    {p.offers}
                  </p>
                </div>
                <details className="mt-3">
                  <summary
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--pf-grey-600)',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Councils covered ({p.councilAreas.length})
                  </summary>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--pf-grey-600)',
                      marginTop: '8px',
                      lineHeight: 1.55,
                    }}
                  >
                    {p.councilAreas.join(', ')}
                  </p>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gateway medicine */}
      {gatewayMedicineCourses.length > 0 && (
        <section className="pf-section pf-section-white" id="gateway-medicine">
          <div className="pf-container">
            <div className="text-center" style={{ marginBottom: '40px', maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}>
              <span
                className="pf-badge"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#047857',
                  fontWeight: 600,
                }}
              >
                Medicine
              </span>
              <h2 style={{ marginTop: '16px', marginBottom: '16px' }}>
                Gateway programmes for Medicine
              </h2>
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '1rem', lineHeight: 1.65 }}>
                Four Scottish universities run one-year Gateway foundation programmes that feed
                directly into their MBChB degrees. These are among the most impactful widening
                access routes for aspiring doctors from disadvantaged backgrounds.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {gatewayMedicineCourses.map((course) => (
                <GatewayMedicineCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Grade reductions by tier */}
      <section className="pf-section pf-section-grey" id="grade-reductions">
        <div className="pf-container" style={{ maxWidth: '960px' }}>
          <div className="text-center" style={{ marginBottom: '32px', maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}>
            <span className="pf-badge-blue">Grade reductions</span>
            <h2 style={{ marginTop: '16px', marginBottom: '16px' }}>
              Grade reductions by university tier
            </h2>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '1rem' }}>
              Every university offers different levels of reduction. Here&apos;s the pattern at a
              glance.
            </p>
          </div>

          <div
            className="rounded-lg overflow-hidden"
            style={{
              border: '1px solid var(--pf-grey-300)',
              backgroundColor: 'var(--pf-white)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div
              className="hidden md:grid"
              style={{
                gridTemplateColumns: '1fr 1.8fr 1.2fr 1.8fr',
                gap: '16px',
                padding: '14px 20px',
                backgroundColor: 'var(--pf-grey-100)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--pf-grey-600)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <span>Type</span>
              <span>Examples</span>
              <span>Typical reduction</span>
              <span>Example</span>
            </div>
            {GRADE_REDUCTION_ROWS.map((row, idx) => (
              <div
                key={row.type}
                className="grid grid-cols-1 md:grid-cols-[1fr_1.8fr_1.2fr_1.8fr]"
                style={{
                  gap: '8px 16px',
                  padding: '16px 20px',
                  borderTop: idx === 0 ? 'none' : '1px solid var(--pf-grey-300)',
                  backgroundColor: idx % 2 === 0 ? 'var(--pf-white)' : 'var(--pf-blue-50)',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    color: 'var(--pf-grey-900)',
                  }}
                >
                  {row.type}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
                  {row.examples}
                </span>
                <span
                  className="pf-data-number"
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--pf-amber-500)',
                    fontWeight: 700,
                  }}
                >
                  {row.reduction}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-900)' }}>
                  {row.detail}
                </span>
              </div>
            ))}
          </div>

          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--pf-grey-600)',
              marginTop: '16px',
              textAlign: 'center',
              lineHeight: 1.55,
            }}
          >
            These are indicative — check each university&apos;s page for the exact reductions
            applied to individual courses.
          </p>
        </div>
      </section>

      {/* College articulation — the hidden path */}
      <section className="pf-section pf-section-white" id="articulation">
        <div className="pf-container">
          <div className="text-center" style={{ marginBottom: '40px', maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}>
            <span className="pf-badge-blue">The hidden path</span>
            <h2 style={{ marginTop: '16px', marginBottom: '16px' }}>
              College articulation — HNC and HND routes
            </h2>
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '1rem', lineHeight: 1.65 }}>
              Many students enter a Scottish university via a Higher National Certificate (HNC) or
              Diploma (HND) from a college. An HNC can give direct entry to Year 2 of a degree,
              and an HND can land you in Year 3 — often with reduced entry requirements.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {ARTICULATION_HIGHLIGHTS.map((h) => {
              const uni = universities?.find((u) => u.slug === h.slug)
              return (
                <Link
                  key={h.slug}
                  href={uni ? `/universities/${uni.id}` : '/pathways/alternatives'}
                  className="pf-card-hover no-underline hover:no-underline"
                  style={{
                    padding: '24px',
                    color: 'var(--pf-grey-900)',
                    borderLeft: '4px solid var(--pf-blue-700)',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontSize: '1.0625rem',
                      color: 'var(--pf-grey-900)',
                      margin: 0,
                      marginBottom: '8px',
                    }}
                  >
                    {h.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--pf-grey-600)',
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {h.body}
                  </p>
                </Link>
              )
            })}
          </div>

          <div className="text-center">
            <Link href="/pathways/alternatives" className="pf-btn-secondary">
              Explore alternative pathways
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How Pathfinder helps */}
      <section className="pf-section pf-section-dark">
        <div className="pf-container">
          <div className="text-center" style={{ marginBottom: '48px', maxWidth: '680px', marginLeft: 'auto', marginRight: 'auto' }}>
            <span
              className="pf-badge"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff' }}
            >
              How Pathfinder helps
            </span>
            <h2 style={{ marginTop: '16px', marginBottom: '16px', color: '#fff' }}>
              We do the widening access legwork for you
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '1.0625rem' }}>
              No need to trawl 15 university websites. Pathfinder checks your eligibility, applies
              the right adjusted offers, and highlights courses where you have a real chance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <HelpCard
              number="1"
              title="Automatic eligibility check"
              body="Enter your postcode once and we look up your SIMD decile across 227,000 Scottish postcodes. Tick the relevant boxes for care experience, young carer, or first generation, and we handle the rest."
            />
            <HelpCard
              number="2"
              title="Adjusted offers on every course"
              body={'Browse any course and we show both the standard offer and your adjusted offer side by side. No hunting through small print \u2014 the numbers are right there.'}
            />
            <HelpCard
              number="3"
              title="Courses where you have a chance"
              body="Our eligibility matcher factors in adjusted offers. Courses you'd miss by standard rules but clear via widening access get flagged separately, so you don't overlook them."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pf-section pf-section-blue">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <div className="text-center">
            <h2 style={{ marginBottom: '16px' }}>Ready to check your eligibility?</h2>
            <p
              style={{
                color: 'var(--pf-grey-600)',
                fontSize: '1.0625rem',
                marginBottom: '28px',
                lineHeight: 1.6,
              }}
            >
              It takes two minutes. Enter your postcode, tick any widening access criteria that
              apply, and we&apos;ll show you the adjusted offers on every Scottish university course.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href={user ? '/dashboard' : '/auth/sign-up'}
                className="pf-btn-primary"
              >
                {user ? 'Check my eligibility' : 'Create a free account'}
              </Link>
              <Link href="/courses" className="pf-btn-secondary">
                Browse courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function SchemeCard({
  title,
  subtitle,
  body,
  icon,
}: {
  title: string
  subtitle: string
  body: React.ReactNode
  icon: React.ReactNode
}) {
  return (
    <div
      className="pf-card"
      style={{ padding: '24px', borderLeft: '4px solid var(--pf-amber-500)' }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className="flex-shrink-0 rounded-lg flex items-center justify-center"
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            color: 'var(--pf-amber-500)',
          }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '1.125rem',
              color: 'var(--pf-grey-900)',
              margin: 0,
              marginBottom: '4px',
            }}
          >
            {title}
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', margin: 0 }}>{subtitle}</p>
        </div>
      </div>
      <div
        style={{
          fontSize: '0.9375rem',
          color: 'var(--pf-grey-900)',
          lineHeight: 1.6,
        }}
      >
        {body}
      </div>
    </div>
  )
}

function HelpCard({
  number,
  title,
  body,
}: {
  number: string
  title: string
  body: string
}) {
  return (
    <div
      className="rounded-lg"
      style={{
        padding: '24px',
        backgroundColor: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <div
        className="rounded-full flex items-center justify-center mb-4"
        style={{
          width: '40px',
          height: '40px',
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          color: 'var(--pf-amber-500)',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '1.125rem',
        }}
      >
        {number}
      </div>
      <h3
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '1.125rem',
          color: '#fff',
          margin: 0,
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '0.9375rem',
          color: 'rgba(255,255,255,0.75)',
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {body}
      </p>
    </div>
  )
}

function UniversityWaCard({ uni }: { uni: University }) {
  const typeKey = (uni.university_type ?? uni.type) as
    | keyof typeof UNIVERSITY_TYPES
    | null
  const typeInfo = typeKey ? UNIVERSITY_TYPES[typeKey] ?? null : null

  // One-liner summaries — prefer the new columns, fall back to legacy info.
  const legacyInfo = uni.widening_access_info as UniversityWideningInfo | null
  const programmeName =
    uni.wa_programme_name ?? legacyInfo?.programme_name ?? legacyInfo?.programme_short ?? null

  const gradeLine = uni.wa_grade_reduction
    ? truncate(uni.wa_grade_reduction, 140)
    : null

  const careLine = uni.care_experienced_guarantee
    ? truncate(uni.care_experienced_guarantee, 140)
    : null

  return (
    <Link
      href={`/universities/${uni.id}`}
      className="pf-card-hover no-underline hover:no-underline"
      style={{
        padding: '20px',
        color: 'var(--pf-grey-900)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '1.0625rem',
              color: 'var(--pf-grey-900)',
              margin: 0,
            }}
          >
            {uni.name}
          </h4>
          {uni.city && (
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--pf-grey-600)',
                margin: 0,
                marginTop: '2px',
              }}
            >
              {uni.city}
            </p>
          )}
        </div>
        {typeInfo && (
          <span
            className="pf-badge pf-badge-grey"
            style={{ flexShrink: 0, fontWeight: 600 }}
          >
            {typeInfo.label}
          </span>
        )}
      </div>

      {programmeName && (
        <p
          style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--pf-blue-700)',
            margin: 0,
          }}
        >
          {programmeName}
        </p>
      )}

      {gradeLine && (
        <div
          style={{
            fontSize: '0.8125rem',
            color: 'var(--pf-grey-900)',
            lineHeight: 1.5,
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: 'var(--pf-amber-500)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontSize: '0.6875rem',
              display: 'block',
              marginBottom: '2px',
            }}
          >
            Grade reduction
          </span>
          {gradeLine}
        </div>
      )}

      {careLine && (
        <div
          style={{
            fontSize: '0.8125rem',
            color: 'var(--pf-grey-900)',
            lineHeight: 1.5,
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: '#047857',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontSize: '0.6875rem',
              display: 'block',
              marginBottom: '2px',
            }}
          >
            Care experienced
          </span>
          {careLine}
        </div>
      )}

      <span
        className="inline-flex items-center gap-1 mt-1"
        style={{
          fontSize: '0.8125rem',
          color: 'var(--pf-blue-700)',
          fontWeight: 600,
        }}
      >
        View full details
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  )
}

function GatewayMedicineCard({
  course,
}: {
  course: Course & { university: University }
}) {
  const entry = course.entry_requirements as
    | { highers?: string; notes?: string }
    | null
  return (
    <Link
      href={`/courses/${course.id}`}
      className="pf-card-hover no-underline hover:no-underline"
      style={{
        padding: '24px',
        color: 'var(--pf-grey-900)',
        borderLeft: '4px solid var(--pf-green-500)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <div>
        <p
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#047857',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            margin: 0,
            marginBottom: '4px',
          }}
        >
          {course.university.name}
        </p>
        <h3
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '1.125rem',
            color: 'var(--pf-grey-900)',
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {course.name}
        </h3>
      </div>

      {entry?.highers && (
        <div className="flex items-center gap-2">
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--pf-grey-600)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Entry
          </span>
          <span
            className="pf-data-number"
            style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: 'var(--pf-green-500)',
            }}
          >
            {entry.highers}
          </span>
          {entry.notes && /no\s+ucat/i.test(entry.notes) && (
            <span className="pf-badge-green" style={{ fontWeight: 600 }}>
              No UCAT required
            </span>
          )}
        </div>
      )}

      {course.description && (
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--pf-grey-600)',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {truncate(course.description, 220)}
        </p>
      )}

      <span
        className="inline-flex items-center gap-1 mt-1"
        style={{
          fontSize: '0.8125rem',
          color: 'var(--pf-blue-700)',
          fontWeight: 600,
        }}
      >
        View course details
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  )
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  const trimmed = text.slice(0, max)
  const lastSpace = trimmed.lastIndexOf(' ')
  return `${trimmed.slice(0, lastSpace > 0 ? lastSpace : max)}…`
}
