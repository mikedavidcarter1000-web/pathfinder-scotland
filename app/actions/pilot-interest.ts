'use server'

import { getAnonSupabase } from '@/lib/supabase-public'

export type PilotInterestRole = 'teacher' | 'adviser' | 'parent'

export type PilotInterestResult =
  | { status: 'ok' }
  | { status: 'invalid' }
  | { status: 'server_error'; message: string }

export interface PilotInterestInput {
  role: PilotInterestRole
  name: string
  email: string
  organisation?: string
  postcode?: string
  message?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function submitPilotInterest(
  input: PilotInterestInput,
): Promise<PilotInterestResult> {
  const role = input.role
  if (role !== 'teacher' && role !== 'adviser' && role !== 'parent') {
    return { status: 'invalid' }
  }

  const name = (input.name ?? '').trim()
  const email = (input.email ?? '').trim()
  if (name.length === 0 || name.length > 120) return { status: 'invalid' }
  if (!EMAIL_RE.test(email) || email.length > 200) return { status: 'invalid' }

  const organisation = input.organisation?.trim().slice(0, 200) || null
  const postcode = input.postcode?.trim().toUpperCase().slice(0, 10) || null
  const message = input.message?.trim().slice(0, 2000) || null

  try {
    const supabase = getAnonSupabase()
    if (!supabase) return { status: 'server_error', message: 'Database unavailable.' }
    const { error } = await supabase.from('pilot_interest').insert({
      role,
      name,
      email,
      organisation,
      postcode,
      message,
    })
    if (error) return { status: 'server_error', message: error.message }
    return { status: 'ok' }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { status: 'server_error', message }
  }
}
