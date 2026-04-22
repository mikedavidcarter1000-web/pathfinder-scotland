'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/toast'
import { SubmitButton } from '@/components/ui/submit-button'

type LinkedState = {
  linked: boolean
  schoolId?: string
  schoolName?: string
  schoolSlug?: string
  linkedAt?: string | null
}

export function LinkToSchool() {
  const toast = useToast()
  const [state, setState] = useState<LinkedState | null>(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)

  async function refresh() {
    setLoading(true)
    try {
      const res = await fetch('/api/school/link-student')
      const json = await res.json()
      setState(json)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleLink(e: React.FormEvent) {
    e.preventDefault()
    if (!consentChecked) {
      toast.error('Please read and confirm the consent message.', '')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/school/link-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error('Could not link', json.error || 'Check the code and try again.')
        return
      }
      toast.success('Linked', `You are now linked to ${json.schoolName}.`)
      setCode('')
      await refresh()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUnlink() {
    if (!confirm('Unlink from your school? Your data stays in your account but is no longer visible to the school.')) return
    const res = await fetch('/api/school/link-student', { method: 'DELETE' })
    if (res.ok) {
      toast.success('Unlinked', 'Your school can no longer see your data.')
      await refresh()
    }
  }

  if (loading) return null

  return (
    <section style={wrapper}>
      <h3 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
        Link to your school
      </h3>

      {state?.linked ? (
        <>
          <p style={{ fontSize: '0.9375rem', margin: '8px 0' }}>
            You are linked to <strong>{state.schoolName}</strong>. Your school&apos;s guidance team can see
            your saved courses, explored careers, subject choices and predicted grades.
          </p>
          <button onClick={handleUnlink} style={secondaryBtn}>
            Unlink from school
          </button>
        </>
      ) : (
        <form onSubmit={handleLink} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '0.9375rem', margin: 0 }}>
            If your school uses Pathfinder, enter the code your guidance teacher shared.
          </p>

          <div
            style={{
              padding: '12px',
              backgroundColor: '#FEF3C7',
              border: '1px solid #F59E0B',
              borderRadius: '6px',
              fontSize: '0.875rem',
            }}
          >
            <label style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
              />
              <span>
                Your school&apos;s guidance team will be able to see your saved courses, explored careers,
                subject choices and predicted grades. They cannot see your personal notes, quiz results,
                or sensitive personal information unless you choose to share them. I understand and agree.
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. ROYAL26"
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid var(--pf-grey-300)',
                borderRadius: '6px',
                fontSize: '1rem',
                letterSpacing: '0.05em',
              }}
              aria-label="School code"
              required
            />
            <SubmitButton isLoading={submitting}>Link</SubmitButton>
          </div>
        </form>
      )}
    </section>
  )
}

const wrapper: React.CSSProperties = {
  padding: '16px',
  border: '1px solid var(--pf-grey-200)',
  borderRadius: '8px',
  backgroundColor: '#fff',
  marginTop: '16px',
}

const secondaryBtn: React.CSSProperties = {
  padding: '8px 14px',
  border: '1px solid var(--pf-grey-300)',
  borderRadius: '6px',
  background: '#fff',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.875rem',
}
