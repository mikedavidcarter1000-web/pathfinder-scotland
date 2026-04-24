'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Placement = {
  id: string
  title: string
  placement_type: string
  start_date: string | null
  end_date: string | null
  hours: number | null
  status: string
  employer: { id: string; company_name: string } | null
}

type GroupEvent = {
  id: string
  title: string
  placement_type: string
  start_date: string | null
  group_year_groups: string[] | null
  employer: { company_name: string } | null
}

const TYPE_LABELS: Record<string, string> = {
  work_experience: 'Work experience',
  careers_talk: 'Careers talk',
  workplace_tour: 'Workplace tour',
  mock_interview: 'Mock interview',
  mentoring: 'Mentoring',
  industry_project: 'Industry project',
  other: 'Other',
}

export function WorkExperienceCard() {
  const [placements, setPlacements] = useState<Placement[]>([])
  const [upcoming, setUpcoming] = useState<GroupEvent[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/student/work-experience')
      .then((r) => r.ok ? r.json() : { placements: [], upcoming_group_events: [] })
      .then((d) => {
        setPlacements(d.placements ?? [])
        setUpcoming(d.upcoming_group_events ?? [])
      })
      .finally(() => setLoaded(true))
  }, [])

  if (!loaded) return null
  if (placements.length === 0 && upcoming.length === 0) {
    // Keep the card silent if the school hasn't set anything up for this student yet.
    return null
  }

  const completed = placements.filter((p) => p.status === 'completed')
  const planned = placements.filter((p) => p.status !== 'completed' && p.status !== 'cancelled')

  return (
    <div className="pf-card" style={{ marginBottom: 20 }}>
      <h2 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontFamily: "'Space Grotesk', sans-serif" }}>Work experience</h2>
      {completed.length === 0 && planned.length === 0 && (
        <p style={{ margin: '0 0 8px', fontSize: 14, color: 'var(--pf-grey-600)' }}>
          No placements yet.{' '}
          <Link href="/careers">Explore careers</Link> to see what&apos;s out there.
        </p>
      )}

      {completed.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <h3 style={{ fontSize: '0.875rem', margin: '8px 0 4px', color: 'var(--pf-grey-700)' }}>Completed</h3>
          {completed.map((p) => (
            <div key={p.id} style={row}>
              <div>
                <b>{p.title}</b>
                <div style={sub}>
                  {p.employer?.company_name ?? ''} · {TYPE_LABELS[p.placement_type] ?? p.placement_type}
                  {p.start_date ? ` · ${new Date(p.start_date).toLocaleDateString('en-GB')}` : ''}
                  {p.hours ? ` · ${p.hours} hrs` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {planned.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <h3 style={{ fontSize: '0.875rem', margin: '8px 0 4px', color: 'var(--pf-grey-700)' }}>Upcoming</h3>
          {planned.map((p) => (
            <div key={p.id} style={row}>
              <div>
                <b>{p.title}</b>
                <div style={sub}>
                  {p.employer?.company_name ?? ''} · {TYPE_LABELS[p.placement_type] ?? p.placement_type} · {p.status}
                  {p.start_date ? ` · ${new Date(p.start_date).toLocaleDateString('en-GB')}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h3 style={{ fontSize: '0.875rem', margin: '8px 0 4px', color: 'var(--pf-grey-700)' }}>Upcoming careers events at your school</h3>
          {upcoming.map((g) => (
            <div key={g.id} style={row}>
              <div>
                <b>{g.title}</b>
                <div style={sub}>
                  {g.employer?.company_name ?? ''} · {TYPE_LABELS[g.placement_type] ?? g.placement_type}
                  {g.start_date ? ` · ${new Date(g.start_date).toLocaleDateString('en-GB')}` : ''}
                  {g.group_year_groups && g.group_year_groups.length > 0 ? ` · ${g.group_year_groups.join(', ')}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const row: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '6px 0', borderBottom: '1px solid var(--pf-grey-100, #f3f4f6)', fontSize: 14 }
const sub: React.CSSProperties = { fontSize: 12, color: 'var(--pf-grey-600, #6b7280)', marginTop: 2 }
