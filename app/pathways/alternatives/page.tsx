import type { Metadata } from 'next'
import Link from 'next/link'
import { LiveArticulationTable } from '@/components/colleges/live-articulation-table'

export const metadata: Metadata = {
  title:
    'Alternative Pathways | Foundation Apprenticeships, College, and More | Pathfinder Scotland',
  description:
    'Explore non-university routes in Scotland — Foundation Apprenticeships, college HNC/HND with articulation, Modern Apprenticeships, and Graduate Apprenticeships. Earn while you learn or take a different route to a degree.',
  alternates: { canonical: '/pathways/alternatives' },
  openGraph: {
    title: 'Alternative Pathways | Pathfinder Scotland',
    description:
      'Foundation Apprenticeships, college routes, Modern Apprenticeships, and Graduate Apprenticeships — Scotland offers more ways to build a career than you might think.',
    url: '/pathways/alternatives',
    type: 'website',
  },
}

type Framework = {
  name: string
  scqfLevel: number
  delivery: string
  sectors: string
  complements: string
}

const FOUNDATION_FRAMEWORKS: Framework[] = [
  {
    name: 'Accountancy',
    scqfLevel: 6,
    delivery: 'Delivered through local college partnerships',
    sectors: 'Business and Finance',
    complements: 'Higher Maths, Higher Business Management',
  },
  {
    name: 'Business Skills',
    scqfLevel: 6,
    delivery: 'Delivered through local college partnerships',
    sectors: 'Business and Finance',
    complements: 'Higher Business Management, Higher English',
  },
  {
    name: 'Civil Engineering',
    scqfLevel: 6,
    delivery: 'Delivered through local college partnerships',
    sectors: 'Construction and the Built Environment',
    complements: 'Higher Maths, Higher Physics',
  },
  {
    name: 'Creative and Digital Media — Graphic Design',
    scqfLevel: 6,
    delivery: 'Delivered through local college partnerships',
    sectors: 'Creative Industries',
    complements: 'Higher Art and Design, Higher Graphic Communication',
  },
  {
    name: 'Creative and Digital Media — Media Music and Sound Production',
    scqfLevel: 6,
    delivery: 'Delivered through local college partnerships',
    sectors: 'Creative Industries',
    complements: 'Higher Music, Higher Music Technology',
  },
  {
    name: 'Engineering',
    scqfLevel: 6,
    delivery: 'Delivered through local college partnerships',
    sectors: 'Engineering',
    complements: 'Higher Maths, Higher Physics',
  },
  {
    name: 'Financial Services',
    scqfLevel: 6,
    delivery: 'Delivered through local college partnerships',
    sectors: 'Business and Finance',
    complements: 'Higher Maths, Higher Business Management',
  },
  {
    name: 'Food and Drink Technologies',
    scqfLevel: 6,
    delivery: 'Delivered through local college partnerships',
    sectors: 'Food and Drink, Hospitality',
    complements: 'Higher Chemistry, Higher Biology',
  },
  {
    name: 'Hardware and System Support',
    scqfLevel: 6,
    delivery: 'Delivered through local college partnerships',
    sectors: 'Digital and IT',
    complements: 'Higher Computing Science, Higher Maths',
  },
  {
    name: 'IT Software Development',
    scqfLevel: 6,
    delivery: 'Delivered through local college partnerships',
    sectors: 'Digital and IT',
    complements: 'Higher Computing Science, Higher Maths',
  },
  {
    name: 'Scientific Technologies',
    scqfLevel: 6,
    delivery: 'Delivered through local college partnerships',
    sectors: 'Sciences, Healthcare',
    complements: 'Higher Chemistry, Higher Biology, Higher Physics',
  },
  {
    name: 'Social Services: Children and Young People',
    scqfLevel: 6,
    delivery: 'Delivered through local college partnerships',
    sectors: 'Education, Social Care',
    complements: 'Higher English, Higher Psychology',
  },
  {
    name: 'Social Services and Healthcare',
    scqfLevel: 6,
    delivery: 'Delivered through local college partnerships',
    sectors: 'Healthcare, Social Care',
    complements: 'Higher Biology, Higher Psychology',
  },
]

type MaSector = {
  sector: string
  frameworks: string[]
}

