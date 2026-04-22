'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useLinkedChildren } from '@/hooks/use-parent-link'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { ParentCoursesCard } from '@/components/parent-dashboard/courses-card'
import { ParentFundingCard } from '@/components/parent-dashboard/funding-card'
import { ParentKeyDatesCard } from '@/components/parent-dashboard/key-dates-card'
import { ParentBenchmarksCard } from '@/components/parent-dashboard/benchmarks-card'

export default function ParentDashboardPage() {
  const router = useRouter()
  const { user, parent, student, isLoading: authLoading } = useAuth()
  const { data: children, isLoading: childrenLoading } = useLinkedChildren()

  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)

  // Keep selected child id in sync with the first linked child
  useEffect(() => {
    if (children && children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].student_id)
    }
  }, [children, selectedChildId])

  // Route guards
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/sign-in?redirect=/parent/dashboard')
      return
    }
    // If the signed-in user has a student profile but no parent profile,
    // they are in the wrong place
    if (student && !parent) {
      router.replace('/dashboard')
    }
  }, [authLoading, user, parent, student, router])

  const selectedChild = useMemo(
    () => (children ?? []).find((c) => c.student_id === selectedChildId) ?? null,
    [children, selectedChildId]
  )

  if (authLoading || childrenLoading) {
    return (
      <div className="pf-container pt-8 pb-12">
        <Skeleton width="260px" height={32} rounded="md" />
        <div style={{ height: '16px' }} />
        <Skeleton variant="card" />
        <div style={{ height: '12px' }} />
        <Skeleton variant="card" />
      </div>
    )
  }

  if (!user || !parent) {
    return null
  }

  const firstName = (parent.full_name || '').split(' ')[0] || 'there'

  // No children linked yet -- show the join prompt
  if (!children || children.length === 0) {
    return (
      <div className="pf-container pt-8 pb-12 max-w-2xl">
        <h1 style={{ marginBottom: '8px' }}>Welcome, {firstName}</h1>
        <p style={{ color: 'var(--pf-grey-600)', marginBottom: '20px' }}>
          You don&apos;t have any linked children yet. Ask your child to generate an invite
          link from their dashboard settings, then follow the link or enter the code below.
        </p>
        <div className="pf-card">
          <p style={{ marginBottom: '12px' }}>
            If you have an invite link, open it now to link to your child&apos;s account.
            Links look like{' '}
            <code style={{ fontFamily: 'monospace' }}>
              pathfinderscot.co.uk/parent/join?code=ABCD-1234
            </code>
            .
          </p>
          <a href="/parent/join" className="pf-btn-primary">
            Enter invite code
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="pf-container pt-8 pb-12">
      <div className="mb-6">
        <span className="pf-badge-blue inline-flex" style={{ marginBottom: '10px' }}>
          Parent / guardian dashboard
        </span>
        <h1 style={{ marginBottom: '4px' }}>Welcome back, {firstName}</h1>
        <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
          {children.length === 1
            ? "Here's what your child has been working on."
            : `You're linked to ${children.length} children. Use the tabs to switch.`}
        </p>
      </div>

      {/* Read-only notice */}
      <div
        className="pf-card mb-6"
        style={{
          backgroundColor: 'var(--pf-blue-50)',
          borderLeft: '4px solid var(--pf-blue-700)',
        }}
      >
        <p style={{ fontSize: '0.9375rem', margin: 0 }}>
          Your child controls their own profile. You can see their progress, saved courses,
          and funding options, but you can&apos;t make changes for them. Some information
          they mark confidential is never shared with linked parents.
        </p>
      </div>

      {/* Child selector -- only shown when 2+ children are linked */}
      {children.length > 1 && (
        <div
          role="tablist"
          aria-label="Select a child"
          className="flex flex-wrap gap-2"
          style={{ marginBottom: '20px' }}
        >
          {children.map((child) => {
            const active = child.student_id === selectedChildId
            const firstName = child.first_name || child.email.split('@')[0]
            return (
              <button
                key={child.student_id}
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedChildId(child.student_id)}
                type="button"
                className="text-sm"
                style={{
                  padding: '8px 14px',
                  borderRadius: '999px',
                  backgroundColor: active ? 'var(--pf-blue-700)' : 'var(--pf-white)',
                  color: active ? 'var(--pf-white)' : 'var(--pf-grey-900)',
                  border: `1px solid ${active ? 'var(--pf-blue-700)' : 'var(--pf-grey-300)'}`,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {firstName}
              </button>
            )
          })}
        </div>
      )}

      {selectedChild && (
        <div className="space-y-5">
          <ParentCoursesCard child={selectedChild} />
          <ParentFundingCard child={selectedChild} />
          <ParentKeyDatesCard child={selectedChild} />
          <ParentBenchmarksCard child={selectedChild} />
        </div>
      )}
    </div>
  )
}
