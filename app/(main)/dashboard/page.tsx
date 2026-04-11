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
} from '@/components/dashboard'
import { StatsCard, StatsGrid } from '@/components/ui/stats-card'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { SlowLoadingNotice } from '@/components/ui/slow-loading-notice'
import type { Tables } from '@/types/database'

type Student = Tables<'students'>

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
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
    if (!authLoading && !studentLoading && user && !student) {
      router.push('/onboarding')
    }
  }, [authLoading, studentLoading, user, student, router])

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

  if (!user || !student) {
    return null
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

      {/* Progress checklist */}
      <div className="mb-6">
        <ProgressChecklist />
      </div>

      {/* Widening Access Highlight (only renders if eligible) */}
      <div className="mb-6">
        <WideningAccessCard />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <GradesSection />
          <SubjectChoicesSection />
          <SavedCoursesSection />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ProfileSummary />

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
