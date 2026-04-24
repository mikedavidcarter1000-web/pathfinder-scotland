'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

type Concern = {
  id: string
  student_id: string
  concern_type: string
  description: string
  escalation_level: string
  created_at: string
  resolved_at: string | null
  students: { first_name: string | null; last_name: string | null; school_stage: string | null } | null
  reporter: { full_name: string; role: string } | null
}

export default function SafeguardingLogPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [concerns, setConcerns] = useState<Concern[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('active')
  const [search, setSearch] = useState('')
  const [permErr, setPermErr] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/sign-in?redirect=/school/guidance/safeguarding')
      return
    }
    fetch('/api/school/guidance/safeguarding')
      .then(async (r) => {
        if (r.status === 403) {
          setPermErr(true)
          return { concerns: [] }
        }
        return r.ok ? r.json() : { concerns: [] }
      })
      .then((d) => setConcerns(d.concerns ?? []))
      .finally(() => setLoading(false))
  }, [authLoading, user, router])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return concerns
      .filter((c) => {
        if (filter === 'active' && c.resolved_at) return false
        if (filter === 'resolved' && !c.resolved_at) return false
        if (!q) return true
        const name = `${c.students?.first_name ?? ''} ${c.students?.last_name ?? ''}`.toLowerCase()
        return name.includes(q) || c.concern_type.toLowerCase().includes(q)
      })
  }, [concerns, filter, search])

  const stats = useMemo(() => {
    const total = concerns.length
    const active = concerns.filter((c) => !c.resolved_at).length
    const awaiting = concerns.filter((c) => c.escalation_level !== 'concern' && !c.resolved_at).length
    const external = concerns.filter((c) => c.escalation_level === 'referral_social_work' || c.escalation_level === 'referral_police').length
    const monthStart = new Date()
    monthStart.setDate(1)
    const monthResolved = concerns.filter((c) => c.resolved_at && new Date(c.resolved_at) >= monthStart).length
    return { total, active, awaiting, external, monthResolved }
  }, [concerns])

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>
  if (permErr) {
    return (
      <div style={{ padding: 32 }}>
        <h1>Access denied</h1>
        <p>Safeguarding records are only visible to staff with can_view_safeguarding permission enabled.</p>
        <Link href="/school/guidance" style={{ color: '#0059b3' }}>&larr; Back to Guidance Hub</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <Link href="/school/guidance" style={{ color: '#0059b3', fontSize: 14 }}>
        &larr; Back to Guidance Hub
      </Link>
      <h1 style={{ fontSize: 26, margin: '8px 0 4px 0' }}>Safeguarding &amp; Child Protection</h1>
      <p style={{ color: '#666', margin: '0 0 20px 0', fontSize: 13 }}>
        All access to records is logged. Records are append-only &mdash; corrections create a new entry with a reference back to the superseded record.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        <Stat label="Active concerns" value={stats.active} warn={stats.active > 0} />
        <Stat label="Awaiting escalation" value={stats.awaiting} warn={stats.awaiting > 0} />
        <Stat label="Referred externally" value={stats.external} />
        <Stat label="Resolved this month" value={stats.monthResolved} />
        <Stat label="Total on record" value={stats.total} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} style={selectStyle}>
          <option value="active">Active only</option>
          <option value="resolved">Resolved</option>
          <option value="all">All records</option>
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or type..."
          style={{ ...selectStyle, flex: '1 1 200px' }}
        />
      </div>

      <div style={{ border: '1px solid #e5e5e5', borderRadius: 6, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f7f7f7' }}>
              <th style={th}>Student</th>
              <th style={th}>Date</th>
              <th style={th}>Type</th>
              <th style={th}>Escalation</th>
              <th style={th}>Status</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#666' }}>
                  No records match the filter.
                </td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id} style={{ borderTop: '1px solid #eee' }}>
                <td style={td}>
                  <Link href={`/school/guidance/${c.student_id}?tab=safeguarding`} style={{ color: '#0059b3' }}>
                    {c.students?.first_name} {c.students?.last_name}
                  </Link>
                  <div style={{ fontSize: 11, color: '#666' }}>{c.students?.school_stage ?? '-'}</div>
                </td>
                <td style={td}>{new Date(c.created_at).toLocaleDateString('en-GB')}</td>
                <td style={td}>{c.concern_type}</td>
                <td style={td}>{c.escalation_level}</td>
                <td style={td}>{c.resolved_at ? 'Resolved' : 'Active'}</td>
                <td style={td}>
                  <Link href={`/school/guidance/safeguarding/${c.id}`} style={{ color: '#0059b3' }}>
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Stat({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div style={{ padding: 12, border: '1px solid #e5e5e5', borderRadius: 6, background: warn ? '#fef2f2' : '#fff' }}>
      <div style={{ fontSize: 12, color: '#666' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color: warn ? '#991b1b' : '#111' }}>{value}</div>
    </div>
  )
}

const th: React.CSSProperties = { padding: '8px 10px', textAlign: 'left', fontWeight: 600 }
const td: React.CSSProperties = { padding: '8px 10px', verticalAlign: 'top' }
const selectStyle: React.CSSProperties = { padding: '6px 10px', border: '1px solid #d0d0d0', borderRadius: 4, fontSize: 14 }
