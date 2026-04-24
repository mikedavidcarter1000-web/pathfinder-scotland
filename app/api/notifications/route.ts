import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/admin-auth'
import { fetchRelevantNotifications } from '@/lib/school/notifications'

export const runtime = 'nodejs'

// GET /api/notifications
// Unified endpoint for students and parents. Resolves audience server-side
// from the current session (students/parents table membership).
export async function GET(req: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdminClient()
  if (!admin) return NextResponse.json({ error: 'Service role not configured' }, { status: 500 })

  const url = new URL(req.url)
  const limitParam = url.searchParams.get('limit')
  const limit = Math.min(Math.max(Number(limitParam ?? '100') || 100, 1), 500)

  // Determine audience.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: parent } = await (admin as any)
    .from('parents')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (parent) {
    // Find any school associated with the parent's linked students.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: links } = await (admin as any)
      .from('parent_student_links')
      .select('student_id')
      .eq('parent_id', parent.id)
      .eq('status', 'active')
    type L = { student_id: string }
    const studentIds = ((links ?? []) as L[]).map((l) => l.student_id)
    if (studentIds.length === 0) return NextResponse.json({ notifications: [] })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: schoolLinks } = await (admin as any)
      .from('school_student_links')
      .select('school_id')
      .in('student_id', studentIds)
    const schoolIds = Array.from(
      new Set(((schoolLinks ?? []) as Array<{ school_id: string }>).map((s) => s.school_id))
    )
    const out: unknown[] = []
    for (const schoolId of schoolIds) {
      const rows = await fetchRelevantNotifications(admin, {
        schoolId,
        audience: 'parent',
        parentId: parent.id,
        limit,
      })
      out.push(...rows)
    }
    return NextResponse.json({ notifications: out })
  }

  // Student path.
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
    const out: unknown[] = []
    for (const schoolId of schoolIds) {
      const rows = await fetchRelevantNotifications(admin, {
        schoolId,
        audience: 'student',
        studentId: student.id,
        limit,
      })
      out.push(...rows)
    }
    return NextResponse.json({ notifications: out })
  }

  return NextResponse.json({ notifications: [] })
}
