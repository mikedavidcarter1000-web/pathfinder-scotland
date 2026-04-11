'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export type ToastKind = 'success' | 'error' | 'info'

interface ToastRecord {
  id: number
  kind: ToastKind
  title: string
  description?: string
}

interface ToastContextValue {
  show: (toast: Omit<ToastRecord, 'id'>) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    // Fallback to a no-op + console so callers don't explode if provider is missing.
    return {
      show: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
    }
  }
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])
  const counter = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (toast: Omit<ToastRecord, 'id'>) => {
      counter.current += 1
      const id = counter.current
      setToasts((current) => [...current, { ...toast, id }])
      // Auto-dismiss after 4 seconds
      setTimeout(() => dismiss(id), 4000)
    },
    [dismiss]
  )

  const value: ToastContextValue = {
    show,
    success: (title, description) => show({ kind: 'success', title, description }),
    error: (title, description) => show({ kind: 'error', title, description }),
    info: (title, description) => show({ kind: 'info', title, description }),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastRecord[]
  onDismiss: (id: number) => void
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed z-50 flex flex-col gap-2 pointer-events-none sm:right-5 sm:bottom-5 sm:w-[360px] left-4 right-4 bottom-4"
      style={{
        maxWidth: 'calc(100vw - 32px)',
      }}
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  )
}

const TONE: Record<
  ToastKind,
  { bg: string; accent: string; border: string; icon: ReactNode }
> = {
  success: {
    bg: 'rgba(16, 185, 129, 0.08)',
    accent: 'var(--pf-green-500)',
    border: 'rgba(16, 185, 129, 0.25)',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.08)',
    accent: 'var(--pf-red-500)',
    border: 'rgba(239, 68, 68, 0.25)',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  info: {
    bg: 'var(--pf-blue-100)',
    accent: 'var(--pf-blue-700)',
    border: 'rgba(20, 144, 126, 0.2)',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastRecord
  onDismiss: () => void
}) {
  const [visible, setVisible] = useState(false)
  const tone = TONE[toast.kind]

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  return (
    <div
      role="status"
      className="pointer-events-auto flex items-start gap-3 rounded-lg"
      style={{
        padding: '14px 16px',
        backgroundColor: 'var(--pf-white)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
        border: `1px solid ${tone.border}`,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 200ms ease-out, transform 200ms ease-out',
      }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0 rounded-full"
        style={{
          width: '32px',
          height: '32px',
          backgroundColor: tone.bg,
          color: tone.accent,
        }}
      >
        {tone.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: 'var(--pf-grey-900)',
            margin: 0,
          }}
        >
          {toast.title}
        </p>
        {toast.description && (
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--pf-grey-600)',
              marginTop: '2px',
              margin: 0,
            }}
          >
            {toast.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="flex-shrink-0 p-1 rounded"
        style={{ color: 'var(--pf-grey-600)' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
