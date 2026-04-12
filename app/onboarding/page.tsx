'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useCurrentStudent, useCreateStudent, useBulkUpsertGrades } from '@/hooks/use-student'
import { useGenerateReminders } from '@/hooks/use-reminders'
import {
  StepIndicator,
  MobileStepIndicator,
  WelcomeStep,
  BasicInfoStep,
  PostcodeStep,
  WideningAccessStep,
  DemographicsStep,
  GradesStep,
} from '@/components/onboarding'
import type { DemographicData } from '@/components/onboarding/demographics-step'
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

interface BasicInfoState {
  firstName: string
  lastName: string
  schoolStage: string
  schoolName: string
}

interface PostcodeState {
  postcode: string
  simdDecile: number | null
  councilArea: string | null
}

interface WideningAccessState {
  careExperienced: boolean
  isCarer: boolean
  firstGeneration: boolean
}

interface PersistedState {
  currentStep: number
  basicInfo: BasicInfoState
  postcode: PostcodeState
  wideningAccess: WideningAccessState
  demographics: DemographicData
  grades: Grade[]
}

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Name & school' },
  { id: 2, title: 'Location', description: 'Postcode' },
  { id: 3, title: 'Widening Access', description: 'Eligibility' },
  { id: 4, title: 'Your Funding', description: 'Bursaries & grants' },
  { id: 5, title: 'Grades', description: 'Your qualifications' },
]

// Parents skip widening-access self-assessment and grade entry — postcode is
// enough to surface widening-access info for their child on the dashboard.
const PARENT_STEPS = [
  { id: 1, title: 'Basic Info', description: 'About you and your child' },
  { id: 2, title: 'Postcode', description: 'For widening access check' },
]

const STORAGE_KEY_PREFIX = 'pf_onboarding_state_'

const EMPTY_BASIC_INFO: BasicInfoState = {
  firstName: '',
  lastName: '',
  schoolStage: '',
  schoolName: '',
}

const EMPTY_POSTCODE: PostcodeState = {
  postcode: '',
  simdDecile: null,
  councilArea: null,
}

const EMPTY_WIDENING_ACCESS: WideningAccessState = {
  careExperienced: false,
  isCarer: false,
  firstGeneration: false,
}

const EMPTY_DEMOGRAPHICS: DemographicData = {
  householdIncomeBand: '',
  isSingleParentHousehold: false,
  parentalEducation: '',
  hasDisability: false,
  disabilityDetails: '',
  isEstranged: false,
  isRefugeeOrAsylumSeeker: false,
  isYoungParent: false,
  receivesFreeSchoolMeals: false,
  receivesEma: false,
  localAuthority: '',
}

