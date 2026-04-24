import type { Metadata } from 'next'
import { getAnonSupabase } from '@/lib/supabase-public'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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

  const column = UUID_RE.test(sectorId) ? 'id' : 'slug'
  const { data } = await supabase
    .from('career_sectors')
    .select('name, slug')
    .eq(column, sectorId)
    .maybeSingle()

  if (!data) {
    return {
      title: 'Career sector not found',
      alternates: { canonical: `/careers/${sectorId}` },
    }
  }

  return {
    title: `${data.name} Careers`,
    alternates: { canonical: `/careers/${data.slug ?? sectorId}` },
  }
}

export default async function CareerSectorLayout({ children }: LayoutProps) {
  return <>{children}</>
}
