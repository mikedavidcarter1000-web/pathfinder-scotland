'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import {
  useLinkedChildren,
  useRedeemParentInviteCode,
  type LinkedChild,
} from '@/hooks/use-parent-link'
import { ParentPersonalStatementCard } from '@/components/parent-dashboard/personal-statement-card'
import { SubmitButton } from '@/components/ui/submit-button'
import { useToast } from '@/components/ui/toast'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { SCHOOL_STAGES } from '@/lib/constants'
import type { Tables } from '@/types/database'

interface ParentRow {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string | null
  postcode: string | null
  simd_decile: number | null
}

export function ParentDashboardV2({ parent }: { parent: ParentRow }) {
  const { data: children, isLoading } = useLinkedChildren()
  const [isLinking, setIsLinking] = useState(false)

  return (
    <div className="pf-container pt-8 sm:pt-10 pb-12 sm:pb-16">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <span className="pf-badge-blue inline-flex" style={{ marginBottom: '12px' }}>
          Parent / carer dashboard
        </span>
        <h1
          style={{ marginBottom: '4px', fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}
          className="break-words"
        >
          Welcome back, {parent.full_name.split(' ')[0] || 'there'}
        </h1>
        <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
          {children && children.length > 0
            ? `You're linked to ${children.length} ${children.length === 1 ? 'child' : 'children'}.`
            : 'Link to your child to see their progress.'}
        </p>
      </div>

      {/* Read-only reminder */}
      <div
        className="pf-card mb-6"
        style={{
          backgroundColor: 'var(--pf-blue-50)',
          borderLeft: '4px solid var(--pf-blue-700)',
        }}
      >
        <p style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-900)', margin: 0 }}>
          <strong style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Your child controls their own profile.
          </strong>{' '}
          You can view their progress but not make changes. Some information they mark as
          confidential is never shared with linked parents.
        </p>
      </div>

      {/* Linked children list or link-first CTA */}
      <div className="mb-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
        ) : children && children.length > 0 ? (
          <>
            <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>
              Your linked {children.length === 1 ? 'child' : 'children'}
            </h2>
            <div className="space-y-4">
              {children.map((child) => (
                <LinkedChildCard key={child.link_id} child={child} />
              ))}
            </div>
            <div className="mt-6">
              <button
                type="button"
                className="pf-btn-secondary"
                onClick={() => setIsLinking((v) => !v)}
              >
                {isLinking ? 'Cancel' : 'Link another child'}
              </button>
              {isLinking && (
                <div className="mt-4">
                  <LinkChildForm onLinked={() => setIsLinking(false)} />
                </div>
              )}
            </div>
          </>
        ) : (
          <LinkChildForm />
        )}
      </div>

      {/* Subject choice approvals */}
      {children && children.length > 0 && (
        <div
          className="pf-card mb-6"
          style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}
        >
          <h2 style={{ marginBottom: '4px', fontSize: '1.05rem' }}>Subject choice approvals</h2>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            When your child submits subject choices that need a parent signature, review them here.
          </p>
          <div style={{ marginTop: '12px' }}>
            <Link href="/parent/choices" className="pf-btn-primary pf-btn-sm">
              View subject choices &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Parent account settings */}
      <div className="pf-card">
        <h2 style={{ marginBottom: '8px', fontSize: '1.125rem' }}>Your account</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9375rem' }}>
          <InfoRow label="Name" value={parent.full_name} />
          <InfoRow label="Email" value={parent.email} />
          {parent.phone && <InfoRow label="Phone" value={parent.phone} />}
          {parent.postcode && <InfoRow label="Postcode" value={parent.postcode} />}
        </ul>
        <div style={{ marginTop: '16px' }}>
          <Link href="/dashboard/settings" className="pf-btn-secondary pf-btn-sm">
            Account settings
          </Link>
        </div>
      </div>

      {/* External parent guide */}
      <div className="mt-6">
        <Link
          href="/parents"
          className="pf-card-hover no-underline hover:no-underline flex items-center gap-4"
          style={{ padding: '20px 24px' }}
        >
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'var(--pf-blue-100)',
              color: 'var(--pf-blue-700)',
            }}
            aria-hidden="true"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
                color: 'var(--pf-grey-900)',
                marginBottom: '2px',
              }}
            >
              Read the parent guide
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
              Plain-language overview of Scottish subject choices, widening access, and FAQs.
            </p>
          </div>
          <svg
            className="w-5 h-5 flex-shrink-0"
            style={{ color: 'var(--pf-blue-700)' }}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

