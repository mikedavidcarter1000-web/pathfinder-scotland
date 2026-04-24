import type { Metadata } from 'next'
import { getAnonSupabase } from '@/lib/supabase-public'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = getAnonSupabase()
  if (!supabase) return { title: 'University', alternates: { canonical: `/universities/${id}` } }

  const column = UUID_RE.test(id) ? 'id' : 'slug'
  const { data } = await supabase
    .from('universities')
    .select('name, slug')
    .eq(column, id)
    .maybeSingle()

  if (!data) {
    return { title: 'University not found', alternates: { canonical: `/universities/${id}` } }
  }

  return {
    title: data.name ?? 'University',
    alternates: { canonical: `/universities/${data.slug ?? id}` },
  }
}

export default async function UniversityLayout({ children }: LayoutProps) {
  return <>{children}</>
}
