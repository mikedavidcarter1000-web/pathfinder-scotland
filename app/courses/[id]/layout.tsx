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
  if (!supabase) return { title: 'Course', alternates: { canonical: `/courses/${id}` } }

  const column = UUID_RE.test(id) ? 'id' : 'slug'
  const { data } = await supabase
    .from('courses')
    .select('name, slug, university:universities(name)')
    .eq(column, id)
    .maybeSingle()

  if (!data) {
    return { title: 'Course not found', alternates: { canonical: `/courses/${id}` } }
  }

  const courseName = data.name ?? 'Course'
  const uni = (data.university as { name?: string } | null)?.name
  const title = uni ? `${courseName} at ${uni}` : courseName

  return {
    title,
    alternates: { canonical: `/courses/${data.slug ?? id}` },
  }
}

export default async function CourseLayout({ children }: LayoutProps) {
  return <>{children}</>
}
