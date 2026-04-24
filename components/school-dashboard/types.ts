export type DashboardMe = {
  staff: {
    staffId: string
    userId: string
    fullName: string
    email: string
    role: string
    department: string | null
    isAdmin: boolean
    canViewIndividualStudents: boolean
    canEditTracking: boolean
    canManageTracking: boolean
    canViewSafeguarding: boolean
    canViewSensitiveFlags: boolean
  }
  school: {
    id: string
    name: string
    slug: string
    local_authority: string | null
    postcode: string | null
    school_type: string | null
    subscription_status: 'trial' | 'active' | 'expired' | 'cancelled'
    is_founding_school: boolean
    trial_started_at: string | null
    trial_expires_at: string | null
  } | null
  joinCode: { code: string; is_active: boolean; expires_at: string | null } | null
  linkedStudents: number
}

export type OverviewData = {
  total: number
  activeThisMonth: number
  coursesSaved: number
  quizCompleted: number
  simdDistribution: number[]
  nationalSimd: number[]
  simd12Pct: number
  simd12National: number
  sensitiveAggregates: { careExperiencedPct: number; firstGenerationPct: number; fsmEmaPct: number }
  sectorHeatmap: { sector: string; count: number }[]
  yearGroupCounts: Record<string, number>
}

export type SubjectData = {
  popularityByTransition: Record<string, Record<string, number>>
  dropOffFlags: { subject: string; from: string; to: string; before: number; after: number; pct: number }[]
  consequenceFlags: { subject: string; note: string; count: number }[]
}

export type StudentRow = {
  id: string
  firstName: string
  lastName: string
  email: string
  schoolStage: string | null
  simdDecile: number | null
  lastActiveAt: string | null
  coursesSaved: number
  sectorsExplored: number
  quizCompleted: boolean
}

export type StudentDetail = {
  student: {
    id: string
    firstName: string | null
    lastName: string | null
    schoolStage: string | null
    simdDecile: number | null
    simdAdjustedEligible: boolean
    lastActiveAt: string | null
  }
  savedCourses: { course_id: string; courses?: { id: string; title: string; entry_requirements?: string | null } }[]
  grades: { subject_name: string; qualification_level: string; grade: string }[]
  subjectChoices: { subject_name: string; transition: string; rank_order: number; is_reserve: boolean }[]
  checklistCount: number
}

export type BenchmarksData = {
  councilName: string | null
  councilData: {
    council: string
    university_pct: number
    college_pct: number
    employment_pct: number
    training_pct: number
    other_pct: number
    needs_verification?: boolean
  } | null
  scotlandAvg: { university_pct: number; college_pct: number; employment_pct: number; training_pct: number; other_pct: number }
  academicYear: string | null
  source: string | null
  ces: { self: number; strengths: number; horizons: number; networks: number }
  capacities: { key: string; label: string; description: string; indicators: string[] }[]
  total: number
  dyw: {
    exploredPct: number
    exploredCount: number
    savedPct: number
    savedCount: number
    quizPct: number
    quizCount: number
    simd12EngagedPct: number
    simd12EngagedCount: number
    simd12Total: number
  }
}
