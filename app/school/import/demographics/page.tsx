'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Preview = {
  headers: string[]
  preview: Record<string, string>[]
  rowCount: number
  autoMap: Record<string, string | null>
}

type ImportResult = {
  rowCount: number
  matched: number
  updated: number
  skipped: number
  errorCount: number
  errors: { row: number; message: string; field?: string }[]
  warnings: { row: number; message: string }[]
  importId?: string | null
}

const FIELDS: Array<{ key: string; label: string; required?: boolean }> = [
  { key: 'scn', label: 'SCN (Scottish Candidate Number)', required: true },
  { key: 'forename', label: 'Forename (fallback match)' },
  { key: 'surname', label: 'Surname (fallback match)' },
  { key: 'gender', label: 'Gender / Sex' },
  { key: 'fsm', label: 'FSM (Free School Meals)' },
  { key: 'asn', label: 'ASN (Additional Support Needs)' },
  { key: 'care_experienced', label: 'Care Experienced / LAC' },
  { key: 'eal', label: 'EAL (English as Additional Language)' },
  { key: 'young_carer', label: 'Young Carer' },
  { key: 'ethnicity', label: 'Ethnicity / Ethnic Group' },
]

export default function DemographicsImportPage() {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [map, setMap] = useState<Record<string, string | null>>({})
  const [parseError, setParseError] = useState<string | null>(null)
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  useEffect(() => {
    fetch('/api/school/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d?.staff?.canManageTracking && !d?.staff?.isAdmin) {
          router.replace('/school/dashboard')
        }
        setCheckingAuth(false)
      })
  }, [router])

  const parse = useCallback(async (f: File) => {
    setParsing(true)
    setParseError(null)
    setPreview(null)
    try {
      const fd = new FormData()
      fd.append('file', f)
      fd.append('kind', 'demographics')
      const res = await fetch('/api/school/import/parse', { method: 'POST', body: fd })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Parse failed')
      setPreview(j)
      setMap({ ...j.autoMap })
    } catch (e: unknown) {
      setParseError(e instanceof Error ? e.message : String(e))
    } finally {
      setParsing(false)
    }
  }, [])

  function onFile(f: File | null) {
    setFile(f)
    setPreview(null)
    setMap({})
    setResult(null)
    if (f) parse(f)
  }

  async function doImport() {
    if (!file) return
    setImporting(true)
    setResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('map', JSON.stringify(map))
      const res = await fetch('/api/school/import/demographics', { method: 'POST', body: fd })
      const j = await res.json()
      setResult(j)
    } finally {
      setImporting(false)
    }
  }

  if (checkingAuth) return <div className="pf-container pt-8"><p>Loading&hellip;</p></div>

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 12 }}>
        <Link href="/school/import" style={{ fontSize: 13 }}>&larr; Data import</Link>
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 0 }}>SEEMIS demographics import</h1>
      <p style={{ color: '#555', fontSize: 14, margin: '4px 0 16px' }}>
        Upload a supplemental SEEMIS extract to update demographic flags for existing students.
        Only students already on Pathfinder are updated — new rows are not created.
      </p>

      <div style={{ background: '#f3f4f6', padding: 12, borderRadius: 6, fontSize: 13, lineHeight: 1.55, color: '#374151', marginBottom: 16 }}>
        <p style={{ marginTop: 0 }}>Export a demographics report from SEEMIS Click+Go or your LA&rsquo;s MIS export tool. The file should include:</p>
        <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
          <li><strong>SCN</strong> (Scottish Candidate Number) for matching</li>
          <li>Any combination of: Gender/Sex &middot; FSM &middot; ASN &middot; Care Experienced/LAC &middot; EAL &middot; Young Carer &middot; Ethnicity</li>
        </ul>
        <p style={{ marginBottom: 0 }}>Boolean fields accept: Y/Yes/True/1/X (true) or N/No/False/0/- (false). Blank values are ignored.</p>
      </div>

      <label style={{ display: 'inline-block', cursor: 'pointer', marginBottom: 12 }}>
        <span style={{ padding: '8px 16px', background: '#0059b3', color: '#fff', borderRadius: 6, fontSize: 14, fontWeight: 500 }}>
          Choose file (.csv or .xlsx)
        </span>
        <input
          type="file"
          accept=".csv,.xlsx"
          style={{ display: 'none' }}
          onChange={(e) => onFile(e.currentTarget.files?.[0] ?? null)}
        />
      </label>
      {file && <span style={{ fontSize: 13, color: '#555', marginLeft: 10 }}>{file.name}</span>}

      {parsing && <p style={{ fontSize: 13, color: '#555' }}>Parsing&hellip;</p>}
      {parseError && <p style={{ color: '#991b1b', fontSize: 13 }}>{parseError}</p>}

      {preview && (
        <>
          {/* Preview table */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>First 10 of {preview.rowCount} rows:</div>
            <div style={{ overflow: 'auto', border: '1px solid #e5e5e5', borderRadius: 4 }}>
              <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {preview.headers.map((h) => (
                      <th key={h} style={{ padding: '6px 8px', textAlign: 'left', borderRight: '1px solid #eee' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.preview.map((row, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #f1f1f1' }}>
                      {preview.headers.map((h) => (
                        <td key={h} style={{ padding: '5px 8px', borderRight: '1px solid #f5f5f5' }}>{row[h]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Column mapping */}
          <div style={{ marginTop: 14, padding: 12, background: '#fff', border: '1px solid #e5e5e5', borderRadius: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Column mapping</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
              {FIELDS.map((f) => (
                <label key={f.key} style={{ fontSize: 13 }}>
                  <div style={{ fontWeight: 500, marginBottom: 2 }}>
                    {f.label}{f.required ? ' *' : ''}
                  </div>
                  <select
                    value={map[f.key] ?? ''}
                    onChange={(e) => setMap({ ...map, [f.key]: e.target.value || null })}
                    style={{ width: '100%', padding: 6, border: '1px solid #ccc', borderRadius: 4, fontSize: 13 }}
                  >
                    <option value="">— none —</option>
                    {preview.headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            <button
              onClick={doImport}
              disabled={importing || !map['scn']}
              style={{
                padding: '8px 18px',
                fontSize: 14,
                background: importing || !map['scn'] ? '#9ca3af' : '#0059b3',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: importing || !map['scn'] ? 'not-allowed' : 'pointer',
              }}
            >
              {importing ? 'Importing…' : `Import ${preview.rowCount} rows`}
            </button>
            <button
              onClick={() => { setFile(null); setPreview(null); setMap({}); setResult(null) }}
              style={{ padding: '8px 18px', fontSize: 14, background: '#fff', color: '#333', border: '1px solid #d0d0d0', borderRadius: 4, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
          {!map['scn'] && (
            <p style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>SCN must be mapped to run the import.</p>
          )}
        </>
      )}

      {result && (
        <div style={{ marginTop: 16, padding: 14, background: '#ecfdf5', border: '1px solid #86efac', borderRadius: 6 }}>
          <div style={{ fontWeight: 600, color: '#065f46', marginBottom: 6 }}>Import complete</div>
          <div style={{ fontSize: 14, color: '#065f46' }}>
            <span style={{ marginRight: 14 }}>Updated: <strong>{result.updated}</strong></span>
            <span style={{ marginRight: 14 }}>Matched: <strong>{result.matched}</strong></span>
            {result.skipped > 0 && <span style={{ marginRight: 14 }}>Skipped: <strong>{result.skipped}</strong></span>}
            {result.errorCount > 0 && <span style={{ color: '#991b1b' }}>Errors: <strong>{result.errorCount}</strong></span>}
          </div>
          {(result.errors.length + result.warnings.length > 0) && (
            <details style={{ marginTop: 8, fontSize: 13 }}>
              <summary style={{ cursor: 'pointer' }}>
                Show {result.errors.length} error{result.errors.length === 1 ? '' : 's'},{' '}
                {result.warnings.length} warning{result.warnings.length === 1 ? '' : 's'}
              </summary>
              <ul style={{ maxHeight: 240, overflow: 'auto', margin: '6px 0', paddingLeft: 18 }}>
                {result.errors.map((e, i) => (
                  <li key={`e${i}`} style={{ color: '#991b1b' }}>Row {e.row}: {e.message}</li>
                ))}
                {result.warnings.map((w, i) => (
                  <li key={`w${i}`} style={{ color: '#92400e' }}>Row {w.row}: {w.message}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