const MA_SECTORS: MaSector[] = [
  {
    sector: 'Healthcare',
    frameworks: ['Healthcare Support', 'Dental Nursing', 'Pharmacy Services'],
  },
  {
    sector: 'Engineering',
    frameworks: ['Engineering (mechanical, electrical, fabrication)', 'Automotive'],
  },
  {
    sector: 'Construction',
    frameworks: ['Plumbing', 'Electrical Installation', 'Joinery', 'Painting and Decorating'],
  },
  {
    sector: 'Digital and IT',
    frameworks: ['IT and Telecoms', 'Data Analytics', 'Cyber Security'],
  },
  {
    sector: 'Business',
    frameworks: ['Accounting', 'Business Administration', 'Customer Service'],
  },
  {
    sector: 'Hospitality',
    frameworks: ['Professional Cookery', 'Hospitality Management'],
  },
  {
    sector: 'Land-based',
    frameworks: ['Agriculture', 'Horticulture', 'Game and Wildlife Management'],
  },
  {
    sector: 'Creative',
    frameworks: ['Creative and Digital Media', 'Game Development'],
  },
]

const GA_FRAMEWORKS: string[] = [
  'Accounting',
  'Business Management',
  'Civil Engineering',
  'Construction and the Built Environment',
  'Cyber Security',
  'Data Science (Data, AI and Software Engineering at UWS)',
  'Early Learning and Childhood',
  'Engineering: Design and Manufacture',
  'Engineering: Instrumentation, Measurement and Control',
  'IT: Management for Business',
  'IT: Software Development',
]

const GA_UNIVERSITIES: Array<{ name: string; url: string }> = [
  { name: 'Edinburgh Napier University', url: 'https://www.napier.ac.uk/courses/graduate-apprenticeships' },
  { name: 'Glasgow Caledonian University', url: 'https://www.gcu.ac.uk/study/graduateapprenticeships' },
  { name: 'Robert Gordon University', url: 'https://www.rgu.ac.uk/study/graduate-apprenticeships' },
  { name: 'University of Strathclyde', url: 'https://www.strath.ac.uk/studywithus/graduateapprenticeships/' },
  { name: 'Heriot-Watt University', url: 'https://www.hw.ac.uk/study/graduate-apprenticeships.htm' },
  { name: 'University of the West of Scotland', url: 'https://www.uws.ac.uk/study/graduate-apprenticeships/' },
  { name: 'University of Stirling', url: 'https://www.stir.ac.uk/courses/graduate-apprenticeships/' },
  { name: 'University of Aberdeen', url: 'https://www.abdn.ac.uk/study/undergraduate/graduate-apprenticeships' },
  { name: 'Edinburgh College (delivery partner)', url: 'https://www.edinburghcollege.ac.uk' },
]

type ComparisonRow = {
  label: string
  fa: string
  college: string
  ma: string
  ga: string
  uni: string
}

const COMPARISON: ComparisonRow[] = [
  {
    label: 'Age',
    fa: 'S5/S6 (15–18)',
    college: '16+',
    ma: '16+',
    ga: '18+',
    uni: '17+',
  },
  {
    label: 'Duration',
    fa: '2 years (alongside school)',
    college: '1–2 years',
    ma: '1–4 years',
    ga: '3–4 years',
    uni: '4 years',
  },
  {
    label: 'Qualification',
    fa: 'SCQF 6 (= Higher)',
    college: 'SCQF 7–8 (HNC/HND)',
    ma: 'SVQ + certificate',
    ga: 'Full degree (SCQF 9–10)',
    uni: 'Full degree (SCQF 9–10)',
  },
  {
    label: 'Cost to you',
    fa: 'Free',
    college: 'Free (SAAS funded)',
    ma: 'Free (employer pays)',
    ga: 'Free (employer pays)',
    uni: 'Free tuition (SAAS) + living costs',
  },
  {
    label: 'Earning',
    fa: 'No',
    college: 'Possible part-time',
    ma: 'Yes — full wage',
    ga: 'Yes — full wage',
    uni: 'Possible part-time',
  },
  {
    label: 'University entry',
    fa: 'Counts as a Higher',
    college: 'Articulation to year 2/3',
    ma: 'Can lead to GA',
    ga: 'IS a degree',
    uni: 'Direct',
  },
]

