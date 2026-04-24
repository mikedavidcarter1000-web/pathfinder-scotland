'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

type Choice = {
  id: string
  round_id: string
  student_id: string
  status: 'draft' | 'submitted' | 'parent_pending' | 'confirmed' | 'rejected' | 'cancelled'
  submitted_at: string | null
  parent_approved_at: string | null
  parent_rejected_at: string | null
  choice_rounds?: { id: string; name: string; academic_year: string; year_group: string; requires_parent_approval: boolean; schools?: { name: string; slug: string } | null } | null
  students?: { first_name: string; last_name: string } | null
}

export default function ParentChoicesPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [choices, setChoices] = useState<Choice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/sign-in?redirect=/parent/choices')
      return
    }
    fetch('/api/parent/choices')
      .then((r) => (r.ok ? r.json() : { choices: [] }))
      .then((d) => setChoices(d.choices ?? []))
      .finally(() => setLoading(false))
  }, [authLoading, user, router])

  if (loading) return <div className="pf-container pt-8 pb-12"><p>Loading…</p></div>

  const pending = choices.filter((c) => c.status === 'parent_pending' || c.status === 'submitted')
  const others = choices.filter((c) => c.status !== 'parent_pending' && c.status !== 'submitted')

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: 16 }}>
        <Link href="/parent/dashboard" style={{ fontSize: '0.875rem' }}>&larr; Parent dashboard</Link>
      </div>
      <h1 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.75rem' }}>
        Subject choices
      </h1>
      <p style={{ marginTop: 4, opacity: 0.7 }}>
        Review and approve your child&apos;s subject choices. If anything looks off, ask them to review.
      </p>

      {pending.length > 0 && (
        <section style={panel}>
          <h2 style={h2}>Waiting for your approval</h2>
          {pending.map((c) => <ChoiceRow key={c.id} c={c} actionable />)}
        </section>
      )}

      {others.length > 0 && (
        <section style={panel}>
          <h2 style={h2}>History</h2>
          {others.map((c) => <ChoiceRow key={c.id} c={c} />)}
        </section>
      )}

      {choices.length === 0 && (
        <div style={panel}>
          <p style={{ margin: 0, opacity: 0.7 }}>No subject choices submitted yet. When your child submits choices, they&apos;ll appear here.</p>
        </div>
      )}
    </div>
  )
}

function ChoiceRow({ c, actionable }: { c: Choice; actionable?: boolean }) {
  const studentName = c.students ? `${c.students.first_name ?? ''} ${c.students.last_name ?? ''}`.trim() : 'Your child'
  return (
    <div style={row}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>
          {studentName} — {c.choice_rounds?.name ?? 'Choices'}
        </div>
        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
          {c.choice_rounds?.schools?.name ?? ''} · {c.choice_rounds?.year_group ?? ''} · {c.choice_rounds?.academic_year ?? ''}
          {c.submitted_at ? ` · Submitted ${new Date(c.submitted_at).toLocaleDateString('en-GB')}` : ''}
        </div>
        <div style={{ marginTop: 6 }}>
          <StatusPill status={c.status} />
        </div>
      </div>
      <div>
        {actionable ? (
          <Link href={`/parent/choices/${c.id}`} style={btnPrimary}>Review →</Link>
        ) : (
          <Link href={`/parent/choices/${c.id}`} style={btnGhost}>View</Link>
        )}
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: Choice['status'] }) {
  const m = {
    draft: { bg: '#e5e7eb', fg: '#374151', label: 'Draft' },
    submitted: { bg: '#dbeafe', fg: '#1e40af', label: 'Submitted' },
    parent_pending: { bg: '#fef3c7', fg: '#854d0e', label: 'Awaiting you' },
    confirmed: { bg: '#dcfce7', fg: '#166534', label: 'Confirmed' },
    rejected: { bg: '#fee2e2', fg: '#991b1b', label: 'Asked to review' },
    cancelled: { bg: '#e5e7eb', fg: '#374151', label: 'Cancelled' },
  }[status]
  return <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 999, backgroundColor: m.bg, color: m.fg, fontSize: '0.75rem', fontWeight: 600 }}>{m.label}</span>
}

const panel: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, backgroundColor: 'white', marginTop: 16 }
const h2: React.CSSProperties = { margin: '0 0 10px', fontSize: '1.1rem' }
const row: React.CSSProperties = { display: 'flex', gap: 12, alignItems: 'center', padding: '12px 8px', borderBottom: '1px solid #f3f4f6' }
const btnPrimary: React.CSSProperties = {
  padding: '8px 14px', backgroundColor: '#1B3A5C', color: 'white', border: 'none', borderRadius: '6px',
  cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', display: 'inline-block',
}
const btnGhost: React.CSSProperties = {
  padding: '6px 10px', backgroundColor: 'transparent', color: '#1B3A5C', border: '1px solid #cbd5e1', borderRadius: '6px',
  cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem', textDecoration: 'none', display: 'inline-block',
}
