'use client'

import { ONBOARDING_STAGE_CARDS, SCHOOL_STAGES } from '@/lib/constants'

interface BasicInfoData {
  firstName: string
  lastName: string
  schoolStage: string
  schoolName: string
}

interface BasicInfoStepProps {
  data: BasicInfoData
  onChange: (data: BasicInfoData) => void
  onNext: () => void
}

export function BasicInfoStep({ data, onChange, onNext }: BasicInfoStepProps) {
  const isValid = !!(data.firstName.trim() && data.lastName.trim() && data.schoolStage)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 style={{ marginBottom: '6px' }}>Tell us about yourself</h2>
        <p style={{ color: 'var(--pf-grey-600)' }}>
          This helps us personalise your experience.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="pf-label">
            First name
          </label>
          <input
            id="firstName"
            type="text"
            value={data.firstName}
            onChange={(e) => onChange({ ...data, firstName: e.target.value })}
            required
            className="pf-input"
            placeholder="Your first name"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="pf-label">
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            value={data.lastName}
            onChange={(e) => onChange({ ...data, lastName: e.target.value })}
            required
            className="pf-input"
            placeholder="Your last name"
          />
        </div>
      </div>

      <div>
        <span className="pf-label" style={{ marginBottom: '12px' }}>
          What year are you currently in?
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {ONBOARDING_STAGE_CARDS.map((key) => {
            const stage = SCHOOL_STAGES[key]
            const active = data.schoolStage === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange({ ...data, schoolStage: key })}
                className="text-left transition-all"
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: active ? 'var(--pf-blue-50)' : 'var(--pf-white)',
                  border: active
                    ? '2px solid var(--pf-blue-700)'
                    : '2px solid var(--pf-grey-300)',
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                }}
                aria-pressed={active}
              >
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    color: active ? 'var(--pf-blue-700)' : 'var(--pf-grey-900)',
                    lineHeight: 1.1,
                  }}
                >
                  {stage.label}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--pf-grey-600)',
                    marginTop: '4px',
                    fontWeight: 500,
                  }}
                >
                  {stage.description}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: active ? 'var(--pf-blue-700)' : 'var(--pf-grey-600)',
                    marginTop: '8px',
                    lineHeight: 1.4,
                  }}
                >
                  {stage.offer}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label htmlFor="schoolName" className="pf-label">
          School or college name{' '}
          <span style={{ fontWeight: 400, color: 'var(--pf-grey-600)' }}>(optional)</span>
        </label>
        <input
          id="schoolName"
          type="text"
          value={data.schoolName}
          onChange={(e) => onChange({ ...data, schoolName: e.target.value })}
          className="pf-input"
          placeholder="e.g. Glasgow Academy"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={!isValid}
          className="w-full pf-btn pf-btn-primary justify-center"
          style={{ minHeight: '48px' }}
        >
          Continue
        </button>
      </div>
    </form>
  )
}
