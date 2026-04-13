export type BlogCategory =
  | 'Subject Choices'
  | 'Widening Access'
  | 'University'
  | 'Careers'
  | 'AI & Future'
  | 'Parents'
  | 'News'

export const BLOG_CATEGORIES: BlogCategory[] = [
  'Subject Choices',
  'Widening Access',
  'University',
  'Careers',
  'AI & Future',
  'Parents',
  'News',
]

export interface BlogFrontmatter {
  title: string
  slug: string
  description: string
  author: string
  date: string
  updated: string
  category: BlogCategory
  tags: string[]
  featured: boolean
  readingTime: number
}

export interface BlogArticle extends BlogFrontmatter {
  filePath: string
  rawContent: string
}

export interface TocEntry {
  id: string
  text: string
  level: number
}

export interface RenderedBlogArticle extends BlogArticle {
  html: string
  toc: TocEntry[]
}

export function categoryColour(category: BlogCategory): { bg: string; fg: string } {
  switch (category) {
    case 'Subject Choices':
      return { bg: 'rgba(99, 102, 241, 0.12)', fg: '#4338CA' }
    case 'Widening Access':
      return { bg: 'rgba(245, 158, 11, 0.12)', fg: '#B45309' }
    case 'University':
      return { bg: 'rgba(0, 114, 206, 0.12)', fg: '#005EB8' }
    case 'Careers':
      return { bg: 'rgba(20, 184, 166, 0.12)', fg: '#0F766E' }
    case 'AI & Future':
      return { bg: 'rgba(139, 92, 246, 0.12)', fg: '#6D28D9' }
    case 'Parents':
      return { bg: 'rgba(244, 63, 94, 0.12)', fg: '#BE123C' }
    case 'News':
      return { bg: 'rgba(100, 116, 139, 0.12)', fg: '#475569' }
    default:
      return { bg: 'var(--pf-blue-100)', fg: 'var(--pf-blue-700)' }
  }
}

export function formatDisplayDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}
