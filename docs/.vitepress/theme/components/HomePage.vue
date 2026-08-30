<script setup lang="ts">
import { data as profile } from '../../data/profile.data'
import { data as projects } from '../../data/projects.data'
import { data as experiences } from '../../data/experiences.data'
import { data as notes } from '../../data/notes.data'
import { useRoute } from 'vitepress'
import ItemIcon from './ItemIcon.vue'
import ProjectVisual from './ProjectVisual.vue'
import { relativeUrl } from '../utils/relative-url'

const featuredExperience = experiences.slice(0, 3)
const featuredProjects = projects.slice(0, 3)
const featuredNotes = [...notes]
  .sort((a, b) => String(b.frontmatter.date ?? '').localeCompare(String(a.frontmatter.date ?? '')))
  .slice(0, 3)
const honors = profile.honors || []
const route = useRoute()

function value(key: string, fallback = '') {
  return profile[key] || fallback
}

function url(path: string) {
  return relativeUrl(path, route.path)
}

function formatDate(date: unknown) {
  return String(date ?? '').slice(0, 10).replaceAll('-', '.')
}

function honorText(honor: unknown) {
  if (typeof honor === 'string') return honor
  if (honor && typeof honor === 'object' && 'title' in honor) return String(honor.title)
  return String(honor ?? '')
}

function honorYear(honor: unknown) {
  return honorText(honor).match(/20\d{2}/)?.[0] || 'HONOR'
}
</script>

