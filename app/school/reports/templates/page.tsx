'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/toast'

type TemplateListItem = {
  id: string
  name: string
  header_colour: string | null
  school_logo_url: string | null
  is_default: boolean
  created_at: string
}

type TemplateDetail = TemplateListItem & { template_html: string }

const VARIABLE_GROUPS: Array<{ label: string; items: Array<{ code: string; hint: string }> }> = [
  {
    label: 'Header',
    items: [
      { code: '{{school_name}}', hint: 'School name' },
      { code: '{{cycle_name}}', hint: 'Tracking cycle / reporting window' },
      { code: '{{generated_date}}', hint: 'Date the report was generated' },
      { code: '{{header_colour}}', hint: 'Header colour (hex)' },
      { code: '{{#school_logo}}<img src="{{school_logo}}">{{/school_logo}}', hint: 'Optional logo block' },
    ],
  },
  {
    label: 'Student',
    items: [
      { code: '{{student_name}}', hint: 'Student full name' },
      { code: '{{year_group}}', hint: 'Year group (S4, S5 ...)' },
      { code: '{{registration_class}}', hint: 'Registration class' },
      { code: '{{attendance_pct}}', hint: 'Attendance %' },
      { code: '{{ucas_tariff}}', hint: 'UCAS tariff total' },
      { code: '{{guidance_teacher_name}}', hint: 'Guidance teacher' },
    ],
  },
  {
    label: 'Subjects loop',
    items: [
      { code: '{{#subjects}}...{{/subjects}}', hint: 'Loop over each subject' },
      { code: '{{subject_name}}', hint: 'Subject name' },
      { code: '{{working_grade}}', hint: 'Working grade (A/B/C/D/No pass)' },
      { code: '{{grade_colour}}', hint: 'Background colour for the grade cell' },
      { code: '{{on_track}}', hint: 'On-track status (above, on track ...)' },
      { code: '{{on_track_colour}}', hint: 'Background colour for on-track cell' },
      { code: '{{effort}}', hint: 'Effort (excellent / good / satisfactory / concern)' },
      { code: '{{effort_colour}}', hint: 'Background colour for effort cell' },
      { code: '{{comment}}', hint: 'Teacher comment' },
    ],
  },
  {
    label: 'Custom metrics (optional)',
    items: [
      { code: '{{#custom_metrics_present}}...{{/custom_metrics_present}}', hint: 'Shown only when the school has custom metrics defined' },
      { code: '{{#custom_metric_names}}<th>{{.}}</th>{{/custom_metric_names}}', hint: 'One header cell per custom metric name' },
      { code: '{{#custom_values}}<td>{{.}}</td>{{/custom_values}}', hint: 'Per-subject custom metric values (inside {{#subjects}})' },
    ],
  },
]

