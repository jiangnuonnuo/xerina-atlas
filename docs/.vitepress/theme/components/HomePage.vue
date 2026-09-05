<script setup lang="ts">
import { data as profile } from '../../data/profile.data'
import { data as projects } from '../../data/projects.data'
import { data as experiences } from '../../data/experiences.data'
import { data as notes } from '../../data/notes.data'
import { useRoute } from 'vitepress'
import ItemIcon from './ItemIcon.vue'
import CardMedia from './CardMedia.vue'
import { relativeUrl } from '../utils/relative-url'

const route = useRoute()
const featuredExperience = experiences.slice(0, 3)
const featuredProjects = projects.slice(0, 4)
const featuredNotes = [...notes]
  .sort((a, b) => String(b.frontmatter.date ?? '').localeCompare(String(a.frontmatter.date ?? '')))
  .slice(0, 3)

const techStack = ['Java', 'Spring Boot', 'MySQL', 'Redis', 'RabbitMQ', 'Spring AI', 'MCP', 'Docker', 'Kubernetes', 'Linux']
const socials = [
  { label: 'GitHub', short: 'GH', href: 'https://github.com/jiangnuonnuo' },
  { label: '知乎', short: '知', href: 'https://www.zhihu.com/people/6-10-31-7' },
  { label: 'LinkedIn', short: 'in', href: 'https://www.linkedin.com/' },
  { label: 'Email', short: '✉', href: 'mailto:hsq_hi@126.com' },
]

function value(key: string, fallback = '') { return profile[key] || fallback }
function url(path: string) { return relativeUrl(path, route.path) }
function formatDate(date: unknown) { return String(date ?? '').slice(0, 10).replaceAll('-', '.') }
function honorText(honor: unknown) { return typeof honor === 'string' ? honor : String(honor ?? '') }
function honorYear(honor: unknown) { return honorText(honor).match(/20\d{2}/)?.[0] || 'HONOR' }
</script>

