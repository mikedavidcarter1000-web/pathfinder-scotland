import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

type MatchStatus = 'eligible' | 'applied' | 'received' | 'dismissed'

const ALLOWED: MatchStatus[] = ['eligible', 'applied', 'received', 'dismissed']

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json().catch(() => null)) as {
      bursary_id?: string
      status?: MatchStatus
    } | null

    if (!body?.bursary_id || !body?.status || !ALLOWED.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('student_bursary_matches')
      .upsert(
        {
          student_id: user.id,
          bursary_id: body.bursary_id,
          match_status: body.status,
        },
        { onConflict: 'student_id,bursary_id' }
      )

    if (error) {
      console.error('[bursaries/status] upsert error:', error)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[bursaries/status] unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
