'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

interface SaveOfferButtonProps {
  offerId: string
  initialIsSaved: boolean
  returnUrl?: string
  size?: 'sm' | 'md'
  onToggle?: (next: boolean) => void
}

export function SaveOfferButton({
  offerId,
  initialIsSaved,
  returnUrl = '/offers',
  size = 'md',
  onToggle,
}: SaveOfferButtonProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const dimension = size === 'sm' ? 32 : 40
  const iconSize = size === 'sm' ? 16 : 18

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isSubmitting || isLoading) return

    if (!user) {
      router.push(`/auth/sign-in?redirect=${encodeURIComponent(returnUrl)}`)
      return
    }

    const next = !isSaved
    // Optimistic update
    setIsSaved(next)
    onToggle?.(next)
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/offers/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_id: offerId }),
      })
      if (!res.ok) throw new Error('save failed')
      const body = (await res.json()) as { saved: boolean }
      if (body.saved !== next) {
        setIsSaved(body.saved)
        onToggle?.(body.saved)
      }
      // Fire a non-blocking click log so engagement metrics capture saves
      fetch('/api/offers/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: offerId,
          click_type: next ? 'save' : 'unsave',
          referrer_page: typeof window !== 'undefined' ? window.location.pathname : null,
        }),
      }).catch(() => {})
    } catch {
      // Revert on error
      setIsSaved(!next)
      onToggle?.(!next)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isSaved ? 'Remove from saved' : 'Save offer'}
      aria-pressed={isSaved}
      disabled={isSubmitting || isLoading}
      className="inline-flex items-center justify-center rounded-full transition-colors"
      style={{
        width: dimension,
        height: dimension,
        border: '1px solid var(--pf-grey-300)',
        backgroundColor: isSaved ? 'rgba(239, 68, 68, 0.08)' : 'var(--pf-white)',
        color: isSaved ? '#DC2626' : 'var(--pf-grey-600)',
        cursor: isSubmitting || isLoading ? 'default' : 'pointer',
        flexShrink: 0,
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={isSaved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    </button>
  )
}
