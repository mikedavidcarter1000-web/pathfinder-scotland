import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

function escapeCsv(v: unknown): string {
  const s = String(v ?? '')
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
  return s
}

export async function GET() {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school } = await (admin as any)
    .from('schools')
    .select('slug, name')
    .eq('id', ctx.schoolId)
    .maybeSingle()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: linkRows } = await (admin as any)
    .from('school_student_links')
    .select('student_id')
    .eq('school_id', ctx.schoolId)
  const studentIds = (linkRows ?? []).map((r: { student_id: string }) => r.student_id)

  const lines: string[] = []
  lines.push(`# Pathfinder Scotland - aggregate export`)
  lines.push(`# School: ${school?.name ?? ''}`)
  lines.push(`# Generated: ${new Date().toISOString()}`)
  lines.push('')

  if (studentIds.length === 0) {
    lines.push('No linked students yet.')
    return respondCsv(lines.join('\n'), school?.slug || 'school')
  }

  // Section 1: SIMD distribution
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: simdRows } = await (admin as any)
    .from('students')
    .select('simd_decile, school_stage')
    .in('id', studentIds)
  const simdCounts = Array.from({ length: 10 }, () => 0)
  const yearGroupCounts: Record<string, number> = {}
  for (const s of (simdRows ?? []) as Array<{ simd_decile: number | null; school_stage: string | null }>) {
    if (typeof s.simd_decile === 'number' && s.simd_decile >= 1 && s.simd_decile <= 10) {
      simdCounts[s.simd_decile - 1] += 1
    }
    if (s.school_stage) {
      yearGroupCounts[s.school_stage] = (yearGroupCounts[s.school_stage] || 0) + 1
    }
  }
  lines.push('SIMD decile,Count')
  for (let i = 0; i < 10; i++) lines.push(`${i + 1},${simdCounts[i]}`)
  lines.push('')
  lines.push('Year group,Registered students')
  for (const [yg, count] of Object.entries(yearGroupCounts)) lines.push(`${escapeCsv(yg)},${count}`)
  lines.push('')

  // Section 2: Career sector interest counts by year group
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: savedRows } = await (admin as any)
    .from('saved_courses')
    .select('student_id, courses!inner(category), students!inner(school_stage)')
    .in('student_id', studentIds)
  const sectorYg = new Map<string, Map<string, Set<string>>>()
  for (const r of (savedRows ?? []) as Array<{
    student_id: string
    courses?: { category?: string | null }
    students?: { school_stage?: string | null }
  }>) {
    const sector = r.courses?.category
    const yg = r.students?.school_stage ?? 'unknown'
    if (!sector) continue
    if (!sectorYg.has(sector)) sectorYg.set(sector, new Map())
    if (!sectorYg.get(sector)!.has(yg)) sectorYg.get(sector)!.set(yg, new Set())
    sectorYg.get(sector)!.get(yg)!.add(r.student_id)
  }
  lines.push('Career sector,Year group,Distinct students')
  for (const [sector, ygMap] of sectorYg.entries()) {
    for (const [yg, set] of ygMap.entries()) {
      lines.push(`${escapeCsv(sector)},${escapeCsv(yg)},${set.size}`)
    }
  }
  lines.push('')

  // Section 3: Subject choice counts by transition
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: choices } = await (admin as any)
    .from('student_subject_choices')
    .select('subject_name, transition')
    .in('student_id', studentIds)
    .eq('is_reserve', false)
  const subj = new Map<string, Map<string, number>>()
  for (const c of (choices ?? []) as Array<{ subject_name: string; transition: string }>) {
    if (!c.subject_name || !c.transition) continue
    if (!subj.has(c.subject_name)) subj.set(c.subject_name, new Map())
    subj.get(c.subject_name)!.set(c.transition, (subj.get(c.subject_name)!.get(c.transition) || 0) + 1)
  }
  lines.push('Subject,Transition,Count')
  for (const [subject, m] of subj.entries()) {
    for (const [transition, count] of m.entries()) {
      lines.push(`${escapeCsv(subject)},${escapeCsv(transition)},${count}`)
    }
  }
  lines.push('')

  // Section 4: Engagement metrics by year group
  const [savedByYg, quizByYg] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any)
      .from('saved_courses')
      .select('student_id, students!inner(school_stage)')
      .in('student_id', studentIds),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any)
      .from('quiz_results')
      .select('student_id, students!inner(school_stage)')
      .in('student_id', studentIds),
  ])
  const engagement = new Map<string, { saved: number; quiz: number }>()
  for (const r of (savedByYg.data ?? []) as Array<{ students?: { school_stage?: string | null } }>) {
    const yg = r.students?.school_stage ?? 'unknown'
    if (!engagement.has(yg)) engagement.set(yg, { saved: 0, quiz: 0 })
    engagement.get(yg)!.saved += 1
  }
  for (const r of (quizByYg.data ?? []) as Array<{ students?: { school_stage?: string | null } }>) {
    const yg = r.students?.school_stage ?? 'unknown'
    if (!engagement.has(yg)) engagement.set(yg, { saved: 0, quiz: 0 })
    engagement.get(yg)!.quiz += 1
  }
  lines.push('Year group,Courses saved,Quiz completions')
  for (const [yg, v] of engagement.entries()) lines.push(`${escapeCsv(yg)},${v.saved},${v.quiz}`)
  lines.push('')

  return respondCsv(lines.join('\n'), school?.slug || 'school')
}

function respondCsv(body: string, slug: string) {
  const date = new Date().toISOString().slice(0, 10)
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="pathfinder-${slug}-${date}.csv"`,
    },
  })
}