export default function AlternativesPage() {
  return (
    <div style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      <Hero />
      <PathwaySelector />
      <FoundationSection />
      <CollegeSection />
      <ModernSection />
      <GraduateSection />
      <ComparisonSection />
      <ClosingCta />
    </div>
  )
}

function Hero() {
  return (
    <section
      style={{
        backgroundColor: 'var(--pf-blue-50)',
        paddingTop: '56px',
        paddingBottom: '40px',
      }}
    >
      <div className="pf-container">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <span className="pf-badge-blue inline-flex" style={{ marginBottom: '20px' }}>
              Alternative pathways
            </span>
            <h1
              style={{
                fontSize: 'clamp(2rem, 5vw, 2.75rem)',
                lineHeight: 1.15,
                marginBottom: '16px',
                color: 'var(--pf-grey-900)',
              }}
            >
              University isn&apos;t the only path
            </h1>
            <p
              style={{
                fontSize: '1.0625rem',
                color: 'var(--pf-grey-600)',
                lineHeight: 1.6,
                marginBottom: '28px',
                maxWidth: '600px',
              }}
            >
              Foundation Apprenticeships, college courses, Modern Apprenticeships, and Graduate
              Apprenticeships — Scotland offers more ways to build a career than you might think.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#pathway-selector" className="pf-btn-primary">
                Find your pathway
              </a>
              <a href="#comparison" className="pf-btn-secondary">
                Compare options
              </a>
            </div>
          </div>
          <HeroIllustration />
        </div>
      </div>
    </section>
  )
}

function HeroIllustration() {
  const items: Array<{ label: string; tone: string }> = [
    { label: 'Foundation Apprenticeship', tone: 'var(--pf-blue-700)' },
    { label: 'College HNC / HND', tone: 'var(--pf-area-sciences)' },
    { label: 'Modern Apprenticeship', tone: 'var(--pf-amber-500)' },
    { label: 'Graduate Apprenticeship', tone: 'var(--pf-area-expressive)' },
  ]
  return (
    <div
      aria-hidden="true"
      style={{
        width: '100%',
        maxWidth: '340px',
        margin: '0 auto',
        backgroundColor: 'var(--pf-white)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 16px rgba(0, 45, 114, 0.1)',
      }}
    >
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.75rem',
          color: 'var(--pf-blue-700)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '12px',
        }}
      >
        Four ways forward
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((item, idx) => (
          <li
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 0',
              borderBottom: idx < items.length - 1 ? '1px solid var(--pf-grey-100)' : 'none',
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '9999px',
                backgroundColor: item.tone,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.875rem',
                color: 'var(--pf-grey-900)',
              }}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

type PathwayCardData = {
  href: string
  title: string
  body: string
  cta: string
  icon: React.ReactNode
}

