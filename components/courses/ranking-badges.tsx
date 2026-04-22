'use client'

import { ordinal, pickCourseOutcomes, pickUniversityRankings } from '@/lib/outcomes'

interface RankingBadgesProps {
  course: unknown
  university: unknown
}

// Small pill badges that surface relevant ranking context above the
// course title. Renders nothing when no ranks are available; never
// dominant over the course content itself.
export function RankingBadges({ course, university }: RankingBadgesProps) {
  const uni = pickUniversityRankings(university)
  const c = pickCourseOutcomes(course)

  const pills: string[] = []
  if (uni.ranking_cug_scotland !== null) {
    pills.push(`Ranked ${ordinal(uni.ranking_cug_scotland)} in Scotland`)
  }
  if (c.subject_ranking_cug !== null) {
    pills.push(`Ranked ${ordinal(c.subject_ranking_cug)} in the UK for this subject`)
  }

  if (pills.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2" style={{ marginTop: '8px' }}>
      {pills.map((p) => (
        <span
          key={p}
          className="inline-flex items-center"
          style={{
            padding: '3px 10px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            color: '#B45309',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.01em',
          }}
        >
          {p}
        </span>
      ))}
    </div>
  )
}
