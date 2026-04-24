'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { ShanarriRadar } from '@/components/school-guidance/shanarri-radar'
import { InterventionForm } from '@/components/school-guidance/intervention-form'

type TabKey = 'overview' | 'interventions' | 'tracking' | 'wellbeing' | 'safeguarding' | 'asn' | 'placements' | 'notes'

type ProfilePayload = {
  canViewSafeguarding: boolean
  canViewSensitiveFlags: boolean
  student: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string | null
    schoolStage: string | null
    registrationClass: string | null
    houseGroup: string | null
    scn: string | null
    lastActiveAt: string | null
    simdDecile: number | null
    attendancePct: number | null
    hasAsn: boolean | null
    flags: {
      careExperienced: boolean
      fsm: boolean
      youngCarer: boolean
      asn: boolean
      attendanceConcern: boolean
    }
  }
  tracking: {
    currentCycle: { id: string; name: string; academic_year: string } | null
    subjects: Array<{
      classAssignmentId: string
      subject: string
      qualificationLevel: string | null
      yearGroup: string | null
      workingGrade: string | null
      predictedGrade: string | null
      targetGrade: string | null
      onTrack: boolean | null
      effort: number | null
      comment: string | null
    }>
    cycles: Array<{ id: string; name: string; academic_year: string; cycle_number: number }>
    historyEntries: Array<{ class_assignment_id: string; cycle_id: string; working_grade: string | null }>
  }
  savedCourses: Array<{ course_id: string; courses: { id: string; name: string; entry_requirements: string | null; slug: string | null; universities: { name: string } | null } | null }>
  subjectChoices: Array<{ id: string; status: string; submitted_at: string | null; choice_rounds: { name: string; transition: string } | null }>
  grades: Array<{ subject_name: string; qualification_level: string; grade: string }>
  interventions: Array<{
    id: string
    intervention_type: string
    title: string
    notes: string | null
    action_items: Array<{ description: string; due_date?: string; is_completed?: boolean }> | null
    outcome: string | null
    pef_funded: boolean
    pef_cost: number | null
    scheduled_at: string | null
    completed_at: string | null
    follow_up_date: string | null
    is_confidential: boolean
    created_at: string
    staff_id: string | null
    school_staff: { full_name: string; role: string } | null
  }>
  wellbeing: {
    responses: Array<Record<string, unknown>>
    latest: Record<string, number | null> | null
    indicators: Array<{ key: string; label: string; prompt: string; column: string }>
  }
  asn: Array<{
    id: string
    provision_type: string
    description: string | null
    review_date: string | null
    responsible_staff_id: string | null
    is_active: boolean
    created_at: string
    school_staff: { full_name: string } | null
  }>
  bursaryMatches: Array<{ id: string; name: string; administeringBody: string | null; amountDescription: string | null; url: string | null }>
  safeguardingCount: number
  transition: {
    source_primary: string
    transition_year: string
    reading_level: string | null
    writing_level: string | null
    listening_talking_level: string | null
    numeracy_level: string | null
    snsa_reading_score: number | null
    snsa_numeracy_score: number | null
    asn_notes: string | null
    pastoral_notes: string | null
  } | null
}

function FlagBadge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 999,
        background: color,
        color: '#fff',
        fontSize: 11,
        fontWeight: 600,
        marginRight: 4,
      }}
    >
      {children}
    </span>
  )
}

