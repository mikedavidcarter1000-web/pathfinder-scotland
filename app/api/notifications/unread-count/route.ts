import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/admin-auth'
import { fetchRelevantNotifications } from '@/lib/school/notifications'

export const runtime = 'nodejs'

// GET /api/notifications/unread-count
// Shared endpoint for students and parents.
export async function GET() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ count: 0 })

  const admin = getAdminClient()
  if (!admin) return NextResponse.json({ count: 0 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: parent } = await (admin as any)
    .from('parents')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (parent) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: links } = await (admin as any)
      .from('parent_student_links')
      .select('student_id')
      .eq('parent_id', parent.id)
      .eq('status', 'active')
    type L = { student_id: string }
    const studentIds = ((links ?? []) as L[]).map((l) => l.student_id)
    if (studentIds.length === 0) return NextResponse.json({ count: 0 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: schoolLinks } = await (admin as any)
      .from('school_student_links')
      .select('school_id')
      .in('student_id', studentIds)
    const schoolIds = Array.from(
      new Set(((schoolLinks ?? []) as Array<{ school_id: string }>).map((s) => s.school_id))
    )
    let total = 0
    for (const schoolId of schoolIds) {
      const rows = await fetchRelevantNotifications(admin, {
        schoolId,
        audience: 'parent',
        parentId: parent.id,
      })
      total += rows.filter((r) => !r.read_by.includes(user.id)).length
    }
    return NextResponse.json({ count: total })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: student } = await (admin as any)
    .from('students')
    .select('id, school_id')
    .eq('id', user.id)
    .maybeSingle()
  if (student) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: schoolLinks } = await (admin as any)
      .from('school_student_links')
      .select('school_id')
      .eq('student_id', student.id)
    const schoolIds = Array.from(
      new Set(
        [
          ...(student.school_id ? [student.school_id as string] : []),
          ...((schoolLinks ?? []) as Array<{ school_id: string }>).map((s) => s.school_id),
        ].filter(Boolean)
      )
    )
    let total = 0
    for (const schoolId of schoolIds) {
      const rows = await fetchRelevantNotifications(admin, {
        schoolId,
        audience: 'student',
        studentId: student.id,
      })
      total += rows.filter((r) => !r.read_by.includes(user.id)).length
    }
    return NextResponse.json({ count: total })
  }

  return NextResponse.json({ count: 0 })
}
