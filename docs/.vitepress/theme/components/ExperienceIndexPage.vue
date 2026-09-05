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
      <div class="experience-timeline">
        <div class="experience-timeline-axis" aria-hidden="true"><span class="experience-timeline-axis-arrow">↓</span></div>
        <article v-for="(item, index) in experiences" :key="item.slug" class="experience-timeline-item">
          <div class="experience-timeline-node" aria-hidden="true"><span>{{ String(index + 1).padStart(2, '0') }}</span></div>
          <div class="experience-timeline-date">{{ item.frontmatter.period }}</div>
          <a class="experience-timeline-card" :href="url(item.url)">
            <CardMedia class="experience-timeline-media" :src="url(item.frontmatter.cardImage)" :alt="`${item.frontmatter.organization} · ${item.frontmatter.title} 的实习主题插画`" :icon="item.frontmatter.icon" label="实习经历" />
            <div class="experience-timeline-copy">
              <div class="experience-timeline-heading"><div><span class="experience-timeline-kicker">{{ String(index + 1).padStart(2, '0') }} / EXPERIENCE</span><h2>{{ item.frontmatter.title }}</h2><p>{{ item.frontmatter.organization }} · {{ item.frontmatter.location }}</p></div><span class="experience-timeline-arrow" aria-hidden="true">↗</span></div>
              <p class="experience-timeline-summary">{{ item.frontmatter.summary }}</p>
              <div class="experience-timeline-footer"><span class="experience-timeline-skills-label">TECH STACK</span><div class="experience-timeline-skills" aria-label="技术栈"><span v-for="skill in (item.frontmatter.skills || []).slice(0, 5)" :key="skill">{{ skill }}</span></div><span class="experience-timeline-detail">查看角色与具体参与 <b>→</b></span></div>
            </div>
          </a>
        </article>
      </div>
    </div>
  </main>
</template>
