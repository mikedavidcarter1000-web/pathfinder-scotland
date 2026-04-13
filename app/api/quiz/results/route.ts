import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

type Body = {
  realistic_score?: number
  investigative_score?: number
  artistic_score?: number
  social_score?: number
  enterprising_score?: number
  conventional_score?: number
  top_types?: string[]
}

const VALID_TYPES = new Set(['R', 'I', 'A', 'S', 'E', 'C'])

function validScore(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 100
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json().catch(() => null)) as Body | null
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    if (
      !validScore(body.realistic_score) ||
      !validScore(body.investigative_score) ||
      !validScore(body.artistic_score) ||
      !validScore(body.social_score) ||
      !validScore(body.enterprising_score) ||
      !validScore(body.conventional_score)
    ) {
      return NextResponse.json({ error: 'Scores must be numbers between 0 and 100' }, { status: 400 })
    }

    if (
      !Array.isArray(body.top_types) ||
      body.top_types.length !== 3 ||
      !body.top_types.every((t) => typeof t === 'string' && VALID_TYPES.has(t))
    ) {
      return NextResponse.json({ error: 'top_types must be 3 RIASEC codes' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('quiz_results')
      .insert({
        student_id: user.id,
        realistic_score: Math.round(body.realistic_score),
        investigative_score: Math.round(body.investigative_score),
        artistic_score: Math.round(body.artistic_score),
        social_score: Math.round(body.social_score),
        enterprising_score: Math.round(body.enterprising_score),
        conventional_score: Math.round(body.conventional_score),
        top_types: body.top_types,
      })
      .select('id, completed_at')
      .single()

    if (error) {
      console.error('[quiz/results] insert error:', error)
      return NextResponse.json({ error: 'Failed to save result' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: data.id, completed_at: data.completed_at })
  } catch (err) {
    console.error('[quiz/results] unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
