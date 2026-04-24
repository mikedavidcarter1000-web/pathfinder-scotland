'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/toast'
import type { DashboardMe } from '@/components/school-dashboard/types'

type ExistingRound = {
  id: string
  name: string
  academic_year: string
  year_group: string
}

function currentAcademicYear(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const start = m >= 7 ? y : y - 1
  return `${start}/${start + 1}`
}

export default function NewChoiceRoundPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const toast = useToast()

  const [me, setMe] = useState<DashboardMe | null>(null)
  const [existing, setExisting] = useState<ExistingRound[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [academicYear, setAcademicYear] = useState(currentAcademicYear())
  const [yearGroup, setYearGroup] = useState('S3')
  const [transition, setTransition] = useState<string>('s3_to_s4')
  const [opensAt, setOpensAt] = useState('')
  const [closesAt, setClosesAt] = useState('')
  const [requiresParent, setRequiresParent] = useState(false)
  const [instructions, setInstructions] = useState('')
  const [copyFromId, setCopyFromId] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/sign-in?redirect=/school/choices/new')
      return
    }
    Promise.all([
      fetch('/api/school/me').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/school/choices/rounds').then((r) => (r.ok ? r.json() : { rounds: [] })),
    ])
      .then(([m, r]) => {
        if (!m) {
          router.replace('/school/register')
          return
        }
        setMe(m)
        setExisting(r.rounds ?? [])
      })
      .finally(() => setLoading(false))
  }, [authLoading, user, router])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    const res = await fetch('/api/school/choices/rounds', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        academic_year: academicYear.trim(),
        year_group: yearGroup.trim(),
        transition: transition || null,
        opens_at: opensAt || null,
        closes_at: closesAt || null,
        requires_parent_approval: requiresParent,
        instructions: instructions.trim() || null,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setSaving(false)
      toast.error(data.error ?? 'Could not create round.')
      return
    }
    // Optionally copy structure.
    if (copyFromId) {
      const copyRes = await fetch(`/api/school/choices/rounds/${data.round.id}/copy-from`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ source_round_id: copyFromId }),
      })
      if (!copyRes.ok) {
        const copyData = await copyRes.json()
        toast.error(copyData.error ?? 'Could not copy structure; round was created without columns.')
      } else {
        toast.success('Round created and structure copied.')
      }
    } else {
      toast.success('Round created.')
    }
    router.push(`/school/choices/${data.round.id}/setup`)
  }

  if (loading) return <div className="pf-container pt-8 pb-12"><p>Loading…</p></div>
  if (!me) return null

  const canManage = !!me.staff.canManageTracking || !!me.staff.isAdmin
  if (!canManage) {
    return (
      <div className="pf-container pt-8 pb-12">
        <p>You do not have permission to create choice rounds. Ask a school admin or tracking manager.</p>
      </div>
    )
  }

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Link href="/school/choices" style={{ fontSize: '0.875rem' }}>&larr; Subject choices</Link>
      </div>
      <h1 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.5rem' }}>
        New choice round
      </h1>
      <p style={{ marginTop: 4, opacity: 0.7 }}>
        Start by naming the round and setting dates. You&apos;ll build the column structure next.
      </p>

      <form onSubmit={submit} style={form}>
        <label style={labelStyle}>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="S3 into S4 Choices (2026/27)" style={inputStyle} required />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label style={labelStyle}>
            Academic year
            <input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} style={inputStyle} required />
          </label>
          <label style={labelStyle}>
            Year group
            <select value={yearGroup} onChange={(e) => setYearGroup(e.target.value)} style={inputStyle}>
              <option value="S2">S2</option>
              <option value="S3">S3</option>
              <option value="S4">S4</option>
              <option value="S5">S5</option>
              <option value="S6">S6</option>
            </select>
          </label>
        </div>

        <label style={labelStyle}>
          Transition (optional)
          <select value={transition} onChange={(e) => setTransition(e.target.value)} style={inputStyle}>
            <option value="">—</option>
            <option value="s2_to_s3">S2 → S3</option>
            <option value="s3_to_s4">S3 → S4 (SCQF 5)</option>
            <option value="s4_to_s5">S4 → S5 (Higher)</option>
            <option value="s5_to_s6">S5 → S6 (Higher / Advanced Higher)</option>
          </select>
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label style={labelStyle}>
            Opens on
            <input type="date" value={opensAt} onChange={(e) => setOpensAt(e.target.value)} style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Closes on
            <input type="date" value={closesAt} onChange={(e) => setClosesAt(e.target.value)} style={inputStyle} />
          </label>
        </div>

        <label style={{ ...labelStyle, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={requiresParent} onChange={(e) => setRequiresParent(e.target.checked)} />
          Require parent approval before choices are confirmed
        </label>

        <label style={labelStyle}>
          Instructions for students (optional)
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            placeholder="Any notes students should read before choosing — e.g. 'Pick one subject from each column. Compulsory columns are pre-selected.'"
          />
        </label>

        {existing.length > 0 && (
          <label style={labelStyle}>
            Copy column structure from
            <select value={copyFromId} onChange={(e) => setCopyFromId(e.target.value)} style={inputStyle}>
              <option value="">— Start with empty structure —</option>
              {existing.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.year_group}, {r.academic_year})
                </option>
              ))}
            </select>
          </label>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <Link href="/school/choices" style={btnGhost}>Cancel</Link>
          <button type="submit" disabled={saving} style={btnPrimary}>
            {saving ? 'Creating…' : 'Create and build columns'}
          </button>
        </div>
      </form>
    </div>
  )
}

const form: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px',
  padding: '20px', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: 'white',
}
const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }
const inputStyle: React.CSSProperties = { padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }
const btnPrimary: React.CSSProperties = {
  padding: '8px 14px', backgroundColor: '#1B3A5C', color: 'white', border: 'none', borderRadius: '6px',
  cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
}
const btnGhost: React.CSSProperties = {
  padding: '8px 14px', backgroundColor: 'transparent', color: '#1B3A5C', border: '1px solid #cbd5e1', borderRadius: '6px',
  cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', display: 'inline-block',
}
