'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type TabKey = 'pupils' | 'attendance' | 'classes' | 'sqa' | 'transition' | 'destinations'
type Preview = { headers: string[]; preview: Record<string, string>[]; rowCount: number; autoMap: Record<string, string | null> }
type ImportResult = {
  rowCount: number; matched: number; created: number; updated: number; skipped: number
  errorCount: number; errors: { row: number; message: string; field?: string }[]
  warnings: { row: number; message: string; field?: string }[]
  importId?: string | null
  unmatchedSubjects?: string[]; unmatchedTeachers?: string[]; classesCreated?: number
  exceededCount?: number; metCount?: number; belowCount?: number; avgValueAdded?: number
  below90?: number
}

const TABS: { key: TabKey; label: string; blurb: string }[] = [
  { key: 'pupils', label: 'SEEMIS Pupils', blurb: 'Pupil data extract: SCN, names, stage, registration, house, postcode, flags.' },
  { key: 'attendance', label: 'SEEMIS Attendance', blurb: 'Termly attendance totals per pupil.' },
  { key: 'classes', label: 'SEEMIS Classes', blurb: 'Class-list extract: pupil -> subject -> teacher.' },
  { key: 'sqa', label: 'SQA Results', blurb: 'Post-Results Day candidate grades with value-added.' },
  { key: 'transition', label: 'Transition', blurb: 'P7 -> S1 cohort data from cluster primaries.' },
  { key: 'destinations', label: 'Destinations', blurb: 'Leaver destinations (SDS follow-up or manual entry).' },
]

