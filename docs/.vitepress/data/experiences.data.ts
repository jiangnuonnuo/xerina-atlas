import { createContentLoader } from 'vitepress'

export interface ExperienceItem {
  slug: string
  url: string
  frontmatter: Record<string, any>
  excerpt?: string
}

export default createContentLoader<ExperienceItem[]>('experience/*/index.md', {
  excerpt: true,
  transform(data) {
    return data
      .filter((item) => item.frontmatter.type === 'experience' && item.frontmatter.draft !== true)
      .map((item) => ({
        slug: item.url.split('/').filter(Boolean).at(-1) ?? '',
        url: item.url,
        frontmatter: item.frontmatter,
        excerpt: item.excerpt,
      }))
      .sort((a, b) => Number(a.frontmatter.order ?? 999) - Number(b.frontmatter.order ?? 999))
  },
})
