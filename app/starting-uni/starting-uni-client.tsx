'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { ChecklistCategory, ChecklistItemWithProgress } from '@/types/offers'

interface StartingUniClientProps {
  initialItems: ChecklistItemWithProgress[]
  linkedOfferSlugs: Record<string, string>
  isAuthenticated: boolean
}

// Explicit display order (overrides DB alphabetical order).
const CATEGORY_ORDER: ChecklistCategory[] = [
  'finance',
  'health',
  'housing',
  'admin',
  'tech',
]

const CATEGORY_LABELS: Record<ChecklistCategory, string> = {
  finance: 'Finance',
  health: 'Health',
  housing: 'Housing',
  admin: 'Admin',
  tech: 'Tech',
}

const CATEGORY_DESCRIPTIONS: Record<ChecklistCategory, string> = {
  finance: 'Student loans, bank accounts, and budgeting basics.',
  health: 'GPs, dentists, and mental-health support near your new base.',
  housing: 'Accommodation, council tax, and utility sign-ups.',
  admin: 'Enrolment paperwork, insurance, and official records.',
  tech: 'Free software, broadband, and devices for your course.',
}

export function StartingUniClient({
  initialItems,
  linkedOfferSlugs,
  isAuthenticated,
}: StartingUniClientProps) {
  const [items, setItems] = useState<ChecklistItemWithProgress[]>(initialItems)
  const [expanded, setExpanded] = useState<Set<ChecklistCategory>>(
    new Set(CATEGORY_ORDER)
  )
  const [pending, setPending] = useState<Set<string>>(new Set())

  const completed = items.filter((i) => i.completed).length
  const total = items.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  const grouped = useMemo(() => {
    return CATEGORY_ORDER.map((cat) => ({
      category: cat,
      items: items.filter((i) => i.category === cat),
    })).filter((g) => g.items.length > 0)
  }, [items])

  const toggleCategory = (cat: ChecklistCategory) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const toggleItem = async (itemId: string) => {
    const current = items.find((i) => i.id === itemId)
    if (!current) return
    const nextCompleted = !current.completed

    // Optimistic update
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, completed: nextCompleted, completed_at: nextCompleted ? new Date().toISOString() : null }
          : i
      )
    )

    if (!isAuthenticated) return

    setPending((prev) => {
      const next = new Set(prev)
      next.add(itemId)
      return next
    })

    try {
      const res = await fetch('/api/starting-uni/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklist_item_id: itemId,
          completed: nextCompleted,
        }),
      })
      if (!res.ok) throw new Error('progress save failed')
    } catch {
      // Revert on error
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? { ...i, completed: !nextCompleted, completed_at: !nextCompleted ? new Date().toISOString() : null }
            : i
        )
      )
    } finally {
      setPending((prev) => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print()
  }

  return (
    <>
      {/* Print-specific CSS */}
      <style jsx global>{`
        @media print {
          nav, header, footer,
          .pf-no-print {
            display: none !important;
          }
          .pf-print-progress-bar {
            display: none !important;
          }
          .pf-print-expand-all > [data-pf-checklist-section] {
            display: block !important;
          }
          .pf-print-expand-all [data-pf-checklist-items] {
            display: flex !important;
          }
          .pf-print-expand-all [data-pf-toggle] {
            display: none !important;
          }
          .pf-print-checkbox {
            border: 1.5px solid #000 !important;
            background: #fff !important;
            color: transparent !important;
          }
          a[data-pf-offer-link] {
            color: #000 !important;
            text-decoration: underline !important;
          }
          body {
            background: #fff !important;
          }
        }
      `}</style>

      <div className="pf-print-expand-all">
        {/* Header */}
        <section
          style={{
            backgroundColor: 'var(--pf-blue-50)',
            paddingTop: '40px',
            paddingBottom: '28px',
          }}
        >
          <div className="pf-container" style={{ maxWidth: '820px' }}>
            <nav
              aria-label="Breadcrumb"
              className="pf-no-print"
              style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginBottom: '12px' }}
            >
              <Link href="/" style={{ color: 'var(--pf-grey-600)' }}>
                Home
              </Link>
              <span style={{ margin: '0 8px' }}>/</span>
              <span style={{ color: 'var(--pf-grey-900)' }}>Starting university checklist</span>
            </nav>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div style={{ flex: 1, minWidth: '260px' }}>
                <h1 style={{ marginBottom: '8px', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
                  Starting University Checklist
                </h1>
                <p
                  style={{
                    color: 'var(--pf-grey-600)',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    margin: 0,
                    maxWidth: '620px',
                  }}
                >
                  Everything you need to sort before and during your first weeks.
                </p>
              </div>
              <button
                type="button"
                onClick={handlePrint}
                className="pf-btn-secondary pf-no-print inline-flex items-center gap-2"
                aria-label="Print checklist"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 9V2h12v7" />
                  <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print checklist
              </button>
            </div>
          </div>
        </section>

        {/* Progress bar */}
        <section
          className="pf-print-progress-bar"
          style={{
            backgroundColor: 'var(--pf-white)',
            borderBottom: '1px solid var(--pf-grey-200)',
            padding: '20px 0',
            position: 'sticky',
            top: '64px',
            zIndex: 10,
          }}
        >
          <div className="pf-container" style={{ maxWidth: '820px' }}>
            <div className="flex items-center gap-4 flex-wrap">
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div className="flex items-baseline justify-between gap-2" style={{ marginBottom: '6px' }}>
                  <span
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: 'var(--pf-grey-900)',
                    }}
                  >
                    {completed} of {total} complete
                  </span>
                  <span
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: 'var(--pf-blue-700)',
                    }}
                  >
                    {pct}%
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-valuenow={completed}
                  aria-label="Checklist progress"
                  style={{
                    height: '8px',
                    backgroundColor: 'var(--pf-grey-100)',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      backgroundColor: 'var(--pf-blue-500)',
                      transition: 'width 0.3s ease-out',
                    }}
                  />
                </div>
              </div>
            </div>
            {!isAuthenticated && (
              <p
                style={{
                  marginTop: '10px',
                  marginBottom: 0,
                  fontSize: '0.8125rem',
                  color: 'var(--pf-grey-600)',
                }}
              >
                <Link
                  href="/auth/sign-in?redirect=/starting-uni"
                  style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}
                >
                  Sign in
                </Link>{' '}
                to save your progress.
              </p>
            )}
          </div>
        </section>

        {/* Sections */}
        <section style={{ padding: '32px 0 48px' }}>
          <div className="pf-container" style={{ maxWidth: '820px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {grouped.map(({ category, items: categoryItems }) => {
                const catCompleted = categoryItems.filter((i) => i.completed).length
                const catTotal = categoryItems.length
                const isOpen = expanded.has(category)
                return (
                  <div
                    key={category}
                    data-pf-checklist-section
                    className="pf-card"
                    style={{ padding: 0, overflow: 'hidden' }}
                  >
                    <button
                      type="button"
                      data-pf-toggle
                      onClick={() => toggleCategory(category)}
                      aria-expanded={isOpen}
                      className="pf-no-print-toggle w-full text-left"
                      style={{
                        padding: '16px 20px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h2
                          style={{
                            fontSize: '1.125rem',
                            marginBottom: '2px',
                            color: 'var(--pf-grey-900)',
                          }}
                        >
                          {CATEGORY_LABELS[category]}
                        </h2>
                        <p
                          style={{
                            fontSize: '0.8125rem',
                            color: 'var(--pf-grey-600)',
                            margin: 0,
                          }}
                        >
                          {catCompleted} of {catTotal} complete · {CATEGORY_DESCRIPTIONS[category]}
                        </p>
                      </div>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        style={{
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s',
                          color: 'var(--pf-grey-600)',
                          flexShrink: 0,
                        }}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div
                        data-pf-checklist-items
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1px',
                          backgroundColor: 'var(--pf-grey-100)',
                          borderTop: '1px solid var(--pf-grey-200)',
                        }}
                      >
                        {categoryItems.map((item) => {
                          const offerSlug = item.linked_offer_id
                            ? linkedOfferSlugs[item.linked_offer_id] ?? null
                            : null
                          const isPending = pending.has(item.id)
                          return (
                            <ChecklistRow
                              key={item.id}
                              item={item}
                              offerSlug={offerSlug}
                              onToggle={() => toggleItem(item.id)}
                              isPending={isPending}
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Cross-link back to offers */}
            <div
              className="pf-no-print"
              style={{
                marginTop: '32px',
                padding: '20px 24px',
                backgroundColor: 'var(--pf-blue-50)',
                borderRadius: '10px',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '0.9375rem',
                  color: 'var(--pf-grey-900)',
                  lineHeight: 1.6,
                }}
              >
                Looking for discounts and entitlements?{' '}
                <Link
                  href="/offers"
                  style={{
                    color: 'var(--pf-blue-700)',
                    fontWeight: 600,
                    textDecoration: 'underline',
                  }}
                >
                  Browse all student offers and entitlements
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

function ChecklistRow({
  item,
  offerSlug,
  onToggle,
  isPending,
}: {
  item: ChecklistItemWithProgress
  offerSlug: string | null
  onToggle: () => void
  isPending: boolean
}) {
  const linkHref = offerSlug ? `/offers/${offerSlug}` : item.url
  const isExternal = !offerSlug && !!item.url

  return (
    <div
      style={{
        padding: '14px 20px',
        backgroundColor: 'var(--pf-white)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={item.completed}
        aria-label={item.completed ? `Mark "${item.title}" as not done` : `Mark "${item.title}" as done`}
        disabled={isPending}
        className="pf-print-checkbox"
        style={{
          minWidth: '44px',
          minHeight: '44px',
          flexShrink: 0,
          padding: 0,
          border: 'none',
          background: 'transparent',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isPending ? 'default' : 'pointer',
          opacity: isPending ? 0.7 : 1,
        }}
      >
        <span
          className="pf-print-checkbox"
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            border: item.completed
              ? '2px solid var(--pf-blue-500)'
              : '2px solid var(--pf-grey-300)',
            backgroundColor: item.completed ? 'var(--pf-blue-500)' : 'transparent',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.15s, border-color 0.15s',
          }}
        >
          {item.completed && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </span>
      </button>

      <div style={{ flex: 1, minWidth: 0, paddingTop: '10px' }}>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: 'var(--pf-grey-900)',
            textDecoration: item.completed ? 'line-through' : 'none',
            opacity: item.completed ? 0.7 : 1,
          }}
        >
          {item.title}
        </div>
        {item.description && (
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              margin: '2px 0 0 0',
            }}
          >
            {item.description}
          </p>
        )}
        {linkHref && (
          <div style={{ marginTop: '6px' }}>
            {isExternal ? (
              <a
                href={linkHref}
                target="_blank"
                rel="noopener noreferrer"
                data-pf-offer-link
                className="inline-flex items-center gap-1"
                style={{
                  color: 'var(--pf-blue-700)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Visit external site
              </a>
            ) : (
              <Link
                href={linkHref}
                data-pf-offer-link
                className="inline-flex items-center gap-1"
                style={{
                  color: 'var(--pf-blue-700)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" />
                </svg>
                View linked offer
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
