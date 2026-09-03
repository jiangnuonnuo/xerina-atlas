<script setup lang="ts">
import { data as experiences } from '../../data/experiences.data'
import { useRoute } from 'vitepress'
import CardMedia from './CardMedia.vue'
import { relativeUrl } from '../utils/relative-url'

const route = useRoute()
const url = (path: string) => relativeUrl(path, route.path)
</script>

<template>
  <main class="page page-experience is-active">
    <div class="container page-container">
      <div class="page-intro"><div><span class="section-index">01 / INTERNSHIP &amp; PRACTICE EXPERIENCE</span><h1>实习与实践经历</h1><p>优先展示我在真实项目中的角色、负责范围、技术判断与结果。每段经历都可以继续查看具体参与内容。</p></div><div class="page-intro-meta"><span>{{ experiences.length }} ENTRIES</span><span>ROLE / RESULT</span><span>RESUME / 2026</span></div></div>
      <div class="timeline-list">
        <a v-for="item in experiences" :key="item.slug" class="timeline-link" :href="url(item.url)">
          <div class="timeline-content">
            <CardMedia class="experience-card-media" :src="url(item.frontmatter.cardImage)" :alt="`${item.organization} · ${item.title} 的实习主题插画`" :icon="item.frontmatter.icon" label="实习经历" />
            <div class="timeline-copy">
              <div class="timeline-heading-row"><div><span class="timeline-period">{{ item.frontmatter.period }}</span><h2>{{ item.frontmatter.title }}</h2><p class="timeline-company">{{ item.frontmatter.organization }} · {{ item.frontmatter.location }}</p></div><div class="timeline-skills" aria-label="技术栈"><span class="timeline-skills-label">TECH STACK</span><span v-for="skill in (item.frontmatter.skills || []).slice(0, 5)" :key="skill">{{ skill }}</span></div></div>
              <p class="timeline-summary">{{ item.frontmatter.summary }}</p>
              <span class="timeline-detail-link">查看角色与具体参与 ↗</span>
            </div>
          </div>
        </a>
      </div>
    </div>
  </main>
</template>
