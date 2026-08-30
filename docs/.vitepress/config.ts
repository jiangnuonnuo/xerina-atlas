import { defineConfig } from 'vitepress'
import { defineTeekConfig } from 'vitepress-theme-teek/config'

const teekConfig = defineTeekConfig({
  themeConfig: {
    outline: [2, 3],
    search: { provider: 'local' },
    sidebar: {},
  },
})

export default defineConfig({
  ...teekConfig,
  vite: {
    ssr: {
      noExternal: ['vitepress-theme-teek'],
    },
    server: {
      port: 5174,
      strictPort: true,
      proxy: {
        '/api/v1': {
          target: process.env.KNOWLEDGE_API_PROXY_TARGET || 'http://127.0.0.1:8091',
          changeOrigin: true,
        },
      },
    },
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
  ],
  transformHead({ page }) {
    const depth = page.split('/').length - 1
    const prefix = depth ? '../'.repeat(depth) : './'
    return [['link', { rel: 'icon', type: 'image/png', href: `${prefix}brand/xerina-avatar.png` }]]
  },
  transformHtml(code, _id, { page }) {
    const depth = page.split('/').length - 1
    const prefix = depth ? '../'.repeat(depth) : './'
    return code.replace(/(\b(?:href|src|poster)=["'])\/(?!\/)/g, `$1${prefix}`)
  },
  themeConfig: {
    ...teekConfig.themeConfig,
    // Use the site-wide double-click lightbox so project docs and articles behave the same.
    articleAnalyze: { imageViewer: { enabled: false } },
    nav: [],
    sidebar: {},
    footer: {
      message: '内容驱动的个人作品集与知识库',
      copyright: 'Copyright © 2026 Xerina',
    },
  },
})
