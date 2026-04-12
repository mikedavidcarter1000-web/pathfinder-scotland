'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useCurrentStudent } from '@/hooks/use-student'
import { useHasAcceptedOffer } from '@/hooks/use-offers'
import { usePrepChecklist, useToggleChecklistItem, usePrepProgress } from '@/hooks/use-prep'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { VerificationCaveat } from '@/components/ui/VerificationCaveat'
import type { Tables } from '@/types/database'

type Student = Tables<'students'>

// ── Checklist data model ─────────────────────────────────────────────────────

type OfferStatus = 'accepted'

interface ChecklistItemDef {
  key: string
  title: string
  description: string | ((student: Student | null, university: string) => string)
  link?: string | ((university: Tables<'universities'> | null) => string | undefined)
  linkLabel?: string
  deadline?: string
  /** Return false to hide the item for this student */
  condition?: (student: Student | null) => boolean
  /** Extra personalised info block */
  extra?: (student: Student | null) => string | null
}

interface Phase {
  title: string
  subtitle: string
  items: ChecklistItemDef[]
}

function buildChecklist(): Phase[] {
  return [
    {
      title: 'Confirm your place',
      subtitle: 'Immediately after accepting',
      items: [
        {
          key: 'ucas-accept',
          title: 'Accept your offer on UCAS',
          description: 'Log into UCAS Hub and formally accept your firm and insurance choices.',
          link: 'https://www.ucas.com/dashboard',
          linkLabel: 'Go to UCAS Hub',
          deadline: 'Check UCAS deadline',
        },
        {
          key: 'saas-funding',
          title: 'Apply for SAAS funding',
          description: 'Apply for tuition fee payment and student bursary/loan. Apply by 30 June for guaranteed processing before your course starts.',
          link: 'https://www.saas.gov.uk',
          linkLabel: 'Apply on SAAS',
          deadline: 'Apply by 30 June',
          extra: (student) => {
            const parts: string[] = []
            if (student?.household_income_band) {
              const band = student.household_income_band
              const bursaryMap: Record<string, string> = {
                'under_21000': '\u00a37,750',
                '21000_24000': '\u00a35,750',
                '24000_34000': '\u00a32,750',
                'over_34000': '\u00a31,000',
              }
              const loanMap: Record<string, string> = {
                'under_21000': '\u00a35,750',
                '21000_24000': '\u00a35,750',
                '24000_34000': '\u00a35,750',
                'over_34000': '\u00a34,750',
              }
              const bursary = bursaryMap[band]
              const loan = loanMap[band]
              if (bursary && loan) {
                parts.push(`Based on your income band, you could receive a bursary of ${bursary} plus a loan of ${loan}.`)
              }
            }
            if (student?.care_experienced) {
              parts.push("You're eligible for the Care Experienced Bursary of \u00a39,000/year \u2014 tick the CESB box on your SAAS application.")
            }
            return parts.length > 0 ? parts.join(' ') : null
          },
        },
        {
          key: 'accommodation',
          title: 'Apply for accommodation',
          description: 'Apply for university halls or start looking for private accommodation.',
          link: (uni) => uni?.undergraduate_url ?? uni?.website ?? undefined,
          linkLabel: 'View university accommodation',
          extra: (student) => {
            if (student?.care_experienced) {
              return "You may be eligible for guaranteed 365-day accommodation \u2014 check with your university."
            }
            return null
          },
        },
      ],
    },
    {
      title: 'Sort your finances',
      subtitle: 'May \u2013 July',
      items: [
        {
          key: 'bank-account',
          title: 'Open a student bank account',
          description: "Compare student bank accounts and open one before September. You'll need this for SAAS payments.",
          link: '/benefits?category=banking',
          linkLabel: 'Compare bank accounts',
          extra: () =>
            "Top options: Santander Edge (free 4-year railcard + \u00a31,500 overdraft), NatWest/RBS (up to \u00a33,250 overdraft + \u00a385 cash), Bank of Scotland (\u00a3100 cash + \u00a390 Deliveroo). Scottish students starting at 17: Bank of Scotland, RBS, NatWest, Lloyds, and TSB accept 17-year-olds.",
        },
        {
          key: 'bursary-check',
          title: 'Check your bursary eligibility',
          description: 'See all bursaries and grants you could be eligible for.',
          link: '/benefits?category=funding',
          linkLabel: 'View bursaries',
          extra: (student) => {
            if (student?.demographic_completed) {
              // Rough estimate based on income band
              const band = student.household_income_band
              const estimates: Record<string, string> = {
                'under_21000': '\u00a313,500',
                '21000_24000': '\u00a311,500',
                '24000_34000': '\u00a38,500',
                'over_34000': '\u00a35,750',
              }
              const est = band ? estimates[band] : null
              if (est) return `Based on your profile, you could receive approximately ${est}/year.`
            }
            if (!student?.demographic_completed) {
              return 'Complete your funding profile to see exactly what you\'re entitled to.'
            }
            return null
          },
        },
        {
          key: 'young-scot',
          title: 'Get your Young Scot NEC / activate free bus travel',
          description: "If you're under 22, activate free bus travel. If you don't have a Young Scot card yet, apply now.",
          link: 'https://www.getyournec.scot',
          linkLabel: 'Get your NEC',
          condition: (student) => {
            // Show for under 22s or if we don't know their age (default show)
            if (!student?.school_stage) return true
            return true // We don't have DOB — show by default for all students
          },
        },
        {
          key: 'council-tax',
          title: 'Apply for council tax exemption',
          description: "Full-time students are exempt from council tax. You'll need a student certificate from your university.",
          link: 'https://www.mygov.scot/council-tax/discounts-exemptions-and-reductions',
          linkLabel: 'Learn about council tax exemption',
          extra: () => "You'll get your student certificate after enrolling in September.",
        },
      ],
    },
    {
      title: 'Prepare for your course',
      subtitle: 'July \u2013 August',
      items: [
        {
          key: 'it-access',
          title: 'Get your student email and IT access',
          description: "Most universities send login details over summer. Check your university's new students page.",
          link: (uni) => uni?.website ?? undefined,
          linkLabel: 'Visit university website',
        },
        {
          key: 'free-software',
          title: 'Explore free software',
          description: 'As a student, you get thousands of pounds worth of free software.',
          link: '/benefits?category=technology',
          linkLabel: 'View free software',
          extra: () =>
            "GitHub Student Developer Pack (\u00a310,000+ value, age 13+), Microsoft Office 365 (free), Adobe Creative Cloud (65\u201375% off), JetBrains IDEs (free), Autodesk (free).",
        },
        {
          key: 'discount-card',
          title: 'Get a student discount card',
          description: 'Sign up for UNiDAYS and Student Beans for discounts at 800+ brands.',
          link: '/benefits?category=retail_fashion',
          linkLabel: 'View discounts',
        },
        {
          key: 'travel',
          title: 'Sort your travel',
          description: 'Get a 16\u201325 Railcard (\u00a330/year, 1/3 off rail fares). If you bank with Santander, you get one free for 4 years.',
          link: '/benefits?category=travel_transport',
          linkLabel: 'View travel discounts',
        },
      ],
    },
    {
      title: 'Settle in',
      subtitle: 'September',
      items: [
        {
          key: 'freshers',
          title: "Attend freshers' week",
          description: "Go to as many events as you can \u2014 this is the best time to meet people, join societies, and learn your way around.",
        },
        {
          key: 'register-gp',
          title: 'Register with a GP',
          description: "Register with a local GP near your university or halls. Free prescriptions in Scotland mean you don't need to worry about costs.",
          link: 'https://www.nhsinform.scot/care-support-and-rights/nhs-services/doctors/registering-with-a-gp-practice',
          linkLabel: 'Find a GP',
        },
        {
          key: 'study-space',
          title: 'Set up your study space',
          description: "Whether you're in halls or at home, set up a dedicated study area. Check if your university offers free laptop loans or digital support.",
        },
        {
          key: 'course-community',
          title: "Join your course's online community",
          description: 'Most courses have group chats, Teams channels, or Discord servers. Ask at welcome sessions.',
        },
      ],
    },
  ]
}

