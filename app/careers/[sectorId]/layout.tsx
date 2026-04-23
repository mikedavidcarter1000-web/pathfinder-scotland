import type { Metadata } from 'next'
import { getAnonSupabase } from '@/lib/supabase-public'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ sectorId: string }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sectorId: string }>
}): Promise<Metadata> {
  const { sectorId } = await params
  const supabase = getAnonSupabase()
  if (!supabase) {
    return {
      title: 'Career sector',
      alternates: { canonical: `/careers/${sectorId}` },
    }
  }

  const { data } = await supabase
    .from('career_sectors')
    .select('name')
    .eq('id', sectorId)
    .maybeSingle()

  if (!data) {
    return {
      title: 'Career sector not found',
      alternates: { canonical: `/careers/${sectorId}` },
    }
  }

  return {
    title: `${data.name} Careers`,
    alternates: { canonical: `/careers/${sectorId}` },
  }
}

export default async function CareerSectorLayout({ children }: LayoutProps) {
  return <>{children}</>
}
