// Authority-13: alert configuration types and helpers.
//
// The on-disk shape lives in `local_authorities.alert_config` (JSONB,
// initialised to '{}'). Anything not present in the row is inherited
// from `DEFAULT_ALERT_CONFIG` at read time, so adding a new alert type
// in code does not require a backfill migration.
//
// Validation is conservative: known keys with the right shape pass,
// everything else is dropped silently. The settings page is the only
// supported writer; we don't want a malformed POST to brick the whole
// alert engine.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export type AlertSeverity = 'info' | 'warning' | 'critical'

export type AlertType =
  | 'engagement_drop'
  | 'equity_gap_widening'
  | 'curriculum_narrowing'
  | 'low_activation'
  | 'new_school_joined'
  | 'stem_gender_imbalance'
  | 'low_career_exploration'
  | 'report_ready'
  | 'low_data_quality'

export const ALERT_TYPES: AlertType[] = [
  'engagement_drop',
  'equity_gap_widening',
  'curriculum_narrowing',
  'low_activation',
  'new_school_joined',
  'stem_gender_imbalance',
  'low_career_exploration',
  'report_ready',
  'low_data_quality',
]

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  engagement_drop: 'Engagement drop',
  equity_gap_widening: 'Equity gap widening',
  curriculum_narrowing: 'Curriculum narrowing',
  low_activation: 'Low activation',
  new_school_joined: 'New school joined',
  stem_gender_imbalance: 'STEM gender imbalance',
  low_career_exploration: 'Low career exploration',
  report_ready: 'Report ready',
  low_data_quality: 'Low data quality',
}

export const ALERT_TYPE_DESCRIPTIONS: Record<AlertType, string> = {
  engagement_drop: 'Active student rate falls below threshold for a school.',
  equity_gap_widening: 'SIMD Q1-Q5 gap on a key metric increases term-on-term.',
  curriculum_narrowing: 'Total subjects offered at a school drops below threshold.',
  low_activation: 'Registered students have not completed onboarding.',
  new_school_joined: 'A new school in your authority has registered on Pathfinder.',
  stem_gender_imbalance: 'Gender ratio in a STEM subject is below threshold.',
  low_career_exploration: 'Students are exploring fewer career sectors than expected.',
  report_ready: 'A scheduled report is ready for download.',
  low_data_quality: 'A school has missing demographic data limiting equity analytics.',
}

// Severity keys used in this module are exhaustive; keep in sync with the
// CHECK constraint on authority_alerts.severity.

export type DigestFrequency = 'daily' | 'weekly' | 'none'

// Per-alert-type configuration. Some types take additional thresholds
// (engagement_drop has a percentage and a period, equity_gap_widening has
// a percentage-points threshold). Keep these on the same object so the
// settings page can render every option with one component.
export type AlertTypeConfig = {
  enabled: boolean
  severity: AlertSeverity
  notify_email: boolean
  notify_in_app: boolean
  // Type-specific thresholds, all optional so the same shape covers every type.
  threshold_percentage?: number
  threshold_percentage_points?: number
  threshold_subjects?: number
  threshold_sectors?: number
  threshold_score?: number
  period_days?: number
  period_weeks?: number
}

export type QuietPeriod = {
  start: string // YYYY-MM-DD
  end: string // YYYY-MM-DD
  label?: string
}

export type AlertConfig = {
  // One entry per alert type.
  types: Record<AlertType, AlertTypeConfig>
  // Suppress alerts during these date ranges (e.g. school holidays).
  quiet_periods: QuietPeriod[]
  // Email digest cadence -- per-alert notify_email controls whether each
  // alert type contributes to the digest, and digest_frequency controls
  // how often the digest is sent.
  digest_frequency: DigestFrequency
}

export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  types: {
    engagement_drop: {
      enabled: true,
      severity: 'warning',
      notify_email: true,
      notify_in_app: true,
      threshold_percentage: 50,
      period_days: 30,
    },
    equity_gap_widening: {
      enabled: true,
      severity: 'warning',
      notify_email: true,
      notify_in_app: true,
      threshold_percentage_points: 10,
    },
    curriculum_narrowing: {
      enabled: true,
      severity: 'warning',
      notify_email: true,
      notify_in_app: true,
      threshold_subjects: 20,
    },
    low_activation: {
      enabled: true,
      severity: 'warning',
      notify_email: true,
      notify_in_app: true,
      threshold_percentage: 60,
      period_weeks: 4,
    },
    new_school_joined: {
      enabled: true,
      severity: 'info',
      notify_email: true,
      notify_in_app: true,
    },
    stem_gender_imbalance: {
      enabled: true,
      severity: 'warning',
      notify_email: false,
      notify_in_app: true,
      threshold_percentage: 30,
    },
    low_career_exploration: {
      enabled: true,
      severity: 'info',
      notify_email: false,
      notify_in_app: true,
      threshold_sectors: 3,
    },
    report_ready: {
      enabled: true,
      severity: 'info',
      notify_email: true,
      notify_in_app: true,
    },
    low_data_quality: {
      enabled: true,
      severity: 'warning',
      notify_email: true,
      notify_in_app: true,
      threshold_score: 3,
    },
  },
  quiet_periods: [],
  digest_frequency: 'weekly',
}

