'use client'

import { useCallback, useEffect, useState } from 'react'
import { diffWords, type DiffSegment } from '@/lib/personal-statement/diff'

type VersionSummary = {
  id: string
  draftId: string
  versionNumber: number
  q1Len: number
  q2Len: number
  q3Len: number
  totalLen: number
  savedAt: string
  saveTrigger: 'auto' | 'manual' | 'pre_feedback' | 'restore'
}

type VersionFull = {
  id: string
  draftId: string
  versionNumber: number
  q1: string
  q2: string
  q3: string
  savedAt: string
  saveTrigger: 'auto' | 'manual' | 'pre_feedback' | 'restore'
}

const TRIGGER_LABEL: Record<VersionSummary['saveTrigger'], string> = {
  auto: 'Auto-saved',
  manual: 'Saved by you',
  pre_feedback: 'Saved before feedback',
  restore: 'Restored from earlier version',
}

export function VersionHistoryPanel({
  draftId,
  currentDraft,
  onRestore,
}: {
  draftId: string | null
  currentDraft: { q1: string; q2: string; q3: string }
  onRestore: (version: VersionFull) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [versions, setVersions] = useState<VersionSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [previewVersion, setPreviewVersion] = useState<VersionFull | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [restoreBusy, setRestoreBusy] = useState(false)

  const loadVersions = useCallback(async () => {
    if (!draftId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/personal-statement/versions?draftId=${draftId}`, {
        cache: 'no-store',
      })
      if (!res.ok) {
        setVersions([])
        return
      }
      const json = (await res.json()) as { versions: VersionSummary[] }
      setVersions(json.versions ?? [])
    } finally {
      setLoading(false)
    }
  }, [draftId])

  useEffect(() => {
    if (open) void loadVersions()
  }, [open, loadVersions])

  const openPreview = useCallback(async (versionId: string) => {
    setPreviewLoading(true)
    try {
      const res = await fetch(`/api/personal-statement/versions/${versionId}`, {
        cache: 'no-store',
      })
      if (!res.ok) {
        setPreviewVersion(null)
        return
      }
      const json = (await res.json()) as { version: VersionFull }
      setPreviewVersion(json.version)
    } finally {
      setPreviewLoading(false)
    }
  }, [])

  const closePreview = useCallback(() => {
    setPreviewVersion(null)
  }, [])

  const restore = useCallback(async () => {
    if (!previewVersion) return
    const confirmed = window.confirm(
      `Restoring Version ${previewVersion.versionNumber} will replace your current draft. Your current text will be saved as a new version first.`
    )
    if (!confirmed) return
    setRestoreBusy(true)
    try {
      await onRestore(previewVersion)
      setPreviewVersion(null)
      await loadVersions()
    } finally {
      setRestoreBusy(false)
    }
  }, [previewVersion, onRestore, loadVersions])

  if (!draftId) return null

  return (
    <section
      style={{
        marginTop: '20px',
        padding: '16px 18px',
        borderRadius: '8px',
        backgroundColor: 'var(--pf-white)',
        border: '1px solid var(--pf-grey-200)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          fontFamily: 'inherit',
        }}
      >
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '1rem',
            color: 'var(--pf-grey-900)',
          }}
        >
          Version history{versions.length > 0 ? ` (${versions.length})` : ''}
        </span>
        <span aria-hidden="true" style={{ color: 'var(--pf-grey-600)' }}>
          {open ? '−' : '+'}
        </span>
      </button>

      {open && (
        <div style={{ marginTop: '12px' }}>
          {loading ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>Loading versions…</p>
          ) : versions.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
              No versions yet. Versions are saved when you click <em>Save now</em>, every 10
              minutes of editing, and before feedback is added.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {versions.map((v) => {
                const date = new Date(v.savedAt).toLocaleString('en-GB')
                return (
                  <li
                    key={v.id}
                    style={{
                      padding: '10px 12px',
                      border: '1px solid var(--pf-grey-200)',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      backgroundColor: 'var(--pf-grey-50, #f9fafb)',
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: 'var(--pf-grey-900)',
                          marginBottom: '2px',
                        }}
                      >
                        Version {v.versionNumber} · {TRIGGER_LABEL[v.saveTrigger]}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}>
                        {date} · Q1: {v.q1Len} · Q2: {v.q2Len} · Q3: {v.q3Len} · Total:{' '}
                        {v.totalLen.toLocaleString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openPreview(v.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--pf-blue-700)',
                        backgroundColor: 'transparent',
                        color: 'var(--pf-blue-700)',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      Preview
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      {previewVersion && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Version preview"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={closePreview}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--pf-white)',
              borderRadius: '10px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1.125rem', margin: 0 }}>
                Version {previewVersion.versionNumber} preview
              </h3>
              <button
                type="button"
                onClick={closePreview}
                aria-label="Close preview"
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--pf-grey-600)',
                }}
              >
                ×
              </button>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginBottom: '16px' }}>
              Saved {new Date(previewVersion.savedAt).toLocaleString('en-GB')} ·{' '}
              {TRIGGER_LABEL[previewVersion.saveTrigger]}. Green = added since this version, red =
              removed since this version.
            </p>
            {previewLoading ? (
              <p>Loading…</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <DiffBlock label="Question 1" oldText={previewVersion.q1} newText={currentDraft.q1} />
                <DiffBlock label="Question 2" oldText={previewVersion.q2} newText={currentDraft.q2} />
                <DiffBlock label="Question 3" oldText={previewVersion.q3} newText={currentDraft.q3} />
              </div>
            )}
            <div style={{ marginTop: '20px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={closePreview}
                className="pf-btn-secondary"
              >
                Close
              </button>
              <button
                type="button"
                onClick={restore}
                disabled={restoreBusy}
                className="pf-btn-primary"
              >
                {restoreBusy ? 'Restoring…' : `Restore Version ${previewVersion.versionNumber}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function DiffBlock({ label, oldText, newText }: { label: string; oldText: string; newText: string }) {
  const segments = diffWords(oldText, newText)
  return (
    <div>
      <h4
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '0.875rem',
          color: 'var(--pf-grey-900)',
          marginBottom: '6px',
        }}
      >
        {label}
      </h4>
      <div
        style={{
          padding: '12px 14px',
          backgroundColor: 'var(--pf-grey-50, #f9fafb)',
          border: '1px solid var(--pf-grey-200)',
          borderRadius: '6px',
          fontSize: '0.9375rem',
          lineHeight: 1.55,
          whiteSpace: 'pre-wrap',
        }}
      >
        {segments.length === 0 ? (
          <span style={{ color: 'var(--pf-grey-500)' }}>(empty)</span>
        ) : (
          segments.map((seg, idx) => <DiffSpan key={idx} segment={seg} />)
        )}
      </div>
    </div>
  )
}

function DiffSpan({ segment }: { segment: DiffSegment }) {
  if (segment.type === 'unchanged') return <span>{segment.text}</span>
  if (segment.type === 'added') {
    return (
      <span
        style={{
          backgroundColor: 'rgba(34,197,94,0.18)',
          color: 'var(--pf-grey-900)',
          textDecoration: 'underline',
          textDecorationColor: 'rgba(34,197,94,0.6)',
        }}
      >
        {segment.text}
      </span>
    )
  }
  return (
    <span
      style={{
        backgroundColor: 'rgba(239,68,68,0.18)',
        color: 'var(--pf-grey-700)',
        textDecoration: 'line-through',
        textDecorationColor: 'rgba(239,68,68,0.6)',
      }}
    >
      {segment.text}
    </span>
  )
}
