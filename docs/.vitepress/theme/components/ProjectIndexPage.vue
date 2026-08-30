<script setup lang="ts">
import { computed, ref } from 'vue'
import { data as projects } from '../../data/projects.data'
import { useRoute } from 'vitepress'
import ProjectVisual from './ProjectVisual.vue'
import { relativeUrl } from '../utils/relative-url'

const filter = ref('all')
const filters = [
  { key: 'all', label: '全部' },
  { key: 'platform', label: '平台工程' },
  { key: 'domain', label: '业务系统' },
  { key: 'ai', label: 'AI 应用' },
]
const visibleProjects = computed(() => filter.value === 'all' ? projects : projects.filter((project) => project.frontmatter.category === filter.value))
const route = useRoute()
const url = (path: string) => relativeUrl(path, route.path)
</script>

<template>
  <main class="page page-projects is-active">
    <div class="container page-container">
      <div class="page-intro"><div><span class="section-index">02 / PROJECT EXPERIENCE · HR QUICK VIEW</span><h1>项目经历</h1><p>用于快速了解项目类型、我的职责、使用技术和项目结果。需要完整技术细节时，请进入对应的项目文档。</p></div><div class="page-intro-meta"><span>{{ projects.length }} PROJECTS</span><span>QUICK VIEW</span><span>RESUME / 2026</span></div></div>
      <div class="filter-bar" role="toolbar" aria-label="项目分类筛选"><span class="filter-label">FILTER BY</span><button v-for="item in filters" :key="item.key" class="filter-button" :class="{ 'is-active': filter === item.key }" type="button" @click="filter = item.key">{{ item.label }} <span>{{ item.key === 'all' ? projects.length : projects.filter((project) => project.frontmatter.category === item.key).length }}</span></button></div>
      <div class="project-index-list">
        <article v-for="(project, index) in visibleProjects" :key="project.slug" class="project-index-card">
          <ProjectVisual :kind="project.frontmatter.visual" :icon="project.frontmatter.icon" class="index-card-media" />
          <div class="index-card-copy"><div class="project-card-top"><span class="project-number">{{ String(index + 1).padStart(2, '0') }}</span><span class="project-type">{{ project.frontmatter.categoryLabel }} / {{ project.frontmatter.year }}</span></div><h2>{{ project.frontmatter.title }}</h2><p>{{ project.frontmatter.summary }}</p><div class="index-card-bottom"><div class="tag-row"><span v-for="tag in project.frontmatter.stack || []" :key="tag">{{ tag }}</span></div><a :href="url(project.url)" class="button button-small">查看项目文档 <span>↗</span></a></div></div>
        </article>
      </div>
    </div>
  </main>
</template>
