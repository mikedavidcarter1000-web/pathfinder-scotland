'use client'

import { useEffect, useState } from 'react'

export type DemoStep = {
  id: string
  number: number
  shortTitle: string
}

export function DemoProgressIndicator({ steps }: { steps: DemoStep[] }) {
  const [activeId, setActiveId] = useState<string>(steps[0]?.id ?? '')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const elements = steps
      .map((step) => document.getElementById(step.id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0, 0.1, 0.5],
      }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [steps])

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({ top, behavior: 'smooth' })
  }

  return (
    <>
      {/* Desktop: vertical dots on left */}
      <nav
        aria-label="Demo steps"
        className="hidden lg:flex"
        style={{
          position: 'fixed',
          left: '24px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 40,
          flexDirection: 'column',
          gap: '4px',
          backgroundColor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          padding: '16px 12px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        }}
      >
        {steps.map((step) => {
          const active = activeId === step.id
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => handleClick(step.id)}
              aria-label={`Go to step ${step.number}: ${step.shortTitle}`}
              aria-current={active ? 'step' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '8px',
                border: 'none',
                background: active ? 'var(--pf-blue-100)' : 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                textAlign: 'left',
                width: '100%',
                minWidth: '180px',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '9999px',
                  backgroundColor: active ? 'var(--pf-blue-700)' : 'var(--pf-grey-100)',
                  color: active ? '#fff' : 'var(--pf-grey-600)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  flexShrink: 0,
                  transition: 'background-color 0.2s, color 0.2s',
                }}
              >
                {step.number}
              </span>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: active ? 600 : 500,
                  fontSize: '0.8125rem',
                  color: active ? 'var(--pf-blue-700)' : 'var(--pf-grey-600)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {step.shortTitle}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Mobile: horizontal sticky bar */}
      <nav
        aria-label="Demo steps"
        className="lg:hidden"
        style={{
          position: 'sticky',
          top: '64px',
          zIndex: 30,
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--pf-grey-300)',
          padding: '8px 0',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            padding: '4px 16px',
            scrollbarWidth: 'none',
          }}
        >
          {steps.map((step) => {
            const active = activeId === step.id
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleClick(step.id)}
                aria-label={`Go to step ${step.number}: ${step.shortTitle}`}
                aria-current={active ? 'step' : undefined}
                style={{
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  border: active
                    ? '1px solid var(--pf-blue-700)'
                    : '1px solid var(--pf-grey-300)',
                  backgroundColor: active ? 'var(--pf-blue-700)' : 'var(--pf-white)',
                  color: active ? '#fff' : 'var(--pf-grey-600)',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <span>{step.number}</span>
                <span>{step.shortTitle}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
