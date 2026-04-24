import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/admin-auth'

export const runtime = 'nodejs'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ results: [] })

  const admin = getAdminClient()
  if (!admin) return NextResponse.json({ results: [] })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: student } = await (admin as any)
    .from('students').select('id, school_id').eq('id', user.id).maybeSingle()
  if (!student) return NextResponse.json({ results: [] })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin as any)
    .from('sqa_results')
    .select('subject_name, qualification_type, grade, predicted_grade, value_added, academic_year')
    .eq('student_id', student.id)
    .order('academic_year', { ascending: false })

  return NextResponse.json({ results: data ?? [] })
}