// Build personalised extra items for care-experienced, disability, estranged students
function getPersonalisedItems(student: Student | null): ChecklistItemDef[] {
  const extras: ChecklistItemDef[] = []

  if (student?.care_experienced) {
    extras.push({
      key: 'ce-university-support',
      title: 'Contact university care-experienced support',
      description: 'Most Scottish universities have a dedicated care-experienced contact. Get in touch early for priority support with accommodation, funding, and pastoral care.',
      extra: () => 'As a care-experienced student, you may also be eligible for a summer accommodation grant.',
    })
  }

  if (student?.has_disability) {
    extras.push({
      key: 'dsa-application',
      title: "Apply for Disabled Students' Allowance (DSA)",
      description: 'DSA can fund specialist equipment, study support, and other costs related to your disability. Apply as early as possible \u2014 assessments can take time.',
      link: 'https://www.saas.gov.uk/full-time/other-funding/disabled-students-allowance',
      linkLabel: 'Apply for DSA',
    })
    extras.push({
      key: 'disability-service',
      title: 'Contact university disability service',
      description: 'Let your university know about your support needs before you arrive so reasonable adjustments are in place from day one.',
    })
  }

  if (student?.is_estranged) {
    extras.push({
      key: 'estranged-bursary',
      title: "Check estranged students' bursary",
      description: 'Estranged students may qualify for the independent student assessment and additional SAAS bursary. Contact your university\'s student funding team.',
    })
  }

  return extras
}

