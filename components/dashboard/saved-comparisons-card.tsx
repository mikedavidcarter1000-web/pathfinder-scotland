'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { Skeleton } from '@/components/ui/loading-skeleton'

interface SavedComparison {
  id: string
  name: string
  role_ids: string[]
  created_at: string
}

export function SavedComparisonsCard() {
  const { user } = useAuth()
  const supabase = getSupabaseClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-saved-comparisons', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<SavedComparison[]> => {
      const { data, error } = await supabase
        .from('saved_comparisons')
        .select('id, name, role_ids, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
      if (error) throw error
      return (data ?? []) as SavedComparison[]
    },
    staleTime: 2 * 60 * 1000,
  })

  const allRoleIds = useMemo(() => {
    const set = new Set<string>()
    for (const row of data ?? []) for (const id of row.role_ids) set.add(id)
    return Array.from(set)
  }, [data])

  const { data: titles } = useQuery({
    queryKey: ['dashboard-saved-comparisons-titles', allRoleIds.slice().sort().join(',')],
    enabled: allRoleIds.length > 0,
    queryFn: async (): Promise<Map<string, string>> => {
      const { data, error } = await supabase
        .from('career_roles')
        .select('id, title')
        .in('id', allRoleIds)
      if (error) throw error
      return new Map((data ?? []).map((r) => [r.id, r.title]))
    },
    staleTime: 10 * 60 * 1000,
  })

  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Delete this saved comparison?')) return
    setPendingDelete(id)
    try {
      const res = await fetch(`/api/saved-comparisons/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        await refetch()
      }
    } finally {
      setPendingDelete(null)
    }
  }

  if (isLoading) {
    return (
      <div className="pf-card">
        <Skeleton width="180px" height={20} rounded="md" />
        <div style={{ height: '12px' }} />
        <Skeleton width="100%" height={48} rounded="md" />
      </div>
    )
  }

  const rows = data ?? []

  return (
    <div className="pf-card">
      <div className="flex items-center justify-between mb-3">
        <h2 style={{ margin: 0, fontSize: '1.125rem' }}>Saved comparisons</h2>
        <Link
          href="/careers/compare"
          style={{
            fontSize: '0.875rem',
            color: 'var(--pf-blue-700)',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
          }}
        >
          Compare
        </Link>
      </div>

      {rows.length === 0 ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', margin: 0 }}>
          You haven&rsquo;t saved any career comparisons yet.{' '}
          <Link
            href="/careers/compare"
            style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}
          >
            Start comparing →
          </Link>
        </p>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {rows.map((row) => {
              const href = `/careers/compare?t=${encodeURIComponent(
                row.role_ids.join(','),
              )}`
              const previewTitles = row.role_ids
                .map((id) => titles?.get(id) ?? '…')
                .join(' · ')
              return (
                <li
                  key={row.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'var(--pf-blue-50)',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <Link
                    href={href}
                    className="no-underline hover:no-underline"
                    style={{ flex: 1, minWidth: 0, color: 'inherit' }}
                  >
                    <p
                      className="truncate"
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        color: 'var(--pf-grey-900)',
                        margin: 0,
                      }}
                    >
                      {row.name}
                    </p>
                    <p
                      className="truncate"
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--pf-grey-600)',
                        margin: 0,
                      }}
                    >
                      {previewTitles}
                    </p>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(row.id)}
                    disabled={pendingDelete === row.id}
                    aria-label={`Delete ${row.name}`}
                    style={{
                      flexShrink: 0,
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--pf-grey-600)',
                      cursor: pendingDelete === row.id ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ margin: '0 auto' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </li>
              )
            })}
          </ul>
          <Link
            href="/account/saved-comparisons"
            className="block text-center"
            style={{
              fontSize: '0.875rem',
              color: 'var(--pf-blue-700)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              paddingTop: '4px',
            }}
          >
            View all saved comparisons
          </Link>
        </>
      )}
    </div>
  )
}
