import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'

function makeClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookies()).get(name)?.value
        },
        set() {},
        remove() {},
      },
    },
  )
}

export async function GET() {
  const supabase = makeClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: student } = await (supabase as any)
    .from('students')
    .select('gender, is_home_educated, demographic_source, demographic_updated_at')
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json({
    gender: student?.gender ?? null,
    isHomeEducated: student?.is_home_educated ?? false,
    demographicSource: student?.demographic_source ?? null,
  })
}

export async function PUT(req: Request) {
  const supabase = makeClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = (await req.json().catch(() => null)) as {
    gender?: string | null
    isHomeEducated?: boolean
  } | null
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: current } = await (supabase as any)
    .from('students')
    .select('id, demographic_source')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!current) return NextResponse.json({ error: 'Student record not found' }, { status: 404 })

  const prevSource: string | null = current.demographic_source ?? null
  const newSource =
    prevSource === null ? 'self_declared'
    : prevSource === 'self_declared' ? 'self_declared'
    : prevSource === 'seemis_import' || prevSource === 'guidance_teacher' ? 'mixed'
    : prevSource

  const update: Record<string, unknown> = {
    demographic_source: newSource,
    demographic_updated_at: new Date().toISOString(),
  }
  if ('gender' in body) update.gender = body.gender ?? null
  if (typeof body.isHomeEducated === 'boolean') update.is_home_educated = body.isHomeEducated

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('students').update(update).eq('id', current.id)
  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
