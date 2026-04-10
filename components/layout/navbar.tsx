'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { UserMenu } from '@/components/auth/user-menu'
import { SearchBar } from '@/components/ui/search-bar'

export function Navbar() {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', auth: true },
    { name: 'Subjects', href: '/subjects', auth: false },
    { name: 'Plan Choices', href: '/pathways', auth: false },
    { name: 'Courses', href: '/courses', auth: false },
    { name: 'Universities', href: '/universities', auth: false },
    { name: 'Saved', href: '/saved', auth: true },
    { name: 'Compare', href: '/compare', auth: true },
  ]

  const filteredNav = navigation.filter((item) => !item.auth || user)

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="sticky top-0 z-50"
      style={{ backgroundColor: 'var(--pf-teal-900)' }}
    >
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center justify-between" style={{ height: '64px' }}>
          {/* Logo */}
          <Link
            href={user ? '/dashboard' : '/'}
            className="flex items-center gap-2 text-white no-underline hover:no-underline"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span
              className="hidden sm:block text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.125rem' }}
            >
              Pathfinder
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
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
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg transition-colors text-white"
              style={{ backgroundColor: searchOpen ? 'rgba(255,255,255,0.1)' : 'transparent' }}
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Auth */}
            {isLoading ? (
              <div className="w-8 h-8 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
            ) : user ? (
              <UserMenu />
            ) : (
              <div className="hidden sm:flex items-center gap-2">
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
                    color: 'var(--pf-teal-900)',
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg transition-colors text-white md:hidden"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
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
            />
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.12)',
            backgroundColor: 'var(--pf-teal-900)',
          }}
        >
          <div className="px-4 py-3 space-y-1">
            {filteredNav.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-white no-underline hover:no-underline"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    backgroundColor: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                  }}
                >
                  {item.name}
                </Link>
              )
            })}

            {!user && (
              <div className="pt-3 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                <Link
                  href="/auth/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-center text-sm text-white no-underline hover:no-underline"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-center text-sm no-underline hover:no-underline"
                  style={{
                    backgroundColor: '#fff',
                    color: 'var(--pf-teal-900)',
                    borderRadius: '8px',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                  }}
                >
                  Sign up free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
