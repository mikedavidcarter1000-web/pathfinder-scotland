'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useCurrentStudent, useGradeSummary, useBackfillGradeSubjectIds, useStudentGrades } from '@/hooks/use-student'
import { useDashboardStats } from '@/hooks/use-dashboard'
import {
  ProfileSummary,
  GradesSection,
  SavedCoursesSection,
  SubjectChoicesSection,
  WideningAccessCard,
  ProgressChecklist,
  ParentDashboard,
  BenefitsCard,
  ApplicationsSection,
  PrepHubCard,
  SavedComparisonsCard,
} from '@/components/dashboard'
import { StalePostcodeBanner } from '@/components/StalePostcodeBanner'
import { WellbeingBanner } from '@/components/dashboard/wellbeing-banner'
import { WorkExperienceCard } from '@/components/dashboard/work-experience-card'
import { ParentDashboardV2 } from '@/components/dashboard/parent-dashboard-v2'
import { ShareWithParentButton } from '@/components/dashboard/share-with-parent-button'
import { PersonalStatementCard } from '@/components/dashboard/personal-statement-card'
import { StatsCard, StatsGrid } from '@/components/ui/stats-card'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { SlowLoadingNotice } from '@/components/ui/slow-loading-notice'
import type { Tables } from '@/types/database'

type Student = Tables<'students'>