const SEVERITIES: AlertSeverity[] = ['info', 'warning', 'critical']
const FREQUENCIES: DigestFrequency[] = ['daily', 'weekly', 'none']
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function mergeTypeConfig(defaults: AlertTypeConfig, override: unknown): AlertTypeConfig {
  if (!override || typeof override !== 'object') return defaults
  const o = override as Record<string, unknown>
  const out: AlertTypeConfig = { ...defaults }
  if (typeof o.enabled === 'boolean') out.enabled = o.enabled
  if (typeof o.severity === 'string' && SEVERITIES.includes(o.severity as AlertSeverity)) {
    out.severity = o.severity as AlertSeverity
  }
  if (typeof o.notify_email === 'boolean') out.notify_email = o.notify_email
  if (typeof o.notify_in_app === 'boolean') out.notify_in_app = o.notify_in_app
  for (const key of [
    'threshold_percentage',
    'threshold_percentage_points',
    'threshold_subjects',
    'threshold_sectors',
    'threshold_score',
    'period_days',
    'period_weeks',
  ] as const) {
    if (typeof o[key] === 'number' && Number.isFinite(o[key]) && (o[key] as number) >= 0) {
      out[key] = o[key] as number
    }
  }
  return out
}

function mergeQuietPeriods(input: unknown): QuietPeriod[] {
  if (!Array.isArray(input)) return []
  const out: QuietPeriod[] = []
  for (const entry of input) {
    if (!entry || typeof entry !== 'object') continue
    const e = entry as Record<string, unknown>
    if (typeof e.start !== 'string' || typeof e.end !== 'string') continue
    if (!ISO_DATE_RE.test(e.start) || !ISO_DATE_RE.test(e.end)) continue
    if (e.start > e.end) continue
    const period: QuietPeriod = { start: e.start, end: e.end }
    if (typeof e.label === 'string' && e.label.length > 0 && e.label.length <= 60) {
      period.label = e.label
    }
    out.push(period)
  }
  return out
}

export function mergeAlertConfig(stored: unknown): AlertConfig {
  const base = DEFAULT_ALERT_CONFIG
  if (!stored || typeof stored !== 'object') return base
  const s = stored as Record<string, unknown>
  const types = { ...base.types }
  const overrideTypes = (s.types && typeof s.types === 'object') ? (s.types as Record<string, unknown>) : {}
  for (const t of ALERT_TYPES) {
    types[t] = mergeTypeConfig(base.types[t], overrideTypes[t])
  }
  let digestFrequency = base.digest_frequency
  if (typeof s.digest_frequency === 'string' && FREQUENCIES.includes(s.digest_frequency as DigestFrequency)) {
    digestFrequency = s.digest_frequency as DigestFrequency
  }
  return {
    types,
    quiet_periods: mergeQuietPeriods(s.quiet_periods),
    digest_frequency: digestFrequency,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminAny = any

export async function getAlertConfig(
  admin: SupabaseClient<Database>,
  authorityId: string
): Promise<AlertConfig> {
  const { data } = await (admin as AdminAny)
    .from('local_authorities')
    .select('alert_config')
    .eq('id', authorityId)
    .maybeSingle()
  return mergeAlertConfig(data?.alert_config)
}

export async function updateAlertConfig(
  admin: SupabaseClient<Database>,
  authorityId: string,
  partial: Partial<AlertConfig>
): Promise<{ ok: boolean; config: AlertConfig; error?: string }> {
  const current = await getAlertConfig(admin, authorityId)
  const merged: AlertConfig = {
    types: { ...current.types },
    quiet_periods: current.quiet_periods,
    digest_frequency: current.digest_frequency,
  }
  if (partial.types) {
    for (const t of ALERT_TYPES) {
      const incoming = partial.types[t]
      if (incoming) merged.types[t] = mergeTypeConfig(current.types[t], incoming)
    }
  }
  if (partial.quiet_periods) merged.quiet_periods = mergeQuietPeriods(partial.quiet_periods)
  if (partial.digest_frequency && FREQUENCIES.includes(partial.digest_frequency)) {
    merged.digest_frequency = partial.digest_frequency
  }

  const { error } = await (admin as AdminAny)
    .from('local_authorities')
    .update({ alert_config: merged })
    .eq('id', authorityId)

  if (error) return { ok: false, config: current, error: error.message }
  return { ok: true, config: merged }
}

// Quiet-period check used by the engine to skip alert creation. Date is
// compared as YYYY-MM-DD against the inclusive [start, end] range so an
// alert on the last day of a holiday is still suppressed.
export function isQuietPeriod(config: AlertConfig, today = new Date()): boolean {
  const today_str = today.toISOString().slice(0, 10)
  return config.quiet_periods.some((p) => today_str >= p.start && today_str <= p.end)
}

export const ALERT_SEVERITY_COLOURS: Record<AlertSeverity, { bg: string; fg: string; border: string }> = {
  info: { bg: '#EFF6FF', fg: '#1D4ED8', border: '#BFDBFE' },
  warning: { bg: '#FEF3C7', fg: '#92400E', border: '#FCD34D' },
  critical: { bg: '#FEE2E2', fg: '#991B1B', border: '#FCA5A5' },
}
