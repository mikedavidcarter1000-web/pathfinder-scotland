'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type HistoryRow = {
  id: string
  import_type: string
  file_name: string | null
  row_count: number | null
  imported_at: string
  school_staff?: { full_name: string } | null
}

const TYPE_LABELS: Record<string, string> = {
  pupil_data: 'Pupil data',
  attendance: 'Attendance',
  class_lists: 'Class lists',
  transition: 'Transition',
}

// Last-import-at-a-glance card for the school dashboard overview.
// Silent when the viewer has no tracking-management permission.
export function ImportStatusWidget({ canManage }: { canManage: boolean }) {
  const [latest, setLatest] = useState<HistoryRow | null>(null)
  const [sqaYear, setSqaYear] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!canManage) { setLoaded(true); return }
    fetch('/api/school/import/history').then((r) => r.json()).then((d) => {
      setLatest((d.seemis ?? [])[0] ?? null)
      setSqaYear((d.sqa ?? [])[0]?.academic_year ?? null)
    }).finally(() => setLoaded(true))
  }, [canManage])

  if (!canManage || !loaded) return null

  return (
    <section style={{ padding: 14, border: '1px solid var(--pf-grey-200)', borderRadius: 8, background: '#fff' }}>
      <h3 style={{ fontSize: 15, margin: '0 0 6px' }}>Data import</h3>
      {latest ? (
        <p style={{ fontSize: 13, margin: '0 0 6px', color: '#555' }}>
          Last import: <strong>{TYPE_LABELS[latest.import_type] ?? latest.import_type}</strong>
          {' '}on {new Date(latest.imported_at).toLocaleDateString('en-GB')}
          {latest.school_staff?.full_name ? ` by ${latest.school_staff.full_name}` : ''}
          . {latest.row_count ?? 0} rows.
        </p>
      ) : (
        <p style={{ fontSize: 13, margin: '0 0 6px', color: '#555' }}>
          Import your SEEMIS data to get started.
        </p>
      )}
      {sqaYear && (
        <p style={{ fontSize: 12, margin: '0 0 8px', color: '#0059b3' }}>Results Day analysis available for {sqaYear}.</p>
      )}
      <Link href="/school/import" style={{ fontSize: 13, color: '#0059b3', fontWeight: 500 }}>
        {latest ? 'Manage imports →' : 'Go to import →'}
      </Link>
    </section>
  )
}
