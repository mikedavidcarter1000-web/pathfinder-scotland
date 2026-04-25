'use client'

import { useState } from 'react'
import {
  ALERT_TYPES,
  ALERT_TYPE_LABELS,
  ALERT_TYPE_DESCRIPTIONS,
  type AlertConfig,
  type AlertSeverity,
  type AlertType,
  type AlertTypeConfig,
  type DigestFrequency,
  type QuietPeriod,
} from '@/lib/authority/alerts'

const SEVERITIES: AlertSeverity[] = ['info', 'warning', 'critical']
const FREQUENCIES: Array<{ value: DigestFrequency; label: string }> = [
  { value: 'daily', label: 'Daily (weekdays, 07:00 UTC)' },
  { value: 'weekly', label: 'Weekly (Mondays, 07:00 UTC)' },
  { value: 'none', label: 'None (in-app only)' },
]

// Per-type threshold field labels. Drives which inputs render under each
// alert card; an alert type with no entry here gets no threshold input.
const THRESHOLD_FIELDS: Record<AlertType, Array<{ key: keyof AlertTypeConfig; label: string; suffix?: string }>> = {
  engagement_drop: [
    { key: 'threshold_percentage', label: 'Threshold', suffix: '%' },
    { key: 'period_days', label: 'Period', suffix: 'days' },
  ],
  equity_gap_widening: [
    { key: 'threshold_percentage_points', label: 'Threshold', suffix: 'pp' },
  ],
  curriculum_narrowing: [
    { key: 'threshold_subjects', label: 'Threshold', suffix: 'subjects' },
  ],
  low_activation: [
    { key: 'threshold_percentage', label: 'Threshold', suffix: '%' },
    { key: 'period_weeks', label: 'After', suffix: 'weeks' },
  ],
  new_school_joined: [],
  stem_gender_imbalance: [
    { key: 'threshold_percentage', label: 'Min representation', suffix: '%' },
  ],
  low_career_exploration: [
    { key: 'threshold_sectors', label: 'Min sectors', suffix: 'avg' },
  ],
  report_ready: [],
  low_data_quality: [
    { key: 'threshold_score', label: 'Threshold score', suffix: '/5' },
  ],
}

