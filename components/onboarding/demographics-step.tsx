'use client'

export interface DemographicData {
  householdIncomeBand: string
  isSingleParentHousehold: boolean
  parentalEducation: string
  hasDisability: boolean
  disabilityDetails: string
  isEstranged: boolean
  isRefugeeOrAsylumSeeker: boolean
  isYoungParent: boolean
  isYoungCarer: boolean
  receivesFreeSchoolMeals: boolean
  receivesEma: boolean
}

interface DemographicsStepProps {
  data: DemographicData
  onChange: (data: DemographicData) => void
  onNext: (skipped: boolean) => void
  onBack: () => void
}

export function DemographicsStep({
  data,
  onChange,
  onNext,
  onBack,
}: DemographicsStepProps) {

  // "None of these" deselects all status checkboxes
  const statusCheckboxes = [
    data.receivesFreeSchoolMeals,
    data.receivesEma,
    data.isSingleParentHousehold,
    data.isEstranged,
    data.isYoungParent,
    data.isRefugeeOrAsylumSeeker,
    data.hasDisability,
    data.isYoungCarer,
  ]
  const anyStatusSelected = statusCheckboxes.some(Boolean)

  const handleNoneApply = () => {
    onChange({
      ...data,
      receivesFreeSchoolMeals: false,
      receivesEma: false,
      isSingleParentHousehold: false,
      isEstranged: false,
      isYoungParent: false,
      isRefugeeOrAsylumSeeker: false,
      hasDisability: false,
      disabilityDetails: '',
      isYoungCarer: false,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h2 style={{ marginBottom: '6px' }}>Help us find your funding</h2>
        <p style={{ color: 'var(--pf-grey-600)' }}>
          These questions help us match you to bursaries and grants you might be eligible for. All
          answers are optional and confidential.
        </p>
      </div>

      {/* Privacy note */}
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
              Your privacy matters
            </p>
            <p style={{ color: 'var(--pf-blue-900)' }}>
              This information is stored securely and never shared. You can delete it at any time
              from your account settings.
            </p>
          </div>
        </div>
      </div>

      {/* a) Household income */}
      <div
        className="rounded-lg"
        style={{
          padding: '20px',
          backgroundColor: 'var(--pf-white)',
          border: '1px solid var(--pf-grey-300)',
        }}
      >
        <label htmlFor="income-band" className="pf-label" style={{ marginBottom: '4px' }}>
          What is your household income?
        </label>
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--pf-grey-600)',
            marginBottom: '12px',
            lineHeight: 1.5,
          }}
        >
          This is your parent or guardian&apos;s total household income before tax. If you&apos;re
          not sure, ask them or select &quot;Prefer not to say&quot; — we can still find some
          benefits for you.
        </p>
        <select
          id="income-band"
          className="pf-input w-full"
          value={data.householdIncomeBand}
          onChange={(e) => onChange({ ...data, householdIncomeBand: e.target.value })}
        >
          <option value="">Select...</option>
          <option value="under_21000">Under £21,000</option>
          <option value="21000_24000">£21,000 – £24,000</option>
          <option value="24000_34000">£24,000 – £34,000</option>
          <option value="34000_45000">£34,000 – £45,000</option>
          <option value="over_45000">Over £45,000</option>
          <option value="prefer_not_say">Prefer not to say</option>
        </select>
      </div>

      {/* b) Status checkboxes */}
      <div
        className="rounded-lg"
        style={{
          padding: '20px',
          backgroundColor: 'var(--pf-white)',
          border: '1px solid var(--pf-grey-300)',
        }}
      >
        <p
          className="pf-label"
          style={{ marginBottom: '12px' }}
        >
          Do any of these apply to you?
        </p>
        <div className="space-y-3">
          {[
            {
              id: 'fsm',
              label: 'I receive free school meals',
              checked: data.receivesFreeSchoolMeals,
              onChange: (v: boolean) => onChange({ ...data, receivesFreeSchoolMeals: v }),
            },
            {
              id: 'ema',
              label: 'I receive EMA (Education Maintenance Allowance)',
              checked: data.receivesEma,
              onChange: (v: boolean) => onChange({ ...data, receivesEma: v }),
            },
            {
              id: 'singleParent',
              label: 'I am from a single parent household',
              checked: data.isSingleParentHousehold,
              onChange: (v: boolean) => onChange({ ...data, isSingleParentHousehold: v }),
            },
            {
              id: 'estranged',
              label: 'I am estranged from my parents (permanently not in contact)',
              checked: data.isEstranged,
              onChange: (v: boolean) => onChange({ ...data, isEstranged: v }),
            },
            {
              id: 'youngParent',
              label: 'I am a young parent',
              checked: data.isYoungParent,
              onChange: (v: boolean) => onChange({ ...data, isYoungParent: v }),
            },
            {
              id: 'refugee',
              label: 'I am a refugee or asylum seeker',
              checked: data.isRefugeeOrAsylumSeeker,
              onChange: (v: boolean) => onChange({ ...data, isRefugeeOrAsylumSeeker: v }),
            },
            {
              id: 'disability',
              label: 'I have a disability, long-term health condition, or learning difficulty',
              checked: data.hasDisability,
              onChange: (v: boolean) => {
                const next = { ...data, hasDisability: v }
                if (!v) next.disabilityDetails = ''
                onChange(next)
              },
            },
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-start gap-3 cursor-pointer transition-all"
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: item.checked ? 'var(--pf-blue-50)' : 'transparent',
                border: item.checked
                  ? '1.5px solid var(--pf-blue-500)'
                  : '1.5px solid transparent',
              }}
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => item.onChange(e.target.checked)}
                className="mt-0.5 h-5 w-5 rounded flex-shrink-0"
                style={{ accentColor: 'var(--pf-blue-700)' }}
              />
              <span
                style={{
                  fontSize: '0.9375rem',
                  color: item.checked ? 'var(--pf-blue-900)' : 'var(--pf-grey-900)',
                }}
              >
                {item.label}
              </span>
            </label>
          ))}

          {/* Toggle 1: is_young_carer — added per onboarding spec */}
          <label
            className="flex items-start gap-3 cursor-pointer transition-all"
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: data.isYoungCarer ? 'var(--pf-blue-50)' : 'transparent',
              border: data.isYoungCarer
                ? '1.5px solid var(--pf-blue-500)'
                : '1.5px solid transparent',
            }}
          >
            <input
              type="checkbox"
              checked={data.isYoungCarer}
              onChange={(e) => onChange({ ...data, isYoungCarer: e.target.checked })}
              className="mt-0.5 h-5 w-5 rounded flex-shrink-0"
              style={{ accentColor: 'var(--pf-blue-700)' }}
            />
            <div>
              <span
                style={{
                  fontSize: '0.9375rem',
                  color: data.isYoungCarer ? 'var(--pf-blue-900)' : 'var(--pf-grey-900)',
                  display: 'block',
                }}
              >
                I have caring responsibilities
              </span>
              <span
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--pf-grey-600)',
                  display: 'block',
                  marginTop: '2px',
                  lineHeight: 1.5,
                }}
              >
                For example, you care for a family member with a disability, illness or mental
                health condition.
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--pf-blue-700)',
                  display: 'block',
                  marginTop: '4px',
                  lineHeight: 1.5,
                }}
              >
                We use this to show you relevant grants and support you may not know about &mdash;
                such as the Young Carer Grant.
              </span>
            </div>
          </label>

          {/* None of these */}
          <label
            className="flex items-start gap-3 cursor-pointer transition-all"
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: !anyStatusSelected ? 'var(--pf-grey-100)' : 'transparent',
              border: !anyStatusSelected
                ? '1.5px solid var(--pf-grey-300)'
                : '1.5px solid transparent',
            }}
          >
            <input
              type="checkbox"
              checked={!anyStatusSelected}
              onChange={() => {
                if (anyStatusSelected) handleNoneApply()
              }}
              className="mt-0.5 h-5 w-5 rounded flex-shrink-0"
              style={{ accentColor: 'var(--pf-blue-700)' }}
            />
            <span
              style={{
                fontSize: '0.9375rem',
                color: 'var(--pf-grey-600)',
              }}
            >
              None of these apply to me
            </span>
          </label>
        </div>
      </div>

      {/* c) Disability details (conditional) */}
      {data.hasDisability && (
        <div
          className="rounded-lg animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            padding: '20px',
            backgroundColor: 'var(--pf-white)',
            border: '1px solid var(--pf-grey-300)',
          }}
        >
          <label htmlFor="disability-details" className="pf-label" style={{ marginBottom: '4px' }}>
            Please briefly describe (optional)
          </label>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--pf-grey-600)',
              marginBottom: '12px',
            }}
          >
            This helps match you to disability-specific funding like DSA or the Snowdon Trust.
          </p>
          <input
            id="disability-details"
            type="text"
            className="pf-input w-full"
            placeholder="e.g. dyslexia, hearing impairment, chronic illness"
            value={data.disabilityDetails}
            onChange={(e) => onChange({ ...data, disabilityDetails: e.target.value })}
          />
        </div>
      )}

      {/* d) Parental education */}
      <div
        className="rounded-lg"
        style={{
          padding: '20px',
          backgroundColor: 'var(--pf-white)',
          border: '1px solid var(--pf-grey-300)',
        }}
      >
        <label htmlFor="parental-education" className="pf-label" style={{ marginBottom: '4px' }}>
          What is your parent or guardian&apos;s highest qualification?
        </label>
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--pf-grey-600)',
            marginBottom: '12px',
          }}
        >
          This helps identify if you&apos;re first in your family to attend university.
        </p>
        <select
          id="parental-education"
          className="pf-input w-full"
          value={data.parentalEducation}
          onChange={(e) => onChange({ ...data, parentalEducation: e.target.value })}
        >
          <option value="">Select...</option>
          <option value="no_qualifications">No formal qualifications</option>
          <option value="school_qualifications">
            School qualifications (Standard Grades, O Levels, National 5s)
          </option>
          <option value="college_qualifications">College qualifications (HNC, HND, SVQ)</option>
          <option value="degree">University degree</option>
          <option value="postgraduate">Postgraduate degree</option>
          <option value="unknown">I don&apos;t know</option>
        </select>
      </div>

      {/* Actions */}
      <div className="pt-2 space-y-3">
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => onNext(true)}
            className="pf-btn pf-btn-secondary justify-center"
            style={{ flex: 1, minHeight: '48px' }}
          >
            Skip for now
          </button>
          <button
            type="submit"
            className="pf-btn pf-btn-primary justify-center"
            style={{ flex: 1, minHeight: '48px' }}
          >
            Continue
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
