// Authority-13: alert digest email generator + sender.
//
// Produces a single HTML+text email summarising unacknowledged alerts
// for an authority, grouped by severity (critical -> warning -> info).
// The send target is every authority staff member who has the
// `notify_email` flag enabled for at least one alert type in the
// authority's alert_config.
//
// The digest deliberately aggregates only -- it never includes
// individual student data; alerts are already cohort-level.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import {
  ALERT_TYPE_LABELS,
  type AlertSeverity,
  type AlertType,
  type DigestFrequency,
  getAlertConfig,
} from './alerts'
import { escapeHtml } from '@/lib/school/email-templates'
import { RESEND_FROM } from './constants'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminAny = any

const SEVERITY_ORDER: AlertSeverity[] = ['critical', 'warning', 'info']
const SEVERITY_HEADER_COLOUR: Record<AlertSeverity, string> = {
  critical: '#991B1B',
  warning: '#92400E',
  info: '#1D4ED8',
}

export type DigestAlertRow = {
  id: string
  alert_type: AlertType
  severity: AlertSeverity
  title: string
  school_name: string | null
  created_at: string
}

export type DigestPayload = {
  authority_id: string
  authority_name: string
  period: DigestFrequency
  total_unacknowledged: number
  rows_by_severity: Record<AlertSeverity, DigestAlertRow[]>
  subject: string
  html: string
  text: string
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://pathfinderscot.co.uk').replace(/\/$/, '')

export async function generateDigestPayload(
  admin: SupabaseClient<Database>,
  authorityId: string,
  period: DigestFrequency
): Promise<DigestPayload | null> {
  const { data: la } = await (admin as AdminAny)
    .from('local_authorities')
    .select('id, name')
    .eq('id', authorityId)
    .maybeSingle()
  if (!la) return null

  // Cutoff: alerts created since the last digest window. For a daily digest
  // that's 24h; for a weekly digest, 7d.
  const windowDays = period === 'daily' ? 1 : period === 'weekly' ? 7 : 1
  const since = new Date(Date.now() - windowDays * 86400 * 1000).toISOString()

  const { data: alerts } = await (admin as AdminAny)
    .from('authority_alerts')
    .select('id, alert_type, severity, title, school_id, created_at')
    .eq('authority_id', authorityId)
    .eq('acknowledged', false)
    .gte('created_at', since)
    .order('severity', { ascending: false })
    .order('created_at', { ascending: false })
  const rows = (alerts ?? []) as Array<{
    id: string
    alert_type: AlertType
    severity: AlertSeverity
    title: string
    school_id: string | null
    created_at: string
  }>

  const schoolIds = Array.from(new Set(rows.map((r) => r.school_id).filter((s): s is string => !!s)))
  const schoolNameById: Record<string, string> = {}
  if (schoolIds.length > 0) {
    const { data: schools } = await (admin as AdminAny)
      .from('schools')
      .select('id, name')
      .in('id', schoolIds)
    for (const s of ((schools ?? []) as Array<{ id: string; name: string }>)) {
      schoolNameById[s.id] = s.name
    }
  }

  const grouped: Record<AlertSeverity, DigestAlertRow[]> = { critical: [], warning: [], info: [] }
  for (const r of rows) {
    grouped[r.severity].push({
      id: r.id,
      alert_type: r.alert_type,
      severity: r.severity,
      title: r.title,
      school_name: r.school_id ? schoolNameById[r.school_id] ?? null : null,
      created_at: r.created_at,
    })
  }

  const total = rows.length
  const subject = total === 0
    ? `${la.name} alert digest: no new alerts`
    : `${la.name} alert digest: ${total} new alert${total === 1 ? '' : 's'}`
  const html = renderDigestHtml(la.name, grouped, total, period)
  const text = renderDigestText(la.name, grouped, total, period)

  return {
    authority_id: la.id,
    authority_name: la.name,
    period,
    total_unacknowledged: total,
    rows_by_severity: grouped,
    subject,
    html,
    text,
  }
}

function renderDigestHtml(
  authorityName: string,
  grouped: Record<AlertSeverity, DigestAlertRow[]>,
  total: number,
  period: DigestFrequency
): string {
  const safeName = escapeHtml(authorityName)
  const periodLabel = period === 'daily' ? 'day' : period === 'weekly' ? 'week' : 'period'
  const sections = SEVERITY_ORDER.flatMap((sev) => {
    const list = grouped[sev]
    if (list.length === 0) return []
    const colour = SEVERITY_HEADER_COLOUR[sev]
    const rowsHtml = list
      .map((r) => {
        const school = r.school_name ? `<span style="color:#6b7280;"> &middot; ${escapeHtml(r.school_name)}</span>` : ''
        const typeLabel = ALERT_TYPE_LABELS[r.alert_type] ?? r.alert_type
        return `<li style="margin:6px 0;font-size:14px;line-height:1.4;">
          <strong>${escapeHtml(r.title)}</strong>${school}
          <div style="font-size:12px;color:#6b7280;">${escapeHtml(typeLabel)} &middot; ${escapeHtml(new Date(r.created_at).toLocaleString('en-GB'))}</div>
        </li>`
      })
      .join('')
    return [
      `<h3 style="color:${colour};margin:18px 0 6px 0;font-size:15px;text-transform:uppercase;letter-spacing:0.04em;">${sev} (${list.length})</h3>`,
      `<ul style="margin:0;padding-left:20px;">${rowsHtml}</ul>`,
    ]
  }).join('')

  const empty = total === 0
    ? `<p style="color:#6b7280;font-size:14px;">No new alerts in the past ${periodLabel}. Have a good ${periodLabel}.</p>`
    : ''
  const cta = total > 0
    ? `<div style="margin:20px 0;"><a href="${SITE_URL}/authority/alerts" style="display:inline-block;padding:10px 18px;background:#1B3A5C;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">Open alert centre</a></div>`
    : ''

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>${safeName} alerts</title></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1a1a;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f4f5f7;"><tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="background:#1B3A5C;padding:20px 24px;color:#ffffff;">
        <div style="font-size:18px;font-weight:700;">${safeName} alert digest</div>
        <div style="font-size:13px;opacity:0.85;">${total} new alert${total === 1 ? '' : 's'} in the past ${periodLabel}</div>
      </td></tr>
      <tr><td style="padding:20px 24px;line-height:1.5;font-size:15px;">
        ${empty}
        ${sections}
        ${cta}
      </td></tr>
      <tr><td style="padding:16px 24px;background:#f4f5f7;font-size:12px;color:#555555;">
        Manage alert preferences at <a href="${SITE_URL}/authority/alerts/settings" style="color:#1B3A5C;">${SITE_URL}/authority/alerts/settings</a>.
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`
}

function renderDigestText(
  authorityName: string,
  grouped: Record<AlertSeverity, DigestAlertRow[]>,
  total: number,
  period: DigestFrequency
): string {
  const periodLabel = period === 'daily' ? 'day' : period === 'weekly' ? 'week' : 'period'
  const lines: string[] = [
    `${authorityName} alert digest`,
    `${total} new alert${total === 1 ? '' : 's'} in the past ${periodLabel}`,
    '',
  ]
  if (total === 0) {
    lines.push(`No new alerts. Have a good ${periodLabel}.`)
  } else {
    for (const sev of SEVERITY_ORDER) {
      const list = grouped[sev]
      if (list.length === 0) continue
      lines.push(`${sev.toUpperCase()} (${list.length})`)
      for (const r of list) {
        const school = r.school_name ? ` -- ${r.school_name}` : ''
        lines.push(`  - ${r.title}${school}`)
      }
      lines.push('')
    }
    lines.push(`Open the alert centre: ${SITE_URL}/authority/alerts`)
  }
  lines.push('', `Manage preferences: ${SITE_URL}/authority/alerts/settings`)
  return lines.join('\n')
}

export type DigestSendResult = {
  authority_id: string
  authority_name: string
  recipients: number
  sent: number
  failed: number
  skipped_reason?: 'no_recipients' | 'frequency_none' | 'no_unacknowledged'
}

// Send a digest for a single authority. Returns counts; never throws on
// individual email failure.
export async function sendDigestForAuthority(
  admin: SupabaseClient<Database>,
  authorityId: string,
  period: DigestFrequency
): Promise<DigestSendResult> {
  const baseResult: DigestSendResult = {
    authority_id: authorityId,
    authority_name: '',
    recipients: 0,
    sent: 0,
    failed: 0,
  }

  const config = await getAlertConfig(admin, authorityId)
  if (config.digest_frequency === 'none' || config.digest_frequency !== period) {
    return { ...baseResult, skipped_reason: 'frequency_none' }
  }

  const payload = await generateDigestPayload(admin, authorityId, period)
  if (!payload) return baseResult
  baseResult.authority_name = payload.authority_name

  if (payload.total_unacknowledged === 0) {
    return { ...baseResult, skipped_reason: 'no_unacknowledged' }
  }

  // Recipients: all authority staff where at least one alert type has
  // notify_email enabled. Today this is binary -- per-staff opt-out is a
  // future enhancement.
  const anyEmailEnabled = (Object.values(config.types) as Array<{ notify_email: boolean; enabled: boolean }>).some(
    (t) => t.enabled && t.notify_email
  )
  if (!anyEmailEnabled) return { ...baseResult, skipped_reason: 'no_recipients' }

  const { data: staff } = await (admin as AdminAny)
    .from('authority_staff')
    .select('email')
    .eq('authority_id', authorityId)
  const recipients = Array.from(
    new Set(((staff ?? []) as Array<{ email: string | null }>).map((s) => (s.email ?? '').toLowerCase()).filter(Boolean))
  )
  baseResult.recipients = recipients.length
  if (recipients.length === 0) return { ...baseResult, skipped_reason: 'no_recipients' }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[authority/alerts/digest] RESEND_API_KEY not configured; skipping email send')
    return baseResult
  }

  let sent = 0
  let failed = 0
  for (const to of recipients) {
    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          from: RESEND_FROM,
          to: [to],
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        }),
      })
      if (resp.ok) sent += 1
      else failed += 1
    } catch {
      failed += 1
    }
  }

  // Log the dispatch in the authority audit trail.
  await (admin as AdminAny).from('authority_audit_log').insert({
    authority_id: authorityId,
    action: 'alert_digest_sent',
    resource: 'authority_alerts',
    filters_applied: { period, total: payload.total_unacknowledged, recipients: recipients.length, sent, failed },
  })

  return { ...baseResult, sent, failed }
}

export async function sendDigestsForAllAuthorities(
  admin: SupabaseClient<Database>,
  period: DigestFrequency
): Promise<DigestSendResult[]> {
  const { data: authorities } = await (admin as AdminAny)
    .from('local_authorities')
    .select('id')
    .eq('verified', true)
  const list = (authorities ?? []) as Array<{ id: string }>
  return Promise.all(list.map((a) => sendDigestForAuthority(admin, a.id, period)))
}
