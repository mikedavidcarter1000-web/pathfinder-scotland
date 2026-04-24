import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/admin-auth'
import { markAsRead } from '@/lib/school/notifications'

export const runtime = 'nodejs'

// POST /api/notifications/mark-read
// Body: { notification_id } OR { all: true }
// Students and parents mark notifications read. Authorisation check:
// the row must actually target them (either as student_id or parent_id).
export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdminClient()
  if (!admin) return NextResponse.json({ error: 'Service role not configured' }, { status: 500 })

  const body = (await req.json().catch(() => null)) as {
    notification_id?: unknown
    all?: unknown
  } | null
  const id = typeof body?.notification_id === 'string' ? body.notification_id : ''
  const markAll = body?.all === true

  // Resolve parent/student id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: parent } = await (admin as any)
    .from('parents')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  const parentId: string | null = parent?.id ?? null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: student } = await (admin as any)
    .from('students')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()
  const studentId: string | null = student?.id ?? null

  if (!parentId && !studentId) {
    return NextResponse.json({ error: 'No profile found' }, { status: 403 })
  }

  if (markAll) {
    // Fetch every notification that targets this user and stamp read_by.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (admin as any)
      .from('school_notifications')
      .select('id, read_by, target_parent_ids, target_student_ids')
      .order('created_at', { ascending: false })
      .limit(500)
    type Row = {
      id: string
      read_by: string[] | null
      target_parent_ids: string[] | null
      target_student_ids: string[] | null
    }
    const all = (data ?? []) as Row[]
    const relevant = all.filter((r) => {
      const readBy = r.read_by ?? []
      if (readBy.includes(user.id)) return false
      if (parentId && r.target_parent_ids && r.target_parent_ids.includes(parentId)) return true
      if (studentId && r.target_student_ids && r.target_student_ids.includes(studentId)) return true
      return false
    })
    let updated = 0
    for (const r of relevant) {
      const next = [...(r.read_by ?? []), user.id]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (admin as any)
        .from('school_notifications')
        .update({ read_by: next })
        .eq('id', r.id)
      if (!error) updated += 1
    }
    return NextResponse.json({ ok: true, updated })
  }

  if (!id) return NextResponse.json({ error: 'notification_id required' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row } = await (admin as any)
    .from('school_notifications')
    .select('id, target_parent_ids, target_student_ids')
    .eq('id', id)
    .maybeSingle()
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const targetsParent = parentId && Array.isArray(row.target_parent_ids) && row.target_parent_ids.includes(parentId)
  const targetsStudent =
    studentId && Array.isArray(row.target_student_ids) && row.target_student_ids.includes(studentId)
  if (!targetsParent && !targetsStudent) {
    return NextResponse.json({ error: 'Not your notification' }, { status: 403 })
  }

  const result = await markAsRead(admin, id, user.id)
  return NextResponse.json({ ok: result.ok })
}
