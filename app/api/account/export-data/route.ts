import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Call the GDPR export function — uses auth.uid() internally (SECURITY DEFINER)
    const { data, error } = await supabase.rpc('export_user_data')

    if (error) {
      console.error('Data export RPC error:', error)
      return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
    }

    const json = JSON.stringify(data, null, 2)
    const filename = `pathfinder-data-export-${new Date().toISOString().split('T')[0]}.json`

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export data error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
