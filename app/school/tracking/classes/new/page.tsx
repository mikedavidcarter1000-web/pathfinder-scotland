'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/components/ui/toast'

type StaffOption = { id: string; full_name: string; role: string; department: string | null }
type SubjectOption = { id: string; name: string }
type QualificationOption = { id: string; name: string; short_name: string; scqf_level: number | null }

function currentAcademicYear(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const start = m >= 7 ? y : y - 1
  return `${start}/${start + 1}`
}

export default function NewClassPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const toast = useToast()

  const [staff, setStaff] = useState<StaffOption[]>([])
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [qualifications, setQualifications] = useState<QualificationOption[]>([])
  const [loading, setLoading] = useState(true)

  const [staffId, setStaffId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [yearGroup, setYearGroup] = useState('S4')
  const [classCode, setClassCode] = useState('')
  const [qualId, setQualId] = useState('')
  const [academicYear, setAcademicYear] = useState(currentAcademicYear())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/sign-in?redirect=/school/tracking/classes/new')
      return
    }
    Promise.all([
      fetch('/api/school/me').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/school/staff').then((r) => (r.ok ? r.json() : { staff: [] })),
      fetch('/api/school/tracking/reference-data').then((r) => (r.ok ? r.json() : { subjects: [], qualification_types: [] })),
    ])
      .then(([me, s, ref]) => {
        if (!me || !me.staff.canManageTracking && !me.staff.isAdmin) {
          toast.error('You do not have permission to manage classes.')
          router.replace('/school/tracking')
          return
        }
        setStaff(s.staff ?? [])
        setSubjects(ref.subjects ?? [])
        setQualifications(ref.qualification_types ?? [])
      })
      .finally(() => setLoading(false))
  }, [authLoading, user, router, toast])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!staffId || !yearGroup || !academicYear) return
    setSaving(true)
    try {
      const res = await fetch('/api/school/tracking/classes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          staff_id: staffId,
          subject_id: subjectId || null,
          year_group: yearGroup,
          class_code: classCode || null,
          qualification_type_id: qualId || null,
          academic_year: academicYear,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Could not create class.')
        return
      }
      toast.success('Class created.')
      router.replace('/school/tracking')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="pf-container pt-8 pb-12"><p>Loading…</p></div>

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Link href="/school/tracking" style={{ fontSize: '0.875rem' }}>&larr; Tracking</Link>
      </div>
      <h1 style={{ margin: '0 0 16px', fontSize: '1.5rem' }}>Add class</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={labelStyle}>
          Teacher
          <select value={staffId} onChange={(e) => setStaffId(e.target.value)} style={inputStyle} required>
            <option value="">Select a teacher</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.role})
              </option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          Subject
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} style={inputStyle}>
            <option value="">No subject (generic class)</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          Year group
          <select value={yearGroup} onChange={(e) => setYearGroup(e.target.value)} style={inputStyle} required>
            {['S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map((yg) => (
              <option key={yg} value={yg}>{yg}</option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          Qualification
          <select value={qualId} onChange={(e) => setQualId(e.target.value)} style={inputStyle}>
            <option value="">No qualification (generic)</option>
            {qualifications.map((q) => (
              <option key={q.id} value={q.id}>
                {q.name}
              </option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          Class code (optional)
          <input value={classCode} onChange={(e) => setClassCode(e.target.value)} style={inputStyle} placeholder="e.g. 4H1" />
        </label>
        <label style={labelStyle}>
          Academic year
          <input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} style={inputStyle} required />
        </label>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button type="submit" disabled={saving} style={btnPrimary}>
            {saving ? 'Creating…' : 'Create class'}
          </button>
          <Link href="/school/tracking" style={btnGhost}>Cancel</Link>
        </div>
      </form>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }
const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  fontSize: '0.9rem',
}
const btnPrimary: React.CSSProperties = {
  padding: '8px 14px',
  backgroundColor: '#1B3A5C',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.875rem',
}
const btnGhost: React.CSSProperties = {
  padding: '8px 14px',
  backgroundColor: 'transparent',
  color: '#1B3A5C',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  fontWeight: 600,
  fontSize: '0.875rem',
  textDecoration: 'none',
  display: 'inline-block',
}
