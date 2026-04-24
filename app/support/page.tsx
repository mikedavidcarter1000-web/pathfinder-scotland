'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useCurrentStudent } from '@/hooks/use-student'
import { SupportGroupCard } from '@/components/support/SupportGroupCard'
import type { Tables } from '@/types/database'

type Student = Tables<'students'>

interface SupportGroup {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  highlighted?: boolean
}

function getSupportGroups(student: Student | null | undefined): SupportGroup[] {
  return [
    {
      title: 'Young carers',
      description: 'Support for students who care for a family member at home.',
      href: '/support/young-carers',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      highlighted: student?.is_young_carer === true,
    },
    {
      title: 'Estranged students',
      description: 'Guidance for students applying without family support or contact.',
      href: '/support/estranged-students',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
        </svg>
      ),
      highlighted: student?.is_estranged === true || student?.care_experienced === true,
    },
    {
      title: 'Young parents and lone parents',
      description: 'Help balancing study with childcare responsibilities.',
      href: '/support/young-parents',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: 'Disabled students',
      description: 'Access, adjustments, and funding for disabled students.',
      href: '/support/disability',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      highlighted: student?.has_disability === true,
    },
    {
      title: 'LGBTQ+ students',
      description: 'Inclusive advice and peer support resources.',
      href: '/support/lgbtq',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      title: 'Refugees and asylum seekers',
      description: 'Routes into Scottish higher education for refugees.',
      href: '/support/refugees-asylum-seekers',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'ESOL and EAL students',
      description: 'English language support and higher education access options.',
      href: '/support/esol-eal',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      title: 'Mature students and adult returners',
      description: 'Returning to education as an adult learner.',
      href: '/support/mature-students',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Gypsy, Roma and Traveller students',
      description: 'Dedicated support and widening access routes.',
      href: '/support/grt',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      title: 'Home-educated students',
      description: 'Pathways to university and college from home education.',
      href: '/support/home-educated',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: 'Left school without a destination',
      description: 'Routes back into education or training.',
      href: '/support/early-leavers',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Rural and island students',
      description: 'Support for students in remote and island communities.',
      href: '/support/rural-island',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      title: 'Difficult circumstances',
      description: 'Illness, bereavement, or other serious events affecting your grades or application.',
      href: '/support/difficult-circumstances',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      title: 'Extenuating circumstances',
      description: 'Formal processes when illness, bereavement, or crisis affected your exams or studies.',
      href: '/support/extenuating-circumstances',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ]
}

export default function SupportPage() {
  const { user } = useAuth()
  const { data: student } = useCurrentStudent() as {
    data: Student | null | undefined
  }

  // Only highlight if the user is logged in and their profile has loaded
  const resolvedStudent = user ? student : null
  const groups = getSupportGroups(resolvedStudent)
  const showWideningAccessCallout =
    resolvedStudent?.simd_decile === 1 || resolvedStudent?.simd_decile === 2

  return (
    <div className="pf-container pt-8 sm:pt-10 pb-12 sm:pb-16">
      {/* Header */}
      <div style={{ maxWidth: '680px', marginBottom: '24px' }}>
        <h1 style={{ marginBottom: '12px', fontSize: 'clamp(1.75rem, 5vw, 2.25rem)' }}>
          Support for every student
        </h1>
        <p style={{ fontSize: '1.0625rem', color: 'var(--pf-grey-600)', lineHeight: 1.6 }}>
          Whatever your situation, there is support available. Choose the group that best
          describes you — or explore all of them.
        </p>
      </div>

      {showWideningAccessCallout && (
        <Link
          href="/widening-access"
          className="no-underline hover:no-underline"
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start',
            padding: '16px 20px',
            marginBottom: '32px',
            borderRadius: '8px',
            backgroundColor: 'var(--pf-blue-50)',
            borderLeft: '3px solid var(--pf-blue-700)',
            color: 'var(--pf-grey-900)',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--pf-blue-100)',
              color: 'var(--pf-blue-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: '4px' }}>
              You may qualify for Widening Access programmes
            </p>
            <p style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-600)', lineHeight: 1.5 }}>
              Based on your postcode, you could be eligible for lower offers and extra support.
              See the Widening Access hub for your options.
            </p>
          </div>
        </Link>
      )}

      {/* Support group grid */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        }}
      >
        {groups.map((group) => (
          <SupportGroupCard
            key={group.href}
            title={group.title}
            description={group.description}
            href={group.href}
            icon={group.icon}
            highlighted={group.highlighted}
          />
        ))}
      </div>

      {/* Footer note */}
      <p
        style={{
          marginTop: '40px',
          fontSize: '0.9375rem',
          color: 'var(--pf-grey-600)',
          maxWidth: '680px',
          lineHeight: 1.6,
        }}
      >
        Not sure which applies to you? Many students belong to more than one group.
        Browse all pages or contact your school&apos;s guidance teacher.
      </p>
    </div>
  )
}
