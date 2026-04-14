'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type AdminOffer = {
  id: string
  category_id: string
  title: string
  slug: string
  brand: string | null
  offer_type: string
  discount_text: string | null
  url: string | null
  affiliate_url: string | null
  promo_code: string | null
  is_featured: boolean
  featured_until: string | null
  is_active: boolean
  needs_review: boolean
  last_verified_at: string | null
  updated_at: string
  category: { id: string; name: string; slug: string; icon: string | null } | null
}

type CategoryOption = { id: string; name: string; slug: string }

type StatusFilter = 'all' | 'active' | 'inactive' | 'needs_review'

type ToastState = { type: 'success' | 'error'; message: string } | null

export default function OffersAdminClient({
  initialOffers,
  categories,
}: {
  initialOffers: AdminOffer[]
  categories: CategoryOption[]
}) {
  const router = useRouter()
  const [offers, setOffers] = useState<AdminOffer[]>(initialOffers)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [toast, setToast] = useState<ToastState>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [editing, setEditing] = useState<AdminOffer | null>(null)
  const [featurePrompt, setFeaturePrompt] = useState<AdminOffer | null>(null)
  const [, startTransition] = useTransition()

  const filtered = useMemo(() => {
    let list = offers
    if (statusFilter === 'active') list = list.filter((o) => o.is_active)
    else if (statusFilter === 'inactive') list = list.filter((o) => !o.is_active)
    else if (statusFilter === 'needs_review') list = list.filter((o) => o.needs_review)

    if (categoryFilter !== 'all') {
      list = list.filter((o) => o.category?.slug === categoryFilter)
    }

    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.slug.toLowerCase().includes(q) ||
          (o.brand ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [offers, search, categoryFilter, statusFilter])

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message })
    window.setTimeout(() => setToast(null), 3500)
  }

  function applyPatch(patch: Partial<AdminOffer>) {
    if (!patch.id) return
    setOffers((prev) => prev.map((o) => (o.id === patch.id ? { ...o, ...patch } : o)))
  }

  async function handleVerify(offer: AdminOffer) {
    setBusyId(offer.id)
    try {
      const res = await fetch(`/api/admin/offers/${offer.id}/verify`, { method: 'PUT' })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Verify failed')
      applyPatch({
        id: offer.id,
        last_verified_at: json.offer.last_verified_at,
        needs_review: json.offer.needs_review,
      })
      showToast('success', `"${offer.title}" marked verified`)
      startTransition(() => router.refresh())
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Verify failed')
    } finally {
      setBusyId(null)
    }
  }

  async function handleToggleActive(offer: AdminOffer) {
    const deactivating = offer.is_active
    if (deactivating && !window.confirm(`Deactivate "${offer.title}"? It will disappear from /offers.`)) {
      return
    }
    setBusyId(offer.id)
    try {
      const res = await fetch(`/api/admin/offers/${offer.id}/toggle-active`, { method: 'PUT' })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Toggle failed')
      applyPatch({ id: offer.id, is_active: json.offer.is_active })
      showToast('success', `${json.offer.is_active ? 'Activated' : 'Deactivated'} "${offer.title}"`)
      startTransition(() => router.refresh())
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Toggle failed')
    } finally {
      setBusyId(null)
    }
  }

  async function handleToggleFeatured(offer: AdminOffer, featuredUntil?: string | null) {
    setBusyId(offer.id)
    try {
      const body =
        !offer.is_featured && featuredUntil !== undefined
          ? JSON.stringify({ featured_until: featuredUntil })
          : JSON.stringify({})
      const res = await fetch(`/api/admin/offers/${offer.id}/toggle-featured`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Toggle featured failed')
      applyPatch({
        id: offer.id,
        is_featured: json.offer.is_featured,
        featured_until: json.offer.featured_until,
      })
      showToast(
        'success',
        `${json.offer.is_featured ? 'Featured' : 'Unfeatured'} "${offer.title}"`
      )
      setFeaturePrompt(null)
      startTransition(() => router.refresh())
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Toggle featured failed')
    } finally {
      setBusyId(null)
    }
  }

  function onFeatureClick(offer: AdminOffer) {
    if (offer.is_featured) {
      // Unfeaturing: no prompt
      handleToggleFeatured(offer)
    } else {
      setFeaturePrompt(offer)
    }
  }

  async function handleEditSave(values: {
    url: string
    affiliate_url: string
    promo_code: string
    discount_text: string
    is_active: boolean
    is_featured: boolean
    featured_until: string
  }) {
    if (!editing) return
    setBusyId(editing.id)
    try {
      const payload: Record<string, unknown> = {
        url: values.url.trim() || null,
        affiliate_url: values.affiliate_url.trim() || null,
        promo_code: values.promo_code.trim() || null,
        discount_text: values.discount_text.trim() || null,
        is_active: values.is_active,
        is_featured: values.is_featured,
        featured_until: values.featured_until.trim() || null,
      }
      const res = await fetch(`/api/admin/offers/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Save failed')
      applyPatch({ id: editing.id, ...json.offer })
      showToast('success', `Saved "${editing.title}"`)
      setEditing(null)
      startTransition(() => router.refresh())
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      {/* Filter bar */}
      <div
        className="pf-card mb-4"
        style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'end' }}
      >
        <label style={{ flex: '1 1 220px', minWidth: '180px' }}>
          <span
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: 'var(--pf-grey-600)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '4px',
            }}
          >
            Search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Title, slug, brand…"
            style={fieldStyle}
          />
        </label>
        <label style={{ minWidth: '180px' }}>
          <span style={labelStyle}>Category</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={fieldStyle}
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label style={{ minWidth: '160px' }}>
          <span style={labelStyle}>Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            style={fieldStyle}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="needs_review">Needs review</option>
          </select>
        </label>
        <div style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
          Showing {filtered.length} of {offers.length}
        </div>
      </div>

      {/* Table */}
      <div className="pf-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Category</Th>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th>Featured</Th>
              <Th>Last verified</Th>
              <Th style={{ textAlign: 'right' }}>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '20px', color: 'var(--pf-grey-600)' }}>
                  No offers match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id}>
                  <Td>
                    <div style={{ fontWeight: 600, color: 'var(--pf-grey-900)' }}>{o.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--pf-grey-600)' }}>
                      {o.brand ? `${o.brand} · ` : ''}
                      <code style={{ fontSize: '0.7rem' }}>{o.slug}</code>
                    </div>
                  </Td>
                  <Td>{o.category?.name ?? '—'}</Td>
                  <Td style={{ fontSize: '0.8125rem' }}>{o.offer_type.replace(/_/g, ' ')}</Td>
                  <Td>
                    <StatusDot offer={o} />
                  </Td>
                  <Td>
                    {o.is_featured ? (
                      <span style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}>
                        Yes{o.featured_until ? ` (until ${o.featured_until})` : ''}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--pf-grey-600)' }}>No</span>
                    )}
                  </Td>
                  <Td style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                    {o.last_verified_at ?? 'never'}
                  </Td>
                  <Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <ActionBtn onClick={() => handleVerify(o)} disabled={busyId === o.id}>
                      Mark verified
                    </ActionBtn>
                    <ActionBtn onClick={() => handleToggleActive(o)} disabled={busyId === o.id}>
                      {o.is_active ? 'Deactivate' : 'Reactivate'}
                    </ActionBtn>
                    <ActionBtn onClick={() => onFeatureClick(o)} disabled={busyId === o.id}>
                      {o.is_featured ? 'Unfeature' : 'Feature'}
                    </ActionBtn>
                    <ActionBtn onClick={() => setEditing(o)} disabled={busyId === o.id} primary>
                      Edit
                    </ActionBtn>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 60,
            padding: '12px 16px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.875rem',
            background:
              toast.type === 'success' ? 'var(--pf-green-500)' : 'var(--pf-red-500)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Feature prompt modal */}
      {featurePrompt && (
        <FeaturePromptModal
          offer={featurePrompt}
          onCancel={() => setFeaturePrompt(null)}
          onConfirm={(until) => handleToggleFeatured(featurePrompt, until)}
          busy={busyId === featurePrompt.id}
        />
      )}

      {/* Edit modal */}
      {editing && (
        <EditOfferModal
          offer={editing}
          onCancel={() => setEditing(null)}
          onSave={handleEditSave}
          busy={busyId === editing.id}
        />
      )}
    </div>
  )
}

// -------- small building blocks --------

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  color: 'var(--pf-grey-600)',
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: '4px',
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid var(--pf-grey-300)',
  borderRadius: '6px',
  fontSize: '0.875rem',
  background: 'white',
  color: 'var(--pf-grey-900)',
}

function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th
      style={{
        textAlign: 'left',
        padding: '12px 16px',
        borderBottom: '1px solid var(--pf-grey-300)',
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 600,
        color: 'var(--pf-grey-600)',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        background: 'var(--pf-grey-100)',
        ...style,
      }}
    >
      {children}
    </th>
  )
}

function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--pf-grey-100)',
        color: 'var(--pf-grey-900)',
        verticalAlign: 'top',
        ...style,
      }}
    >
      {children}
    </td>
  )
}

function StatusDot({ offer }: { offer: AdminOffer }) {
  // Priority: inactive (red) > needs_review (amber) > active (green)
  let colour = 'var(--pf-green-500)'
  let label = 'Active'
  if (!offer.is_active) {
    colour = 'var(--pf-red-500)'
    label = 'Inactive'
  } else if (offer.needs_review) {
    colour = 'var(--pf-amber-500)'
    label = 'Needs review'
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <span
        aria-hidden
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: colour,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: '0.8125rem' }}>{label}</span>
    </span>
  )
}

function ActionBtn({
  children,
  onClick,
  disabled,
  primary,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  primary?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        fontSize: '0.75rem',
        padding: '4px 10px',
        marginLeft: '4px',
        borderRadius: '6px',
        border: '1px solid ' + (primary ? 'var(--pf-blue-700)' : 'var(--pf-grey-300)'),
        background: primary ? 'var(--pf-blue-700)' : 'white',
        color: primary ? 'white' : 'var(--pf-grey-900)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        fontWeight: 600,
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {children}
    </button>
  )
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div
      role="dialog"
      aria-modal
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--pf-grey-600)',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function FeaturePromptModal({
  offer,
  onCancel,
  onConfirm,
  busy,
}: {
  offer: AdminOffer
  onCancel: () => void
  onConfirm: (until: string | null) => void
  busy: boolean
}) {
  const [until, setUntil] = useState('')
  return (
    <ModalShell title={`Feature "${offer.title}"`} onClose={onCancel}>
      <p style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginBottom: '16px' }}>
        Featured offers appear at the top of <code>/offers</code>. Optionally set an end date — leave
        blank to feature indefinitely.
      </p>
      <label style={{ display: 'block', marginBottom: '16px' }}>
        <span style={labelStyle}>Featured until</span>
        <input
          type="date"
          value={until}
          onChange={(e) => setUntil(e.target.value)}
          style={fieldStyle}
        />
      </label>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <ActionBtn onClick={onCancel} disabled={busy}>
          Cancel
        </ActionBtn>
        <ActionBtn onClick={() => onConfirm(until || null)} disabled={busy} primary>
          {busy ? 'Saving…' : 'Feature offer'}
        </ActionBtn>
      </div>
    </ModalShell>
  )
}

function EditOfferModal({
  offer,
  onCancel,
  onSave,
  busy,
}: {
  offer: AdminOffer
  onCancel: () => void
  onSave: (values: {
    url: string
    affiliate_url: string
    promo_code: string
    discount_text: string
    is_active: boolean
    is_featured: boolean
    featured_until: string
  }) => void
  busy: boolean
}) {
  const [url, setUrl] = useState(offer.url ?? '')
  const [affiliateUrl, setAffiliateUrl] = useState(offer.affiliate_url ?? '')
  const [promoCode, setPromoCode] = useState(offer.promo_code ?? '')
  const [discountText, setDiscountText] = useState(offer.discount_text ?? '')
  const [isActive, setIsActive] = useState(offer.is_active)
  const [isFeatured, setIsFeatured] = useState(offer.is_featured)
  const [featuredUntil, setFeaturedUntil] = useState(offer.featured_until ?? '')

  return (
    <ModalShell title={`Edit "${offer.title}"`} onClose={onCancel}>
      <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginBottom: '16px' }}>
        Only quick-edit fields here. Use Supabase Studio for description, eligibility, category, etc.
      </p>

      <Field label="URL">
        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} style={fieldStyle} />
      </Field>
      <Field label="Affiliate URL">
        <input
          type="url"
          value={affiliateUrl}
          onChange={(e) => setAffiliateUrl(e.target.value)}
          style={fieldStyle}
        />
      </Field>
      <Field label="Promo code">
        <input
          type="text"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          style={fieldStyle}
        />
      </Field>
      <Field label="Discount text">
        <input
          type="text"
          value={discountText}
          onChange={(e) => setDiscountText(e.target.value)}
          style={fieldStyle}
          placeholder="e.g. 10% off or £5 off"
        />
      </Field>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
        <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <span style={{ fontSize: '0.875rem' }}>Active</span>
        </label>
        <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
          />
          <span style={{ fontSize: '0.875rem' }}>Featured</span>
        </label>
      </div>

      <Field label="Featured until (optional)">
        <input
          type="date"
          value={featuredUntil}
          onChange={(e) => setFeaturedUntil(e.target.value)}
          style={fieldStyle}
          disabled={!isFeatured}
        />
      </Field>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
        <ActionBtn onClick={onCancel} disabled={busy}>
          Cancel
        </ActionBtn>
        <ActionBtn
          onClick={() =>
            onSave({
              url,
              affiliate_url: affiliateUrl,
              promo_code: promoCode,
              discount_text: discountText,
              is_active: isActive,
              is_featured: isFeatured,
              featured_until: isFeatured ? featuredUntil : '',
            })
          }
          disabled={busy}
          primary
        >
          {busy ? 'Saving…' : 'Save changes'}
        </ActionBtn>
      </div>
    </ModalShell>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: '12px' }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  )
}
