import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from './use-auth'
import type { Tables } from '@/types/database'

interface CourseFilters {
  universityId?: string
  subjectArea?: string
  degreeType?: string
  search?: string
  limit?: number
  offset?: number
}

// Fetch all courses with optional filters
export function useCourses(filters: CourseFilters = {}) {
  const supabase = getSupabaseClient()
  const { limit = 50, offset = 0 } = filters

  return useQuery<(Tables<'courses'> & { university: Tables<'universities'> })[]>({
    queryKey: ['courses', filters],
    queryFn: async () => {
      let query = supabase
        .from('courses')
        .select(`
          *,
          university:universities(*)
        `)
        .range(offset, offset + limit - 1)
        .order('name')

      if (filters.universityId) {
        query = query.eq('university_id', filters.universityId)
      }
      if (filters.subjectArea) {
        query = query.eq('subject_area', filters.subjectArea)
      }
      if (filters.degreeType) {
        query = query.eq('degree_type', filters.degreeType)
      }
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    },
  })
}

// Fetch single course by ID
export function useCourse(courseId: string | null) {
  const supabase = getSupabaseClient()

  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!courseId) return null

      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          university:universities(*)
        `)
        .eq('id', courseId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!courseId,
  })
}

// Fetch unique subject areas
export function useSubjectAreas() {
  const supabase = getSupabaseClient()

  return useQuery<string[]>({
    queryKey: ['subject-areas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('subject_area')
        .not('subject_area', 'is', null)

      if (error) throw error

      const courseData = data as { subject_area: string | null }[]
      const unique = [...new Set(courseData.map((d) => d.subject_area))].filter(Boolean) as string[]
      return unique.sort()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Fetch saved courses for current user
export function useSavedCourses() {
  const supabase = getSupabaseClient()
  const { user } = useAuth()

  return useQuery({
    queryKey: ['saved-courses', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('saved_courses')
        .select(`
          *,
          course:courses(
            *,
            university:universities(*)
          )
        `)
        .eq('student_id', user.id)
        .order('priority', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })
}

// Save a course
export function useSaveCourse() {
  const supabase = getSupabaseClient()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error('Not authenticated')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('saved_courses')
        .insert({
          student_id: user.id,
          course_id: courseId,
        })
        .select()
        .single()

      if (error) throw error
      return data as Tables<'saved_courses'>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-courses'] })
    },
  })
}

// Remove saved course
export function useRemoveSavedCourse() {
  const supabase = getSupabaseClient()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('saved_courses')
        .delete()
        .eq('student_id', user.id)
        .eq('course_id', courseId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-courses'] })
    },
  })
}

// Toggle saved course
type SavedCourseWithCourse = Tables<'saved_courses'> & {
  course?: Tables<'courses'> & { university?: Tables<'universities'> }
}

export function useToggleSaveCourse() {
  const saveCourse = useSaveCourse()
  const removeCourse = useRemoveSavedCourse()
  const { data: savedCourses } = useSavedCourses() as { data: SavedCourseWithCourse[] | undefined }

  const isSaved = (courseId: string) =>
    savedCourses?.some((sc) => sc.course_id === courseId) ?? false

  const toggle = async (courseId: string) => {
    if (isSaved(courseId)) {
      await removeCourse.mutateAsync(courseId)
    } else {
      await saveCourse.mutateAsync(courseId)
    }
  }

  return {
    toggle,
    isSaved,
    isPending: saveCourse.isPending || removeCourse.isPending,
  }
}

// Update saved course (notes, priority)
export function useUpdateSavedCourse() {
  const supabase = getSupabaseClient()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      courseId,
      updates,
    }: {
      courseId: string
      updates: { notes?: string; priority?: number }
    }) => {
      if (!user) throw new Error('Not authenticated')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('saved_courses')
        .update(updates)
        .eq('student_id', user.id)
        .eq('course_id', courseId)
        .select()
        .single()

      if (error) throw error
      return data as Tables<'saved_courses'>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-courses'] })
    },
  })
}

// Reorder saved courses
export function useReorderSavedCourses() {
  const supabase = getSupabaseClient()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (courseIds: string[]) => {
      if (!user) throw new Error('Not authenticated')

      // Update priorities based on array order
      const updates = courseIds.map((id, index) => ({
        student_id: user.id,
        course_id: id,
        priority: index + 1,
      }))

      for (const update of updates) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('saved_courses')
          .update({ priority: update.priority })
          .eq('student_id', update.student_id)
          .eq('course_id', update.course_id)

        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-courses'] })
    },
  })
}
