import { createContentLoader } from 'vitepress'

export default createContentLoader<Record<string, any>>('about/index.md', {
  transform(data) {
    return data[0]?.frontmatter ?? {}
  },
})
