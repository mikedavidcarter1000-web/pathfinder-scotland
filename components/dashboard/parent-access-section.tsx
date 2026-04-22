'use client'

import { useState } from 'react'
import {
  useLinkedParents,
  useGenerateParentInviteCode,
  useRevokeParentLink,
  useSendParentInviteEmail,
  type LinkedParent,
} from '@/hooks/use-parent-link'
import { SubmitButton } from '@/components/ui/submit-button'
import { useToast } from '@/components/ui/toast'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ParentAccessSection() {
  const { data: links, isLoading } = useLinkedParents()
  const generate = useGenerateParentInviteCode()
  const revoke = useRevokeParentLink()
  const sendEmail = useSendParentInviteEmail()
  const toast = useToast()

  const [code, setCode] = useState<string | null>(null)
  const [codeExpiresAt, setCodeExpiresAt] = useState<Date | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<LinkedParent | null>(null)
  const [parentEmail, setParentEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)

  const activeLinks = (links ?? []).filter(
    (l) => l.status === 'active' || l.status === 'pending'
  )
  const atLimit = activeLinks.length >= 2

  const siteOrigin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://pathfinderscot.co.uk'
  const inviteUrl = code ? `${siteOrigin}/parent/join?code=${encodeURIComponent(code)}` : null

  const handleGenerate = async () => {
    try {
      const result = await generate.mutateAsync()
      setCode(result.code)
      setCodeExpiresAt(new Date(Date.now() + result.expires_in_hours * 3600_000))
      setParentEmail('')
      setEmailError(null)
      toast.success('Invite ready', 'Share the link or send it by email.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not generate code.'
      toast.error("Couldn't generate invite", msg)
    }
  }

  const handleCopyLink = async () => {
    if (!inviteUrl) return
    try {
      await navigator.clipboard.writeText(inviteUrl)
      toast.success('Link copied', 'Paste it into a message to your parent or guardian.')
    } catch {
      toast.info('Copy this link', inviteUrl)
    }
  }

  const handleCopyCode = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      toast.success('Code copied', 'Paste it on the parent join page.')
    } catch {
      toast.info('Copy this code', code)
    }
  }

  const handleSendEmail = async () => {
    if (!code) return
    setEmailError(null)
    const trimmed = parentEmail.trim()
    if (!EMAIL_RE.test(trimmed)) {
      setEmailError('Enter a valid email address.')
      return
    }
    try {
      const result = await sendEmail.mutateAsync({ code, email: trimmed })
      if (result.sent) {
        toast.success('Email sent', `Invite sent to ${trimmed}.`)
      } else {
        toast.info('Email not sent', 'Email delivery is not configured. Share the link instead.')
      }
      setParentEmail('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not send invite email.'
      setEmailError(msg)
    }
  }

  const handleRevoke = async () => {
    if (!revokeTarget) return
    try {
      await revoke.mutateAsync(revokeTarget.link_id)
      toast.success(
        'Access revoked',
        `${revokeTarget.full_name} can no longer see your progress.`
      )
      setRevokeTarget(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not revoke access.'
      toast.error("Couldn't revoke", msg)
    }
  }

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
          Invite a parent or guardian
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginTop: '4px' }}>
          Share a link with a parent or guardian so they can see your saved courses,
          predicted grades, and funding options. They can&apos;t edit anything, and you can
          revoke access at any time. Maximum 2 parents or guardians.
        </p>
      </div>

      <div style={{ marginBottom: '16px' }}>
        {isLoading ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>Loading...</p>
        ) : activeLinks.length === 0 ? (
          <p
            className="rounded-lg"
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--pf-blue-50)',
              fontSize: '0.875rem',
              color: 'var(--pf-grey-900)',
              margin: 0,
            }}
          >
            No parents or guardians are linked to your account yet.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {activeLinks.map((l) => (
              <li
                key={l.link_id}
                className="flex items-start justify-between gap-3"
                style={{
                  padding: '12px 0',
                  borderTop: '1px solid var(--pf-grey-100)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                      color: 'var(--pf-grey-900)',
                      margin: 0,
                    }}
                  >
                    {l.full_name || 'Pending invite'}
                    {l.status === 'pending' && (
                      <span
                        style={{
                          marginLeft: '8px',
                          fontSize: '0.75rem',
                          color: 'var(--pf-amber-600, #b45309)',
                          fontWeight: 500,
                        }}
                      >
                        Pending
                      </span>
                    )}
                  </p>
                  {l.email && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                      {l.email}
                    </p>
                  )}
                  {l.linked_at && (
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--pf-grey-600)',
                        marginTop: '2px',
                      }}
                    >
                      Linked {new Date(l.linked_at).toLocaleDateString('en-GB')}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setRevokeTarget(l)}
                  className="pf-btn pf-btn-secondary pf-btn-sm"
                  style={{ flexShrink: 0 }}
                >
                  Revoke access
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        {code && inviteUrl ? (
          <div
            className="rounded-lg"
            style={{
              padding: '16px',
              backgroundColor: 'var(--pf-blue-50)',
              border: '1px solid var(--pf-blue-100)',
            }}
          >
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--pf-grey-600)',
                marginBottom: '10px',
              }}
            >
              Your invite is ready. Share the link below or send it by email. Valid for 7 days.
            </p>

            <div
              style={{
                padding: '10px 12px',
                backgroundColor: 'var(--pf-white)',
                border: '1px solid var(--pf-grey-200)',
                borderRadius: '8px',
                marginBottom: '10px',
                fontSize: '0.8125rem',
                color: 'var(--pf-grey-900)',
                wordBreak: 'break-all',
              }}
            >
              {inviteUrl}
            </div>

            <div className="flex flex-wrap gap-2" style={{ marginBottom: '12px' }}>
              <button type="button" onClick={handleCopyLink} className="pf-btn pf-btn-primary pf-btn-sm">
                Copy link
              </button>
              <button type="button" onClick={handleCopyCode} className="pf-btn pf-btn-secondary pf-btn-sm">
                Copy code ({code})
              </button>
            </div>

            <div style={{ marginTop: '4px' }}>
              <label htmlFor="parent-email" className="pf-label" style={{ fontSize: '0.8125rem' }}>
                Send invite by email
              </label>
              <div className="flex gap-2 mt-1 flex-wrap">
                <input
                  id="parent-email"
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="pf-input"
                  style={{ flex: '1 1 220px', minWidth: 0 }}
                  autoComplete="email"
                />
                <SubmitButton
                  onClick={handleSendEmail}
                  isLoading={sendEmail.isPending}
                  loadingText="Sending..."
                  variant="secondary"
                  disabled={!parentEmail}
                >
                  Send email
                </SubmitButton>
              </div>
              {emailError && (
                <p
                  role="alert"
                  style={{ fontSize: '0.75rem', color: 'var(--pf-red-500)', marginTop: '4px' }}
                >
                  {emailError}
                </p>
              )}
            </div>

            {codeExpiresAt && (
              <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)', marginTop: '10px' }}>
                Expires {codeExpiresAt.toLocaleString('en-GB')}
              </p>
            )}
          </div>
        ) : atLimit ? (
          <p
            className="rounded-lg"
            style={{
              padding: '12px 14px',
              backgroundColor: 'rgba(180, 83, 9, 0.08)',
              fontSize: '0.875rem',
              color: 'var(--pf-grey-900)',
              margin: 0,
            }}
          >
            You have reached the limit of 2 parent or guardian links. Revoke an existing one
            before generating a new invite.
          </p>
        ) : (
          <SubmitButton
            onClick={handleGenerate}
            isLoading={generate.isPending}
            loadingText="Generating..."
            variant="primary"
          >
            Generate invite link
          </SubmitButton>
        )}
      </div>

      {revokeTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="revoke-parent-title"
        >
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
            <h3
              id="revoke-parent-title"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '1.125rem',
                color: 'var(--pf-grey-900)',
                marginBottom: '10px',
              }}
            >
              Revoke access for {revokeTarget.full_name || 'this invite'}?
            </h3>
            <p style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-600)', marginBottom: '20px' }}>
              {revokeTarget.status === 'pending'
                ? 'This invite will be cancelled. Generate a new one to invite a different parent.'
                : `${revokeTarget.full_name || 'They'} will no longer be able to see your saved courses and progress. You can re-invite them later with a new code.`}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRevokeTarget(null)}
                disabled={revoke.isPending}
                className="flex-1 pf-btn pf-btn-secondary"
              >
                Cancel
              </button>
              <SubmitButton
                onClick={handleRevoke}
                isLoading={revoke.isPending}
                loadingText="Revoking..."
                variant="danger"
                className="flex-1"
              >
                Revoke access
              </SubmitButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
