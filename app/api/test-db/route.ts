import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Missing Supabase credentials',
        url: supabaseUrl ? 'present' : 'missing',
        key: supabaseKey ? 'present' : 'missing'
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test universities table
    const { data: universities, error: uniError } = await supabase
      .from('universities')
      .select('*')
      .limit(5)

    if (uniError) {
      return NextResponse.json({
        error: 'Failed to fetch universities',
        details: uniError.message,
        code: uniError.code
      }, { status: 500 })
    }

    // Test courses table with university join
    const { data: courses, error: courseError } = await supabase
      .from('courses')
      .select(`
        *,
        university:universities(*)
      `)
      .limit(5)

    if (courseError) {
      return NextResponse.json({
        error: 'Failed to fetch courses',
        details: courseError.message,
        code: courseError.code
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      universities: {
        count: universities?.length || 0,
        sample: universities
      },
      courses: {
        count: courses?.length || 0,
        sample: courses
      }
    })
  } catch (err) {
    return NextResponse.json({
      error: 'Unexpected error',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
