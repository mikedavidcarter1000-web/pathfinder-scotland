'use client'

interface WideningAccessData {
  careExperienced: boolean
  isCarer: boolean
  firstGeneration: boolean
}

interface WideningAccessStepProps {
  data: WideningAccessData
  onChange: (data: WideningAccessData) => void
  onNext: () => void
  onBack: () => void
}

export function WideningAccessStep({ data, onChange, onNext, onBack }: WideningAccessStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  const criteria = [
    {
      id: 'careExperienced',
      label: 'Care experienced',
      description:
        'You have been in care at any point in your life (looked after child, foster care, residential care, kinship care).',
      checked: data.careExperienced,
      onChange: (checked: boolean) => onChange({ ...data, careExperienced: checked }),
    },
    {
      id: 'isCarer',
      label: 'Young carer',
      description:
        'You provide unpaid care for a family member or friend who has a disability, illness, mental health condition, or addiction.',
      checked: data.isCarer,
      onChange: (checked: boolean) => onChange({ ...data, isCarer: checked }),
    },
    {
      id: 'firstGeneration',
      label: 'First in family to attend university',
      description: 'Neither of your parents or guardians have attended university.',
      checked: data.firstGeneration,
      onChange: (checked: boolean) => onChange({ ...data, firstGeneration: checked }),
    },
  ]

  const selectedCount = [data.careExperienced, data.isCarer, data.firstGeneration].filter(Boolean).length
  const hasAnySelected = selectedCount > 0

  const clearSelections = () => {
    onChange({ careExperienced: false, isCarer: false, firstGeneration: false })
  }

  const skipStep = () => {
    clearSelections()
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 style={{ marginBottom: '6px' }}>Widening access</h2>
        <p style={{ color: 'var(--pf-grey-600)' }}>
          Select any criteria that apply to you. This helps universities provide additional support and
          may reduce entry requirements.
        </p>
      </div>

      {/* Why we ask */}
      <div
        className="rounded-lg"
        style={{
          padding: '16px',
          backgroundColor: 'var(--pf-blue-100)',
          color: 'var(--pf-blue-900)',
        }}
      >
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ color: 'var(--pf-blue-700)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <div style={{ fontSize: '0.875rem' }}>
            <p style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--pf-blue-900)' }}>
              Why we ask this
            </p>
            <p style={{ color: 'var(--pf-blue-900)' }}>
              Scottish universities offer reduced entry requirements and extra support for students
              from widening participation backgrounds. This information is kept confidential.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {criteria.map((criterion) => (
          <label
            key={criterion.id}
            className="flex items-start gap-4 cursor-pointer transition-all"
            style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: criterion.checked ? 'var(--pf-blue-50)' : 'var(--pf-white)',
              border: criterion.checked
                ? '2px solid var(--pf-blue-700)'
                : '2px solid var(--pf-grey-300)',
            }}
          >
            <input
              type="checkbox"
              checked={criterion.checked}
              onChange={(e) => criterion.onChange(e.target.checked)}
              className="mt-1 h-5 w-5 rounded"
              style={{ accentColor: 'var(--pf-blue-700)' }}
            />
            <div className="flex-1">
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  color: criterion.checked ? 'var(--pf-blue-900)' : 'var(--pf-grey-900)',
                }}
              >
                {criterion.label}
              </p>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--pf-grey-600)',
                  marginTop: '2px',
                }}
              >
                {criterion.description}
              </p>
            </div>
          </label>
        ))}
      </div>

      {hasAnySelected && (
        <div
          className="rounded-lg"
          style={{
            padding: '14px 16px',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
          }}
        >
          <div className="flex items-center gap-2" style={{ color: 'var(--pf-green-500)' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
              You may qualify for widening access support
            </span>
          </div>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--pf-grey-600)',
              marginTop: '4px',
              marginLeft: '28px',
            }}
          >
            We&apos;ll show you adjusted entry requirements where available.
          </p>
        </div>
      )}

      <div className="pt-2 space-y-3">
        {/* Two equal-weight buttons: skip / clear vs continue — primary on top on mobile */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          {hasAnySelected ? (
            <button
              type="button"
              onClick={clearSelections}
              className="pf-btn pf-btn-secondary justify-center"
              style={{ flex: 1, minHeight: '48px' }}
            >
              Clear selections
            </button>
          ) : (
            <button
              type="button"
              onClick={skipStep}
              className="pf-btn pf-btn-secondary justify-center"
              style={{ flex: 1, minHeight: '48px' }}
            >
              None of these apply to me
            </button>
          )}
          <button
            type="submit"
            className="pf-btn pf-btn-primary justify-center"
            style={{ flex: 1, minHeight: '48px' }}
          >
            Continue{hasAnySelected ? ` (${selectedCount})` : ''}
          </button>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="w-full pf-btn pf-btn-ghost justify-center"
          style={{ minHeight: '44px', padding: '8px 16px' }}
        >
          ← Back
        </button>
      </div>
    </form>
  )
}
