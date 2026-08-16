import { defineConfig } from 'vitepress'
import { defineTeekConfig } from 'vitepress-theme-teek/config'
import { discoverProjects, discoverProjectChapters } from './utils/content-discovery'

const projects = discoverProjects()

const teekConfig = defineTeekConfig({
  themeConfig: {
    outline: [2, 3],
    search: { provider: 'local' },
    sidebar: {},
  },
})

export default defineConfig({
  ...teekConfig,
  lang: 'zh-CN',
  title: 'Xerina Atlas',
  description: '江科萱的个人作品集、项目解析与技术知识库。',
  cleanUrls: true,
  appearance: false,
  lastUpdated: true,
  srcExclude: ['README.md', '**/TODO.md', '**/*.draft.md'],
  ignoreDeadLinks: false,
  head: [
    ['meta', { name: 'theme-color', content: '#f7fafc' }],
    ['link', { rel: 'icon', href: '/brand/favicon.svg' }],
  ],
  themeConfig: {
    ...teekConfig.themeConfig,
    nav: [
      { text: '首页', link: '/' },
      { text: '实习经历', link: '/experience/' },
      { text: '项目经历', link: '/projects/' },
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
    sidebar: Object.fromEntries(
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
    footer: {
      message: '内容驱动的个人作品集与知识库',
      copyright: 'Copyright © 2026 Xerina',
    },
  },
})