function PathwaySelector() {
  const cards: PathwayCardData[] = [
    {
      href: '#foundation-apprenticeships',
      title: 'Foundation Apprenticeships',
      body: 'Study at school and college. Equivalent to a Higher. Available in S5/S6.',
      cta: 'Explore Foundation Apprenticeships',
      icon: <IconBriefcaseGrad />,
    },
    {
      href: '#college-routes',
      title: 'College Courses (HNC/HND)',
      body: 'Study full-time or part-time at college. Can articulate into university year 2 or 3.',
      cta: 'Explore college routes',
      icon: <IconBuilding />,
    },
    {
      href: '#modern-apprenticeships',
      title: 'Modern Apprenticeships',
      body: 'Earn while you learn. Paid employment with structured training.',
      cta: 'Explore Modern Apprenticeships',
      icon: <IconTools />,
    },
    {
      href: '#graduate-apprenticeships',
      title: 'Graduate Apprenticeships',
      body: 'Work and earn a full degree. Funded by your employer.',
      cta: 'Explore Graduate Apprenticeships',
      icon: <IconGradBrief />,
    },
  ]

  return (
    <section
      id="pathway-selector"
      style={{
        backgroundColor: 'var(--pf-white)',
        paddingTop: '56px',
        paddingBottom: '56px',
        scrollMarginTop: '80px',
      }}
    >
      <div className="pf-container">
        <div style={{ maxWidth: '720px', marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '8px' }}>Pick a pathway to explore</h2>
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '1rem' }}>
            Each route below leads somewhere different. Some lead straight into work, others
            articulate into a degree, and some give you both at once.
          </p>
        </div>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}
        >
          {cards.map((card) => (
            <a
              key={card.href}
              href={card.href}
              className="pf-card-hover no-underline hover:no-underline"
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '24px',
                borderTop: '3px solid var(--pf-blue-700)',
                color: 'var(--pf-grey-900)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--pf-blue-100)',
                  color: 'var(--pf-blue-700)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}
              >
                {card.icon}
              </div>
              <h3
                style={{
                  fontSize: '1.0625rem',
                  marginBottom: '8px',
                  color: 'var(--pf-grey-900)',
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--pf-grey-600)',
                  margin: 0,
                  marginBottom: '14px',
                  flex: 1,
                }}
              >
                {card.body}
              </p>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'var(--pf-blue-700)',
                }}
              >
                {card.cta} →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function FoundationSection() {
  return (
    <section
      id="foundation-apprenticeships"
      style={{
        backgroundColor: 'var(--pf-grey-100)',
        paddingTop: '64px',
        paddingBottom: '64px',
        scrollMarginTop: '80px',
      }}
    >
      <div className="pf-container">
        <SectionHeader
          eyebrow="Section A"
          title="Foundation Apprenticeships"
          intro="An SCQF Level 6 qualification — equivalent to a Higher — studied in S5 and S6 alongside your school subjects."
        />

        <SubSection title="What is a Foundation Apprenticeship?">
          <ul className="space-y-2" style={bulletListStyle}>
            <li>SCQF Level 6 qualification — equivalent to a Higher.</li>
            <li>Studied in S5 and S6 over two years.</li>
            <li>Combines classroom learning with real workplace experience.</li>
            <li>
              Typically delivered at college on Tuesday and Thursday afternoons alongside school
              subjects.
            </li>
            <li>Counts as one of your 5 S5 subject choices (some count as 2).</li>
            <li>Accepted by all Scottish universities as equivalent to a Higher.</li>
          </ul>
        </SubSection>

        <SubSection title="Available frameworks">
          <p style={subsectionLeadStyle}>
            Frameworks are SCQF Level 6 unless stated. Specific frameworks may not run every
            year — check with your school or local college.
          </p>
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
          >
            {FOUNDATION_FRAMEWORKS.map((f) => (
              <div
                key={f.name}
                className="pf-card-flat"
                style={{ padding: '20px', borderTop: '3px solid var(--pf-blue-700)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="pf-badge-blue">SCQF {f.scqfLevel}</span>
                </div>
                <h4
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: 'var(--pf-grey-900)',
                    margin: '4px 0 8px',
                    lineHeight: 1.3,
                  }}
                >
                  {f.name}
                </h4>
                <DetailRow label="Delivery" value={f.delivery} />
                <DetailRow label="Career sectors" value={f.sectors} />
                <DetailRow label="Pairs well with" value={f.complements} />
                <Link
                  href={`/careers?search=${encodeURIComponent(f.sectors.split(',')[0].trim())}`}
                  style={{
                    display: 'inline-block',
                    marginTop: '10px',
                    fontSize: '0.8125rem',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    color: 'var(--pf-blue-700)',
                  }}
                >
                  Browse related careers →
                </Link>
              </div>
            ))}
          </div>
        </SubSection>

        <SubSection title="How to apply">
          <ul className="space-y-2" style={bulletListStyle}>
            <li>Speak to your school&apos;s Pupil Support Leader or careers adviser.</li>
            <li>
              Foundation Apprenticeships are listed as subject choices alongside Highers — you
              pick one in the same way.
            </li>
            <li>Places may be limited — register interest early.</li>
            <li>
              <ExternalLink
                href="https://www.apprenticeships.scot/become-an-apprentice/foundation-apprenticeships/"
                label="Full details on apprenticeships.scot"
              />
            </li>
          </ul>
        </SubSection>

        <CalloutBox
          title="New Level 4/5 Foundation Apprenticeships (pilots)"
          body="Emerging pilots in Automotive, Construction, and Hospitality are available at some schools. Ask your guidance teacher whether your school offers any of the new Level 4 or 5 frameworks."
          tone="amber"
        />
      </div>
    </section>
  )
}

