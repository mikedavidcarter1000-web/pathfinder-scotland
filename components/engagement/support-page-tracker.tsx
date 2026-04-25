'use client'

// Authority-3: pathname-driven support hub tracker. Lives in the support
// layout so every /support/[group] page gets a resource_view event without
// each sub-page needing its own trackEngagement call. The /support index
// page itself emits a page_view (no slug).

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackEngagement } from '@/lib/engagement/track'

export function SupportPageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return
    if (pathname === '/support' || pathname === '/support/') {
      trackEngagement('page_view', 'support', null)
      return
    }
    const match = pathname.match(/^\/support\/([^/]+)/)
    if (match) {
      trackEngagement('resource_view', 'support', match[1])
    }
  }, [pathname])

  return null
}
