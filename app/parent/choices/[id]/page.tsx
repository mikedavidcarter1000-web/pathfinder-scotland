'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/toast'

type Choice = {
  id: string
  round_id: string
  student_id: string
  status: 'draft' | 'submitted' | 'parent_pending' | 'confirmed' | 'rejected' | 'cancelled'
  submitted_at: string | null
  parent_approved_at: string | null
  parent_rejected_at: string | null
  parent_comment: string | null
  choice_rounds?: {
    id: string
    name: string
    academic_year: string
    year_group: string
    requires_parent_approval: boolean
    instructions: string | null
    schools?: { name: string; slug: string } | null
  } | null
  students?: { first_name: string; last_name: string } | null
}

type Item = {
  id: string
  column_id: string
  subject_id: string
  is_reserve: boolean
  reserve_order: number | null
  choice_round_columns?: { id: string; label: string; column_position: number } | null
  subjects?: { id: string; name: string } | null
}

export default function ParentChoiceDetailPage() {
  const params = useParams<{ id: string }>()
  const choiceId = params?.id as string
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const toast = useToast()

  const [choice, setChoice] = useState<Choice | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace(`/auth/sign-in?redirect=/parent/choices/${choiceId}`)
      return
    }
    if (!choiceId) return
    fetch(`/api/parent/choices/${choiceId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) {
          router.replace('/parent/choices')
          return
        }
        setChoice(d.choice)
        setItems(d.items ?? [])
      })
      .finally(() => setLoading(false))
  }, [authLoading, user, choiceId, router])

  async function approve() {
    if (!choice) return
    setBusy(true)
    const res = await fetch(`/api/parent/choices/${choice.id}/approve`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ comment: comment.trim() || undefined }),
    })
    setBusy(false)
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Could not approve.')
      return
    }
    setChoice({ ...choice, ...data.choice })
    toast.success('Choices approved.')
  }

  async function reject() {
    if (!choice) return
    if (!comment.trim()) {
      toast.error('Please add a comment explaining what your child should reconsider.')
      return
    }
    setBusy(true)
    const res = await fetch(`/api/parent/choices/${choice.id}/reject`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ comment: comment.trim() }),
    })
    setBusy(false)
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Could not send.')
      return
    }
    setChoice({ ...choice, ...data.choice })
    toast.success('Sent back to your child for review.')
  }

  if (loading) return <div className="pf-container pt-8 pb-12"><p>Loading…</p></div>
  if (!choice) return null

  const actionable = choice.status === 'parent_pending' || choice.status === 'submitted'
  const student = choice.students ? `${choice.students.first_name ?? ''} ${choice.students.last_name ?? ''}`.trim() : 'Your child'
  const sortedItems = [...items].sort((a, b) => (a.choice_round_columns?.column_position ?? 0) - (b.choice_round_columns?.column_position ?? 0))

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: '820px' }}>
      <div style={{ marginBottom: 16 }}>
        <Link href="/parent/choices" style={{ fontSize: '0.875rem' }}>&larr; All choices</Link>
      </div>
      <h1 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.5rem' }}>
        {student} — {choice.choice_rounds?.name ?? 'Choices'}
      </h1>
      <p style={{ marginTop: 4, opacity: 0.7 }}>
        {choice.choice_rounds?.schools?.name ?? ''} · {choice.choice_rounds?.year_group ?? ''} · {choice.choice_rounds?.academic_year ?? ''}
      </p>

      {choice.choice_rounds?.instructions && (
        <div style={bannerInfo}>
          <strong>School instructions:</strong> {choice.choice_rounds.instructions}
        </div>
      )}

      <section style={panel}>
        <h2 style={h2}>Your child&apos;s choices</h2>
        {sortedItems.length === 0 ? (
          <p style={{ opacity: 0.7, margin: 0 }}>No picks recorded.</p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {sortedItems.map((it) => (
              <li key={it.id} style={row}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>
                    {it.choice_round_columns?.label ?? `Column ${it.choice_round_columns?.column_position ?? ''}`}
                  </div>
                  <div style={{ fontSize: '0.9rem' }}>
                    {it.subjects?.name ?? '—'}
                    {it.is_reserve && <span style={{ marginLeft: 6, fontSize: '0.75rem', color: '#b45309' }}>(reserve{it.reserve_order ? ` ${it.reserve_order}` : ''})</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {actionable ? (
        <section style={panel}>
          <h2 style={h2}>Approve or ask for a review</h2>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Optional note for your child</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ minHeight: 80, padding: 8, border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.9rem', resize: 'vertical' }}
              placeholder="Anything you'd like them to reconsider? A note is required if you're sending it back."
            />
          </label>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button style={btnDanger} onClick={reject} disabled={busy}>Send back to child</button>
            <button style={btnPrimary} onClick={approve} disabled={busy}>Approve choices</button>
          </div>
        </section>
      ) : (
        <section style={panel}>
          <h2 style={h2}>Status</h2>
          <p style={{ margin: 0 }}>
            {choice.status === 'confirmed' && (
              <>Approved on <strong>{choice.parent_approved_at ? new Date(choice.parent_approved_at).toLocaleDateString('en-GB') : ''}</strong>.</>
            )}
            {choice.status === 'rejected' && (
              <>Sent back for review on <strong>{choice.parent_rejected_at ? new Date(choice.parent_rejected_at).toLocaleDateString('en-GB') : ''}</strong>.</>
            )}
            {choice.parent_comment && (
              <><br /><em>Your note: &ldquo;{choice.parent_comment}&rdquo;</em></>
            )}
          </p>
        </section>
      )}
    </div>
  )
}

const panel: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, backgroundColor: 'white', marginTop: 16 }
const h2: React.CSSProperties = { margin: '0 0 10px', fontSize: '1.05rem' }
const row: React.CSSProperties = { display: 'flex', gap: 12, alignItems: 'center', padding: '10px 4px', borderBottom: '1px solid #f3f4f6' }
const bannerInfo: React.CSSProperties = { margin: '12px 0 0', padding: '10px 12px', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: 6, fontSize: '0.875rem' }
const btnPrimary: React.CSSProperties = {
  padding: '10px 14px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px',
  cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
}
const btnDanger: React.CSSProperties = {
  padding: '10px 14px', backgroundColor: 'transparent', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px',
  cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
}
