import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

const VALID_CATS = new Set(['positive', 'improvement', 'concern', 'general'])

export async function GET() {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('comment_banks')
    .select('id, department, category, comment_template, created_by, created_at')
    .eq('school_id', ctx.schoolId)
    .order('category', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comments: data ?? [] })
}

export async function POST(req: Request) {
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as {
    category?: unknown
    department?: unknown
    comment_template?: unknown
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const category = typeof body.category === 'string' ? body.category : ''
  if (!VALID_CATS.has(category)) return NextResponse.json({ error: 'Invalid category.' }, { status: 400 })
  const dept = typeof body.department === 'string' && body.department.trim() ? body.department.trim() : null
  const template = typeof body.comment_template === 'string' ? body.comment_template.trim() : ''
  if (!template) return NextResponse.json({ error: 'Template required.' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('comment_banks')
    .insert({
      school_id: ctx.schoolId,
      category,
      department: dept,
      comment_template: template,
      created_by: ctx.staffId,
    })
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comment: data })
}
