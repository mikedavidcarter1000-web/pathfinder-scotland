'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

const GENDER_OPTIONS = [
  { value: '', label: 'Prefer not to say' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-binary' },
]

export default function AccountProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [gender, setGender] = useState<string>('')
  const [customGender, setCustomGender] = useState('')
  const [isHomeEducated, setIsHomeEducated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace('/auth/sign-in?redirect=/account/profile')
      return
    }
    fetch('/api/account/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return
        const g: string = d.gender ?? ''
        if (GENDER_OPTIONS.some((o) => o.value === g)) {
          setGender(g)
        } else if (g) {
          setGender('other')
          setCustomGender(g)
        }
        setIsHomeEducated(!!d.isHomeEducated)
      })
      .finally(() => setLoading(false))
  }, [isLoading, user, router])

  async function save() {
    setSaving(true)
    setMsg(null)
    const genderValue = gender === 'other' ? (customGender.trim() || null) : (gender || null)
    const res = await fetch('/api/account/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gender: genderValue, isHomeEducated }),
    })
    setSaving(false)
    if (res.ok) {
      setMsg({ text: 'Saved successfully.', ok: true })
    } else {
      const j = await res.json().catch(() => ({}))
      setMsg({ text: j.error || 'Save failed.', ok: false })
    }
  }

  if (isLoading || loading) return <div className="pf-container pt-8"><p>Loading&hellip;</p></div>
  if (!user) return null

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 12 }}>
        <Link href="/account/saved-comparisons" style={{ fontSize: 13 }}>&larr; My account</Link>
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 0 }}>Profile</h1>
      <p style={{ color: '#555', fontSize: 14, margin: '4px 0 20px' }}>
        Optional information that helps Pathfinder show you relevant widening-access support and bursaries.
        Your answers are confidential and never shared with employers or universities.
      </p>

      <div style={card}>
        <h2 style={sectionHeader}>Gender</h2>
        <p style={hint}>Select the option that best describes you, or leave blank if you prefer not to say.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {GENDER_OPTIONS.map((opt) => (
            <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
              <input
                type="radio"
                name="gender"
                value={opt.value}
                checked={gender === opt.value}
                onChange={() => { setGender(opt.value); setCustomGender('') }}
              />
              {opt.label}
            </label>
          ))}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
            <input
              type="radio"
              name="gender"
              value="other"
              checked={gender === 'other'}
              onChange={() => setGender('other')}
            />
            Prefer to self-describe:
            {gender === 'other' && (
              <input
                type="text"
                value={customGender}
                onChange={(e) => setCustomGender(e.target.value)}
                placeholder="Enter your gender identity"
                style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, width: 200 }}
                autoFocus
              />
            )}
          </label>
        </div>
      </div>

      <div style={card}>
        <h2 style={sectionHeader}>Education setting</h2>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 14 }}>
          <input
            type="checkbox"
            checked={isHomeEducated}
            onChange={(e) => setIsHomeEducated(e.target.checked)}
            style={{ marginTop: 2, width: 16, height: 16 }}
          />
          <div>
            <div>I am home educated</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
              Some bursaries and widening-access programmes have specific routes for home-educated students.
            </div>
          </div>
        </label>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={save}
          disabled={saving}
          style={{
            padding: '8px 20px',
            fontSize: 14,
            background: saving ? '#9ca3af' : '#0059b3',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {msg && (
          <span style={{ fontSize: 14, color: msg.ok ? '#16a34a' : '#dc2626' }}>{msg.text}</span>
        )}
      </div>
    </div>
  )
}

const card: React.CSSProperties = {
  border: '1px solid #e5e5e5',
  borderRadius: 6,
  padding: 16,
  marginBottom: 16,
  background: '#fff',
}
const sectionHeader: React.CSSProperties = { fontSize: 16, fontWeight: 600, margin: '0 0 6px 0' }
const hint: React.CSSProperties = { fontSize: 13, color: '#666', margin: '0 0 10px 0' }