// ── The page component ───────────────────────────────────────────────────────

// Total count including possible personalised items (max 15 base + extras)
function countVisibleItems(phases: Phase[], student: Student | null): number {
  let count = 0
  for (const phase of phases) {
    for (const item of phase.items) {
      if (!item.condition || item.condition(student)) count++
    }
  }
  count += getPersonalisedItems(student).length
  return count
}

export default function PrepPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { data: student, isLoading: studentLoading } = useCurrentStudent() as { data: Student | null | undefined; isLoading: boolean }
  const { hasAccepted, acceptedOffer, acceptedOffers } = useHasAcceptedOffer()
  const { data: checklistItems } = usePrepChecklist()
  const toggleItem = useToggleChecklistItem()

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/sign-in')
    }
  }, [authLoading, user, router])

  if (authLoading || studentLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
        <div className="pf-container pt-8 pb-16">
          <Skeleton width="60%" height={32} rounded="md" />
          <div style={{ height: '12px' }} />
          <Skeleton width="40%" height={20} rounded="sm" />
          <div style={{ height: '32px' }} />
          <Skeleton variant="card" />
          <div style={{ height: '16px' }} />
          <Skeleton variant="card" />
        </div>
      </div>
    )
  }

  if (!user) return null

  // No accepted offers — show helpful CTA
  if (!hasAccepted) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
        <div className="pf-container pt-12 pb-16">
          <div
            className="max-w-xl mx-auto text-center"
            style={{ padding: '48px 24px' }}
          >
            <div
              className="mx-auto mb-6 flex items-center justify-center rounded-full"
              style={{
                width: '72px',
                height: '72px',
                backgroundColor: 'var(--pf-blue-100)',
                color: 'var(--pf-blue-700)',
              }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>
              Accept a university offer to unlock your Prep Hub
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--pf-grey-600)', marginBottom: '24px', maxWidth: '420px', marginInline: 'auto' }}>
              Once you accept an offer, we&apos;ll create a personalised checklist to help you prepare for everything from funding to freshers&apos; week.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/courses" className="pf-btn-primary no-underline hover:no-underline justify-center" style={{ minHeight: '44px' }}>
                Browse courses
              </Link>
              <Link href="/dashboard" className="pf-btn-secondary no-underline hover:no-underline justify-center" style={{ minHeight: '44px' }}>
                Update your applications
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Build checklist
  const phases = buildChecklist()
  const personalisedItems = getPersonalisedItems(student ?? null)
  const totalItems = countVisibleItems(phases, student ?? null)

  const isChecked = (key: string) =>
    checklistItems?.some((i) => i.item_key === key && i.is_completed) ?? false

  const getCompletedAt = (key: string) =>
    checklistItems?.find((i) => i.item_key === key && i.is_completed)?.completed_at ?? null

  // Count completed
  let completedCount = 0
  for (const phase of phases) {
    for (const item of phase.items) {
      if (item.condition && !item.condition(student ?? null)) continue
      if (isChecked(item.key)) completedCount++
    }
  }
  for (const item of personalisedItems) {
    if (isChecked(item.key)) completedCount++
  }
  const progressPct = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0

  // Determine primary accepted offer (firm first, then first accepted)
  const primaryOffer = acceptedOffer
  const uniName = primaryOffer?.course?.university?.name ?? 'university'
  const courseName = primaryOffer?.course?.name ?? 'your course'
  const university = primaryOffer?.course?.university ?? null

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      {/* Hero */}
      <div style={{ backgroundColor: 'var(--pf-white)' }}>
        <div className="pf-container pt-8 pb-8">
          <div className="flex items-start gap-6">
            <div className="flex-1 min-w-0">
              <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', marginBottom: '4px' }}>
                Get ready for {uniName}
              </h1>
              <p style={{ fontSize: '1.0625rem', color: 'var(--pf-grey-600)' }}>
                {courseName} &mdash; starting September 2026
              </p>
            </div>
            {/* Decorative icon */}
            <div
              className="hidden sm:flex items-center justify-center flex-shrink-0 rounded-xl"
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--pf-green-500)',
              }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
              </svg>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-900)', fontWeight: 500 }}>
                {completedCount} of {totalItems} tasks completed
              </span>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'var(--pf-blue-700)',
                }}
              >
                {progressPct}% ready
              </span>
            </div>
            <div
              className="rounded-full overflow-hidden"
              style={{ height: '10px', backgroundColor: 'var(--pf-grey-100)' }}
            >
              <div
                className="rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progressPct}%`,
                  height: '100%',
                  backgroundColor: 'var(--pf-blue-700)',
                  minWidth: completedCount > 0 ? '12px' : '0',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Phases */}
      <div className="pf-container pt-8 pb-16">
        <div className="max-w-3xl mx-auto space-y-10">
          {phases.map((phase, phaseIdx) => {
            const visibleItems = phase.items.filter(
              (item) => !item.condition || item.condition(student ?? null)
            )
            if (visibleItems.length === 0) return null

            return (
              <section key={phaseIdx}>
                {/* Phase header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="flex items-center justify-center flex-shrink-0 rounded-full"
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: 'var(--pf-blue-700)',
                      color: '#fff',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.875rem',
                    }}
                  >
                    {phaseIdx + 1}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0' }}>
                      {phase.title}
                    </h2>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                      {phase.subtitle}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {visibleItems.map((item) => (
                    <ChecklistCard
                      key={item.key}
                      item={item}
                      student={student ?? null}
                      university={university}
                      checked={isChecked(item.key)}
                      completedAt={getCompletedAt(item.key)}
                      onToggle={(checked) => toggleItem.mutate({ itemKey: item.key, isCompleted: checked })}
                    />
                  ))}
                </div>
              </section>
            )
          })}

          {/* Demographic financial support callouts */}
          <DemographicCallouts student={student ?? null} />

          {/* Personalised items section */}
          {personalisedItems.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex items-center justify-center flex-shrink-0 rounded-full"
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: 'var(--pf-amber-500)',
                    color: '#fff',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.875rem',
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '0' }}>
                    Personalised for you
                  </h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                    Based on your profile
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {personalisedItems.map((item) => (
                  <ChecklistCard
                    key={item.key}
                    item={item}
                    student={student ?? null}
                    university={university}
                    checked={isChecked(item.key)}
                    completedAt={getCompletedAt(item.key)}
                    onToggle={(checked) => toggleItem.mutate({ itemKey: item.key, isCompleted: checked })}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Demographic financial support callouts ───────────────────────────────────

function DemographicCallouts({ student }: { student: Student | null }) {
  if (!student) return null
  const showYoungCarer = !!student.is_young_carer
  const showDisability = !!student.has_disability
  // is_young_parent is the closest flag for lone parent eligibility
  const showLoneParent = !!student.is_young_parent
  if (!showYoungCarer && !showDisability && !showLoneParent) return null

  const calloutLinkStyle = {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 600 as const,
    fontSize: '0.875rem',
    color: 'var(--pf-blue-500)',
  }

  const chevron = (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex items-center justify-center flex-shrink-0 rounded-full"
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'var(--pf-blue-100)',
            color: 'var(--pf-blue-700)',
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0' }}>Additional financial support</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>Based on your profile</p>
        </div>
      </div>

      <div className="space-y-3">
        {showYoungCarer && (
          <div
            className="pf-card"
            style={{ padding: '20px 24px', borderLeft: '4px solid var(--pf-blue-500)' }}
          >
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
                color: 'var(--pf-grey-900)',
                marginBottom: '8px',
              }}
            >
              Young Carer Grant
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', lineHeight: 1.6, marginBottom: '8px' }}>
              As a young carer, you may also be entitled to the Young Carer Grant (&pound;405.10/year
              from Social Security Scotland).
            </p>
            <VerificationCaveat
              org="Social Security Scotland"
              url="https://www.mygov.scot/young-carer-grant"
              year="2026-27"
            />
            <div className="mt-3">
              <Link href="/support/young-carers" className="inline-flex items-center gap-1.5 no-underline hover:underline" style={calloutLinkStyle}>
                Find out more {chevron}
              </Link>
            </div>
          </div>
        )}

        {showDisability && (
          <div
            className="pf-card"
            style={{ padding: '20px 24px', borderLeft: '4px solid var(--pf-blue-500)' }}
          >
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
                color: 'var(--pf-grey-900)',
                marginBottom: '8px',
              }}
            >
              Disabled Students&apos; Allowance (DSA)
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', lineHeight: 1.6, marginBottom: '8px' }}>
              As a student with a disability or long-term condition, you may be entitled to the
              Disabled Students Allowance (DSA) &mdash; up to &pound;20,520/year for non-medical
              personal help, &pound;5,160 for specialist equipment, and &pound;1,725/year for
              consumables. This is in addition to your standard SAAS support.
            </p>
            <VerificationCaveat
              org="SAAS"
              url="https://www.saas.gov.uk/guides/disabled-students-allowance"
              year="2025-26"
            />
            <div className="mt-3">
              <Link href="/support/disability" className="inline-flex items-center gap-1.5 no-underline hover:underline" style={calloutLinkStyle}>
                Find out more {chevron}
              </Link>
            </div>
          </div>
        )}

        {showLoneParent && (
          <div
            className="pf-card"
            style={{ padding: '20px 24px', borderLeft: '4px solid var(--pf-blue-500)' }}
          >
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
                color: 'var(--pf-grey-900)',
                marginBottom: '8px',
              }}
            >
              Lone Parents Grant
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', lineHeight: 1.6, marginBottom: '8px' }}>
              If you are a lone parent, you may also be entitled to the Lone Parents Grant
              (up to &pound;1,305/year) and Lone Parents Childcare Grant (up to &pound;1,215/year)
              from SAAS.
            </p>
            <VerificationCaveat
              org="SAAS"
              url="https://www.saas.gov.uk"
              year="2025-26"
            />
            <div className="mt-3">
              <Link href="/support/young-parents" className="inline-flex items-center gap-1.5 no-underline hover:underline" style={calloutLinkStyle}>
                Find out more {chevron}
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// ── Checklist card component ─────────────────────────────────────────────────

function ChecklistCard({
  item,
  student,
  university,
  checked,
  completedAt,
  onToggle,
}: {
  item: ChecklistItemDef
  student: Student | null
  university: Tables<'universities'> | null
  checked: boolean
  completedAt: string | null
  onToggle: (checked: boolean) => void
}) {
  const description =
    typeof item.description === 'function'
      ? item.description(student, university?.name ?? 'your university')
      : item.description

  const link =
    typeof item.link === 'function' ? item.link(university) : item.link

  const extra = item.extra ? item.extra(student) : null

  const isExternal = link?.startsWith('http')

  return (
    <div
      className="pf-card"
      style={{
        padding: '20px 24px',
        opacity: checked ? 0.75 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(!checked)}
          className="flex-shrink-0 mt-0.5 flex items-center justify-center rounded-md transition-colors"
          style={{
            width: '24px',
            height: '24px',
            border: checked ? 'none' : '2px solid var(--pf-grey-300)',
            backgroundColor: checked ? 'var(--pf-green-500)' : 'transparent',
            color: '#fff',
            cursor: 'pointer',
          }}
          aria-label={checked ? `Mark "${item.title}" as incomplete` : `Mark "${item.title}" as complete`}
        >
          {checked && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '1rem',
              color: 'var(--pf-grey-900)',
              marginBottom: '4px',
              textDecoration: checked ? 'line-through' : 'none',
            }}
          >
            {item.title}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', lineHeight: 1.6, marginBottom: extra ? '8px' : '0' }}>
            {description}
          </p>

          {/* Extra personalised info */}
          {extra && (
            <div
              className="rounded-lg"
              style={{
                padding: '10px 14px',
                backgroundColor: 'var(--pf-blue-50)',
                border: '1px solid var(--pf-blue-100)',
                marginBottom: '8px',
              }}
            >
              <p style={{ fontSize: '0.8125rem', color: 'var(--pf-blue-700)', lineHeight: 1.5 }}>
                {extra}
              </p>
            </div>
          )}

          {/* Deadline */}
          {item.deadline && !checked && (
            <div className="flex items-center gap-1.5 mt-2 mb-2">
              <svg className="w-3.5 h-3.5" style={{ color: 'var(--pf-amber-500)' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span style={{ fontSize: '0.8125rem', color: 'var(--pf-amber-500)', fontWeight: 500 }}>
                {item.deadline}
              </span>
            </div>
          )}

          {/* Completed timestamp */}
          {checked && completedAt && (
            <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)', marginTop: '4px' }}>
              Completed {new Date(completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}

          {/* CTA link */}
          {link && !checked && (
            <div className="mt-3">
              {isExternal ? (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 no-underline hover:underline"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'var(--pf-blue-500)',
                  }}
                >
                  {item.linkLabel ?? 'Learn more'}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ) : (
                <Link
                  href={link}
                  className="inline-flex items-center gap-1.5 no-underline hover:underline"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'var(--pf-blue-500)',
                  }}
                >
                  {item.linkLabel ?? 'Learn more'}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
