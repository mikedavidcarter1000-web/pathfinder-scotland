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
  if (!supabase) return { title: 'Course', alternates: { canonical: `/courses/${id}` } }

  const { data } = await supabase
    .from('courses')
    .select('name, university:universities(name)')
    .eq('id', id)
    .maybeSingle()

  if (!data) {
    return { title: 'Course not found', alternates: { canonical: `/courses/${id}` } }
  }

  const courseName = data.name ?? 'Course'
  const uni = (data.university as { name?: string } | null)?.name
  const title = uni ? `${courseName} at ${uni}` : courseName

  return {
    title,
    alternates: { canonical: `/courses/${id}` },
  }
}

export default async function CourseLayout({ children }: LayoutProps) {
  return <>{children}</>
}