export default function DashboardPage() {
  const router = useRouter()
  const { user, parent, isLoading: authLoading } = useAuth()
  const { data: student, isLoading: studentLoading } = useCurrentStudent() as { data: Student | null | undefined; isLoading: boolean }
  const stats = useDashboardStats()
  const gradeSummary = useGradeSummary()
  const { data: grades } = useStudentGrades() as { data: Tables<'student_grades'>[] | undefined }
  const backfillGrades = useBackfillGradeSubjectIds()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/sign-in')
    }
  }, [authLoading, user, router])

  // If the student has any pre-existing grades with null subject_id (from the
  // legacy free-text flow), try to resolve them once per mount. Harmless to
  // re-run — the mutation no-ops when everything is already linked.
  useEffect(() => {
    if (!user || !grades || backfillGrades.isPending || backfillGrades.isSuccess) return
    const needsBackfill = grades.some((g) => !g.subject_id)
    if (needsBackfill) {
      backfillGrades.mutate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, grades])

  useEffect(() => {
    // Unauthenticated: handled above. A signed-in user with neither a student
    // nor a parent profile still needs onboarding. The auth context treats
    // parents with a `parents` row as onboarded.
    if (!authLoading && !studentLoading && user && !student && !parent) {
      router.push('/onboarding')
    }
  }, [authLoading, studentLoading, user, student, parent, router])

  if (authLoading || studentLoading) {
    return (
      <div className="pf-container pt-8 sm:pt-10 pb-12 sm:pb-16">
        <div className="mb-8">
          <Skeleton width="260px" height={32} rounded="md" />
          <div style={{ height: '8px' }} />
          <Skeleton width="360px" height={18} rounded="sm" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="pf-card">
              <Skeleton width="50%" height={14} rounded="sm" />
              <div style={{ height: '12px' }} />
              <Skeleton width="40%" height={28} rounded="md" />
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
          <div className="space-y-6">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
        </div>
        <SlowLoadingNotice isLoading={authLoading || studentLoading} />
      </div>
    )
  }

  // Parent path (new dedicated parents table): render the linked-children view.
  if (!user) return null
  if (parent) {
    return <ParentDashboardV2 parent={parent} />
  }
  if (!student) {
    return null
  }

  // Legacy path: users who signed up as parents BEFORE the dedicated parents
  // table was introduced will still have a students row with user_type='parent'.
  // Fall back to the older timeline-based parent dashboard for them.
  if (student.user_type === 'parent') {
    return <ParentDashboard student={student} />
  }

  return (
    <div className="pf-container pt-8 sm:pt-10 pb-12 sm:pb-16">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1
          style={{ marginBottom: '4px', fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}
          className="break-words"
        >
          Welcome back, {student.first_name}
        </h1>
        <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
          Track your progress and manage your university applications
        </p>
      </div>

      <StalePostcodeBanner />
      <WellbeingBanner />
      <WorkExperienceCard />

      {/* Stats Row */}
      <div className="mb-8">
        <StatsGrid columns={4}>
          <StatsCard
            label="Saved Courses"
            value={stats.savedCount}
            icon={
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
          />
          <StatsCard
            label="Your Grades"
            value={stats.gradeCount}
            icon={
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <StatsCard
            label="Eligible Courses"
            value={stats.eligibleCount}
            caption={
              stats.eligibleViaWaCount > 0
                ? `${stats.eligibleViaWaCount} via widening access`
                : undefined
            }
            icon={
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard
            label="UCAS Points"
            value={stats.ucasPoints}
            icon={
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        </StatsGrid>
      </div>

      {/* Results Day Card */}
      <div className="mb-6">
        <Link
          href="/results-day"
          className="pf-card-hover no-underline hover:no-underline flex items-center gap-4"
          style={{ padding: '20px 24px', backgroundColor: 'var(--pf-blue-900)' }}
        >
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.12)',
              color: '#fff',
            }}
            aria-hidden="true"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
                color: '#fff',
                marginBottom: '2px',
              }}
            >
              Results Day — update your grades
            </p>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>
              Enter your actual results to see your confirmed options
            </p>
          </div>
          <svg
            className="w-5 h-5 flex-shrink-0"
            style={{ color: 'rgba(255,255,255,0.7)' }}
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

      {/* Prep Hub Card (shows when accepted offer exists) */}
      <div className="mb-6">
        <PrepHubCard />
      </div>

      {/* Personal statement card — silently hidden for students with no draft */}
      <div className="mb-6">
        <PersonalStatementCard />
      </div>

      {/* Progress checklist */}
      <div className="mb-6">
        <ProgressChecklist />
      </div>

      {/* Grade Sensitivity card — shown when student has grades entered */}
      {gradeSummary.totalGrades > 0 && (
        <div className="mb-6">
          <Link
            href="/tools/grade-sensitivity"
            className="pf-card-hover no-underline hover:no-underline flex items-center gap-4"
            style={{ padding: '20px 24px' }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--pf-green-500)',
              }}
              aria-hidden="true"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: 'var(--pf-grey-900)',
                  marginBottom: '2px',
                }}
              >
                See how your grades affect your options
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
                Find out which single grade change would unlock the most courses for you.
              </p>
            </div>
            <svg
              className="w-5 h-5 flex-shrink-0"
              style={{ color: 'var(--pf-green-500)' }}
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
      )}

      {/* Subject choice worksheet (shown for S2–S5 students) */}
      {['s2', 's3', 's4', 's5'].includes(student.school_stage ?? '') && (
        <div className="mb-6">
          <Link
            href="/tools/worksheet"
            className="pf-card-hover no-underline hover:no-underline flex items-center gap-4"
            style={{ padding: '20px 24px' }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                backgroundColor: 'var(--pf-blue-100)',
                color: 'var(--pf-blue-700)',
              }}
              aria-hidden="true"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: 'var(--pf-grey-900)',
                  marginBottom: '2px',
                }}
              >
                Print your subject choice worksheet
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
                Personalised worksheet for your guidance meeting — career mapping, course impact, and funding.
              </p>
            </div>
            <svg
              className="w-5 h-5 flex-shrink-0"
              style={{ color: 'var(--pf-blue-700)' }}
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
      )}

      {/* Discover prompt — surfaces the dual-path entry point for students
          who still feel lost even with an account set up. */}
      <div className="mb-6">
        <Link
          href="/discover"
          className="pf-card-hover no-underline hover:no-underline flex items-center gap-4"
          style={{ padding: '20px 24px' }}
        >
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: 'var(--pf-blue-100)',
              color: 'var(--pf-blue-700)',
            }}
            aria-hidden="true"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.24 7.76l-2.12 5.66-5.66 2.12 2.12-5.66 5.66-2.12z" />
              <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
                color: 'var(--pf-grey-900)',
                marginBottom: '2px',
              }}
            >
              Not sure where to start? Discover your path
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
              Explore careers and subjects, whether you have an idea or you&apos;re still figuring it out.
            </p>
          </div>
          <svg
            className="w-5 h-5 flex-shrink-0"
            style={{ color: 'var(--pf-blue-700)' }}
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

      {/* Widening Access Highlight (only renders if eligible) */}
      <div className="mb-6">
        <WideningAccessCard />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <ApplicationsSection />
          <GradesSection />
          <SubjectChoicesSection />
          <SavedCoursesSection />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ProfileSummary />

          {/* Benefits you might be missing */}
          <BenefitsCard />

          {/* Recent saved career comparisons */}
          <SavedComparisonsCard />

          {/* Quick Actions */}
          <div className="pf-card">
            <h2 style={{ marginBottom: '16px', fontSize: '1.125rem' }}>Quick Actions</h2>
            <div className="space-y-2">
              <QuickAction
                href="/courses"
                title="Browse Courses"
                subtitle="Find your perfect course"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
              <QuickAction
                href="/universities"
                title="Explore Universities"
                subtitle="Compare Scottish unis"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
              />
              <QuickAction
                href="/pathways"
                title="Plan Subject Choices"
                subtitle="Map your senior phase"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                }
              />
              <QuickAction
                href="/widening-access"
                title="Widening Access"
                subtitle="Learn about support"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
              />
              <QuickAction
                href="/offers/saved"
                title="Saved Offers"
                subtitle="Your bookmarked discounts"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                }
              />
            </div>
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--pf-grey-100)' }}>
              <ShareWithParentButton student={student} />
            </div>
          </div>

          {/* Grade Summary Card */}
          {gradeSummary.totalGrades > 0 && (
            <div
              className="rounded-lg"
              style={{
                padding: '24px',
                backgroundColor: 'var(--pf-blue-900)',
                color: '#fff',
              }}
            >
              <h2 style={{ color: '#fff', marginBottom: '16px', fontSize: '1.125rem' }}>Your Grade Profile</h2>
              <div className="space-y-3">
                {gradeSummary.highers && (
                  <GradeSummaryRow label="Highers" value={gradeSummary.highers} />
                )}
                {gradeSummary.advancedHighers && (
                  <GradeSummaryRow label="Advanced Highers" value={gradeSummary.advancedHighers} />
                )}
                {gradeSummary.national5s && (
                  <GradeSummaryRow label="National 5s" value={gradeSummary.national5s} />
                )}
                <div
                  className="pt-3"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}
                >
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>UCAS Tariff</span>
                    <span
                      className="pf-data-number"
                      style={{ fontSize: '1.5rem', fontWeight: 700 }}
                    >
                      {gradeSummary.ucasPoints}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Grades CTA */}
          {gradeSummary.totalGrades === 0 && (
            <div
              className="text-center"
              style={{
                padding: '24px',
                borderRadius: '8px',
                backgroundColor: 'var(--pf-blue-50)',
                border: '1px dashed var(--pf-blue-500)',
              }}
            >
              <svg
                className="w-10 h-10 mx-auto mb-3"
                style={{ color: 'var(--pf-blue-500)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 style={{ fontSize: '1rem', marginBottom: '4px' }}>Add your grades</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
                Enter your grades to see which courses you&apos;re eligible for.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function QuickAction({
  href,
  title,
  subtitle,
  icon,
}: {
  href: string
  title: string
  subtitle: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 transition-colors no-underline hover:no-underline"
      style={{
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: 'transparent',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--pf-blue-50)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <div
        className="rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          width: '40px',
          height: '40px',
          backgroundColor: 'var(--pf-blue-100)',
          color: 'var(--pf-blue-700)',
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            color: 'var(--pf-grey-900)',
            fontSize: '0.9375rem',
          }}
        >
          {title}
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>{subtitle}</p>
      </div>
    </Link>
  )
}

function GradeSummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span style={{ color: 'rgba(255,255,255,0.8)' }}>{label}</span>
      <span
        className="pf-data-number"
        style={{ fontWeight: 700, fontSize: '1rem' }}
      >
        {value}
      </span>
    </div>
  )
}
