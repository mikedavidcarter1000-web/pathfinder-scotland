export type ErrorKind =
  | 'auth'
  | 'db-unavailable'
  | 'not-found'
  | 'network'
  | 'generic'

export interface ClassifiedError {
  kind: ErrorKind
  title: string
  message: string
}

interface RawErrorShape {
  code?: string | number
  status?: number
  message?: string
  name?: string
}

/**
 * Inspect an error thrown by Supabase / fetch / React Query and return a
 * friendly classification so UI can decide what to show (inline error, auth
 * redirect, friendly DB-unavailable banner, etc).
 */
const GENERIC_FRIENDLY_MESSAGE =
  "We're having trouble loading this page. Please try again."

/**
 * Returns true for messages that should never be shown to users — React
 * minified error codes, raw stack traces, or opaque internal errors.
 */
function isInternalErrorMessage(message: string): boolean {
  if (!message) return true
  const m = message.toLowerCase()
  return (
    m.includes('minified react error') ||
    m.includes('react error #') ||
    m.startsWith('error: ') && m.includes('react') ||
    // Raw Supabase/Postgres schema errors should never be surfaced raw either.
    m.includes('database error querying schema') ||
    m.includes('error querying schema') ||
    // Anything starting with "typeerror:" / "referenceerror:" is a crash, not user-actionable.
    /^(typeerror|referenceerror|syntaxerror|rangeerror):/i.test(message.trim())
  )
}

export function classifyError(error: unknown): ClassifiedError {
  if (!error) {
    return {
      kind: 'generic',
      title: 'Something went wrong',
      message: GENERIC_FRIENDLY_MESSAGE,
    }
  }

  const raw = error as RawErrorShape
  const message = (raw.message || '').toLowerCase()
  const code = String(raw.code ?? '')
  const status = raw.status ?? 0

  // Auth expiry / missing session
  if (
    status === 401 ||
    code === '401' ||
    code === 'PGRST301' ||
    message.includes('jwt expired') ||
    message.includes('invalid jwt') ||
    message.includes('not authenticated')
  ) {
    return {
      kind: 'auth',
      title: 'Session expired',
      message: 'Your session has expired. Please sign in again.',
    }
  }

  // Not found (PostgREST returns PGRST116 when .single() has no rows)
  if (code === 'PGRST116' || status === 404) {
    return {
      kind: 'not-found',
      title: 'Not found',
      message: "We couldn't find what you were looking for.",
    }
  }

  // Database paused / unavailable (Supabase free tier pauses idle projects)
  if (
    status === 503 ||
    status === 502 ||
    code === '503' ||
    message.includes('database is paused') ||
    message.includes('service unavailable') ||
    message.includes('fetchfailed') ||
    message.includes('failed to fetch')
  ) {
    return {
      kind: 'db-unavailable',
      title: 'Temporarily unavailable',
      message: "We're temporarily unavailable. Please try again in a few minutes.",
    }
  }

  // Network / offline
  if (
    raw.name === 'NetworkError' ||
    message.includes('networkerror') ||
    message.includes('network request failed')
  ) {
    return {
      kind: 'network',
      title: 'Connection problem',
      message: "We can't reach the server. Please check your internet connection.",
    }
  }

  return {
    kind: 'generic',
    title: 'Something went wrong',
    message:
      raw.message && !isInternalErrorMessage(raw.message)
        ? raw.message
        : GENERIC_FRIENDLY_MESSAGE,
  }
}

/**
 * Convenience boolean — true when the classified error indicates the user's
 * session is no longer valid and they should be bounced to /auth/sign-in.
 */
export function isAuthError(error: unknown): boolean {
  return classifyError(error).kind === 'auth'
}
