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
      description: 'You have been in care at any point in your life (looked after child, foster care, residential care, kinship care)',
      checked: data.careExperienced,
      onChange: (checked: boolean) => onChange({ ...data, careExperienced: checked }),
    },
    {
      id: 'isCarer',
      label: 'Young carer',
      description: 'You provide unpaid care for a family member or friend who has a disability, illness, mental health condition, or addiction',
      checked: data.isCarer,
      onChange: (checked: boolean) => onChange({ ...data, isCarer: checked }),
    },
    {
      id: 'firstGeneration',
      label: 'First in family to attend university',
      description: 'Neither of your parents or guardians have attended university',
      checked: data.firstGeneration,
      onChange: (checked: boolean) => onChange({ ...data, firstGeneration: checked }),
    },
  ]

  const selectedCount = [data.careExperienced, data.isCarer, data.firstGeneration].filter(Boolean).length

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Widening access</h2>
        <p className="text-gray-600">
          Select any criteria that apply to you. This helps universities provide additional support and may reduce entry requirements.
        </p>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="text-sm text-purple-800">
            <p className="font-medium mb-1">Why we ask this</p>
            <p>
              Scottish universities offer reduced entry requirements and extra support for students from
              widening participation backgrounds. This information is kept confidential.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {criteria.map((criterion) => (
          <label
            key={criterion.id}
            className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
              criterion.checked
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <input
              type="checkbox"
              checked={criterion.checked}
              onChange={(e) => criterion.onChange(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <p className={`font-medium ${criterion.checked ? 'text-blue-900' : 'text-gray-900'}`}>
                {criterion.label}
              </p>
              <p className={`text-sm ${criterion.checked ? 'text-blue-700' : 'text-gray-500'}`}>
                {criterion.description}
              </p>
            </div>
          </label>
        ))}
      </div>

      {selectedCount > 0 && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center gap-2 text-green-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">
              You may qualify for widening access support
            </span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            We&apos;ll show you adjusted entry requirements where available.
          </p>
        </div>
      )}

      <p className="text-sm text-gray-500">
        All criteria are optional. You can skip this step if none apply to you.
      </p>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </form>
  )
}
