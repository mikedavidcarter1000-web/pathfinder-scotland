'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Tables } from '@/types/database'
import { UNIVERSITY_TYPES } from '@/lib/constants'

interface UniversityCardProps {
  university: Tables<'universities'> & {
    course_count?: number
  }
  compact?: boolean
}

export function UniversityCard({ university, compact = false }: UniversityCardProps) {
  const typeInfo = university.type
    ? UNIVERSITY_TYPES[university.type as keyof typeof UNIVERSITY_TYPES]
    : null

  return (
    <Link
      href={`/universities/${university.id}`}
      className="block group no-underline hover:no-underline h-full"
    >
      <div
        className="pf-card-hover"
        style={{ padding: 0, overflow: 'hidden', height: '100%' }}
      >
        {/* Campus image / gradient placeholder */}
        <div
          className="relative"
          style={{
            height: '160px',
            background:
              'linear-gradient(135deg, var(--pf-blue-100) 0%, var(--pf-blue-50) 100%)',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {university.card_image_url ? (
            <Image
              src={university.card_image_url}
              alt={`${university.name} campus`}
              width={640}
              height={400}
              className="w-full h-full"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
              <div
                className="rounded-lg flex items-center justify-center"
                style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: 'var(--pf-white)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: '1.75rem',
                    color: 'var(--pf-blue-700)',
                  }}
                >
                  {university.name.charAt(0)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: compact ? '16px' : '20px' }}>
          <h3
            style={{
              color: 'var(--pf-grey-900)',
              fontSize: '1.0625rem',
              margin: 0,
              marginBottom: '4px',
            }}
          >
            {university.name}
          </h3>
          {university.city && (
            <p
              className="flex items-center gap-1 mb-3"
              style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {university.city}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {typeInfo && <span className="pf-badge-blue">{typeInfo.label}</span>}
            {university.russell_group && <span className="pf-badge-amber">Russell Group</span>}
          </div>

          {/* Stats */}
          {!compact && (
            <div
              className="flex items-center justify-between mb-4"
              style={{ fontSize: '0.875rem' }}
            >
              {university.course_count !== undefined && (
                <span style={{ color: 'var(--pf-grey-600)' }}>
                  <span
                    className="pf-data-number"
                    style={{ fontWeight: 600, color: 'var(--pf-grey-900)' }}
                  >
                    {university.course_count}
                  </span>{' '}
                  courses
                </span>
              )}
              {university.founded_year && (
                <span style={{ color: 'var(--pf-grey-600)' }}>
                  Est.{' '}
                  <span className="pf-data-number">{university.founded_year}</span>
                </span>
              )}
            </div>
          )}

          {/* CTA */}
          <span
            className="block text-center"
            style={{
              padding: '10px',
              fontSize: '0.875rem',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              color: 'var(--pf-blue-700)',
              backgroundColor: 'var(--pf-blue-100)',
              borderRadius: '6px',
            }}
          >
            View courses
          </span>
        </div>
      </div>
    </Link>
  )
}
