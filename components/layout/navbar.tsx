'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth, useSignOut } from '@/hooks/use-auth'
import { UserMenu } from '@/components/auth/user-menu'
import { SearchBar } from '@/components/ui/search-bar'
import { getInitials } from '@/lib/utils'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, student, isLoading } = useAuth()
  const signOut = useSignOut()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const isParent = student?.user_type === 'parent'

  // Nav items are tagged with `auth` (signed-in only) and `studentOnly`
  // (hidden for parent accounts). The `parentOnly` flag is the inverse for
  // surfacing the Parents landing page to non-parents.
  const navigation = [
    { name: 'Discover', href: '/discover', auth: false },
    { name: 'Dashboard', href: '/dashboard', auth: true },
    { name: 'Careers', href: '/careers', auth: false },
    { name: 'Subjects', href: '/subjects', auth: false },
    { name: 'Plan Choices', href: '/pathways', auth: false },
    { name: 'Simulator', href: '/simulator', auth: false },
    { name: 'Courses', href: '/courses', auth: false },
    { name: 'Universities', href: '/universities', auth: false },
    { name: 'Widening Access', href: '/widening-access', auth: false },
    { name: 'Parents', href: '/parents', auth: false, parentOnly: false, hideForParents: true },
    { name: 'Saved', href: '/saved', auth: true, studentOnly: true },
    { name: 'Compare', href: '/compare', auth: true, studentOnly: true },
  ] as const

  const filteredNav = navigation.filter((item) => {
    if (item.auth && !user) return false
    if ('studentOnly' in item && item.studentOnly && isParent) return false
    if ('hideForParents' in item && item.hideForParents && isParent) return false
    return true
  })

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href
    return pathname.startsWith(href)
  }

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const handleSignOut = async () => {
    await signOut.mutateAsync()
    setMobileMenuOpen(false)
    router.push('/')
  }

  const displayName = student?.first_name
    ? `${student.first_name} ${student.last_name || ''}`
    : user?.email || 'User'

  const initials = student?.first_name
    ? getInitials(`${student.first_name} ${student.last_name || ''}`)
    : user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <>
      <nav
        className="sticky top-0 z-50"
        style={{ backgroundColor: 'var(--pf-blue-900)' }}
      >
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center justify-between" style={{ height: '64px' }}>
            {/* Logo */}
            <Link
              href={user ? '/dashboard' : '/'}
              className="flex items-center gap-2 text-white no-underline hover:no-underline"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-white.svg"
                alt=""
                role="presentation"
                width={32}
                height={32}
                style={{ display: 'block', flexShrink: 0 }}
              />
              <span
                className="text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.125rem' }}
              >
                Pathfinder Scotland
              </span>
            </Link>

            {/* Desktop Navigation (lg and up) */}
            <div className="hidden lg:flex items-center gap-1">
              {filteredNav.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="px-3 py-2 text-sm text-white no-underline hover:no-underline transition-colors relative"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      opacity: active ? 1 : 0.82,
                      borderBottom: active ? '2px solid #fff' : '2px solid transparent',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = active ? '1' : '0.82')}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search Button (hidden on mobile) */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="hidden sm:inline-flex p-2 rounded-lg transition-colors text-white items-center justify-center"
                style={{
                  backgroundColor: searchOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
                  minWidth: '44px',
                  minHeight: '44px',
                }}
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Auth — desktop (lg+) */}
              {isLoading ? (
                <div className="w-8 h-8 rounded-full animate-pulse hidden lg:block" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
              ) : user ? (
                <div className="hidden lg:block">
                  <UserMenu />
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <Link
                    href="/auth/sign-in"
                    className="px-3 py-2 text-sm text-white no-underline hover:no-underline"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, opacity: 0.85 }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.85')}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    className="no-underline hover:no-underline"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '8px 16px',
                      backgroundColor: '#fff',
                      color: 'var(--pf-blue-900)',
                      borderRadius: '8px',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.875rem',
                    }}
                  >
                    Sign up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button (hamburger) — visible below lg */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden rounded-lg transition-colors text-white inline-flex items-center justify-center"
                style={{ minWidth: '44px', minHeight: '44px' }}
                aria-label="Open menu"
                aria-expanded={mobileMenuOpen}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search Bar (Expandable) */}
          {searchOpen && (
            <div className="py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
              <SearchBar
                autoFocus
                placeholder="Search courses, universities..."
                className="max-w-xl mx-auto"
                onClose={() => setSearchOpen(false)}
              />
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Slide-in Panel (below lg breakpoint) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100]">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: 'rgba(0, 45, 114, 0.6)',
              backdropFilter: 'blur(2px)',
              animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            className="absolute right-0 top-0 bottom-0 flex flex-col"
            style={{
              width: 'min(85vw, 340px)',
              backgroundColor: 'var(--pf-blue-900)',
              boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.2)',
              animation: 'pf-slide-in-right 0.25s ease-out',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            {/* Panel header */}
            <div
              className="flex items-center justify-between px-4"
              style={{
                height: '64px',
                borderBottom: '1px solid rgba(255,255,255,0.12)',
                flexShrink: 0,
              }}
            >
              <span
                className="text-white"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: '1rem',
                }}
              >
                Menu
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-white rounded-lg inline-flex items-center justify-center"
                style={{ minWidth: '44px', minHeight: '44px' }}
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav links (scrollable) */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <nav className="flex flex-col gap-1">
                {filteredNav.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-4 rounded-lg text-white no-underline hover:no-underline transition-colors"
                      style={{
                        minHeight: '48px',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        fontSize: '1rem',
                        backgroundColor: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                        opacity: active ? 1 : 0.9,
                      }}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Footer: user info + sign out, or sign-in CTAs */}
            <div
              className="px-4 py-4"
              style={{
                borderTop: '1px solid rgba(255,255,255,0.12)',
                flexShrink: 0,
              }}
            >
              {isLoading ? (
                <div className="h-12 rounded-lg animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
              ) : user ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        width: '44px',
                        height: '44px',
                        backgroundColor: 'var(--pf-blue-500)',
                      }}
                    >
                      <span
                        className="text-white"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '0.9375rem' }}
                      >
                        {initials}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-white truncate"
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 600,
                          fontSize: '0.9375rem',
                        }}
                      >
                        {displayName}
                      </p>
                      <p
                        className="truncate"
                        style={{
                          color: 'rgba(255,255,255,0.7)',
                          fontSize: '0.8125rem',
                        }}
                      >
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    disabled={signOut.isPending}
                    className="w-full flex items-center justify-center gap-2 rounded-lg transition-colors"
                    style={{
                      minHeight: '48px',
                      padding: '12px 16px',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      color: '#fff',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {signOut.isPending ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/auth/sign-up"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center no-underline hover:no-underline rounded-lg"
                    style={{
                      minHeight: '48px',
                      padding: '12px 16px',
                      backgroundColor: '#fff',
                      color: 'var(--pf-blue-900)',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                    }}
                  >
                    Sign up free
                  </Link>
                  <Link
                    href="/auth/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center no-underline hover:no-underline rounded-lg"
                    style={{
                      minHeight: '48px',
                      padding: '12px 16px',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: '#fff',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                    }}
                  >
                    Sign in
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
