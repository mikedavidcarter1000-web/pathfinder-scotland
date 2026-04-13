'use client'

import { useState } from 'react'
import {
  useLinkedParents,
  useGenerateParentInviteCode,
  useRevokeParentLink,
  type LinkedParent,
} from '@/hooks/use-parent-link'
import { SubmitButton } from '@/components/ui/submit-button'
import { useToast } from '@/components/ui/toast'

export function ParentAccessSection() {
  const { data: links, isLoading } = useLinkedParents()
  const generate = useGenerateParentInviteCode()
  const revoke = useRevokeParentLink()
  const toast = useToast()

  const [code, setCode] = useState<string | null>(null)
  const [codeExpiresAt, setCodeExpiresAt] = useState<Date | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<LinkedParent | null>(null)

  const handleGenerate = async () => {
    try {
      const result = await generate.mutateAsync()
      setCode(result.code)
      setCodeExpiresAt(new Date(Date.now() + result.expires_in_hours * 3600_000))
      toast.success('Invite code ready', 'Share it with your parent or guardian.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not generate code.'
      toast.error("Couldn't generate code", msg)
    }
  }

  const handleCopy = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      toast.success('Copied', 'Invite code copied to your clipboard.')
    } catch {
      toast.info('Copy this code', code)
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
          Parent / guardian access
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginTop: '4px' }}>
          Let a parent or guardian view your saved courses, grades, and progress. They
          cannot edit anything. You can revoke access at any time.
        </p>
      </div>

      {/* Currently linked parents */}
      <div style={{ marginBottom: '16px' }}>
        {isLoading ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)' }}>Loading…</p>
        ) : !links || links.length === 0 ? (
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
            {links.map((l) => (
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
                    {l.full_name}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                    {l.email}
                  </p>
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

      {/* Generate new code */}
      <div>
        {code ? (
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
                marginBottom: '6px',
              }}
            >
              Share this invite code with your parent or guardian. They enter it on their
              dashboard to link to your account. Valid for 48 hours.
            </p>
            <div className="flex items-center gap-3" style={{ marginBottom: '10px' }}>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--pf-blue-900)',
                  letterSpacing: '0.08em',
                }}
              >
                {code}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="pf-btn pf-btn-secondary pf-btn-sm"
              >
                Copy
              </button>
            </div>
            {codeExpiresAt && (
              <p style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}>
                Expires {codeExpiresAt.toLocaleString('en-GB')}
              </p>
            )}
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--pf-grey-600)',
                marginTop: '8px',
              }}
            >
              Want a different code? Click &ldquo;Generate invite code&rdquo; again to
              create a fresh one.
            </p>
          </div>
        ) : (
          <SubmitButton
            onClick={handleGenerate}
            isLoading={generate.isPending}
            loadingText="Generating..."
            variant="secondary"
          >
            Generate invite code
          </SubmitButton>
        )}
      </div>

      {/* Revoke confirmation dialog */}
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
              Revoke access for {revokeTarget.full_name}?
            </h3>
            <p style={{ fontSize: '0.9375rem', color: 'var(--pf-grey-600)', marginBottom: '20px' }}>
              {revokeTarget.full_name} will no longer be able to see your saved courses and
              progress. You can re-invite them later with a new code.
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
