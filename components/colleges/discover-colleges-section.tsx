'use client'

import Link from 'next/link'
import { useCollegesForAreas } from '@/hooks/use-colleges'
import type { Tables } from '@/types/database'

type College = Tables<'colleges'>

// Map CfE curricular area names to likely college course_areas overlap terms.
// This is approximate — college course_areas use industry-standard terms rather
// than CfE nomenclature, so we map broadly.
const AREA_TO_COURSE_TERMS: Record<string, string[]> = {
  Languages: ['Languages', 'ESOL', 'Media', 'Communication', 'Journalism'],
  Mathematics: ['Accounting', 'Data', 'Finance', 'Business'],
  Sciences: ['Science', 'Laboratory', 'Biotechnology', 'Pharmacy', 'Environmental'],
  'Social Studies': ['Social Sciences', 'Social Care', 'Criminology', 'Politics', 'Law'],
  'Expressive Arts': ['Art', 'Design', 'Music', 'Drama', 'Creative', 'Photography', 'Fashion'],
  Technologies: ['Computing', 'Engineering', 'Construction', 'IT', 'Digital', 'Cyber'],
  'Religious and Moral Education': ['Social Sciences', 'Community', 'Education'],
  'Health and Wellbeing': ['Health', 'Sport', 'Fitness', 'Care', 'Nursing', 'Childcare'],
}

interface Props {
  selectedAreaNames: string[]
}

export function DiscoverCollegesSection({ selectedAreaNames }: Props) {
  // Gather course area terms from selected curricular areas
  const courseTerms = selectedAreaNames.flatMap(
    (name) => AREA_TO_COURSE_TERMS[name] || []
  )
  const uniqueTerms = [...new Set(courseTerms)]

  const { data: colleges, isLoading } = useCollegesForAreas(uniqueTerms)

  if (isLoading || !colleges || colleges.length === 0) return null

  // Show up to 5 relevant colleges
  const shown = colleges.slice(0, 5)

  return (
    <section aria-labelledby="section-colleges" style={{ marginTop: '56px' }}>
      <div style={{ marginBottom: '20px' }}>
        <span className="pf-badge-green inline-flex" style={{ marginBottom: '10px' }}>
          Not just university
        </span>
        <h2 id="section-colleges" style={{ fontSize: '1.25rem', marginBottom: '4px' }}>
          You could also study this at college
        </h2>
        <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem' }}>
          Scottish colleges offer HNC, HND, and apprenticeship routes — many with direct
          articulation into university year 2 or 3.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((college) => (
          <CollegeSuggestionCard key={college.id} college={college} />
        ))}
      </div>

      <div style={{ marginTop: '16px' }}>
        <Link
          href="/colleges"
          style={{
            color: 'var(--pf-blue-700)',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '0.875rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Browse all colleges
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  )
}

function CollegeSuggestionCard({ college }: { college: College }) {
  const areas = college.course_areas?.slice(0, 4) || []

  return (
    <Link
      href={`/colleges/${college.id}`}
      className="pf-card-hover no-underline hover:no-underline flex flex-col h-full"
      style={{ padding: '20px' }}
      aria-label={`View ${college.name}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div
          className="flex items-center justify-center"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'var(--pf-blue-100)',
            color: 'var(--pf-blue-700)',
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        {college.has_swap && <span className="pf-badge-amber">SWAP</span>}
      </div>
      <h3
        style={{
          fontSize: '1rem',
          marginBottom: '4px',
          color: 'var(--pf-grey-900)',
        }}
      >
        {college.name}
      </h3>
      <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginBottom: '8px' }}>
        {college.city}, {college.region}
      </p>
      {areas.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {areas.map((a) => (
            <span key={a} className="pf-badge-grey" style={{ fontSize: '0.6875rem' }}>
              {a}
            </span>
          ))}
        </div>
      )}
      <div
        className="mt-auto"
        style={{
          color: 'var(--pf-blue-700)',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '0.8125rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        View college
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}