export function AlertSettingsClient({ initialConfig }: { initialConfig: AlertConfig }) {
  const [config, setConfig] = useState<AlertConfig>(initialConfig)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  function updateType(type: AlertType, patch: Partial<AlertTypeConfig>) {
    setConfig((prev) => ({
      ...prev,
      types: { ...prev.types, [type]: { ...prev.types[type], ...patch } },
    }))
  }

  function addQuietPeriod() {
    const today = new Date().toISOString().slice(0, 10)
    setConfig((prev) => ({
      ...prev,
      quiet_periods: [...prev.quiet_periods, { start: today, end: today, label: '' }],
    }))
  }

  function updateQuietPeriod(idx: number, patch: Partial<QuietPeriod>) {
    setConfig((prev) => ({
      ...prev,
      quiet_periods: prev.quiet_periods.map((q, i) => (i === idx ? { ...q, ...patch } : q)),
    }))
  }

  function removeQuietPeriod(idx: number) {
    setConfig((prev) => ({
      ...prev,
      quiet_periods: prev.quiet_periods.filter((_, i) => i !== idx),
    }))
  }

  async function save() {
    setSaving(true)
    setMessage(null)
    try {
      const resp = await fetch('/api/authority/alerts/config', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (resp.ok) {
        const data = (await resp.json()) as { config?: AlertConfig }
        if (data.config) setConfig(data.config)
        setMessage('Settings saved.')
      } else {
        const err = await resp.json().catch(() => ({ error: 'Save failed' }))
        setMessage(`Error: ${err.error ?? 'Save failed'}`)
      }
    } catch (e) {
      setMessage(`Error: ${e instanceof Error ? e.message : 'Network error'}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <section style={cardStyle}>
        <h2 style={sectionHeadingStyle}>Digest cadence</h2>
        <p style={hintStyle}>
          When the digest sends, every authority staff member receives one email summarising new
          unacknowledged alerts grouped by severity.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
          {FREQUENCIES.map((f) => (
            <label key={f.value} style={radioStyle}>
              <input
                type="radio"
                name="digest_frequency"
                value={f.value}
                checked={config.digest_frequency === f.value}
                onChange={() => setConfig((prev) => ({ ...prev, digest_frequency: f.value }))}
              />
              <span style={{ marginLeft: 6 }}>{f.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={sectionHeadingStyle}>Quiet periods</h2>
        <p style={hintStyle}>
          During these date ranges, no new alerts are created (e.g. school holidays). The next run
          after the period ends will pick up any conditions that are still true.
        </p>
        {config.quiet_periods.length === 0 && (
          <div style={{ padding: 12, color: '#6b7280', fontSize: 13 }}>No quiet periods configured.</div>
        )}
        {config.quiet_periods.map((q, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
            <input
              type="date"
              value={q.start}
              onChange={(e) => updateQuietPeriod(idx, { start: e.target.value })}
              style={inputStyle}
            />
            <span>→</span>
            <input
              type="date"
              value={q.end}
              onChange={(e) => updateQuietPeriod(idx, { end: e.target.value })}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Label (optional)"
              value={q.label ?? ''}
              maxLength={60}
              onChange={(e) => updateQuietPeriod(idx, { label: e.target.value })}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button type="button" onClick={() => removeQuietPeriod(idx)} style={removeButtonStyle}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addQuietPeriod} style={{ ...addButtonStyle, marginTop: 12 }}>
          + Add quiet period
        </button>
      </section>

      <section>
        <h2 style={{ ...sectionHeadingStyle, marginTop: 24 }}>Alert types</h2>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))' }}>
          {ALERT_TYPES.map((type) => {
            const t = config.types[type]
            const fields = THRESHOLD_FIELDS[type]
            return (
              <div key={type} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{ALERT_TYPE_LABELS[type]}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                      {ALERT_TYPE_DESCRIPTIONS[type]}
                    </div>
                  </div>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="checkbox"
                      checked={t.enabled}
                      onChange={(e) => updateType(type, { enabled: e.target.checked })}
                    />
                    <span style={{ fontSize: 13 }}>Enabled</span>
                  </label>
                </div>

                {fields.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    {fields.map((f) => (
                      <label key={String(f.key)} style={{ flex: '1 1 140px' }}>
                        <span style={smallLabelStyle}>{f.label}{f.suffix ? ` (${f.suffix})` : ''}</span>
                        <input
                          type="number"
                          min={0}
                          value={(t[f.key] as number) ?? ''}
                          onChange={(e) => updateType(type, { [f.key]: Number(e.target.value) } as Partial<AlertTypeConfig>)}
                          style={inputStyle}
                        />
                      </label>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: 12 }}>
                  <span style={smallLabelStyle}>Severity</span>
                  <select
                    value={t.severity}
                    onChange={(e) => updateType(type, { severity: e.target.value as AlertSeverity })}
                    style={inputStyle}
                  >
                    {SEVERITIES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={t.notify_in_app}
                      onChange={(e) => updateType(type, { notify_in_app: e.target.checked })}
                    />
                    In-app
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={t.notify_email}
                      onChange={(e) => updateType(type, { notify_email: e.target.checked })}
                    />
                    Email digest
                  </label>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div style={{ position: 'sticky', bottom: 16, marginTop: 24 }}>
        <div
          style={{
            background: '#fff',
            padding: 12,
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 13, color: message?.startsWith('Error') ? '#991B1B' : '#64748b' }}>
            {message ?? 'Changes are saved when you click Save.'}
          </span>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            style={{
              padding: '10px 20px',
              background: '#1B3A5C',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 13,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 8,
  padding: 16,
  marginBottom: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
}
const sectionHeadingStyle: React.CSSProperties = {
  fontSize: '1.05rem',
  fontWeight: 700,
  margin: '0 0 6px',
  color: '#1a1a2e',
}
const hintStyle: React.CSSProperties = { fontSize: 13, color: '#64748b', margin: 0 }
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #e5e7eb',
  borderRadius: 6,
  fontSize: 13,
  background: '#fff',
}
const smallLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: 4,
}
const radioStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: 13,
  padding: '6px 10px',
  border: '1px solid #e5e7eb',
  borderRadius: 6,
  cursor: 'pointer',
  background: '#fff',
}
const addButtonStyle: React.CSSProperties = {
  padding: '8px 14px',
  background: '#fff',
  color: '#1B3A5C',
  border: '1px dashed #1B3A5C',
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
}
const removeButtonStyle: React.CSSProperties = {
  padding: '6px 10px',
  background: '#fff',
  color: '#991B1B',
  border: '1px solid #FCA5A5',
  borderRadius: 6,
  fontSize: 12,
  cursor: 'pointer',
}