export default function ImportPage() {
  const router = useRouter()
  const [tab, setTab] = useState<TabKey>('pupils')
  const [me, setMe] = useState<any>(null)
  const [loadingMe, setLoadingMe] = useState(true)

  useEffect(() => {
    fetch('/api/school/me').then((r) => r.json()).then((d) => {
      setMe(d)
      setLoadingMe(false)
      if (d?.staff && !d.staff.canManageTracking && !d.staff.isAdmin) {
        router.replace('/school/dashboard')
      }
    })
  }, [router])

  if (loadingMe) return <div className="pf-container pt-8 pb-12"><p>Loading&hellip;</p></div>
  if (!me) return null

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: 1200 }}>
      <div style={{ marginBottom: 12 }}>
        <Link href="/school/dashboard" style={{ fontSize: 13 }}>&larr; Dashboard</Link>
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 0 }}>Data import</h1>
      <p style={{ color: '#555', fontSize: 14, margin: '4px 0 16px' }}>
        Bulk-load pupil data, SQA results, transition, and destinations. SCN-matched uploads update existing students in place.
      </p>

      <div role="tablist" style={{ display: 'flex', gap: 2, borderBottom: '1px solid #e5e5e5', marginBottom: 20, overflowX: 'auto' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            style={{ padding: '8px 14px', fontSize: 14, border: 'none', borderBottom: tab === t.key ? '2px solid #0059b3' : '2px solid transparent', background: 'transparent', color: tab === t.key ? '#0059b3' : '#333', fontWeight: tab === t.key ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pupils' && <PupilsTab />}
      {tab === 'attendance' && <AttendanceTab />}
      {tab === 'classes' && <ClassesTab />}
      {tab === 'sqa' && <SqaTab />}
      {tab === 'transition' && <TransitionTab />}
      {tab === 'destinations' && <DestinationsTab canManage={!!me?.staff?.isAdmin || ['guidance_teacher','pt_guidance','dyw_coordinator','depute','head_teacher'].includes(me?.staff?.role)} />}

      <ImportHistory isAdmin={!!me?.staff?.isAdmin} />
      <UnmatchedPanel />
    </div>
  )
}

// ------------------- Reusable upload UI -------------------

type UploadKind = TabKey
function useUpload(kind: UploadKind) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [map, setMap] = useState<Record<string, string | null>>({})
  const [error, setError] = useState<string | null>(null)
  const [parsing, setParsing] = useState(false)

  const parse = useCallback(async (f: File) => {
    setParsing(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', f)
      fd.append('kind', kind)
      const res = await fetch('/api/school/import/parse', { method: 'POST', body: fd })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Parse failed')
      setPreview(j)
      setMap({ ...j.autoMap })
    } catch (e: any) {
      setError(e.message ?? String(e))
    } finally {
      setParsing(false)
    }
  }, [kind])

  const onFile = useCallback((f: File | null) => {
    setFile(f)
    setPreview(null)
    setMap({})
    if (f) parse(f)
  }, [parse])

  const clear = useCallback(() => { setFile(null); setPreview(null); setMap({}); setError(null) }, [])

  return { file, preview, map, setMap, error, parsing, onFile, clear }
}

function Instructions({ children }: { children: React.ReactNode }) {
  return <div style={{ background: '#f3f4f6', padding: 12, borderRadius: 6, fontSize: 13, lineHeight: 1.55, color: '#374151' }}>{children}</div>
}

function FileInput({ onChange, accept = '.csv,.xlsx' }: { onChange: (f: File | null) => void; accept?: string }) {
  return (
    <label style={{ display: 'inline-block', cursor: 'pointer', marginTop: 12 }}>
      <span style={{ padding: '8px 16px', background: '#0059b3', color: '#fff', borderRadius: 6, fontSize: 14, fontWeight: 500 }}>Choose file</span>
      <input type="file" accept={accept} style={{ display: 'none' }} onChange={(e) => onChange(e.currentTarget.files?.[0] ?? null)} />
    </label>
  )
}

function PreviewTable({ preview }: { preview: Preview }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>First 10 of {preview.rowCount} rows:</div>
      <div style={{ overflow: 'auto', border: '1px solid #e5e5e5', borderRadius: 4 }}>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f9fafb' }}>{preview.headers.map((h) => <th key={h} style={{ padding: '6px 8px', textAlign: 'left', borderRight: '1px solid #eee' }}>{h}</th>)}</tr></thead>
          <tbody>
            {preview.preview.map((row, i) => (
              <tr key={i} style={{ borderTop: '1px solid #f1f1f1' }}>
                {preview.headers.map((h) => <td key={h} style={{ padding: '5px 8px', borderRight: '1px solid #f5f5f5' }}>{row[h]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ColumnMapper({ fields, preview, map, setMap }: { fields: Array<{ key: string; label: string; required?: boolean }>; preview: Preview; map: Record<string, string | null>; setMap: (m: Record<string, string | null>) => void }) {
  return (
    <div style={{ marginTop: 14, padding: 12, background: '#fff', border: '1px solid #e5e5e5', borderRadius: 6 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Column mapping</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
        {fields.map((f) => (
          <label key={f.key} style={{ fontSize: 13 }}>
            <div style={{ fontWeight: 500, marginBottom: 2 }}>{f.label}{f.required ? ' *' : ''}</div>
            <select value={map[f.key] ?? ''} onChange={(e) => setMap({ ...map, [f.key]: e.target.value || null })}
              style={{ width: '100%', padding: 6, border: '1px solid #ccc', borderRadius: 4, fontSize: 13 }}>
              <option value="">— none —</option>
              {preview.headers.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </label>
        ))}
      </div>
    </div>
  )
}

function ResultSummary({ result }: { result: ImportResult }) {
  return (
    <div style={{ marginTop: 16, padding: 14, background: '#ecfdf5', border: '1px solid #86efac', borderRadius: 6 }}>
      <div style={{ fontWeight: 600, color: '#065f46', marginBottom: 6 }}>Import complete</div>
      <div style={{ fontSize: 14, color: '#065f46' }}>
        {result.created > 0 && <span style={{ marginRight: 14 }}>Created: <strong>{result.created}</strong></span>}
        {result.updated > 0 && <span style={{ marginRight: 14 }}>Updated: <strong>{result.updated}</strong></span>}
        <span style={{ marginRight: 14 }}>Matched: <strong>{result.matched}</strong></span>
        {result.skipped > 0 && <span style={{ marginRight: 14 }}>Skipped: <strong>{result.skipped}</strong></span>}
        {result.errorCount > 0 && <span style={{ color: '#991b1b' }}>Errors: <strong>{result.errorCount}</strong></span>}
      </div>
      {result.classesCreated != null && <div style={{ fontSize: 13, marginTop: 4 }}>Classes created/updated: <strong>{result.classesCreated}</strong></div>}
      {result.unmatchedSubjects && result.unmatchedSubjects.length > 0 && (
        <div style={{ marginTop: 6, fontSize: 13, color: '#92400e' }}>Unmatched subjects: {result.unmatchedSubjects.join(', ')}</div>
      )}
      {result.unmatchedTeachers && result.unmatchedTeachers.length > 0 && (
        <div style={{ marginTop: 4, fontSize: 13, color: '#92400e' }}>Unmatched teachers: {result.unmatchedTeachers.join(', ')}</div>
      )}
      {result.below90 != null && <div style={{ fontSize: 13, marginTop: 4 }}>Below 90% attendance: <strong>{result.below90}</strong></div>}
      {result.exceededCount != null && (
        <div style={{ fontSize: 13, marginTop: 6 }}>
          Value-added: {result.exceededCount} exceeded, {result.metCount} met, {result.belowCount} below predictions. Avg VA: {result.avgValueAdded}.
        </div>
      )}
      {(result.errors.length + result.warnings.length > 0) && (
        <details style={{ marginTop: 8, fontSize: 13 }}>
          <summary style={{ cursor: 'pointer' }}>Show {result.errors.length} error{result.errors.length === 1 ? '' : 's'}, {result.warnings.length} warning{result.warnings.length === 1 ? '' : 's'}</summary>
          <ul style={{ maxHeight: 240, overflow: 'auto', margin: '6px 0', paddingLeft: 18 }}>
            {result.errors.map((e, i) => <li key={`e${i}`} style={{ color: '#991b1b' }}>Row {e.row}: {e.message}</li>)}
            {result.warnings.map((w, i) => <li key={`w${i}`} style={{ color: '#92400e' }}>Row {w.row}: {w.message}</li>)}
          </ul>
        </details>
      )}
    </div>
  )
}

// ------------------- Pupils tab -------------------

function PupilsTab() {
  const up = useUpload('pupils')
  const [result, setResult] = useState<ImportResult | null>(null)
  const [importing, setImporting] = useState(false)

  async function doImport() {
    if (!up.file) return
    setImporting(true)
    setResult(null)
    const fd = new FormData()
    fd.append('file', up.file)
    fd.append('map', JSON.stringify(up.map))
    const res = await fetch('/api/school/import/pupils', { method: 'POST', body: fd })
    const j = await res.json()
    setResult(j)
    setImporting(false)
  }

  return (
    <section>
      <h2 style={{ fontSize: 18, margin: '8px 0' }}>SEEMIS pupil import</h2>
      <Instructions>
        <p style={{ marginTop: 0 }}>Export pupil data from SEEMIS Click+Go:</p>
        <ol style={{ paddingLeft: 20, margin: '4px 0' }}>
          <li>In SEEMIS, go to <strong>Reports &rarr; Custom Reports</strong></li>
          <li>Run a report that includes: SCN, Forename, Surname, Date of Birth, Year Group, Registration Class, House Group, Postcode, ASN flag, FSM flag, EAL flag, LAC flag</li>
          <li>Export as CSV or Excel (&lt;5MB)</li>
        </ol>
        <p style={{ marginBottom: 0 }}>Expected columns: SCN &middot; Forename &middot; Surname &middot; DOB &middot; Year Group &middot; Reg Class &middot; House &middot; Postcode &middot; ASN &middot; FSM &middot; EAL &middot; LAC</p>
      </Instructions>
      <FileInput onChange={up.onFile} />
      {up.parsing && <p style={{ fontSize: 13, color: '#555' }}>Parsing&hellip;</p>}
      {up.error && <p style={{ color: '#991b1b' }}>{up.error}</p>}
      {up.preview && (
        <>
          <PreviewTable preview={up.preview} />
          <ColumnMapper
            preview={up.preview}
            map={up.map}
            setMap={up.setMap}
            fields={[
              { key: 'scn', label: 'SCN', required: true },
              { key: 'forename', label: 'Forename', required: true },
              { key: 'surname', label: 'Surname', required: true },
              { key: 'year_group', label: 'Year group', required: true },
              { key: 'dob', label: 'Date of birth' },
              { key: 'registration_class', label: 'Registration class' },
              { key: 'house', label: 'House' },
              { key: 'postcode', label: 'Postcode' },
              { key: 'asn', label: 'ASN flag' },
              { key: 'fsm', label: 'FSM flag' },
              { key: 'eal', label: 'EAL flag' },
              { key: 'lac', label: 'LAC flag (care-experienced)' },
            ]}
          />
          <div style={{ marginTop: 14 }}>
            <button onClick={doImport} disabled={importing} style={primaryBtn}>{importing ? 'Importing…' : `Import ${up.preview.rowCount} pupils`}</button>
            <button onClick={up.clear} style={{ ...secondaryBtn, marginLeft: 8 }}>Cancel</button>
          </div>
        </>
      )}
      {result && <ResultSummary result={result} />}
    </section>
  )
}

// ------------------- Attendance tab -------------------

function AttendanceTab() {
  const up = useUpload('attendance')
  const [result, setResult] = useState<ImportResult | null>(null)
  const [importing, setImporting] = useState(false)
  const [year, setYear] = useState<string>(defaultAcademicYear())
  const [term, setTerm] = useState<string>('Autumn')

  async function doImport() {
    if (!up.file) return
    setImporting(true); setResult(null)
    const fd = new FormData()
    fd.append('file', up.file)
    fd.append('map', JSON.stringify(up.map))
    fd.append('academic_year', year); fd.append('term', term)
    const res = await fetch('/api/school/import/attendance', { method: 'POST', body: fd })
    setResult(await res.json()); setImporting(false)
  }

  return (
    <section>
      <h2 style={{ fontSize: 18, margin: '8px 0' }}>SEEMIS attendance import</h2>
      <Instructions>
        <p style={{ marginTop: 0 }}>Export attendance data from SEEMIS Click+Go:</p>
        <ol style={{ paddingLeft: 20, margin: '4px 0' }}>
          <li>Go to <strong>Reports &rarr; Attendance Summary</strong></li>
          <li>Select the term/period</li>
          <li>Include: SCN, Total Possible, Total Attendance, Authorised Absence, Unauthorised Absence</li>
          <li>Export as CSV</li>
        </ol>
      </Instructions>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 14 }}>
        <label style={{ fontSize: 13 }}>
          Academic year
          <input value={year} onChange={(e) => setYear(e.target.value)} style={inputSm} placeholder="2025-26" />
        </label>
        <label style={{ fontSize: 13 }}>
          Term
          <select value={term} onChange={(e) => setTerm(e.target.value)} style={inputSm}>
            <option>Autumn</option><option>Spring</option><option>Summer</option>
          </select>
        </label>
      </div>
      <FileInput onChange={up.onFile} />
      {up.parsing && <p style={{ fontSize: 13, color: '#555' }}>Parsing&hellip;</p>}
      {up.error && <p style={{ color: '#991b1b' }}>{up.error}</p>}
      {up.preview && (
        <>
          <PreviewTable preview={up.preview} />
          <ColumnMapper preview={up.preview} map={up.map} setMap={up.setMap}
            fields={[
              { key: 'scn', label: 'SCN', required: true },
              { key: 'total_possible', label: 'Total possible', required: true },
              { key: 'total_present', label: 'Total present', required: true },
              { key: 'authorised', label: 'Authorised absence' },
              { key: 'unauthorised', label: 'Unauthorised absence' },
            ]}
          />
          <div style={{ marginTop: 14 }}>
            <button onClick={doImport} disabled={importing} style={primaryBtn}>{importing ? 'Importing…' : `Import ${up.preview.rowCount} rows`}</button>
          </div>
        </>
      )}
      {result && <ResultSummary result={result} />}
    </section>
  )
}

// ------------------- Classes tab -------------------

function ClassesTab() {
  const up = useUpload('classes')
  const [result, setResult] = useState<ImportResult | null>(null)
  const [importing, setImporting] = useState(false)
  const [year, setYear] = useState<string>(defaultAcademicYear())

  async function doImport() {
    if (!up.file) return
    setImporting(true); setResult(null)
    const fd = new FormData()
    fd.append('file', up.file); fd.append('map', JSON.stringify(up.map)); fd.append('academic_year', year)
    const res = await fetch('/api/school/import/classes', { method: 'POST', body: fd })
    setResult(await res.json()); setImporting(false)
  }

  return (
    <section>
      <h2 style={{ fontSize: 18, margin: '8px 0' }}>SEEMIS class lists import</h2>
      <Instructions>
        <p style={{ marginTop: 0 }}>Export class lists from SEEMIS Click+Go:</p>
        <ol style={{ paddingLeft: 20, margin: '4px 0' }}>
          <li>Go to <strong>Reports &rarr; Class Lists</strong></li>
          <li>Include: SCN, Subject, Class Code, Teacher Name</li>
          <li>Export as CSV</li>
        </ol>
      </Instructions>
      <div style={{ marginTop: 12, fontSize: 13 }}>
        <label>Academic year <input value={year} onChange={(e) => setYear(e.target.value)} style={inputSm} /></label>
      </div>
      <FileInput onChange={up.onFile} />
      {up.parsing && <p style={{ fontSize: 13, color: '#555' }}>Parsing&hellip;</p>}
      {up.error && <p style={{ color: '#991b1b' }}>{up.error}</p>}
      {up.preview && (
        <>
          <PreviewTable preview={up.preview} />
          <ColumnMapper preview={up.preview} map={up.map} setMap={up.setMap}
            fields={[
              { key: 'scn', label: 'SCN', required: true },
              { key: 'subject', label: 'Subject', required: true },
              { key: 'class_code', label: 'Class code' },
              { key: 'teacher', label: 'Teacher' },
            ]}
          />
          <div style={{ marginTop: 14 }}>
            <button onClick={doImport} disabled={importing} style={primaryBtn}>{importing ? 'Importing…' : `Import ${up.preview.rowCount} rows`}</button>
          </div>
        </>
      )}
      {result && <ResultSummary result={result} />}
    </section>
  )
}

// ------------------- SQA tab -------------------

function SqaTab() {
  const up = useUpload('sqa')
  const [result, setResult] = useState<ImportResult | null>(null)
  const [importing, setImporting] = useState(false)
  const [year, setYear] = useState<string>(defaultAcademicYear())
  const [analysis, setAnalysis] = useState<any>(null)

  async function doImport() {
    if (!up.file) return
    setImporting(true); setResult(null)
    const fd = new FormData()
    fd.append('file', up.file); fd.append('map', JSON.stringify(up.map)); fd.append('academic_year', year)
    const res = await fetch('/api/school/import/sqa', { method: 'POST', body: fd })
    setResult(await res.json()); setImporting(false)
  }

  async function loadAnalysis() {
    const res = await fetch(`/api/school/import/sqa/analysis?academic_year=${encodeURIComponent(year)}`)
    if (res.ok) setAnalysis(await res.json())
  }

  useEffect(() => { loadAnalysis() }, [year]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (result && result.created > 0) loadAnalysis() }, [result]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section>
      <h2 style={{ fontSize: 18, margin: '8px 0' }}>SQA results import</h2>
      <Instructions>
        <p style={{ marginTop: 0 }}>After Results Day, upload the SQA results CSV for your school. Each row: SCN, Candidate Name, Subject, Level, Grade.</p>
        <p style={{ marginBottom: 0 }}>Matched rows update the corresponding tracking entry with the actual grade and compute value-added against the predicted grade.</p>
      </Instructions>
      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 13 }}>Academic year <input value={year} onChange={(e) => setYear(e.target.value)} style={inputSm} /></label>
      </div>
      <FileInput onChange={up.onFile} />
      {up.parsing && <p style={{ fontSize: 13, color: '#555' }}>Parsing&hellip;</p>}
      {up.error && <p style={{ color: '#991b1b' }}>{up.error}</p>}
      {up.preview && (
        <>
          <PreviewTable preview={up.preview} />
          <ColumnMapper preview={up.preview} map={up.map} setMap={up.setMap}
            fields={[
              { key: 'scn', label: 'SCN' },
              { key: 'name', label: 'Candidate name' },
              { key: 'subject', label: 'Subject', required: true },
              { key: 'level', label: 'Qualification level' },
              { key: 'grade', label: 'Grade', required: true },
            ]}
          />
          <div style={{ marginTop: 14 }}>
            <button onClick={doImport} disabled={importing} style={primaryBtn}>{importing ? 'Importing…' : `Import ${up.preview.rowCount} rows`}</button>
          </div>
        </>
      )}
      {result && <ResultSummary result={result} />}
      {analysis && <SqaAnalysis data={analysis} />}
    </section>
  )
}

function SqaAnalysis({ data }: { data: any }) {
  if (!data.valueAddedBySubject || data.valueAddedBySubject.length === 0) {
    return <div style={{ marginTop: 16, color: '#666', fontSize: 13 }}>No results yet for this year.</div>
  }
  return (
    <div style={{ marginTop: 20 }}>
      <h3 style={{ fontSize: 16, margin: '10px 0' }}>Value-added by subject</h3>
      <div style={{ overflow: 'auto', border: '1px solid #e5e5e5', borderRadius: 4 }}>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f9fafb' }}>
            <th style={thSm}>Subject</th><th style={thSm}>Students</th><th style={thSm}>Avg predicted</th><th style={thSm}>Avg actual</th><th style={thSm}>VA</th><th style={thSm}>Above</th><th style={thSm}>Met</th><th style={thSm}>Below</th>
          </tr></thead>
          <tbody>
            {data.valueAddedBySubject.map((r: any) => (
              <tr key={r.subject} style={{ borderTop: '1px solid #eee' }}>
                <td style={tdSm}>{r.subject}</td>
                <td style={tdSm}>{r.students}</td>
                <td style={tdSm}>{r.avgPredicted ?? '-'}</td>
                <td style={tdSm}>{r.avgActual ?? '-'}</td>
                <td style={{ ...tdSm, color: r.valueAdded != null ? (r.valueAdded >= 0 ? '#16a34a' : '#dc2626') : '#666' }}>{r.valueAdded ?? '-'}</td>
                <td style={tdSm}>{r.above}</td>
                <td style={tdSm}>{r.met}</td>
                <td style={tdSm}>{r.below}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ fontSize: 16, margin: '14px 0 8px' }}>Grade distribution</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <GradeDistBar title="Predicted" dist={data.gradeDistribution.predicted} />
        <GradeDistBar title="Actual" dist={data.gradeDistribution.actual} />
      </div>

      {data.discrepancies && data.discrepancies.length > 0 && (
        <>
          <h3 style={{ fontSize: 16, margin: '14px 0 8px' }}>Students 2+ grades below prediction</h3>
          <p style={{ fontSize: 13, color: '#555', margin: '0 0 8px' }}>These students may benefit from a review conversation with their guidance teacher.</p>
          <div style={{ overflow: 'auto', border: '1px solid #e5e5e5', borderRadius: 4 }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f9fafb' }}><th style={thSm}>Student</th><th style={thSm}>Subject</th><th style={thSm}>Predicted</th><th style={thSm}>Actual</th><th style={thSm}>VA</th></tr></thead>
              <tbody>
                {data.discrepancies.map((d: any, i: number) => (
                  <tr key={i} style={{ borderTop: '1px solid #eee' }}>
                    <td style={tdSm}>{d.student_id ? <Link href={`/school/guidance/${d.student_id}`} style={{ color: '#0059b3' }}>{d.student_name}</Link> : d.student_name}</td>
                    <td style={tdSm}>{d.subject}</td>
                    <td style={tdSm}>{d.predicted ?? '-'}</td>
                    <td style={tdSm}>{d.actual}</td>
                    <td style={{ ...tdSm, color: '#dc2626' }}>{d.value_added}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function GradeDistBar({ title, dist }: { title: string; dist: Record<string, number> }) {
  const entries = Object.entries(dist).sort((a, b) => a[0].localeCompare(b[0]))
  const max = Math.max(1, ...entries.map(([, v]) => v))
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{title}</div>
      {entries.map(([g, v]) => (
        <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, fontSize: 12 }}>
          <div style={{ width: 30, textAlign: 'right' }}>{g}</div>
          <div style={{ flex: 1, background: '#e5e5e5', height: 14, borderRadius: 2 }}>
            <div style={{ width: `${(v / max) * 100}%`, background: '#0059b3', height: '100%', borderRadius: 2 }} />
          </div>
          <div style={{ width: 30 }}>{v}</div>
        </div>
      ))}
    </div>
  )
}

// ------------------- Transition tab -------------------

function TransitionTab() {
  const up = useUpload('transition')
  const [result, setResult] = useState<ImportResult | null>(null)
  const [importing, setImporting] = useState(false)
  const [year, setYear] = useState<string>(defaultAcademicYear())
  const [dashboard, setDashboard] = useState<any>(null)

  async function doImport() {
    if (!up.file) return
    setImporting(true); setResult(null)
    const fd = new FormData()
    fd.append('file', up.file); fd.append('map', JSON.stringify(up.map)); fd.append('transition_year', year)
    const res = await fetch('/api/school/import/transition', { method: 'POST', body: fd })
    setResult(await res.json()); setImporting(false)
  }
  async function loadDash() {
    const res = await fetch(`/api/school/import/transition/dashboard?transition_year=${encodeURIComponent(year)}`)
    if (res.ok) setDashboard(await res.json())
  }
  useEffect(() => { loadDash() }, [year]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (result && result.created > 0) loadDash() }, [result]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section>
      <h2 style={{ fontSize: 18, margin: '8px 0' }}>Primary-to-secondary transition</h2>
      <Instructions>
        <p style={{ marginTop: 0 }}>Upload P7 &rarr; S1 transition data from cluster primary schools. Fields accepted: SCN, Name, Primary, Reading Level, Writing Level, Listening &amp; Talking Level, Numeracy Level, SNSA Reading Score, SNSA Numeracy Score, ASN Notes, Pastoral Notes.</p>
        <p style={{ marginBottom: 0 }}>CfE levels must be one of: <strong>early, first, second, third, fourth</strong>.</p>
      </Instructions>
      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 13 }}>Transition year <input value={year} onChange={(e) => setYear(e.target.value)} style={inputSm} /></label>
      </div>
      <FileInput onChange={up.onFile} />
      {up.parsing && <p style={{ fontSize: 13, color: '#555' }}>Parsing&hellip;</p>}
      {up.error && <p style={{ color: '#991b1b' }}>{up.error}</p>}
      {up.preview && (
        <>
          <PreviewTable preview={up.preview} />
          <ColumnMapper preview={up.preview} map={up.map} setMap={up.setMap}
            fields={[
              { key: 'scn', label: 'SCN' },
              { key: 'name', label: 'Name', required: true },
              { key: 'primary', label: 'Primary school', required: true },
              { key: 'reading', label: 'Reading level' },
              { key: 'writing', label: 'Writing level' },
              { key: 'listening_talking', label: 'Listening & talking' },
              { key: 'numeracy', label: 'Numeracy level' },
              { key: 'snsa_reading', label: 'SNSA reading score' },
              { key: 'snsa_numeracy', label: 'SNSA numeracy score' },
              { key: 'asn_notes', label: 'ASN notes' },
              { key: 'pastoral_notes', label: 'Pastoral notes' },
            ]}
          />
          <div style={{ marginTop: 14 }}>
            <button onClick={doImport} disabled={importing} style={primaryBtn}>{importing ? 'Importing…' : `Import ${up.preview.rowCount} rows`}</button>
          </div>
        </>
      )}
      {result && <ResultSummary result={result} />}
      {dashboard && <TransitionDash data={dashboard} />}
    </section>
  )
}

function TransitionDash({ data }: { data: any }) {
  if (!data.total) return <div style={{ marginTop: 16, color: '#666', fontSize: 13 }}>No transition data yet.</div>
  return (
    <div style={{ marginTop: 20 }}>
      <h3 style={{ fontSize: 16, margin: '10px 0' }}>Incoming cohort overview</h3>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 14 }}>
        <Stat label="Total students" value={data.total} />
        <Stat label="Primaries" value={data.primaries} />
        <Stat label="ASN notes" value={data.asnCount} />
        <Stat label="Pastoral concerns" value={data.pastoralCount} />
      </div>

      <h3 style={{ fontSize: 16, margin: '14px 0 8px' }}>By primary school</h3>
      <div style={{ overflow: 'auto', border: '1px solid #e5e5e5', borderRadius: 4 }}>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f9fafb' }}>
            <th style={thSm}>Primary</th><th style={thSm}>Count</th><th style={thSm}>Avg reading</th><th style={thSm}>Avg numeracy</th><th style={thSm}>ASN</th>
          </tr></thead>
          <tbody>
            {data.byPrimary.map((r: any) => (
              <tr key={r.primary} style={{ borderTop: '1px solid #eee' }}>
                <td style={tdSm}>{r.primary}</td>
                <td style={tdSm}>{r.count}</td>
                <td style={tdSm}>{r.avgReadingLevel ?? '-'}</td>
                <td style={tdSm}>{r.avgNumeracyLevel ?? '-'}</td>
                <td style={tdSm}>{r.asnCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.flagged && data.flagged.length > 0 && (
        <>
          <h3 style={{ fontSize: 16, margin: '14px 0 8px' }}>Students requiring immediate attention ({data.flagged.length})</h3>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
            {data.flagged.slice(0, 30).map((f: any) => (
              <li key={f.id} style={{ marginBottom: 4 }}>
                {f.student_id
                  ? <Link href={`/school/guidance/${f.student_id}`} style={{ color: '#0059b3' }}>{f.name}</Link>
                  : f.name}
                <span style={{ color: '#666' }}> &mdash; {f.primary}: {f.reasons.join(', ')}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

// ------------------- Destinations tab -------------------

function DestinationsTab({ canManage }: { canManage: boolean }) {
  const up = useUpload('destinations')
  const [result, setResult] = useState<ImportResult | null>(null)
  const [importing, setImporting] = useState(false)
  const [mode, setMode] = useState<'import' | 'manual'>('import')
  const [dashboard, setDashboard] = useState<any>(null)

  async function doImport() {
    if (!up.file) return
    setImporting(true); setResult(null)
    const fd = new FormData()
    fd.append('file', up.file); fd.append('map', JSON.stringify(up.map))
    const res = await fetch('/api/school/import/destinations', { method: 'POST', body: fd })
    setResult(await res.json()); setImporting(false)
  }

  async function loadDash() {
    const res = await fetch('/api/school/import/destinations?dashboard=1')
    if (res.ok) setDashboard(await res.json())
  }
  useEffect(() => { loadDash() }, [])
  useEffect(() => { if (result && (result.created ?? 0) > 0) loadDash() }, [result])

  return (
    <section>
      <h2 style={{ fontSize: 18, margin: '8px 0' }}>Leaver destinations</h2>
      {!canManage && <p style={{ color: '#92400e', fontSize: 13 }}>Read-only access: destinations management is restricted to guidance staff, DYW coordinator, and leadership.</p>}

      {canManage && (
        <div style={{ marginBottom: 10 }}>
          <button onClick={() => setMode('import')} style={mode === 'import' ? miniPrimary : miniGhost}>Import file</button>
          <button onClick={() => setMode('manual')} style={{ ...(mode === 'manual' ? miniPrimary : miniGhost), marginLeft: 6 }}>Manual entry</button>
        </div>
      )}

      {canManage && mode === 'import' && (
        <>
          <Instructions>
            Upload SDS Initial Destinations data (or equivalent). Expected columns: SCN, Student Name, Leaving Year (e.g. 2025-26), Leaving Stage (S4/S5/S6), Destination, Institution/Employer, Course.
          </Instructions>
          <FileInput onChange={up.onFile} />
          {up.parsing && <p style={{ fontSize: 13, color: '#555' }}>Parsing&hellip;</p>}
          {up.error && <p style={{ color: '#991b1b' }}>{up.error}</p>}
          {up.preview && (
            <>
              <PreviewTable preview={up.preview} />
              <ColumnMapper preview={up.preview} map={up.map} setMap={up.setMap}
                fields={[
                  { key: 'scn', label: 'SCN' },
                  { key: 'name', label: 'Name' },
                  { key: 'leaving_year', label: 'Leaving year', required: true },
                  { key: 'leaving_stage', label: 'Leaving stage', required: true },
                  { key: 'destination', label: 'Destination type', required: true },
                  { key: 'institution', label: 'Institution name' },
                  { key: 'course', label: 'Course' },
                  { key: 'employer', label: 'Employer' },
                ]}
              />
              <div style={{ marginTop: 14 }}>
                <button onClick={doImport} disabled={importing} style={primaryBtn}>{importing ? 'Importing…' : `Import ${up.preview.rowCount} rows`}</button>
              </div>
            </>
          )}
          {result && <ResultSummary result={result} />}
        </>
      )}

      {canManage && mode === 'manual' && <ManualDestinationEntry onSaved={loadDash} />}

      {dashboard && <DestinationsDash data={dashboard} />}
    </section>
  )
}

function ManualDestinationEntry({ onSaved }: { onSaved: () => void }) {
  const [form, setForm] = useState({
    student_name: '', scn: '', leaving_year: defaultAcademicYear(), leaving_stage: 'S6',
    destination_type: 'higher_education', institution_name: '', course_name: '', employer_name: '',
    data_source: 'manual', confirmed: false, notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  async function submit() {
    setSaving(true); setStatus(null)
    const res = await fetch('/api/school/import/destinations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    const j = await res.json()
    if (res.ok) {
      setStatus('Saved.')
      setForm({ ...form, student_name: '', scn: '', institution_name: '', course_name: '', employer_name: '', notes: '' })
      onSaved()
    } else {
      setStatus(j.error ?? 'Save failed')
    }
    setSaving(false)
  }

  return (
    <div style={{ padding: 14, border: '1px solid #e5e5e5', borderRadius: 6, marginTop: 8 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Add destination</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
        <L label="Student name"><input value={form.student_name} onChange={(e) => setForm({ ...form, student_name: e.target.value })} style={inputSm} /></L>
        <L label="SCN"><input value={form.scn} onChange={(e) => setForm({ ...form, scn: e.target.value })} style={inputSm} /></L>
        <L label="Leaving year"><input value={form.leaving_year} onChange={(e) => setForm({ ...form, leaving_year: e.target.value })} style={inputSm} /></L>
        <L label="Leaving stage">
          <select value={form.leaving_stage} onChange={(e) => setForm({ ...form, leaving_stage: e.target.value })} style={inputSm}>
            <option>S4</option><option>S5</option><option>S6</option>
          </select>
        </L>
        <L label="Destination type">
          <select value={form.destination_type} onChange={(e) => setForm({ ...form, destination_type: e.target.value })} style={inputSm}>
            <option value="higher_education">Higher education</option>
            <option value="further_education">Further education</option>
            <option value="modern_apprenticeship">Modern apprenticeship</option>
            <option value="graduate_apprenticeship">Graduate apprenticeship</option>
            <option value="employment">Employment</option>
            <option value="training">Training</option>
            <option value="voluntary">Voluntary</option>
            <option value="gap_year">Gap year</option>
            <option value="unemployed_seeking">Unemployed — seeking</option>
            <option value="unemployed_not_seeking">Unemployed — not seeking</option>
            <option value="unknown">Unknown</option>
          </select>
        </L>
        <L label="Institution"><input value={form.institution_name} onChange={(e) => setForm({ ...form, institution_name: e.target.value })} style={inputSm} /></L>
        <L label="Course"><input value={form.course_name} onChange={(e) => setForm({ ...form, course_name: e.target.value })} style={inputSm} /></L>
        <L label="Employer"><input value={form.employer_name} onChange={(e) => setForm({ ...form, employer_name: e.target.value })} style={inputSm} /></L>
        <L label="Data source">
          <select value={form.data_source} onChange={(e) => setForm({ ...form, data_source: e.target.value })} style={inputSm}>
            <option value="manual">Manual</option>
            <option value="sds_followup">SDS follow-up</option>
            <option value="school_contact">School contact</option>
            <option value="student_reported">Student reported</option>
          </select>
        </L>
        <L label="Confirmed">
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={form.confirmed} onChange={(e) => setForm({ ...form, confirmed: e.target.checked })} />
            <span style={{ fontSize: 13 }}>Confirmed destination</span>
          </label>
        </L>
      </div>
      <div style={{ marginTop: 10 }}>
        <L label="Notes"><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} style={{ ...inputSm, width: '100%' }} /></L>
      </div>
      <div style={{ marginTop: 10 }}>
        <button onClick={submit} disabled={saving} style={primaryBtn}>{saving ? 'Saving…' : 'Save destination'}</button>
        {status && <span style={{ marginLeft: 10, fontSize: 13 }}>{status}</span>}
      </div>
    </div>
  )
}

function DestinationsDash({ data }: { data: any }) {
  if (!data.total) return <div style={{ marginTop: 16, color: '#666', fontSize: 13 }}>No destinations data yet.</div>
  const types = Object.entries(data.byType).sort(([, a], [, b]) => (b as number) - (a as number)) as Array<[string, number]>
  return (
    <div style={{ marginTop: 20 }}>
      <h3 style={{ fontSize: 16, margin: '10px 0' }}>Summary</h3>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 14 }}>
        <Stat label="Total leavers" value={data.total} />
        <Stat label="Positive destinations" value={`${data.positivePct}%`} note={`${data.positiveCount} of ${data.total}`} />
      </div>

      <h3 style={{ fontSize: 16, margin: '14px 0 8px' }}>By destination type</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 6 }}>
        {types.map(([t, n]) => (
          <div key={t} style={{ padding: 8, border: '1px solid #e5e5e5', borderRadius: 4, fontSize: 13 }}>
            <div style={{ fontWeight: 500 }}>{labelDestType(t)}</div>
            <div style={{ color: '#555' }}>{n} ({Math.round((n / data.total) * 100)}%)</div>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 16, margin: '14px 0 8px' }}>By SIMD quintile</h3>
      <div style={{ overflow: 'auto', border: '1px solid #e5e5e5', borderRadius: 4 }}>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f9fafb' }}>
            <th style={thSm}>Quintile</th><th style={thSm}>Count</th><th style={thSm}>HE %</th><th style={thSm}>FE %</th><th style={thSm}>Employment %</th><th style={thSm}>Positive %</th>
          </tr></thead>
          <tbody>
            {data.byQuintile.map((q: any) => (
              <tr key={q.quintile} style={{ borderTop: '1px solid #eee' }}>
                <td style={tdSm}>{q.quintile} {q.quintile === 1 ? '(most deprived)' : q.quintile === 5 ? '(least deprived)' : ''}</td>
                <td style={tdSm}>{q.count}</td><td style={tdSm}>{q.hePct}%</td><td style={tdSm}>{q.fePct}%</td><td style={tdSm}>{q.employmentPct}%</td><td style={tdSm}>{q.positivePct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.yearTrend && data.yearTrend.length > 1 && (
        <>
          <h3 style={{ fontSize: 16, margin: '14px 0 8px' }}>Positive destinations by year</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 80 }}>
            {data.yearTrend.map((y: any) => (
              <div key={y.leaving_year} style={{ flex: 1, textAlign: 'center', fontSize: 11 }}>
                <div style={{ height: `${y.positive_pct * 0.7}%`, background: '#0059b3', borderRadius: '3px 3px 0 0' }} />
                <div style={{ marginTop: 2, color: '#555' }}>{y.leaving_year}</div>
                <div style={{ fontWeight: 600 }}>{y.positive_pct}%</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function labelDestType(t: string): string {
  return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// ------------------- Import history -------------------

function ImportHistory({ isAdmin }: { isAdmin: boolean }) {
  const [seemis, setSeemis] = useState<any[]>([])
  const [sqa, setSqa] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/school/import/history')
    if (res.ok) {
      const j = await res.json()
      setSeemis(j.seemis ?? []); setSqa(j.sqa ?? [])
    }
    setLoaded(true)
  }, [])
  useEffect(() => { load() }, [load])

  async function deleteOne(kind: 'seemis' | 'sqa', id: string) {
    if (!confirm('Delete this import audit record? (Imported data is retained.)')) return
    await fetch(`/api/school/import/history/${id}?kind=${kind}`, { method: 'DELETE' })
    await load()
  }

  const all = useMemo(() => {
    const rows: Array<{ id: string; kind: 'seemis' | 'sqa'; type: string; file_name: string | null; imported_by: string; imported_at: string; row_count: number; matched_count: number; created_count: number; error_count: number; details: any }> = []
    for (const s of seemis) rows.push({ id: s.id, kind: 'seemis', type: s.import_type, file_name: s.file_name, imported_by: s.school_staff?.full_name ?? 'Unknown', imported_at: s.imported_at, row_count: s.row_count ?? 0, matched_count: s.matched_count ?? 0, created_count: s.created_count ?? 0, error_count: s.error_count ?? 0, details: s })
    for (const s of sqa) rows.push({ id: s.id, kind: 'sqa', type: `SQA ${s.academic_year}`, file_name: s.file_name, imported_by: s.school_staff?.full_name ?? 'Unknown', imported_at: s.imported_at, row_count: s.row_count ?? 0, matched_count: s.matched_count ?? 0, created_count: 0, error_count: 0, details: s })
    rows.sort((a, b) => (b.imported_at ?? '').localeCompare(a.imported_at ?? ''))
    return rows
  }, [seemis, sqa])

  return (
    <section style={{ marginTop: 36, paddingTop: 20, borderTop: '1px solid #e5e5e5' }}>
      <h2 style={{ fontSize: 18, margin: '0 0 10px' }}>Import history</h2>
      {!loaded && <p style={{ fontSize: 13, color: '#555' }}>Loading&hellip;</p>}
      {loaded && all.length === 0 && <p style={{ fontSize: 13, color: '#555' }}>No imports run yet.</p>}
      {all.length > 0 && (
        <div style={{ overflow: 'auto', border: '1px solid #e5e5e5', borderRadius: 4 }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#f9fafb' }}>
              <th style={thSm}>Date</th><th style={thSm}>Type</th><th style={thSm}>File</th><th style={thSm}>By</th><th style={thSm}>Rows</th><th style={thSm}>Matched</th><th style={thSm}>Created</th><th style={thSm}>Errors</th><th style={thSm}></th>
            </tr></thead>
            <tbody>
              {all.map((r) => (
                <tr key={`${r.kind}-${r.id}`} style={{ borderTop: '1px solid #eee' }}>
                  <td style={tdSm}>{new Date(r.imported_at).toLocaleDateString('en-GB')}</td>
                  <td style={tdSm}>{r.type}</td>
                  <td style={tdSm}>{r.file_name ?? '-'}</td>
                  <td style={tdSm}>{r.imported_by}</td>
                  <td style={tdSm}>{r.row_count}</td>
                  <td style={tdSm}>{r.matched_count}</td>
                  <td style={tdSm}>{r.created_count}</td>
                  <td style={{ ...tdSm, color: r.error_count > 0 ? '#991b1b' : undefined }}>{r.error_count}</td>
                  <td style={tdSm}>{isAdmin && <button onClick={() => deleteOne(r.kind, r.id)} style={{ fontSize: 12, color: '#991b1b', background: 'transparent', border: 'none', cursor: 'pointer' }}>Delete audit</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p style={{ fontSize: 12, color: '#666', marginTop: 6 }}>Note: deleting an import removes only the audit record; imported rows are retained. Full rollback is a Phase-2 feature.</p>
    </section>
  )
}

// ------------------- Unmatched panel -------------------

function UnmatchedPanel() {
  const [rows, setRows] = useState<any | null>(null)
  const [rematching, setRematching] = useState(false)
  const [lastResult, setLastResult] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/school/import/rematch')
    if (res.ok) setRows(await res.json())
  }, [])
  useEffect(() => { load() }, [load])

  async function rematch() {
    setRematching(true)
    setLastResult(null)
    const res = await fetch('/api/school/import/rematch', { method: 'POST' })
    const j = await res.json()
    setLastResult(`Re-matched: ${j.sqa} SQA results, ${j.destinations} destinations, ${j.transitions} transition profiles.`)
    await load(); setRematching(false)
  }

  if (!rows) return null
  const total = (rows.sqa?.length ?? 0) + (rows.destinations?.length ?? 0) + (rows.transitions?.length ?? 0)
  if (total === 0) return null

  return (
    <section style={{ marginTop: 36, padding: 14, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6 }}>
      <h2 style={{ fontSize: 16, margin: '0 0 4px', color: '#92400e' }}>Unmatched records ({total})</h2>
      <p style={{ fontSize: 13, color: '#78350f', margin: '0 0 10px' }}>These records have an SCN but did not match an existing student. Re-match attempts to link them now.</p>
      <button onClick={rematch} disabled={rematching} style={primaryBtn}>{rematching ? 'Re-matching…' : 'Re-match by SCN'}</button>
      {lastResult && <p style={{ fontSize: 13, color: '#065f46', marginTop: 8 }}>{lastResult}</p>}

      {rows.sqa?.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Unmatched SQA results ({rows.sqa.length})</div>
          <ul style={{ margin: '4px 0', paddingLeft: 20, fontSize: 13 }}>
            {rows.sqa.slice(0, 10).map((r: any) => <li key={r.id}>{r.student_name ?? '-'} (SCN {r.scn}) &mdash; {r.subject_name} {r.grade} ({r.academic_year})</li>)}
          </ul>
        </div>
      )}
      {rows.destinations?.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Unmatched destinations ({rows.destinations.length})</div>
          <ul style={{ margin: '4px 0', paddingLeft: 20, fontSize: 13 }}>
            {rows.destinations.slice(0, 10).map((r: any) => <li key={r.id}>{r.student_name ?? '-'} (SCN {r.scn}) &mdash; {labelDestType(r.destination_type)} ({r.leaving_year})</li>)}
          </ul>
        </div>
      )}
      {rows.transitions?.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Unmatched transition profiles ({rows.transitions.length})</div>
          <ul style={{ margin: '4px 0', paddingLeft: 20, fontSize: 13 }}>
            {rows.transitions.slice(0, 10).map((r: any) => <li key={r.id}>{r.student_name} (SCN {r.scn}) &mdash; from {r.source_primary} ({r.transition_year})</li>)}
          </ul>
        </div>
      )}
    </section>
  )
}

// ------------------- Utilities -------------------

function defaultAcademicYear(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = d.getMonth()
  const start = m >= 7 ? y : y - 1
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`
}

function Stat({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div style={{ padding: 10, border: '1px solid #e5e5e5', borderRadius: 6, minWidth: 120 }}>
      <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
      {note && <div style={{ fontSize: 12, color: '#666' }}>{note}</div>}
    </div>
  )
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#555', marginBottom: 2 }}>{label}</div>
      {children}
    </div>
  )
}

const thSm: React.CSSProperties = { padding: '6px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600 }
const tdSm: React.CSSProperties = { padding: '5px 8px', fontSize: 13 }
const inputSm: React.CSSProperties = { padding: 6, border: '1px solid #ccc', borderRadius: 4, fontSize: 13 }
const primaryBtn: React.CSSProperties = { padding: '8px 16px', background: '#0059b3', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: 'pointer' }
const secondaryBtn: React.CSSProperties = { padding: '8px 16px', background: '#fff', color: '#0059b3', border: '1px solid #0059b3', borderRadius: 4, fontSize: 14, cursor: 'pointer' }
const miniPrimary: React.CSSProperties = { padding: '4px 12px', background: '#0059b3', color: '#fff', border: 'none', borderRadius: 4, fontSize: 13, cursor: 'pointer' }
const miniGhost: React.CSSProperties = { padding: '4px 12px', background: '#fff', color: '#0059b3', border: '1px solid #0059b3', borderRadius: 4, fontSize: 13, cursor: 'pointer' }
