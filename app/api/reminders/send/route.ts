import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export const runtime = 'nodejs'

// Uses the service role key to query across all students — this route is
// intended to be called by a cron job, not by the browser client.
function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Missing Supabase service role credentials')
  return createClient<Database>(url, serviceKey)
}

const RESEND_FROM = 'Pathfinder Scotland <reminders@pathfinderscot.co.uk>'

interface ReminderRow {
  id: string
  student_id: string
  benefit_id: string
  reminder_date: string
}

interface StudentRow {
  email: string
  first_name: string | null
}

interface BenefitRow {
  name: string
  application_deadline: string | null
  url: string
  provider: string
  short_description: string | null
}

function daysUntilDeadline(deadlineText: string | null): number | null {
  if (!deadlineText) return null
  const MONTHS: Record<string, number> = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  }
  const match = deadlineText.match(
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
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function formatDeadlineDate(deadlineText: string | null): string {
  if (!deadlineText) return 'soon'
  const MONTHS: Record<string, number> = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  }
  const match = deadlineText.match(
    /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+(\d{4}))?/i
  )
  if (!match) return deadlineText
  const day = parseInt(match[1], 10)
  const month = MONTHS[match[2].toLowerCase()]
  const year = match[3] ? parseInt(match[3], 10) : new Date().getFullYear()
  let d = new Date(year, month, day)
  if (!match[3] && d.getTime() < Date.now()) {
    d = new Date(year + 1, month, day)
  }
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function buildEmailHtml(
  student: StudentRow,
  benefit: BenefitRow,
  daysLeft: number | null,
): string {
  const name = student.first_name || 'there'
  const isUrgent = daysLeft !== null && daysLeft <= 7
  const urgencyColour = isUrgent ? '#EF4444' : '#F59E0B'
  const urgencyLabel = isUrgent ? 'Closing soon' : 'Upcoming deadline'
  const deadlineFormatted = formatDeadlineDate(benefit.application_deadline)
  const daysText = daysLeft !== null
    ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F0F5FA;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F5FA;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;">

<!-- Header -->
<tr><td style="background-color:#002D72;padding:24px 32px;">
  <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">Pathfinder Scotland</span>
</td></tr>

<!-- Urgency banner -->
<tr><td style="background-color:${urgencyColour};padding:12px 32px;">
  <span style="color:#ffffff;font-size:14px;font-weight:600;">${urgencyLabel} &mdash; ${daysText}</span>
</td></tr>

<!-- Body -->
<tr><td style="padding:32px;">
  <p style="margin:0 0 16px;color:#1A1A2E;font-size:16px;line-height:1.6;">
    Hi ${name},
  </p>
  <p style="margin:0 0 24px;color:#1A1A2E;font-size:16px;line-height:1.6;">
    The application deadline for <strong>${benefit.name}</strong> is coming up on
    <strong>${deadlineFormatted}</strong>.${isUrgent ? ' Don\'t miss out!' : ''}
  </p>

  <!-- Benefit card -->
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #D1D1DB;border-radius:8px;overflow:hidden;margin-bottom:24px;">
    <tr><td style="padding:20px;">
      <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#1A1A2E;">${benefit.name}</p>
      <p style="margin:0 0 12px;font-size:14px;color:#4A4A5A;">${benefit.provider}</p>
      ${benefit.short_description ? `<p style="margin:0 0 16px;font-size:14px;color:#4A4A5A;line-height:1.5;">${benefit.short_description}</p>` : ''}
      <p style="margin:0;font-size:13px;color:#4A4A5A;">
        <strong>Deadline:</strong> ${deadlineFormatted}
      </p>
    </td></tr>
  </table>

  <!-- CTA button -->
  <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
    <tr><td style="background-color:#005EB8;border-radius:8px;">
      <a href="${benefit.url}" target="_blank" rel="noopener"
         style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
        Apply now
      </a>
    </td></tr>
  </table>

  <p style="margin:0 0 8px;font-size:13px;color:#4A4A5A;line-height:1.5;">
    You can view all your eligible benefits and manage your reminder preferences on your
    <a href="https://pathfinderscot.co.uk/benefits" style="color:#0072CE;text-decoration:none;">benefits page</a>.
  </p>
</td></tr>

<!-- Footer -->
<tr><td style="background-color:#F4F4F6;padding:20px 32px;border-top:1px solid #D1D1DB;">
  <p style="margin:0 0 8px;font-size:12px;color:#4A4A5A;line-height:1.5;">
    You're receiving this because you have email reminders turned on.
    <a href="https://pathfinderscot.co.uk/dashboard/settings" style="color:#0072CE;text-decoration:none;">Manage preferences</a>
  </p>
  <p style="margin:0;font-size:12px;color:#4A4A5A;">
    Pathfinder Scotland &mdash; Built in Scotland, for Scottish students.
  </p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

function buildPlainText(
  student: StudentRow,
  benefit: BenefitRow,
  daysLeft: number | null,
): string {
  const name = student.first_name || 'there'
  const deadlineFormatted = formatDeadlineDate(benefit.application_deadline)
  const daysText = daysLeft !== null
    ? ` (${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining)`
    : ''

  return [
    `Hi ${name},`,
    '',
    `The application deadline for ${benefit.name} is coming up on ${deadlineFormatted}${daysText}.`,
    '',
    `${benefit.name}`,
    `Provider: ${benefit.provider}`,
    benefit.short_description ? `${benefit.short_description}` : '',
    `Deadline: ${deadlineFormatted}`,
    '',
    `Apply: ${benefit.url}`,
    '',
    `View all benefits: https://pathfinderscot.co.uk/benefits`,
    `Manage preferences: https://pathfinderscot.co.uk/dashboard/settings`,
    '',
    '— Pathfinder Scotland',
  ].filter(Boolean).join('\n')
}

// Simple auth via a shared secret for cron callers.
// Falls back to allowing unauthenticated calls in dev.
function authoriseCron(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return process.env.NODE_ENV !== 'production'
  const header = request.headers.get('authorization')
  return header === `Bearer ${cronSecret}`
}

export async function POST(request: Request) {
  if (!authoriseCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.RESEND_API_KEY

  try {
    const supabase = createServiceClient()

    // Get today's date in YYYY-MM-DD
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    // Find all unsent, undismissed reminders whose date has arrived
    const { data: reminders, error: remindersError } = await supabase
      .from('benefit_reminders')
      .select('id, student_id, benefit_id, reminder_date')
      .eq('is_sent', false)
      .eq('is_dismissed', false)
      .lte('reminder_date', todayStr)
      .limit(200)

    if (remindersError) {
      console.error('[reminders/send] query error:', remindersError)
      return NextResponse.json({ error: 'Failed to query reminders' }, { status: 500 })
    }

    if (!reminders || reminders.length === 0) {
      return NextResponse.json({ sent: 0, skipped: 0, errors: 0 })
    }

    // Collect unique student IDs and benefit IDs
    const studentIds = [...new Set(reminders.map((r) => r.student_id))]
    const benefitIds = [...new Set(reminders.map((r) => r.benefit_id))]

    // Batch-fetch students and benefits
    const [{ data: students }, { data: benefits }] = await Promise.all([
      supabase
        .from('students')
        .select('id, email, first_name, email_reminders_enabled')
        .in('id', studentIds),
      supabase
        .from('student_benefits')
        .select('id, name, application_deadline, url, provider, short_description')
        .in('id', benefitIds),
    ])

    const studentMap = new Map(
      (students ?? []).map((s) => [s.id, s])
    )
    const benefitMap = new Map(
      (benefits ?? []).map((b) => [b.id, b])
    )

    let sent = 0
    let skipped = 0
    let errors = 0

    for (const reminder of reminders) {
      const student = studentMap.get(reminder.student_id)
      const benefit = benefitMap.get(reminder.benefit_id)

      if (!student || !benefit) {
        skipped++
        continue
      }

      // Respect the student's preference (may have changed since reminder creation)
      if (student.email_reminders_enabled === false) {
        // Mark as sent so we don't re-process
        await supabase
          .from('benefit_reminders')
          .update({ is_dismissed: true })
          .eq('id', reminder.id)
        skipped++
        continue
      }

      const daysLeft = daysUntilDeadline(benefit.application_deadline)
      const isUrgent = daysLeft !== null && daysLeft <= 7

      const subject = isUrgent
        ? `${daysLeft} days left to apply: ${benefit.name}`
        : `Reminder: ${benefit.name} deadline approaching`

      if (!apiKey) {
        // Dev mode: log instead of sending
        console.info(`[reminders/send] Would email ${student.email}: ${subject}`)
        await supabase
          .from('benefit_reminders')
          .update({ is_sent: true, sent_at: new Date().toISOString() })
          .eq('id', reminder.id)
        sent++
        continue
      }

      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: RESEND_FROM,
            to: [student.email],
            subject,
            html: buildEmailHtml(student, benefit, daysLeft),
            text: buildPlainText(student, benefit, daysLeft),
          }),
        })

        if (!response.ok) {
          const detail = await response.text().catch(() => '')
          console.error(`[reminders/send] Resend error for ${reminder.id}: ${response.status} ${detail}`)
          errors++
          continue
        }

        await supabase
          .from('benefit_reminders')
          .update({ is_sent: true, sent_at: new Date().toISOString() })
          .eq('id', reminder.id)
        sent++
      } catch (emailErr) {
        console.error(`[reminders/send] Failed to send ${reminder.id}:`, emailErr)
        errors++
      }
    }

    return NextResponse.json({ sent, skipped, errors })
  } catch (err) {
    console.error('[reminders/send] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
