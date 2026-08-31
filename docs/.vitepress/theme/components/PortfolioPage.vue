<script setup lang="ts">
import { data as profile } from '../../data/profile.data'
import { useRoute } from 'vitepress'
import ProjectVisual from './ProjectVisual.vue'
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

interface DeployedItem {
  title: string
  url: string
  displayUrl: string
  visual: string
  icon: string
  tags: string[]
  summary: string
}

const deployed: DeployedItem[] = [
  {
    title: 'AI MCP Gateway',
    url: 'http://123.207.10.5:8088/',
    displayUrl: '123.207.10.5:8088',
    visual: 'mcp',
    icon: 'network',
    tags: ['Java', 'Spring Boot', 'MCP', 'DDD'],
    summary: '面向企业能力治理的 MCP 网关：HTTP/OpenAPI、MySQL、Redis 与上游 MCP 接入，能力包发布与 Streamable HTTP 会话，支持 LLM 工具调用与多层隔离。',
  },
  {
    title: 'AI OfficePal',
    url: 'http://123.207.10.5/',
    displayUrl: '123.207.10.5',
    visual: 'web',
    icon: 'workflow',
    tags: ['AI 应用', 'Office', 'Web'],
    summary: 'AI 智能办公助手，已成功部署上线，提供一站式在线体验。',
  },
  {
    title: '高分文章 · Function Calling 已死？新神 Code Mode 出现',
    url: 'https://zhuanlan.zhihu.com/p/2074185901404693978',
    displayUrl: 'zhuanlan.zhihu.com',
    visual: 'article',
    icon: 'scan-search',
    tags: ['AI Agent', 'Function Calling', 'Code Mode'],
    summary: '拆解 Function Calling 与 Code Mode 两代工具调用范式的底层原理、路线之争与工程取舍，知乎高分技术长文。',
  },
]
</script>

<template>
  <main class="page page-portfolio is-active">
    <div class="container page-container">
      <section class="page-intro portfolio-intro">
        <div>
          <span class="section-index">04 / PORTFOLIO</span>
          <h1>做得出来，<br /><em>也部署得上去。</em></h1>
          <p>这里集中展示已成功部署上线、可在线直接体验的项目与内容，点击卡片即可打开线上体验地址。</p>
        </div>
        <div class="portfolio-intro-meta"><strong>{{ deployed.length }}</strong><span>DEPLOYED / ONLINE</span><small>点击卡片，直接体验线上版本</small></div>
      </section>

      <section class="section-block portfolio-projects">
        <div class="section-heading"><div><span class="section-index">01 / DEPLOYED &amp; LIVE</span><h2>已部署上线 · 在线体验</h2></div></div>
        <div class="portfolio-project-grid">
          <a v-for="(item, index) in deployed" :key="item.title" class="portfolio-project-card" :href="item.url" target="_blank" rel="noreferrer">
            <div class="portfolio-project-media"><ProjectVisual :kind="item.visual" :icon="item.icon" /><span class="portfolio-project-number">{{ String(index + 1).padStart(2, '0') }}</span><span class="portfolio-project-status">LIVE ↗</span></div>
            <div class="portfolio-project-copy"><div class="tag-row"><span v-for="tag in item.tags" :key="tag">{{ tag }}</span></div><h3>{{ item.title }}</h3><p>{{ item.summary }}</p><div class="portfolio-project-link"><span class="portfolio-project-url">{{ item.displayUrl }}</span><span class="card-arrow">立即体验 <span aria-hidden="true">↗</span></span></div></div>
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
