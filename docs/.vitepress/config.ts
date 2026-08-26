import { defineConfig } from 'vitepress'
import { defineTeekConfig } from 'vitepress-theme-teek/config'
import { discoverProjects, discoverProjectChapters, discoverNotes } from './utils/content-discovery'

const projects = discoverProjects()
const notes = discoverNotes()

const teekConfig = defineTeekConfig({
  themeConfig: {
    outline: [2, 3],
    search: { provider: 'local' },
    sidebar: {},
  },
})

export default defineConfig({
  ...teekConfig,
  server: {
    port: 5174,
    strictPort: true,
  },
  lang: 'zh-CN',
  title: 'Xerina Atlas',
  description: '江科萱的个人作品集、项目解析与技术知识库。',
  cleanUrls: true,
  appearance: false,
  lastUpdated: true,
  srcExclude: [
    'README.md',
    '**/TODO.md',
    '**/*.draft.md',
    // 防御性排除：确保 VitePress 不会把这些非内容目录视为内容页/侧栏项
    '**/assets/**',
    '**/images/**',
    '**/assert/**',
    '**/attachments/**',
    'content-drafts/**',
    'content-templates/**',
    'content-sources/**',
  ],
  ignoreDeadLinks: false,
  head: [
    ['meta', { name: 'theme-color', content: '#f7fafc' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/brand/xerina-avatar.png' }],
  ],
  themeConfig: {
    ...teekConfig.themeConfig,
    // Use the site-wide double-click lightbox so project docs and articles behave the same.
    articleAnalyze: { imageViewer: { enabled: false } },
    nav: [
      { text: '首页', link: '/' },
      { text: '实习经历', link: '/experience/' },
      { text: '项目经历', link: '/projects/' },
      { text: '作品集', link: '/portfolio/' },
      {
        text: '项目文档',
        items: projects.filter((project) => project.frontmatter.nav !== false).map((project) => ({
          text: project.frontmatter.title,
          link: project.url,
        })),
      },
      { text: '文章', link: '/notes/' },
      { text: '关于', link: '/about/' },
    ],
    sidebar: {
      // 显式控制 notes 侧栏：只显示 discoverNotes() 发现的笔记，
      // 避免 VitePress 自动扫描子目录（如 assets / images）误生成目录项。
      '/notes/': [
        {
          text: '技术文章',
          items: [
            { text: '文章首页', link: '/notes/' },
            ...notes
              .slice()
              .sort((a, b) => (a.frontmatter.order ?? 999) - (b.frontmatter.order ?? 999))
              .map((note) => ({
                text: note.frontmatter.title,
                link: note.url,
              })),
          ],
        },
      ],
      ...Object.fromEntries(
        projects.map((project) => [
          project.url,
          [
            {
              text: project.frontmatter.title,
              items: [
                { text: '项目总览', link: project.url },
                ...discoverProjectChapters(project.slug).map((chapter) => ({
                  text: chapter.frontmatter.title,
                  link: chapter.url,
                })),
              ],
            },
          ],
        ]),
      ),
    },
    footer: {
      message: '内容驱动的个人作品集与知识库',
      copyright: 'Copyright © 2026 Xerina',
    },
  },
})
