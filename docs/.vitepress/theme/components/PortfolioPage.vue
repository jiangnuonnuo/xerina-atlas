<script setup lang="ts">
import { data as profile } from '../../data/profile.data'
import { useRoute } from 'vitepress'
import ItemIcon from './ItemIcon.vue'
import { relativeUrl } from '../utils/relative-url'

const route = useRoute()

function url(path: string) {
  return relativeUrl(path, route.path)
}

function honorText(honor: unknown) {
  if (typeof honor === 'string') return honor
  if (honor && typeof honor === 'object' && 'title' in honor) return String(honor.title)
  return String(honor ?? '')
}

function honorYear(honor: unknown) {
  return honorText(honor).match(/20\d{2}/)?.[0] || 'HONOR'
}

interface PortfolioItem {
  title: string
  url: string
  displayUrl: string
  image: string
  badgeIcon: string
  badgeLabel: string
  tags: string[]
  summary: string
  status: string
  actionLabel: string
  attribution?: string
}

const portfolioItems: PortfolioItem[] = [
  {
    title: 'AI MCP Gateway',
    url: 'http://123.207.10.5:8088/',
    displayUrl: '123.207.10.5:8088',
    image: '/media/portfolio/ai-mcp-gateway.webp',
    badgeIcon: 'server-cog',
    badgeLabel: '在线项目',
    tags: ['Java', 'Spring Boot', 'MCP', 'DDD'],
    summary: '面向企业能力治理的 MCP 网关：HTTP/OpenAPI、MySQL、Redis 与上游 MCP 接入，能力包发布与 Streamable HTTP 会话，支持 LLM 工具调用与多层隔离。',
    status: 'LIVE ↗',
    actionLabel: '立即体验',
  },
  {
    title: 'AI OfficePal',
    url: 'http://123.207.10.5/',
    displayUrl: '123.207.10.5',
    image: '/media/portfolio/ai-officepal.webp',
    badgeIcon: 'workflow',
    badgeLabel: '在线项目',
    tags: ['AI 应用', 'Office', 'Web'],
    summary: 'AI 智能办公助手，已成功部署上线，提供一站式在线体验。',
    status: 'LIVE ↗',
    actionLabel: '立即体验',
  },
  {
    title: '高分文章 · Function Calling 已死？新神 Code Mode 出现',
    url: 'https://zhuanlan.zhihu.com/p/2074185901404693978',
    displayUrl: 'zhuanlan.zhihu.com',
    image: '/media/portfolio/code-mode-article.webp',
    badgeIcon: 'scan-search',
    badgeLabel: '技术文章',
    tags: ['AI Agent', 'Function Calling', 'Code Mode'],
    summary: '拆解 Function Calling 与 Code Mode 两代工具调用范式的底层原理、路线之争与工程取舍，知乎高分技术长文。',
    status: 'LIVE ↗',
    actionLabel: '立即阅读',
  },
  {
    title: 'WaLiAPI',
    url: 'https://github.com/fuzhengwei/WaLiAPI',
    displayUrl: 'github.com/fuzhengwei/WaLiAPI',
    image: '/media/portfolio/waliapi.webp',
    badgeIcon: 'github',
    badgeLabel: 'GitHub 开源贡献',
    tags: ['Tauri 2', 'React', 'Rust', 'LLM Gateway', 'RAG', 'MCP'],
    summary: 'WaLiAPI 是一款本地运行的 LLM API 网关桌面软件（Tauri 2 + React + Rust）。支持各类 LLM 厂商渠道接入、Ollama 自部署模型、CPA 方式 ChatGPT 渠道接入，统一支持 Chat Completions / Responses / Anthropic Messages 三协议转换使用。内置安全审计引擎、知识库 RAG（HNSW + FTS5 混合检索）、Wiki 知识引擎和 MCP Server（29 个工具），配合 Codex、Claude Code、Gemini CLI 等 AI 编程工具使用。',
    status: 'OPEN SOURCE ↗',
    actionLabel: '查看源码',
    attribution: '开源共享者：Xerina · 作者：Xerina（江科萱的笔名）',
  },
]
</script>

<template>
  <main class="page page-portfolio is-active">
    <div class="container page-container">
      <section class="page-intro portfolio-intro">
        <div>
          <span class="section-index">04 / PORTFOLIO</span>
          <h1>从真实上线，<br /><em>到开源共享。</em></h1>
          <p>这里展示已上线、可直接体验的项目与内容，也记录持续公开共享的开源成果。</p>
        </div>
        <div class="portfolio-intro-meta"><strong>{{ portfolioItems.length }}</strong><span>PROJECTS / ONLINE + OPEN</span><small>点击卡片，体验线上版本或查看源码</small></div>
      </section>

      <section class="section-block portfolio-projects">
        <div class="section-heading"><div><span class="section-index">01 / PROJECTS &amp; OPEN SOURCE</span><h2>线上作品与开源项目</h2></div></div>
        <div class="portfolio-project-grid">
          <a v-for="(item, index) in portfolioItems" :key="item.title" class="portfolio-project-card" :href="item.url" target="_blank" rel="noreferrer">
            <div class="portfolio-project-media"><img class="portfolio-project-image" :src="url(item.image)" :alt="`${item.title} 内容主题插画`" loading="lazy" decoding="async" /><span class="portfolio-project-number">{{ String(index + 1).padStart(2, '0') }}</span><span class="portfolio-project-type-badge"><ItemIcon :name="item.badgeIcon" :size="13" :stroke-width="1.8" />{{ item.badgeLabel }}</span><span class="portfolio-project-status">{{ item.status }}</span></div>
            <div class="portfolio-project-copy"><div class="tag-row"><span v-for="tag in item.tags" :key="tag">{{ tag }}</span></div><h3>{{ item.title }}</h3><p>{{ item.summary }}</p><p v-if="item.attribution" class="portfolio-project-attribution">{{ item.attribution }}</p><div class="portfolio-project-link"><span class="portfolio-project-url">{{ item.displayUrl }}</span><span class="card-arrow">{{ item.actionLabel }} <span aria-hidden="true">↗</span></span></div></div>
          </a>
        </div>
      </section>

      <section id="honors" class="section-block portfolio-honors">
        <div class="section-heading"><div><span class="section-index">02 / COMPETITIONS &amp; HONORS</span><h2>竞赛与荣誉</h2></div><a class="section-link" :href="url('/about/#honors')">关于我的完整信息 <span aria-hidden="true">↗</span></a></div>
        <div class="portfolio-honor-list"><div v-for="honor in (profile.honors || [])" :key="honorText(honor)" class="portfolio-honor-row"><span>{{ honorYear(honor) }}</span><strong>{{ honorText(honor) }}</strong><i aria-hidden="true">↗</i></div></div>
      </section>
    </div>
  </main>
</template>
