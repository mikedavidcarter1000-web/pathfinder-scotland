'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/toast'

type Cycle = { id: string; name: string; academic_year: string; is_current: boolean }
type Template = { id: string; name: string; is_default: boolean }
type Report = {
  id: string
  student_id: string
  generated_at: string
  emailed_at: string | null
  emailed_to: string | null
  best_email: string | null
  best_email_source: 'parent' | 'student' | null
  students: { first_name: string | null; last_name: string | null; school_stage: string | null; registration_class: string | null; email: string | null } | null
  tracking_cycles: { name: string } | null
  report_templates: { id: string; name: string } | null
}

const YEAR_GROUPS = ['s1', 's2', 's3', 's4', 's5', 's6']

export default function ReportsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const toast = useToast()
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [cycleId, setCycleId] = useState<string>('')
  const [yearGroup, setYearGroup] = useState<string>('')
  const [templateId, setTemplateId] = useState<string>('')
  const [generating, setGenerating] = useState(false)
  const [sendingAll, setSendingAll] = useState(false)
  const [loading, setLoading] = useState(true)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [previewStudent, setPreviewStudent] = useState<string>('')
  const [previewingFilter, setPreviewingFilter] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/sign-in?redirect=/school/reports')
      return
    }
    Promise.all([
      fetch('/api/school/tracking/cycles').then((r) => r.json()),
      fetch('/api/school/reports/templates').then((r) => r.json()),
    ])
      .then(([cyclesRes, templatesRes]) => {
        const cycleList = (cyclesRes.cycles ?? []) as Cycle[]
        const templateList = (templatesRes.templates ?? []) as Template[]
        setCycles(cycleList)
        setTemplates(templateList)
        const cur = cycleList.find((c) => c.is_current)
        if (cur) setCycleId(cur.id)
        const defaultT = templateList.find((t) => t.is_default)
        if (defaultT) setTemplateId(defaultT.id)
      })
      .finally(() => setLoading(false))
  }, [authLoading, user, router])

  useEffect(() => {
    if (!cycleId) return
    refreshList()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycleId, yearGroup])

  async function refreshList() {
    const url = new URL('/api/school/reports', window.location.origin)
    if (cycleId) url.searchParams.set('cycle_id', cycleId)
    if (yearGroup) url.searchParams.set('year_group', yearGroup)
    const res = await fetch(url.toString())
    const d = await res.json()
    setReports(d.reports ?? [])
  }

  async function previewFilter() {
    // Render a sample report using the selected template against stock
    // sample data. Useful to sanity-check a template before bulk-generating.
    if (!templateId) {
      toast.error('Pick a template first.')
      return
    }
    setPreviewingFilter(true)
    try {
      const res = await fetch(`/api/school/reports/templates/${templateId}`)
      const d = await res.json()
      if (!res.ok || !d.template) {
        toast.error(d.error ?? 'Template not found.')
        return
      }
      const p = await fetch('/api/school/reports/templates/preview', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          template_html: d.template.template_html,
          header_colour: d.template.header_colour,
          school_logo_url: d.template.school_logo_url,
        }),
      })
      const pd = await p.json()
      if (!p.ok) {
        toast.error(pd.error ?? 'Preview failed.')
        return
      }
      setPreviewStudent(`Sample &mdash; ${d.template.name}`)
      setPreviewHtml(pd.html ?? '')
    } finally {
      setPreviewingFilter(false)
    }
  }

  async function previewOne(report: Report) {
    setPreviewHtml('Loading…')
    setPreviewStudent(`${report.students?.first_name ?? ''} ${report.students?.last_name ?? ''}`.trim() || 'Report')
    const res = await fetch(`/api/school/reports/${report.id}/preview`)
    const d = await res.json()
    if (!res.ok) {
      setPreviewHtml(null)
      toast.error(d.error ?? 'Preview failed.')
      return
    }
    setPreviewHtml(d.html ?? '')
  }

  async function generate() {
    if (!cycleId) {
      toast.error('Select a cycle first.')
      return
    }
    setGenerating(true)
    try {
      const res = await fetch('/api/school/reports/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          cycle_id: cycleId,
          year_group: yearGroup || undefined,
          template_id: templateId || undefined,
        }),
      })
      const d = await res.json()
      if (!res.ok) {
        toast.error(d.error ?? 'Could not generate.')
        return
      }
      toast.success(`Generated ${d.generated} report(s).`)
      await refreshList()
    } finally {
      setGenerating(false)
    }
  }

  async function sendOne(report: Report) {
    const to = report.best_email ?? prompt('Enter recipient email:')
    if (!to) return
    const res = await fetch(`/api/school/reports/${report.id}/send`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ to }),
    })
    const d = await res.json()
    if (!res.ok) {
      toast.error(d.error ?? 'Send failed.')
      return
    }
    toast.success(`Sent to ${d.sent_to}`)
    await refreshList()
  }

  async function sendAll() {
    const pending = reports.filter((r) => !r.emailed_at && r.best_email)
    if (pending.length === 0) {
      toast.info('No reports pending send.')
      return
    }
    if (!confirm(`Send ${pending.length} reports? Rate-limited to 10/second.`)) return
    setSendingAll(true)
    try {
      const res = await fetch('/api/school/reports/send-all', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cycle_id: cycleId, year_group: yearGroup || undefined }),
      })
      const d = await res.json()
      if (!res.ok) {
        toast.error(d.error ?? 'Bulk send failed.')
        return
      }
      const msgs = [
        `Sent ${d.sent}`,
        d.skipped_no_email > 0 ? `skipped ${d.skipped_no_email} (no email)` : null,
        d.failed > 0 ? `${d.failed} failed` : null,
        d.already_sent > 0 ? `${d.already_sent} already sent` : null,
      ].filter(Boolean)
      toast.success(msgs.join(', ') + '.')
      await refreshList()
    } finally {
      setSendingAll(false)
    }
  }

  if (loading) return <div className="pf-container pt-8 pb-12"><p>Loading reports…</p></div>

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: 12 }}>
        <Link href="/school/dashboard" style={{ fontSize: '0.875rem' }}>&larr; Dashboard</Link>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '1.75rem' }}>Parent reports</h1>
          <p style={{ opacity: 0.7, margin: 0 }}>Generate, preview, and send termly reports to parents.</p>
        </div>
        <Link href="/school/reports/templates" style={btnGhost}>Manage templates</Link>
      </div>

      <section style={card}>
        <h2 style={h2}>Generate</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select value={cycleId} onChange={(e) => setCycleId(e.target.value)} style={sel}>
            <option value="">Select cycle</option>
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {c.academic_year} {c.is_current ? '(current)' : ''}
              </option>
            ))}
          </select>
          <select value={yearGroup} onChange={(e) => setYearGroup(e.target.value)} style={sel}>
            <option value="">All year groups</option>
            {YEAR_GROUPS.map((yg) => <option key={yg} value={yg}>{yg.toUpperCase()}</option>)}
          </select>
          <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} style={sel}>
            <option value="">Default template</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.is_default ? '(default)' : ''}
              </option>
            ))}
          </select>
          <button onClick={generate} disabled={generating || !cycleId} style={btnPrimary}>
            {generating ? 'Generating…' : 'Generate all'}
          </button>
          <button onClick={previewFilter} disabled={previewingFilter} style={btnGhost}>
            {previewingFilter ? 'Checking…' : 'Preview template'}
          </button>
        </div>
        <p style={{ fontSize: '0.8125rem', opacity: 0.7, marginTop: 8 }}>
          &quot;Generate all&quot; creates one report per student in the selected year group.
          Emails route to the first active linked parent; if no parent is linked, to the student&apos;s address.
        </p>
      </section>

      <section style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <h2 style={h2}>{reports.length} report{reports.length === 1 ? '' : 's'}</h2>
          {reports.length > 0 && (
            <button onClick={sendAll} disabled={sendingAll} style={btnPrimary}>
              {sendingAll ? 'Sending…' : 'Send all unsent'}
            </button>
          )}
        </div>
        {reports.length === 0 ? (
          <p style={{ opacity: 0.6 }}>No reports for this filter yet.</p>
        ) : (
          <table style={tbl}>
            <thead>
              <tr>
                <th style={th}>Student</th>
                <th style={th}>Year</th>
                <th style={th}>Template</th>
                <th style={th}>Generated</th>
                <th style={th}>Status</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => {
                const name = `${r.students?.last_name ?? ''}, ${r.students?.first_name ?? ''}`
                return (
                  <tr key={r.id}>
                    <td style={td}>
                      <div>{name}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                        {r.best_email ? (
                          <>
                            {r.best_email}{' '}
                            <span style={{ color: r.best_email_source === 'parent' ? '#065f46' : '#9ca3af' }}>
                              ({r.best_email_source === 'parent' ? 'parent' : 'student'})
                            </span>
                          </>
                        ) : (
                          'no email on file'
                        )}
                      </div>
                    </td>
                    <td style={td}>{r.students?.school_stage?.toUpperCase() ?? ''}</td>
                    <td style={td}>{r.report_templates?.name ?? '—'}</td>
                    <td style={td}>{new Date(r.generated_at).toLocaleDateString('en-GB')}</td>
                    <td style={td}>
                      {r.emailed_at ? (
                        <span style={{ color: '#166534' }}>Sent to {r.emailed_to}</span>
                      ) : r.best_email ? (
                        <span style={{ color: '#6b7280' }}>Pending</span>
                      ) : (
                        <span style={{ color: '#991b1b' }}>No email</span>
                      )}
                    </td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      <button onClick={() => previewOne(r)} style={btnGhost}>Preview</button>{' '}
                      <a href={`/school/reports/${r.id}/print`} target="_blank" rel="noopener noreferrer" style={btnGhost}>PDF</a>{' '}
                      <button onClick={() => sendOne(r)} style={btnGhost}>Email</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ ...card, background: '#f8fafc' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: '1rem' }}>PDF export</h3>
        <p style={{ fontSize: '0.875rem', margin: 0 }}>
          Click <strong>PDF</strong> on any row to open the printable version. Use your browser&apos;s print
          dialog (Ctrl+P / &#8984;P) and choose <em>Save as PDF</em> as the destination.
        </p>
      </section>

      {previewHtml !== null && (
        <div
          onClick={() => setPreviewHtml(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 20 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'white', borderRadius: 10, width: '100%', maxWidth: 900, maxHeight: '90vh', overflow: 'auto' }}
          >
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{previewStudent || 'Preview'}</strong>
              <button onClick={() => setPreviewHtml(null)} style={btnGhost}>Close</button>
            </div>
            <div style={{ padding: 14 }} dangerouslySetInnerHTML={{ __html: previewHtml === 'Loading…' ? '<p>Loading…</p>' : previewHtml }} />
          </div>
        </div>
      )}
    </div>
  )
}

const card: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 10, padding: 14, background: 'white', marginTop: 14 }
const h2: React.CSSProperties = { margin: '0 0 10px', fontSize: '1.05rem' }
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginTop: 8 }
const th: React.CSSProperties = { padding: '8px 10px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.4, color: '#6b7280' }
const td: React.CSSProperties = { padding: '10px', borderTop: '1px solid #f3f4f6' }
const sel: React.CSSProperties = { padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.9rem' }
const btnPrimary: React.CSSProperties = { padding: '8px 14px', backgroundColor: '#1B3A5C', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }
const btnGhost: React.CSSProperties = { padding: '6px 10px', background: 'transparent', color: '#1B3A5C', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer', fontSize: '0.8125rem', textDecoration: 'none', display: 'inline-block' }
