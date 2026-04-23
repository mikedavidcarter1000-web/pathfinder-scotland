'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SubmitButton } from '@/components/ui/submit-button'
import { useToast } from '@/components/ui/toast'
import { useCurrentStudent, useUpdateStudent } from '@/hooks/use-student'
import { useGenerateReminders } from '@/hooks/use-reminders'
import { useAuth, useUpdatePassword } from '@/hooks/use-auth'
import { getSupabaseClient } from '@/lib/supabase'
import {
  onboardingPostcodeLookupAction,
  type OnboardingPostcodeResult,
} from '@/app/actions/onboarding-postcode-lookup'
import { ParentAccessSection } from '@/components/dashboard/parent-access-section'
import { LinkToSchool } from '@/components/student/link-to-school'

const INCOME_LABELS: Record<string, string> = {
  under_21000: 'Under £21,000',
  '21000_24000': '£21,000 – £24,000',
  '24000_34000': '£24,000 – £34,000',
  '34000_45000': '£34,000 – £45,000',
  over_45000: 'Over £45,000',
  prefer_not_say: 'Prefer not to say',
}

const EDUCATION_LABELS: Record<string, string> = {
  no_qualifications: 'No formal qualifications',
  school_qualifications: 'School qualifications',
  college_qualifications: 'College qualifications (HNC, HND, SVQ)',
  degree: 'University degree',
  postgraduate: 'Postgraduate degree',
  unknown: "Don't know",
}

