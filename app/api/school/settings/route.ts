import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'

export const runtime = 'nodejs'

export async function PUT(req: Request) {
  const guard = await requireSchoolStaffApi({ mustBeAdmin: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const body = (await req.json().catch(() => null)) as {
    name?: unknown
    postcode?: unknown
    localAuthority?: unknown
    visibleToAuthority?: unknown
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const update: Record<string, unknown> = {}
  if (typeof body.name === 'string' && body.name.trim()) update.name = body.name.trim()
  if (typeof body.postcode === 'string') update.postcode = body.postcode.trim()
  if (typeof body.localAuthority === 'string') update.local_authority = body.localAuthority.trim()
  if (typeof body.visibleToAuthority === 'boolean') update.visible_to_authority = body.visibleToAuthority

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('schools').update(update).eq('id', ctx.schoolId)
  if (error) return NextResponse.json({ error: 'Could not update school.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