<template>
  <main class="page page-home is-active violet-home">
    <div class="container">
      <section class="violet-hero">
        <div class="violet-hero-copy">
          <span class="hello-pill">👋 Hi, I'm Xerina</span>
          <h1>专注 <em>Java</em> 后端开发<br /><span>&amp; <b>AI</b> 应用工程化</span></h1>
          <p class="hero-lede">热爱构建高性能、可扩展的系统，探索 AI 技术在实际业务中的落地应用。<br />持续学习，持续创造价值。</p>
          <div class="hero-actions">
            <a class="button button-primary" :href="url('/projects/')">查看我的项目 <span aria-hidden="true">→</span></a>
            <a class="button button-secondary" :href="url('/resume/xerina-java-backend-resume.pdf')" download>下载简历 <span aria-hidden="true">↓</span></a>
          </div>
          <div class="social-links" aria-label="社交链接">
            <a v-for="social in socials" :key="social.label" :href="social.href" :aria-label="social.label" target="_blank" rel="noreferrer"><span>{{ social.short }}</span></a>
          </div>
        </div>
        <div class="violet-hero-art" aria-label="Java 与 AI 工程化能力图示">
          <div class="hero-orbit orbit-a"></div><div class="hero-orbit orbit-b"></div><div class="hero-orbit orbit-c"></div>
          <span class="orbit-node node-java">Java Backend</span><span class="orbit-node node-ai">AI Application</span><span class="orbit-node node-db">Database</span><span class="orbit-node node-cloud">Cloud &amp; DevOps</span>
          <span class="orbit-point point-a"></span><span class="orbit-point point-b"></span><span class="orbit-point point-c"></span>
          <div class="hero-monogram">X</div>
        </div>
      </section>

      <section class="violet-overview-row" aria-label="个人概览">
        <div class="violet-stats-card">
          <div class="violet-stat"><span class="stat-icon"><ItemIcon name="workflow" :size="20" /></span><strong>3+</strong><small>项目经验</small></div>
          <div class="violet-stat"><span class="stat-icon"><ItemIcon name="list-tree" :size="20" /></span><strong>5+</strong><small>技术栈掌握</small></div>
          <div class="violet-stat"><span class="stat-icon"><ItemIcon name="server-cog" :size="20" /></span><strong>2+</strong><small>实习经历</small></div>
          <div class="violet-stat"><span class="stat-icon"><ItemIcon name="workflow" :size="20" /></span><strong>100%</strong><small>项目完成度</small></div>
        </div>
        <div class="violet-stack-card"><div class="stack-heading"><strong>技术栈</strong><a :href="url('/about/#skills')">查看全部 <span>→</span></a></div><div class="stack-list"><span v-for="stack in techStack" :key="stack"><i></i>{{ stack }}</span></div></div>
      </section>

      <section class="section-block violet-experience-section">
        <div class="section-heading"><div><span class="section-index violet-index">01 / INTERNSHIP &amp; PRACTICE</span><h2>实习经历</h2><p class="section-subtitle">在真实业务中积累工程经验，持续把复杂问题做成稳定能力。</p></div><a class="section-link" :href="url('/experience/')">查看全部经历 <span>→</span></a></div>
        <div class="violet-experience-grid">
          <a v-for="item in featuredExperience" :key="item.slug" class="violet-experience-card" :href="url(item.url)">
            <CardMedia :src="url(item.frontmatter.cardImage)" :alt="`${item.frontmatter.organization} · ${item.frontmatter.title}`" :icon="item.frontmatter.icon" label="实习经历" />
            <div class="violet-experience-copy"><span class="violet-experience-period">{{ item.frontmatter.period }}</span><h3>{{ item.frontmatter.title }}</h3><p>{{ item.frontmatter.organization }}</p><span class="violet-card-arrow">了解详情 <b>→</b></span></div>
          </a>
        </div>
      </section>

      <section class="section-block violet-projects-section">
        <div class="section-heading"><div><span class="section-index violet-index">02 / SELECTED PROJECTS</span><h2>精选项目</h2><p class="section-subtitle">精选的项目与开源实践，展示我如何把想法落成可运行的系统。</p></div><a class="section-link" :href="url('/projects/')">查看全部项目 <span>→</span></a></div>
        <div class="violet-project-grid">
          <article v-for="(project, index) in featuredProjects" :key="project.slug" class="violet-project-card">
            <a :href="url(project.url)" class="violet-project-media"><CardMedia :src="url(project.frontmatter.cardImage)" :alt="`${project.frontmatter.title} 的项目主题插画`" :icon="project.frontmatter.icon" label="项目案例" /><span class="violet-project-number">{{ String(index + 1).padStart(2, '0') }}</span></a>
            <div class="violet-project-body"><h3>{{ project.frontmatter.title }}</h3><p>{{ project.frontmatter.summary }}</p><div class="tag-row"><span v-for="tag in (project.frontmatter.stack || []).slice(0, 5)" :key="tag">{{ tag }}</span></div><a :href="url(project.url)" class="violet-card-arrow">查看项目详情 <b>→</b></a></div>
          </article>
        </div>
      </section>

      <section v-if="(profile.honors || []).length" class="section-block violet-honors-section">
        <div class="section-heading compact-heading"><div><span class="section-index violet-index">03 / COMPETITIONS &amp; HONORS</span><h2>竞赛与荣誉</h2></div><a class="section-link" :href="url('/about/#honors')">查看完整信息 <span>→</span></a></div>
        <div class="violet-honor-strip"><a v-for="honor in profile.honors" :key="honorText(honor)" :href="url('/about/#honors')"><span>{{ honorYear(honor) }}</span><strong>{{ honorText(honor) }}</strong><i>→</i></a></div>
      </section>

      <section v-if="featuredNotes.length" class="lower-grid section-block violet-lower-section">
        <div><div class="section-heading compact-heading"><div><span class="section-index violet-index">04 / NOTES</span><h2>技术文章与知识库</h2></div><a class="section-link" :href="url('/notes/')">查看全部文章 <span>→</span></a></div><div class="notes-preview"><a v-for="note in featuredNotes" :key="note.slug" class="note-row violet-note-row" :href="url(note.url)"><span class="note-date">{{ formatDate(note.frontmatter.date) }}</span><span class="note-title"><strong>{{ note.frontmatter.title }}</strong><small>{{ note.frontmatter.category }} · {{ note.frontmatter.readingTime || '阅读' }}</small></span><span>→</span></a></div></div>
        <aside class="contact-card violet-contact-card"><span class="section-index">LET'S TALK</span><h3>一起聊聊<br />技术与可能</h3><p>欢迎交流 Java 后端、AI 应用工程、项目解析与实习机会。</p><a class="button button-dark" :href="`mailto:${value('email', 'hsq_hi@126.com')}`">联系我 <span>→</span></a></aside>
      </section>
    </div>
  </main>
</template>