function CollegeSection() {
  return (
    <section
      id="college-routes"
      style={{
        backgroundColor: 'var(--pf-white)',
        paddingTop: '64px',
        paddingBottom: '64px',
        scrollMarginTop: '80px',
      }}
    >
      <div className="pf-container">
        <SectionHeader
          eyebrow="Section B"
          title="College courses and articulation"
          intro="Start at college, then transfer (articulate) into year 2 or 3 of a university degree. You still graduate — you just take a different route."
        />

        <SubSection title="What is the college route?">
          <ul className="space-y-2" style={bulletListStyle}>
            <li>Study an HNC (1 year) or HND (2 years) at college.</li>
            <li>Then articulate (transfer) into university year 2 or 3.</li>
            <li>You still get a full degree — you just start at college.</li>
            <li>Often smaller class sizes, more practical learning, lower entry requirements.</li>
            <li>
              <strong>The Hidden Path</strong> — many students don&apos;t know this route exists.
            </li>
          </ul>
        </SubSection>

        <SubSection title="Why consider the college route?">
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}
          >
            <BenefitCard
              title="Lower entry grades"
              body="Entry grades are typically lower than direct university entry."
            />
            <BenefitCard
              title="Practical learning"
              body="More hands-on teaching with smaller classes and closer support."
            />
            <BenefitCard
              title="Stay local"
              body="Most Scottish towns have a college, so you can stay at home if you want to."
            />
            <BenefitCard
              title="No tuition fees"
              body="SAAS-funded the same as university for eligible Scottish students."
            />
            <BenefitCard
              title="Real qualification"
              body="You earn an HNC or HND even if you decide not to continue to university."
            />
            <BenefitCard
              title="Articulation built in"
              body="Many courses have agreed routes into year 2 or 3 of a Scottish degree."
            />
          </div>
        </SubSection>

        <SubSection title="Articulation examples">
          <p style={subsectionLeadStyle}>
            Real college-to-university routes from our database. Articulation agreements vary by
            college and university, so always confirm the current arrangement with both
            institutions.
          </p>
          <LiveArticulationTable />
        </SubSection>

        <SubSection title="Edinburgh College School Partnership">
          <div
            className="pf-card-flat"
            style={{ padding: '24px', borderLeft: '4px solid var(--pf-blue-700)' }}
          >
            <ul className="space-y-2" style={bulletListStyle}>
              <li>
                For S4–S6 students — attend college part-time alongside school.
              </li>
              <li>Courses run on Tuesday and Thursday afternoons.</li>
              <li>
                40+ courses available spanning SCQF Levels 3–7, including Creative and Media,
                Computing and Digital, Engineering and Construction, Health and Care, Hospitality,
                and Languages.
              </li>
            </ul>
            <ExternalLink
              href="https://www.edinburghcollege.ac.uk/courses/school-college-partnership"
              label="Edinburgh College school partnership"
            />
          </div>
        </SubSection>

        <SubSection title="Other Scottish colleges">
          <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', marginBottom: '12px' }}>
            Similar partnerships exist across Scotland. To find your nearest college and the
            courses they offer:
          </p>
          <ExternalLink
            href="https://collegesscotland.ac.uk"
            label="Find a college on collegesscotland.ac.uk"
          />
        </SubSection>
      </div>
    </section>
  )
}

