'use client'

import { useCallback, useMemo } from 'react'
import { useStudentSubjectChoices, type ChoiceTransition } from '@/hooks/use-subjects'
import { useToast } from '@/components/ui/toast'
import type { Tables } from '@/types/database'

type Student = Tables<'students'>
type SchoolStage = Student['school_stage']

// Map current school_stage → the transition the student would have just
// planned (e.g. an S3 student is planning S3→S4) and the corresponding
// simulator stage (the year being chosen).
const STAGE_TO_TRANSITION: Record<string, { transition: ChoiceTransition; simStage: string }> = {
  s2: { transition: 's2_to_s3', simStage: 's3' },
  s3: { transition: 's3_to_s4', simStage: 's4' },
  s4: { transition: 's4_to_s5', simStage: 's5' },
  s5: { transition: 's5_to_s6', simStage: 's6' },
}

export function ShareWithParentButton({ student }: { student: Student }) {
  const toast = useToast()
  const stage = student.school_stage
  const mapping = stage ? STAGE_TO_TRANSITION[stage] : undefined
  const { data: choices } = useStudentSubjectChoices(mapping?.transition)

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    if (!mapping) return `${window.location.origin}/simulator`
    const params = new URLSearchParams()
    params.set('stage', mapping.simStage)
    const ids = (choices ?? []).map((c) => c.subject_id).filter(Boolean)
    if (ids.length > 0) params.set('subjects', ids.join(','))
    return `${window.location.origin}/simulator?${params.toString()}`
  }, [mapping, choices])

  const handleShare = useCallback(async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success(
        'Link copied',
        'Send this to a parent so they can see your subject choices.'
      )
    } catch {
      toast.info('Copy this link', shareUrl)
    }
  }, [shareUrl, toast])

  return (
    <button
      type="button"
      onClick={handleShare}
      className="pf-btn pf-btn-secondary pf-btn-sm"
      style={{ minHeight: '40px', width: '100%' }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      Share with a parent
    </button>
  )
}

// Re-exported helper so callers can check whether the button is meaningful
// (no point rendering it for college / mature students with no transition).
export function canShareWithParent(stage: SchoolStage): boolean {
  return !!stage && stage in STAGE_TO_TRANSITION
}
