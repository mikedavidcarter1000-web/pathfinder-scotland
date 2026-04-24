'use client'

import { useEffect, useState } from 'react'
import { UpgradePrompt } from './upgrade-prompt'
import type { DashboardMe } from './types'

// Wraps a premium-only page. Fetches /api/school/me once, inspects the
// subscription tier, and either renders the children (premium / trial /
// authority tier) or the upgrade prompt (standard tier).
//
// Trial schools see all features -- they're evaluating the whole product.
export function PremiumGate({
  featureName,
  description,
  children,
}: {
  featureName: string
  description?: string
  children: React.ReactNode
}) {
  const [me, setMe] = useState<DashboardMe | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/school/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMe(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="pf-container pt-8 pb-12"><p>Loading…</p></div>
  }
  if (!me?.school) return <>{children}</>

  const tier = me.school.subscription_tier ?? 'trial'
  const canAccess = tier === 'trial' || tier === 'premium' || tier === 'authority'

  if (!canAccess) {
    return <UpgradePrompt featureName={featureName} description={description} />
  }

  return <>{children}</>
}
