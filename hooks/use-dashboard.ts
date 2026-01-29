import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from './use-auth'
import { useSavedCourses } from './use-courses'
import { useStudentGrades, useGradeSummary, useWideningAccessEligibility } from './use-student'
import type { Tables } from '@/types/database'

type SavedCourseWithCourse = Tables<'saved_courses'> & {
  course?: Tables<'courses'> & { university?: Tables<'universities'> }
}
type StudentGrade = Tables<'student_grades'>

// Dashboard statistics
export function useDashboardStats() {
  const { user } = useAuth()
  const { data: savedCourses } = useSavedCourses() as { data: SavedCourseWithCourse[] | undefined }
  const { data: grades } = useStudentGrades() as { data: StudentGrade[] | undefined }
  const gradeSummary = useGradeSummary()
  const wideningAccess = useWideningAccessEligibility()

  const savedCount = savedCourses?.length || 0
  const gradeCount = grades?.length || 0

  // Count eligible courses from saved
  const eligibleCount = savedCourses?.filter((sc) => {
    const course = sc.course
    if (!course?.entry_requirements) return false

    const reqs = course.entry_requirements as { highers?: string }
    if (!reqs.highers) return true // No requirement = eligible

    // Simple comparison - student grades >= required
    return gradeSummary.highers >= reqs.highers
  }).length || 0

  return {
    savedCount,
    gradeCount,
    eligibleCount,
    ucasPoints: gradeSummary.ucasPoints,
    gradeString: gradeSummary.highers,
    wideningAccess: wideningAccess?.isEligible || false,
  }
}

// Recommended courses based on grades and interests
export function useRecommendedCourses(limit = 6) {
  const supabase = getSupabaseClient()
  const { user } = useAuth()
  const gradeSummary = useGradeSummary()
  const { data: savedCourses } = useSavedCourses() as { data: SavedCourseWithCourse[] | undefined }

  return useQuery<(Tables<'courses'> & { university: Tables<'universities'> })[]>({
    queryKey: ['recommended-courses', user?.id, gradeSummary.highers],
    queryFn: async () => {
      // Get subject areas from saved courses for recommendations
      const savedSubjects = savedCourses?.map((sc) => sc.course?.subject_area).filter(Boolean) || []
      const savedIds = savedCourses?.map((sc) => sc.course_id) || []

      let query = supabase
        .from('courses')
        .select(`
          *,
          university:universities(*)
        `)
        .limit(limit * 2) // Fetch more to filter

      // Exclude already saved
      if (savedIds.length > 0) {
        query = query.not('id', 'in', `(${savedIds.join(',')})`)
      }

      // Prefer similar subjects if available
      if (savedSubjects.length > 0) {
        query = query.in('subject_area', savedSubjects)
      }

      const { data, error } = await query

      if (error) throw error

      type CourseWithUniversity = Tables<'courses'> & { university: Tables<'universities'> }

      // Filter to courses student might be eligible for
      let filtered = (data || []) as CourseWithUniversity[]

      if (gradeSummary.highers) {
        filtered = filtered.filter((course) => {
          const reqs = course.entry_requirements as { highers?: string } | null
          if (!reqs?.highers) return true
          // Simple comparison - show if within 2 grades
          return gradeSummary.highers.length >= reqs.highers.length - 2
        })
      }

      return filtered.slice(0, limit)
    },
    enabled: !!user,
  })
}

// Recently viewed courses (stored in localStorage)
export function useRecentlyViewed() {
  const supabase = getSupabaseClient()

  return useQuery<(Tables<'courses'> & { university: Tables<'universities'> })[]>({
    queryKey: ['recently-viewed'],
    queryFn: async () => {
      if (typeof window === 'undefined') return []

      const stored = localStorage.getItem('recently-viewed-courses')
      if (!stored) return []

      let courseIds: string[]
      try {
        courseIds = JSON.parse(stored)
        if (!Array.isArray(courseIds)) return []
      } catch {
        return []
      }

      if (courseIds.length === 0) return []

      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          university:universities(*)
        `)
        .in('id', courseIds.slice(0, 5))

      if (error) throw error

      type CourseWithUniversity = Tables<'courses'> & { university: Tables<'universities'> }

      // Sort by order in localStorage
      const courses = (data || []) as CourseWithUniversity[]
      return courses.sort(
        (a, b) => courseIds.indexOf(a.id) - courseIds.indexOf(b.id)
      )
    },
  })
}

// Add to recently viewed
export function addToRecentlyViewed(courseId: string) {
  if (typeof window === 'undefined') return

  const stored = localStorage.getItem('recently-viewed-courses')
  let courseIds: string[] = []

  try {
    courseIds = stored ? JSON.parse(stored) : []
    if (!Array.isArray(courseIds)) courseIds = []
  } catch {
    courseIds = []
  }

  // Remove if already exists, then add to front
  courseIds = courseIds.filter((id) => id !== courseId)
  courseIds.unshift(courseId)

  // Keep only last 10
  courseIds = courseIds.slice(0, 10)

  localStorage.setItem('recently-viewed-courses', JSON.stringify(courseIds))
}

// Application progress (for UCAS tracking)
export function useApplicationProgress() {
  const { data: savedCourses } = useSavedCourses() as { data: SavedCourseWithCourse[] | undefined }
  const { data: grades } = useStudentGrades() as { data: StudentGrade[] | undefined }

  const MAX_UCAS_CHOICES = 5

  const savedCount = savedCourses?.length || 0
  const prioritised = savedCourses?.filter((sc) => sc.priority !== null).length || 0
  const hasNotes = savedCourses?.filter((sc) => sc.notes).length || 0
  const gradeCount = grades?.length || 0

  const progress = {
    grades: Math.min(gradeCount / 5, 1), // Assume 5 grades minimum
    saved: Math.min(savedCount / MAX_UCAS_CHOICES, 1),
    prioritised: savedCount > 0 ? prioritised / savedCount : 0,
    researched: savedCount > 0 ? hasNotes / savedCount : 0,
  }

  const overallProgress =
    (progress.grades + progress.saved + progress.prioritised + progress.researched) / 4

  return {
    progress,
    overallProgress,
    savedCount,
    maxChoices: MAX_UCAS_CHOICES,
    isComplete: savedCount >= MAX_UCAS_CHOICES && gradeCount >= 5,
  }
}
