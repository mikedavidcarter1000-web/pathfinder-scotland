'use client'

import { use, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  useCareerSectorPageData,
  type CareerSubjectRow,
  type CareerSectorPageCourse,
  type CareerRole,
} from '@/hooks/use-subjects'
import {
  getCurricularAreaColour,
  RELEVANCE_STYLES,
  DEGREE_TYPES,
  AI_ROLE_SOURCE,
} from '@/lib/constants'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { AiRoleBadge } from '@/components/ui/ai-role-badge'
import { CareerRealities } from '@/components/careers/CareerRealities'
import { HorizonRatings } from '@/components/careers/HorizonRatings'
import { classifyError } from '@/lib/errors'
import { useAuthErrorRedirect } from '@/hooks/use-auth-error-redirect'
import { FeedbackWidget } from '@/components/ui/feedback-widget'
import type { CareerSector } from '@/hooks/use-subjects'

type GrowthTone = 'growing' | 'stable' | 'variable'

function classifyGrowth(outlook: string | null | undefined): GrowthTone {
  if (!outlook) return 'stable'
  const lower = outlook.toLowerCase()
  if (
    lower.startsWith('strong growth') ||
    lower.startsWith('growing') ||
    lower.startsWith('fastest') ||
    lower.startsWith('strong —') ||
    lower.startsWith('recovering and growing')
  ) {
    return 'growing'
  }
  if (lower.startsWith('changing')) return 'variable'
  return 'stable'
}

const GROWTH_BADGE: Record<GrowthTone, { label: string; bg: string; text: string }> = {
  growing: { label: 'Growing', bg: 'rgba(16, 185, 129, 0.12)', text: 'var(--pf-green-500)' },
  stable: { label: 'Stable', bg: 'rgba(245, 158, 11, 0.14)', text: 'var(--pf-amber-500)' },
  variable: { label: 'Variable', bg: 'var(--pf-grey-100)', text: 'var(--pf-grey-600)' },
}

