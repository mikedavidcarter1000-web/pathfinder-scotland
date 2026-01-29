import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from './use-auth'
import type { Tables, InsertTables, UpdateTables } from '@/types/database'

// Fetch current student profile
export function useCurrentStudent() {
  const supabase = getSupabaseClient()
  const { user } = useAuth()

  return useQuery({
    queryKey: ['student', user?.id],
    queryFn: async () => {
      if (!user) return null

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!user,
  })
}

// Create student profile
export function useCreateStudent() {
  const supabase = getSupabaseClient()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (data: Omit<InsertTables<'students'>, 'id'>) => {
      if (!user) throw new Error('Not authenticated')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: student, error } = await (supabase as any)
        .from('students')
        .insert({ ...data, id: user.id })
        .select()
        .single()

      if (error) throw error
      return student as Tables<'students'>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student'] })
    },
  })
}

// Update student profile
export function useUpdateStudent() {
  const supabase = getSupabaseClient()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (data: UpdateTables<'students'>) => {
      if (!user) throw new Error('Not authenticated')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: student, error } = await (supabase as any)
        .from('students')
        .update(data)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      return student as Tables<'students'>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student'] })
    },
  })
}

// Fetch student grades
export function useStudentGrades() {
  const supabase = getSupabaseClient()
  const { user } = useAuth()

  return useQuery({
    queryKey: ['student-grades', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('student_grades')
        .select('*')
        .eq('student_id', user.id)
        .order('qualification_type')
        .order('subject')

      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })
}

// Fetch grades by qualification type
export function useGradesByQualification(qualificationType: string) {
  const { data: allGrades, ...rest } = useStudentGrades() as { data: Tables<'student_grades'>[] | undefined; isLoading: boolean; error: Error | null }

  const grades = allGrades?.filter(
    (g) => g.qualification_type === qualificationType
  ) || []

  return { data: grades, ...rest }
}

// Add a grade
export function useAddGrade() {
  const supabase = getSupabaseClient()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (data: Omit<InsertTables<'student_grades'>, 'student_id'>) => {
      if (!user) throw new Error('Not authenticated')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: grade, error } = await (supabase as any)
        .from('student_grades')
        .insert({ ...data, student_id: user.id })
        .select()
        .single()

      if (error) throw error
      return grade as Tables<'student_grades'>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-grades'] })
    },
  })
}

// Update a grade
export function useUpdateGrade() {
  const supabase = getSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      gradeId,
      data,
    }: {
      gradeId: string
      data: UpdateTables<'student_grades'>
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: grade, error } = await (supabase as any)
        .from('student_grades')
        .update(data)
        .eq('id', gradeId)
        .select()
        .single()

      if (error) throw error
      return grade as Tables<'student_grades'>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-grades'] })
    },
  })
}

// Delete a grade
export function useDeleteGrade() {
  const supabase = getSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (gradeId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('student_grades')
        .delete()
        .eq('id', gradeId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-grades'] })
    },
  })
}

// Bulk upsert grades
export function useBulkUpsertGrades() {
  const supabase = getSupabaseClient()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (grades: Omit<InsertTables<'student_grades'>, 'student_id'>[]) => {
      if (!user) throw new Error('Not authenticated')

      const gradesWithStudent = grades.map((g) => ({
        ...g,
        student_id: user.id,
      }))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('student_grades')
        .upsert(gradesWithStudent, {
          onConflict: 'student_id,subject,qualification_type',
        })
        .select()

      if (error) throw error
      return data as Tables<'student_grades'>[]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-grades'] })
    },
  })
}

// SIMD Lookup
export function useSIMDLookup() {
  const supabase = getSupabaseClient()

  return useMutation({
    mutationFn: async (postcode: string) => {
      const normalised = postcode.replace(/\s/g, '').toUpperCase()

      // First try exact match
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: exactMatch, error: exactError } = await (supabase as any)
        .from('simd_postcodes')
        .select('*')
        .eq('postcode', normalised)
        .single()

      if (exactMatch) {
        return exactMatch as Tables<'simd_postcodes'>
      }

      // If no exact match, try prefix match (for partial postcodes like "EH4")
      if (exactError?.code === 'PGRST116') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: prefixMatch, error: prefixError } = await (supabase as any)
          .from('simd_postcodes')
          .select('*')
          .ilike('postcode', `${normalised}%`)
          .limit(1)
          .single()

        if (prefixMatch) {
          return prefixMatch as Tables<'simd_postcodes'>
        }

        if (prefixError?.code === 'PGRST116') {
          return null // Not found
        }
        if (prefixError) throw prefixError
      }

      if (exactError) throw exactError
      return null
    },
  })
}

// Check widening access eligibility
export function useWideningAccessEligibility() {
  const { data: student } = useCurrentStudent() as { data: Tables<'students'> | null | undefined }

  if (!student) return null

  const simdDecile = student.simd_decile
  const isSIMD20 = simdDecile !== null && simdDecile <= 2
  const isSIMD40 = simdDecile !== null && simdDecile <= 4
  const hasCareExperience = student.care_experienced || false
  const isYoungCarer = student.is_carer || false
  const isFirstGeneration = student.first_generation || false

  const isEligible = isSIMD20 || isSIMD40 || hasCareExperience || isYoungCarer || isFirstGeneration

  return {
    isEligible,
    isSIMD20,
    isSIMD40,
    hasCareExperience,
    isYoungCarer,
    isFirstGeneration,
    criteria: [
      isSIMD20 && 'SIMD20',
      isSIMD40 && !isSIMD20 && 'SIMD40',
      hasCareExperience && 'Care Experienced',
      isYoungCarer && 'Young Carer',
      isFirstGeneration && 'First Generation',
    ].filter(Boolean) as string[],
  }
}

// Grade summary (calculate grade strings)
export function useGradeSummary() {
  const { data: grades } = useStudentGrades() as { data: Tables<'student_grades'>[] | undefined }

  if (!grades || grades.length === 0) {
    return {
      highers: '',
      advancedHighers: '',
      national5s: '',
      ucasPoints: 0,
      totalGrades: 0,
    }
  }

  const gradeValues: Record<string, number> = {
    A: 5, B: 4, C: 3, D: 2,
  }

  const ucasPoints: Record<string, Record<string, number>> = {
    higher: { A: 33, B: 27, C: 21, D: 15 },
    advanced_higher: { A: 56, B: 48, C: 40, D: 32 },
  }

  const sortGrades = (quals: Tables<'student_grades'>[]) =>
    quals
      .sort((a, b) => (gradeValues[b.grade] || 0) - (gradeValues[a.grade] || 0))
      .map((g) => g.grade)
      .join('')

  const highers = grades.filter((g) => g.qualification_type === 'higher')
  const advancedHighers = grades.filter((g) => g.qualification_type === 'advanced_higher')
  const national5s = grades.filter((g) => g.qualification_type === 'national_5')

  const totalUcasPoints = grades.reduce((total, g) => {
    const typePoints = ucasPoints[g.qualification_type]
    if (typePoints && typePoints[g.grade]) {
      return total + typePoints[g.grade]
    }
    return total
  }, 0)

  return {
    highers: sortGrades(highers),
    advancedHighers: sortGrades(advancedHighers),
    national5s: sortGrades(national5s),
    ucasPoints: totalUcasPoints,
    totalGrades: grades.length,
    byType: {
      higher: highers,
      advanced_higher: advancedHighers,
      national_5: national5s,
    },
  }
}
