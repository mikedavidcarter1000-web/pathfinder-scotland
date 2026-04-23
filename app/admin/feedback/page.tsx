'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

interface FeedbackRow {
  id: string
  page_path: string
  is_helpful: boolean
  comment: string | null
  created_at: string
  user_email: string | null
}

interface PageStat {
  page_path: string
  total: number
  helpful: number
  unhelpful: number
  rate: number
}

type SortField = 'created_at' | 'page_path' | 'is_helpful'
type SortDir = 'asc' | 'desc'

export default function AdminFeedbackPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [rows, setRows] = useState<FeedbackRow[]>([])
  const [stats, setStats] = useState<{
    total: number
    helpful: number
    rate: number
    worstPages: PageStat[]
    topPages: PageStat[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filterPath, setFilterPath] = useState('')
  const [filterHelpful, setFilterHelpful] = useState<'all' | 'yes' | 'no'>('all')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 50

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        path: filterPath,
        helpful: filterHelpful,
        sortField,
        sortDir,
        offset: String(page * PAGE_SIZE),
        limit: String(PAGE_SIZE),
      })
      const res = await fetch(`/api/admin/feedback?${params}`)
      if (!res.ok) throw new Error('Failed to load feedback')
      const data = await res.json() as { rows: FeedbackRow[]; stats: typeof stats }
      setRows(data.rows)
      setStats(data.stats)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
    setLoading(false)
  }, [filterPath, filterHelpful, sortField, sortDir, page])

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/sign-in?redirect=/admin/feedback')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      void load()
    }
  }, [user, load])

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
    setPage(0)
  }

  if (isLoading) return null

  return (
    <div style={{ backgroundColor: 'var(--pf-grey-50)', minHeight: '100vh' }}>
      <div className="pf-container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Link href="/admin/offers" style={{ color: 'var(--pf-blue-600)', fontSize: '0.875rem', textDecoration: 'none' }}>
            ← Admin
          </Link>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--pf-grey-900)', marginBottom: '32px' }}>
          Feedback
        </h1>

        {error && (
          <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', borderRadius: '8px', color: '#b91c1c', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {/* Stats cards */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <StatCard label="Total responses" value={String(stats.total)} />
            <StatCard label="Helpful" value={String(stats.helpful)} />
            <StatCard label="Helpful rate" value={`${stats.rate.toFixed(0)}%`} />
          </div>
        )}

        {/* Best / Worst tables */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            <PageStatTable title="Most helpful pages" rows={stats.topPages} />
            <PageStatTable title="Least helpful pages" rows={stats.worstPages} />
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Filter by path…"
            value={filterPath}
            onChange={(e) => { setFilterPath(e.target.value); setPage(0) }}
            style={{
              padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--pf-grey-300)',
              fontSize: '0.875rem', fontFamily: 'inherit', minWidth: '200px',
            }}
          />
          <select
            value={filterHelpful}
            onChange={(e) => { setFilterHelpful(e.target.value as 'all' | 'yes' | 'no'); setPage(0) }}
            style={{
              padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--pf-grey-300)',
              fontSize: '0.875rem', fontFamily: 'inherit',
            }}
          >
            <option value="all">All</option>
            <option value="yes">Helpful only</option>
            <option value="no">Unhelpful only</option>
          </select>
          <button
            onClick={() => void load()}
            style={{
              padding: '8px 16px', borderRadius: '6px', border: 'none',
              backgroundColor: 'var(--pf-blue-600)', color: '#fff',
              fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Apply
          </button>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: '#fff', border: '1px solid var(--pf-grey-200)', borderRadius: '10px', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--pf-grey-500)' }}>Loading…</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--pf-grey-50)', borderBottom: '1px solid var(--pf-grey-200)' }}>
                  <Th onClick={() => toggleSort('created_at')} sorted={sortField === 'created_at'} dir={sortDir}>Date</Th>
                  <Th onClick={() => toggleSort('page_path')} sorted={sortField === 'page_path'} dir={sortDir}>Page</Th>
                  <Th onClick={() => toggleSort('is_helpful')} sorted={sortField === 'is_helpful'} dir={sortDir}>Helpful?</Th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--pf-grey-600)', fontWeight: 600 }}>Comment</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--pf-grey-600)', fontWeight: 600 }}>User</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--pf-grey-500)' }}>
                      No results
                    </td>
                  </tr>
                ) : rows.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid var(--pf-grey-100)' }}>
                    <td style={{ padding: '10px 16px', color: 'var(--pf-grey-600)', whiteSpace: 'nowrap' }}>
                      {new Date(row.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                      {row.page_path}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
                        fontSize: '0.75rem', fontWeight: 600,
                        backgroundColor: row.is_helpful ? '#dcfce7' : '#fee2e2',
                        color: row.is_helpful ? '#15803d' : '#b91c1c',
                      }}>
                        {row.is_helpful ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--pf-grey-700)', maxWidth: '300px' }}>
                      {row.comment ?? <span style={{ color: 'var(--pf-grey-400)' }}>—</span>}
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--pf-grey-500)', fontSize: '0.8125rem' }}>
                      {row.user_email ?? <span style={{ color: 'var(--pf-grey-400)' }}>anon</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--pf-grey-300)',
              backgroundColor: '#fff', fontSize: '0.875rem', cursor: page === 0 ? 'default' : 'pointer',
              fontFamily: 'inherit', opacity: page === 0 ? 0.4 : 1,
            }}
          >
            Previous
          </button>
          <span style={{ padding: '6px 12px', fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
            Page {page + 1}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={rows.length < PAGE_SIZE}
            style={{
              padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--pf-grey-300)',
              backgroundColor: '#fff', fontSize: '0.875rem', cursor: rows.length < PAGE_SIZE ? 'default' : 'pointer',
              fontFamily: 'inherit', opacity: rows.length < PAGE_SIZE ? 0.4 : 1,
            }}
          >
            Next
          </button>
        </div>

      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid var(--pf-grey-200)', borderRadius: '10px', padding: '20px 24px' }}>
      <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-500)', marginBottom: '4px' }}>{label}</p>
      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--pf-grey-900)' }}>{value}</p>
    </div>
  )
}

