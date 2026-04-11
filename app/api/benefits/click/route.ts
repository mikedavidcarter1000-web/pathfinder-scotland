import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      benefit_id?: string
      source_page?: string
    }
    const benefitId = body.benefit_id
    const sourcePage = body.source_page ?? null

    if (!benefitId || typeof benefitId !== 'string') {
      return NextResponse.json({ error: 'benefit_id is required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Look up the benefit so we know the redirect URL and whether to log the
    // click as an affiliate click.
    const { data: benefit, error: benefitError } = await supabase
      .from('student_benefits')
      .select('id, url, affiliate_url, is_active')
      .eq('id', benefitId)
      .single()

    if (benefitError || !benefit || !benefit.is_active) {
      return NextResponse.json({ error: 'Benefit not found' }, { status: 404 })
    }

    // Resolve student_id from the session if present.
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const studentId = user?.id ?? null

    const isAffiliate = !!benefit.affiliate_url

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase as any).from('benefit_clicks').insert({
      benefit_id: benefit.id,
      student_id: studentId,
      is_affiliate: isAffiliate,
      source_page: sourcePage,
    })

    if (insertError) {
      // Log but still return the redirect URL — losing an analytics event
      // shouldn't break the student's experience.
      console.error('[benefits/click] insert error:', insertError)
    }

    return NextResponse.json({
      success: true,
      redirect_url: benefit.affiliate_url || benefit.url,
      is_affiliate: isAffiliate,
    })
  } catch (err) {
    console.error('[benefits/click] unexpected error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