function ModernSection() {
  return (
    <section
      id="modern-apprenticeships"
      style={{
        backgroundColor: 'var(--pf-grey-100)',
        paddingTop: '64px',
        paddingBottom: '64px',
        scrollMarginTop: '80px',
      }}
    >
      <div className="pf-container">
        <SectionHeader
          eyebrow="Section C"
          title="Modern Apprenticeships"
          intro="Paid employment with structured training. You earn a wage while gaining a recognised qualification — and your employer pays for the training."
        />

        <SubSection title="What is a Modern Apprenticeship?">
          <ul className="space-y-2" style={bulletListStyle}>
            <li>Paid employment with structured training leading to an SVQ or equivalent.</li>
            <li>Available from age 16 (school leavers).</li>
            <li>Typically 1–4 years depending on the framework.</li>
            <li>Over 80 frameworks available across all sectors.</li>
            <li>You earn a wage while gaining a qualification.</li>
            <li>Employer pays for training — no debt.</li>
          </ul>
        </SubSection>

        <SubSection title="Available sectors">
          <p style={subsectionLeadStyle}>
            A snapshot of the most popular Modern Apprenticeship frameworks grouped by career
            sector. Each card links through to related career profiles on Pathfinder.
          </p>
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
          >
            {MA_SECTORS.map((sector) => (
              <Link
                key={sector.sector}
                href={`/careers?search=${encodeURIComponent(sector.sector)}`}
                className="pf-card-hover no-underline hover:no-underline"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '20px',
                  borderTop: '3px solid var(--pf-amber-500)',
                  color: 'var(--pf-grey-900)',
                }}
              >
                <h4
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: 'var(--pf-grey-900)',
                    marginBottom: '8px',
                  }}
                >
                  {sector.sector}
                </h4>
                <ul
                  style={{
                    listStyle: 'disc',
                    paddingLeft: '18px',
                    margin: 0,
                    fontSize: '0.875rem',
                    color: 'var(--pf-grey-600)',
                    lineHeight: 1.5,
                  }}
                >
                  {sector.frameworks.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <span
                  style={{
                    marginTop: '12px',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    color: 'var(--pf-blue-700)',
                  }}
                >
                  Browse related careers →
                </span>
              </Link>
            ))}
          </div>
        </SubSection>

        <SubSection title="How to find a Modern Apprenticeship">
          <ul className="space-y-2" style={bulletListStyle}>
            <li>
              Search vacancies on{' '}
              <ExternalLink
                inline
                href="https://www.apprenticeships.scot"
                label="apprenticeships.scot"
              />
              .
            </li>
            <li>Speak to your school&apos;s DYW (Developing the Young Workforce) coordinator.</li>
            <li>
              Contact employers directly — many advertise their own apprenticeship vacancies on
              their websites.
            </li>
          </ul>
        </SubSection>
      </div>
    </section>
  )
}

function GraduateSection() {
  return (
    <section
      id="graduate-apprenticeships"
      style={{
        backgroundColor: 'var(--pf-white)',
        paddingTop: '64px',
        paddingBottom: '64px',
        scrollMarginTop: '80px',
      }}
    >
      <div className="pf-container">
        <SectionHeader
          eyebrow="Section D"
          title="Graduate Apprenticeships"
          intro="A full honours degree, paid for by your employer. You work full-time, earn a salary, and graduate with the same qualification as a traditional university student."
        />

        <SubSection title="What is a Graduate Apprenticeship?">
          <ul className="space-y-2" style={bulletListStyle}>
            <li>Work full-time while studying for a full honours degree (SCQF Level 9/10).</li>
            <li>Your employer pays tuition — no student debt.</li>
            <li>Available in specific frameworks — typically STEM, business, and digital.</li>
            <li>Takes 3–4 years.</li>
            <li>You earn a full salary throughout.</li>
          </ul>
        </SubSection>

        <SubSection title="Available frameworks">
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
          >
            {GA_FRAMEWORKS.map((f) => (
              <div
                key={f}
                className="pf-card-flat"
                style={{
                  padding: '14px 18px',
                  borderLeft: '3px solid var(--pf-area-expressive)',
                }}
              >
                <p
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    color: 'var(--pf-grey-900)',
                    margin: 0,
                  }}
                >
                  {f}
                </p>
              </div>
            ))}
          </div>
        </SubSection>

        <SubSection title="Which universities offer them?">
          <p style={subsectionLeadStyle}>
            Most Scottish universities participate in the Graduate Apprenticeship programme.
            Specific frameworks vary by university — check the official pages below for what each
            one currently offers.
          </p>
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
          >
            {GA_UNIVERSITIES.map((uni) => (
              <a
                key={uni.name}
                href={uni.url}
                target="_blank"
                rel="noopener noreferrer"
                className="pf-card-hover no-underline hover:no-underline"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '10px',
                  padding: '16px 18px',
                  color: 'var(--pf-grey-900)',
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
                  {uni.name}
                </span>
                <ExternalIcon />
              </a>
            ))}
          </div>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--pf-grey-600)',
              marginTop: '12px',
              fontStyle: 'italic',
            }}
          >
            Provider lists change. The Skills Development Scotland page on{' '}
            <ExternalLink
              inline
              href="https://www.apprenticeships.scot/become-an-apprentice/graduate-apprenticeships/"
              label="apprenticeships.scot"
            />{' '}
            holds the current list of frameworks and providers.
          </p>
        </SubSection>

        <SubSection title="Entry requirements">
          <ul className="space-y-2" style={bulletListStyle}>
            <li>Vary by framework and university.</li>
            <li>Typically need Highers or equivalent.</li>
            <li>Some accept HNC or HND holders.</li>
            <li>
              Widening access criteria may apply — check with the university and see our{' '}
              <Link href="/widening-access" style={inlineLinkStyle}>
                widening access guide
              </Link>
              .
            </li>
          </ul>
        </SubSection>
      </div>
    </section>
  )
}

