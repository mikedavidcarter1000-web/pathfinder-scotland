import { NextResponse } from 'next/server'
import { requireParentApi } from '@/lib/school/student-auth'

export const runtime = 'nodejs'

// GET /api/parent/choices/[id] -- choice detail with items + column labels.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireParentApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: choice } = await (admin as any)
    .from('student_choices')
    .select(`
      *,
      choice_rounds(id, name, academic_year, year_group, requires_parent_approval, instructions, schools(name, slug)),
      students(first_name, last_name)
    `)
    .eq('id', id)
    .maybeSingle()

  if (!choice || !ctx.linkedStudentIds.includes(choice.student_id)) {
    return NextResponse.json({ error: 'Choice not found.' }, { status: 404 })
  }

  // Items + column + subject info.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: items } = await (admin as any)
    .from('student_choice_items')
    .select('*, choice_round_columns(id, label, column_position), subjects(id, name)')
    .eq('student_choice_id', id)

  const sorted = (items ?? []).sort((a: { choice_round_columns?: { column_position?: number } }, b: { choice_round_columns?: { column_position?: number } }) => {
    const ap = a.choice_round_columns?.column_position ?? 0
    const bp = b.choice_round_columns?.column_position ?? 0
    return ap - bp
  })

  return NextResponse.json({ choice, items: sorted })
}
