// Authority-13: alert evaluation engine.
//
// Each evaluator inspects a single condition for every school in a verified
// authority and returns an array of alert "candidates". The runner then:
//   1. Dedups against open (unacknowledged) alerts of the same type/school.
//   2. Skips creation entirely when today falls inside a configured quiet
//      period (alerts that would have fired during a holiday are simply
//      not raised; if the condition is still true after the quiet period
//      ends, the next run picks them up).
//   3. Inserts surviving candidates and -- for `low_data_quality` -- also
//      writes a single school_notifications nudge (subject to a 30-day
//      suppression).
//
// All evaluators run in parallel per authority and against the service-role
// admin client. The engine never reads `auth.uid()`.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import {
  type AlertConfig,
  type AlertSeverity,
  type AlertType,
  type AlertTypeConfig,
  getAlertConfig,
  isQuietPeriod,
} from './alerts'
import { calculateSchoolDataQuality, type StudentWithDemographics } from './data-quality'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminAny = any

const STEM_AREAS = ['Sciences', 'Mathematics', 'Technologies']
const NUDGE_SUPPRESSION_DAYS = 30

export type AlertCandidate = {
  alert_type: AlertType
  school_id: string | null
  severity: AlertSeverity
  title: string
  detail: Record<string, unknown>
}

export type EvaluationResult = {
  authority_id: string
  inserted: number
  skipped_dedup: number
  skipped_quiet_period: boolean
  nudges_sent: number
  errors: string[]
}

type AuthorityCtx = {
  authority_id: string
  authority_name: string
  schools: Array<{ id: string; name: string; created_at: string }>
  config: AlertConfig
}

export async function evaluateAlertsForAuthority(
  admin: SupabaseClient<Database>,
  authorityId: string
): Promise<EvaluationResult> {
  const result: EvaluationResult = {
    authority_id: authorityId,
    inserted: 0,
    skipped_dedup: 0,
    skipped_quiet_period: false,
    nudges_sent: 0,
    errors: [],
  }

  const config = await getAlertConfig(admin, authorityId)

  if (isQuietPeriod(config)) {
    result.skipped_quiet_period = true
    return result
  }

  const { data: la } = await (admin as AdminAny)
    .from('local_authorities')
    .select('id, name')
    .eq('id', authorityId)
    .maybeSingle()
  if (!la) {
    result.errors.push('Authority not found')
    return result
  }

  const { data: schools } = await (admin as AdminAny)
    .from('schools')
    .select('id, name, created_at')
    .eq('local_authority', la.name)
    .eq('visible_to_authority', true)

  const ctx: AuthorityCtx = {
    authority_id: authorityId,
    authority_name: la.name,
    schools: (schools ?? []) as AuthorityCtx['schools'],
    config,
  }

  if (ctx.schools.length === 0) return result

  const evaluators: Array<(admin: SupabaseClient<Database>, ctx: AuthorityCtx) => Promise<AlertCandidate[]>> = [
    evalEngagementDrop,
    evalLowActivation,
    evalCurriculumNarrowing,
    evalStemGenderImbalance,
    evalLowCareerExploration,
    evalLowDataQuality,
    evalNewSchoolJoined,
    // equity_gap_widening intentionally skipped -- requires historical
    // term-on-term snapshots which are not yet captured. Wired as a
    // placeholder so the alert type round-trips through the UI; the
    // evaluator returns [] until snapshots land.
    evalEquityGapWidening,
  ]

  const candidateBatches = await Promise.all(
    evaluators.map(async (fn) => {
      try {
        return await fn(admin, ctx)
      } catch (err) {
        result.errors.push(`${fn.name}: ${err instanceof Error ? err.message : String(err)}`)
        return []
      }
    })
  )

  const allCandidates: AlertCandidate[] = candidateBatches.flat()

  for (const candidate of allCandidates) {
    const isDup = await hasOpenAlert(admin, authorityId, candidate.alert_type, candidate.school_id)
    if (isDup) {
      result.skipped_dedup += 1
      continue
    }
    const inserted = await insertAlert(admin, authorityId, candidate)
    if (!inserted) {
      result.errors.push(`Failed to insert ${candidate.alert_type} for ${candidate.school_id ?? 'authority'}`)
      continue
    }
    result.inserted += 1
    if (candidate.alert_type === 'low_data_quality' && candidate.school_id) {
      const sent = await sendDataQualityNudge(admin, candidate.school_id)
      if (sent) result.nudges_sent += 1
    }
  }

  return result
}