function ComparisonSection() {
  return (
    <section
      id="comparison"
      style={{
        backgroundColor: 'var(--pf-grey-100)',
        paddingTop: '64px',
        paddingBottom: '64px',
        scrollMarginTop: '80px',
      }}
    >
      <div className="pf-container">
        <SectionHeader
          eyebrow="Compare"
          title="At a glance: five pathways side by side"
          intro="A quick reference for the main differences between Foundation Apprenticeships, college, Modern Apprenticeships, Graduate Apprenticeships, and direct university entry."
        />
        <div
          style={{
            overflowX: 'auto',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            backgroundColor: 'var(--pf-white)',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
              minWidth: '880px',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: 'var(--pf-blue-50)' }}>
                <ThCell />
                <ThCell>Foundation Apprenticeship</ThCell>
                <ThCell>College (HNC/HND)</ThCell>
                <ThCell>Modern Apprenticeship</ThCell>
                <ThCell>Graduate Apprenticeship</ThCell>
                <ThCell>University (direct entry)</ThCell>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, idx) => (
                <tr
                  key={row.label}
                  style={{
                    borderTop: idx === 0 ? 'none' : '1px solid var(--pf-grey-100)',
                  }}
                >
                  <TdCell strong>{row.label}</TdCell>
                  <TdCell>{row.fa}</TdCell>
                  <TdCell>{row.college}</TdCell>
                  <TdCell>{row.ma}</TdCell>
                  <TdCell>{row.ga}</TdCell>
                  <TdCell>{row.uni}</TdCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function ClosingCta() {
  return (
    <section
      style={{
        backgroundColor: 'var(--pf-blue-900)',
        color: '#fff',
        paddingTop: '56px',
        paddingBottom: '56px',
      }}
    >
      <div className="pf-container text-center">
        <h2 style={{ color: '#fff', marginBottom: '12px' }}>
          Still weighing up your options?
        </h2>
        <p
          style={{
            color: 'rgba(255, 255, 255, 0.85)',
            maxWidth: '620px',
            margin: '0 auto 24px',
            fontSize: '1rem',
          }}
        >
          Pathfinder helps you map subjects, careers, and qualifications side by side — whether
          you&apos;re heading to university, college, or straight into work.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/pathways"
            className="no-underline hover:no-underline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '14px 28px',
              backgroundColor: '#fff',
              color: 'var(--pf-blue-900)',
              borderRadius: '8px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.9375rem',
              minHeight: '48px',
            }}
          >
            Plan your subject choices
          </Link>
          <Link
            href="/careers"
            className="no-underline hover:no-underline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '14px 28px',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              color: '#fff',
              borderRadius: '8px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.9375rem',
              minHeight: '48px',
            }}
          >
            Browse careers
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------- */
/* Shared building blocks                                             */
/* ----------------------------------------------------------------- */

function SectionHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string
  title: string
  intro: string
}) {
  return (
    <div style={{ maxWidth: '760px', marginBottom: '32px' }}>
      <span
        style={{
          display: 'inline-block',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.75rem',
          color: 'var(--pf-blue-700)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '8px',
        }}
      >
        {eyebrow}
      </span>
      <h2 style={{ marginBottom: '10px' }}>{title}</h2>
      <p style={{ color: 'var(--pf-grey-600)', fontSize: '1rem', lineHeight: 1.6 }}>{intro}</p>
    </div>
  )
}

function SubSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '36px' }}>
      <h3 style={{ marginBottom: '12px' }}>{title}</h3>
      {children}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', margin: '4px 0' }}>
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          color: 'var(--pf-grey-900)',
        }}
      >
        {label}:
      </span>{' '}
      {value}
    </p>
  )
}

function BenefitCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="pf-card-flat" style={{ padding: '20px' }}>
      <h4
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '1rem',
          color: 'var(--pf-grey-900)',
          marginBottom: '6px',
        }}
      >
        {title}
      </h4>
      <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', margin: 0, lineHeight: 1.5 }}>
        {body}
      </p>
    </div>
  )
}

function CalloutBox({
  title,
  body,
  tone,
}: {
  title: string
  body: string
  tone: 'amber' | 'blue'
}) {
  const palette =
    tone === 'amber'
      ? { bg: 'rgba(245, 158, 11, 0.08)', border: 'var(--pf-amber-500)' }
      : { bg: 'var(--pf-blue-50)', border: 'var(--pf-blue-700)' }

  return (
    <div
      style={{
        padding: '20px 24px',
        borderRadius: '8px',
        backgroundColor: palette.bg,
        borderLeft: `4px solid ${palette.border}`,
        maxWidth: '760px',
      }}
    >
      <h4
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '1rem',
          color: 'var(--pf-grey-900)',
          marginBottom: '6px',
        }}
      >
        {title}
      </h4>
      <p style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-600)', margin: 0, lineHeight: 1.6 }}>
        {body}
      </p>
    </div>
  )
}

function ExternalLink({
  href,
  label,
  inline = false,
}: {
  href: string
  label: string
  inline?: boolean
}) {
  if (inline) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: 'var(--pf-blue-700)',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          textDecoration: 'underline',
          textUnderlineOffset: '2px',
        }}
      >
        {label}
      </a>
    )
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1"
      style={{
        marginTop: '12px',
        color: 'var(--pf-blue-700)',
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 600,
        fontSize: '0.9375rem',
      }}
    >
      {label}
      <ExternalIcon />
    </a>
  )
}

function ExternalIcon() {
  return (
    <svg
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ color: 'var(--pf-blue-500)', flexShrink: 0 }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  )
}

function ThCell({ children }: { children?: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: 'left',
        padding: '14px 16px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 600,
        fontSize: '0.8125rem',
        color: 'var(--pf-grey-900)',
        borderBottom: '1px solid var(--pf-grey-300)',
      }}
    >
      {children}
    </th>
  )
}

function TdCell({
  children,
  strong = false,
}: {
  children: React.ReactNode
  strong?: boolean
}) {
  return (
    <td
      style={{
        padding: '14px 16px',
        verticalAlign: 'top',
        color: 'var(--pf-grey-900)',
        fontFamily: strong ? "'Space Grotesk', sans-serif" : "'Inter', sans-serif",
        fontWeight: strong ? 600 : 400,
      }}
    >
      {children}
    </td>
  )
}

const bulletListStyle: React.CSSProperties = {
  listStyle: 'disc',
  paddingLeft: '20px',
  color: 'var(--pf-grey-900)',
  fontSize: '0.9375rem',
  lineHeight: 1.6,
}

const subsectionLeadStyle: React.CSSProperties = {
  color: 'var(--pf-grey-600)',
  fontSize: '0.9375rem',
  marginBottom: '16px',
  maxWidth: '760px',
}

const inlineLinkStyle: React.CSSProperties = {
  color: 'var(--pf-blue-700)',
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 600,
}

/* ----------------------------------------------------------------- */
/* Inline icons                                                       */
/* ----------------------------------------------------------------- */

function IconBriefcaseGrad() {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l9 4 9-4-9-4-9 4z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 9v3c0 1.5 3 3 7 3s7-1.5 7-3V9"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7v6" />
    </svg>
  )
}

function IconBuilding() {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21h16M5 21V7l7-4 7 4v14" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01" />
    </svg>
  )
}

function IconTools() {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
      />
    </svg>
  )
}

function IconGradBrief() {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M22 10v6M2 10l10-5 10 5-10 5z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 12v5c3 3 9 3 12 0v-5"
      />
    </svg>
  )
}
