import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const Q_MAX = 4000
const CLAMP = (s: unknown) => (typeof s === 'string' ? s.slice(0, Q_MAX) : '')

type DraftRow = {
  q1_text: string
  q2_text: string
  q3_text: string
  last_saved_at: string
  created_at: string
}

export async function GET(): Promise<Response> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('personal_statement_drafts')
    .select('q1_text, q2_text, q3_text, last_saved_at, created_at')
    .eq('student_id', user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const row = (data ?? null) as DraftRow | null
  return NextResponse.json({
    authenticated: true,
    draft: row
      ? {
          q1: row.q1_text,
          q2: row.q2_text,
          q3: row.q3_text,
          lastSavedAt: row.last_saved_at,
          createdAt: row.created_at,
        }
      : null,
  })
}

export async function PUT(request: Request): Promise<Response> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as
    | { q1?: unknown; q2?: unknown; q3?: unknown }
    | null
  if (!body) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const q1 = CLAMP(body.q1)
  const q2 = CLAMP(body.q2)
  const q3 = CLAMP(body.q3)

  const { data, error } = await supabase
    .from('personal_statement_drafts')
    .upsert(
      {
        student_id: user.id,
        q1_text: q1,
        q2_text: q2,
        q3_text: q3,
      },
      { onConflict: 'student_id' },
    )
    .select('q1_text, q2_text, q3_text, last_saved_at, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const row = data as DraftRow
  return NextResponse.json({
    draft: {
      q1: row.q1_text,
      q2: row.q2_text,
      q3: row.q3_text,
      lastSavedAt: row.last_saved_at,
      createdAt: row.created_at,
    },
  })
}

export async function DELETE(): Promise<Response> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { error } = await supabase
    .from('personal_statement_drafts')
    .delete()
    .eq('student_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