export async function evaluateAlertsForAllVerifiedAuthorities(
  admin: SupabaseClient<Database>
): Promise<EvaluationResult[]> {
  const { data: authorities } = await (admin as AdminAny)
    .from('local_authorities')
    .select('id')
    .eq('verified', true)
  const list = (authorities ?? []) as Array<{ id: string }>
  return Promise.all(list.map((a) => evaluateAlertsForAuthority(admin, a.id)))
}

// ---------------------------------------------------------------------------
// Dedup + insert
// ---------------------------------------------------------------------------

async function hasOpenAlert(
  admin: SupabaseClient<Database>,
  authorityId: string,
  type: AlertType,
  schoolId: string | null
): Promise<boolean> {
  let query = (admin as AdminAny)
    .from('authority_alerts')
    .select('id')
    .eq('authority_id', authorityId)
    .eq('alert_type', type)
    .eq('acknowledged', false)
    .limit(1)
  if (schoolId === null) {
    query = query.is('school_id', null)
  } else {
    query = query.eq('school_id', schoolId)
  }
  const { data } = await query
  return Array.isArray(data) && data.length > 0
}

async function insertAlert(
  admin: SupabaseClient<Database>,
  authorityId: string,
  candidate: AlertCandidate
): Promise<boolean> {
  const { error } = await (admin as AdminAny)
    .from('authority_alerts')
    .insert({
      authority_id: authorityId,
      alert_type: candidate.alert_type,
      school_id: candidate.school_id,
      severity: candidate.severity,
      title: candidate.title,
      detail: candidate.detail,
    })
  return !error
}

// ---------------------------------------------------------------------------
// Per-alert-type evaluators
// ---------------------------------------------------------------------------

function cfg(ctx: AuthorityCtx, type: AlertType): AlertTypeConfig | null {
  const c = ctx.config.types[type]
  if (!c?.enabled) return null
  return c
}

async function evalEngagementDrop(admin: SupabaseClient<Database>, ctx: AuthorityCtx): Promise<AlertCandidate[]> {
  const c = cfg(ctx, 'engagement_drop')
  if (!c) return []
  const periodDays = c.period_days ?? 30
  const thresholdPct = c.threshold_percentage ?? 50
  const since = new Date(Date.now() - periodDays * 86400 * 1000).toISOString()

  const candidates: AlertCandidate[] = []
  for (const school of ctx.schools) {
    const [{ count: total }, activeCount] = await Promise.all([
      countStudentsForSchool(admin, school.id),
      countActiveStudentsSince(admin, school.id, since),
    ])
    if (!total || total === 0) continue
    const activePct = Math.round((activeCount / total) * 100)
    if (activePct < thresholdPct) {
      candidates.push({
        alert_type: 'engagement_drop',
        school_id: school.id,
        severity: c.severity,
        title: `${school.name}: only ${activePct}% of students active in last ${periodDays} days`,
        detail: {
          school_name: school.name,
          active_students: activeCount,
          total_students: total,
          active_pct: activePct,
          threshold_pct: thresholdPct,
          period_days: periodDays,
        },
      })
    }
  }
  return candidates
}

