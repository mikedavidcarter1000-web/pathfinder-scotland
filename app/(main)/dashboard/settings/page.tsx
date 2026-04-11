'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SubmitButton } from '@/components/ui/submit-button'
import { useToast } from '@/components/ui/toast'

export default function SettingsPage() {
  const router = useRouter()
  const toast = useToast()

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
