import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/admin-auth'

export const runtime = 'nodejs'

// POST { code }  -- student links themselves to a school via the join code.
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const admin = getAdminClient()
    if (!admin) return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })

    const body = (await req.json().catch(() => null)) as { code?: unknown } | null
    const code = typeof body?.code === 'string' ? body.code.trim().toUpperCase() : ''
    if (!code) return NextResponse.json({ error: 'Enter a school code.' }, { status: 400 })

    // Ensure caller is a student
    const { data: student } = await supabase.from('students').select('id').eq('id', user.id).maybeSingle()
    if (!student) return NextResponse.json({ error: 'Only students can link to a school.' }, { status: 403 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: codeRow } = await (admin as any)
      .from('school_join_codes')
      .select('id, school_id, is_active, expires_at, schools!inner(name, slug)')
      .eq('code', code)
      .eq('is_active', true)
      .maybeSingle()

    if (!codeRow) return NextResponse.json({ error: 'Code not recognised.' }, { status: 404 })
    if (codeRow.expires_at && new Date(codeRow.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: 'This code has expired.' }, { status: 410 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: linkErr } = await (admin as any)
      .from('school_student_links')
      .upsert(
        { school_id: codeRow.school_id, student_id: user.id, linked_by: 'school_code' },
        { onConflict: 'school_id,student_id' }
      )
    if (linkErr) {
      console.error('[school/link-student] upsert failed:', linkErr)
      return NextResponse.json({ error: 'Could not link to school.' }, { status: 500 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('students').update({ school_id: codeRow.school_id }).eq('id', user.id)

    return NextResponse.json({ ok: true, schoolName: codeRow.schools?.name, schoolSlug: codeRow.schools?.slug })
  } catch (err) {
    console.error('[school/link-student] unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const admin = getAdminClient()
    if (!admin) return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('school_student_links').delete().eq('student_id', user.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('students').update({ school_id: null }).eq('id', user.id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[school/link-student DELETE] unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET returns the student's currently linked school (if any).
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ linked: false })

    const admin = getAdminClient()
    if (!admin) return NextResponse.json({ linked: false })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (admin as any)
      .from('school_student_links')
      .select('school_id, linked_at, schools!inner(name, slug)')
      .eq('student_id', user.id)
      .maybeSingle()

    if (!data) return NextResponse.json({ linked: false })

    return NextResponse.json({
      linked: true,
      schoolId: data.school_id,
      schoolName: data.schools?.name,
      schoolSlug: data.schools?.slug,
      linkedAt: data.linked_at,
    })
  } catch {
    return NextResponse.json({ linked: false })
  }
}
