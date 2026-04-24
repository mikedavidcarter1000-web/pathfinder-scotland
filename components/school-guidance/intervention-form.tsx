'use client'

import { useState } from 'react'

type ActionItem = {
  description: string
  due_date: string | null
  is_completed: boolean
}

type Props = {
  studentId: string
  studentName: string
  onClose: () => void
  onSaved: () => void
}

const INTERVENTION_TYPES = [
  { value: 'guidance_meeting', label: 'Guidance meeting' },
  { value: 'parent_contact', label: 'Parent contact' },
  { value: 'mentoring', label: 'Mentoring' },
  { value: 'study_support', label: 'Study support' },
  { value: 'behaviour_support', label: 'Behaviour support' },
  { value: 'attendance_followup', label: 'Attendance follow-up' },
  { value: 'wellbeing_check', label: 'Wellbeing check' },
  { value: 'careers_guidance', label: 'Careers guidance' },
  { value: 'subject_change', label: 'Subject change' },
  { value: 'referral_external', label: 'External referral' },
  { value: 'pef_intervention', label: 'PEF intervention' },
  { value: 'other', label: 'Other' },
]

export function InterventionForm({ studentId, studentName, onClose, onSaved }: Props) {
  const [type, setType] = useState('guidance_meeting')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [outcome, setOutcome] = useState('')
  const [followUp, setFollowUp] = useState('')
  const [pefFunded, setPefFunded] = useState(false)
  const [pefCost, setPefCost] = useState('')
  const [confidential, setConfidential] = useState(false)
  const [actions, setActions] = useState<ActionItem[]>([])
  const [contactMethod, setContactMethod] = useState<'phone' | 'email' | 'in_person' | 'letter'>('phone')
  const [parentName, setParentName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function addAction() {
    setActions((prev) => [...prev, { description: '', due_date: null, is_completed: false }])
  }

  function updateAction(idx: number, patch: Partial<ActionItem>) {
    setActions((prev) => prev.map((a, i) => (i === idx ? { ...a, ...patch } : a)))
  }

  function removeAction(idx: number) {
    setActions((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit() {
    setError('')
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    setSubmitting(true)
    try {
      // For parent_contact interventions, prepend contact-method metadata
      // to the notes so it surfaces on the intervention timeline without
      // needing a new column on the interventions table.
      let effectiveNotes = notes
      if (type === 'parent_contact') {
        const methodLabel = {
          phone: 'Phone',
          email: 'Email',
          in_person: 'In person',
          letter: 'Letter',
        }[contactMethod]
        const header = `[${methodLabel}${parentName ? ` with ${parentName.trim()}` : ''}]`
        effectiveNotes = notes ? `${header}\n${notes}` : header
      }

      const res = await fetch('/api/school/guidance/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          intervention_type: type,
          title: title.trim(),
          notes: effectiveNotes || null,
          outcome: outcome || null,
          follow_up_date: followUp || null,
          action_items: actions.filter((a) => a.description.trim()).map((a) => ({
            ...a,
            description: a.description.trim(),
          })),
          pef_funded: pefFunded,
          pef_cost: pefFunded && pefCost ? Number(pefCost) : null,
          is_confidential: confidential,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Submission failed' }))
        throw new Error(body.error ?? 'Submission failed')
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Log intervention"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, maxWidth: 600, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
        <h2 style={{ fontSize: 20, margin: '0 0 6px 0' }}>Log intervention</h2>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>For {studentName}</div>

        {error && (
          <div style={{ padding: 8, background: '#fee2e2', color: '#991b1b', borderRadius: 4, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <label style={label}>
          <div style={labelText}>Type</div>
          <select value={type} onChange={(e) => setType(e.target.value)} style={input}>
            {INTERVENTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>

        {type === 'parent_contact' && (
          <fieldset style={{ border: '1px solid #e5e5e5', padding: 10, margin: '10px 0', borderRadius: 4 }}>
            <legend style={{ fontSize: 13, fontWeight: 600 }}>Parent contact details</legend>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
              {(['phone', 'email', 'in_person', 'letter'] as const).map((method) => (
                <label key={method} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                  <input
                    type="radio"
                    name="contact_method"
                    value={method}
                    checked={contactMethod === method}
                    onChange={() => setContactMethod(method)}
                  />
                  {method === 'in_person' ? 'In person' : method.charAt(0).toUpperCase() + method.slice(1)}
                </label>
              ))}
            </div>
            <label style={label}>
              <div style={labelText}>Parent / carer name (optional)</div>
              <input
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="e.g. Ms Smith"
                style={input}
              />
            </label>
          </fieldset>
        )}

        <label style={label}>
          <div style={labelText}>Title</div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={input} placeholder="Short summary" />
        </label>

        <label style={label}>
          <div style={labelText}>Notes</div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} style={{ ...input, fontFamily: 'inherit' }} />
        </label>

        <label style={label}>
          <div style={labelText}>Outcome (optional)</div>
          <textarea value={outcome} onChange={(e) => setOutcome(e.target.value)} rows={2} style={{ ...input, fontFamily: 'inherit' }} />
        </label>

        <fieldset style={{ border: '1px solid #e5e5e5', padding: 10, margin: '10px 0', borderRadius: 4 }}>
          <legend style={{ fontSize: 13, fontWeight: 600 }}>Action items</legend>
          {actions.map((a, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 140px auto', gap: 6, marginBottom: 6 }}>
              <input
                value={a.description}
                onChange={(e) => updateAction(idx, { description: e.target.value })}
                placeholder="Action description"
                style={input}
              />
              <input
                type="date"
                value={a.due_date ?? ''}
                onChange={(e) => updateAction(idx, { due_date: e.target.value || null })}
                style={input}
              />
              <button type="button" onClick={() => removeAction(idx)} style={smallButton}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addAction} style={smallButton}>
            + Add action
          </button>
        </fieldset>

        <label style={label}>
          <div style={labelText}>Schedule follow-up (optional)</div>
          <input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} style={input} />
        </label>

        <label style={{ ...label, flexDirection: 'row' as const, alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={pefFunded} onChange={(e) => setPefFunded(e.target.checked)} />
          <span>PEF-funded intervention</span>
        </label>
        {pefFunded && (
          <label style={label}>
            <div style={labelText}>PEF cost (£)</div>
            <input
              type="number"
              step="0.01"
              value={pefCost}
              onChange={(e) => setPefCost(e.target.value)}
              style={input}
            />
          </label>
        )}

        <label style={{ ...label, flexDirection: 'row' as const, alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={confidential} onChange={(e) => setConfidential(e.target.checked)} />
          <span>Mark as confidential (visible only to you and senior staff)</span>
        </label>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button onClick={onClose} style={secondaryButton} disabled={submitting}>
            Cancel
          </button>
          <button onClick={handleSubmit} style={primaryButton} disabled={submitting}>
            {submitting ? 'Saving...' : 'Log intervention'}
          </button>
        </div>
      </div>
    </div>
  )
}

const label: React.CSSProperties = { display: 'flex', flexDirection: 'column' as const, marginBottom: 10 }
const labelText: React.CSSProperties = { fontSize: 13, fontWeight: 500, marginBottom: 4 }
const input: React.CSSProperties = { padding: '6px 10px', border: '1px solid #d0d0d0', borderRadius: 4, fontSize: 14 }
const smallButton: React.CSSProperties = {
  padding: '4px 10px',
  fontSize: 13,
  border: '1px solid #d0d0d0',
  borderRadius: 4,
  background: '#fff',
  cursor: 'pointer',
}
const primaryButton: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: 14,
  background: '#0059b3',
  color: '#fff',
  border: '1px solid #0059b3',
  borderRadius: 4,
  cursor: 'pointer',
}
const secondaryButton: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: 14,
  background: '#fff',
  border: '1px solid #d0d0d0',
  borderRadius: 4,
  cursor: 'pointer',
}
