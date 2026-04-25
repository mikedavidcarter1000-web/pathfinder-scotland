// Authority-3: client-side engagement event tracker.
// Inserts into platform_engagement_log via Supabase; fire-and-forget.
//
// Behaviour:
//   * Silently no-ops when the current user is not a student (school staff,
//     LA staff, parents, or signed-out visitors generate no rows).
//   * Looks up the caller's school_id once per session and caches it.
//   * Debounces page_view events at the (event_category, event_detail) key
//     for 30 s to keep rapid back-and-forth navigation from flooding the log.
//   * Never throws to callers and never blocks the UI -- errors land in
//     console.warn so client telemetry is best-effort.

import { getSupabaseClient } from '@/lib/supabase'
import type { EventCategory, EventType } from './constants'

type StudentContext = {
  studentId: string
  schoolId: string | null
}

let cachedContext: StudentContext | null = null
let cacheLookupPromise: Promise<StudentContext | null> | null = null

const PAGE_VIEW_DEBOUNCE_MS = 30_000
const recentPageViews = new Map<string, number>()

function debounceKey(eventCategory: EventCategory | null, eventDetail: string | null): string {
  return `${eventCategory ?? '*'}::${eventDetail ?? '*'}`
}

async function loadContext(): Promise<StudentContext | null> {
  const supabase = getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // Only students appear in the students table. School staff / parents share
  // auth.users but live in school_staff / parents respectively, so a missing
  // students row is the canonical "not a student" signal.
  const { data: student, error } = await supabase
    .from('students')
    .select('id, school_id, user_type')
    .eq('id', user.id)
    .maybeSingle()

  if (error || !student) return null
  if (student.user_type && student.user_type !== 'student') return null

  return { studentId: student.id, schoolId: student.school_id ?? null }
}

async function getContext(): Promise<StudentContext | null> {
  if (cachedContext) return cachedContext
  if (cacheLookupPromise) return cacheLookupPromise
  cacheLookupPromise = loadContext()
    .then((ctx) => {
      cachedContext = ctx
      return ctx
    })
    .catch(() => null)
    .finally(() => {
      cacheLookupPromise = null
    })
  return cacheLookupPromise
}

/**
 * Reset the cached student context. Call after sign-in / sign-out so the
 * next event does a fresh lookup. Safe to call when the cache is empty.
 */
export function resetEngagementContext(): void {
  cachedContext = null
  cacheLookupPromise = null
  recentPageViews.clear()
}

/**
 * Log an engagement event. Fire-and-forget; never awaited by callers.
 * Returns immediately so the UI thread is never blocked.
 */
export function trackEngagement(
  eventType: EventType,
  eventCategory: EventCategory | null = null,
  eventDetail: string | null = null,
): void {
  if (typeof window === 'undefined') return // server bail

  // Debounce repeated page_view events so navigating in/out of a page in
  // < 30 s does not double-count.
  if (eventType === 'page_view') {
    const key = debounceKey(eventCategory, eventDetail)
    const now = Date.now()
    const last = recentPageViews.get(key)
    if (last && now - last < PAGE_VIEW_DEBOUNCE_MS) return
    recentPageViews.set(key, now)
  }

  void getContext().then((ctx) => {
    if (!ctx) return
    const supabase = getSupabaseClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void (supabase as any)
      .from('platform_engagement_log')
      .insert({
        student_id: ctx.studentId,
        school_id: ctx.schoolId,
        event_type: eventType,
        event_category: eventCategory,
        event_detail: eventDetail,
      })
      .then((res: { error: unknown }) => {
        if (res.error) {
          // Best-effort logging only; the dashboard is allowed to miss
          // events and the user must never see this fail.
          // eslint-disable-next-line no-console
          console.warn('[engagement] insert failed:', res.error)
        }
      })
  })
}