<template>
  <main class="page page-home is-active">
    <div class="container">
      <section class="hero-grid">
        <div class="hero-copy">
          <div class="eyebrow"><span class="eyebrow-dot"></span> OPEN TO WORK <span class="eyebrow-line"></span> JAVA BACKEND</div>
          <h1>先理清问题，<br /><em>再做实系统。</em></h1>
          <p class="hero-lede">你好，我是 {{ value('displayName', 'Xerina') }}，一名专注于 Java 后端开发、AI 应用工程化与系统设计的开发者。正在寻找 Java 后端开发、平台工程或 AI 应用方向的机会。</p>
          <div class="hero-actions">
            <a class="button button-primary" :href="url('/projects/')"><span>查看项目</span><span aria-hidden="true">↗</span></a>
            <a class="button button-secondary" :href="url('/resume/xerina-java-backend-resume.pdf')" download><span>下载简历</span><span aria-hidden="true">↓</span></a>
          </div>
          <div class="hero-contact">
            <span class="status-pulse"></span><span>期待与优秀团队一起解决真实问题</span>
            <a class="inline-link" :href="`mailto:${value('email', 'hsq_hi@126.com')}`">{{ value('email', 'hsq_hi@126.com') }}</a>
          </div>
        </div>
        <div class="hero-visual" aria-label="Xerina 的个人定位信息">
          <div class="hero-visual-top"><span>PROFILE / 001</span><span>JAVA / AI / SYSTEMS</span></div>
          <div class="identity-orbit">
            <div class="orbit-ring ring-one"></div><div class="orbit-ring ring-two"></div><div class="orbit-dot dot-one"></div><div class="orbit-dot dot-two"></div>
            <div class="monogram">X<span>.</span></div><div class="orbit-label label-one">BACKEND</div><div class="orbit-label label-two">SYSTEMS</div><div class="orbit-label label-three">AI × PRODUCT</div>
          </div>
          <div class="hero-visual-bottom"><div><span class="data-label">BASE</span><strong>中国 · 莆田</strong></div><div><span class="data-label">FOCUS</span><strong>Build / Explain / Iterate</strong></div></div>
        </div>
      </section>

      <section class="quick-facts section-rule" aria-label="个人概况">
        <div class="fact"><span class="data-label">EDUCATION</span><strong>{{ value('educationShort', '数据科学与大数据技术') }}</strong><small>{{ value('educationSchool', '莆田学院') }} · {{ value('educationPeriod', '2023 — 2027') }}</small></div>
        <div class="fact"><span class="data-label">CURRENTLY</span><strong>寻找 Java 后端开发机会</strong><small>实习 / 校招 · 可快速到岗</small></div>
        <div class="fact"><span class="data-label">EXPERIENCE</span><strong>{{ experiences.length }} 段经历 · {{ projects.length }} 个重点项目</strong><small>从异步架构到 AI 应用工程化</small></div>
        <a class="fact fact-link" :href="url('/about/')"><span class="data-label">MORE ABOUT ME</span><strong>认识完整的 Xerina <span aria-hidden="true">↗</span></strong><small>教育、技能、竞赛和联系方式</small></a>
      </section>

      <section class="split-section section-block home-experience">
        <div class="section-heading compact-heading"><div><span class="section-index">01 / INTERNSHIP &amp; PRACTICE EXPERIENCE</span><h2>实习与实践经历</h2></div><a class="section-link" :href="url('/experience/')">查看完整经历 <span aria-hidden="true">↗</span></a></div>
        <div class="experience-list">
          <a v-for="(item, index) in featuredExperience" :key="item.slug" class="experience-row" :class="{ 'experience-row-featured': index === 0 }" :href="url(item.url)">
            <span class="experience-item-icon"><ItemIcon :name="item.frontmatter.icon" :size="21" /></span><span class="experience-year">{{ item.frontmatter.period }}</span><span class="experience-role"><strong>{{ item.frontmatter.title }}</strong><small>{{ item.frontmatter.organization }}</small></span><span class="experience-summary">{{ item.frontmatter.summary }}</span><span class="row-arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section class="section-block home-projects">
        <div class="section-heading"><div><span class="section-index">02 / PROJECT EXPERIENCE · HR QUICK VIEW</span><h2>项目经历</h2></div><a class="section-link" :href="url('/projects/')">全部项目 <span aria-hidden="true">↗</span></a></div>
        <div class="project-grid">
          <article v-for="(project, index) in featuredProjects" :key="project.slug" class="project-card" :class="{ 'project-card-featured': index === 0 }">
            <div class="project-card-top"><span class="project-number">{{ String(index + 1).padStart(2, '0') }}</span><span class="project-type">{{ project.frontmatter.categoryLabel }} / {{ project.frontmatter.year }}</span></div>
            <ProjectVisual :kind="project.frontmatter.visual" :icon="project.frontmatter.icon" />
            <div class="project-card-body"><div class="tag-row"><span v-for="tag in (project.frontmatter.stack || []).slice(0, 3)" :key="tag">{{ tag }}</span></div><h3>{{ project.frontmatter.title }}</h3><p>{{ project.frontmatter.summary }}</p><a :href="url(project.url)" class="card-arrow">查看项目详情 <span aria-hidden="true">↗</span></a></div>
          </article>
        </div>
      </section>

      <section v-if="honors.length" class="section-block home-honors">
        <div class="section-heading compact-heading"><div><span class="section-index">03 / PORTFOLIO · COMPETITIONS &amp; HONORS</span><h2>竞赛与荣誉</h2></div><a class="section-link" :href="url('/portfolio/#honors')">查看作品集 <span aria-hidden="true">↗</span></a></div>
        <div class="honor-strip"><a v-for="honor in honors" :key="honorText(honor)" class="honor-row" :href="url('/portfolio/#honors')"><span>{{ honorYear(honor) }}</span><strong>{{ honorText(honor) }}</strong><i aria-hidden="true">↗</i></a></div>
      </section>

      <section class="lower-grid section-block">
        <div>
          <div class="section-heading compact-heading"><div><span class="section-index">04 / NOTES</span><h2>技术文章与知识库</h2></div><a class="section-link" :href="url('/notes/')">查看全部文章 <span aria-hidden="true">↗</span></a></div>
          <div v-if="featuredNotes.length" class="notes-preview"><a v-for="note in featuredNotes" :key="note.slug" class="note-row" :href="url(note.url)"><span class="note-date">{{ formatDate(note.frontmatter.date) }}</span><span class="note-title"><strong>{{ note.frontmatter.title }}</strong><small>{{ note.frontmatter.category }} · {{ note.frontmatter.readingTime || '阅读' }}</small></span><span aria-hidden="true">↗</span></a></div>
          <p v-else class="empty-state">文章正在整理中，后续会按项目章节和技术主题持续更新。</p>
        </div>
        <aside class="contact-card"><span class="section-index">LET'S TALK</span><h3>联系方式</h3><p>欢迎聊 Java 后端、AI 应用工程、项目解析与实习机会。</p><a class="button button-dark" :href="`mailto:${value('email', 'hsq_hi@126.com')}`">发送邮件 <span aria-hidden="true">↗</span></a><div class="social-row"><a :href="value('githubUrl', 'https://github.com/jiangnuonnuo')" target="_blank" rel="noreferrer">GitHub</a><a :href="url('/about/')">简历</a><a :href="url('/about/')">联系我</a></div></aside>
      </section>
    </div>
  </main>
</template>
