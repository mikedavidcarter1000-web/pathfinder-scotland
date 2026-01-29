'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import type { Tables } from '@/types/database'

const STORAGE_KEY = 'pathfinder-comparison'
const MAX_COURSES = 4

interface ComparisonCourse {
  id: string
  name: string
}

export function useComparison() {
  const [courseIds, setCourseIds] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) {
            setCourseIds(parsed.slice(0, MAX_COURSES))
          }
        } catch {
          // Invalid data, reset
          localStorage.removeItem(STORAGE_KEY)
        }
      }
      setIsInitialized(true)
    }
  }, [])

  // Save to localStorage when courseIds change
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(courseIds))
    }
  }, [courseIds, isInitialized])

  const addCourse = useCallback((courseId: string) => {
    setCourseIds((prev) => {
      if (prev.includes(courseId)) return prev
      if (prev.length >= MAX_COURSES) return prev
      return [...prev, courseId]
    })
  }, [])

  const removeCourse = useCallback((courseId: string) => {
    setCourseIds((prev) => prev.filter((id) => id !== courseId))
  }, [])

  const toggleCourse = useCallback((courseId: string) => {
    setCourseIds((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId)
      }
      if (prev.length >= MAX_COURSES) return prev
      return [...prev, courseId]
    })
  }, [])

  const clearAll = useCallback(() => {
    setCourseIds([])
  }, [])

  const isCourseInComparison = useCallback(
    (courseId: string) => courseIds.includes(courseId),
    [courseIds]
  )

  const canAddMore = courseIds.length < MAX_COURSES

  return {
    courseIds,
    addCourse,
    removeCourse,
    toggleCourse,
    clearAll,
    isCourseInComparison,
    canAddMore,
    maxCourses: MAX_COURSES,
    count: courseIds.length,
    isInitialized,
  }
}

// Hook to fetch full course data for comparison
type CourseWithUniversity = Tables<'courses'> & { university?: Tables<'universities'> }

export function useComparisonCourses(courseIds: string[]) {
  const supabase = getSupabaseClient()

  return useQuery<CourseWithUniversity[]>({
    queryKey: ['comparison-courses', courseIds],
    queryFn: async () => {
      if (courseIds.length === 0) return []

      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          university:universities(*)
        `)
        .in('id', courseIds)

      if (error) throw error

      // Sort to match the order in courseIds
      const courses = (data || []) as CourseWithUniversity[]
      return courses.sort(
        (a, b) => courseIds.indexOf(a.id) - courseIds.indexOf(b.id)
      )
    },
    enabled: courseIds.length > 0,
  })
}

// Combined hook for comparison with full course data
export function useComparisonWithCourses() {
  const comparison = useComparison()
  const { data: courses, isLoading, error } = useComparisonCourses(comparison.courseIds)

  return {
    ...comparison,
    courses: courses || [],
    isLoading,
    error,
  }
}

// Hook for comparison bar display (just names)
export function useComparisonBar() {
  const { courseIds, removeCourse, clearAll, count, maxCourses } = useComparison()
  const supabase = getSupabaseClient()

  const { data: courses } = useQuery<ComparisonCourse[]>({
    queryKey: ['comparison-bar-courses', courseIds],
    queryFn: async () => {
      if (courseIds.length === 0) return []

      const { data } = await supabase
        .from('courses')
        .select('id, name')
        .in('id', courseIds)

      const courseList = (data || []) as ComparisonCourse[]
      return courseList.sort(
        (a, b) => courseIds.indexOf(a.id) - courseIds.indexOf(b.id)
      )
    },
    enabled: courseIds.length > 0,
  })

  return {
    courses: courses || [],
    removeCourse,
    clearAll,
    count,
    maxCourses,
    isVisible: count > 0,
  }
}
