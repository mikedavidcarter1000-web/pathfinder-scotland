'use client'

import { use } from 'react'
import Link from 'next/link'
import { useCourse } from '@/hooks/use-courses'
import { DEGREE_TYPES } from '@/lib/constants'
import type { Tables } from '@/types/database'

type Course = Tables<'courses'> & { university?: Tables<'universities'> }

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: course, isLoading, error } = useCourse(id) as { data: Course | null | undefined; isLoading: boolean; error: Error | null }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h1>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Link href="/courses" className="text-blue-600 hover:text-blue-700 font-medium">
            Browse all courses
          </Link>
        </div>
      </div>
    )
  }

  const university = course.university as {
    id: string
    name: string
    slug: string
    city: string | null
    website: string | null
  } | null

  const entryRequirements = course.entry_requirements as {
    highers?: string
    advanced_highers?: string
    ucas_points?: number
    required_subjects?: string[]
  } | null

  const wideningAccess = course.widening_access_requirements as {
    simd20_offer?: string
    simd40_offer?: string
    care_experienced_offer?: string
  } | null

  const degreeInfo = course.degree_type
    ? DEGREE_TYPES[course.degree_type as keyof typeof DEGREE_TYPES]
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/courses" className="hover:text-gray-700">Courses</Link>
            <span>/</span>
            {university && (
              <>
                <Link href={`/universities/${university.id}`} className="hover:text-gray-700">
                  {university.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-900">{course.name}</span>
          </nav>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.name}</h1>
              {university && (
                <p className="text-lg text-gray-600">
                  <Link href={`/universities/${university.id}`} className="hover:text-blue-600">
                    {university.name}
                  </Link>
                  {university.city && ` - ${university.city}`}
                </p>
              )}
            </div>
            <Link
              href="/courses"
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {degreeInfo && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                {degreeInfo.label}
              </span>
            )}
            {course.subject_area && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                {course.subject_area}
              </span>
            )}
            {course.ucas_code && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                UCAS: {course.ucas_code}
              </span>
            )}
            {course.duration_years && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                {course.duration_years} years
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            {course.description && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About this course</h2>
                <p className="text-gray-600 leading-relaxed">{course.description}</p>
              </section>
            )}

            {/* Entry Requirements */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Entry Requirements</h2>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {entryRequirements ? (
                  <div className="divide-y divide-gray-100">
                    {entryRequirements.highers && (
                      <div className="flex justify-between items-center p-4">
                        <span className="text-gray-600">Highers</span>
                        <span className="font-semibold text-gray-900">{entryRequirements.highers}</span>
                      </div>
                    )}
                    {entryRequirements.advanced_highers && (
                      <div className="flex justify-between items-center p-4">
                        <span className="text-gray-600">Advanced Highers</span>
                        <span className="font-semibold text-gray-900">{entryRequirements.advanced_highers}</span>
                      </div>
                    )}
                    {entryRequirements.ucas_points && (
                      <div className="flex justify-between items-center p-4">
                        <span className="text-gray-600">UCAS Points</span>
                        <span className="font-semibold text-gray-900">{entryRequirements.ucas_points}</span>
                      </div>
                    )}
                    {entryRequirements.required_subjects && entryRequirements.required_subjects.length > 0 && (
                      <div className="p-4">
                        <span className="text-gray-600 block mb-2">Required Subjects</span>
                        <div className="flex flex-wrap gap-2">
                          {entryRequirements.required_subjects.map((subject) => (
                            <span key={subject} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="p-4 text-gray-500">Entry requirements not available. Check the university website for details.</p>
                )}
              </div>
            </section>

            {/* Widening Access */}
            {wideningAccess && (wideningAccess.simd20_offer || wideningAccess.simd40_offer || wideningAccess.care_experienced_offer) && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Widening Access Offers</h2>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <p className="text-purple-700 text-sm mb-4">
                    Lower entry requirements may be available if you meet certain criteria.
                  </p>
                  <div className="space-y-3">
                    {wideningAccess.simd20_offer && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">SIMD20 (most deprived 20%)</span>
                        <span className="font-semibold text-green-600">{wideningAccess.simd20_offer}</span>
                      </div>
                    )}
                    {wideningAccess.simd40_offer && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">SIMD40 (most deprived 40%)</span>
                        <span className="font-semibold text-green-600">{wideningAccess.simd40_offer}</span>
                      </div>
                    )}
                    {wideningAccess.care_experienced_offer && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Care Experienced</span>
                        <span className="font-semibold text-green-600">{wideningAccess.care_experienced_offer}</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Save to Shortlist
                </button>
                {course.course_url && (
                  <a
                    href={course.course_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-center"
                  >
                    View on University Site
                  </a>
                )}
                {university?.website && (
                  <a
                    href={university.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2 px-4 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
                  >
                    Visit University Website
                  </a>
                )}
              </div>
            </div>

            {/* University Info */}
            {university && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">University</h3>
                <Link href={`/universities/${university.id}`} className="block group">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-400">{university.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-blue-600">{university.name}</p>
                      {university.city && (
                        <p className="text-sm text-gray-500">{university.city}</p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Key Facts */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Key Facts</h3>
              <dl className="space-y-3">
                {course.duration_years && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Duration</dt>
                    <dd className="font-medium text-gray-900">{course.duration_years} years</dd>
                  </div>
                )}
                {course.degree_type && degreeInfo && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Qualification</dt>
                    <dd className="font-medium text-gray-900">{degreeInfo.label}</dd>
                  </div>
                )}
                {course.ucas_code && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">UCAS Code</dt>
                    <dd className="font-medium text-gray-900">{course.ucas_code}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
