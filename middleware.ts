import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
  ]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Auth routes (redirect to dashboard if already logged in)
  const authRoutes = ['/auth/sign-in', '/auth/sign-up']
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/sign-in', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Routing by account type (student vs parent). /parent/join is an onboarding
  // surface and must stay accessible regardless of account state.
  if (session && !pathname.startsWith('/onboarding') && !pathname.startsWith('/auth')) {
    const [{ data: student }, { data: parent }] = await Promise.all([
      supabase.from('students').select('id').eq('id', session.user.id).maybeSingle(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from('parents').select('id').eq('user_id', session.user.id).maybeSingle(),
    ])

    // Parents must not access the student dashboard and student-only surfaces
    const studentOnlyPrefixes = ['/dashboard', '/saved', '/grades', '/quiz', '/prep']
    if (parent && studentOnlyPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
      return NextResponse.redirect(new URL('/parent/dashboard', request.url))
    }

    // Students must not access parent dashboard pages (join flow stays open)
    if (!parent && student && pathname.startsWith('/parent/dashboard')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // If signed in but neither profile exists, send to onboarding. Exception:
    // /parent/join is where unlinked parent-shaped accounts complete their
    // setup, so don't bounce them back to the student onboarding flow.
    if (!student && !parent && !pathname.startsWith('/parent/join')) {
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
