import { NextResponse } from 'next/server'
import { requireSchoolStaffApi } from '@/lib/school/auth'
import { hasRecentDuplicate, sendSchoolNotification } from '@/lib/school/notifications'

export const runtime = 'nodejs'

// POST /api/school/notifications/generate-reminders
// Sweeps the school's data for upcoming deadlines and creates notification
// rows. Guarded against re-send via hasRecentDuplicate (24h window).
// Can be called manually from an admin UI or from a cron scheduler.
export async function POST() {
  const guard = await requireSchoolStaffApi({ mustBeAdmin: true })
  if (!guard.ok) return guard.response
  const { ctx, admin } = guard
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminAny = admin as any

  const stats = {
    tracking_deadlines: 0,
    intervention_followups: 0,
    asn_reviews: 0,
    parent_evening_reminders: 0,
    choice_deadlines: 0,
  }

  // 1. Tracking cycles ending in <= 3 days.
  const threeDaysOut = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const today = new Date().toISOString().slice(0, 10)
  const { data: cycles } = await adminAny
    .from('tracking_cycles')
    .select('id, name, ends_at, is_current')
    .eq('school_id', ctx.schoolId)
    .eq('is_current', true)
    .lte('ends_at', threeDaysOut)
    .gte('ends_at', today)
  type Cycle = { id: string; name: string; ends_at: string }
  for (const c of ((cycles ?? []) as Cycle[])) {
    // For each teacher with any class assignment at this school, check how
    // many tracking entries are still missing. We count entries per teacher
    // via a join against class_assignments.
    const { data: assignments } = await adminAny
      .from('class_assignments')
      .select('id, staff_id')
      .eq('school_id', ctx.schoolId)
    type Assign = { id: string; staff_id: string }
    const byStaff = new Map<string, string[]>()
    for (const a of ((assignments ?? []) as Assign[])) {
      const list = byStaff.get(a.staff_id) ?? []
      list.push(a.id)
      byStaff.set(a.staff_id, list)
    }

    for (const [staffId, assignmentIds] of byStaff) {
      if (assignmentIds.length === 0) continue

      // Count class_students for these assignments (the denominator).
      const { count: rosterCount } = await adminAny
        .from('class_students')
        .select('id', { count: 'exact', head: true })
        .in('class_assignment_id', assignmentIds)

      // Count tracking entries already recorded for this cycle.
      const { count: entryCount } = await adminAny
        .from('tracking_entries')
        .select('id', { count: 'exact', head: true })
        .eq('cycle_id', c.id)
        .in('class_assignment_id', assignmentIds)

      const roster = rosterCount ?? 0
      const entries = entryCount ?? 0
      if (roster === 0 || entries >= roster) continue

      const remaining = roster - entries
      const daysLeft = Math.max(
        0,
        Math.ceil((new Date(c.ends_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      )
      const title = `Tracking entries due in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`
      const body = `You have ${remaining} of ${roster} entries remaining for ${c.name}.`
      if (await hasRecentDuplicate(admin, { schoolId: ctx.schoolId, type: 'tracking_deadline', title })) continue

      await sendSchoolNotification({
        admin,
        schoolId: ctx.schoolId,
        type: 'tracking_deadline',
        title,
        body,
        targetStaffIds: [staffId],
        channel: 'in_app',
        createdBy: ctx.userId,
      })
      stats.tracking_deadlines += 1
    }
  }

  // 2. Intervention follow-ups due.
  const { data: interventions } = await adminAny
    .from('interventions')
    .select('id, title, staff_id, follow_up_date, completed_at, student_id, students:student_id(first_name, last_name)')
    .eq('school_id', ctx.schoolId)
    .is('completed_at', null)
    .lte('follow_up_date', today)
    .not('follow_up_date', 'is', null)
  type Intervention = {
    id: string
    title: string
    staff_id: string | null
    follow_up_date: string
    student_id: string | null
    students: { first_name: string | null; last_name: string | null } | null
  }
  for (const i of ((interventions ?? []) as Intervention[])) {
    if (!i.staff_id) continue
    const studentName = `${i.students?.first_name ?? ''} ${i.students?.last_name ?? ''}`.trim() || 'Student'
    const title = `Follow-up due: ${i.title}`
    const body = `${studentName} - ${i.title}. Originally logged on ${i.follow_up_date}.`
    if (await hasRecentDuplicate(admin, { schoolId: ctx.schoolId, type: 'intervention_followup', title })) continue
    await sendSchoolNotification({
      admin,
      schoolId: ctx.schoolId,
      type: 'intervention_followup',
      title,
      body,
      targetStaffIds: [i.staff_id],
      channel: 'in_app',
      createdBy: ctx.userId,
    })
    stats.intervention_followups += 1
  }

  // 3. ASN provisions due for review in <= 7 days.
  const sevenDaysOut = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const { data: asns } = await adminAny
    .from('asn_provisions')
    .select(
      'id, provision_type, review_date, responsible_staff_id, student_id, is_active, students:student_id(first_name, last_name)'
    )
    .eq('school_id', ctx.schoolId)
    .eq('is_active', true)
    .lte('review_date', sevenDaysOut)
    .gte('review_date', today)
  type Asn = {
    id: string
    provision_type: string
    review_date: string
    responsible_staff_id: string | null
    student_id: string | null
    students: { first_name: string | null; last_name: string | null } | null
  }
  for (const a of ((asns ?? []) as Asn[])) {
    if (!a.responsible_staff_id) continue
    const studentName = `${a.students?.first_name ?? ''} ${a.students?.last_name ?? ''}`.trim() || 'Student'
    const title = `ASN review due for ${studentName}`
    const body = `${a.provision_type} review due on ${a.review_date}.`
    if (await hasRecentDuplicate(admin, { schoolId: ctx.schoolId, type: 'asn_review_due', title })) continue
    await sendSchoolNotification({
      admin,
      schoolId: ctx.schoolId,
      type: 'asn_review_due',
      title,
      body,
      targetStaffIds: [a.responsible_staff_id],
      channel: 'in_app',
      createdBy: ctx.userId,
    })
    stats.asn_reviews += 1
  }

  // 4. Parent evenings tomorrow.
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const { data: evenings } = await adminAny
    .from('parent_evenings')
    .select('id, name, event_date, status, school_id')
    .eq('school_id', ctx.schoolId)
    .eq('event_date', tomorrow)
    .in('status', ['open', 'closed', 'completed'])
  type Evening = { id: string; name: string; event_date: string }
  for (const e of ((evenings ?? []) as Evening[])) {
    // Parents with confirmed bookings.
    const { data: bookings } = await adminAny
      .from('parent_evening_bookings')
      .select('parent_id, slot_time, booking_status')
      .eq('parent_evening_id', e.id)
      .eq('booking_status', 'confirmed')
    type Booking = { parent_id: string | null; slot_time: string }
    const parentIds = Array.from(
      new Set(
        ((bookings ?? []) as Booking[])
          .map((b) => b.parent_id)
          .filter((v): v is string => !!v)
      )
    )
    if (parentIds.length === 0) continue

    const title = `Parents' evening tomorrow`
    const body = `Your appointments for ${e.name} are tomorrow (${e.event_date}).`
    if (await hasRecentDuplicate(admin, { schoolId: ctx.schoolId, type: 'parent_evening_reminder', title })) continue

    await sendSchoolNotification({
      admin,
      schoolId: ctx.schoolId,
      type: 'parent_evening_reminder',
      title,
      body,
      targetParentIds: parentIds,
      channel: 'both',
      createdBy: ctx.userId,
    })
    stats.parent_evening_reminders += 1
  }

  // 5. Choice rounds closing in <= 7 days, students without submission.
  const { data: rounds } = await adminAny
    .from('choice_rounds')
    .select('id, name, closes_at, status, year_group')
    .eq('school_id', ctx.schoolId)
    .eq('status', 'open')
    .not('closes_at', 'is', null)
    .lte('closes_at', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
  type Round = { id: string; name: string; closes_at: string; year_group: string | null }
  for (const r of ((rounds ?? []) as Round[])) {
    // Students at school in the round's year group.
    const { data: linkRows } = await adminAny
      .from('school_student_links')
      .select('student_id, students:student_id(id, school_stage)')
      .eq('school_id', ctx.schoolId)
    type LR = { student_id: string; students: { id: string; school_stage: string | null } | null }
    const eligibleStudents = ((linkRows ?? []) as LR[])
      .filter((l) => !r.year_group || l.students?.school_stage === r.year_group)
      .map((l) => l.student_id)
    if (eligibleStudents.length === 0) continue

    // Who has submitted?
    const { data: choices } = await adminAny
      .from('student_choices')
      .select('student_id, status')
      .eq('round_id', r.id)
      .in('student_id', eligibleStudents)
    type Choice = { student_id: string; status: string }
    const submittedSet = new Set(
      ((choices ?? []) as Choice[])
        .filter((c) => c.status !== 'draft')
        .map((c) => c.student_id)
    )
    const notSubmitted = eligibleStudents.filter((id) => !submittedSet.has(id))
    if (notSubmitted.length === 0) continue

    // Parents of those students.
    const { data: parentLinks } = await adminAny
      .from('parent_student_links')
      .select('parent_id, student_id')
      .in('student_id', notSubmitted)
      .eq('status', 'active')
    type PL = { parent_id: string | null; student_id: string }
    const parentIds = Array.from(
      new Set(((parentLinks ?? []) as PL[]).map((p) => p.parent_id).filter((v): v is string => !!v))
    )
    if (parentIds.length === 0) continue

    const daysLeft = Math.max(
      0,
      Math.ceil((new Date(r.closes_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    )
    const title = `Subject choices close in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`
    const body = `Some students in ${r.year_group?.toUpperCase() ?? 'your year group'} have not yet submitted their subject choices for ${r.name}.`
    if (await hasRecentDuplicate(admin, { schoolId: ctx.schoolId, type: 'choice_deadline', title })) continue

    await sendSchoolNotification({
      admin,
      schoolId: ctx.schoolId,
      type: 'choice_deadline',
      title,
      body,
      targetParentIds: parentIds,
      channel: 'both',
      createdBy: ctx.userId,
    })
    stats.choice_deadlines += 1
  }

  return NextResponse.json({ ok: true, stats })
}
