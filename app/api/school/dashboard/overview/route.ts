import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

// National SIMD distribution -- approx 10% per decile by definition of deciles.
const NATIONAL_SIMD_PCT = Array.from({ length: 10 }, () => 10)

export async function GET() {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // Fetch all linked students (IDs first)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: linkRows } = await (admin as any)
    .from('school_student_links')
    .select('student_id')
    .eq('school_id', ctx.schoolId)

  const studentIds: string[] = (linkRows ?? []).map((r: { student_id: string }) => r.student_id)
  const total = studentIds.length

  if (total === 0) {
    return NextResponse.json({
      total: 0,
      activeThisMonth: 0,
      coursesSaved: 0,
      quizCompleted: 0,
      simdDistribution: [],
      nationalSimd: NATIONAL_SIMD_PCT,
      simd12Pct: 0,
      simd12National: 20,
      sensitiveAggregates: {
        careExperiencedPct: 0,
        firstGenerationPct: 0,
        fsmEmaPct: 0,
      },
      sectorHeatmap: [],
      yearGroupCounts: {},
    })
  }

  // Active this month
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: activeCount } = await (admin as any)
    .from('students')
    .select('id', { count: 'exact', head: true })
    .in('id', studentIds)
    .gte('last_active_at', thirtyDaysAgo)

  // Courses saved
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: coursesCount } = await (admin as any)
    .from('saved_courses')
    .select('id', { count: 'exact', head: true })
    .in('student_id', studentIds)

  // Quiz completed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: quizCount } = await (admin as any)
    .from('quiz_results')
    .select('id', { count: 'exact', head: true })
    .in('student_id', studentIds)

  // Students with sensitive + SIMD data (service-role read only)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: studentRows } = await (admin as any)
    .from('students')
    .select(
      'id, school_stage, simd_decile, first_generation, care_experienced, receives_free_school_meals, receives_ema'
    )
    .in('id', studentIds)

  // SIMD distribution: fraction in each decile
  const simdCounts = Array.from({ length: 10 }, () => 0)
  let simdKnown = 0
  const yearGroupCounts: Record<string, number> = {}
  let careCount = 0
  let firstGenCount = 0
  let fsmEmaCount = 0

  for (const s of studentRows ?? []) {
    if (typeof s.simd_decile === 'number' && s.simd_decile >= 1 && s.simd_decile <= 10) {
      simdCounts[s.simd_decile - 1] += 1
      simdKnown += 1
    }
    if (s.school_stage) {
      yearGroupCounts[s.school_stage] = (yearGroupCounts[s.school_stage] || 0) + 1
    }
    if (s.care_experienced) careCount += 1
    if (s.first_generation) firstGenCount += 1
    if (s.receives_free_school_meals || s.receives_ema) fsmEmaCount += 1
  }

  const simdDistribution = simdCounts.map((c) => (simdKnown > 0 ? Math.round((c / simdKnown) * 1000) / 10 : 0))
  const simd12 = simdCounts[0] + simdCounts[1]
  const simd12Pct = simdKnown > 0 ? Math.round((simd12 / simdKnown) * 1000) / 10 : 0

  // Career sector heatmap -- count distinct students per sector via saved_courses and career_sectors
  // Build via saved_courses -> courses.sector? OR student_career_interests if present.
  // Strategy: use saved_courses joined to courses to extract sector via role mapping -- but simpler:
  // count distinct students who saved any course, grouped by course.category or sector_id if present.
  // Fallback: show top categories from saved_courses directly.
  let sectorHeatmap: { sector: string; count: number }[] = []
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: savedRows } = await (admin as any)
      .from('saved_courses')
      .select('student_id, courses!inner(category)')
      .in('student_id', studentIds)
    const perSector = new Map<string, Set<string>>()
    for (const r of (savedRows ?? []) as Array<{ student_id: string; courses?: { category?: string | null } }>) {
      const cat = r.courses?.category
      if (!cat) continue
      if (!perSector.has(cat)) perSector.set(cat, new Set())
      perSector.get(cat)!.add(r.student_id)
    }
    sectorHeatmap = Array.from(perSector.entries())
      .map(([sector, set]) => ({ sector, count: set.size }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12)
  } catch {
    sectorHeatmap = []
  }

  return NextResponse.json({
    total,
    activeThisMonth: activeCount ?? 0,
    coursesSaved: coursesCount ?? 0,
    quizCompleted: quizCount ?? 0,
    simdDistribution,
    nationalSimd: NATIONAL_SIMD_PCT,
    simd12Pct,
    simd12National: 20,
    sensitiveAggregates: {
      careExperiencedPct: total > 0 ? Math.round((careCount / total) * 1000) / 10 : 0,
      firstGenerationPct: total > 0 ? Math.round((firstGenCount / total) * 1000) / 10 : 0,
      fsmEmaPct: total > 0 ? Math.round((fsmEmaCount / total) * 1000) / 10 : 0,
    },
    sectorHeatmap,
    yearGroupCounts,
  })
}
