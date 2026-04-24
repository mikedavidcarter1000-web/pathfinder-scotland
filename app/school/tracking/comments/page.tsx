'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/toast'

type Comment = {
  id: string
  category: 'positive' | 'improvement' | 'concern' | 'general'
  department: string | null
  comment_template: string
  created_at?: string
}

const CATEGORIES: Comment['category'][] = ['positive', 'improvement', 'concern', 'general']
const PLACEHOLDER_HELPS = [
  { key: '{{name}}', desc: "Student's first name" },
  { key: '{{subject}}', desc: 'Subject name' },
  { key: '{{pronoun_subject}}', desc: 'they' },
  { key: '{{pronoun_object}}', desc: 'them' },
  { key: '{{pronoun_possessive}}', desc: 'their' },
]

export default function CommentBankPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const toast = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [department, setDepartment] = useState<string>('all')
  const [catFilter, setCatFilter] = useState<Comment['category'] | 'all'>('all')

  const [editing, setEditing] = useState<Comment | null>(null)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/sign-in?redirect=/school/tracking/comments')
      return
    }
    fetch('/api/school/tracking/comments')
      .then((r) => r.json())
      .then((d) => setComments(d.comments ?? []))
      .finally(() => setLoading(false))
  }, [authLoading, user, router])

  const departments = useMemo(() => {
    const s = new Set<string>()
    for (const c of comments) if (c.department) s.add(c.department)
    return Array.from(s).sort()
  }, [comments])

  const filtered = useMemo(
    () =>
      comments.filter((c) => {
        if (catFilter !== 'all' && c.category !== catFilter) return false
        if (department === 'all') return true
        if (department === '__general__') return c.department === null
        return c.department === department
      }),
    [comments, department, catFilter]
  )

  async function handleSave(data: Omit<Comment, 'id'>, id?: string) {
    const res = id
      ? await fetch(`/api/school/tracking/comments/${id}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(data),
        })
      : await fetch('/api/school/tracking/comments', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(data),
        })
    const d = await res.json()
    if (!res.ok) {
      toast.error(d.error ?? 'Save failed.')
      return
    }
    setComments((prev) => {
      if (id) return prev.map((c) => (c.id === id ? d.comment : c))
      return [...prev, d.comment]
    })
    setEditing(null)
    setAdding(false)
    toast.success('Saved.')
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this comment template?')) return
    const res = await fetch(`/api/school/tracking/comments/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error('Delete failed.')
      return
    }
    setComments((prev) => prev.filter((c) => c.id !== id))
  }

  if (loading) return <div className="pf-container pt-8 pb-12"><p>Loading…</p></div>

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: 12 }}>
        <Link href="/school/tracking" style={{ fontSize: '0.875rem' }}>&larr; Tracking</Link>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '1.5rem' }}>Comment bank</h1>
          <p style={{ margin: 0, opacity: 0.7 }}>Reusable comment templates for reports.</p>
        </div>
        <button onClick={() => setAdding(true)} style={btnPrimary}>Add comment</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value as Comment['category'] | 'all')} style={selStyle}>
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={department} onChange={(e) => setDepartment(e.target.value)} style={selStyle}>
          <option value="all">All departments</option>
          <option value="__general__">No department (general)</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div style={{ marginTop: 16 }}>
        {CATEGORIES.map((cat) => {
          const groupComments = filtered.filter((c) => c.category === cat)
          if (catFilter !== 'all' && catFilter !== cat) return null
          if (groupComments.length === 0) return null
          return (
            <div key={cat} style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: '1rem', textTransform: 'capitalize', marginBottom: 8 }}>{cat}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {groupComments.map((c) => (
                  <div key={c.id} style={commentCard}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.4, color: '#6b7280', marginBottom: 2 }}>
                        {c.department ?? 'General'}
                      </div>
                      <div style={{ fontSize: '0.9rem' }}>{c.comment_template}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => setEditing(c)} style={btnGhost}>Edit</button>
                      <button onClick={() => handleDelete(c.id)} style={{ ...btnGhost, color: '#991b1b' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && <p style={{ opacity: 0.6 }}>No comments match the current filters.</p>}
      </div>

      {(editing || adding) && (
        <CommentEditor
          initial={editing}
          onSave={(data) => handleSave(data, editing?.id)}
          onClose={() => { setEditing(null); setAdding(false) }}
        />
      )}

      <section style={{ marginTop: 32, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc', fontSize: '0.875rem' }}>
        <h3 style={{ margin: '0 0 8px' }}>Template variables</h3>
        <p style={{ marginTop: 0 }}>Insert any of these into your template — they are replaced at render time.</p>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {PLACEHOLDER_HELPS.map((p) => (
            <li key={p.key}><code>{p.key}</code> — {p.desc}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function CommentEditor({
  initial,
  onSave,
  onClose,
}: {
  initial: Comment | null
  onSave: (data: Omit<Comment, 'id'>) => void
  onClose: () => void
}) {
  const [category, setCategory] = useState<Comment['category']>(initial?.category ?? 'positive')
  const [department, setDepartment] = useState<string>(initial?.department ?? '')
  const [template, setTemplate] = useState<string>(initial?.comment_template ?? '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function insertAt(key: string) {
    const ta = textareaRef.current
    if (!ta) {
      setTemplate((t) => t + key)
      return
    }
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const before = template.slice(0, start)
    const after = template.slice(end)
    const next = before + key + after
    setTemplate(next)
    setTimeout(() => {
      ta.focus()
      const pos = before.length + key.length
      ta.setSelectionRange(pos, pos)
    }, 0)
  }

  function handle(e: React.FormEvent) {
    e.preventDefault()
    if (!template.trim()) return
    onSave({
      category,
      department: department.trim() || null,
      comment_template: template.trim(),
    })
  }

  return (
    <div style={overlay}>
      <form onSubmit={handle} style={modal}>
        <h3 style={{ margin: '0 0 12px' }}>{initial ? 'Edit comment' : 'Add comment'}</h3>
        <label style={labelStyle}>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value as Comment['category'])} style={selStyle} required>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label style={labelStyle}>
          Department (optional)
          <input value={department} onChange={(e) => setDepartment(e.target.value)} style={inputStyle} placeholder="e.g. Maths" />
        </label>
        <label style={labelStyle}>
          Template
          <textarea ref={textareaRef} value={template} onChange={(e) => setTemplate(e.target.value)} rows={4} style={{ ...inputStyle, fontFamily: 'inherit' }} required />
        </label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {PLACEHOLDER_HELPS.map((p) => (
            <button type="button" key={p.key} onClick={() => insertAt(p.key)} style={{ ...btnGhost, fontSize: '0.75rem' }}>
              {p.key}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={btnGhost}>Cancel</button>
          <button type="submit" style={btnPrimary}>{initial ? 'Save' : 'Add'}</button>
        </div>
      </form>
    </div>
  )
}

const commentCard: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: 'white', display: 'flex', gap: 12, alignItems: 'flex-start' }
const btnPrimary: React.CSSProperties = { padding: '8px 14px', backgroundColor: '#1B3A5C', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }
const btnGhost: React.CSSProperties = { padding: '6px 10px', backgroundColor: 'transparent', color: '#1B3A5C', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }
const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.875rem', marginBottom: 10 }
const inputStyle: React.CSSProperties = { padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.9rem' }
const selStyle: React.CSSProperties = { ...inputStyle }
const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }
const modal: React.CSSProperties = { background: 'white', borderRadius: 10, padding: 18, width: 'min(90vw, 500px)' }