function loadPersisted(userId: string): PersistedState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PREFIX + userId)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedState
    // Defensive check: only treat the state as a valid resume if at least one
    // field of step 1 has been filled in. Otherwise an interrupted welcome
    // screen visit would falsely look like in-progress work.
    if (
      !parsed.basicInfo?.firstName &&
      !parsed.basicInfo?.lastName &&
      !parsed.basicInfo?.schoolStage &&
      !parsed.postcode?.postcode &&
      !parsed.grades?.length &&
      !parsed.wideningAccess?.careExperienced &&
      !parsed.wideningAccess?.isCarer &&
      !parsed.wideningAccess?.firstGeneration
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function clearPersisted(userId: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY_PREFIX + userId)
  } catch {
    // Ignore — quota or disabled storage shouldn't break the flow.
  }
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingContent />
    </Suspense>
  )
}

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isParent = searchParams.get('type') === 'parent'
  const { user, isLoading: authLoading } = useAuth()
  const { data: student, isLoading: studentLoading } = useCurrentStudent()
  const createStudent = useCreateStudent()
  const bulkUpsertGrades = useBulkUpsertGrades()
  const toast = useToast()
  const { generateNow: generateReminders } = useGenerateReminders()

  // currentStep === 0 is the welcome screen; 1-5 are the form steps.
  const [currentStep, setCurrentStep] = useState(0)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const resumeShownRef = useRef(false)

  const [basicInfo, setBasicInfo] = useState<BasicInfoState>(EMPTY_BASIC_INFO)
  const [postcodeData, setPostcodeData] = useState<PostcodeState>(EMPTY_POSTCODE)
  const [wideningAccess, setWideningAccess] = useState<WideningAccessState>(EMPTY_WIDENING_ACCESS)
  const [demographics, setDemographics] = useState<DemographicData>(EMPTY_DEMOGRAPHICS)
  const [grades, setGrades] = useState<Grade[]>([])

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/sign-in')
    }
  }, [authLoading, user, router])

  // Redirect already-onboarded students
  useEffect(() => {
    if (!studentLoading && student) {
      router.push('/dashboard')
    }
  }, [studentLoading, student, router])

  // Hydrate from localStorage on first mount (after we have a userId)
  useEffect(() => {
    if (!user || isHydrated) return
    const persisted = loadPersisted(user.id)
    if (persisted) {
      setBasicInfo({ ...EMPTY_BASIC_INFO, ...persisted.basicInfo })
      setPostcodeData({ ...EMPTY_POSTCODE, ...persisted.postcode })
      setWideningAccess({ ...EMPTY_WIDENING_ACCESS, ...persisted.wideningAccess })
      setDemographics({ ...EMPTY_DEMOGRAPHICS, ...persisted.demographics })
      setGrades(Array.isArray(persisted.grades) ? persisted.grades : [])
      // Resume on the saved step, but never below 1 (welcome already passed)
      setCurrentStep(Math.max(1, persisted.currentStep || 1))
      if (!resumeShownRef.current) {
        resumeShownRef.current = true
        toast.info('Welcome back', "Let's pick up where you left off.")
      }
    }
    setIsHydrated(true)
  }, [user, isHydrated, toast])

  // Persist to localStorage whenever any tracked state changes (post-hydration)
  useEffect(() => {
    if (!user || !isHydrated) return
    if (currentStep === 0) return
    const state: PersistedState = {
      currentStep,
      basicInfo,
      postcode: postcodeData,
      wideningAccess,
      demographics,
      grades,
    }
    try {
      window.localStorage.setItem(STORAGE_KEY_PREFIX + user.id, JSON.stringify(state))
    } catch {
      // Storage may be disabled — silent fail keeps the in-memory flow working.
    }
  }, [user, isHydrated, currentStep, basicInfo, postcodeData, wideningAccess, demographics, grades])

  const handleComplete = async () => {
    if (!user) {
      setError('Not authenticated. Please sign in again.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Derive first_generation from parental education if explicitly set on the
      // widening access step, or from the demographic parental_education field.
      const firstGenFromDemographics =
        demographics.parentalEducation &&
        ['no_qualifications', 'school_qualifications', 'college_qualifications'].includes(
          demographics.parentalEducation
        )
      const isFirstGen = isParent
        ? false
        : wideningAccess.firstGeneration || firstGenFromDemographics

      const demographicCompleted =
        !isParent &&
        (!!demographics.householdIncomeBand ||
          demographics.isSingleParentHousehold ||
          !!demographics.parentalEducation ||
          demographics.hasDisability ||
          demographics.isEstranged ||
          demographics.isRefugeeOrAsylumSeeker ||
          demographics.isYoungParent ||
          demographics.receivesFreeSchoolMeals ||
          demographics.receivesEma ||
          !!demographics.localAuthority)

      await createStudent.mutateAsync({
        email: user.email || '',
        first_name: basicInfo.firstName,
        last_name: basicInfo.lastName,
        school_stage: basicInfo.schoolStage as
          | 's2'
          | 's3'
          | 's4'
          | 's5'
          | 's6'
          | 'college'
          | 'mature'
          | null,
        school_name: basicInfo.schoolName || null,
        postcode: postcodeData.postcode || null,
        simd_decile: postcodeData.simdDecile,
        care_experienced: isParent ? false : wideningAccess.careExperienced,
        is_carer: isParent ? false : wideningAccess.isCarer,
        first_generation: isFirstGen || false,
        user_type: isParent ? 'parent' : 'student',
        // Demographic fields
        household_income_band: demographics.householdIncomeBand || null,
        is_single_parent_household: demographics.isSingleParentHousehold,
        parental_education: demographics.parentalEducation || null,
        has_disability: demographics.hasDisability,
        disability_details: demographics.disabilityDetails || null,
        is_estranged: demographics.isEstranged,
        is_refugee_or_asylum_seeker: demographics.isRefugeeOrAsylumSeeker,
        is_young_parent: demographics.isYoungParent,
        receives_free_school_meals: demographics.receivesFreeSchoolMeals,
        receives_ema: demographics.receivesEma,
        local_authority: demographics.localAuthority || postcodeData.councilArea || null,
        demographic_completed: demographicCompleted,
      })

      // Parents never enter grades — the bulk upsert is skipped entirely.
      if (!isParent) {
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
      }

      clearPersisted(user.id)
      // Fire-and-forget: create benefit deadline reminders for the new student
      generateReminders()
      toast.success('Welcome to Pathfinder', 'Your profile is ready.')
      router.push('/dashboard')
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create profile. Please try again.'
      setError(errorMessage)
      toast.error("Couldn't save profile", errorMessage)
      setIsSubmitting(false)
    }
  }

  if (authLoading || studentLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
        <div className="max-w-3xl mx-auto px-4 pt-8 sm:pt-10 pb-12 sm:pb-16">
          <div className="pf-card">
            <Skeleton width="60%" height={28} rounded="md" />
            <div style={{ height: '16px' }} />
            <Skeleton variant="text" lines={3} />
            <div style={{ height: '24px' }} />
            <Skeleton width="100%" height={40} rounded="md" />
            <div style={{ height: '12px' }} />
            <Skeleton width="100%" height={40} rounded="md" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null
  if (student) return null

  const isWelcome = currentStep === 0
  // Effective step for the indicator: clamp to 1 when on the welcome screen
  const indicatorStep = Math.max(1, currentStep)
  const stepConfig = isParent ? PARENT_STEPS : STEPS

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      <div className="max-w-3xl mx-auto px-4 pt-6 sm:pt-10 pb-12 sm:pb-16">
        <h1 className="sr-only">Set up your Pathfinder profile</h1>
        {!isWelcome && (
          <>
            {/* Desktop Step Indicator */}
            <div className="hidden sm:block mb-8">
              <StepIndicator
                steps={stepConfig}
                currentStep={Math.min(indicatorStep, stepConfig.length)}
                onStepClick={(step) => step < currentStep && setCurrentStep(step)}
              />
            </div>

            {/* Mobile Step Indicator */}
            <div className="sm:hidden mb-5">
              <MobileStepIndicator
                currentStep={Math.min(indicatorStep, stepConfig.length)}
                totalSteps={stepConfig.length}
                stepTitle={stepConfig[Math.min(indicatorStep, stepConfig.length) - 1].title}
              />
            </div>
          </>
        )}

        {/* Form Card */}
        <div
          className="pf-card-flat p-5 sm:p-7"
          style={{
            boxShadow: '0 10px 30px rgba(0, 45, 114, 0.08)',
          }}
        >
          {isWelcome && <WelcomeStep onStart={() => setCurrentStep(1)} />}

          {currentStep === 1 && (
            <BasicInfoStep
              data={basicInfo}
              onChange={setBasicInfo}
              onNext={() => setCurrentStep(2)}
              isParent={isParent}
            />
          )}

          {currentStep === 2 && (
            <>
              {isParent && error && (
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
              <PostcodeStep
                data={postcodeData}
                onChange={setPostcodeData}
                onNext={isParent ? handleComplete : () => setCurrentStep(3)}
                onBack={() => setCurrentStep(1)}
                nextLabel={isParent ? 'Finish' : undefined}
                isSubmitting={isParent ? isSubmitting : false}
              />
            </>
          )}

          {!isParent && currentStep === 3 && (
            <WideningAccessStep
              data={wideningAccess}
              onChange={setWideningAccess}
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {!isParent && currentStep === 4 && (
            <DemographicsStep
              data={demographics}
              onChange={setDemographics}
              onNext={(skipped) => {
                if (skipped) setDemographics(EMPTY_DEMOGRAPHICS)
                setCurrentStep(5)
              }}
              onBack={() => setCurrentStep(3)}
              prefilledCouncilArea={postcodeData.councilArea}
            />
          )}

          {!isParent && currentStep === 5 && (
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
                onBack={() => setCurrentStep(4)}
                isSubmitting={isSubmitting}
              />
            </>
          )}
        </div>

        {/* Help Link */}
        <div className="text-center mt-6">
          <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>
            Need help?{' '}
            <Link href="/contact" style={{ color: 'var(--pf-blue-500)' }}>
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