function LinkChildForm({ onLinked }: { onLinked?: () => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const redeem = useRedeemParentInviteCode()
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const result = await redeem.mutateAsync(code.trim())
      toast.success('Linked', `You can now see ${result.student_name}'s progress.`)
      setCode('')
      onLinked?.()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not redeem invite code.'
      setError(msg)
    }
  }

  return (
    <div
      className="pf-card"
      style={{ borderTop: '3px solid var(--pf-blue-700)' }}
    >
      <h3 style={{ marginBottom: '8px', fontSize: '1.125rem' }}>
        Link to your child
      </h3>
      <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', marginBottom: '16px' }}>
        Ask your child to generate an invite code from their dashboard settings. The code
        looks like <code style={{ fontFamily: 'monospace' }}>ABCD-1234</code> and is valid
        for 48 hours.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="invite-code" className="pf-label">
            Invite code
          </label>
          <input
            id="invite-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABCD-1234"
            autoComplete="off"
            maxLength={12}
            required
            className="pf-input"
            style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
          />
        </div>
        {error && (
          <p style={{ color: 'var(--pf-red-500)', fontSize: '0.875rem' }}>{error}</p>
        )}
        <SubmitButton
          type="submit"
          isLoading={redeem.isPending}
          loadingText="Linking..."
        >
          Link to your child
        </SubmitButton>
      </form>
    </div>
  )
}

function LinkedChildCard({ child }: { child: LinkedChild }) {
  const [expanded, setExpanded] = useState(false)
  const displayName =
    [child.first_name, child.last_name].filter(Boolean).join(' ') ||
    child.email
  const stageLabel = child.school_stage
    ? SCHOOL_STAGES[child.school_stage as keyof typeof SCHOOL_STAGES]?.label ??
      child.school_stage.toUpperCase()
    : 'Stage not set'

  return (
    <div className="pf-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '1.125rem',
              color: 'var(--pf-grey-900)',
              marginBottom: '2px',
            }}
          >
            {displayName}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
            {stageLabel}
            {child.school_name ? ` — ${child.school_name}` : ''}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)', marginTop: '4px' }}>
            Linked {new Date(child.linked_at).toLocaleDateString('en-GB')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="pf-btn pf-btn-secondary pf-btn-sm"
          aria-expanded={expanded}
        >
          {expanded ? 'Hide' : 'View progress'}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--pf-grey-100)' }}>
          <ChildSavedCourses studentId={child.student_id} />
          <ChildGrades studentId={child.student_id} />
          <ChildQuizResult studentId={child.student_id} />
          <ParentPersonalStatementCard
            studentId={child.student_id}
            childFirstName={child.first_name}
          />
        </div>
      )}
    </div>
  )
}

// -------------------------------------------------------------------
// Child data components - each one queries a table with RLS permitting
// linked-parent reads via is_linked_parent(student_id).
// -------------------------------------------------------------------

function ChildSavedCourses({ studentId }: { studentId: string }) {
  const supabase = getSupabaseClient()
  const { data, isLoading } = useQuery({
    queryKey: ['parent-view-saved-courses', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_courses')
        .select(
          `
          id, created_at,
          course:courses(id, name, degree_type, university:universities(name))
          `
        )
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data || []) as Array<{
        id: string
        created_at: string | null
        course: {
          id: string
          name: string
          degree_type: string | null
          university: { name: string } | null
        } | null
      }>
    },
  })

  return (
    <Section title="Saved courses" count={data?.length ?? 0}>
      {isLoading ? (
        <Skeleton variant="text" lines={2} />
      ) : !data || data.length === 0 ? (
        <Empty>No saved courses yet.</Empty>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {data.slice(0, 10).map((sc) => (
            <li
              key={sc.id}
              style={{
                padding: '8px 0',
                borderBottom: '1px solid var(--pf-grey-100)',
                fontSize: '0.875rem',
              }}
            >
              <p style={{ color: 'var(--pf-grey-900)', fontWeight: 500, margin: 0 }}>
                {sc.course?.name ?? 'Unknown course'}
              </p>
              <p style={{ color: 'var(--pf-grey-600)', margin: 0 }}>
                {sc.course?.university?.name ?? ''}
              </p>
            </li>
          ))}
          {data.length > 10 && (
            <li style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)', paddingTop: '6px' }}>
              + {data.length - 10} more
            </li>
          )}
        </ul>
      )}
    </Section>
  )
}

