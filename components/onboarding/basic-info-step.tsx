'use client'

import { SCHOOL_STAGES } from '@/lib/constants'

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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  const isValid = data.firstName.trim() && data.lastName.trim() && data.schoolStage

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Tell us about yourself</h2>
        <p className="text-gray-600">This helps us personalise your experience.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First name
          </label>
          <input
            id="firstName"
            type="text"
            value={data.firstName}
            onChange={(e) => onChange({ ...data, firstName: e.target.value })}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your first name"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            value={data.lastName}
            onChange={(e) => onChange({ ...data, lastName: e.target.value })}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your last name"
          />
        </div>
      </div>

      <div>
        <label htmlFor="schoolStage" className="block text-sm font-medium text-gray-700 mb-1">
          School stage
        </label>
        <select
          id="schoolStage"
          value={data.schoolStage}
          onChange={(e) => onChange({ ...data, schoolStage: e.target.value })}
          required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="">Select your current stage</option>
          {Object.entries(SCHOOL_STAGES).map(([key, value]) => (
            <option key={key} value={key}>
              {value.label} - {value.description}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-1">
          School or college name
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </label>
        <input
          id="schoolName"
          type="text"
          value={data.schoolName}
          onChange={(e) => onChange({ ...data, schoolName: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g. Glasgow Academy"
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={!isValid}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </form>
  )
}
