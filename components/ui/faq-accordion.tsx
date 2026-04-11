'use client'

import { useState } from 'react'

export type FaqItem = {
  question: string
  answer: string
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set([0]))

  const toggle = (index: number) => {
    setOpenIndexes((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {items.map((item, index) => {
        const isOpen = openIndexes.has(index)
        const panelId = `faq-panel-${index}`
        const buttonId = `faq-button-${index}`

        return (
          <div
            key={index}
            className="pf-card-flat"
            style={{
              backgroundColor: 'var(--pf-white)',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden',
            }}
          >
            <button
              id={buttonId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(index)}
              className="focus-ring"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                padding: '20px 24px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '1.0625rem',
                color: 'var(--pf-grey-900)',
                lineHeight: 1.4,
              }}
            >
              <span>{item.question}</span>
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  flexShrink: 0,
                  color: 'var(--pf-teal-700)',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s ease',
                }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              style={{
                display: 'grid',
                gridTemplateRows: isOpen ? '1fr' : '0fr',
                transition: 'grid-template-rows 0.25s ease',
              }}
            >
              <div style={{ overflow: 'hidden' }}>
                <p
                  style={{
                    padding: '0 24px 20px',
                    margin: 0,
                    color: 'var(--pf-grey-600)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.6,
                  }}
                >
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