export default function ReportTemplatesPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const toast = useToast()
  const [templates, setTemplates] = useState<TemplateListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<TemplateDetail | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/sign-in?redirect=/school/reports/templates')
      return
    }
    refresh()
  }, [authLoading, user, router])

  async function refresh() {
    setLoading(true)
    const res = await fetch('/api/school/reports/templates')
    const d = await res.json()
    setTemplates(d.templates ?? [])
    setLoading(false)
  }

  const startCreate = useCallback(() => {
    setEditing({
      id: '',
      name: 'New template',
      template_html: '<div style="font-family: Arial, sans-serif;">...</div>',
      header_colour: '#1B3A5C',
      school_logo_url: null,
      is_default: false,
      created_at: '',
    })
    setIsCreating(true)
    setPreviewHtml('')
  }, [])

  async function startEdit(id: string) {
    const res = await fetch(`/api/school/reports/templates/${id}`)
    const d = await res.json()
    if (!res.ok) {
      toast.error(d.error ?? 'Could not load template.')
      return
    }
    setEditing(d.template)
    setIsCreating(false)
    refreshPreview(d.template.template_html, d.template.header_colour ?? '#1B3A5C', d.template.school_logo_url)
  }

  function cancelEdit() {
    setEditing(null)
    setPreviewHtml('')
    setIsCreating(false)
  }

  const refreshPreview = useCallback(
    async (html: string, headerColour: string, logo: string | null) => {
      setPreviewLoading(true)
      try {
        const res = await fetch('/api/school/reports/templates/preview', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ template_html: html, header_colour: headerColour, school_logo_url: logo }),
        })
        const d = await res.json()
        if (res.ok) setPreviewHtml(d.html ?? '')
      } finally {
        setPreviewLoading(false)
      }
    },
    []
  )

  // Debounced auto-refresh preview whenever the editor state changes.
  const editorKey = useMemo(() => {
    if (!editing) return ''
    return `${editing.template_html.length}:${editing.header_colour}:${editing.school_logo_url ?? ''}`
  }, [editing])

  useEffect(() => {
    if (!editing) return
    const t = setTimeout(() => {
      refreshPreview(editing.template_html, editing.header_colour ?? '#1B3A5C', editing.school_logo_url)
    }, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorKey])

  async function save() {
    if (!editing) return
    if (!editing.name.trim()) {
      toast.error('Give the template a name.')
      return
    }
    setSaving(true)
    try {
      if (isCreating) {
        const res = await fetch('/api/school/reports/templates', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(editing),
        })
        const d = await res.json()
        if (!res.ok) {
          toast.error(d.error ?? 'Save failed.')
          return
        }
        toast.success('Template created.')
      } else {
        const res = await fetch(`/api/school/reports/templates/${editing.id}`, {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(editing),
        })
        const d = await res.json()
        if (!res.ok) {
          toast.error(d.error ?? 'Save failed.')
          return
        }
        toast.success('Template saved.')
      }
      cancelEdit()
      await refresh()
    } finally {
      setSaving(false)
    }
  }

  async function setDefault(id: string) {
    const res = await fetch(`/api/school/reports/templates/${id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ is_default: true }),
    })
    const d = await res.json()
    if (!res.ok) {
      toast.error(d.error ?? 'Could not set default.')
      return
    }
    toast.success('Default template updated.')
    await refresh()
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete "${name}"? Generated reports using this template will keep their content.`)) return
    const res = await fetch(`/api/school/reports/templates/${id}`, { method: 'DELETE' })
    const d = await res.json()
    if (!res.ok) {
      toast.error(d.error ?? 'Delete failed.')
      return
    }
    toast.success('Template deleted.')
    await refresh()
  }

  function insertVariable(code: string) {
    if (!editing) return
    setEditing({ ...editing, template_html: `${editing.template_html}\n${code}` })
  }

  if (loading) return <div className="pf-container pt-8 pb-12"><p>Loading templates…</p></div>

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: 12 }}>
        <Link href="/school/reports" style={{ fontSize: '0.875rem' }}>&larr; Reports</Link>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '1.75rem' }}>Report templates</h1>
          <p style={{ opacity: 0.7, margin: 0 }}>Design the look and content of parent reports.</p>
        </div>
        <button onClick={startCreate} style={btnPrimary}>New template</button>
      </div>

      <section style={card}>
        {templates.length === 0 ? (
          <p style={{ opacity: 0.6 }}>No templates yet.</p>
        ) : (
          <table style={tbl}>
            <thead>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Colour</th>
                <th style={th}>Default</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id}>
                  <td style={td}><strong>{t.name}</strong></td>
                  <td style={td}>
                    <span style={{ display: 'inline-block', width: 18, height: 18, background: t.header_colour ?? '#1B3A5C', borderRadius: 4, border: '1px solid #e5e7eb', verticalAlign: 'middle' }} />{' '}
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{t.header_colour}</span>
                  </td>
                  <td style={td}>{t.is_default ? <span style={{ color: '#166534', fontWeight: 600 }}>Default</span> : ''}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    <button onClick={() => startEdit(t.id)} style={btnGhost}>Edit</button>{' '}
                    {!t.is_default && <button onClick={() => setDefault(t.id)} style={btnGhost}>Set default</button>}{' '}
                    <button onClick={() => remove(t.id, t.name)} style={btnDanger}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {editing && (
        <section style={{ ...card, background: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h2 style={h2}>{isCreating ? 'New template' : `Edit: ${editing.name}`}</h2>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={cancelEdit} style={btnGhost}>Cancel</button>
              <button onClick={save} disabled={saving} style={btnPrimary}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10, marginTop: 12 }}>
            <label style={fieldLabel}>
              Name
              <input
                type="text"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                style={inp}
              />
            </label>
            <label style={fieldLabel}>
              Header colour
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  type="color"
                  value={editing.header_colour ?? '#1B3A5C'}
                  onChange={(e) => setEditing({ ...editing, header_colour: e.target.value })}
                  style={{ width: 48, height: 34, padding: 0, border: '1px solid #cbd5e1', borderRadius: 6 }}
                />
                <input
                  type="text"
                  value={editing.header_colour ?? ''}
                  onChange={(e) => setEditing({ ...editing, header_colour: e.target.value })}
                  style={{ ...inp, flex: 1 }}
                />
              </div>
            </label>
            <label style={fieldLabel}>
              School logo URL (optional)
              <input
                type="text"
                value={editing.school_logo_url ?? ''}
                onChange={(e) => setEditing({ ...editing, school_logo_url: e.target.value || null })}
                placeholder="https://..."
                style={inp}
              />
            </label>
            <label style={{ ...fieldLabel, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={editing.is_default}
                onChange={(e) => setEditing({ ...editing, is_default: e.target.checked })}
              />
              <span>Set as default template</span>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 14 }}>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: 4 }}>Template HTML</div>
              <textarea
                value={editing.template_html}
                onChange={(e) => setEditing({ ...editing, template_html: e.target.value })}
                rows={24}
                style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.8125rem', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }}
              />
              <details style={{ marginTop: 10 }}>
                <summary style={{ cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>Variables &ndash; click to insert</summary>
                <div style={{ marginTop: 6, display: 'grid', gap: 8 }}>
                  {VARIABLE_GROUPS.map((g) => (
                    <div key={g.label}>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', margin: '6px 0 3px' }}>{g.label}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {g.items.map((v) => (
                          <button
                            key={v.code}
                            type="button"
                            onClick={() => insertVariable(v.code)}
                            title={v.hint}
                            style={{ padding: '3px 6px', border: '1px solid #cbd5e1', borderRadius: 4, background: 'white', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.75rem' }}
                          >
                            {v.code}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>

            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: 4 }}>
                Live preview {previewLoading ? <span style={{ color: '#6b7280', fontWeight: 400 }}>(updating…)</span> : null}
              </div>
              <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 6, padding: 8, minHeight: 300, maxHeight: 640, overflow: 'auto' }}>
                {previewHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                ) : (
                  <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Preview will appear when the template renders cleanly.</div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

const card: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 10, padding: 14, background: 'white', marginTop: 14 }
const h2: React.CSSProperties = { margin: 0, fontSize: '1.05rem' }
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginTop: 4 }
const th: React.CSSProperties = { padding: '8px 10px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.4, color: '#6b7280' }
const td: React.CSSProperties = { padding: '10px', borderTop: '1px solid #f3f4f6' }
const inp: React.CSSProperties = { width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.9rem' }
const fieldLabel: React.CSSProperties = { display: 'flex', flexDirection: 'column', fontSize: '0.8125rem', fontWeight: 600, gap: 4 }
const btnPrimary: React.CSSProperties = { padding: '8px 14px', backgroundColor: '#1B3A5C', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }
const btnGhost: React.CSSProperties = { padding: '6px 10px', background: 'transparent', color: '#1B3A5C', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer', fontSize: '0.8125rem' }
const btnDanger: React.CSSProperties = { padding: '6px 10px', background: 'transparent', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', fontSize: '0.8125rem' }