function PageStatTable({ title, rows }: { title: string; rows: PageStat[] }) {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid var(--pf-grey-200)', borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--pf-grey-100)' }}>
        <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--pf-grey-800)' }}>{title}</p>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--pf-grey-50)' }}>
            <th style={{ padding: '8px 16px', textAlign: 'left', color: 'var(--pf-grey-600)', fontWeight: 600 }}>Page</th>
            <th style={{ padding: '8px 16px', textAlign: 'right', color: 'var(--pf-grey-600)', fontWeight: 600 }}>Responses</th>
            <th style={{ padding: '8px 16px', textAlign: 'right', color: 'var(--pf-grey-600)', fontWeight: 600 }}>Helpful</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ padding: '16px', textAlign: 'center', color: 'var(--pf-grey-400)' }}>No data</td>
            </tr>
          ) : rows.map((r) => (
            <tr key={r.page_path} style={{ borderTop: '1px solid var(--pf-grey-100)' }}>
              <td style={{ padding: '8px 16px', fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.page_path}</td>
              <td style={{ padding: '8px 16px', textAlign: 'right' }}>{r.total}</td>
              <td style={{ padding: '8px 16px', textAlign: 'right' }}>{r.rate.toFixed(0)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Th({
  children, onClick, sorted, dir,
}: {
  children: React.ReactNode
  onClick: () => void
  sorted: boolean
  dir: SortDir
}) {
  return (
    <th
      onClick={onClick}
      style={{
        padding: '10px 16px', textAlign: 'left', color: 'var(--pf-grey-600)', fontWeight: 600,
        cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
      }}
    >
      {children}
      {sorted && <span style={{ marginLeft: '4px' }}>{dir === 'asc' ? '↑' : '↓'}</span>}
    </th>
  )
}
