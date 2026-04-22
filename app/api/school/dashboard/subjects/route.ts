import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

const TRANSITIONS = ['s2_to_s3', 's3_to_s4', 's4_to_s5', 's5_to_s6'] as const

export async function GET() {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: linkRows } = await (admin as any)
    .from('school_student_links')
    .select('student_id')
    .eq('school_id', ctx.schoolId)
  const studentIds: string[] = (linkRows ?? []).map((r: { student_id: string }) => r.student_id)

  if (studentIds.length === 0) {
    return NextResponse.json({ popularityByTransition: {}, dropOffFlags: [], consequenceFlags: [] })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: choices } = await (admin as any)
    .from('student_subject_choices')
    .select('student_id, subject_name, transition, is_reserve')
    .in('student_id', studentIds)
    .eq('is_reserve', false)

  // Popularity: transition -> subject -> count
  const popularity: Record<string, Record<string, number>> = {}
  for (const t of TRANSITIONS) popularity[t] = {}
  for (const c of (choices ?? []) as Array<{ subject_name: string; transition: string }>) {
    if (!TRANSITIONS.includes(c.transition as (typeof TRANSITIONS)[number])) continue
    if (!c.subject_name) continue
    popularity[c.transition][c.subject_name] = (popularity[c.transition][c.subject_name] || 0) + 1
  }

  // Drop-off flags: subjects where count drops >50% between consecutive transitions
  const dropOffFlags: { subject: string; from: string; to: string; before: number; after: number; pct: number }[] = []
  const pairs: [string, string][] = [
    ['s3_to_s4', 's4_to_s5'],
    ['s4_to_s5', 's5_to_s6'],
  ]
  for (const [from, to] of pairs) {
    const before = popularity[from]
    const after = popularity[to]
    for (const subject in before) {
      const b = before[subject] ?? 0
      const a = after[subject] ?? 0
      if (b >= 3 && a < b * 0.5) {
        dropOffFlags.push({ subject, from, to, before: b, after: a, pct: b > 0 ? Math.round((1 - a / b) * 100) : 0 })
      }
    }
  }

  // University consequence flags: saved courses with missing subject requirements.
  // Build: per student, get saved courses + their required subjects + grade level,
  // compare against chosen subjects (union across transitions, since same subject
  // can appear multiple years). If required subject not chosen by this student,
  // increment a counter keyed by (course, required subject).
  const flags: { subject: string; note: string; count: number }[] = []
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: saved } = await (admin as any)
      .from('saved_courses')
      .select('student_id, course_id')
      .in('student_id', studentIds)

    const savedList = (saved ?? []) as Array<{ student_id: string; course_id: string }>
    if (savedList.length === 0) {
      return NextResponse.json({ popularityByTransition: popularity, dropOffFlags, consequenceFlags: [] })
    }

    const courseIds = Array.from(new Set(savedList.map((s) => s.course_id)))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: reqs } = await (admin as any)
      .from('course_subject_requirements')
      .select('course_id, subject_name, qualification_level, is_required')
      .in('course_id', courseIds)
      .eq('is_required', true)
    const reqsByCourse = new Map<string, string[]>()
    for (const r of (reqs ?? []) as Array<{ course_id: string; subject_name: string; qualification_level?: string | null }>) {
      const name = r.subject_name
      if (!name) continue
      if (!reqsByCourse.has(r.course_id)) reqsByCourse.set(r.course_id, [])
      reqsByCourse.get(r.course_id)!.push(name)
    }

    // Chosen subjects per student
    const chosenByStudent = new Map<string, Set<string>>()
    for (const c of (choices ?? []) as Array<{ student_id: string; subject_name: string }>) {
      if (!c.subject_name) continue
      if (!chosenByStudent.has(c.student_id)) chosenByStudent.set(c.student_id, new Set())
      chosenByStudent.get(c.student_id)!.add(c.subject_name.toLowerCase())
    }

    // Count students missing each required subject
    const missingPerSubject = new Map<string, Set<string>>()
    for (const s of savedList) {
      const required = reqsByCourse.get(s.course_id) || []
      const chosen = chosenByStudent.get(s.student_id) || new Set<string>()
      for (const reqSubject of required) {
        if (!chosen.has(reqSubject.toLowerCase())) {
          if (!missingPerSubject.has(reqSubject)) missingPerSubject.set(reqSubject, new Set())
          missingPerSubject.get(reqSubject)!.add(s.student_id)
        }
      }
    }
    for (const [subject, set] of missingPerSubject.entries()) {
      if (set.size >= 2) {
        flags.push({
          subject,
          note: `have saved courses requiring ${subject} but have not selected it.`,
          count: set.size,
        })
      }
    }
    flags.sort((a, b) => b.count - a.count)
  } catch (err) {
    console.error('[school/dashboard/subjects] consequence flags failed:', err)
  }

  return NextResponse.json({
    popularityByTransition: popularity,
    dropOffFlags,
    consequenceFlags: flags.slice(0, 12),
  })
}