// Short descriptions for each job title. Each blurb is one line, aimed at a
// 14-year-old who wants a basic sense of what the job involves.
const JOB_BLURBS: Record<string, string> = {
  Doctor: 'Diagnoses and treats patients across hospitals and GP practices.',
  Nurse: 'Cares for patients in hospitals, clinics, and the community.',
  Dentist: 'Looks after patients&rsquo; teeth, gums, and oral health.',
  Pharmacist: 'Dispenses medicines and advises patients on safe use.',
  Paramedic: 'Provides emergency care at the scene and on the way to hospital.',
  Physiotherapist: 'Helps people recover movement and manage pain through exercise.',
  Radiographer: 'Uses scanning equipment to help diagnose illness and injury.',
  'Occupational Therapist': 'Supports people to live independently after illness or injury.',
  Midwife: 'Cares for women and babies through pregnancy, birth, and early weeks.',
  'Clinical Psychologist': 'Supports people experiencing mental health challenges.',
  'Civil Engineer': 'Designs roads, bridges, and public infrastructure.',
  'Mechanical Engineer': 'Designs machines, engines, and mechanical systems.',
  'Electrical Engineer': 'Designs power systems and electronic devices.',
  'Chemical Engineer': 'Turns raw materials into useful products at scale.',
  'Structural Engineer': 'Makes sure buildings and bridges stay up safely.',
  'Aerospace Engineer': 'Designs aircraft, spacecraft, and their systems.',
  'Manufacturing Engineer': 'Improves how products are made in factories.',
  'Energy Engineer': 'Designs renewable and low-carbon energy systems.',
  'Marine Engineer': 'Works on ships, offshore rigs, and marine technology.',
  'Robotics Engineer': 'Builds robots and automated systems.',
  'Software Developer': 'Writes code for apps, websites, and services.',
  'Data Analyst': 'Finds patterns in data to help make decisions.',
  'Cyber Security Analyst': 'Protects systems and data from hackers.',
  'Web Developer': 'Builds websites and web applications.',
  'UX Designer': 'Designs digital experiences that are easy to use.',
  'IT Support Engineer': 'Keeps computer systems running smoothly for organisations.',
  'Network Engineer': 'Sets up and maintains computer networks.',
  'AI/Machine Learning Engineer': 'Builds systems that learn from data.',
  'Games Developer': 'Creates video games from concept to release.',
  'Database Administrator': 'Keeps big stores of data organised and safe.',
  'Research Scientist': 'Investigates questions about the natural world.',
  'Lab Technician': 'Runs experiments and keeps labs running.',
  'Environmental Scientist': 'Studies impacts on air, land, and water.',
  'Biomedical Scientist': 'Runs tests that help diagnose disease.',
  'Marine Biologist': 'Studies life in oceans, rivers, and coasts.',
  Geologist: 'Studies rocks, soils, and the Earth&rsquo;s resources.',
  'Forensic Scientist': 'Analyses evidence for police investigations.',
  'Food Scientist': 'Researches how food is made, stored, and improved.',
  Meteorologist: 'Studies the atmosphere and forecasts the weather.',
  'Conservation Scientist': 'Works to protect wildlife and habitats.',
  Solicitor: 'Advises clients on legal matters and represents them.',
  Advocate: 'Argues cases in Scottish courts.',
  'Legal Secretary': 'Supports solicitors with documents and admin.',
  'Police Officer': 'Keeps communities safe and investigates crime.',
  'Prison Officer': 'Supervises and supports people in custody.',
  'Probation Officer': 'Works with offenders to prevent reoffending.',
  'Court Reporter': 'Creates accurate records of court proceedings.',
  'Legal Executive': 'Qualified legal professional specialising in a chosen area.',
  'Immigration Adviser': 'Advises people on visa and settlement issues.',
  'Victims Support Worker': 'Supports people affected by crime.',
  'Primary Teacher': 'Teaches children across the primary curriculum.',
  'Secondary Teacher': 'Teaches a specialist subject at secondary school.',
  'Nursery Practitioner': 'Cares for and educates young children.',
  'University Lecturer': 'Teaches and researches at a university.',
  'Educational Psychologist': 'Supports children with learning and behaviour needs.',
  'Learning Support Assistant': 'Helps pupils who need extra support in class.',
  'Music Teacher': 'Teaches music in schools or privately.',
  'PE Teacher': 'Teaches physical education and school sport.',
  Librarian: 'Helps people find and use information resources.',
  'Training Officer': 'Designs and delivers training for staff.',
  Accountant: 'Manages financial records and tax for organisations.',
  'Financial Adviser': 'Helps people plan their savings and investments.',
  'Bank Manager': 'Runs a local branch of a bank.',
  'Business Analyst': 'Finds ways for businesses to work better.',
  Actuary: 'Uses statistics to work out financial risk.',
  Auditor: 'Checks that organisations&rsquo; financial records are accurate.',
  'Insurance Underwriter': 'Decides which risks an insurer will cover.',
  'Investment Analyst': 'Researches investments for clients or firms.',
  'Tax Adviser': 'Helps people and firms navigate tax rules.',
  'Management Consultant': 'Advises organisations on how to improve.',
  'Graphic Designer': 'Creates visual designs for print and screen.',
  Architect: 'Designs buildings and public spaces.',
  'Interior Designer': 'Plans how indoor spaces look and work.',
  'Product Designer': 'Designs everyday objects people use.',
  Animator: 'Brings characters and stories to life on screen.',
  Illustrator: 'Draws artwork for books, ads, and products.',
  'Fashion Designer': 'Designs clothes, shoes, and accessories.',
  Photographer: 'Takes photos for news, fashion, or commerce.',
  'Jewellery Designer': 'Designs and makes jewellery pieces.',
  'Textile Designer': 'Designs fabrics and surface patterns.',
  Journalist: 'Researches and writes news stories.',
  'TV/Film Producer': 'Leads the making of TV shows or films.',
  'Public Relations Officer': 'Manages how an organisation is seen by the public.',
  'Social Media Manager': 'Runs an organisation&rsquo;s social media presence.',
  Copywriter: 'Writes ads, websites, and marketing material.',
  'Marketing Manager': 'Plans campaigns that promote products or services.',
  Broadcaster: 'Presents news or shows on TV or radio.',
  'Video Editor': 'Cuts and assembles video for film or TV.',
  'Communications Officer': 'Writes press releases and handles media enquiries.',
  'Content Creator': 'Makes online videos, articles, and social posts.',
  'Social Worker': 'Supports vulnerable adults, children, and families.',
  'Community Development Worker': 'Helps local communities organise and improve life.',
  'Youth Worker': 'Supports young people through groups and activities.',
  'Charity Manager': 'Runs programmes for charitable organisations.',
  'Family Support Worker': 'Helps families facing difficulties.',
  'Mental Health Worker': 'Supports people with mental health conditions.',
  'Addiction Counsellor': 'Supports people recovering from addiction.',
  'Homelessness Worker': 'Helps people find and keep stable housing.',
  'Refugee Support Worker': 'Supports people who have fled their home country.',
  'Advocacy Officer': 'Speaks up for people who need help navigating services.',
  'Sports Coach': 'Trains individuals or teams to improve performance.',
  'Personal Trainer': 'Helps clients reach their fitness goals.',
  'Sports Scientist': 'Studies how the body performs and recovers.',
  'Sports Development Officer': 'Encourages participation in sport at community level.',
  'Leisure Centre Manager': 'Runs a gym, pool, or leisure facility.',
  'Outdoor Activities Instructor': 'Leads activities like climbing, kayaking, or hiking.',
  Nutritionist: 'Advises on healthy eating and food choices.',
  'Sports Journalist': 'Reports on sport for newspapers, TV, or online.',
  'Hotel Manager': 'Runs the day-to-day operations of a hotel.',
  Chef: 'Designs and prepares food in a kitchen.',
  'Restaurant Manager': 'Runs a restaurant and leads its staff.',
  'Event Coordinator': 'Plans and delivers events and conferences.',
  'Tour Guide': 'Leads visitors around attractions and cities.',
  'Travel Agent': 'Helps people plan and book trips.',
  Barista: 'Prepares and serves coffee and drinks.',
  Sommelier: 'Expert in wine and food pairing.',
  'Visitor Attraction Manager': 'Runs a museum, gallery, or tourist site.',
  'Conference Organiser': 'Arranges large professional events.',
  Electrician: 'Installs and maintains electrical systems.',
  Plumber: 'Installs and repairs water, heating, and drainage.',
  Joiner: 'Makes and fits wooden structures and fittings.',
  Bricklayer: 'Builds walls, chimneys, and brick structures.',
  'Painter & Decorator': 'Finishes and decorates buildings inside and out.',
  Roofer: 'Installs and repairs roofs.',
  Plasterer: 'Applies plaster to walls and ceilings.',
  'Site Manager': 'Runs a construction site day-to-day.',
  'Quantity Surveyor': 'Manages costs on construction projects.',
  'Building Inspector': 'Checks that buildings meet regulations.',
  'Civil Servant': 'Helps deliver government policy and services.',
  'Policy Adviser': 'Researches and shapes government policy.',
  'Council Officer': 'Works for a local council on services like planning or housing.',
  Firefighter: 'Responds to fires and other emergencies.',
  'Armed Forces': 'Serves in the Army, Navy, or RAF.',
  Diplomat: 'Represents the UK overseas.',
  'Town Planner': 'Shapes how places grow and change.',
  'Environmental Health Officer': 'Enforces rules on food safety, housing, and pollution.',
  'Trading Standards Officer': 'Protects consumers from unfair trading.',
  'Benefits Adviser': 'Helps people claim the benefits they&rsquo;re entitled to.',
  Farmer: 'Grows crops or raises livestock.',
  Gamekeeper: 'Looks after wildlife and estates in the countryside.',
  'Forestry Worker': 'Plants and manages forests and woodland.',
  'Environmental Consultant': 'Advises organisations on environmental impact.',
  'Conservation Officer': 'Protects natural habitats and species.',
  'Veterinary Surgeon': 'Provides medical care for animals.',
  'Agricultural Scientist': 'Researches how to grow better food more sustainably.',
  Ecologist: 'Studies how living things interact with their environment.',
  'Renewable Energy Technician': 'Installs and maintains solar, wind, and other renewables.',
  Actor: 'Performs in theatre, film, or TV.',
  Musician: 'Performs or composes music.',
  Dancer: 'Performs dance in shows, film, or company work.',
  'Theatre Director': 'Shapes how a play is performed on stage.',
  'Sound Technician': 'Sets up and runs sound for live or recorded performance.',
  'Lighting Designer': 'Designs the lighting for theatre, concerts, or film.',
  'Stage Manager': 'Runs the backstage side of a production.',
  Choreographer: 'Creates and teaches dance sequences.',
  'Music Producer': 'Records and shapes music for release.',
  'Arts Administrator': 'Runs organisations like theatres and galleries.',
}