async function evalLowActivation(admin: SupabaseClient<Database>, ctx: AuthorityCtx): Promise<AlertCandidate[]> {
  const c = cfg(ctx, 'low_activation')
  if (!c) return []
  const periodWeeks = c.period_weeks ?? 4
  const thresholdPct = c.threshold_percentage ?? 60
  const cutoff = new Date(Date.now() - periodWeeks * 7 * 86400 * 1000).toISOString()

  const candidates: AlertCandidate[] = []
  for (const school of ctx.schools) {
    const { data } = await (admin as AdminAny)
      .from('students')
      .select('id, last_active_at')
      .eq('school_id', school.id)
    const rows = (data ?? []) as Array<{ id: string; last_active_at: string | null }>
    if (rows.length === 0) continue
    const activated = rows.filter((r) => r.last_active_at && r.last_active_at >= cutoff).length
    const activationPct = Math.round((activated / rows.length) * 100)
    if (activationPct < thresholdPct) {
      candidates.push({
        alert_type: 'low_activation',
        school_id: school.id,
        severity: c.severity,
        title: `${school.name}: ${activationPct}% activated in past ${periodWeeks} weeks`,
        detail: {
          school_name: school.name,
          activated,
          total_registered: rows.length,
          activation_pct: activationPct,
          threshold_pct: thresholdPct,
          period_weeks: periodWeeks,
        },
      })
    }
  }
  return candidates
}

async function evalCurriculumNarrowing(
  admin: SupabaseClient<Database>,
  ctx: AuthorityCtx
): Promise<AlertCandidate[]> {
  const c = cfg(ctx, 'curriculum_narrowing')
  if (!c) return []
  const threshold = c.threshold_subjects ?? 20

  const candidates: AlertCandidate[] = []
  const schoolIds = ctx.schools.map((s) => s.id)
  if (schoolIds.length === 0) return []

  const { data } = await (admin as AdminAny)
    .from('mv_authority_subject_choices')
    .select('school_id, subject_id')
    .in('school_id', schoolIds)
  const rows = (data ?? []) as Array<{ school_id: string; subject_id: string }>

  const distinctBySchool = new Map<string, Set<string>>()
  for (const r of rows) {
    if (!r.school_id || !r.subject_id) continue
    if (!distinctBySchool.has(r.school_id)) distinctBySchool.set(r.school_id, new Set())
    distinctBySchool.get(r.school_id)!.add(r.subject_id)
  }

  for (const school of ctx.schools) {
    const distinct = distinctBySchool.get(school.id)?.size ?? 0
    // Skip schools with zero subject choices entirely -- usually a data
    // gap rather than a curriculum narrowing signal.
    if (distinct === 0) continue
    if (distinct < threshold) {
      candidates.push({
        alert_type: 'curriculum_narrowing',
        school_id: school.id,
        severity: c.severity,
        title: `${school.name}: ${distinct} distinct subjects (threshold ${threshold})`,
        detail: {
          school_name: school.name,
          distinct_subjects: distinct,
          threshold,
        },
      })
    }
  }
  return candidates
}

async function evalStemGenderImbalance(
  admin: SupabaseClient<Database>,
  ctx: AuthorityCtx
): Promise<AlertCandidate[]> {
  const c = cfg(ctx, 'stem_gender_imbalance')
  if (!c) return []
  const thresholdPct = c.threshold_percentage ?? 30

  const schoolIds = ctx.schools.map((s) => s.id)
  if (schoolIds.length === 0) return []

  const { data } = await (admin as AdminAny)
    .from('mv_authority_subject_choices')
    .select('school_id, subject_id, subject_name, subject_category, gender, student_count')
    .in('school_id', schoolIds)
    .in('subject_category', STEM_AREAS)
  const rows = (data ?? []) as Array<{
    school_id: string
    subject_id: string
    subject_name: string | null
    subject_category: string | null
    gender: string | null
    student_count: number | null
  }>

  type Bucket = { male: number; female: number; total: number; subject_name: string }
  const buckets = new Map<string, Bucket>()
  for (const r of rows) {
    if (!r.school_id || !r.subject_id || !r.subject_name) continue
    const key = `${r.school_id}|${r.subject_id}`
    if (!buckets.has(key)) buckets.set(key, { male: 0, female: 0, total: 0, subject_name: r.subject_name })
    const b = buckets.get(key)!
    const n = r.student_count ?? 0
    const g = (r.gender ?? '').toLowerCase()
    if (g === 'male' || g === 'm') b.male += n
    else if (g === 'female' || g === 'f') b.female += n
    b.total += n
  }

  const schoolNameById = new Map(ctx.schools.map((s) => [s.id, s.name] as const))

  const candidates: AlertCandidate[] = []
  for (const [key, b] of buckets) {
    const knownGender = b.male + b.female
    // Skip subjects where almost no gender data is recorded; a 0% would
    // otherwise fire constantly on schools that haven't imported demographics.
    if (knownGender < 5) continue
    const malePct = Math.round((b.male / knownGender) * 100)
    const femalePct = 100 - malePct
    if (malePct < thresholdPct || femalePct < thresholdPct) {
      const [schoolId, subjectId] = key.split('|')
      const schoolName = schoolNameById.get(schoolId) ?? 'School'
      const minorityLabel = malePct < femalePct ? `${malePct}% male` : `${femalePct}% female`
      candidates.push({
        alert_type: 'stem_gender_imbalance',
        school_id: schoolId,
        severity: c.severity,
        title: `${schoolName} - ${b.subject_name}: ${minorityLabel}`,
        detail: {
          school_name: schoolName,
          subject_id: subjectId,
          subject_name: b.subject_name,
          male_pct: malePct,
          female_pct: femalePct,
          known_gender_count: knownGender,
          threshold_pct: thresholdPct,
        },
      })
    }
  }
  return candidates
}

