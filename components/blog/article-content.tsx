export function ArticleContent({ html }: { html: string }) {
  return (
    <article
      className="pf-blog-content"
      style={{ maxWidth: '720px', minWidth: 0 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
