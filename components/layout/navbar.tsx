'use client'

import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth, useSignOut } from '@/hooks/use-auth'
import { useHasAcceptedOffer } from '@/hooks/use-offers'
import { UserMenu } from '@/components/auth/user-menu'
import { getInitials } from '@/lib/utils'

const SearchBar = lazy(() =>
  import('@/components/ui/search-bar').then((m) => ({ default: m.SearchBar }))
)

type NavItem = {
  name: string
  href: string
  hideForParents?: boolean
}

type NavGroup = {
  name: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    name: 'Explore',
    items: [
      { name: 'Discover', href: '/discover' },
      { name: 'Careers', href: '/careers' },
      { name: 'Compare careers', href: '/careers/compare' },
      { name: 'AI & Careers', href: '/ai-careers' },
      { name: 'Subjects', href: '/subjects' },
    ],
  },
  {
    name: 'Plan',
    items: [
      { name: 'Plan Choices', href: '/pathways' },
      { name: 'Simulator', href: '/simulator' },
      { name: 'Alternatives', href: '/pathways/alternatives' },
    ],
  },
  {
    name: 'Browse',
    items: [
      { name: 'Courses', href: '/courses' },
      { name: 'Compare by subject', href: '/compare/subjects' },
      { name: 'Compare saved courses', href: '/compare' },
      { name: 'Universities', href: '/universities' },
      { name: 'Colleges', href: '/colleges' },
    ],
  },
  {
    name: 'Tools',
    items: [
      { name: 'Career Quiz', href: '/quiz' },
      { name: 'Cost Calculator', href: '/tools/roi-calculator' },
      { name: 'Grade Sensitivity', href: '/tools/grade-sensitivity' },
      { name: 'Results Day', href: '/results-day' },
    ],
  },
  {
    name: 'Support',
    items: [
      { name: 'Support Hub', href: '/support' },
      { name: 'Widening Access', href: '/widening-access' },
      { name: 'Bursaries & Funding', href: '/bursaries' },
      { name: 'Benefits', href: '/benefits' },
      { name: 'Student Offers', href: '/offers' },
      { name: 'Starting Uni Checklist', href: '/starting-uni' },
      { name: 'Parents', href: '/parents', hideForParents: true },
      { name: 'Blog', href: '/blog' },
    ],
  },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, student, parent, isLoading } = useAuth()
  const signOut = useSignOut()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<Set<string>>(new Set())
  const navRef = useRef<HTMLDivElement>(null)

  const isParent = !!parent || student?.user_type === 'parent'
  const { hasAccepted } = useHasAcceptedOffer()
  const dashboardHref = isParent ? '/parent/dashboard' : '/dashboard'

  // Parents see a stripped-down nav: Dashboard, Help, Contact, plus the logo
  // and sign-out. Student-side Explore/Plan/Browse/Tools/Support groups are
  // hidden because parent accounts are intentionally scoped to a read-only
  // view of their linked child's progress.
  const filteredGroups = isParent
    ? []
    : NAV_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) => !(item.hideForParents && isParent)),
      })).filter((group) => group.items.length > 0)

  const isActive = (href: string) => {
    if (href === '/pathways') return pathname === href
    // /careers is a sector listing; /careers/compare is a sibling surface.
    // Don't let the listing "win" the active state on the compare page.
    if (href === '/careers') {
      return pathname === href || (pathname.startsWith('/careers/') && pathname !== '/careers/compare')
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  const isGroupActive = (group: NavGroup) => group.items.some((it) => isActive(it.href))

  useEffect(() => {
    setMobileMenuOpen(false)
    setOpenGroup(null)
  }, [pathname])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenGroup(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroup(null)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const toggleMobileGroup = (name: string) => {
    setMobileExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const handleSignOut = async () => {
    await signOut.mutateAsync()
    setMobileMenuOpen(false)
    router.push('/')
  }

  const displayName = parent?.full_name
    ? parent.full_name
    : student?.first_name
    ? `${student.first_name} ${student.last_name || ''}`
    : user?.email || 'User'

  const initials = parent?.full_name
    ? getInitials(parent.full_name)
    : student?.first_name
    ? getInitials(`${student.first_name} ${student.last_name || ''}`)
    : user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <>
      <nav
        className="sticky top-0 z-50"
        style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--pf-grey-200, #E5E7EB)' }}
      >
        <div className="max-w-[1200px] mx-auto px-4">
          <div
            ref={navRef}
            className="flex items-center justify-between gap-4"
            style={{ height: '64px' }}
          >
            {/* Logo */}
            <Link
              href={user ? dashboardHref : '/'}
              className="flex items-center no-underline hover:no-underline"
              style={{ flexShrink: 0, color: '#1B3A5C' }}
              aria-label="Pathfinder Scotland — home"
            >
              <Image
                src="/logo-full.png"
                alt="Pathfinder Scotland"
                width={106}
                height={44}
                priority
                className="hidden sm:block"
                style={{ height: '44px', width: 'auto' }}
              />
              <Image
                src="/logo-icon.png"
                alt="Pathfinder Scotland"
                width={39}
                height={36}
                priority
                className="sm:hidden"
                style={{ height: '36px', width: 'auto' }}
              />
            </Link>

            {/* Desktop Navigation (lg and up) */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center min-w-0">
              {user && (
                <Link
                  href={dashboardHref}
                  className="px-3 py-2 text-sm no-underline hover:no-underline"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    color: '#1B3A5C',
                    opacity: pathname === dashboardHref ? 1 : 0.82,
                    borderBottom: pathname === dashboardHref ? '2px solid #1B3A5C' : '2px solid transparent',
                  }}
                >
                  Dashboard
                </Link>
              )}

              {user && isParent && (
                <>
                  <Link
                    href="/for-parents"
                    className="px-3 py-2 text-sm no-underline hover:no-underline"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      color: '#1B3A5C',
                      opacity: pathname === '/for-parents' ? 1 : 0.82,
                    }}
                  >
                    Help
                  </Link>
                  <Link
                    href="/contact"
                    className="px-3 py-2 text-sm no-underline hover:no-underline"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      color: '#1B3A5C',
                      opacity: pathname === '/contact' ? 1 : 0.82,
                    }}
                  >
                    Contact
                  </Link>
                </>
              )}

              {user && !isParent && hasAccepted && (
                <Link
                  href="/prep"
                  className="px-3 py-2 text-sm no-underline hover:no-underline"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    color: '#1B3A5C',
                    opacity: pathname.startsWith('/prep') ? 1 : 0.82,
                    borderBottom: pathname.startsWith('/prep') ? '2px solid #1B3A5C' : '2px solid transparent',
                  }}
                >
                  Prep Hub
                </Link>
              )}

              {filteredGroups.map((group) => {
                const active = isGroupActive(group)
                const open = openGroup === group.name
                return (
                  <div
                    key={group.name}
                    className="relative"
                    onMouseEnter={() => setOpenGroup(group.name)}
                    onMouseLeave={() => setOpenGroup(null)}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenGroup(open ? null : group.name)}
                      className="flex items-center gap-1 px-3 py-2 text-sm transition-colors"
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        color: '#1B3A5C',
                        opacity: active || open ? 1 : 0.82,
                        borderBottom: active ? '2px solid #1B3A5C' : '2px solid transparent',
                        background: 'transparent',
                      }}
                      aria-expanded={open}
                      aria-haspopup="true"
                    >
                      {group.name}
                      <svg
                        className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {open && (
                      <div
                        className="absolute left-0 z-50"
                        style={{
                          top: '100%',
                          paddingTop: '4px',
                          minWidth: '220px',
                        }}
                        role="menu"
                      >
                        <div
                          style={{
                            backgroundColor: 'var(--pf-white)',
                            borderRadius: '8px',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                            padding: '8px 0',
                          }}
                        >
                          {group.items.map((item) => {
                            const itemActive = isActive(item.href)
                            return (
                              <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setOpenGroup(null)}
                                className="block px-4 py-2 text-sm no-underline hover:no-underline transition-colors"
                                style={{
                                  fontFamily: "'Space Grotesk', sans-serif",
                                  fontWeight: 600,
                                  color: itemActive ? 'var(--pf-blue-700)' : 'var(--pf-grey-900)',
                                  backgroundColor: itemActive ? 'var(--pf-blue-50)' : 'transparent',
                                }}
                                onMouseEnter={(e) => {
                                  if (!itemActive) e.currentTarget.style.backgroundColor = 'var(--pf-blue-50)'
                                }}
                                onMouseLeave={(e) => {
                                  if (!itemActive) e.currentTarget.style.backgroundColor = 'transparent'
                                }}
                                role="menuitem"
                              >
                                {item.name}
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Right Side (pinned) */}
            <div className="flex items-center gap-1 sm:gap-2" style={{ flexShrink: 0 }}>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="hidden sm:inline-flex p-2 rounded-lg transition-colors items-center justify-center"
                style={{
                  color: '#1B3A5C',
                  backgroundColor: searchOpen ? 'rgba(27,58,92,0.08)' : 'transparent',
                  minWidth: '44px',
                  minHeight: '44px',
                }}
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {isLoading ? (
                <div className="w-8 h-8 rounded-full animate-pulse hidden lg:block" style={{ backgroundColor: 'rgba(27,58,92,0.12)' }} />
              ) : user ? (
                <div className="hidden lg:block">
                  <UserMenu />
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <Link
                    href="/auth/sign-in"
                    className="px-3 py-2 text-sm no-underline hover:no-underline"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: '#1B3A5C', opacity: 0.85 }}
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
                      backgroundColor: '#1B3A5C',
                      color: '#FFFFFF',
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

              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden rounded-lg transition-colors inline-flex items-center justify-center"
                style={{ color: '#1B3A5C', minWidth: '44px', minHeight: '44px' }}
                aria-label="Open menu"
                aria-expanded={mobileMenuOpen}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {searchOpen && (
            <div className="py-3" style={{ borderTop: '1px solid var(--pf-grey-200, #E5E7EB)' }}>
              <Suspense
                fallback={
                  <div
                    className="max-w-xl mx-auto h-12 rounded-lg pf-skeleton"
                    aria-hidden="true"
                  />
                }
              >
                <SearchBar
                  autoFocus
                  placeholder="Search courses, universities..."
                  className="max-w-xl mx-auto"
                  onClose={() => setSearchOpen(false)}
                />
              </Suspense>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Slide-in Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100]">
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

            <div className="flex-1 overflow-y-auto px-3 py-4">
              <nav className="flex flex-col gap-1">
                {user && (
                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 rounded-lg text-white no-underline hover:no-underline"
                    style={{
                      minHeight: '48px',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontSize: '1rem',
                      backgroundColor: pathname === dashboardHref ? 'rgba(255,255,255,0.12)' : 'transparent',
                    }}
                  >
                    Dashboard
                  </Link>
                )}
                {user && isParent && (
                  <>
                    <Link
                      href="/for-parents"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-4 rounded-lg text-white no-underline hover:no-underline"
                      style={{
                        minHeight: '48px',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        fontSize: '1rem',
                      }}
                    >
                      Help
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-4 rounded-lg text-white no-underline hover:no-underline"
                      style={{
                        minHeight: '48px',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        fontSize: '1rem',
                      }}
                    >
                      Contact
                    </Link>
                  </>
                )}
                {user && !isParent && hasAccepted && (
                  <Link
                    href="/prep"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 rounded-lg text-white no-underline hover:no-underline"
                    style={{
                      minHeight: '48px',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontSize: '1rem',
                      backgroundColor: pathname.startsWith('/prep') ? 'rgba(255,255,255,0.12)' : 'transparent',
                    }}
                  >
                    Prep Hub
                  </Link>
                )}

                {filteredGroups.map((group) => {
                  const expanded = mobileExpanded.has(group.name)
                  const groupActive = isGroupActive(group)
                  return (
                    <div key={group.name} className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => toggleMobileGroup(group.name)}
                        className="flex items-center justify-between px-4 rounded-lg text-white transition-colors"
                        style={{
                          minHeight: '48px',
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 600,
                          fontSize: '1rem',
                          backgroundColor: expanded || groupActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                          textAlign: 'left',
                        }}
                        aria-expanded={expanded}
                      >
                        <span>{group.name}</span>
                        <svg
                          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {expanded && (
                        <div className="flex flex-col gap-1 pl-3 mt-1 mb-2">
                          {group.items.map((item) => {
                            const active = isActive(item.href)
                            return (
                              <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center px-4 rounded-lg text-white no-underline hover:no-underline transition-colors"
                                style={{
                                  minHeight: '44px',
                                  fontFamily: "'Space Grotesk', sans-serif",
                                  fontWeight: 500,
                                  fontSize: '0.9375rem',
                                  backgroundColor: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                                  opacity: active ? 1 : 0.85,
                                }}
                              >
                                {item.name}
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </nav>
            </div>

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