async function evalLowCareerExploration(
  admin: SupabaseClient<Database>,
  ctx: AuthorityCtx
): Promise<AlertCandidate[]> {
  const c = cfg(ctx, 'low_career_exploration')
  if (!c) return []
  const thresholdSectors = c.threshold_sectors ?? 3

  const schoolIds = ctx.schools.map((s) => s.id)
  if (schoolIds.length === 0) return []

  // Pull all career_explore events for the past 90 days for these schools
  // and bucket sector exploration per student. Time window keeps the
  // per-student aggregation aligned with current behaviour rather than
  // lifetime totals.
  const since = new Date(Date.now() - 90 * 86400 * 1000).toISOString()
  const { data } = await (admin as AdminAny)
    .from('platform_engagement_log')
    .select('school_id, student_id, event_category, event_detail')
    .in('school_id', schoolIds)
    .eq('event_type', 'career_explore')
    .eq('event_category', 'career_sector')
    .gte('created_at', since)

  const rows = (data ?? []) as Array<{
    school_id: string | null
    student_id: string | null
    event_detail: string | null
  }>

  // school -> Map(student -> Set(sector_id))
  const perSchool = new Map<string, Map<string, Set<string>>>()
  for (const r of rows) {
    if (!r.school_id || !r.student_id || !r.event_detail) continue
    if (!perSchool.has(r.school_id)) perSchool.set(r.school_id, new Map())
    const inner = perSchool.get(r.school_id)!
    if (!inner.has(r.student_id)) inner.set(r.student_id, new Set())
    inner.get(r.student_id)!.add(r.event_detail)
  }

  const candidates: AlertCandidate[] = []
  for (const school of ctx.schools) {
    const inner = perSchool.get(school.id)
    if (!inner || inner.size === 0) continue
    let sumSectors = 0
    for (const set of inner.values()) sumSectors += set.size
    const avg = sumSectors / inner.size
    if (avg < thresholdSectors) {
      candidates.push({
        alert_type: 'low_career_exploration',
        school_id: school.id,
        severity: c.severity,
        title: `${school.name}: avg ${avg.toFixed(1)} sectors explored per active student`,
        detail: {
          school_name: school.name,
          avg_sectors_per_student: Math.round(avg * 10) / 10,
          active_students: inner.size,
          threshold_sectors: thresholdSectors,
        },
      })
    }
  }
  return candidates
}