function ChildGrades({ studentId }: { studentId: string }) {
  const supabase = getSupabaseClient()
  const { data, isLoading } = useQuery({
    queryKey: ['parent-view-grades', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_grades')
        .select('id, subject, grade, qualification_type, predicted')
        .eq('student_id', studentId)
        .order('qualification_type')
        .order('subject')
      if (error) throw error
      return (data || []) as Array<Tables<'student_grades'>>
    },
  })

  const byType: Record<string, Tables<'student_grades'>[]> = {}
  for (const g of data ?? []) {
    const key = g.qualification_type ?? 'other'
    ;(byType[key] ||= []).push(g)
  }
  const order: Array<[string, string]> = [
    ['advanced_higher', 'Advanced Highers'],
    ['higher', 'Highers'],
    ['national_5', 'National 5s'],
    ['national_4', 'National 4s'],
  ]

  return (
    <Section title="Grades" count={data?.length ?? 0}>
      {isLoading ? (
        <Skeleton variant="text" lines={2} />
      ) : !data || data.length === 0 ? (
        <Empty>No grades entered yet.</Empty>
      ) : (
        <div>
          {order.map(([key, label]) =>
            byType[key] && byType[key].length > 0 ? (
              <div key={key} style={{ marginBottom: '10px' }}>
                <p
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    color: 'var(--pf-blue-700)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '4px',
                  }}
                >
                  {label}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.875rem' }}>
                  {byType[key].map((g) => (
                    <li
                      key={g.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '4px 0',
                      }}
                    >
                      <span>
                        {g.subject}
                        {g.predicted ? ' (predicted)' : ''}
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--pf-grey-900)' }}>
                        {g.grade}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null
          )}
        </div>
      )}
    </Section>
  )
}

function ChildQuizResult({ studentId }: { studentId: string }) {
  const supabase = getSupabaseClient()
  const { data, isLoading } = useQuery({
    queryKey: ['parent-view-quiz', studentId],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('quiz_results')
        .select('id, top_types, completed_at')
        .eq('student_id', studentId)
        .order('completed_at', { ascending: false })
        .limit(1)
      if (error) throw error
      return ((data && data[0]) || null) as {
        id: string
        top_types: string[] | null
        completed_at: string | null
      } | null
    },
  })

  const RIASEC_LABELS: Record<string, string> = {
    R: 'Realistic',
    I: 'Investigative',
    A: 'Artistic',
    S: 'Social',
    E: 'Enterprising',
    C: 'Conventional',
  }

  return (
    <Section title="Career quiz">
      {isLoading ? (
        <Skeleton variant="text" lines={1} />
      ) : !data ? (
        <Empty>Not taken yet.</Empty>
      ) : (
        <div style={{ fontSize: '0.875rem' }}>
          <p style={{ color: 'var(--pf-grey-600)', marginBottom: '4px' }}>
            Top interest types:
          </p>
          <p style={{ color: 'var(--pf-grey-900)', fontWeight: 500 }}>
            {(data.top_types as string[] | null)
              ?.map((t) => RIASEC_LABELS[t] ?? t)
              .join(', ') || '—'}
          </p>
          {data.completed_at && (
            <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.75rem', marginTop: '4px' }}>
              Completed {new Date(data.completed_at).toLocaleDateString('en-GB')}
            </p>
          )}
        </div>
      )}
    </Section>
  )
}

function Section({
  title,
  count,
  children,
}: {
  title: string
  count?: number
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div className="flex items-center justify-between mb-2">
        <h4
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '1rem',
            color: 'var(--pf-grey-900)',
            margin: 0,
          }}
        >
          {title}
        </h4>
        {typeof count === 'number' && count > 0 && (
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--pf-grey-600)',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: '0.875rem',
        color: 'var(--pf-grey-600)',
        fontStyle: 'italic',
        margin: 0,
      }}
    >
      {children}
    </p>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <li
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '6px 0',
        borderBottom: '1px solid var(--pf-grey-100)',
      }}
    >
      <span style={{ color: 'var(--pf-grey-600)' }}>{label}</span>
      <span
        style={{
          color: 'var(--pf-grey-900)',
          fontWeight: 500,
          textAlign: 'right',
          maxWidth: '60%',
          overflowWrap: 'anywhere',
        }}
      >
        {value}
      </span>
    </li>
  )
}