function getJobBlurb(title: string): string {
  return JOB_BLURBS[title] || 'Works within this career sector.'
}

export default function CareerSectorDetailPage({
  params,
}: {
  params: Promise<{ sectorId: string }>
}) {
  const { sectorId } = use(params)
  const { data, isLoading, error, refetch } = useCareerSectorPageData(sectorId)

  useAuthErrorRedirect([error])

  const coursesByUniversity = useMemo(() => {
    if (!data) return []
    const groups = new Map<string, { name: string; courses: CareerSectorPageCourse[] }>()
    for (const course of data.related_courses) {
      const uniName = course.university?.name || 'Other'
      const key = course.university?.id || uniName
      const existing = groups.get(key)
      if (existing) {
        existing.courses.push(course)
      } else {
        groups.set(key, { name: uniName, courses: [course] })
      }
    }
    return Array.from(groups.values())
      .map((g) => ({
        ...g,
        courses: g.courses.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [data])

  const allLinkedSubjects = useMemo(
    () =>
      data
        ? [
            ...data.subjects_by_relevance.essential,
            ...data.subjects_by_relevance.recommended,
            ...data.subjects_by_relevance.related,
          ]
        : [],
    [data]
  )

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
        <div style={{ backgroundColor: 'var(--pf-white)' }}>
          <div className="pf-container pt-8 pb-6 sm:pt-10 sm:pb-8">
            <Skeleton width="120px" height={14} rounded="sm" />
            <div style={{ height: '16px' }} />
            <Skeleton width="60%" height={32} rounded="md" />
            <div style={{ height: '10px' }} />
            <Skeleton width="90%" height={16} rounded="sm" />
            <div style={{ height: '6px' }} />
            <Skeleton width="70%" height={16} rounded="sm" />
          </div>
        </div>
        <div className="pf-container pt-8 pb-16 space-y-8">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    const classified = error ? classifyError(error) : null
    const isNotFound = !error || classified?.kind === 'not-found'
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: 'var(--pf-blue-50)', padding: '48px 16px' }}
      >
        <div className="max-w-4xl mx-auto">
          <ErrorState
            title={isNotFound ? 'Career sector not found' : classified?.title ?? 'Something went wrong'}
            message={
              isNotFound
                ? "The career sector you're looking for doesn't exist."
                : classified?.message ?? 'Please try again in a moment.'
            }
            retryAction={isNotFound ? undefined : () => refetch()}
            backLink={{ href: '/careers', label: 'Browse all career sectors' }}
          />
        </div>
      </div>
    )
  }

  const { sector, subjects_by_relevance, related_courses, career_roles } = data
  const tone = classifyGrowth(sector.growth_outlook)
  const growth = GROWTH_BADGE[tone]
  const exampleJobs = (sector.example_jobs || []) as string[]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      {/* Hero banner */}
      {sector.hero_image_url ? (
        <div
          className="relative w-full"
          style={{
            height: 'clamp(180px, 26vw, 280px)',
            backgroundColor: 'var(--pf-blue-100)',
            overflow: 'hidden',
          }}
        >
          <Image
            src={sector.hero_image_url}
            alt={`${sector.name} careers`}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0"
            style={{
              height: '50%',
              background:
                'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 100%)',
            }}
          />
        </div>
      ) : null}

      {/* Header */}
      <div style={{ backgroundColor: 'var(--pf-white)' }}>
        <div className="pf-container pt-8 pb-6 sm:pt-10 sm:pb-8">
          <nav
            className="flex items-center gap-2"
            style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginBottom: '12px' }}
          >
            <Link href="/careers" style={{ color: 'var(--pf-blue-500)' }}>
              Careers
            </Link>
            <span>/</span>
            <span className="truncate" style={{ color: 'var(--pf-grey-900)' }}>
              {sector.name}
            </span>
          </nav>

          <h1 style={{ marginBottom: '12px', fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>
            {sector.name}
          </h1>
          {sector.description && (
            <p
              style={{
                color: 'var(--pf-grey-600)',
                fontSize: '1rem',
                lineHeight: 1.6,
                maxWidth: '760px',
                marginBottom: '16px',
              }}
            >
              {sector.description}
            </p>
          )}
          <span
            className="inline-flex items-center"
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              backgroundColor: growth.bg,
              color: growth.text,
            }}
          >
            {growth.label}
          </span>
          {sector.growth_outlook && (
            <p
              style={{
                color: 'var(--pf-grey-600)',
                fontSize: '0.875rem',
                marginTop: '8px',
                maxWidth: '760px',
              }}
            >
              {sector.growth_outlook}
            </p>
          )}
        </div>
      </div>

      <div className="pf-container pt-6 sm:pt-8 pb-12 sm:pb-16 space-y-10">
        {/* Section 1 — Example careers */}
        {exampleJobs.length > 0 && (
          <section>
            <h2 style={{ marginBottom: '6px' }}>Example careers in this sector</h2>
            <p
              style={{
                color: 'var(--pf-grey-600)',
                fontSize: '0.9375rem',
                marginBottom: '20px',
              }}
            >
              Ten jobs you could do in this area. Each one is a different route into the sector.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {exampleJobs.map((job) => (
                <div
                  key={job}
                  className="pf-card"
                  style={{ padding: '16px 20px' }}
                >
                  <h3
                    style={{
                      fontSize: '0.9375rem',
                      marginBottom: '4px',
                      color: 'var(--pf-grey-900)',
                    }}
                  >
                    {job}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--pf-grey-600)',
                      lineHeight: 1.5,
                    }}
                    dangerouslySetInnerHTML={{ __html: getJobBlurb(job) }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 2 — Salaries */}
        {(sector.salary_range_entry || sector.salary_range_experienced) && (
          <section>
            <h2 style={{ marginBottom: '6px' }}>What you could earn</h2>
            <p
              style={{
                color: 'var(--pf-grey-600)',
                fontSize: '0.9375rem',
                marginBottom: '20px',
              }}
            >
              Typical Scottish salaries at different career stages.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {sector.salary_range_entry && (
                <SalaryCard label="Entry level" value={sector.salary_range_entry} />
              )}
              {sector.salary_range_experienced && (
                <SalaryCard label="Experienced" value={sector.salary_range_experienced} />
              )}
            </div>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--pf-grey-600)',
                marginTop: '12px',
                fontStyle: 'italic',
              }}
            >
              Salaries are typical for Scotland. Actual pay varies by employer, location, and
              experience.
            </p>
          </section>
        )}

        {/* Section 3 — Subjects */}
        <section>
          <h2 style={{ marginBottom: '6px' }}>Subjects that lead here</h2>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.9375rem',
              marginBottom: '24px',
            }}
          >
            These school subjects build the skills and qualifications universities and employers
            look for in this field.
          </p>

          {subjects_by_relevance.essential.length === 0 &&
            subjects_by_relevance.recommended.length === 0 &&
            subjects_by_relevance.related.length === 0 && (
              <div className="pf-card" style={{ padding: '24px' }}>
                <p style={{ color: 'var(--pf-grey-600)' }}>
                  No subjects are currently mapped to this sector.
                </p>
              </div>
            )}

          {subjects_by_relevance.essential.length > 0 && (
            <SubjectGroup
              relevance="essential"
              title="Essential"
              description="Direct prerequisites for degree courses in this area."
              subjects={subjects_by_relevance.essential}
            />
          )}

          {subjects_by_relevance.recommended.length > 0 && (
            <SubjectGroup
              relevance="recommended"
              title="Recommended"
              description="Widely preferred by universities and employers in this field."
              subjects={subjects_by_relevance.recommended}
            />
          )}

          {subjects_by_relevance.related.length > 0 && (
            <SubjectGroup
              relevance="related"
              title="Related"
              description="Develop useful transferable skills for this career."
              subjects={subjects_by_relevance.related}
            />
          )}
        </section>

        {/* Section 4 — University courses */}
        <section>
          <h2 style={{ marginBottom: '6px' }}>University courses in this area</h2>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.9375rem',
              marginBottom: '20px',
            }}
          >
            {related_courses.length > 0
              ? `${related_courses.length} Scottish university ${related_courses.length === 1 ? 'course' : 'courses'} leading into this sector.`
              : 'Courses in this area are added regularly — check back soon.'}
          </p>

          {related_courses.length > 0 && (
            <div className="space-y-6">
              {coursesByUniversity.map((group) => (
                <div key={group.name} className="pf-card" style={{ padding: '20px 24px' }}>
                  <h3
                    style={{
                      fontSize: '1rem',
                      marginBottom: '12px',
                      color: 'var(--pf-grey-900)',
                    }}
                  >
                    {group.name}
                  </h3>
                  <ul className="space-y-2">
                    {group.courses.map((course) => (
                      <li key={course.id}>
                        <CourseRow course={course} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="text-center">
                <Link
                  href={`/courses?subject_area=${encodeURIComponent(
                    (sector.course_subject_areas || [])[0] || ''
                  )}`}
                  className="pf-btn-ghost inline-flex items-center gap-1"
                  style={{ fontSize: '0.9375rem' }}
                >
                  Browse all courses
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Section 4b — Alternative routes into this career */}
        <AlternativeRoutes />

        {/* Section 4c — AI & the Future (full role-level breakdown) */}
        <AiFutureSection
          sector={sector}
          roles={career_roles}
          linkedSubjects={allLinkedSubjects}
        />

        {/* Section 4d — What's the work actually like? (hours, pay, lifestyle) */}
        <CareerRealities sectorName={sector.name} />

        {/* Section 4e — Explore Further (external links) */}
        <ExploreFurther sector={sector} />

        {/* Section 5 — CTAs */}
        <section
          className="pf-card"
          style={{
            backgroundColor: 'var(--pf-blue-900)',
            padding: '32px',
            color: '#fff',
          }}
        >
          <h2 style={{ color: '#fff', marginBottom: '8px', fontSize: '1.375rem' }}>
            Plan your path
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.8)',
              marginBottom: '24px',
              fontSize: '0.9375rem',
            }}
          >
            Map out the subjects you&rsquo;ll need, or experiment with different combinations in the
            simulator.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/discover/career-search?sector=${sector.id}`}
              className="inline-flex items-center justify-center gap-2 no-underline hover:no-underline"
              style={{
                backgroundColor: '#fff',
                color: 'var(--pf-blue-900)',
                padding: '12px 24px',
                borderRadius: '8px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.9375rem',
                minHeight: '48px',
              }}
            >
              Plan subjects for this career
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/simulator"
              className="inline-flex items-center justify-center gap-2 no-underline hover:no-underline"
              style={{
                backgroundColor: 'transparent',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.35)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.9375rem',
                minHeight: '48px',
              }}
            >
              Try the simulator
            </Link>
          </div>
        </section>
      </div>
      <FeedbackWidget />
    </div>
  )
}

function SalaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="pf-card" style={{ padding: '20px 24px' }}>
      <p
        style={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--pf-grey-600)',
          fontWeight: 600,
          marginBottom: '8px',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'var(--pf-grey-900)',
        }}
      >
        {value}
      </p>
    </div>
  )
}

function SubjectGroup({
  relevance,
  title,
  description,
  subjects,
}: {
  relevance: 'essential' | 'recommended' | 'related'
  title: string
  description: string
  subjects: CareerSubjectRow[]
}) {
  const style = RELEVANCE_STYLES[relevance]
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ marginBottom: '14px' }}>
        <span
          className={`pf-badge ${style.bg} ${style.text}`}
          style={{ marginBottom: '6px', display: 'inline-flex' }}
        >
          {title}
        </span>
        <p
          style={{ color: 'var(--pf-grey-600)', fontSize: '0.875rem', marginTop: '4px' }}
        >
          {description}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <SubjectChip key={subject.id} subject={subject} />
        ))}
      </div>
    </div>
  )
}

function SubjectChip({ subject }: { subject: CareerSubjectRow }) {
  const area = subject.curricular_area
  const areaColour = getCurricularAreaColour(area?.name)

  const levels: string[] = []
  if (subject.is_available_n5) levels.push('N5')
  if (subject.is_available_higher) levels.push('H')
  if (subject.is_available_adv_higher) levels.push('AH')

  return (
    <Link
      href={`/subjects/${subject.id}`}
      className="pf-card-hover no-underline hover:no-underline flex flex-col"
      style={{ padding: 0, overflow: 'hidden' }}
      aria-label={`View ${subject.name}`}
    >
      <div className={`h-1 bg-gradient-to-r ${areaColour.bar}`} />
      <div className="p-4 flex-1">
        <h4
          style={{
            fontSize: '0.9375rem',
            color: 'var(--pf-grey-900)',
            marginBottom: '8px',
            lineHeight: 1.3,
          }}
          className="line-clamp-2"
        >
          {subject.name}
        </h4>
        {area && (
          <span className={`pf-area-badge ${areaColour.bg} ${areaColour.text}`}>
            {area.name}
          </span>
        )}
        {levels.length > 0 && (
          <div className="flex items-center gap-1 mt-3">
            {levels.map((lvl) => (
              <span
                key={lvl}
                className="pf-badge-grey"
                style={{ minWidth: '34px', justifyContent: 'center', fontSize: '0.6875rem' }}
              >
                {lvl}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

type ExternalLink = { name: string; url: string; description?: string }

function isExternalLinkArray(value: unknown): value is ExternalLink[] {
  return (
    Array.isArray(value) &&
    value.every(
      (v) =>
        v !== null &&
        typeof v === 'object' &&
        typeof (v as Record<string, unknown>).name === 'string' &&
        typeof (v as Record<string, unknown>).url === 'string'
    )
  )
}

type ExploreFurtherSector = {
  name: string
  external_links: unknown
}

function AlternativeRoutes() {
  const routes: Array<{
    title: string
    body: string
    href: string
    accent: string
  }> = [
    {
      title: 'Foundation Apprenticeship',
      body: 'Start in S5/S6 — equivalent to a Higher, with real workplace experience.',
      href: '/pathways/alternatives#foundation-apprenticeships',
      accent: 'var(--pf-blue-700)',
    },
    {
      title: 'College HNC / HND',
      body: 'Study at college, then articulate into year 2 or 3 of a Scottish degree.',
      href: '/pathways/alternatives#college-routes',
      accent: 'var(--pf-area-sciences)',
    },
    {
      title: 'Modern Apprenticeship',
      body: 'Earn a wage from day one while training in your chosen sector.',
      href: '/pathways/alternatives#modern-apprenticeships',
      accent: 'var(--pf-amber-500)',
    },
    {
      title: 'Graduate Apprenticeship',
      body: 'Work full-time and earn a full honours degree, paid for by your employer.',
      href: '/pathways/alternatives#graduate-apprenticeships',
      accent: 'var(--pf-area-expressive)',
    },
  ]

  return (
    <section>
      <h2 style={{ marginBottom: '6px' }}>Alternative routes into this career</h2>
      <p
        style={{
          color: 'var(--pf-grey-600)',
          fontSize: '0.9375rem',
          marginBottom: '20px',
        }}
      >
        University isn&apos;t the only path. These four routes can lead into the same careers.
      </p>
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
      >
        {routes.map((route) => (
          <Link
            key={route.title}
            href={route.href}
            className="pf-card-hover no-underline hover:no-underline"
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '18px 20px',
              borderTop: `3px solid ${route.accent}`,
              color: 'var(--pf-grey-900)',
            }}
          >
            <h3
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.9375rem',
                color: 'var(--pf-grey-900)',
                margin: 0,
                marginBottom: '6px',
                lineHeight: 1.3,
              }}
            >
              {route.title}
            </h3>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--pf-grey-600)',
                lineHeight: 1.5,
                margin: 0,
                marginBottom: '8px',
                flex: 1,
              }}
            >
              {route.body}
            </p>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.75rem',
                color: 'var(--pf-blue-700)',
              }}
            >
              Learn more →
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

type RoleSort = 'rating-asc' | 'rating-desc' | 'alpha'

function AiFutureSection({
  sector,
  roles,
  linkedSubjects,
}: {
  sector: CareerSector
  roles: CareerRole[]
  linkedSubjects: CareerSubjectRow[]
}) {
  const [sort, setSort] = useState<RoleSort>('rating-asc')

  const existingRoles = useMemo(() => roles.filter((r) => !r.is_new_ai_role), [roles])
  const newAiRoles = useMemo(() => roles.filter((r) => r.is_new_ai_role), [roles])

  const sortedRoles = useMemo(() => {
    const arr = [...existingRoles]
    if (sort === 'rating-asc') {
      arr.sort((a, b) => {
        const ra = a.ai_rating_2030_2035 ?? 999
        const rb = b.ai_rating_2030_2035 ?? 999
        return ra !== rb ? ra - rb : a.title.localeCompare(b.title)
      })
    } else if (sort === 'rating-desc') {
      arr.sort((a, b) => {
        const ra = a.ai_rating_2030_2035 ?? -1
        const rb = b.ai_rating_2030_2035 ?? -1
        return ra !== rb ? rb - ra : a.title.localeCompare(b.title)
      })
    } else {
      arr.sort((a, b) => a.title.localeCompare(b.title))
    }
    return arr
  }, [existingRoles, sort])

  // Build a name → subject lookup so the SQA paragraph can wire matched
  // subject names to /subjects/[id] links without an extra round trip.
  const subjectByName = useMemo(() => {
    const map = new Map<string, CareerSubjectRow>()
    for (const s of linkedSubjects) {
      map.set(s.name.toLowerCase(), s)
    }
    return map
  }, [linkedSubjects])

  const hasNarrative = !!sector.ai_sector_narrative
  const hasAnyContent =
    hasNarrative ||
    roles.length > 0 ||
    sector.sqa_subjects_text ||
    sector.apprenticeships_text ||
    sector.scottish_context

  if (!hasAnyContent) return null

  return (
    <section aria-labelledby="ai-future-heading" className="space-y-8">
      <div>
        <h2 id="ai-future-heading" style={{ marginBottom: '6px' }}>
          AI &amp; the future of this career
        </h2>
        <p
          style={{
            color: 'var(--pf-grey-600)',
            fontSize: '0.9375rem',
            maxWidth: '760px',
          }}
        >
          How artificial intelligence is likely to reshape this sector over the next decade,
          job by job — based on published research.
        </p>
      </div>

      {/* Sector overview narrative */}
      {hasNarrative && (
        <div
          className="pf-card"
          style={{ padding: '24px', borderLeft: '3px solid var(--pf-blue-700)' }}
        >
          <p
            style={{
              color: 'var(--pf-grey-900)',
              fontSize: '0.9375rem',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {sector.ai_sector_narrative}
          </p>
        </div>
      )}

      {/* Job roles table */}
      {sortedRoles.length > 0 && (
        <div>
          <div
            className="flex flex-wrap items-baseline justify-between"
            style={{ gap: '12px', marginBottom: '12px' }}
          >
            <h3 style={{ fontSize: '1.0625rem', margin: 0 }}>
              Specific job roles ({sortedRoles.length})
            </h3>
            <RoleSortToggle sort={sort} onChange={setSort} />
          </div>
          <RoleTable roles={sortedRoles} sectorId={sector.id} />
        </div>
      )}

      {/* New AI roles */}
      {newAiRoles.length > 0 && <NewAiRolesSection roles={newAiRoles} sectorId={sector.id} />}

      {/* SQA subjects */}
      {sector.sqa_subjects_text && (
        <div>
          <h3 style={{ fontSize: '1.0625rem', marginBottom: '8px' }}>
            Qualifications Scotland subjects that lead here
          </h3>
          <div className="pf-card" style={{ padding: '20px 24px' }}>
            <p
              style={{
                color: 'var(--pf-grey-900)',
                fontSize: '0.9375rem',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              {renderSubjectsText(sector.sqa_subjects_text, subjectByName)}
            </p>
          </div>
        </div>
      )}

      {/* Apprenticeship pathways */}
      {sector.apprenticeships_text && (
        <div>
          <h3 style={{ fontSize: '1.0625rem', marginBottom: '8px' }}>
            Apprenticeship pathways
          </h3>
          <div className="pf-card" style={{ padding: '20px 24px' }}>
            <p
              style={{
                color: 'var(--pf-grey-900)',
                fontSize: '0.9375rem',
                lineHeight: 1.7,
                marginBottom: '12px',
              }}
            >
              {sector.apprenticeships_text}
            </p>
            <div className="flex flex-wrap" style={{ gap: '12px' }}>
              <Link
                href="/pathways/alternatives"
                style={{
                  color: 'var(--pf-blue-700)',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                See all alternative pathways →
              </Link>
              <a
                href="https://www.apprenticeships.scot"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--pf-blue-700)',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                apprenticeships.scot ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Scottish context callout */}
      {sector.scottish_context && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            padding: '20px 22px',
            borderRadius: '8px',
            backgroundColor: 'var(--pf-blue-100)',
            borderLeft: '4px solid var(--pf-blue-700)',
          }}
          role="note"
          aria-label="Scottish context"
        >
          <span
            aria-hidden="true"
            style={{
              fontSize: '1.5rem',
              lineHeight: 1,
              filter: 'saturate(1.1)',
            }}
          >
            🏴󠁧󠁢󠁳󠁣󠁴󠁿
          </span>
          <div>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.875rem',
                color: 'var(--pf-blue-900)',
                margin: 0,
                marginBottom: '4px',
              }}
            >
              Scottish context
            </p>
            <p
              style={{
                fontSize: '0.9375rem',
                lineHeight: 1.6,
                color: 'var(--pf-blue-900)',
                margin: 0,
              }}
            >
              {sector.scottish_context}
            </p>
          </div>
        </div>
      )}

      {/* Source attribution */}
      <p
        style={{
          fontSize: '0.75rem',
          color: 'var(--pf-grey-600)',
          lineHeight: 1.6,
          maxWidth: '820px',
        }}
      >
        {AI_ROLE_SOURCE}
      </p>
    </section>
  )
}

function RoleSortToggle({
  sort,
  onChange,
}: {
  sort: RoleSort
  onChange: (next: RoleSort) => void
}) {
  const options: Array<{ value: RoleSort; label: string }> = [
    { value: 'rating-asc', label: 'Most resilient first' },
    { value: 'rating-desc', label: 'Most exposed first' },
    { value: 'alpha', label: 'A–Z' },
  ]
  return (
    <div className="flex flex-wrap" role="group" aria-label="Sort roles" style={{ gap: '6px' }}>
      {options.map((opt) => {
        const active = sort === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            style={{
              padding: '6px 12px',
              borderRadius: '9999px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.75rem',
              border: active
                ? '1px solid var(--pf-blue-700)'
                : '1px solid var(--pf-grey-300)',
              backgroundColor: active ? 'var(--pf-blue-100)' : 'var(--pf-white)',
              color: active ? 'var(--pf-blue-700)' : 'var(--pf-grey-600)',
              cursor: 'pointer',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function RoleTable({ roles, sectorId }: { roles: CareerRole[]; sectorId: string }) {
  return (
    <div
      className="pf-card"
      style={{ padding: 0, overflow: 'hidden' }}
    >
      <div className="overflow-x-auto">
        <table
          style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            fontSize: '0.875rem',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: 'var(--pf-grey-100)' }}>
              <th
                scope="col"
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--pf-grey-600)',
                  whiteSpace: 'nowrap',
                }}
              >
                Role
              </th>
              <th
                scope="col"
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--pf-grey-600)',
                  whiteSpace: 'nowrap',
                }}
              >
                AI impact (2030–2035)
              </th>
              <th
                scope="col"
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--pf-grey-600)',
                  minWidth: '260px',
                }}
              >
                What changes
              </th>
              <th
                scope="col"
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--pf-grey-600)',
                  whiteSpace: 'nowrap',
                }}
              >
                Salary
              </th>
              <th
                scope="col"
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--pf-grey-600)',
                  whiteSpace: 'nowrap',
                }}
              >
                Outlook
              </th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role, idx) => (
              <tr
                key={role.id}
                style={{
                  borderTop: idx === 0 ? '1px solid var(--pf-grey-100)' : 'none',
                  backgroundColor: idx % 2 === 0 ? 'var(--pf-white)' : 'rgba(244,244,246,0.4)',
                }}
              >
                <td
                  style={{
                    padding: '14px 16px',
                    color: 'var(--pf-grey-900)',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    verticalAlign: 'top',
                  }}
                >
                  <Link
                    href={`/careers/${sectorId}/${role.id}`}
                    style={{ color: 'var(--pf-blue-700)', textDecoration: 'none' }}
                    className="hover:underline"
                  >
                    {role.title}
                  </Link>
                </td>
                <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                  {role.ai_rating_2030_2035 != null
                    ? <AiRoleBadge rating={role.ai_rating_2030_2035} size="md" />
                    : <span style={{ color: 'var(--pf-grey-400)', fontSize: '0.75rem' }}>Not yet rated</span>}
                </td>
                <td
                  style={{
                    padding: '14px 16px',
                    color: 'var(--pf-grey-600)',
                    lineHeight: 1.55,
                    verticalAlign: 'top',
                  }}
                >
                  {role.ai_description}
                  {role.ai_rating_2030_2035 != null &&
                    role.ai_rating_2040_2045 != null &&
                    role.robotics_rating_2030_2035 != null &&
                    role.robotics_rating_2040_2045 != null && (
                      <HorizonRatings
                        aiRating2030={role.ai_rating_2030_2035}
                        aiRating2040={role.ai_rating_2040_2045}
                        roboticsRating2030={role.robotics_rating_2030_2035}
                        roboticsRating2040={role.robotics_rating_2040_2045}
                        roboticsDescription={role.robotics_description ?? ''}
                      />
                    )}
                </td>
                <td
                  style={{
                    padding: '14px 16px',
                    color: 'var(--pf-grey-900)',
                    fontSize: '0.8125rem',
                    verticalAlign: 'top',
                    minWidth: '140px',
                  }}
                >
                  {role.salary_entry || role.salary_experienced ? (
                    <>
                      <span style={{ whiteSpace: 'nowrap' }}>
                        {role.salary_entry && (
                          <span style={{ color: 'var(--pf-grey-600)' }}>£{role.salary_entry.toLocaleString('en-GB')}</span>
                        )}
                        {role.salary_entry && role.salary_experienced && (
                          <span style={{ color: 'var(--pf-grey-300)' }}> → </span>
                        )}
                        {role.salary_experienced && <span>£{role.salary_experienced.toLocaleString('en-GB')}</span>}
                      </span>
                      {role.salary_needs_verification && (
                        <span
                          style={{
                            display: 'inline-block',
                            marginLeft: '6px',
                            padding: '1px 6px',
                            fontSize: '0.625rem',
                            fontWeight: 600,
                            borderRadius: '4px',
                            backgroundColor: 'rgba(245, 158, 11, 0.14)',
                            color: 'var(--pf-amber-500)',
                            verticalAlign: 'middle',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Unverified
                        </span>
                      )}
                      {role.salary_source && (
                        <div
                          style={{
                            fontSize: '0.625rem',
                            color: 'var(--pf-grey-400)',
                            marginTop: '2px',
                            whiteSpace: 'normal',
                          }}
                        >
                          {role.salary_source.replace('ONS ASHE 2025 ', '')}
                        </div>
                      )}
                    </>
                  ) : (
                    <span style={{ color: 'var(--pf-grey-300)' }}>—</span>
                  )}
                </td>
                <td
                  style={{
                    padding: '14px 16px',
                    color: 'var(--pf-grey-600)',
                    fontSize: '0.8125rem',
                    verticalAlign: 'top',
                  }}
                >
                  {role.growth_outlook || (
                    <span style={{ color: 'var(--pf-grey-300)' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function NewAiRolesSection({ roles, sectorId }: { roles: CareerRole[]; sectorId: string }) {
  return (
    <div>
      <div className="flex items-center" style={{ gap: '10px', marginBottom: '8px' }}>
        <span
          aria-hidden="true"
          className="inline-flex items-center justify-center"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            color: 'var(--pf-green-500)',
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </span>
        <h3 style={{ margin: 0, fontSize: '1.0625rem' }}>
          New careers created by AI
        </h3>
      </div>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--pf-grey-600)',
          marginBottom: '16px',
          maxWidth: '720px',
        }}
      >
        These roles barely existed five years ago. Students starting school now will be the
        first generation to step straight into them.
      </p>
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
      >
        {roles.map((role) => (
          <div
            key={role.id}
            className="pf-card"
            style={{
              padding: '18px 20px',
              borderTop: '3px solid var(--pf-green-500)',
              backgroundColor: 'rgba(16, 185, 129, 0.04)',
            }}
          >
            <h4
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.9375rem',
                margin: 0,
                marginBottom: '8px',
              }}
            >
              <Link
                href={`/careers/${sectorId}/${role.id}`}
                style={{ color: 'var(--pf-blue-700)', textDecoration: 'none' }}
                className="hover:underline"
              >
                {role.title}
              </Link>
            </h4>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--pf-grey-600)',
                lineHeight: 1.55,
                marginBottom: '12px',
              }}
            >
              {role.ai_description}
            </p>
            {role.ai_rating_2030_2035 != null &&
              role.ai_rating_2040_2045 != null &&
              role.robotics_rating_2030_2035 != null &&
              role.robotics_rating_2040_2045 != null && (
                <HorizonRatings
                  aiRating2030={role.ai_rating_2030_2035}
                  aiRating2040={role.ai_rating_2040_2045}
                  roboticsRating2030={role.robotics_rating_2030_2035}
                  roboticsRating2040={role.robotics_rating_2040_2045}
                  roboticsDescription={role.robotics_description ?? ''}
                />
              )}
            <div className="flex flex-wrap items-center" style={{ gap: '8px', marginTop: '12px' }}>
              {role.ai_rating_2030_2035 != null && <AiRoleBadge rating={role.ai_rating_2030_2035} size="sm" showLabel={false} />}
              {role.salary_experienced && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--pf-grey-600)',
                  }}
                >
                  up to £{role.salary_experienced.toLocaleString('en-GB')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Splits the SQA subjects paragraph at commas/semicolons and turns any
// segment whose head matches a linked subject name into a /subjects/[id]
// link. Falls back to plain text for unmatched segments (e.g. "N5/Higher").
function renderSubjectsText(
  text: string,
  subjectByName: Map<string, CareerSubjectRow>
): React.ReactNode {
  const parts = text.split(/([,;])/)
  return parts.map((part, idx) => {
    if (part === ',' || part === ';') return <span key={idx}>{part}</span>
    const trimmed = part.trim()
    if (!trimmed) return <span key={idx}>{part}</span>
    // Try to find the longest matching subject prefix in the segment.
    let matched: CareerSubjectRow | null = null
    let matchedName = ''
    for (const [lower, subj] of subjectByName) {
      if (trimmed.toLowerCase().startsWith(lower) && lower.length > matchedName.length) {
        matched = subj
        matchedName = lower
      }
    }
    if (!matched) {
      return <span key={idx}>{part}</span>
    }
    const headLength = matchedName.length
    const head = trimmed.slice(0, headLength)
    const tail = trimmed.slice(headLength)
    const leading = part.slice(0, part.indexOf(trimmed))
    return (
      <span key={idx}>
        {leading}
        <Link
          href={`/subjects/${matched.id}`}
          style={{
            color: 'var(--pf-blue-700)',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          {head}
        </Link>
        {tail}
      </span>
    )
  })
}

function ExploreFurther({ sector }: { sector: ExploreFurtherSector }) {
  const professional = isExternalLinkArray(sector.external_links)
    ? (sector.external_links as ExternalLink[])
    : []

  const mwowHref = `https://www.myworldofwork.co.uk/explore-careers/job-profiles?search=${encodeURIComponent(
    sector.name
  )}`
  const apprenticesHref = 'https://www.apprenticeships.scot'

  return (
    <section>
      <h2 style={{ marginBottom: '6px' }}>Explore Further</h2>
      <p
        style={{
          color: 'var(--pf-grey-600)',
          fontSize: '0.9375rem',
          marginBottom: '20px',
        }}
      >
        Trusted Scottish and UK bodies for deeper research on this sector.
      </p>
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
      >
        <ExploreCard
          name="My World of Work"
          description="Scotland's official careers service — job profiles, pay, and day-to-day tasks."
          url={mwowHref}
        />
        <ExploreCard
          name="apprenticeships.scot"
          description="Foundation, Modern, and Graduate Apprenticeships across Scotland."
          url={apprenticesHref}
        />
        {professional.map((link) => (
          <ExploreCard
            key={link.url}
            name={link.name}
            description={link.description ?? ''}
            url={link.url}
          />
        ))}
      </div>
    </section>
  )
}

function ExploreCard({
  name,
  description,
  url,
}: {
  name: string
  description: string
  url: string
}) {
  let host = ''
  try {
    host = new URL(url).host.replace(/^www\./, '')
  } catch {
    host = ''
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="pf-card-hover no-underline hover:no-underline"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '18px 20px',
        color: 'var(--pf-grey-900)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '10px',
          marginBottom: '4px',
        }}
      >
        <h3
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: 'var(--pf-grey-900)',
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {name}
        </h3>
        <svg
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
          style={{ color: 'var(--pf-blue-500)', flexShrink: 0, marginTop: '3px' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </div>
      {description && (
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--pf-grey-600)',
            lineHeight: 1.5,
            margin: 0,
            marginBottom: '8px',
          }}
        >
          {description}
        </p>
      )}
      {host && (
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
      )}
    </a>
  )
}

function CourseRow({ course }: { course: CareerSectorPageCourse }) {
  const degree = course.degree_type
    ? DEGREE_TYPES[course.degree_type as keyof typeof DEGREE_TYPES]
    : null
  const entry = course.entry_requirements as { highers?: string } | null

  return (
    <Link
      href={`/courses/${course.id}`}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 no-underline hover:no-underline"
      style={{
        padding: '10px 12px',
        borderRadius: '8px',
        color: 'var(--pf-grey-900)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--pf-blue-50)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      <div className="min-w-0 flex-1">
        <p
          className="truncate"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: 'var(--pf-grey-900)',
          }}
        >
          {course.name}
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
          {degree ? degree.label : course.degree_type}
          {entry?.highers ? ` · ${entry.highers}` : ''}
        </p>
      </div>
      <svg
        className="w-4 h-4 flex-shrink-0"
        style={{ color: 'var(--pf-blue-500)' }}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
