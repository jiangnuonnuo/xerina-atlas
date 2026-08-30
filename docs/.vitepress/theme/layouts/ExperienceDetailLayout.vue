<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Content, useData, useRoute, withBase } from 'vitepress'
import { data as experiences } from '../../data/experiences.data'
import { data as projects } from '../../data/projects.data'
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'

const { frontmatter } = useData()
const route = useRoute()
const experience = computed(() => experiences.find((item) => item.slug === route.path.split('/').filter(Boolean)[1]) || experiences[0])
const relatedProjects = computed(() => (experience.value?.frontmatter.relatedProjects || []).map((slug: string) => projects.find((project) => project.slug === slug)).filter(Boolean))
const tocItems = [
  { id: 'role', label: '我的角色' },
  { id: 'context', label: '业务背景' },
  { id: 'business-value', label: '业务价值' },
  { id: 'participation', label: '具体实现' },
  { id: 'implementation', label: '项目文章' },
  { id: 'collaboration', label: '协作方式' },
  { id: 'outcomes', label: '结果与证据' },
  { id: 'skills', label: '技术沉淀' },
]
const activeSection = ref('role')
let sectionObserver: IntersectionObserver | null = null

onMounted(() => {
  const visibleSections = new Set<string>()
  sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visibleSections.add(entry.target.id)
      else visibleSections.delete(entry.target.id)
    })
    const firstVisible = tocItems.find((item) => visibleSections.has(item.id))
    if (firstVisible) activeSection.value = firstVisible.id
  }, { rootMargin: '-18% 0px -65% 0px', threshold: 0 })

  document.querySelectorAll<HTMLElement>('.experience-detail-section').forEach((section) => sectionObserver?.observe(section))
})

onBeforeUnmount(() => sectionObserver?.disconnect())
</script>

<template>
  <div class="atlas-site">
    <SiteHeader />
    <main class="container page-container">
      <a class="back-link" :href="withBase('/experience/')">← 返回实习与实践经历</a>
      <header class="experience-detail-header"><div><span class="section-index">INTERNSHIP / PRACTICE DETAIL</span><h1>{{ frontmatter.title }}</h1><p>{{ frontmatter.summary }}</p></div><div class="experience-detail-meta"><span>{{ frontmatter.organization }}</span><span>{{ frontmatter.period }}</span><span>{{ frontmatter.location }}</span></div></header>
      <div v-if="frontmatter.business || frontmatter.focus || frontmatter.evidence" class="experience-detail-signals"><div v-if="frontmatter.business" class="experience-detail-signal"><span>BUSINESS</span><strong>{{ frontmatter.business }}</strong></div><div v-if="frontmatter.focus" class="experience-detail-signal"><span>FOCUS</span><strong>{{ frontmatter.focus }}</strong></div><div v-if="frontmatter.evidence" class="experience-detail-signal"><span>EVIDENCE</span><strong>{{ frontmatter.evidence }}</strong></div></div>
      <div class="experience-detail-layout"><aside class="experience-detail-sidebar"><span>ON THIS PAGE</span><nav class="experience-detail-toc" aria-label="经历详情目录"><a v-for="item in tocItems" :key="item.id" :class="{ 'is-active': activeSection === item.id }" :href="`#${item.id}`" :aria-current="activeSection === item.id ? 'location' : undefined">{{ item.label }}</a></nav><div v-for="project in relatedProjects" :key="project.slug" class="related-project"><span>RELATED PROJECT</span><strong>{{ project.frontmatter.title }}</strong><p>{{ project.frontmatter.summary }}</p><a :href="withBase(project.url)">进入项目文档 ↗</a></div></aside><article class="experience-detail-article"><p class="experience-detail-lede">{{ frontmatter.detailLead || frontmatter.summary }}</p><div class="experience-content"><Content /></div></article></div>
    </main>
    <SiteFooter />
  </div>
</template>
