'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { TrackingGrid } from '@/components/school-tracking/tracking-grid'

type GridPayload = {
  class: Parameters<typeof TrackingGrid>[0]['cls']
  students: Parameters<typeof TrackingGrid>[0]['students']
  cycle: Parameters<typeof TrackingGrid>[0]['cycle']
  entries: Parameters<typeof TrackingGrid>[0]['initialEntries']
  grade_scale: Parameters<typeof TrackingGrid>[0]['gradeScale']
  metrics: Parameters<typeof TrackingGrid>[0]['metrics']
  comments: Parameters<typeof TrackingGrid>[0]['comments']
}

export default function TrackingGridPage() {
  const params = useParams<{ classId: string }>()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [payload, setPayload] = useState<GridPayload | null>(null)
  const [me, setMe] = useState<{ canEditTracking: boolean; isAdmin: boolean; staffId: string } | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace(`/auth/sign-in?redirect=/school/tracking/${params?.classId}`)
      return
    }
    const classId = params?.classId
    if (!classId) return
    Promise.all([
      fetch('/api/school/me').then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/school/tracking/class/${classId}`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([meData, pData]) => {
        if (!meData) {
          router.replace('/school/register')
          return
        }
        setMe({
          canEditTracking: !!meData.staff.canEditTracking,
          isAdmin: !!meData.staff.isAdmin,
          staffId: meData.staff.staffId,
        })
        setPayload(pData)
      })
      .finally(() => setLoading(false))
  }, [authLoading, user, router, params])

  if (loading) return <div className="pf-container pt-8 pb-12"><p>Loading grade grid…</p></div>
  if (!payload || !me) {
    return (
      <div className="pf-container pt-8 pb-12">
        <p>Could not load this class. <Link href="/school/tracking">Back to tracking</Link>.</p>
      </div>
    )
  }

  // Teachers edit their own classes; admins edit any class.
  const isOwnClass = payload.class.staff?.id === me.staffId
  const canEdit = me.isAdmin || (me.canEditTracking && isOwnClass)

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: '1400px' }}>
      <TrackingGrid
        cls={payload.class}
        students={payload.students}
        cycle={payload.cycle}
        initialEntries={payload.entries}
        gradeScale={payload.grade_scale}
        metrics={payload.metrics}
        comments={payload.comments}
        canEdit={canEdit}
      />
      <ClassStudentManagement classId={payload.class.id} canEdit={canEdit} />
    </div>
  )
}

function ClassStudentManagement({ classId, canEdit }: { classId: string; canEdit: boolean }) {
  if (!canEdit) return null
  return (
    <details style={{ marginTop: 24, border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Manage class list</summary>
      <ClassStudentPicker classId={classId} />
    </details>
  )
}

function ClassStudentPicker({ classId }: { classId: string }) {
  const [candidates, setCandidates] = useState<Array<{ id: string; first_name: string | null; last_name: string | null; school_stage: string | null }>>([])
  const [existing, setExisting] = useState<Set<string>>(new Set())
  const [sel, setSel] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/school/dashboard/students?limit=500').then((r) => (r.ok ? r.json() : { students: [] })),
      fetch(`/api/school/tracking/classes/${classId}/students`).then((r) => (r.ok ? r.json() : { students: [] })),
    ]).then(([list, already]) => {
      const cand = (list.students ?? []) as Array<{ id: string; firstName: string | null; lastName: string | null; schoolStage: string | null }>
      setCandidates(
        cand.map((s) => ({
          id: s.id,
          first_name: s.firstName,
          last_name: s.lastName,
          school_stage: s.schoolStage,
        }))
      )
      const ids = new Set<string>(((already.students ?? []) as Array<{ student_id: string }>).map((r) => r.student_id))
      setExisting(ids)
      setSel(ids)
    })
  }, [classId])

  async function handleSave() {
    setSaving(true)
    try {
      // Compute additions and removals
      const toAdd: string[] = []
      const toRemove: string[] = []
      for (const id of sel) if (!existing.has(id)) toAdd.push(id)
      for (const id of existing) if (!sel.has(id)) toRemove.push(id)
      if (toAdd.length > 0) {
        await fetch(`/api/school/tracking/classes/${classId}/students`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ student_ids: toAdd }),
        })
      }
      for (const id of toRemove) {
        await fetch(`/api/school/tracking/classes/${classId}/students?student_id=${id}`, { method: 'DELETE' })
      }
      setExisting(new Set(sel))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ marginTop: 10 }}>
      <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>Tick students to add them to this class.</p>
      <div style={{ maxHeight: 300, overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: 6, padding: 8 }}>
        {candidates.length === 0 ? (
          <p style={{ opacity: 0.6 }}>No linked students yet.</p>
        ) : (
          candidates.map((s) => (
            <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 2px', fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                checked={sel.has(s.id)}
                onChange={() => {
                  setSel((prev) => {
                    const next = new Set(prev)
                    if (next.has(s.id)) next.delete(s.id)
                    else next.add(s.id)
                    return next
                  })
                }}
              />
              {s.last_name ?? '—'}, {s.first_name ?? ''} <span style={{ opacity: 0.6 }}>{s.school_stage ?? ''}</span>
            </label>
          ))
        )}
      </div>
      <div style={{ marginTop: 10 }}>
        <button onClick={handleSave} disabled={saving} style={{ padding: '8px 14px', background: '#1B3A5C', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
          {saving ? 'Saving…' : 'Save class list'}
        </button>
      </div>
    </div>
  )
}
