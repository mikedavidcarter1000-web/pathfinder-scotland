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
  if (!supabase) return { title: 'University', alternates: { canonical: `/universities/${id}` } }

  const { data } = await supabase
    .from('universities')
    .select('name')
    .eq('id', id)
    .maybeSingle()

  if (!data) {
    return { title: 'University not found', alternates: { canonical: `/universities/${id}` } }
  }

  return {
    title: data.name ?? 'University',
    alternates: { canonical: `/universities/${id}` },
  }
}

export default async function UniversityLayout({ children }: LayoutProps) {
  return <>{children}</>
}
