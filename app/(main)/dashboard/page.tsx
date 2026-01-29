'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useCurrentStudent, useGradeSummary } from '@/hooks/use-student'
import { useDashboardStats } from '@/hooks/use-dashboard'
import { useSavedCourses } from '@/hooks/use-courses'
import { ProfileSummary, GradesSection, SavedCoursesSection } from '@/components/dashboard'
import { StatsCard, StatsGrid } from '@/components/ui/stats-card'
import type { Tables } from '@/types/database'

type Student = Tables<'students'>

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { data: student, isLoading: studentLoading } = useCurrentStudent() as { data: Student | null | undefined; isLoading: boolean }
  const stats = useDashboardStats()
  const gradeSummary = useGradeSummary()
  const { data: savedCourses } = useSavedCourses()

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/sign-in')
    }
  }, [authLoading, user, router])

  // Redirect to onboarding if no student profile
  useEffect(() => {
    if (!authLoading && !studentLoading && user && !student) {
      router.push('/onboarding')
    }
  }, [authLoading, studentLoading, user, student, router])

  // Loading state
  if (authLoading || studentLoading) {
    return null // Use loading.tsx skeleton
  }

  // Not authenticated or no profile
  if (!user || !student) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {student.first_name}
        </h1>
        <p className="text-gray-600 mt-1">
          Track your progress and manage your university applications
        </p>
      </div>

      {/* Stats Row */}
      <div className="mb-8">
        <StatsGrid columns={4}>
          <StatsCard
            label="Saved Courses"
            value={stats.savedCount}
            color="blue"
            icon={
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
          />
          <StatsCard
            label="Your Grades"
            value={stats.gradeCount}
            color="purple"
            icon={
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <StatsCard
            label="Eligible Courses"
            value={stats.eligibleCount}
            color="green"
            icon={
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard
            label="UCAS Points"
            value={stats.ucasPoints}
            color="orange"
            icon={
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        </StatsGrid>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Grades Section */}
          <GradesSection />

          {/* Saved Courses Section */}
          <SavedCoursesSection />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Summary */}
          <ProfileSummary />

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/courses"
                className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Browse Courses</p>
                  <p className="text-sm text-gray-500">Find your perfect course</p>
                </div>
              </Link>

              <Link
                href="/universities"
                className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Explore Universities</p>
                  <p className="text-sm text-gray-500">Compare Scottish unis</p>
                </div>
              </Link>

              <Link
                href="/widening-access"
                className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Widening Access</p>
                  <p className="text-sm text-gray-500">Learn about support</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Grade Summary Card */}
          {gradeSummary.totalGrades > 0 && (
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-4">Your Grade Profile</h3>
              <div className="space-y-3">
                {gradeSummary.highers && (
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Highers</span>
                    <span className="font-mono font-bold">{gradeSummary.highers}</span>
                  </div>
                )}
                {gradeSummary.advancedHighers && (
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Advanced Highers</span>
                    <span className="font-mono font-bold">{gradeSummary.advancedHighers}</span>
                  </div>
                )}
                {gradeSummary.national5s && (
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">National 5s</span>
                    <span className="font-mono font-bold">{gradeSummary.national5s}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-blue-400">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">UCAS Tariff</span>
                    <span className="text-2xl font-bold">{gradeSummary.ucasPoints}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Grades CTA */}
          {gradeSummary.totalGrades === 0 && (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center">
              <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="font-medium text-gray-900 mb-1">Add your grades</h3>
              <p className="text-sm text-gray-500 mb-4">
                Enter your grades to see which courses you&apos;re eligible for.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
