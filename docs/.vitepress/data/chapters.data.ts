import { createContentLoader } from 'vitepress'

export interface ChapterItem {
  slug: string
  url: string
  frontmatter: Record<string, any>
}

export default createContentLoader<ChapterItem[]>('projects/**/*.md', {
  transform(data) {
    return data
      .filter((item) => item.frontmatter.type === 'project-chapter' && item.frontmatter.draft !== true)
      .map((item) => ({
        slug: item.url.split('/').filter(Boolean).at(-1) ?? '',
        url: item.url,
        frontmatter: item.frontmatter,
      }))
      .sort((a, b) => Number(a.frontmatter.order ?? 999) - Number(b.frontmatter.order ?? 999))
  },
})
