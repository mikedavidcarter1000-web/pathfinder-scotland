'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/toast'
import type { DashboardMe } from '@/components/school-dashboard/types'

type Round = {
  id: string
  name: string
  academic_year: string
  year_group: string
  transition: string | null
  status: 'draft' | 'open' | 'closed' | 'finalised'
  opens_at: string | null
  closes_at: string | null
  requires_parent_approval: boolean
  created_at: string
}

export default function SchoolChoicesPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const toast = useToast()

  const [me, setMe] = useState<DashboardMe | null>(null)
  const [rounds, setRounds] = useState<Round[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/sign-in?redirect=/school/choices')
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
        setRounds(r.rounds ?? [])
      })
      .finally(() => setLoading(false))
  }, [authLoading, user, router])

  const canManage = !!me?.staff.canManageTracking || !!me?.staff.isAdmin

  async function changeStatus(id: string, status: Round['status']) {
    const res = await fetch(`/api/school/choices/rounds/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      const data = await res.json()
      toast.error(data.error ?? 'Could not update round.')
      return
    }
    const data = await res.json()
    setRounds((prev) => prev.map((r) => (r.id === id ? data.round : r)))
    toast.success(`Round marked as ${status}.`)
  }

  async function deleteRound(id: string) {
    if (!confirm('Delete this round? All submitted choices will be lost.')) return
    const res = await fetch(`/api/school/choices/rounds/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      toast.error(data.error ?? 'Could not delete.')
      return
    }
    setRounds((prev) => prev.filter((r) => r.id !== id))
    toast.success('Round deleted.')
  }

  if (loading) return <div className="pf-container pt-8 pb-12"><p>Loading choices…</p></div>
  if (!me) return null

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Link href="/school/dashboard" style={{ fontSize: '0.875rem' }}>&larr; Dashboard</Link>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.75rem' }}>
            Subject choices
          </h1>
          <p style={{ marginTop: 4, opacity: 0.7 }}>
            Column-based subject choice rounds. Students pick within columns; you see demand as they submit.
          </p>
        </div>
        {canManage && (
          <Link href="/school/choices/new" style={btnPrimary}>+ New round</Link>
        )}
      </div>

      <section style={panel}>
        {rounds.length === 0 ? (
          <p style={{ opacity: 0.7, margin: 0 }}>
            No rounds yet. {canManage ? 'Create one to start collecting choices.' : 'An admin will create rounds for year-group choices (S2→S3, S3→S4, etc.).'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={th}>Round</th>
                  <th style={th}>Year / Academic year</th>
                  <th style={th}>Status</th>
                  <th style={th}>Window</th>
                  <th style={th}>Parent approval</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {rounds.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={td}><strong>{r.name}</strong></td>
                    <td style={td}>
                      {r.year_group} &middot; {r.academic_year}
                    </td>
                    <td style={td}>
                      <StatusPill status={r.status} />
                    </td>
                    <td style={td}>
                      {r.opens_at ? new Date(r.opens_at).toLocaleDateString('en-GB') : '—'}
                      {' → '}
                      {r.closes_at ? new Date(r.closes_at).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td style={td}>{r.requires_parent_approval ? 'Required' : 'No'}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      <Link href={`/school/choices/${r.id}/setup`} style={btnGhost}>Setup</Link>
                      <Link href={`/school/choices/${r.id}/demand`} style={btnGhost}>Demand</Link>
                      {canManage && r.status === 'draft' && (
                        <button style={btnGhost} onClick={() => changeStatus(r.id, 'open')}>Open</button>
                      )}
                      {canManage && r.status === 'open' && (
                        <button style={btnGhost} onClick={() => changeStatus(r.id, 'closed')}>Close</button>
                      )}
                      {canManage && r.status === 'closed' && (
                        <button style={btnGhost} onClick={() => changeStatus(r.id, 'finalised')}>Finalise</button>
                      )}
                      <a
                        href={`/api/school/choices/export?roundId=${r.id}`}
                        style={btnGhost}
                      >
                        Export CSV
                      </a>
                      {canManage && me.staff.isAdmin && (
                        <button style={btnDanger} onClick={() => deleteRound(r.id)}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function StatusPill({ status }: { status: Round['status'] }) {
  const map = {
    draft: { bg: '#e5e7eb', fg: '#374151', label: 'Draft' },
    open: { bg: '#dcfce7', fg: '#166534', label: 'Open' },
    closed: { bg: '#fef3c7', fg: '#854d0e', label: 'Closed' },
    finalised: { bg: '#dbeafe', fg: '#1e40af', label: 'Finalised' },
  }
  const s = map[status]
  return <span style={pill(s.bg, s.fg)}>{s.label}</span>
}

const panel: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  padding: '16px',
  backgroundColor: 'white',
  marginTop: '16px',
}
const th: React.CSSProperties = { padding: '8px 10px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#6b7280' }
const td: React.CSSProperties = { padding: '10px', verticalAlign: 'middle' }
function pill(bg: string, fg: string): React.CSSProperties {
  return { display: 'inline-block', padding: '2px 8px', borderRadius: '999px', backgroundColor: bg, color: fg, fontSize: '0.75rem', fontWeight: 600 }
}
const btnPrimary: React.CSSProperties = {
  padding: '8px 14px', backgroundColor: '#1B3A5C', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer',
  fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', display: 'inline-block',
}
const btnGhost: React.CSSProperties = {
  padding: '6px 10px', backgroundColor: 'transparent', color: '#1B3A5C', border: '1px solid #cbd5e1', borderRadius: '6px',
  cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem', marginRight: 4, textDecoration: 'none', display: 'inline-block',
}
const btnDanger: React.CSSProperties = {
  padding: '6px 10px', backgroundColor: 'transparent', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px',
  cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem', marginRight: 4, textDecoration: 'none', display: 'inline-block',
}
