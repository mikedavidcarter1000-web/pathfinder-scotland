'use client'

import { useCallback, useState } from 'react'

type SharingState = {
  sharedWithSchool: boolean
  sharedWithParent: boolean
}

export function SharingControls({
  initial,
  hasSchool,
  onChange,
}: {
  initial: SharingState
  hasSchool: boolean
  onChange?: (next: SharingState) => void
}) {
  const [state, setState] = useState<SharingState>(initial)
  const [busy, setBusy] = useState<'school' | 'parent' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const persist = useCallback(
    async (patch: Partial<SharingState>, busyKey: 'school' | 'parent') => {
      const optimistic = { ...state, ...patch }
      setBusy(busyKey)
      setError(null)
      const previous = state
      setState(optimistic)
      try {
        const body =
          busyKey === 'school'
            ? { sharedWithSchool: optimistic.sharedWithSchool }
            : { sharedWithParent: optimistic.sharedWithParent }
        const res = await fetch('/api/personal-statement/sharing', {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const json = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(json.error ?? 'Could not save sharing setting')
        }
        const json = (await res.json()) as {
          draft: { sharedWithSchool: boolean; sharedWithParent: boolean }
        }
        const next = {
          sharedWithSchool: json.draft.sharedWithSchool,
          sharedWithParent: json.draft.sharedWithParent,
        }
        setState(next)
        onChange?.(next)
      } catch (err) {
        setState(previous)
        setError(err instanceof Error ? err.message : 'Could not save sharing setting')
      } finally {
        setBusy(null)
      }
    },
    [state, onChange]
  )

  const toggleSchool = useCallback(async () => {
    if (state.sharedWithSchool) {
      const ok = window.confirm(
        'This will hide your draft from your guidance teacher. Existing comments will be preserved but they will not be able to add new ones.'
      )
      if (!ok) return
    }
    await persist({ sharedWithSchool: !state.sharedWithSchool }, 'school')
  }, [state.sharedWithSchool, persist])

  const toggleParent = useCallback(async () => {
    if (state.sharedWithParent) {
      const ok = window.confirm(
        'This will hide your draft from your linked parent / carer. Existing comments will be preserved but they will not be able to add new ones.'
      )
      if (!ok) return
    }
    await persist({ sharedWithParent: !state.sharedWithParent }, 'parent')
  }, [state.sharedWithParent, persist])

  return (
    <section
      style={{
        marginTop: '20px',
        padding: '16px 18px',
        borderRadius: '8px',
        backgroundColor: 'var(--pf-white)',
        border: '1px solid var(--pf-grey-200)',
      }}
    >
      <h3
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '1rem',
          color: 'var(--pf-grey-900)',
          marginBottom: '4px',
        }}
      >
        Sharing
      </h3>
      <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginBottom: '12px' }}>
        Control who can read and comment on your personal statement. You are always the only
        person who can edit the text.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <ToggleRow
          label="Share with my guidance teacher"
          description={
            hasSchool
              ? 'Your guidance teacher will be able to read your draft and leave comments.'
              : 'Link your account to a school first to enable this.'
          }
          checked={state.sharedWithSchool}
          disabled={!hasSchool || busy === 'school'}
          onToggle={toggleSchool}
        />
        <ToggleRow
          label="Share with my parent / carer"
          description="Your linked parent or carer will be able to read your draft and leave comments on their dashboard."
          checked={state.sharedWithParent}
          disabled={busy === 'parent'}
          onToggle={toggleParent}
        />
      </div>

      {error && (
        <p style={{ marginTop: '8px', fontSize: '0.8125rem', color: 'var(--pf-red-500)' }}>{error}</p>
      )}
    </section>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  disabled,
  onToggle,
}: {
  label: string
  description: string
  checked: boolean
  disabled: boolean
  onToggle: () => void
}) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onToggle}
        disabled={disabled}
        style={{
          flexShrink: 0,
          width: '40px',
          height: '22px',
          borderRadius: '999px',
          border: 'none',
          backgroundColor: checked ? 'var(--pf-blue-700)' : 'var(--pf-grey-300)',
          position: 'relative',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'background-color 150ms ease',
          padding: 0,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '3px',
            left: checked ? '21px' : '3px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#fff',
            transition: 'left 150ms ease',
          }}
        />
      </button>
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: 'var(--pf-grey-900)',
            fontFamily: "'Space Grotesk', sans-serif",
            marginBottom: '2px',
          }}
        >
          {label}
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', lineHeight: 1.5 }}>
          {description}
        </p>
      </div>
    </div>
  )
}
