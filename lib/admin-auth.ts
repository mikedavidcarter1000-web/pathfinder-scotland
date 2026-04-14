import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Database } from '@/types/database'

// Whitelist approach until a proper admin role column is added.
// Mirrors the check used in app/admin/revenue/page.tsx.
function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const list = getAdminEmails()
  if (list.length === 0) return false
  return list.includes((email ?? '').toLowerCase())
}

/**
 * Server-side admin client using the service role key. Bypasses RLS so admin
 * routes can read click telemetry and write to admin-gated columns.
 * Returns null if SUPABASE_SERVICE_ROLE_KEY is not configured.
 */
export function getAdminClient(): SupabaseClient<Database> | null {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null
  }
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  )
}

/**
 * API-route admin guard. Verifies the caller is signed in AND on the
 * ADMIN_EMAILS whitelist. Returns either a service-role client (ready to use)
 * or a NextResponse error that the caller must return as-is.
 *
 * Fail-closed: if ADMIN_EMAILS is empty, all callers are rejected.
 */
export async function requireAdminApi(): Promise<
  { ok: true; admin: SupabaseClient<Database>; userId: string; email: string }
  | { ok: false; response: NextResponse }
> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  if (!isAdminEmail(user.email)) {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  const admin = getAdminClient()
  if (!admin) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Service role key not configured' },
        { status: 500 }
      ),
    }
  }

  return { ok: true, admin, userId: user.id, email: user.email ?? '' }
}
