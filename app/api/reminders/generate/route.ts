import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const MONTHS: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
}

// Parse free-text deadlines like "31 March", "1 June", "1 June to 1 December".
// Returns the next occurrence — if the parsed date has already passed this year,
// roll forward to next year so reminders make sense.
function parseDeadline(text: string | null | undefined): Date | null {
  if (!text) return null
  const match = text.match(
    /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+(\d{4}))?/i
  )
  if (!match) return null
  const day = parseInt(match[1], 10)
  const month = MONTHS[match[2].toLowerCase()]
  const year = match[3] ? parseInt(match[3], 10) : new Date().getFullYear()
  let d = new Date(year, month, day)
  if (!match[3] && d.getTime() < Date.now()) {
    d = new Date(year + 1, month, day)
  }
  return d
}

// Format as YYYY-MM-DD for Supabase DATE column
function toDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

type Stage = 's1_s4' | 's5_s6' | 'college' | 'university'

function stageFromSchoolStage(schoolStage: string | null | undefined): Stage | null {
  if (!schoolStage) return null
  if (['s1', 's2', 's3', 's4'].includes(schoolStage)) return 's1_s4'
  if (['s5', 's6'].includes(schoolStage)) return 's5_s6'
  if (schoolStage === 'college') return 'college'
  if (schoolStage === 'mature') return 'university'
  return null
}

interface BenefitRow {
  id: string
  application_deadline: string | null
  eligibility_s1_s4: boolean | null
  eligibility_s5_s6: boolean | null
  eligibility_college: boolean | null
  eligibility_university: boolean | null
  is_active: boolean | null
}

function stageAppliesToBenefit(stage: Stage | null, benefit: BenefitRow): boolean {
  if (!stage) return true
  if (stage === 's1_s4') return !!benefit.eligibility_s1_s4
  if (stage === 's5_s6') return !!benefit.eligibility_s5_s6
  if (stage === 'college') return !!benefit.eligibility_college
  if (stage === 'university') return !!benefit.eligibility_university
  return true
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()

    // Authenticate — require a logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const studentId = user.id

    // Load the student's profile (for stage filtering and preferences)
    const { data: student } = await supabase
      .from('students')
      .select('school_stage, email_reminders_enabled, reminder_frequency')
      .eq('id', studentId)
      .single()

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    if (student.email_reminders_enabled === false || student.reminder_frequency === 'none') {
      return NextResponse.json({ created: 0, existing: 0, skipped_reason: 'reminders_disabled' })
    }

    const stage = stageFromSchoolStage(student.school_stage)
    const frequency = student.reminder_frequency ?? '30_and_7'

    // Fetch all active benefits with a deadline
    const { data: benefits, error: benefitsError } = await supabase
      .from('student_benefits')
      .select('id, application_deadline, eligibility_s1_s4, eligibility_s5_s6, eligibility_college, eligibility_university, is_active')
      .eq('is_active', true)
      .not('application_deadline', 'is', null)

    if (benefitsError) {
      console.error('[reminders/generate] benefits query error:', benefitsError)
      return NextResponse.json({ error: 'Failed to fetch benefits' }, { status: 500 })
    }

    const now = new Date()
    const remindersToInsert: Array<{
      student_id: string
      benefit_id: string
      reminder_date: string
    }> = []

    for (const benefit of benefits ?? []) {
      if (!stageAppliesToBenefit(stage, benefit)) continue

      const deadline = parseDeadline(benefit.application_deadline)
      if (!deadline || deadline.getTime() <= now.getTime()) continue

      // Calculate reminder dates based on user preference
      const thirtyDaysBefore = new Date(deadline)
      thirtyDaysBefore.setDate(thirtyDaysBefore.getDate() - 30)

      const sevenDaysBefore = new Date(deadline)
      sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7)

      if (frequency === '30_and_7' || frequency === '30_only') {
        if (thirtyDaysBefore.getTime() > now.getTime()) {
          remindersToInsert.push({
            student_id: studentId,
            benefit_id: benefit.id,
            reminder_date: toDateString(thirtyDaysBefore),
          })
        }
      }

      if (frequency === '30_and_7' || frequency === '7_only') {
        if (sevenDaysBefore.getTime() > now.getTime()) {
          remindersToInsert.push({
            student_id: studentId,
            benefit_id: benefit.id,
            reminder_date: toDateString(sevenDaysBefore),
          })
        }
      }
    }

    if (remindersToInsert.length === 0) {
      return NextResponse.json({ created: 0, existing: 0 })
    }

    // Upsert — the UNIQUE constraint on (student_id, benefit_id, reminder_date)
    // means duplicates are silently ignored.
    const { data: upserted, error: insertError } = await supabase
      .from('benefit_reminders')
      .upsert(remindersToInsert, {
        onConflict: 'student_id,benefit_id,reminder_date',
        ignoreDuplicates: true,
      })
      .select('id')

    if (insertError) {
      console.error('[reminders/generate] insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create reminders' }, { status: 500 })
    }

    const created = upserted?.length ?? 0
    const existing = remindersToInsert.length - created

    return NextResponse.json({ created, existing })
  } catch (err) {
    console.error('[reminders/generate] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
