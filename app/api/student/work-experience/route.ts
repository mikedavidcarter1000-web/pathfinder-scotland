import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/admin-auth'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdminClient()
  if (!admin) return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })

  // Confirm student record.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: student } = await (admin as any)
    .from('students')
    .select('id, school_id')
    .eq('id', user.id)
    .maybeSingle()
  if (!student) return NextResponse.json({ placements: [], upcoming_group_events: [] })

  // Individual placements for this student.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: placements } = await (admin as any)
    .from('work_placements')
    .select('id, title, placement_type, start_date, end_date, hours, status, employer:employer_id(id, company_name)')
    .eq('student_id', student.id)
    .order('start_date', { ascending: false, nullsFirst: false })

  // Upcoming group events at the same school.
  let upcoming: unknown[] = []
  if (student.school_id) {
    const today = new Date().toISOString().slice(0, 10)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: grp } = await (admin as any)
      .from('work_placements')
      .select('id, title, placement_type, start_date, group_year_groups, employer:employer_id(company_name)')
      .eq('school_id', student.school_id)
      .eq('is_group_event', true)
      .gte('start_date', today)
      .in('status', ['planned', 'confirmed'])
      .order('start_date', { ascending: true })
      .limit(5)
    upcoming = grp ?? []
  }

  return NextResponse.json({
    placements: placements ?? [],
    upcoming_group_events: upcoming,
  })
}
