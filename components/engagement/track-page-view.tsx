'use client'

// Authority-3: client component that fires a single trackEngagement() call
// when mounted. Drop into a server-rendered page to record a page_view (or
// any other engagement event) without converting the page to a client
// component. Debouncing is handled inside trackEngagement, so multiple
// renders at the same key within 30 s collapse to one log row.

import { useEffect } from 'react'
import { trackEngagement } from '@/lib/engagement/track'
import type { EventCategory, EventType } from '@/lib/engagement/constants'

type TrackPageViewProps = {
  eventType?: EventType
  eventCategory?: EventCategory | null
  eventDetail?: string | null
}

export function TrackPageView({
  eventType = 'page_view',
  eventCategory = null,
  eventDetail = null,
}: TrackPageViewProps) {
  useEffect(() => {
    trackEngagement(eventType, eventCategory, eventDetail)
  }, [eventType, eventCategory, eventDetail])

  return null
}
