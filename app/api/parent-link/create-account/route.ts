import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

// Called after a parent has signed in (or just signed up) via Supabase Auth.
// Creates their parents row, resolves SIMD from their postcode if given,
// and redeems the pending invite code -- all in one round-trip.

const UK_POSTCODE_RE = /^[A-Z]{1,2}[0-9R][0-9A-Z]? ?[0-9][A-Z]{2}$/i

function normalisePostcode(raw: string): string | null {
  const trimmed = raw.trim().toUpperCase().replace(/\s+/g, '')
  if (!UK_POSTCODE_RE.test(trimmed.replace(/(.{3,4})(.{3})/, '$1 $2'))) {
    // Fall back to permissive accept if regex is unhappy -- SIMD lookup will
    // simply return no row and the parent is left without an SIMD decile.
  }
  return trimmed.length ? trimmed : null
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = (await req.json().catch(() => null)) as {
      full_name?: unknown
      phone?: unknown
      postcode?: unknown
      code?: unknown
    } | null

    const fullName = typeof body?.full_name === 'string' ? body.full_name.trim() : ''
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : ''
    const postcodeRaw = typeof body?.postcode === 'string' ? body.postcode.trim() : ''
    const code = typeof body?.code === 'string' ? body.code.trim() : ''

    if (!fullName) {
      return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 })
    }

    // Check if parent row already exists; if so just update basic fields
    const { data: existing } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    let simdDecile: number | null = null
    const postcodeNormalised = postcodeRaw ? normalisePostcode(postcodeRaw) : null

    if (postcodeNormalised) {
      const { data: simd } = await supabase
        .from('simd_postcodes')
        .select('simd_decile')
        .eq('postcode', postcodeNormalised)
        .maybeSingle()
      simdDecile = simd?.simd_decile ?? null
    }

    if (!existing) {
      const { error: insertErr } = await supabase.from('parents').insert({
        user_id: user.id,
        full_name: fullName,
        email: user.email ?? '',
        phone: phone || null,
        postcode: postcodeNormalised,
        simd_decile: simdDecile,
      })
      if (insertErr) {
        console.error('[parent-link/create-account] insert parent failed:', insertErr)
        return NextResponse.json(
          { error: 'Could not create parent profile.' },
          { status: 500 }
        )
      }
    } else {
      // Update in place so a returning parent linking a second child refreshes basics
      const updates: Record<string, unknown> = { full_name: fullName }
      if (phone) updates.phone = phone
      if (postcodeNormalised) {
        updates.postcode = postcodeNormalised
        updates.simd_decile = simdDecile
      }
      await supabase.from('parents').update(updates).eq('user_id', user.id)
    }

    // Redeem invite code (may fail if already linked; surface cleanly)
    if (code) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: redeemResult, error: redeemErr } = await (supabase as any).rpc(
        'redeem_parent_invite_code',
        { p_code: code }
      )
      if (redeemErr) {
        const msg = (redeemErr.message || '').toLowerCase()
        if (msg.includes('invalid or expired')) {
          return NextResponse.json(
            { error: 'Invite code is invalid or has expired. Ask your child for a new one.' },
            { status: 400 }
          )
        }
        if (msg.includes('already linked')) {
          return NextResponse.json({ ok: true, note: 'already-linked' })
        }
        console.error('[parent-link/create-account] redeem failed:', redeemErr)
        return NextResponse.json(
          { error: 'Could not link to the student. Please try again.' },
          { status: 500 }
        )
      }
      return NextResponse.json({ ok: true, link: redeemResult })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[parent-link/create-account] unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
