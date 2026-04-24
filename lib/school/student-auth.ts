import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/admin-auth'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export type StudentContext = {
  userId: string
  email: string
  schoolIds: string[]
}

// Guard for student-facing endpoints that need a signed-in student + admin client.
export async function requireStudentApi(): Promise<
  | { ok: true; ctx: StudentContext; admin: SupabaseClient<Database> }
  | { ok: false; response: NextResponse }
> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!student) {
    return { ok: false, response: NextResponse.json({ error: 'Student account required' }, { status: 403 }) }
  }

  const admin = getAdminClient()
  if (!admin) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Service role key not configured' }, { status: 500 }),
    }
  }

  // Fetch linked schools.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: links } = await (admin as any)
    .from('school_student_links')
    .select('school_id')
    .eq('student_id', user.id)

  const schoolIds = (links ?? []).map((r: { school_id: string }) => r.school_id)

  return {
    ok: true,
    ctx: {
      userId: user.id,
      email: user.email ?? '',
      schoolIds,
    },
    admin,
  }
}

export type ParentContext = {
  userId: string
  email: string
  parentId: string
  linkedStudentIds: string[]
}

// Guard for parent-facing endpoints.
export async function requireParentApi(): Promise<
  | { ok: true; ctx: ParentContext; admin: SupabaseClient<Database> }
  | { ok: false; response: NextResponse }
> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const admin = getAdminClient()
  if (!admin) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Service role key not configured' }, { status: 500 }),
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: parent } = await (admin as any)
    .from('parents')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!parent) {
    return { ok: false, response: NextResponse.json({ error: 'Parent account required' }, { status: 403 }) }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: links } = await (admin as any)
    .from('parent_student_links')
    .select('student_id')
    .eq('parent_id', parent.id)
    .eq('status', 'active')

  const linkedStudentIds = (links ?? []).map((r: { student_id: string }) => r.student_id)

  return {
    ok: true,
    ctx: {
      userId: user.id,
      email: user.email ?? '',
      parentId: parent.id,
      linkedStudentIds,
    },
    admin,
  }
}