export default function SettingsPage() {
  const router = useRouter()
  const toast = useToast()
  const { data: student } = useCurrentStudent()
  const updateStudent = useUpdateStudent()

  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [exportSuccess, setExportSuccess] = useState(false)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleExport = async () => {
    setIsExporting(true)
    setExportError(null)
    setExportSuccess(false)

    try {
      const res = await fetch('/api/account/export-data', { method: 'POST' })

      if (!res.ok) {
        const body = await res.json()
        const msg = body.error || 'Export failed. Please try again.'
        setExportError(msg)
        toast.error("Couldn't export data", msg)
        return
      }

      // Trigger browser download from the response blob
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `pathfinder-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)
      setExportSuccess(true)
      toast.success('Download started', 'Check your downloads folder.')
    } catch {
      const msg = 'Failed to download your data. Please try again.'
      setExportError(msg)
      toast.error("Couldn't export data", msg)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (confirmationText !== 'DELETE') return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const res = await fetch('/api/account/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: confirmationText }),
      })

      if (!res.ok) {
        const body = await res.json()
        const msg = body.error || 'Deletion failed. Please try again.'
        setDeleteError(msg)
        toast.error("Couldn't delete account", msg)
        return
      }

      toast.success('Account deleted', 'Your data has been removed.')
      router.push('/')
    } catch {
      const msg = 'Something went wrong. Please try again.'
      setDeleteError(msg)
      toast.error("Couldn't delete account", msg)
    } finally {
      setIsDeleting(false)
    }
  }

  const closeDeleteModal = () => {
    if (isDeleting) return
    setDeleteModalOpen(false)
    setConfirmationText('')
    setDeleteError(null)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and privacy preferences</p>
      </div>

      {/* Home postcode — change postcode + auto-refresh SIMD decile */}
      {student && <PostcodeSection student={student} updateStudent={updateStudent} toast={toast} />}

      {/* Funding Profile section */}
      {student && <FundingProfileSection student={student} updateStudent={updateStudent} toast={toast} />}

      {/* Email preferences — GDPR opt-out for marketing + platform emails */}
      {student && <EmailPreferencesSection student={student} updateStudent={updateStudent} toast={toast} />}

      {/*
        TODO (Phase 2): Career interests editing. Onboarding does not persist
        career interests today — no student_career_interests table or
        students.career_interests column exists. When the quiz results flow
        lands and career interests start being stored per-student, surface a
        matching edit section here so users can add/remove interests outside
        the onboarding flow.
      */}

      {/* Parent / guardian access — only shown for student accounts */}
      {student && <ParentAccessSection />}

      {/* School link -- student can link themselves to a Pathfinder school */}
      {student && <LinkToSchool />}

      {/* Change Password section */}
      <ChangePasswordSection />

      {/* Your Data section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Your Data</h2>
          <p className="text-sm text-gray-500 mt-1">
            Under GDPR you have the right to access a copy of your data (Article 20) and to
            request its deletion (Article 17).
          </p>
        </div>

        <div className="space-y-4">
          {/* Download data */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-gray-50">
            <div className="min-w-0">
              <p className="font-medium text-gray-900">Download my data</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Download a JSON file containing your profile, grades, saved courses, and
                activity history.
              </p>
              {exportError && (
                <p className="text-sm text-red-600 mt-1">{exportError}</p>
              )}
              {exportSuccess && (
                <p className="text-sm text-green-600 mt-1">Download started.</p>
              )}
            </div>
            <SubmitButton
              onClick={handleExport}
              isLoading={isExporting}
              loadingText="Preparing..."
              variant="secondary"
              className="shrink-0 pf-btn-sm"
            >
              Download
            </SubmitButton>
          </div>

          {/* Delete account */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-red-50 border border-red-100">
            <div className="min-w-0">
              <p className="font-medium text-red-900">Delete my account</p>
              <p className="text-sm text-red-700 mt-0.5">
                Permanently removes your account and all associated data. This cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="shrink-0 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
            >
              Delete account
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
            <h3 id="delete-modal-title" className="text-lg font-semibold text-gray-900">
              Delete your account
            </h3>

            <p className="text-sm text-gray-600 mt-3">
              The following will be <strong>permanently deleted</strong> and cannot be
              recovered:
            </p>

            <ul className="mt-2 mb-4 text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Your profile and personal information</li>
              <li>All grades you have entered</li>
              <li>All saved courses</li>
              <li>Your activity history (anonymised)</li>
              <li>Any active subscription (cancelled immediately)</li>
            </ul>

            <p className="text-sm text-gray-700 mb-3">
              Type <strong>DELETE</strong> in the box below to confirm.
            </p>

            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type DELETE to confirm"
              aria-label="Type the word DELETE to confirm account deletion"
              disabled={isDeleting}
              autoComplete="off"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 mb-4"
            />

            {deleteError && (
              <p className="text-sm text-red-600 mb-3">{deleteError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <SubmitButton
                onClick={handleDeleteConfirm}
                disabled={confirmationText !== 'DELETE'}
                isLoading={isDeleting}
                loadingText="Deleting..."
                variant="danger"
                className="flex-1"
              >
                Delete my account
              </SubmitButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Funding Profile Section
// ---------------------------------------------------------------------------

interface FundingProfileSectionProps {
  student: NonNullable<ReturnType<typeof useCurrentStudent>['data']>
  updateStudent: ReturnType<typeof useUpdateStudent>
  toast: ReturnType<typeof useToast>
}

function FundingProfileSection({ student, updateStudent, toast }: FundingProfileSectionProps) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const { generateNow: generateReminders } = useGenerateReminders()

  // Form state initialised from current student data
  const [income, setIncome] = useState(student.household_income_band ?? '')
  const [parentalEd, setParentalEd] = useState(student.parental_education ?? '')
  const [singleParent, setSingleParent] = useState(!!student.is_single_parent_household)
  const [estranged, setEstranged] = useState(!!student.is_estranged)
  const [youngParent, setYoungParent] = useState(!!student.is_young_parent)
  const [refugee, setRefugee] = useState(!!student.is_refugee_or_asylum_seeker)
  const [disability, setDisability] = useState(!!student.has_disability)
  const [disabilityDetails, setDisabilityDetails] = useState(student.disability_details ?? '')
  const [fsm, setFsm] = useState(!!student.receives_free_school_meals)
  const [ema, setEma] = useState(!!student.receives_ema)

  const isCompleted = !!student.demographic_completed

  const handleSave = async () => {
    setSaving(true)
    try {
      const firstGen =
        parentalEd &&
        ['no_qualifications', 'school_qualifications', 'college_qualifications'].includes(parentalEd)

      await updateStudent.mutateAsync({
        household_income_band: income || null,
        parental_education: parentalEd || null,
        is_single_parent_household: singleParent,
        is_estranged: estranged,
        is_young_parent: youngParent,
        is_refugee_or_asylum_seeker: refugee,
        has_disability: disability,
        disability_details: disability ? disabilityDetails || null : null,
        receives_free_school_meals: fsm,
        receives_ema: ema,
        first_generation: firstGen || !!student.first_generation,
        demographic_completed: true,
      })
      toast.success('Funding profile updated', 'Your benefit recommendations will be refreshed.')
      // Refresh benefit deadline reminders with the updated profile
      generateReminders()
      setEditing(false)
    } catch {
      toast.error("Couldn't save", 'Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          backgroundColor: 'var(--pf-white)',
          border: '1px solid var(--pf-grey-300)',
        }}
      >
        <div className="mb-4">
          <h2
            style={{
              fontSize: '1.125rem',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              color: 'var(--pf-grey-900)',
            }}
          >
            Funding Profile
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginTop: '4px' }}>
            Used to match you with bursaries, grants, and other financial support.
          </p>
        </div>

        {isCompleted ? (
          <>
            <div className="space-y-2 mb-4" style={{ fontSize: '0.875rem' }}>
              {student.household_income_band && (
                <ProfileRow
                  label="Household income"
                  value={INCOME_LABELS[student.household_income_band] ?? student.household_income_band}
                />
              )}
              {student.parental_education && (
                <ProfileRow
                  label="Parental education"
                  value={EDUCATION_LABELS[student.parental_education] ?? student.parental_education}
                />
              )}
              {student.local_authority && (
                <ProfileRow
                  label="Council (from postcode)"
                  value={student.local_authority}
                />
              )}
              {(student.is_estranged || student.is_young_parent || student.is_refugee_or_asylum_seeker ||
                student.has_disability || student.receives_free_school_meals || student.receives_ema ||
                student.is_single_parent_household) && (
                <ProfileRow
                  label="Circumstances"
                  value={[
                    student.receives_free_school_meals && 'Free school meals',
                    student.receives_ema && 'EMA',
                    student.is_single_parent_household && 'Single parent household',
                    student.is_estranged && 'Estranged',
                    student.is_young_parent && 'Young parent',
                    student.is_refugee_or_asylum_seeker && 'Refugee/asylum seeker',
                    student.has_disability && 'Disability/health condition',
                  ].filter(Boolean).join(', ')}
                />
              )}
            </div>
            <button
              onClick={() => setEditing(true)}
              className="pf-btn pf-btn-secondary"
              style={{ fontSize: '0.875rem' }}
            >
              Update funding profile
            </button>
          </>
        ) : (
          <div
            className="rounded-lg"
            style={{
              padding: '16px',
              backgroundColor: 'var(--pf-blue-50)',
              border: '1px solid var(--pf-blue-100)',
            }}
          >
            <p style={{ fontSize: '0.9375rem', color: 'var(--pf-blue-900)', marginBottom: '12px' }}>
              Complete your funding profile to see all the bursaries and grants you&apos;re eligible
              for.
            </p>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="pf-btn pf-btn-primary"
            >
              Complete funding profile
            </button>
            <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginTop: '12px' }}>
              Check which bursaries and grants you may be eligible for based on your profile.{' '}
              <Link
                href="/bursaries"
                style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}
              >
                Browse bursaries →
              </Link>
            </p>
          </div>
        )}
      </div>
    )
  }

  // Editing form
  return (
    <div
      className="rounded-xl p-6 mb-6"
      style={{
        backgroundColor: 'var(--pf-white)',
        border: '1px solid var(--pf-blue-500)',
      }}
    >
      <h2
        style={{
          fontSize: '1.125rem',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          color: 'var(--pf-grey-900)',
          marginBottom: '16px',
        }}
      >
        {isCompleted ? 'Update Funding Profile' : 'Complete Funding Profile'}
      </h2>

      <div className="space-y-4">
        {/* Household income */}
        <label className="block">
          <span className="pf-label">Household income</span>
          <select className="pf-input w-full mt-1" value={income} onChange={(e) => setIncome(e.target.value)}>
            <option value="">Select...</option>
            <option value="under_21000">Under £21,000</option>
            <option value="21000_24000">£21,000 – £24,000</option>
            <option value="24000_34000">£24,000 – £34,000</option>
            <option value="34000_45000">£34,000 – £45,000</option>
            <option value="over_45000">Over £45,000</option>
            <option value="prefer_not_say">Prefer not to say</option>
          </select>
        </label>

        {/* Parental education */}
        <label className="block">
          <span className="pf-label">Parent/guardian&apos;s highest qualification</span>
          <select className="pf-input w-full mt-1" value={parentalEd} onChange={(e) => setParentalEd(e.target.value)}>
            <option value="">Select...</option>
            <option value="no_qualifications">No formal qualifications</option>
            <option value="school_qualifications">School qualifications</option>
            <option value="college_qualifications">College qualifications (HNC, HND, SVQ)</option>
            <option value="degree">University degree</option>
            <option value="postgraduate">Postgraduate degree</option>
            <option value="unknown">Don&apos;t know</option>
          </select>
        </label>

        {/* Council area (read-only — derived from postcode) */}
        {student.local_authority && (
          <div>
            <span className="pf-label">Council (derived from your postcode)</span>
            <p
              className="mt-1"
              style={{
                fontSize: '0.9375rem',
                color: 'var(--pf-grey-700)',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--pf-grey-100)',
                border: '1px solid var(--pf-grey-300)',
              }}
            >
              {student.local_authority}
            </p>
          </div>
        )}

        {/* Status checkboxes */}
        <fieldset>
          <legend className="pf-label mb-2">Circumstances</legend>
          <div className="space-y-2">
            {[
              { label: 'Free school meals', checked: fsm, onChange: setFsm },
              { label: 'EMA (Education Maintenance Allowance)', checked: ema, onChange: setEma },
              { label: 'Single parent household', checked: singleParent, onChange: setSingleParent },
              { label: 'Estranged from parents', checked: estranged, onChange: setEstranged },
              { label: 'Young parent', checked: youngParent, onChange: setYoungParent },
              { label: 'Refugee or asylum seeker', checked: refugee, onChange: setRefugee },
              { label: 'Disability / health condition / learning difficulty', checked: disability, onChange: (v: boolean) => { setDisability(v); if (!v) setDisabilityDetails('') } },
            ].map((item) => (
              <label key={item.label} className="flex items-center gap-2 cursor-pointer" style={{ fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => item.onChange(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--pf-blue-700)' }}
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>

        {disability && (
          <label className="block">
            <span className="pf-label">Disability details (optional)</span>
            <input
              type="text"
              className="pf-input w-full mt-1"
              placeholder="e.g. dyslexia, hearing impairment"
              value={disabilityDetails}
              onChange={(e) => setDisabilityDetails(e.target.value)}
            />
          </label>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setEditing(false)}
          disabled={saving}
          className="pf-btn pf-btn-secondary"
        >
          Cancel
        </button>
        <SubmitButton
          onClick={handleSave}
          isLoading={saving}
          loadingText="Saving..."
        >
          Save funding profile
        </SubmitButton>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Change Password Section
// ---------------------------------------------------------------------------

// Map Supabase provider IDs to the user-facing name shown in the SSO notice.
const SSO_PROVIDER_LABELS: Record<string, string> = {
  google: 'Google',
  apple: 'Apple',
  github: 'GitHub',
  twitter: 'X (Twitter)',
  azure: 'Microsoft',
  facebook: 'Facebook',
}

function ChangePasswordSection() {
  const { user } = useAuth()
  const toast = useToast()
  const updatePassword = useUpdatePassword()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Detect whether the account has a password credential. Supabase puts the
  // primary sign-in method on user.app_metadata.provider and lists every
  // linked identity on user.identities. An account only has a password if
  // one of its identities is the `email` provider.
  const identities = (user?.identities ?? []) as Array<{ provider?: string }>
  const hasEmailIdentity = identities.some((i) => i?.provider === 'email')
  const appMetadata = (user?.app_metadata ?? {}) as {
    provider?: string
    providers?: string[]
  }
  const primaryProvider = appMetadata.provider
  const providers = appMetadata.providers ?? (primaryProvider ? [primaryProvider] : [])
  const ssoProvider = providers.find((p) => p && p !== 'email')

  // Show the SSO notice only when the account has no password credential
  // (no email identity) and was created via an OAuth provider.
  const showSsoNotice = !!user && !hasEmailIdentity && !!ssoProvider

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!user?.email) {
      setError('You must be signed in to change your password.')
      return
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }
    if (newPassword === currentPassword) {
      setError('New password must be different from your current password.')
      return
    }

    setSubmitting(true)
    try {
      // Verify current password by re-authenticating. Supabase does not expose
      // a direct "verify current password" call, so we sign in again to check.
      const supabase = getSupabaseClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })
      if (signInError) {
        setError('Current password is incorrect.')
        return
      }

      await updatePassword.mutateAsync({ password: newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess(true)
      toast.success('Password updated', 'Your password has been changed.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update password.'
      setError(msg)
      toast.error("Couldn't update password", msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (showSsoNotice) {
    const providerLabel =
      (ssoProvider && SSO_PROVIDER_LABELS[ssoProvider]) ||
      (ssoProvider ? ssoProvider.charAt(0).toUpperCase() + ssoProvider.slice(1) : 'your identity provider')
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Password</h2>
        </div>
        <p className="text-sm text-gray-600">
          You sign in with {providerLabel}. Manage your password through your {providerLabel} account.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter your current password and choose a new one. Passwords must be at least 8 characters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="pf-label">Current password</span>
          <input
            type="password"
            className="pf-input w-full mt-1"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <label className="block">
          <span className="pf-label">New password</span>
          <input
            type="password"
            className="pf-input w-full mt-1"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        <label className="block">
          <span className="pf-label">Confirm new password</span>
          <input
            type="password"
            className="pf-input w-full mt-1"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">Password updated successfully.</p>}

        <SubmitButton
          type="submit"
          isLoading={submitting}
          loadingText="Updating..."
          disabled={!currentPassword || !newPassword || !confirmPassword}
        >
          Update password
        </SubmitButton>
      </form>
    </div>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4" style={{ padding: '6px 0', borderBottom: '1px solid var(--pf-grey-100)' }}>
      <span style={{ color: 'var(--pf-grey-600)' }}>{label}</span>
      <span style={{ color: 'var(--pf-grey-900)', fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Home postcode section — students can update their postcode after onboarding
// if they move or entered it incorrectly. Updating the postcode re-runs the
// SIMD lookup so widening-access eligibility stays accurate.
// ---------------------------------------------------------------------------

interface PostcodeSectionProps {
  student: NonNullable<ReturnType<typeof useCurrentStudent>['data']>
  updateStudent: ReturnType<typeof useUpdateStudent>
  toast: ReturnType<typeof useToast>
}

function PostcodeSection({ student, updateStudent, toast }: PostcodeSectionProps) {
  const [editing, setEditing] = useState(false)
  const [postcode, setPostcode] = useState(student.postcode ?? '')
  const [lookupResult, setLookupResult] = useState<OnboardingPostcodeResult | null>(null)
  const [isLookingUp, startLookup] = useTransition()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset the local state whenever the user reopens the editor.
  useEffect(() => {
    if (editing) {
      setPostcode(student.postcode ?? '')
      setLookupResult(null)
      setError(null)
    }
  }, [editing, student.postcode])

  const handleLookup = () => {
    if (!postcode.trim()) return
    setError(null)
    startLookup(async () => {
      const res = await onboardingPostcodeLookupAction(postcode)
      setLookupResult(res)
    })
  }

  const handleSave = async () => {
    if (!lookupResult) return
    if (lookupResult.status === 'ok') {
      setSaving(true)
      try {
        await updateStudent.mutateAsync({
          postcode: lookupResult.postcode,
          simd_decile: lookupResult.simdDecile,
          local_authority: lookupResult.councilArea ?? null,
        })
        toast.success('Postcode updated', 'Your widening access status has been refreshed.')
        setEditing(false)
      } catch {
        toast.error("Couldn't save", 'Please try again.')
      } finally {
        setSaving(false)
      }
    } else if (lookupResult.status === 'missing_simd') {
      // Valid Scottish postcode but no SIMD row -- still persist the postcode
      // so widening access can be reassessed later once seed refreshes.
      setSaving(true)
      try {
        await updateStudent.mutateAsync({
          postcode: lookupResult.postcode,
          simd_decile: null,
          local_authority: null,
        })
        toast.success('Postcode updated', 'SIMD data for this postcode is not yet available.')
        setEditing(false)
      } catch {
        toast.error("Couldn't save", 'Please try again.')
      } finally {
        setSaving(false)
      }
    } else {
      // not_scottish / not_found / invalid_format / server_error
      setError("We couldn't find this postcode in our database. Please check and try again.")
    }
  }

  if (!editing) {
    return (
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          backgroundColor: 'var(--pf-white)',
          border: '1px solid var(--pf-grey-300)',
        }}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2
              style={{
                fontSize: '1.125rem',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                color: 'var(--pf-grey-900)',
              }}
            >
              Home postcode
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginTop: '4px' }}>
              Used to check your SIMD decile and widening access eligibility.
            </p>
          </div>
        </div>

        <div className="space-y-2" style={{ fontSize: '0.875rem' }}>
          <ProfileRow label="Postcode" value={student.postcode || 'Not set'} />
          {student.simd_decile != null && (
            <ProfileRow label="SIMD decile" value={String(student.simd_decile)} />
          )}
          {student.local_authority && (
            <ProfileRow label="Council area" value={student.local_authority} />
          )}
        </div>

        <button
          type="button"
          onClick={() => setEditing(true)}
          className="pf-btn pf-btn-secondary mt-4"
          style={{ fontSize: '0.875rem' }}
        >
          {student.postcode ? 'Change postcode' : 'Add postcode'}
        </button>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl p-6 mb-6"
      style={{
        backgroundColor: 'var(--pf-white)',
        border: '1px solid var(--pf-blue-500)',
      }}
    >
      <h2
        style={{
          fontSize: '1.125rem',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          color: 'var(--pf-grey-900)',
          marginBottom: '12px',
        }}
      >
        Update postcode
      </h2>

      <label htmlFor="settings-postcode" className="pf-label">
        Home postcode
      </label>
      <div className="flex flex-col sm:flex-row gap-3 mt-1">
        <input
          id="settings-postcode"
          type="text"
          value={postcode}
          onChange={(e) => {
            setPostcode(e.target.value.toUpperCase())
            setLookupResult(null)
            setError(null)
          }}
          className="pf-input flex-1 uppercase"
          placeholder="e.g. EH1 1YZ"
          autoComplete="postal-code"
        />
        <button
          type="button"
          onClick={handleLookup}
          disabled={!postcode.trim() || isLookingUp}
          className="pf-btn pf-btn-secondary justify-center"
          style={{ minHeight: '44px' }}
        >
          {isLookingUp ? 'Checking…' : 'Look up'}
        </button>
      </div>

      {lookupResult?.status === 'ok' && (
        <div
          className="mt-4 rounded-lg"
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--pf-blue-50)',
            border: '1px solid var(--pf-blue-100)',
            color: 'var(--pf-blue-900)',
            fontSize: '0.875rem',
          }}
        >
          <strong>{lookupResult.postcode}</strong> — SIMD decile {lookupResult.simdDecile}
          {lookupResult.councilArea ? `, ${lookupResult.councilArea}` : ''}.
        </div>
      )}

      {lookupResult?.status === 'missing_simd' && (
        <div
          className="mt-4 rounded-lg"
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--pf-blue-50)',
            border: '1px solid var(--pf-blue-100)',
            color: 'var(--pf-blue-900)',
            fontSize: '0.875rem',
          }}
        >
          <strong>{lookupResult.postcode}</strong> is a valid Scottish postcode. SIMD data for this
          postcode is not in our database yet — your postcode can still be saved.
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

      {lookupResult &&
        lookupResult.status !== 'ok' &&
        lookupResult.status !== 'missing_simd' && (
          <p className="text-sm text-red-600 mt-3">
            We couldn&apos;t find this postcode in our database. Please check and try again.
          </p>
        )}

      <div className="flex gap-3 mt-5">
        <button
          type="button"
          onClick={() => setEditing(false)}
          disabled={saving}
          className="pf-btn pf-btn-secondary"
        >
          Cancel
        </button>
        <SubmitButton
          onClick={handleSave}
          isLoading={saving}
          loadingText="Saving..."
          disabled={
            !lookupResult ||
            (lookupResult.status !== 'ok' && lookupResult.status !== 'missing_simd')
          }
        >
          Save postcode
        </SubmitButton>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Email preferences section — GDPR opt-out for marketing-style emails.
// Three independent toggles persisted to students.email_preferences JSONB.
// ---------------------------------------------------------------------------

type EmailPrefs = {
  results_day_reminders: boolean
  platform_updates: boolean
  tips_and_guidance: boolean
}

const EMAIL_PREF_DEFAULTS: EmailPrefs = {
  results_day_reminders: true,
  platform_updates: true,
  tips_and_guidance: true,
}

function readPrefs(raw: unknown): EmailPrefs {
  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown>
    return {
      results_day_reminders:
        typeof r.results_day_reminders === 'boolean'
          ? r.results_day_reminders
          : EMAIL_PREF_DEFAULTS.results_day_reminders,
      platform_updates:
        typeof r.platform_updates === 'boolean'
          ? r.platform_updates
          : EMAIL_PREF_DEFAULTS.platform_updates,
      tips_and_guidance:
        typeof r.tips_and_guidance === 'boolean'
          ? r.tips_and_guidance
          : EMAIL_PREF_DEFAULTS.tips_and_guidance,
    }
  }
  return { ...EMAIL_PREF_DEFAULTS }
}

interface EmailPreferencesSectionProps {
  student: NonNullable<ReturnType<typeof useCurrentStudent>['data']>
  updateStudent: ReturnType<typeof useUpdateStudent>
  toast: ReturnType<typeof useToast>
}

function EmailPreferencesSection({ student, updateStudent, toast }: EmailPreferencesSectionProps) {
  const initial = readPrefs((student as unknown as { email_preferences?: unknown }).email_preferences)
  const [prefs, setPrefs] = useState<EmailPrefs>(initial)
  const [saving, setSaving] = useState(false)

  const togglePref = async (key: keyof EmailPrefs) => {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    setSaving(true)
    try {
      // email_preferences is a JSONB column; UpdateTables<'students'> accepts
      // Json so this round-trip is type-safe once the generated types include
      // the new column.
      await updateStudent.mutateAsync({
        email_preferences: next as unknown as Record<string, boolean>,
      } as Parameters<typeof updateStudent.mutateAsync>[0])
      toast.success('Email preferences updated')
    } catch {
      // Revert on failure so the toggle state matches the DB.
      setPrefs(prefs)
      toast.error("Couldn't save", 'Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const items: Array<{ key: keyof EmailPrefs; label: string; description: string }> = [
    {
      key: 'results_day_reminders',
      label: 'Results Day reminders',
      description: 'Get notified about key dates and deadlines around results day.',
    },
    {
      key: 'platform_updates',
      label: 'Platform updates',
      description: 'Hear about new features and content on Pathfinder.',
    },
    {
      key: 'tips_and_guidance',
      label: 'Tips and guidance',
      description: 'Receive subject choice and career planning tips.',
    },
  ]

  return (
    <div
      className="rounded-xl p-6 mb-6"
      style={{
        backgroundColor: 'var(--pf-white)',
        border: '1px solid var(--pf-grey-300)',
      }}
    >
      <div className="mb-4">
        <h2
          style={{
            fontSize: '1.125rem',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            color: 'var(--pf-grey-900)',
          }}
        >
          Email preferences
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginTop: '4px' }}>
          Choose which types of email you want to receive from Pathfinder.
        </p>
      </div>

      <ul className="space-y-3" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((item) => (
          <li key={item.key} className="flex items-start gap-3">
            <input
              id={`email-pref-${item.key}`}
              type="checkbox"
              checked={prefs[item.key]}
              onChange={() => togglePref(item.key)}
              disabled={saving}
              style={{
                width: '20px',
                height: '20px',
                accentColor: 'var(--pf-blue-700)',
                marginTop: '2px',
                flexShrink: 0,
              }}
            />
            <label htmlFor={`email-pref-${item.key}`} className="flex-1 cursor-pointer">
              <span
                style={{
                  display: 'block',
                  fontWeight: 600,
                  color: 'var(--pf-grey-900)',
                  fontSize: '0.9375rem',
                }}
              >
                {item.label}
              </span>
              <span
                style={{
                  display: 'block',
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.8125rem',
                  marginTop: '2px',
                }}
              >
                {item.description}
              </span>
            </label>
          </li>
        ))}
      </ul>

      <p
        style={{
          fontSize: '0.75rem',
          color: 'var(--pf-grey-600)',
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid var(--pf-grey-100)',
        }}
      >
        You can change these at any time. We will never share your email address with third parties.
      </p>
    </div>
  )
}
