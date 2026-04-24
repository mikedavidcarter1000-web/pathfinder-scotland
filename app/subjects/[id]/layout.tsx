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
  if (!supabase) return { title: 'Subject', alternates: { canonical: `/subjects/${id}` } }

  const column = UUID_RE.test(id) ? 'id' : 'slug'
  const { data } = await supabase
    .from('subjects')
    .select('name, slug')
    .eq(column, id)
    .maybeSingle()

  if (!data) {
    return { title: 'Subject not found', alternates: { canonical: `/subjects/${id}` } }
  }

  return {
    title: data.name ?? 'Subject',
    alternates: { canonical: `/subjects/${data.slug ?? id}` },
  }
}

export default async function SubjectLayout({ children }: LayoutProps) {
  return <>{children}</>
}
