import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import type {
  BlogArticle,
  BlogCategory,
  BlogFrontmatter,
  RenderedBlogArticle,
  TocEntry,
} from './blog-shared'

export {
  BLOG_CATEGORIES,
  categoryColour,
  formatDisplayDate,
} from './blog-shared'
export type {
  BlogArticle,
  BlogCategory,
  BlogFrontmatter,
  RenderedBlogArticle,
  TocEntry,
} from './blog-shared'

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

function readBlogDir(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
}

function parseFile(fileName: string): BlogArticle {
  const filePath = path.join(BLOG_DIR, fileName)
  const raw = fs.readFileSync(filePath, 'utf8')
  const parsed = matter(raw)
  const data = parsed.data as Partial<BlogFrontmatter>

  const slug = (data.slug ?? fileName.replace(/\.(md|mdx)$/, '')).trim()

  return {
    title: data.title ?? 'Untitled',
    slug,
    description: data.description ?? '',
    author: data.author ?? 'Pathfinder Scotland',
    date: data.date ?? '2026-01-01',
    updated: data.updated ?? data.date ?? '2026-01-01',
    category: (data.category as BlogCategory) ?? 'University',
    tags: Array.isArray(data.tags) ? data.tags : [],
    featured: Boolean(data.featured),
    readingTime: typeof data.readingTime === 'number' ? data.readingTime : estimateReadingTime(parsed.content),
    filePath,
    rawContent: parsed.content,
  }
}

function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 220))
}

export function getArticles(): BlogArticle[] {
  return readBlogDir()
    .map(parseFile)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getArticleSlugs(): string[] {
  return readBlogDir().map((f) => parseFile(f).slug)
}

export function getArticlesByCategory(category: BlogCategory): BlogArticle[] {
  return getArticles().filter((a) => a.category === category)
}

export function getRelatedArticles(slug: string, category: BlogCategory, limit = 3): BlogArticle[] {
  const sameCategory = getArticles().filter((a) => a.slug !== slug && a.category === category)
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit)
  const others = getArticles().filter((a) => a.slug !== slug && a.category !== category)
  return [...sameCategory, ...others].slice(0, limit)
}

export function getNextArticle(slug: string): BlogArticle | null {
  const all = getArticles()
  const idx = all.findIndex((a) => a.slug === slug)
  if (idx === -1) return null
  const next = all[idx + 1] ?? all[0]
  return next && next.slug !== slug ? next : null
}

export async function getArticleBySlug(slug: string): Promise<RenderedBlogArticle | null> {
  const article = getArticles().find((a) => a.slug === slug)
  if (!article) return null

  // Extend the default GitHub-style sanitisation schema to allow heading IDs
  // (needed by rehype-slug) and the CSS class used by rehype-autolink-headings.
  const sanitizeSchema = {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      '*': [...(defaultSchema.attributes?.['*'] || []), 'id', 'className'],
      a: [...(defaultSchema.attributes?.['a'] || []), 'target', 'rel'],
    },
  }

  const processed = await remark()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'wrap',
      properties: { className: ['pf-blog-heading-link'] },
    })
    .use(rehypeExternalLinks, {
      target: '_blank',
      rel: ['noopener', 'noreferrer'],
      protocols: ['http', 'https'],
    })
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify)
    .process(article.rawContent)

  return {
    ...article,
    html: String(processed),
    toc: extractToc(article.rawContent),
  }
}

export function extractToc(markdown: string): TocEntry[] {
  const lines = markdown.split('\n')
  const entries: TocEntry[] = []
  let inCodeBlock = false

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue

    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line)
    if (!match) continue
    const level = match[1].length
    const text = match[2].replace(/[*_`]/g, '').trim()
    entries.push({ id: slugify(text), text, level })
  }

  return entries
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
}
