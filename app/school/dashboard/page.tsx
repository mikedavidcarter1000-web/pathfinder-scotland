'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { TrialBanner } from '@/components/school-dashboard/trial-banner'
import { OverviewTab } from '@/components/school-dashboard/overview-tab'
import { SubjectsTab } from '@/components/school-dashboard/subjects-tab'
import { StudentsTab } from '@/components/school-dashboard/students-tab'
import { BenchmarkingTab } from '@/components/school-dashboard/benchmarking-tab'
import { ReportsTab } from '@/components/school-dashboard/reports-tab'
import { TrackingTab } from '@/components/school-dashboard/tracking-tab'
import type { DashboardMe } from '@/components/school-dashboard/types'

type TabKey = 'overview' | 'tracking' | 'subjects' | 'students' | 'benchmarking' | 'reports'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'tracking', label: 'Tracking' },
  { key: 'subjects', label: 'Subject choices' },
  { key: 'students', label: 'Students' },
  { key: 'benchmarking', label: 'Benchmarking' },
  { key: 'reports', label: 'Reports' },
]

export default function SchoolDashboardPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [me, setMe] = useState<DashboardMe | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>('overview')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/sign-in?redirect=/school/dashboard')
      return
    }
    fetch('/api/school/me')
      .then((r) => {
        if (r.status === 403) {
          router.replace('/school/register')
          return null
        }
        return r.json()
      })
      .then((d) => {
        if (d) setMe(d)
      })
      .finally(() => setLoading(false))
  }, [authLoading, user, router])

  if (loading || authLoading) {
    return (
      <div className="pf-container pt-8 pb-12">
        <p>Loading dashboard…</p>
      </div>
    )
  }
  if (!me || !me.school) return null

  const expired = me.school.subscription_status === 'expired'

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: '1200px' }}>
      <HeaderBar me={me} />
      <TrialBanner me={me} />

      {expired && (
        <div style={expiredOverlay}>
          <div style={expiredCard}>
            <h3 style={{ margin: 0 }}>Your trial has expired</h3>
            <p>Dashboard access is paused. Your data is preserved.</p>
            <Link href="/school/subscribe" style={{ fontWeight: 700 }}>Subscribe to restore access &rarr;</Link>
          </div>
        </div>
      )}

      {me.staff.canViewIndividualStudents && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '0 0 12px 0', fontSize: 14 }}>
          <Link href="/school/guidance" style={quickLink}>Guidance Hub &rarr;</Link>
          {me.staff.canViewSafeguarding && (
            <Link href="/school/guidance/safeguarding" style={quickLink}>Safeguarding log &rarr;</Link>
          )}
          <Link href="/school/guidance/wellbeing" style={quickLink}>Wellbeing surveys &rarr;</Link>
        </div>
      )}

      <div style={tabStrip} role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{ ...tabBtn, ...(tab === t.key ? tabActive : {}) }}
            aria-current={tab === t.key ? 'page' : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: '20px', opacity: expired ? 0.4 : 1, pointerEvents: expired ? 'none' : 'auto' }}>
        {tab === 'overview' && <OverviewTab />}
        {tab === 'tracking' && <TrackingTab />}
        {tab === 'subjects' && <SubjectsTab />}
        {tab === 'students' && <StudentsTab canView={me.staff.canViewIndividualStudents} />}
        {tab === 'benchmarking' && <BenchmarkingTab />}
        {tab === 'reports' && <ReportsTab me={me} />}
      </div>
    </div>
  )
}

function HeaderBar({ me }: { me: DashboardMe }) {
  if (!me.school) return null
  return (
    <div style={headerCard}>
      <div>
        <h1 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.5rem' }}>
          {me.school.name}
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '0.875rem', opacity: 0.7 }}>
          {me.school.local_authority || 'Local authority unset'} · {me.linkedStudents} student{me.linkedStudents === 1 ? '' : 's'} linked
        </p>
      </div>
      <div style={joinCodeCard}>
        <span style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>School join code</span>
        <span style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.1em' }}>
          {me.joinCode?.code ?? '—'}
        </span>
        <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Share with your students</span>
      </div>
    </div>
  )
}

const headerCard: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '16px',
  marginBottom: '16px',
  flexWrap: 'wrap',
}
const joinCodeCard: React.CSSProperties = {
  padding: '10px 16px',
  border: '1px solid var(--pf-blue-200, #BFDBFE)',
  borderRadius: '8px',
  backgroundColor: 'var(--pf-blue-50, #EFF6FF)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '2px',
}
const tabStrip: React.CSSProperties = {
  display: 'flex',
  gap: '4px',
  borderBottom: '2px solid var(--pf-grey-200)',
  overflowX: 'auto',
}
const tabBtn: React.CSSProperties = {
  padding: '10px 14px',
  border: 'none',
  borderBottom: '2px solid transparent',
  marginBottom: '-2px',
  background: 'transparent',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.9375rem',
  color: 'var(--pf-grey-700)',
  whiteSpace: 'nowrap',
}
const tabActive: React.CSSProperties = {
  borderBottomColor: 'var(--pf-blue-700, #1D4ED8)',
  color: 'var(--pf-blue-700, #1D4ED8)',
}
const quickLink: React.CSSProperties = {
  padding: '6px 12px',
  background: 'var(--pf-blue-50, #EFF6FF)',
  color: 'var(--pf-blue-700, #1D4ED8)',
  textDecoration: 'none',
  borderRadius: 4,
  fontWeight: 500,
  border: '1px solid var(--pf-blue-200, #BFDBFE)',
}
const expiredOverlay: React.CSSProperties = {
  position: 'relative',
  backgroundColor: '#FEE2E2',
  border: '2px solid #DC2626',
  borderRadius: '8px',
  padding: '24px',
  marginBottom: '16px',
  textAlign: 'center',
}
const expiredCard: React.CSSProperties = {
  maxWidth: '500px',
  margin: '0 auto',
}
