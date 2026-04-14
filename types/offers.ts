export type OfferType =
  | 'entitlement'
  | 'free_resource'
  | 'general_discount'
  | 'affiliate'
  | 'exclusive'
  | 'sponsored'
  | 'general'

export type ClickType =
  | 'outbound'
  | 'save'
  | 'unsave'
  | 'detail_view'
  | 'copy_code'

export type SupportGroup =
  | 'young-carers'
  | 'estranged-students'
  | 'young-parents'
  | 'refugees-asylum-seekers'
  | 'esol-eal'
  | 'disability'
  | 'lgbtq'
  | 'mature-students'
  | 'grt'
  | 'home-educated'
  | 'early-leavers'
  | 'rural-island'
  | 'care-experienced'

export type ChecklistCategory = 'finance' | 'health' | 'housing' | 'admin' | 'tech'

export interface OfferCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  display_order: number
  created_at: string
}

export interface Offer {
  id: string
  category_id: string
  title: string
  slug: string
  summary: string | null
  description: string | null
  brand: string | null
  offer_type: OfferType
  discount_text: string | null
  url: string | null
  affiliate_url: string | null
  promo_code: string | null
  min_age: number | null
  max_age: number | null
  eligible_stages: string[]
  scotland_only: boolean
  requires_young_scot: boolean
  requires_totum: boolean
  requires_unidays: boolean
  requires_student_beans: boolean
  verification_method: string | null
  locations: string[]
  university_specific: string[]
  seasonal_tags: string[]
  active_from: string | null
  active_until: string | null
  partner_id: string | null
  is_featured: boolean
  featured_until: string | null
  affiliate_network: string | null
  commission_type: string | null
  commission_value: number | null
  cookie_days: number | null
  last_verified_at: string | null
  verified_by: string | null
  is_active: boolean
  needs_review: boolean
  image_url: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface OfferWithCategory extends Offer {
  category: Pick<OfferCategory, 'id' | 'name' | 'slug' | 'icon'> | null
  is_saved?: boolean
}

export interface OfferDetail extends OfferWithCategory {
  support_groups: SupportGroup[]
}

export interface OfferClick {
  id: string
  offer_id: string
  student_id: string | null
  click_type: ClickType
  referrer_page: string | null
  session_id: string | null
  created_at: string
}

export interface SavedOffer {
  student_id: string
  offer_id: string
  created_at: string
}

export interface ChecklistItem {
  id: string
  title: string
  description: string | null
  category: ChecklistCategory
  linked_offer_id: string | null
  url: string | null
  display_order: number
  is_active: boolean
}

export interface ChecklistItemWithProgress extends ChecklistItem {
  completed: boolean
  completed_at: string | null
}

export interface ChecklistProgress {
  student_id: string
  checklist_item_id: string
  completed_at: string
}

// -----------------------------
// API response shapes
// -----------------------------

export interface OffersListResponse {
  offers: OfferWithCategory[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface OfferDetailResponse {
  offer: OfferDetail
  related: OfferWithCategory[]
}

export interface OfferClickResponse {
  success: boolean
  url?: string
}

export interface SaveOfferResponse {
  saved: boolean
}

export interface SavedOffersResponse {
  offers: OfferWithCategory[]
}

export interface ChecklistResponse {
  items: ChecklistItemWithProgress[]
  completed_count: number
  total_count: number
}

export interface ChecklistProgressResponse {
  checklist_item_id: string
  completed: boolean
  completed_count: number
  total_count: number
}
