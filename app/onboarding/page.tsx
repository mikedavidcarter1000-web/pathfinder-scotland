'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useCurrentStudent, useCreateStudent, useBulkUpsertGrades } from '@/hooks/use-student'
import {
  StepIndicator,
  MobileStepIndicator,
  BasicInfoStep,
  PostcodeStep,
  WideningAccessStep,
  GradesStep,
} from '@/components/onboarding'
import type { QualificationType } from '@/lib/grades'

interface Grade {
  subject: string
  grade: string
  predicted: boolean
  qualificationType: QualificationType
}

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Name & school' },
  { id: 2, title: 'Location', description: 'Postcode' },
  { id: 3, title: 'Widening Access', description: 'Eligibility' },
  { id: 4, title: 'Grades', description: 'Your qualifications' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { data: student, isLoading: studentLoading } = useCurrentStudent()
  const createStudent = useCreateStudent()
  const bulkUpsertGrades = useBulkUpsertGrades()

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [basicInfo, setBasicInfo] = useState({
    firstName: '',
    lastName: '',
    schoolStage: '',
    schoolName: '',
  })

  const [postcodeData, setPostcodeData] = useState({
    postcode: '',
    simdDecile: null as number | null,
  })

  const [wideningAccess, setWideningAccess] = useState({
    careExperienced: false,
    isCarer: false,
    firstGeneration: false,
  })

  const [grades, setGrades] = useState<Grade[]>([])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/sign-in')
    }
  }, [authLoading, user, router])

  // Redirect if student profile already exists
  useEffect(() => {
    if (!studentLoading && student) {
      router.push('/dashboard')
    }
  }, [studentLoading, student, router])

  const handleComplete = async () => {
    console.log('handleComplete called', { user, basicInfo, postcodeData, wideningAccess, grades })

    if (!user) {
      console.log('No user found, returning early')
      setError('Not authenticated. Please sign in again.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      console.log('Creating student profile...')
      // Create student profile
      const studentResult = await createStudent.mutateAsync({
        email: user.email || '',
        first_name: basicInfo.firstName,
        last_name: basicInfo.lastName,
        school_stage: basicInfo.schoolStage as 's3' | 's4' | 's5' | 's6' | 'college' | 'mature' | null,
        school_name: basicInfo.schoolName || null,
        postcode: postcodeData.postcode || null,
        simd_decile: postcodeData.simdDecile,
        care_experienced: wideningAccess.careExperienced,
        is_carer: wideningAccess.isCarer,
        first_generation: wideningAccess.firstGeneration,
      })
      console.log('Student created:', studentResult)

      // Bulk upsert grades if any were added
      if (grades.length > 0) {
        console.log('Saving grades...')
        const gradesResult = await bulkUpsertGrades.mutateAsync(
          grades.map((g) => ({
            subject: g.subject,
            grade: g.grade,
            predicted: g.predicted,
            qualification_type: g.qualificationType,
          }))
        )
        console.log('Grades saved:', gradesResult)
      }

      // Redirect to dashboard
      console.log('Redirecting to dashboard...')
      router.push('/dashboard')
    } catch (err) {
      console.error('Failed to complete onboarding:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create profile. Please try again.'
      console.error('Error message:', errorMessage)
      alert('Error: ' + errorMessage) // Temporary alert for debugging
      setError(errorMessage)
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (authLoading || studentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return null
  }

  // Already has profile
  if (student) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Pathfinder</span>
            </Link>
            <span className="text-sm text-gray-500">Complete your profile</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Desktop Step Indicator */}
        <div className="hidden sm:block mb-8">
          <StepIndicator
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={(step) => step < currentStep && setCurrentStep(step)}
          />
        </div>

        {/* Mobile Step Indicator */}
        <div className="mb-6">
          <MobileStepIndicator
            currentStep={currentStep}
            totalSteps={STEPS.length}
            stepTitle={STEPS[currentStep - 1].title}
          />
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {currentStep === 1 && (
            <BasicInfoStep
              data={basicInfo}
              onChange={setBasicInfo}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <PostcodeStep
              data={postcodeData}
              onChange={setPostcodeData}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <WideningAccessStep
              data={wideningAccess}
              onChange={setWideningAccess}
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <>
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}
              <GradesStep
                grades={grades}
                onChange={setGrades}
                onComplete={handleComplete}
                onBack={() => setCurrentStep(3)}
                isSubmitting={isSubmitting}
              />
            </>
          )}
        </div>

        {/* Help Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <Link href="/help" className="text-blue-600 hover:text-blue-700">
              Contact support
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