async function evalLowDataQuality(
  admin: SupabaseClient<Database>,
  ctx: AuthorityCtx
): Promise<AlertCandidate[]> {
  const c = cfg(ctx, 'low_data_quality')
  if (!c) return []
  const thresholdScore = c.threshold_score ?? 3

  const candidates: AlertCandidate[] = []
  for (const school of ctx.schools) {
    const { data } = await (admin as AdminAny)
      .from('students')
      .select('id, gender, care_experienced, has_asn, receives_free_school_meals, eal, is_young_carer, ethnicity, student_type, demographic_source')
      .eq('school_id', school.id)
    const rows = (data ?? []) as StudentWithDemographics[]
    if (rows.length === 0) continue
    const dq = calculateSchoolDataQuality(rows)
    if (dq.overall_score < thresholdScore) {
      candidates.push({
        alert_type: 'low_data_quality',
        school_id: school.id,
        severity: c.severity,
        title: `${school.name}: data quality ${dq.overall_score}/5`,
        detail: {
          school_name: school.name,
          overall_score: dq.overall_score,
          threshold_score: thresholdScore,
          field_pct: Object.fromEntries(Object.entries(dq.fields).map(([k, v]) => [k, v.pct])),
        },
      })
    }
  }
  return candidates
}

async function evalNewSchoolJoined(
  _admin: SupabaseClient<Database>,
  ctx: AuthorityCtx
): Promise<AlertCandidate[]> {
  const c = cfg(ctx, 'new_school_joined')
  if (!c) return []
  // "New" = registered in the past 7 days. Dedup on (alert_type, school_id)
  // ensures a school only triggers once until acknowledged.
  const cutoff = Date.now() - 7 * 86400 * 1000
  return ctx.schools
    .filter((s) => s.created_at && new Date(s.created_at).getTime() >= cutoff)
    .map((s) => ({
      alert_type: 'new_school_joined' as AlertType,
      school_id: s.id,
      severity: c.severity,
      title: `New school joined: ${s.name}`,
      detail: { school_name: s.name, joined_at: s.created_at },
    }))
}

async function evalEquityGapWidening(
  _admin: SupabaseClient<Database>,
  _ctx: AuthorityCtx
): Promise<AlertCandidate[]> {
  // Requires term-on-term historical snapshots which are not yet captured.
  // Returns no candidates until that pipeline lands; the alert type is
  // still configurable in the UI so when snapshots arrive the evaluator
  // can be filled in without an additional schema change.
  return []
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function countStudentsForSchool(
  admin: SupabaseClient<Database>,
  schoolId: string
): Promise<{ count: number }> {
  const { count } = await (admin as AdminAny)
    .from('students')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', schoolId)
  return { count: count ?? 0 }
}

async function countActiveStudentsSince(
  admin: SupabaseClient<Database>,
  schoolId: string,
  sinceIso: string
): Promise<number> {
  const { count } = await (admin as AdminAny)
    .from('students')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .gte('last_active_at', sinceIso)
  return count ?? 0
}

// Data quality nudge sender. Returns true if an in-app notification was
// inserted (suppressed for NUDGE_SUPPRESSION_DAYS after the most recent
// nudge for this school).
async function sendDataQualityNudge(
  admin: SupabaseClient<Database>,
  schoolId: string
): Promise<boolean> {
  const since = new Date(Date.now() - NUDGE_SUPPRESSION_DAYS * 86400 * 1000).toISOString()
  const { data: recent } = await (admin as AdminAny)
    .from('school_notifications')
    .select('id')
    .eq('school_id', schoolId)
    .eq('notification_type', 'data_quality_nudge')
    .gte('created_at', since)
    .limit(1)
  if (Array.isArray(recent) && recent.length > 0) return false

  // Broadcast to all staff at the school (target_role left null). School
  // admins and head teachers see the nudge in their bell; the body asks
  // the admin to act on the SEEMIS import.
  const { error } = await (admin as AdminAny).from('school_notifications').insert({
    school_id: schoolId,
    notification_type: 'data_quality_nudge',
    title: 'Improve your data quality for LA reporting',
    body: "Your school's demographic data is incomplete. Import your latest SEEMIS export to unlock equity analytics for your local authority. Visit /school/import/demographics to get started.",
    channel: 'in_app',
    read_by: [],
  })
  return !error
}
