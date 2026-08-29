<script setup lang="ts">
import { computed } from 'vue'
import { Content, useData, useRoute, withBase } from 'vitepress'
import { data as experiences } from '../../data/experiences.data'
import { data as projects } from '../../data/projects.data'
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'

const { frontmatter } = useData()
const route = useRoute()
const experience = computed(() => experiences.find((item) => item.slug === route.path.split('/').filter(Boolean)[1]) || experiences[0])
const relatedProjects = computed(() => (experience.value?.frontmatter.relatedProjects || []).map((slug: string) => projects.find((project) => project.slug === slug)).filter(Boolean))
</script>

<template>
  <div class="atlas-site">
    <SiteHeader />
    <main class="container page-container">
      <a class="back-link" :href="withBase('/experience/')">← 返回实习与实践经历</a>
      <header class="experience-detail-header"><div><span class="section-index">INTERNSHIP / PRACTICE DETAIL</span><h1>{{ frontmatter.title }}</h1><p>{{ frontmatter.summary }}</p></div><div class="experience-detail-meta"><span>{{ frontmatter.organization }}</span><span>{{ frontmatter.period }}</span><span>{{ frontmatter.location }}</span></div></header>
      <div class="experience-detail-layout"><aside class="experience-detail-sidebar"><span>ON THIS PAGE</span><div><a href="#role">我的角色</a><a href="#context">工作背景</a><a href="#participation">具体参与</a><a href="#collaboration">协作方式</a><a href="#outcomes">结果与复盘</a><a href="#skills">实践技能</a></div><div v-for="project in relatedProjects" :key="project.slug" class="related-project"><span>RELATED PROJECT</span><strong>{{ project.frontmatter.title }}</strong><a :href="withBase(project.url)">进入项目文档 ↗</a></div></aside><article class="experience-detail-article"><p class="experience-detail-lede">{{ frontmatter.detailLead || frontmatter.summary }}</p><div class="experience-content"><Content /></div></article></div>
    </main>
    <SiteFooter />
  </div>
</template>
