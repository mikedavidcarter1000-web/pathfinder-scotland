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
  if (!supabase) return { title: 'College', alternates: { canonical: `/colleges/${id}` } }

  const { data } = await supabase
    .from('colleges')
    .select('name')
    .eq('id', id)
    .maybeSingle()

  if (!data) {
    return { title: 'College not found', alternates: { canonical: `/colleges/${id}` } }
  }

  return {
    title: data.name ?? 'College',
    alternates: { canonical: `/colleges/${id}` },
  }
}

export default async function CollegeLayout({ children }: LayoutProps) {
  return <>{children}</>
}
