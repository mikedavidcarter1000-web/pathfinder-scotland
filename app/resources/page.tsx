'use client'

import { useMemo, useState } from 'react'

type ResourceLink = {
  name: string
  url: string
  description: string
}

type ResourceSection = {
  title: string
  blurb: string
  links: ResourceLink[]
}

const SECTIONS: ResourceSection[] = [
  {
    title: 'Official Guidance',
    blurb:
      'The core bodies that set Scottish qualifications, careers advice, and school policy. Always worth starting here.',
    links: [
      {
        name: 'Qualifications Scotland',
        url: 'https://www.sqa.org.uk',
        description: "Scotland's qualifications authority — course information, past papers, results.",
      },
      {
        name: 'Education Scotland',
        url: 'https://education.gov.scot',
        description: 'National body for curriculum and school improvement.',
      },
      {
        name: 'Skills Development Scotland',
        url: 'https://www.skillsdevelopmentscotland.co.uk',
        description: "Scotland's national skills agency.",
      },
      {
        name: 'My World of Work',
        url: 'https://www.myworldofwork.co.uk',
        description: "Scotland's official careers information and advice service.",
      },
      {
        name: 'UCAS',
        url: 'https://www.ucas.com',
        description: 'University and college admissions service for the UK.',
      },
      {
        name: 'Informed Choices',
        url: 'https://www.informedchoices.ac.uk',
        description: 'Russell Group guide to post-16 subject choices.',
      },
      {
        name: 'Parentzone Scotland',
        url: 'https://education.gov.scot/parentzone/',
        description: "Education Scotland's resource for parents.",
      },
    ],
  },
  {
    title: 'Funding & Financial Support',
    blurb:
      'Tuition, bursaries, scholarships, and discounts. Your first stop when working out how to pay for university or training.',
    links: [
      {
        name: 'SAAS',
        url: 'https://www.saas.gov.uk',
        description: 'Student Awards Agency for Scotland — tuition and bursary funding.',
      },
      {
        name: 'The Scholarship Hub',
        url: 'https://www.thescholarshiphub.org.uk',
        description: 'Search UK scholarships and bursaries.',
      },
      {
        name: 'Carnegie Trust',
        url: 'https://www.carnegie-trust.org',
        description: 'Scottish scholarships and educational grants.',
      },
      {
        name: 'Young Scot',
        url: 'https://young.scot',
        description: 'National youth information — discounts, opportunities, rewards.',
      },
      {
        name: 'The Robertson Trust',
        url: 'https://www.therobertsontrust.org.uk',
        description: "Scotland's largest independent funder — scholarships and transition grants.",
      },
    ],
  },
  {
    title: 'Widening Access Programmes',
    blurb:
      'Regional and national programmes that support students from under-represented backgrounds into higher education.',
    links: [
      {
        name: 'LEAPS',
        url: 'https://www.leapsonline.org',
        description: 'Lothian Equal Access Programme for Schools — Edinburgh and SE Scotland.',
      },
      {
        name: 'FOCUS West',
        url: 'https://www.focuswest.org.uk',
        description: 'Widening access programme for West of Scotland.',
      },
      {
        name: 'REACH',
        url: 'https://www.abdn.ac.uk/reach',
        description: "University of Aberdeen's schools engagement programme.",
      },
      {
        name: 'LIFT OFF',
        url: 'https://www.dundee.ac.uk/widening-access',
        description: "University of Dundee's widening access programme.",
      },
      {
        name: 'Who Cares? Scotland',
        url: 'https://www.whocaresscotland.org',
        description: 'Advocacy and support for care experienced young people.',
      },
      {
        name: 'Carers Trust Scotland',
        url: 'https://carers.org/about-us/about-carers-trust-scotland',
        description: 'Support and resources for young carers.',
      },
    ],
  },
  {
    title: 'Young Carers',
    blurb:
      'Support, advice, and financial help for young people with caring responsibilities.',
    links: [
      {
        name: 'Carers Trust Scotland',
        url: 'https://www.carers.org',
        description: 'National carer support and advice.',
      },
      {
        name: 'Coalition of Carers in Scotland',
        url: 'https://www.carersnet.org',
        description: 'Local group signposting for carers across Scotland.',
      },
      {
        name: 'Social Security Scotland \u2014 Young Carer Grant',
        url: 'https://www.mygov.scot/young-carer-grant',
        description: 'Apply for the Young Carer Grant (\u00a3405.10/year for eligible young carers).',
      },
    ],
  },
  {
    title: 'Estranged Students',
    blurb:
      'Guidance and bursary support for students who are permanently estranged from their parents or family.',
    links: [
      {
        name: 'Stand Alone',
        url: 'https://www.standalonecharity.org',
        description: 'UK charity for estranged students; bursary finder and peer support.',
      },
      {
        name: 'SAAS \u2014 Estranged Students',
        url: 'https://www.saas.gov.uk',
        description: 'SAAS estranged student guidance and independent student assessment.',
      },
    ],
  },
  {
    title: 'Young Parents',
    blurb:
      'Financial support and practical advice for students who are parents or lone parents.',
    links: [
      {
        name: 'One Parent Families Scotland',
        url: 'https://www.opfs.org.uk',
        description: 'Lone parent advice, helpline, and support services in Scotland.',
      },
      {
        name: 'Social Security Scotland',
        url: 'https://www.socialsecurity.gov.scot',
        description: 'Best Start Grant, Scottish Child Payment, and other family payments.',
      },
    ],
  },
  {
    title: 'Disability Support',
    blurb:
      'Assistive technology, DSA guidance, and transition funding for disabled students.',
    links: [
      {
        name: 'CALL Scotland',
        url: 'https://www.callscotland.org.uk',
        description: 'Assistive technology advice and free equipment loan for Scottish students.',
      },
      {
        name: 'Lead Scotland',
        url: 'https://www.lead.org.uk',
        description: 'DSA guidance and supported distance learning for disabled students.',
      },
      {
        name: 'ILF Scotland Transition Fund',
        url: 'https://www.ilf.scot/transition-fund',
        description: 'Transition Fund for disabled young people aged 15\u201325 moving into adult life.',
      },
    ],
  },
  {
    title: 'LGBTQ+ Students',
    blurb:
      'Support, wellbeing, and academic resources for LGBTQ+ young people in Scotland.',
    links: [
      {
        name: 'LGBT Youth Scotland',
        url: 'https://www.lgbtyouth.org.uk',
        description: 'Support for LGBTQ+ young people aged 13\u201325 across Scotland.',
      },
      {
        name: 'LGBT Health and Wellbeing',
        url: 'https://www.lgbthealth.org.uk',
        description: 'Wellbeing services and counselling for LGBTQ+ people aged 16+.',
      },
      {
        name: 'TransEDU Scotland',
        url: 'https://www.trans.ac.uk',
        description: 'Resources on trans and non-binary inclusion in HE and FE.',
      },
    ],
  },
  {
    title: 'Refugees and Asylum Seekers',
    blurb:
      'Specialist support and university preparation programmes for refugees and asylum seekers in Scotland.',
    links: [
      {
        name: 'Scottish Refugee Council',
        url: 'https://www.scottishrefugeecouncil.org.uk',
        description: 'Specialist advice and advocacy for refugees and asylum seekers.',
      },
      {
        name: 'Bridges Programmes',
        url: 'https://www.bridgesprogrammes.org.uk',
        description: 'University preparation for refugees in Edinburgh.',
      },
      {
        name: 'BEMIS Scotland',
        url: 'https://www.bemis.org.uk',
        description: 'Ethnic minority and New Scots support, including education pathways.',
      },
      {
        name: 'Universities Scotland Sanctuary',
        url: 'https://www.universities-scotland.ac.uk',
        description: 'Scottish Sanctuary Scholarships and guidance for displaced students.',
      },
    ],
  },
  {
    title: 'Gypsy, Roma and Traveller Students',
    blurb:
      'Education support and advocacy for Gypsy, Roma and Traveller young people.',
    links: [
      {
        name: 'STEP',
        url: 'https://step.education.ed.ac.uk',
        description: 'GRT education support programme at the University of Edinburgh.',
      },
      {
        name: 'Friends, Families and Travellers',
        url: 'https://www.gypsy-traveller.org',
        description: 'UK-wide GRT advice and advocacy organisation.',
      },
      {
        name: 'Romano Lav',
        url: 'https://www.romanolav.org',
        description: 'Roma-led Glasgow charity supporting Roma community members.',
      },
      {
        name: 'Article 12 in Scotland',
        url: 'https://www.article12.org',
        description: 'Rights-based work with Gypsy, Roma and Traveller young people.',
      },
    ],
  },
  {
    title: 'Mature Students and Alternative Entry',
    blurb:
      'Access courses and alternative pathways into higher education for adult learners and those returning to study.',
    links: [
      {
        name: 'SWAP',
        url: 'https://www.swap.ac.uk',
        description: 'Scottish Wider Access Programme \u2014 access courses with guaranteed university places.',
      },
      {
        name: 'NowrongPath',
        url: 'https://www.nowrongpath.scot',
        description: 'Alternative entry routes into Scottish universities and colleges.',
      },
    ],
  },
  {
    title: 'Rural and Island Learning',
    blurb:
      'Universities and distance learning providers designed for students in Highland, Island, and rural Scotland.',
    links: [
      {
        name: 'UHI \u2014 University of the Highlands and Islands',
        url: 'https://www.uhi.ac.uk',
        description: 'The university designed for Highland and Island students \u2014 campus and online.',
      },
      {
        name: 'Open University Scotland',
        url: 'https://www.open.ac.uk/scotland',
        description: 'Flexible distance learning with SAAS funding available for Scottish students.',
      },
    ],
  },
  {
    title: 'Apprenticeships & Work-Based Learning',
    blurb:
      "University isn't the only way. Scotland funds Foundation, Modern, and Graduate Apprenticeships alongside a strong college route.",
    links: [
      {
        name: 'apprenticeships.scot',
        url: 'https://www.apprenticeships.scot',
        description: 'Find Foundation, Modern, and Graduate Apprenticeships in Scotland.',
      },
      {
        name: 'Developing the Young Workforce',
        url: 'https://dyw.scot',
        description: 'Connecting employers with schools across Scotland.',
      },
      {
        name: 'Graduate Apprenticeships',
        url: 'https://www.apprenticeships.scot/become-an-apprentice/graduate-apprenticeships/',
        description: 'Earn a degree while working — funded by SDS.',
      },
      {
        name: 'ScotlandIS',
        url: 'https://www.scotlandis.com',
        description: "Scotland's digital technologies trade body — tech apprenticeships.",
      },
    ],
  },
  {
    title: 'Awards & Enrichment',
    blurb:
      'Structured awards that build skills, add substance to personal statements, and sometimes earn UCAS points.',
    links: [
      {
        name: 'Duke of Edinburgh Award',
        url: 'https://www.dofe.org',
        description: 'Volunteering, physical, skills, and expedition — valued by universities.',
      },
      {
        name: 'Saltire Awards',
        url: 'https://saltireawards.scot',
        description: "Scotland's youth volunteering awards — earn UCAS points.",
      },
      {
        name: 'Youth Achievement Awards',
        url: 'https://www.youthscotland.org.uk/awards/youth-achievement-awards/',
        description: 'Qualifications Scotland-accredited awards for young people.',
      },
      {
        name: 'John Muir Award',
        url: 'https://www.johnmuirtrust.org/john-muir-award',
        description: 'Environmental conservation award.',
      },
      {
        name: 'CREST Awards',
        url: 'https://www.crestawards.org',
        description: 'British Science Association STEM project awards.',
      },
      {
        name: 'Young Enterprise Scotland',
        url: 'https://www.yes.org.uk',
        description: 'Enterprise and business education programmes.',
      },
      {
        name: 'Scouts Scotland',
        url: 'https://www.scouts.scot',
        description: 'Skills for life — leadership, teamwork, adventure.',
      },
    ],
  },
  {
    title: 'Work Experience & Internships',
    blurb:
      'Programmes that help students build experience before university — especially valuable for widening access applicants.',
    links: [
      {
        name: 'Nuffield Research Placements',
        url: 'https://www.nuffieldresearchplacements.org',
        description: 'Summer STEM research placements for S5 students.',
      },
      {
        name: 'in2scienceUK',
        url: 'https://in2scienceuk.org',
        description: 'STEM placements for students from disadvantaged backgrounds.',
      },
      {
        name: 'Social Mobility Foundation',
        url: 'https://www.socialmobility.org.uk',
        description: 'Internships and mentoring for widening access students.',
      },
      {
        name: 'Bright Network',
        url: 'https://www.brightnetwork.co.uk',
        description: 'Internships and graduate opportunities.',
      },
      {
        name: 'Year in Industry',
        url: 'https://www.etrust.org.uk/the-year-in-industry',
        description: 'Paid 12-month industry placements.',
      },
    ],
  },
  {
    title: 'Gap Year & International',
    blurb:
      'Time out, travel, and overseas study routes — both formal schemes and long-established charities.',
    links: [
      {
        name: 'Project Trust',
        url: 'https://www.projecttrust.org.uk',
        description: 'Scottish gap year charity — long-term overseas volunteering from the Isle of Coll.',
      },
      {
        name: 'Turing Scheme',
        url: 'https://www.turing-scheme.org.uk',
        description: 'UK government funding for study and work abroad.',
      },
    ],
  },
  {
    title: 'Professional Bodies by Career Sector',
    blurb:
      'The official bodies that regulate, represent, or develop each sector. Great place to start researching a specific career.',
    links: [
      {
        name: 'NHS Scotland Careers',
        url: 'https://careers.nhs.scot',
        description: 'Healthcare careers across Scotland.',
      },
      {
        name: 'Law Society of Scotland',
        url: 'https://www.lawscot.org.uk',
        description: 'Information for aspiring lawyers in Scotland.',
      },
      {
        name: 'Engineering UK',
        url: 'https://www.engineeringuk.com',
        description: 'Professional pathway into engineering.',
      },
      {
        name: 'RIAS',
        url: 'https://www.rias.org.uk',
        description: 'Royal Incorporation of Architects in Scotland.',
      },
      {
        name: 'Creative Scotland',
        url: 'https://www.creativescotland.com',
        description: "Scotland's national arts development body.",
      },
      {
        name: 'sportscotland',
        url: 'https://sportscotland.org.uk',
        description: 'National agency for sport.',
      },
      {
        name: 'VisitScotland',
        url: 'https://www.visitscotland.org',
        description: "Scotland's tourism industry and careers.",
      },
      {
        name: 'IET',
        url: 'https://www.theiet.org',
        description: 'Institution of Engineering and Technology — for engineers and technologists.',
      },
      {
        name: 'Royal Society of Biology',
        url: 'https://www.rsb.org.uk',
        description: 'UK professional body for the biological sciences.',
      },
    ],
  },
  {
    title: 'Student Life & Support',
    blurb:
      'Forums, league tables, and mental health services. Honest advice from people who are currently going through the same thing.',
    links: [
      {
        name: 'The Student Room',
        url: 'https://www.thestudentroom.co.uk',
        description: "UK's largest student community and forum.",
      },
      {
        name: 'Complete University Guide',
        url: 'https://www.thecompleteuniversityguide.co.uk',
        description: 'University rankings and comparison.',
      },
      {
        name: 'NUS Scotland',
        url: 'https://www.nus-scotland.org.uk',
        description: 'National Union of Students Scotland.',
      },
      {
        name: 'Childline',
        url: 'https://www.childline.org.uk',
        description: 'Free confidential support for under 19s — call 0800 1111.',
      },
      {
        name: 'Young Minds',
        url: 'https://www.youngminds.org.uk',
        description: 'Mental health support for young people.',
      },
      {
        name: 'Hub for Success',
        url: 'https://www.hubforsuccess.org',
        description: 'Support for care experienced students at Scottish colleges and universities.',
      },
      {
        name: 'Breathing Space Scotland',
        url: 'https://breathingspace.scot',
        description: 'Free confidential phoneline for anyone experiencing low mood or anxiety — 0800 83 85 87.',
      },
    ],
  },
]