export default function StudentProfilePage() {
  const params = useParams<{ studentId: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [payload, setPayload] = useState<ProfilePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>((searchParams.get('tab') as TabKey) || 'overview')
  const [showInterventionForm, setShowInterventionForm] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace(`/auth/sign-in?redirect=/school/guidance/${params.studentId}`)
      return
    }
    fetch(`/api/school/guidance/student/${params.studentId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => setPayload(p))
      .finally(() => setLoading(false))
  }, [authLoading, user, router, params.studentId])

  const refetch = async () => {
    const res = await fetch(`/api/school/guidance/student/${params.studentId}`)
    if (res.ok) setPayload(await res.json())
  }

  const allActionItems = useMemo(() => {
    if (!payload) return [] as Array<{ interventionId: string; idx: number; description: string; due_date?: string; is_completed?: boolean }>
    const out: Array<{ interventionId: string; idx: number; description: string; due_date?: string; is_completed?: boolean }> = []
    for (const i of payload.interventions) {
      const items = i.action_items ?? []
      items.forEach((a, idx) => {
        if (!a.is_completed) out.push({ interventionId: i.id, idx, ...a })
      })
    }
    return out
  }, [payload])

  if (loading) return <div style={{ padding: 32 }}>Loading student profile...</div>
  if (!payload) return <div style={{ padding: 32 }}>Could not load profile (not in your caseload, or student not found).</div>

  const { student } = payload
  const fullName = `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim() || 'Student'

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <Link href="/school/guidance" style={{ color: '#0059b3', fontSize: 14 }}>&larr; Back to caseload</Link>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowInterventionForm(true)} style={primaryButton}>
            + Log intervention
          </button>
          {payload.canViewSafeguarding && (
            <Link
              href={`/school/guidance/safeguarding/new?student=${student.id}`}
              style={{ ...secondaryButton, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              Raise concern
            </Link>
          )}
          <a
            href={`/api/school/guidance/meeting-brief/${student.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...secondaryButton, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
          >
            Meeting brief
          </a>
        </div>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
        <div
          aria-hidden="true"
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#e0e7ff',
            color: '#3730a3',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 600,
            fontSize: 24,
          }}
        >
          {(student.firstName ?? '?')[0]}
          {(student.lastName ?? '')[0] ?? ''}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>{fullName}</h1>
          <div style={{ fontSize: 13, color: '#555' }}>
            {student.schoolStage?.toUpperCase() ?? '-'} &middot; Reg {student.registrationClass ?? '-'} &middot; House {student.houseGroup ?? '-'} &middot; SCN {student.scn ?? '-'}
          </div>
          <div style={{ marginTop: 6 }}>
            {payload.canViewSensitiveFlags && student.flags.careExperienced && <FlagBadge color="#7c3aed">Care experienced</FlagBadge>}
            {payload.canViewSensitiveFlags && student.flags.fsm && <FlagBadge color="#2563eb">FSM</FlagBadge>}
            {payload.canViewSensitiveFlags && student.flags.youngCarer && <FlagBadge color="#0d9488">Young carer</FlagBadge>}
            {student.flags.asn && <FlagBadge color="#d97706">ASN</FlagBadge>}
            {student.flags.attendanceConcern && <FlagBadge color="#dc2626">Attendance &lt; 90%</FlagBadge>}
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            Last active on Pathfinder: {student.lastActiveAt ? new Date(student.lastActiveAt).toLocaleDateString('en-GB') : 'Never'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div role="tablist" style={{ display: 'flex', gap: 2, borderBottom: '1px solid #e5e5e5', marginBottom: 16, overflowX: 'auto' }}>
        <TabButton active={tab === 'overview'} onClick={() => setTab('overview')}>Overview</TabButton>
        <TabButton active={tab === 'interventions'} onClick={() => setTab('interventions')}>
          Interventions ({payload.interventions.length})
        </TabButton>
        <TabButton active={tab === 'tracking'} onClick={() => setTab('tracking')}>Tracking history</TabButton>
        <TabButton active={tab === 'wellbeing'} onClick={() => setTab('wellbeing')}>Wellbeing</TabButton>
        {payload.canViewSafeguarding && (
          <TabButton active={tab === 'safeguarding'} onClick={() => setTab('safeguarding')}>
            Safeguarding {payload.safeguardingCount > 0 ? `(${payload.safeguardingCount})` : ''}
          </TabButton>
        )}
        <TabButton active={tab === 'asn'} onClick={() => setTab('asn')}>ASN ({payload.asn.length})</TabButton>
        <TabButton active={tab === 'placements'} onClick={() => setTab('placements')}>Placements</TabButton>
        <TabButton active={tab === 'notes'} onClick={() => setTab('notes')}>Notes</TabButton>
      </div>

      {tab === 'overview' && <OverviewTab payload={payload} />}
      {tab === 'interventions' && (
        <InterventionsTab
          payload={payload}
          allActionItems={allActionItems}
          onRefetch={refetch}
        />
      )}
      {tab === 'tracking' && <TrackingTab payload={payload} />}
      {tab === 'wellbeing' && <WellbeingTab payload={payload} />}
      {tab === 'safeguarding' && payload.canViewSafeguarding && <SafeguardingTab studentId={student.id} />}
      {tab === 'asn' && <AsnTab payload={payload} studentId={student.id} onRefetch={refetch} />}
      {tab === 'placements' && <PlacementsTab studentId={student.id} />}
      {tab === 'notes' && <NotesTab />}

      {showInterventionForm && (
        <InterventionForm
          studentId={student.id}
          studentName={fullName}
          onClose={() => setShowInterventionForm(false)}
          onSaved={async () => {
            setShowInterventionForm(false)
            await refetch()
            setTab('interventions')
          }}
        />
      )}
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        padding: '8px 14px',
        fontSize: 14,
        border: 'none',
        borderBottom: active ? '2px solid #0059b3' : '2px solid transparent',
        background: 'transparent',
        color: active ? '#0059b3' : '#333',
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

function OverviewTab({ payload }: { payload: ProfilePayload }) {
  const { student, tracking, savedCourses, bursaryMatches } = payload
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <section style={card}>
        <h2 style={cardHeader}>Academic snapshot</h2>
        {tracking.subjects.length === 0 ? (
          <div style={{ color: '#666' }}>No subjects / tracking data.</div>
        ) : (
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f7f7f7' }}>
                <th style={thSm}>Subject</th>
                <th style={thSm}>Level</th>
                <th style={thSm}>Working</th>
                <th style={thSm}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tracking.subjects.map((s) => (
                <tr key={s.classAssignmentId} style={{ borderTop: '1px solid #eee' }}>
                  <td style={tdSm}>{s.subject}</td>
                  <td style={tdSm}>{s.qualificationLevel ?? '-'}</td>
                  <td style={tdSm}>{s.workingGrade ?? '-'}</td>
                  <td style={tdSm}>
                    {s.onTrack === null ? '-' : s.onTrack ? (
                      <span style={{ color: '#16a34a' }}>On track</span>
                    ) : (
                      <span style={{ color: '#dc2626' }}>Below target</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={card}>
        <h2 style={cardHeader}>Saved courses</h2>
        {savedCourses.length === 0 ? (
          <div style={{ color: '#666' }}>No courses saved on Pathfinder.</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {savedCourses.map((sc) => (
              <li key={sc.course_id} style={{ marginBottom: 4, fontSize: 13 }}>
                <strong>{sc.courses?.name ?? 'Course'}</strong>
                {sc.courses?.universities?.name ? ` — ${sc.courses.universities.name}` : ''}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={card}>
        <h2 style={cardHeader}>Widening access</h2>
        <div style={{ fontSize: 13 }}>
          <div>SIMD decile: <strong>{student.simdDecile ?? '-'}</strong></div>
          <div style={{ marginTop: 4 }}>
            Eligible for widening-access adjusted offers:{' '}
            <strong>
              {student.simdDecile !== null && student.simdDecile <= 4 ? 'Yes (SIMD 1-4)' : 'Not via SIMD'}
            </strong>
          </div>
          {payload.canViewSensitiveFlags && student.flags.careExperienced && (
            <div>Care-experienced adjusted offers: <strong>Yes</strong></div>
          )}
        </div>
      </section>

      {payload.transition && (
        <section style={{ ...card, gridColumn: '1 / -1' }}>
          <h2 style={cardHeader}>Transition from primary</h2>
          <div style={{ fontSize: 13, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            <div><strong>Source primary:</strong> {payload.transition.source_primary}</div>
            <div><strong>Transition year:</strong> {payload.transition.transition_year}</div>
            <div><strong>Reading:</strong> {payload.transition.reading_level ?? '-'}</div>
            <div><strong>Writing:</strong> {payload.transition.writing_level ?? '-'}</div>
            <div><strong>Listening & talking:</strong> {payload.transition.listening_talking_level ?? '-'}</div>
            <div><strong>Numeracy:</strong> {payload.transition.numeracy_level ?? '-'}</div>
            {payload.transition.snsa_reading_score != null && <div><strong>SNSA reading:</strong> {payload.transition.snsa_reading_score}</div>}
            {payload.transition.snsa_numeracy_score != null && <div><strong>SNSA numeracy:</strong> {payload.transition.snsa_numeracy_score}</div>}
          </div>
          {payload.transition.asn_notes && (
            <div style={{ marginTop: 8, fontSize: 13 }}><strong>ASN notes:</strong> {payload.transition.asn_notes}</div>
          )}
          {payload.transition.pastoral_notes && (
            <div style={{ marginTop: 6, fontSize: 13 }}><strong>Pastoral notes:</strong> {payload.transition.pastoral_notes}</div>
          )}
        </section>
      )}

      <section style={card}>
        <h2 style={cardHeader}>Bursary matches ({bursaryMatches.length})</h2>
        {bursaryMatches.length === 0 ? (
          <div style={{ color: '#666' }}>No bursaries matched from student profile flags.</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {bursaryMatches.slice(0, 8).map((b) => (
              <li key={b.id} style={{ marginBottom: 4, fontSize: 13 }}>
                <strong>{b.name}</strong>
                {b.administeringBody ? ` — ${b.administeringBody}` : ''}
                {b.amountDescription ? ` (${b.amountDescription})` : ''}
                {b.url && (
                  <>
                    {' '}
                    <a href={b.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0059b3' }}>
                      details
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function InterventionsTab({
  payload,
  allActionItems,
  onRefetch,
}: {
  payload: ProfilePayload
  allActionItems: Array<{ interventionId: string; idx: number; description: string; due_date?: string; is_completed?: boolean }>
  onRefetch: () => Promise<void>
}) {
  async function completeAction(interventionId: string, idx: number) {
    const intervention = payload.interventions.find((i) => i.id === interventionId)
    if (!intervention) return
    const items = [...(intervention.action_items ?? [])]
    items[idx] = { ...items[idx], is_completed: true }
    await fetch(`/api/school/guidance/interventions/${interventionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action_items: items }),
    })
    await onRefetch()
  }

  async function completeFollowUp(interventionId: string) {
    const outcome = prompt('Outcome?') ?? ''
    await fetch(`/api/school/guidance/interventions/${interventionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed_at: new Date().toISOString(), outcome }),
    })
    await onRefetch()
  }

  return (
    <div>
      {allActionItems.length > 0 && (
        <section style={{ ...card, borderColor: '#f59e0b', background: '#fffbeb' }}>
          <h2 style={cardHeader}>Outstanding actions ({allActionItems.length})</h2>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {allActionItems.map((a, idx) => (
              <li key={`${a.interventionId}-${a.idx}-${idx}`} style={{ fontSize: 13, marginBottom: 4 }}>
                <input
                  type="checkbox"
                  checked={!!a.is_completed}
                  onChange={() => completeAction(a.interventionId, a.idx)}
                  style={{ marginRight: 6 }}
                />
                {a.description}
                {a.due_date && <span style={{ color: '#666' }}> (due {a.due_date})</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 style={{ fontSize: 16, margin: '16px 0 8px 0' }}>Timeline</h2>
      {payload.interventions.length === 0 ? (
        <div style={{ color: '#666' }}>No interventions logged for this student.</div>
      ) : (
        <ol style={{ listStyle: 'none', padding: 0 }}>
          {payload.interventions.map((i) => (
            <li key={i.id} style={{ border: '1px solid #e5e5e5', borderRadius: 6, padding: 12, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <strong>{i.title}</strong>{' '}
                  <span style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: 4, fontSize: 11, marginLeft: 4 }}>
                    {i.intervention_type}
                  </span>
                  {i.is_confidential && (
                    <span style={{ marginLeft: 4, color: '#7c3aed', fontSize: 11 }}>[confidential]</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#666' }}>{new Date(i.created_at).toLocaleDateString('en-GB')}</div>
              </div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                by {i.school_staff?.full_name ?? 'unknown'} ({i.school_staff?.role ?? '-'})
              </div>
              {i.notes && <div style={{ fontSize: 13, marginTop: 6 }}>{i.notes}</div>}
              {i.outcome && <div style={{ fontSize: 13, marginTop: 6, fontStyle: 'italic' }}>Outcome: {i.outcome}</div>}
              {i.follow_up_date && !i.completed_at && (
                <div style={{ fontSize: 13, marginTop: 6, color: new Date(i.follow_up_date) < new Date() ? '#dc2626' : '#d97706' }}>
                  Follow-up: {i.follow_up_date}{' '}
                  <button onClick={() => completeFollowUp(i.id)} style={smallButton}>
                    Complete
                  </button>
                </div>
              )}
              {i.pef_funded && (
                <div style={{ fontSize: 12, color: '#6b21a8', marginTop: 4 }}>
                  PEF funded{i.pef_cost ? ` — £${i.pef_cost}` : ''}
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function TrackingTab({ payload }: { payload: ProfilePayload }) {
  const { tracking } = payload
  return (
    <div>
      <section style={card}>
        <h2 style={cardHeader}>Current cycle snapshot</h2>
        {tracking.currentCycle ? (
          <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
            {tracking.currentCycle.name} ({tracking.currentCycle.academic_year})
          </div>
        ) : (
          <div style={{ color: '#666', fontSize: 13 }}>No current cycle set.</div>
        )}
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f7f7f7' }}>
              <th style={thSm}>Subject</th>
              <th style={thSm}>Level</th>
              <th style={thSm}>Working</th>
              <th style={thSm}>Predicted</th>
              <th style={thSm}>Target</th>
              <th style={thSm}>Effort</th>
              <th style={thSm}>Comment</th>
            </tr>
          </thead>
          <tbody>
            {tracking.subjects.map((s) => (
              <tr key={s.classAssignmentId} style={{ borderTop: '1px solid #eee' }}>
                <td style={tdSm}>{s.subject}</td>
                <td style={tdSm}>{s.qualificationLevel ?? '-'}</td>
                <td style={tdSm}>{s.workingGrade ?? '-'}</td>
                <td style={tdSm}>{s.predictedGrade ?? '-'}</td>
                <td style={tdSm}>{s.targetGrade ?? '-'}</td>
                <td style={tdSm}>{s.effort ?? '-'}</td>
                <td style={tdSm}>{s.comment ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={card}>
        <h2 style={cardHeader}>History ({tracking.cycles.length} cycles)</h2>
        {tracking.cycles.length === 0 ? (
          <div style={{ color: '#666' }}>No historic cycles.</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
            {tracking.cycles.map((c) => {
              const entriesForCycle = tracking.historyEntries.filter((e) => e.cycle_id === c.id)
              return (
                <li key={c.id} style={{ marginBottom: 2 }}>
                  {c.name} ({c.academic_year}): {entriesForCycle.length} entries
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

function WellbeingTab({ payload }: { payload: ProfilePayload }) {
  const { wellbeing } = payload
  if (!wellbeing.latest) {
    return <div style={{ color: '#666' }}>No wellbeing survey responses for this student.</div>
  }
  const scores = wellbeing.latest as unknown as Record<string, number | null>
  const castScores: Partial<Record<'safe' | 'healthy' | 'achieving' | 'nurtured' | 'active' | 'respected' | 'responsible' | 'included', number | null>> = {
    safe: scores.safe ?? null,
    healthy: scores.healthy ?? null,
    achieving: scores.achieving ?? null,
    nurtured: scores.nurtured ?? null,
    active: scores.active ?? null,
    respected: scores.respected ?? null,
    responsible: scores.responsible ?? null,
    included: scores.included ?? null,
  }
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <section style={{ ...card, flex: '0 0 auto' }}>
        <h2 style={cardHeader}>SHANARRI (latest)</h2>
        <ShanarriRadar scores={castScores} size={280} />
      </section>
      <section style={{ ...card, flex: '1 1 300px' }}>
        <h2 style={cardHeader}>Indicator scores</h2>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
          {wellbeing.indicators.map((ind) => (
            <li key={ind.key}>
              {ind.label}: <strong>{scores[ind.key] ?? '-'}</strong> / 5
            </li>
          ))}
        </ul>
        <div style={{ fontSize: 12, color: '#666', marginTop: 12 }}>
          {wellbeing.responses.length} survey response{wellbeing.responses.length === 1 ? '' : 's'} on record.
        </div>
      </section>
    </div>
  )
}

function SafeguardingTab({ studentId }: { studentId: string }) {
  const [concerns, setConcerns] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/school/guidance/safeguarding?student_id=${studentId}`)
      .then((r) => (r.ok ? r.json() : { concerns: [] }))
      .then((d) => setConcerns(d.concerns ?? []))
      .finally(() => setLoading(false))
  }, [studentId])

  if (loading) return <div style={{ color: '#666' }}>Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <Link href={`/school/guidance/safeguarding/new?student=${studentId}`} style={{ ...primaryButton, textDecoration: 'none' }}>
          Raise concern
        </Link>
        <a
          href={`/api/school/guidance/safeguarding/export?student_id=${studentId}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...secondaryButton, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
        >
          Export for CP file
        </a>
      </div>
      {concerns.length === 0 ? (
        <div style={{ color: '#666' }}>No safeguarding concerns for this student.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {concerns.map((c) => (
            <li
              key={c.id as string}
              style={{ border: '1px solid #e5e5e5', borderRadius: 6, padding: 12, marginBottom: 8 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{c.concern_type as string}</strong> &middot;{' '}
                  <span style={{ fontSize: 12, color: '#666' }}>{new Date(c.created_at as string).toLocaleDateString('en-GB')}</span>
                </div>
                <Link href={`/school/guidance/safeguarding/${c.id as string}`} style={{ fontSize: 13, color: '#0059b3' }}>
                  View full &rarr;
                </Link>
              </div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Escalation: {c.escalation_level as string}</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>{((c.description as string) ?? '').slice(0, 200)}{((c.description as string) ?? '').length > 200 ? '...' : ''}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AsnTab({
  payload,
  studentId,
  onRefetch,
}: {
  payload: ProfilePayload
  studentId: string
  onRefetch: () => Promise<void>
}) {
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState('iep')
  const [description, setDescription] = useState('')
  const [reviewDate, setReviewDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const provisionTypes = [
    { value: 'iep', label: 'IEP' },
    { value: 'csp', label: 'CSP' },
    { value: 'exam_access', label: 'Exam access arrangements' },
    { value: 'reader', label: 'Reader' },
    { value: 'scribe', label: 'Scribe' },
    { value: 'extra_time', label: 'Extra time' },
    { value: 'separate_room', label: 'Separate room' },
    { value: 'assistive_tech', label: 'Assistive technology' },
    { value: 'modified_curriculum', label: 'Modified curriculum' },
    { value: 'support_worker', label: 'Support worker' },
    { value: 'other', label: 'Other' },
  ]

  async function handleSubmit() {
    if (!type) return
    setSubmitting(true)
    try {
      await fetch('/api/school/guidance/asn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          provision_type: type,
          description: description || null,
          review_date: reviewDate || null,
        }),
      })
      setShowForm(false)
      setDescription('')
      setReviewDate('')
      await onRefetch()
    } finally {
      setSubmitting(false)
    }
  }

  const active = payload.asn.filter((a) => a.is_active)
  const inactive = payload.asn.filter((a) => !a.is_active)
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setShowForm((v) => !v)} style={primaryButton}>
          {showForm ? 'Cancel' : '+ Add provision'}
        </button>
      </div>

      {showForm && (
        <div style={{ ...card, marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Provision type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: 6, marginBottom: 8 }}>
            {provisionTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} style={{ width: '100%', padding: 6, marginBottom: 8 }} />
          <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>Review date</label>
          <input type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} style={{ padding: 6, marginBottom: 8 }} />
          <div>
            <button onClick={handleSubmit} disabled={submitting} style={primaryButton}>
              {submitting ? 'Saving...' : 'Save provision'}
            </button>
          </div>
        </div>
      )}

      <h3 style={{ fontSize: 15, margin: '16px 0 8px 0' }}>Active ({active.length})</h3>
      {active.length === 0 ? (
        <div style={{ color: '#666' }}>No active provisions.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {active.map((a) => {
            const overdue = a.review_date && a.review_date < today
            return (
              <li key={a.id} style={{ border: '1px solid #e5e5e5', borderRadius: 6, padding: 10, marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{a.provision_type}</strong>
                  <div style={{ fontSize: 12, color: overdue ? '#dc2626' : '#666' }}>
                    Review: {a.review_date ?? '-'} {overdue ? '(overdue)' : ''}
                  </div>
                </div>
                {a.description && <div style={{ fontSize: 13, marginTop: 4 }}>{a.description}</div>}
                {a.school_staff && <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Responsible: {a.school_staff.full_name}</div>}
              </li>
            )
          })}
        </ul>
      )}

      {inactive.length > 0 && (
        <>
          <h3 style={{ fontSize: 15, margin: '16px 0 8px 0' }}>Historic ({inactive.length})</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {inactive.map((a) => (
              <li key={a.id} style={{ fontSize: 13, color: '#666' }}>
                {a.provision_type} &mdash; ended
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function NotesTab() {
  return (
    <div style={card}>
      <h2 style={cardHeader}>Documents &amp; notes</h2>
      <p style={{ fontSize: 14, color: '#666' }}>
        Free-form notes area and file upload for IEPs / reports / letters will ship in a follow-up iteration.
        For now, record notes against an intervention via the Interventions tab.
      </p>
    </div>
  )
}

function PlacementsTab({ studentId }: { studentId: string }) {
  type P = {
    id: string; title: string; placement_type: string; status: string
    start_date: string | null; end_date: string | null; hours: number | null
    is_group_event: boolean
    student_feedback: string | null; student_rating: number | null
    employer_feedback: string | null; employer_rating: number | null
    employer: { company_name: string } | null
  }
  const [rows, setRows] = useState<P[]>([])
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    fetch(`/api/school/dyw/placements?student_id=${studentId}`)
      .then((r) => r.ok ? r.json() : { placements: [] })
      .then((d) => setRows(d.placements ?? []))
      .finally(() => setLoaded(true))
  }, [studentId])

  const labelType = (t: string): string => ({ work_experience: 'Work experience', careers_talk: 'Careers talk', workplace_tour: 'Workplace tour', mock_interview: 'Mock interview', mentoring: 'Mentoring', industry_project: 'Industry project', other: 'Other' } as Record<string, string>)[t] ?? t

  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <h2 style={cardHeader}>Placements &amp; experience</h2>
        <Link href="/school/dyw" style={{ fontSize: 12, padding: '4px 10px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 4, textDecoration: 'none', color: '#1D4ED8' }}>Add placement</Link>
      </div>
      {!loaded && <p style={{ fontSize: 14, color: '#666' }}>Loading…</p>}
      {loaded && rows.length === 0 && <p style={{ fontSize: 14, color: '#666' }}>No placements recorded for this student. Add one from the DYW dashboard.</p>}
      {rows.map((p) => (
        <div key={p.id} style={{ border: '1px solid #e5e5e5', borderRadius: 4, padding: 10, marginBottom: 8, background: '#fafafa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div>
              <b>{p.title}</b>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                {p.employer?.company_name ?? '—'} · {labelType(p.placement_type)} · {p.status}
                {p.start_date ? ` · ${new Date(p.start_date).toLocaleDateString('en-GB')}` : ''}
                {p.hours ? ` · ${p.hours} hrs` : ''}
              </div>
            </div>
          </div>
          {p.student_feedback && <div style={{ fontSize: 13, marginTop: 6 }}><b>Student:</b> {p.student_feedback} {p.student_rating ? `(${p.student_rating}/5)` : ''}</div>}
          {p.employer_feedback && <div style={{ fontSize: 13, marginTop: 4 }}><b>Employer:</b> {p.employer_feedback} {p.employer_rating ? `(${p.employer_rating}/5)` : ''}</div>}
        </div>
      ))}
    </div>
  )
}

const card: React.CSSProperties = {
  border: '1px solid #e5e5e5',
  borderRadius: 6,
  padding: 12,
  marginBottom: 12,
  background: '#fff',
}
const cardHeader: React.CSSProperties = { fontSize: 15, margin: '0 0 8px 0' }
const thSm: React.CSSProperties = { padding: '6px 8px', textAlign: 'left', fontWeight: 600 }
const tdSm: React.CSSProperties = { padding: '6px 8px', verticalAlign: 'top' }
const smallButton: React.CSSProperties = {
  padding: '4px 8px',
  fontSize: 12,
  border: '1px solid #d0d0d0',
  borderRadius: 4,
  background: '#fff',
  cursor: 'pointer',
}
const primaryButton: React.CSSProperties = {
  padding: '6px 14px',
  fontSize: 14,
  background: '#0059b3',
  color: '#fff',
  border: '1px solid #0059b3',
  borderRadius: 4,
  cursor: 'pointer',
}
const secondaryButton: React.CSSProperties = {
  padding: '6px 14px',
  fontSize: 14,
  background: '#fff',
  border: '1px solid #d0d0d0',
  borderRadius: 4,
  cursor: 'pointer',
  color: '#333',
}
