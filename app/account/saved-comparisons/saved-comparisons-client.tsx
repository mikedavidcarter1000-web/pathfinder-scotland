'use client'

import { useState } from 'react'
import Link from 'next/link'

export interface SavedComparisonRow {
  id: string
  name: string
  created_at: string
  role_ids: string[]
  role_titles: string[]
}

export interface SavedComparisonsClientProps {
  initial: SavedComparisonRow[]
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function buildHref(roleIds: string[]): string {
  return `/careers/compare?t=${encodeURIComponent(roleIds.join(','))}`
}

export function SavedComparisonsClient({ initial }: SavedComparisonsClientProps) {
  const [rows, setRows] = useState<SavedComparisonRow[]>(initial)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Delete this saved comparison?')) return
    setDeletingId(id)
    setError(null)
    try {
      const res = await fetch(`/api/saved-comparisons/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        setError(payload?.error ?? 'Failed to delete')
        return
      }
      setRows((prev) => prev.filter((r) => r.id !== id))
    } catch {
      setError('Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  if (rows.length === 0) {
    return (
      <div
        style={{
          padding: '24px',
          border: '1px dashed var(--pf-grey-300)',
          borderRadius: '12px',
          background: 'var(--pf-white)',
          color: 'var(--pf-grey-600)',
          fontSize: '0.9375rem',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: '0 0 10px' }}>You haven&rsquo;t saved any comparisons yet.</p>
        <Link
          href="/careers/compare"
          style={{
            color: 'var(--pf-blue-700)',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Start comparing careers →
        </Link>
      </div>
    )
  }

  return (
    <div>
      {error ? (
        <p
          role="alert"
          style={{
            color: 'var(--pf-red-500)',
            fontSize: '0.875rem',
            marginBottom: '12px',
          }}
        >
          {error}
        </p>
      ) : null}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {rows.map((row) => (
          <li
            key={row.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '16px 18px',
              background: 'var(--pf-white)',
              border: '1px solid var(--pf-grey-200)',
              borderRadius: '12px',
              marginBottom: '10px',
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: 'var(--pf-grey-900)',
                  margin: '0 0 4px',
                }}
              >
                {row.name}
              </p>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--pf-grey-600)',
                  margin: '0 0 4px',
                }}
              >
                {row.role_titles.join(' · ')}
              </p>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--pf-grey-600)',
                  margin: 0,
                }}
              >
                Saved {formatDate(row.created_at)}
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                flexShrink: 0,
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <Link
                href={buildHref(row.role_ids)}
                className="no-underline hover:no-underline"
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  background: 'var(--pf-blue-700)',
                  color: 'var(--pf-white)',
                }}
              >
                Open
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(row.id)}
                disabled={deletingId === row.id}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  background: 'var(--pf-white)',
                  color: 'var(--pf-red-500)',
                  border: '1px solid var(--pf-grey-300)',
                  cursor: deletingId === row.id ? 'not-allowed' : 'pointer',
                }}
              >
                {deletingId === row.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