const TOTAL_LINKS = SECTIONS.reduce((n, s) => n + s.links.length, 0)

export default function ResourcesPage() {
  const [query, setQuery] = useState('')

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SECTIONS
    return SECTIONS.map((section) => ({
      ...section,
      links: section.links.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          section.title.toLowerCase().includes(q)
      ),
    })).filter((section) => section.links.length > 0)
  }, [query])

  const visibleCount = filteredSections.reduce((n, s) => n + s.links.length, 0)

  return (
    <div style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      {/* Hero */}
      <section
        style={{
          backgroundColor: 'var(--pf-blue-50)',
          paddingTop: '72px',
          paddingBottom: '40px',
          borderBottom: '1px solid var(--pf-grey-300)',
        }}
      >
        <div className="pf-container">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <span className="pf-badge-blue" style={{ marginBottom: '20px' }}>
                Resources
              </span>
              <h1 style={{ marginTop: '16px', marginBottom: '16px', lineHeight: 1.15 }}>
                Resources &amp; Useful Links
              </h1>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '1.125rem',
                  lineHeight: 1.65,
                  marginBottom: '24px',
                  maxWidth: '560px',
                }}
              >
                Trusted organisations, tools, and opportunities to support your journey. Pathfinder
                works alongside Scotland&rsquo;s education ecosystem &mdash; these are the places we&rsquo;d
                point you to ourselves.
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.875rem',
                  color: 'var(--pf-grey-600)',
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4M12 8h.01" />
                </svg>
                <span>
                  All links open in a new tab. {TOTAL_LINKS}+ curated resources across{' '}
                  {SECTIONS.length} categories.
                </span>
              </div>
            </div>

            {/* Decorative SVG: bookshelf / directory */}
            <div className="hidden md:flex justify-center">
              <svg
                viewBox="0 0 320 260"
                width="100%"
                style={{ maxWidth: '360px' }}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="pf-res-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--pf-blue-100)" />
                    <stop offset="100%" stopColor="var(--pf-blue-50)" />
                  </linearGradient>
                </defs>
                <rect x="20" y="20" width="280" height="220" rx="16" fill="url(#pf-res-grad)" />
                {/* Books */}
                {[
                  { x: 50, h: 130, fill: 'var(--pf-blue-700)' },
                  { x: 78, h: 150, fill: 'var(--pf-area-sciences)' },
                  { x: 106, h: 110, fill: 'var(--pf-amber-500)' },
                  { x: 134, h: 140, fill: 'var(--pf-area-languages)' },
                  { x: 162, h: 125, fill: 'var(--pf-area-expressive)' },
                  { x: 190, h: 155, fill: 'var(--pf-blue-500)' },
                  { x: 218, h: 120, fill: 'var(--pf-area-social)' },
                  { x: 246, h: 145, fill: 'var(--pf-area-health)' },
                ].map((book) => (
                  <rect
                    key={book.x}
                    x={book.x}
                    y={200 - book.h}
                    width="22"
                    height={book.h}
                    rx="3"
                    fill={book.fill}
                  />
                ))}
                {/* Shelf */}
                <rect x="40" y="200" width="240" height="8" rx="2" fill="var(--pf-blue-900)" />
                {/* Label bar */}
                <rect x="60" y="60" width="200" height="28" rx="14" fill="var(--pf-white)" />
                <text
                  x="160"
                  y="78"
                  textAnchor="middle"
                  fontFamily="Space Grotesk, sans-serif"
                  fontWeight="600"
                  fontSize="13"
                  fill="var(--pf-blue-900)"
                >
                  Pathfinder directory
                </text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section
        className="pf-section-white"
        style={{
          position: 'sticky',
          top: '64px',
          zIndex: 10,
          paddingTop: '20px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--pf-grey-300)',
          backgroundColor: 'var(--pf-white)',
        }}
      >
        <div className="pf-container" style={{ maxWidth: '760px' }}>
          <label htmlFor="resource-search" className="sr-only">
            Search resources
          </label>
          <div style={{ position: 'relative' }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--pf-grey-600)',
                pointerEvents: 'none',
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              id="resource-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search resources by name or description"
              className="pf-input"
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                fontSize: '0.9375rem',
                backgroundColor: 'var(--pf-white)',
                border: '1px solid var(--pf-grey-300)',
                borderRadius: '8px',
                fontFamily: "'Inter', sans-serif",
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: '6px 10px',
                  fontSize: '0.75rem',
                  color: 'var(--pf-grey-600)',
                  background: 'var(--pf-grey-100)',
                  borderRadius: '6px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                }}
              >
                Clear
              </button>
            )}
          </div>
          {query && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginTop: '10px' }}>
              {visibleCount === 0
                ? 'No resources match your search. Try a broader term.'
                : `Showing ${visibleCount} resource${visibleCount === 1 ? '' : 's'} across ${filteredSections.length} ${filteredSections.length === 1 ? 'category' : 'categories'}.`}
            </p>
          )}
        </div>
      </section>

      {/* Sections */}
      <section className="pf-section pf-section-white" style={{ paddingTop: '48px' }}>
        <div className="pf-container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
            {filteredSections.map((section) => (
              <ResourceSectionBlock key={section.title} section={section} />
            ))}
            {filteredSections.length === 0 && (
              <div
                className="pf-card"
                style={{
                  padding: '32px',
                  textAlign: 'center',
                }}
              >
                <p style={{ color: 'var(--pf-grey-600)', margin: 0 }}>
                  Nothing here matches &ldquo;{query}&rdquo;. Try a shorter term or clear the search.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Ecosystem note */}
      <section className="pf-section pf-section-dark" style={{ textAlign: 'center' }}>
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ color: '#fff', marginBottom: '12px' }}>
            Pathfinder is part of the Scottish education ecosystem
          </h2>
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.82)',
              fontSize: '1.0625rem',
              marginBottom: '24px',
              lineHeight: 1.65,
            }}
          >
            We don&rsquo;t replace Qualifications Scotland, My World of Work, SAAS, or your school&rsquo;s careers team
            &mdash; we make the connections between them clearer and help you find the right place for
            each question.
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
            Spotted a broken link or a resource we should add?{' '}
            <a
              href="/contact"
              style={{ color: '#fff', textDecoration: 'underline' }}
            >
              Let us know
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  )
}

function ResourceSectionBlock({ section }: { section: ResourceSection }) {
  return (
    <div>
      <div style={{ marginBottom: '20px', maxWidth: '720px' }}>
        <h2 style={{ marginBottom: '6px' }}>{section.title}</h2>
        <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', margin: 0 }}>
          {section.blurb}
        </p>
      </div>
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
      >
        {section.links.map((link) => (
          <ResourceCard key={link.url} link={link} />
        ))}
      </div>
    </div>
  )
}

function ResourceCard({ link }: { link: ResourceLink }) {
  let host = ''
  try {
    host = new URL(link.url).host.replace(/^www\./, '')
  } catch {
    host = link.url
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="pf-card-hover no-underline hover:no-underline"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 22px',
        color: 'var(--pf-grey-900)',
        minHeight: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '6px',
        }}
      >
        <h3
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '1rem',
            color: 'var(--pf-grey-900)',
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {link.name}
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
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--pf-grey-600)',
          lineHeight: 1.55,
          margin: 0,
          marginBottom: '12px',
          flex: 1,
        }}
      >
        {link.description}
      </p>
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.75rem',
          color: 'var(--pf-blue-700)',
          fontWeight: 500,
        }}
      >
        {host}
      </span>
    </a>
  )
}
