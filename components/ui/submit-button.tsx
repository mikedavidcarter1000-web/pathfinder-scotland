'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
  variant?: Variant
  fullWidth?: boolean
  children: ReactNode
}

const variantClass: Record<Variant, string> = {
  primary: 'pf-btn-primary',
  secondary: 'pf-btn-secondary',
  ghost: 'pf-btn-ghost',
  danger: 'pf-btn-primary',
}

export function SubmitButton({
  isLoading = false,
  loadingText,
  variant = 'primary',
  fullWidth = false,
  children,
  disabled,
  className = '',
  style,
  ...rest
}: SubmitButtonProps) {
  const base = variantClass[variant]
  const dangerStyle: React.CSSProperties =
    variant === 'danger'
      ? { backgroundColor: 'var(--pf-red-500)', color: '#fff' }
      : {}

  return (
    <button
      {...rest}
      disabled={disabled || isLoading}
      className={`${base} ${fullWidth ? 'w-full' : ''} ${className}`.trim()}
      style={{ ...dangerStyle, ...style }}
      aria-busy={isLoading || undefined}
    >
      {isLoading ? (
        <>
          <Spinner />
          <span>{loadingText ?? 'Please wait...'}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="animate-spin"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M22 12a10 10 0 00-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
