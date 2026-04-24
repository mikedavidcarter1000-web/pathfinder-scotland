import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { normaliseTime } from '@/lib/school/parent-evening-slots'

export const runtime = 'nodejs'

function esc(s: unknown): string {
  if (s === null || s === undefined) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

type PrepSnapshot = {
  student: {
    first_name: string | null
    last_name: string | null
    school_stage: string | null
    registration_class: string | null
    attendance_pct: number | null
  }
  subjects: Array<{ subject: string; working_grade: string | null; on_track: string | null; effort: string | null }>
  saved_courses: Array<{ title: string; university: string; eligibility: string | null }>
  active_flags: string[]
}

// GET /api/school/parents-evening/[id]/schedule?staff_id=...
// Returns a printable HTML schedule for a given teacher across the event.
// Same pattern as Schools-4 meeting brief -- HTML + @page CSS + window.print().
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await requireSchoolStaffApi()
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard

  const url = new URL(req.url)
  const staffIdParam = url.searchParams.get('staff_id')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: evening } = await (admin as any)
    .from('parent_evenings')
    .select('*')
    .eq('id', id)
    .eq('school_id', ctx.schoolId)
    .maybeSingle()
  if (!evening) return NextResponse.json({ error: 'Evening not found' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: school } = await (admin as any)
    .from('schools')
    .select('name')
    .eq('id', ctx.schoolId)
    .maybeSingle()

  // If no staff filter, produce a schedule for every staff who has either
  // availability or bookings on this event. Otherwise narrow to one.
  let staffFilter: string[] | null = null
  if (staffIdParam) staffFilter = [staffIdParam]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let availabilityQ: any = (admin as any)
    .from('parent_evening_availability')
    .select('staff_id, available_from, available_to, room, school_staff:staff_id(full_name, department)')
    .eq('parent_evening_id', id)
  if (staffFilter) availabilityQ = availabilityQ.in('staff_id', staffFilter)
  const { data: availabilityRows } = await availabilityQ

  type Avail = { staff_id: string; available_from: string; available_to: string; room: string | null; school_staff: { full_name: string; department: string | null } | null }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let bookingsQ: any = (admin as any)
    .from('parent_evening_bookings')
    .select(
      `id, staff_id, slot_time, booking_status, prep_snapshot,
       students:student_id(first_name, last_name, school_stage, registration_class),
       parents:parent_id(full_name)`
    )
    .eq('parent_evening_id', id)
  if (staffFilter) bookingsQ = bookingsQ.in('staff_id', staffFilter)
  const { data: bookingsRows } = await bookingsQ

  type BookingRow = {
    id: string
    staff_id: string
    slot_time: string
    booking_status: string
    prep_snapshot: PrepSnapshot | null
    students: { first_name: string | null; last_name: string | null; school_stage: string | null; registration_class: string | null } | null
    parents: { full_name: string | null } | null
  }

  const availByStaff = new Map<string, Avail>()
  for (const a of ((availabilityRows ?? []) as Avail[])) availByStaff.set(a.staff_id, a)

  const bookingsByStaff = new Map<string, BookingRow[]>()
  for (const b of ((bookingsRows ?? []) as BookingRow[])) {
    const list = bookingsByStaff.get(b.staff_id) ?? []
    list.push(b)
    bookingsByStaff.set(b.staff_id, list)
  }
  for (const list of bookingsByStaff.values()) list.sort((a, b) => a.slot_time.localeCompare(b.slot_time))

  const staffIds = Array.from(new Set([...availByStaff.keys(), ...bookingsByStaff.keys()]))
  // Fetch any staff who have bookings but no availability (unlikely but possible with admin overrides).
  const missingForAvail = staffIds.filter((s) => !availByStaff.has(s))
  let extraStaffNames: Record<string, { full_name: string; department: string | null }> = {}
  if (missingForAvail.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: extras } = await (admin as any)
      .from('school_staff')
      .select('id, full_name, department')
      .in('id', missingForAvail)
    extraStaffNames = Object.fromEntries((extras ?? []).map((r: { id: string; full_name: string; department: string | null }) => [r.id, { full_name: r.full_name, department: r.department }]))
  }

  const blocks = staffIds.map((sid) => {
    const avail = availByStaff.get(sid)
    const staffName = avail?.school_staff?.full_name ?? extraStaffNames[sid]?.full_name ?? '—'
    const dept = avail?.school_staff?.department ?? extraStaffNames[sid]?.department ?? ''
    const bookings = (bookingsByStaff.get(sid) ?? []).filter((b) => b.booking_status === 'confirmed')

    const rows = bookings.map((b) => {
      const s = b.students
      const name = `${s?.last_name ?? ''}, ${s?.first_name ?? ''}`.replace(/^, |, $/g, '')
      const subjectsLine = (b.prep_snapshot?.subjects ?? [])
        .slice(0, 6)
        .map((sub) => `${esc(sub.subject)}: ${esc(sub.working_grade ?? '-')} (${esc(sub.on_track ?? '-')})`)
        .join(' &middot; ')
      const savedLine = (b.prep_snapshot?.saved_courses ?? [])
        .slice(0, 3)
        .map((c) => `${esc(c.title)} at ${esc(c.university)}`)
        .join('; ')
      const flagsLine = (b.prep_snapshot?.active_flags ?? []).map((f) => `<span class="flag">${esc(f)}</span>`).join(' ')
      const attendance = b.prep_snapshot?.student?.attendance_pct
      return `<tr>
        <td class="time">${esc(normaliseTime(b.slot_time))}</td>
        <td>
          <div class="student"><strong>${esc(name || '—')}</strong> &middot; ${esc(s?.school_stage ?? '')} &middot; ${esc(s?.registration_class ?? '')}</div>
          <div class="parent">Parent: ${esc(b.parents?.full_name ?? 'Unlinked')}</div>
          ${subjectsLine ? `<div class="info">${subjectsLine}</div>` : ''}
          <div class="info">Attendance: ${attendance === null || attendance === undefined ? '-' : esc(attendance.toString())}%${savedLine ? ' &middot; ' + savedLine : ''}</div>
          ${flagsLine ? `<div class="flags">${flagsLine}</div>` : ''}
        </td>
      </tr>`
    }).join('')

    return `<section class="teacher-block">
      <h2>${esc(staffName)}${dept ? ` <span class="dept">(${esc(dept)})</span>` : ''}${avail?.room ? ` &middot; Room ${esc(avail.room)}` : ''}</h2>
      <div class="window">${esc(normaliseTime(avail?.available_from ?? ''))}&ndash;${esc(normaliseTime(avail?.available_to ?? ''))}</div>
      ${bookings.length === 0
        ? '<p class="empty">No confirmed bookings.</p>'
        : `<table class="sched">
            <thead><tr><th>Slot</th><th>Meeting</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>`
      }
    </section>`
  }).join('')

  const html = `<!DOCTYPE html><html lang="en"><head>
    <meta charset="utf-8"/>
    <title>${esc(evening.name)} &mdash; Schedule</title>
    <style>
      @page { size: A4; margin: 12mm; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 11px; line-height: 1.35; color: #111; padding: 16px; background: white; }
      h1 { font-size: 18px; margin: 0 0 4px; }
      .meta { color: #666; margin-bottom: 12px; }
      .teacher-block { margin-bottom: 18px; page-break-inside: avoid; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; }
      .teacher-block h2 { font-size: 13px; margin: 0; }
      .dept { color: #6b7280; font-weight: normal; }
      .window { color: #6b7280; margin-bottom: 6px; }
      table.sched { width: 100%; border-collapse: collapse; }
      table.sched th, table.sched td { border: 1px solid #e5e7eb; padding: 4px 6px; text-align: left; vertical-align: top; }
      table.sched th { background: #f3f4f6; font-weight: 600; font-size: 10px; }
      .time { white-space: nowrap; font-weight: 600; width: 60px; }
      .student { font-size: 11px; }
      .parent { font-size: 10.5px; color: #374151; }
      .info { font-size: 10.5px; color: #374151; margin-top: 2px; }
      .flags { font-size: 10px; margin-top: 2px; }
      .flag { display: inline-block; padding: 1px 5px; border-radius: 3px; background: #fef3c7; color: #92400e; margin-right: 3px; }
      .empty { color: #9ca3af; margin: 4px 0 0; font-style: italic; }
      .print-btn { padding: 6px 10px; margin: 0 0 12px 0; font-size: 12px; border: 1px solid #ccc; background: #fff; cursor: pointer; }
      @media print { .no-print { display: none !important; } }
    </style>
  </head><body>
    <button class="print-btn no-print" onclick="window.print()">Print / Save as PDF</button>
    <h1>${esc(evening.name)}</h1>
    <div class="meta">${esc(school?.name ?? 'School')} &middot; ${esc(evening.event_date)} &middot; slot ${esc(String(evening.slot_duration_minutes))} min (${esc(String(evening.break_between_slots_minutes))} min break)</div>
    ${blocks || '<p>No staff or bookings yet.</p>'}
  </body></html>`

  return new NextResponse(html, { headers: { 'content-type': 'text/html; charset=utf-8' } })
}
