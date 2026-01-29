'use client'

import { useState } from 'react'
import { useSIMDLookup } from '@/hooks/use-student'
import { SIMD_DESCRIPTIONS } from '@/lib/constants'
import type { Tables } from '@/types/database'

type SIMDPostcode = Tables<'simd_postcodes'>

interface PostcodeData {
  postcode: string
  simdDecile: number | null
}

interface PostcodeStepProps {
  data: PostcodeData
  onChange: (data: PostcodeData) => void
  onNext: () => void
  onBack: () => void
}

export function PostcodeStep({ data, onChange, onNext, onBack }: PostcodeStepProps) {
  const [lookupAttempted, setLookupAttempted] = useState(false)
  const simdLookup = useSIMDLookup()

  const handleLookup = async () => {
    if (!data.postcode.trim()) return

    setLookupAttempted(true)
    const result = await simdLookup.mutateAsync(data.postcode) as SIMDPostcode | null

    if (result) {
      onChange({ ...data, simdDecile: result.simd_decile })
    } else {
      onChange({ ...data, simdDecile: null })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  const getDecileColor = (decile: number) => {
    if (decile <= 2) return 'bg-green-100 text-green-700 border-green-200'
    if (decile <= 4) return 'bg-lime-100 text-lime-700 border-lime-200'
    return 'bg-gray-100 text-gray-700 border-gray-200'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Your location</h2>
        <p className="text-gray-600">
          We use your postcode to check if you qualify for widening access schemes.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">What is SIMD?</p>
            <p>
              The Scottish Index of Multiple Deprivation (SIMD) identifies areas of deprivation in Scotland.
              Students from SIMD20 areas may qualify for reduced entry requirements at many universities.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-1">
          Home postcode
        </label>
        <div className="flex gap-3">
          <input
            id="postcode"
            type="text"
            value={data.postcode}
            onChange={(e) => {
              onChange({ ...data, postcode: e.target.value.toUpperCase(), simdDecile: null })
              setLookupAttempted(false)
            }}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
            placeholder="e.g. G12 8QQ"
          />
          <button
            type="button"
            onClick={handleLookup}
            disabled={!data.postcode.trim() || simdLookup.isPending}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
          >
            {simdLookup.isPending ? (
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              'Look up'
            )}
          </button>
        </div>
      </div>

      {/* SIMD Result */}
      {lookupAttempted && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          {data.simdDecile !== null ? (
            <div className={`p-4 rounded-lg border ${getDecileColor(data.simdDecile)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SIMD Decile {data.simdDecile}</p>
                  <p className="text-sm opacity-90">
                    {SIMD_DESCRIPTIONS[data.simdDecile as keyof typeof SIMD_DESCRIPTIONS]}
                  </p>
                </div>
                {data.simdDecile <= 2 && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs font-medium">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    SIMD20
                  </span>
                )}
                {data.simdDecile > 2 && data.simdDecile <= 4 && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs font-medium">
                    <svg className="w-4 h-4 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    SIMD40
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-800">
              <div className="flex gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-medium">Postcode not found</p>
                  <p className="text-sm">
                    We couldn&apos;t find SIMD data for this postcode. You can continue without it, or try a different postcode.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-sm text-gray-500">
        This information is optional but helps us show you relevant widening access opportunities.
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
