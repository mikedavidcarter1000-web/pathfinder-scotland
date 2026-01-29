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

  const typeColors: Record<string, string> = {
    ancient: 'bg-purple-100 text-purple-700',
    traditional: 'bg-blue-100 text-blue-700',
    modern: 'bg-green-100 text-green-700',
    specialist: 'bg-orange-100 text-orange-700',
  }

  return (
    <Link href={`/universities/${university.id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all h-full">
        {/* Image / Placeholder */}
        <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200">
          {university.logo_url ? (
            <Image
              src={university.logo_url}
              alt={university.name}
              fill
              className="object-contain p-4"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-400">
                  {university.name.charAt(0)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className={compact ? 'p-4' : 'p-5'}>
          {/* Name & Location */}
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
            {university.name}
          </h3>
          {university.city && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {university.city}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {typeInfo && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[university.type!] || 'bg-gray-100 text-gray-700'}`}>
                {typeInfo.label}
              </span>
            )}
            {university.russell_group && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                Russell Group
              </span>
            )}
          </div>

          {/* Stats */}
          {!compact && (
            <div className="flex items-center justify-between text-sm mb-4">
              {university.course_count !== undefined && (
                <span className="text-gray-600">
                  <span className="font-medium text-gray-900">{university.course_count}</span> courses
                </span>
              )}
              {university.founded_year && (
                <span className="text-gray-500">Est. {university.founded_year}</span>
              )}
            </div>
          )}

          {/* CTA */}
          <span className="block text-center py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
            View courses
          </span>
        </div>
      </div>
    </Link>
  )
}
