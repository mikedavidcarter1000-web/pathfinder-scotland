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
import { Skeleton } from '@/components/ui/loading-skeleton'
import { useToast } from '@/components/ui/toast'
import type { QualificationType } from '@/lib/grades'

interface Grade {
  subject: string
  subject_id?: string | null
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
  const toast = useToast()

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
    if (!user) {
      setError('Not authenticated. Please sign in again.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await createStudent.mutateAsync({
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

      // Bulk upsert grades if any were added (only those with an actual grade picked)
      const gradesToSave = grades.filter((g) => g.grade)
      if (gradesToSave.length > 0) {
        await bulkUpsertGrades.mutateAsync(
          gradesToSave.map((g) => ({
            subject: g.subject,
            subject_id: g.subject_id ?? null,
            grade: g.grade,
            predicted: g.predicted,
            qualification_type: g.qualificationType,
          }))
        )
      }

      toast.success('Welcome to Pathfinder', 'Your profile is ready.')
      router.push('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create profile. Please try again.'
      setError(errorMessage)
      toast.error("Couldn't save profile", errorMessage)
      setIsSubmitting(false)
    }
  }

  if (authLoading || studentLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-teal-50)' }}>
        <main className="max-w-3xl mx-auto px-4" style={{ paddingTop: '40px', paddingBottom: '64px' }}>
          <div className="pf-card">
            <Skeleton width="60%" height={28} rounded="md" />
            <div style={{ height: '16px' }} />
            <Skeleton variant="text" lines={3} />
            <div style={{ height: '24px' }} />
            <Skeleton width="100%" height={40} rounded="md" />
            <div style={{ height: '12px' }} />
            <Skeleton width="100%" height={40} rounded="md" />
          </div>
        </main>
      </div>
    )
  }

  if (!user) return null
  if (student) return null

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-teal-50)' }}>
      <main className="max-w-3xl mx-auto px-4" style={{ paddingTop: '40px', paddingBottom: '64px' }}>
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
        <div
          className="pf-card-flat"
          style={{
            padding: '28px',
            boxShadow: '0 10px 30px rgba(12, 74, 66, 0.08)',
          }}
        >
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
                <div
                  className="mb-4 rounded-lg"
                  style={{
                    padding: '16px',
                    backgroundColor: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    color: 'var(--pf-red-500)',
                  }}
                >
                  <p style={{ fontWeight: 600 }}>Error</p>
                  <p style={{ fontSize: '0.875rem' }}>{error}</p>
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
          <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
            Need help?{' '}
            <Link href="/help" style={{ color: 'var(--pf-teal-500)' }}>
              Contact support
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
