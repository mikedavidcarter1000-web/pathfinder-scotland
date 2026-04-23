import type { Metadata } from 'next'
import { getAnonSupabase } from '@/lib/supabase-public'

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

  const { data } = await supabase
    .from('subjects')
    .select('name')
    .eq('id', id)
    .maybeSingle()

  if (!data) {
    return { title: 'Subject not found', alternates: { canonical: `/subjects/${id}` } }
  }

  return {
    title: data.name ?? 'Subject',
    alternates: { canonical: `/subjects/${id}` },
  }
}

export default async function SubjectLayout({ children }: LayoutProps) {
  return <>{children}</>
}
