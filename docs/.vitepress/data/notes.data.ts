import { createContentLoader } from 'vitepress'

export interface NoteItem {
  slug: string
  url: string
  frontmatter: Record<string, any>
  excerpt?: string
}

export default createContentLoader<NoteItem[]>('notes/**/*.md', {
  excerpt: true,
  transform(data) {
    return data
      .filter((item) => item.frontmatter.type === 'note' && item.frontmatter.draft !== true)
      .map((item) => ({
        slug: item.url.split('/').filter(Boolean).at(-1) ?? '',
        url: item.url,
        frontmatter: item.frontmatter,
        excerpt: item.excerpt,
      }))
      .sort((a, b) => Number(a.frontmatter.order ?? 999) - Number(b.frontmatter.order ?? 999))
  },
})
