import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function reasonForPath(pathname: string): string | null {
  if (pathname.startsWith('/compare')) return 'compare'
  if (pathname.startsWith('/saved')) return 'saved'
  if (pathname.startsWith('/dashboard')) return 'dashboard'
  if (pathname.startsWith('/onboarding')) return 'onboarding'
  return null
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // TODO [security, medium]: replace getSession() with getUser() for the
  // protected-route gate. getSession() reads the cookie without re-verifying
  // the JWT with the auth server, so a stolen/expired-but-revoked token could
  // pass the middleware redirect check. RLS still enforces real access on the
  // data layer, so this is defence-in-depth only.
  const { data: { session } } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname

  // Protected routes (require auth)
  const protectedRoutes = [
    '/dashboard',
    '/saved',
    '/compare',
    '/grades',
    '/profile',
    '/onboarding',
    '/admin',
    '/parent/dashboard',
    '/parent/choices',
    '/school/dashboard',
    '/school/settings',
    '/school/subscribe',
    '/school/tracking',
    '/school/departments',
    '/school/reports',
    '/school/choices',
    '/school/guidance',
    '/school/analytics',
    '/school/inspection',
    '/school/parents-evening',
    '/school/notifications',
    '/school/dyw',
    '/school/cpd',
    '/school/import',
    '/student/choices',
    '/wellbeing',
    '/notifications',
  ]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Auth routes (redirect to dashboard if already logged in)
  const authRoutes = ['/auth/sign-in', '/auth/sign-up']
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/sign-in', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    // Contextual reason for the sign-in page banner (optional).
    const reason = reasonForPath(pathname)
    if (reason) redirectUrl.searchParams.set('reason', reason)
    return NextResponse.redirect(redirectUrl)
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Routing by account type (student vs parent vs school staff). /parent/join
  // and /school/register / /school/join are onboarding surfaces and must stay
  // accessible regardless of account state.
  if (session && !pathname.startsWith('/onboarding') && !pathname.startsWith('/auth')) {
    const [{ data: student }, { data: parent }, { data: staff }] = await Promise.all([
      supabase.from('students').select('id').eq('id', session.user.id).maybeSingle(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from('parents').select('id').eq('user_id', session.user.id).maybeSingle(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from('school_staff').select('user_id').eq('user_id', session.user.id).maybeSingle(),
    ])

    // School staff must not access student or parent dashboards; land on /school/dashboard instead
    const studentOnlyPrefixes = ['/dashboard', '/saved', '/grades', '/quiz', '/prep', '/student/choices', '/wellbeing']
    if (staff && (pathname === '/dashboard' || studentOnlyPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/')) || pathname.startsWith('/parent/dashboard') || pathname.startsWith('/parent/choices') || pathname.startsWith('/parent/parents-evening'))) {
      return NextResponse.redirect(new URL('/school/dashboard', request.url))
    }

    // Parents must not access the student dashboard and student-only surfaces
    if (parent && studentOnlyPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
      return NextResponse.redirect(new URL('/parent/dashboard', request.url))
    }

    // Students and parents must not access the school dashboard
    if (!staff && (pathname.startsWith('/school/dashboard') || pathname.startsWith('/school/settings') || pathname.startsWith('/school/tracking') || pathname.startsWith('/school/departments') || pathname.startsWith('/school/reports') || pathname.startsWith('/school/choices') || pathname.startsWith('/school/guidance') || pathname.startsWith('/school/analytics') || pathname.startsWith('/school/inspection') || pathname.startsWith('/school/parents-evening') || pathname.startsWith('/school/notifications') || pathname.startsWith('/school/dyw') || pathname.startsWith('/school/cpd') || pathname.startsWith('/school/import'))) {
      if (parent) return NextResponse.redirect(new URL('/parent/dashboard', request.url))
      if (student) return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Students must not access parent choice pages
    if (student && !parent && pathname.startsWith('/parent/choices')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Students must not access parent dashboard pages (join flow stays open)
    if (!parent && student && pathname.startsWith('/parent/dashboard')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // If signed in but no profile exists, send to onboarding. Exceptions for
    // in-flight onboarding surfaces: parent/join and school/register+join.
    if (
      !student &&
      !parent &&
      !staff &&
      !pathname.startsWith('/parent/join') &&
      !pathname.startsWith('/parent/welcome') &&
      !pathname.startsWith('/school/register') &&
      !pathname.startsWith('/school/join')
    ) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
