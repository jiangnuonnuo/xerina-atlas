<script setup lang="ts">
import { computed, ref } from 'vue'
import { Content, useData, useRoute, withBase } from 'vitepress'
import { data as projects } from '../../data/projects.data'
import { data as chapters } from '../../data/chapters.data'
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'

const { frontmatter } = useData()
const route = useRoute()
const sidebarOpen = ref(false)
const currentSlug = computed(() => frontmatter.value.project || route.path.split('/').filter(Boolean)[1] || '')
const project = computed(() => projects.find((item) => item.slug === currentSlug.value) || projects[0])
const projectChapters = computed(() => chapters.filter((item) => item.frontmatter.project === currentSlug.value))
const currentPath = computed(() => route.path.replace(/index\.html$/, '').replace(/\.html$/, ''))

function active(url: string) { return currentPath.value === url || (url.endsWith('/') && currentPath.value === url.slice(0, -1)) }
</script>

<template>
  <div class="atlas-site">
    <SiteHeader />
    <div v-if="project" class="doc-project-bar">
      <div class="container doc-project-bar-inner"><a class="doc-project-identity" :href="withBase(project.url)"><span>PROJECT DOCUMENT</span><strong>{{ project.frontmatter.title }}</strong></a><nav class="doc-top-nav" aria-label="项目文档章节"><a :class="{ 'is-active': active(project.url) }" :href="withBase(project.url)">总览</a><a v-for="chapter in projectChapters" :key="chapter.slug" :class="{ 'is-active': active(chapter.url) }" :href="withBase(chapter.url)">{{ chapter.frontmatter.title }}</a></nav></div>
    </div>
    <main class="container doc-layout">
      <aside class="doc-sidebar" :class="{ 'is-open': sidebarOpen }"><div class="doc-sidebar-head"><span>DOCUMENT TREE</span><button class="doc-sidebar-toggle" type="button" @click="sidebarOpen = !sidebarOpen">{{ sidebarOpen ? '收起目录' : '展开目录' }}<span aria-hidden="true">{{ sidebarOpen ? '−' : '+' }}</span></button><span class="doc-sidebar-count">{{ projectChapters.length + 1 }} FILES</span></div><nav class="doc-tree"><a class="doc-tree-link" :class="{ 'is-active': active(project?.url || '') }" :href="withBase(project?.url || '/')" @click="sidebarOpen = false"><span>00</span><strong>项目总览</strong></a><a v-for="(chapter, index) in projectChapters" :key="chapter.slug" class="doc-tree-link" :class="{ 'is-active': active(chapter.url) }" :href="withBase(chapter.url)" @click="sidebarOpen = false"><span>{{ String(index + 1).padStart(2, '0') }}</span><strong>{{ chapter.frontmatter.title }}</strong></a></nav><div class="doc-sidebar-note"><span>READING PATH</span><p>先了解问题和目标，再进入系统设计、核心实现与验证结果。</p></div></aside>
      <article class="doc-article"><header class="doc-article-header"><span class="section-index">{{ frontmatter.type === 'project' ? 'PROJECT OVERVIEW' : frontmatter.group || 'PROJECT CHAPTER' }}</span><h1>{{ frontmatter.title }}</h1><p class="doc-article-lede">{{ frontmatter.summary || frontmatter.description }}</p><div class="doc-article-meta"><span>{{ project?.frontmatter.categoryLabel }}</span><span>{{ project?.frontmatter.year }}</span><span>{{ project?.frontmatter.role }}</span></div></header><div class="doc-content"><Content /></div></article>
    </main>
    <SiteFooter />
  </div>
</template>
