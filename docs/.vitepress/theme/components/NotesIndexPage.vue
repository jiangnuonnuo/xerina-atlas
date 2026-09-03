<script setup lang="ts">
import { computed, ref } from 'vue'
import { data as notes } from '../../data/notes.data'
import { useRoute } from 'vitepress'
import CardMedia from './CardMedia.vue'
import { relativeUrl } from '../utils/relative-url'

const query = ref('')
const category = ref('all')
const route = useRoute()
const url = (path: string) => relativeUrl(path, route.path)
const categories = computed(() => ['all', ...new Set(notes.map((note) => note.frontmatter.category).filter(Boolean))])
const visibleNotes = computed(() => notes.filter((note) => {
  const matchesCategory = category.value === 'all' || note.frontmatter.category === category.value
  const text = `${note.frontmatter.title} ${note.frontmatter.summary} ${(note.frontmatter.tags || []).join(' ')}`.toLowerCase()
  return matchesCategory && text.includes(query.value.trim().toLowerCase())
}))

function formatDate(date: unknown) {
  return String(date ?? '').slice(0, 10).replaceAll('-', '.')
}
</script>

<template>
  <main class="page page-notes is-active">
    <div class="container page-container">
      <div class="page-intro"><div><span class="section-index">03 / TECHNICAL NOTES &amp; KNOWLEDGE BASE</span><h1>技术文章与知识库</h1><p>围绕 Java 后端、AI 应用工程化、系统设计和项目复盘持续沉淀。文章是项目文档的独立阅读入口。</p></div><div class="page-intro-meta"><span>{{ notes.length }} NOTES</span><span>SEARCHABLE</span><span>MARKDOWN / SOURCE</span></div></div>
      <div class="notes-toolbar"><label class="search-box"><span class="sr-only">搜索文章</span><input v-model="query" type="search" placeholder="搜索标题、标签或摘要" /></label><div class="note-filters"><button v-for="item in categories" :key="item" type="button" :class="{ 'is-active': category === item }" @click="category = item">{{ item === 'all' ? '全部' : item }}</button></div></div>
      <div v-if="visibleNotes.length" class="note-table"><a v-for="note in visibleNotes" :key="note.slug" class="note-table-row" :href="url(note.url)"><span class="note-table-date">{{ formatDate(note.frontmatter.date) }}</span><CardMedia class="note-card-media" :src="url(note.frontmatter.cardImage)" :alt="`${note.frontmatter.title} 的文章主题插画`" icon="scan-search" label="技术文章" /><span class="note-table-copy"><strong>{{ note.frontmatter.title }}</strong><small>{{ note.frontmatter.summary }}</small></span><span class="note-table-category">{{ note.frontmatter.category }}</span><span aria-hidden="true">↗</span></a></div>
      <div v-else class="empty-state empty-state-panel"><strong>还没有匹配的文章</strong><span>可以先从项目文档进入，后续新增 Markdown 文件后会自动出现在这里。</span></div>
    </div>
  </main>
</template>
