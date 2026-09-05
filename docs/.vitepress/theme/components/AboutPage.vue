<script setup lang="ts">
import { data as profile } from '../../data/profile.data'
import { data as projects } from '../../data/projects.data'
import { data as experiences } from '../../data/experiences.data'
import { Content, useRoute } from 'vitepress'
import { relativeUrl } from '../utils/relative-url'
import ItemIcon from './ItemIcon.vue'

const route = useRoute()
const url = (path: string) => relativeUrl(path, route.path)
function value(key: string, fallback = '') { return profile[key] || fallback }
const skillGroups = [
  { label: '后端开发', items: ['Java', 'Spring Boot', 'Spring Cloud', 'MyBatis', 'Spring Security'] },
  { label: '数据库', items: ['MySQL', 'Redis', 'PostgreSQL', 'PGVector'] },
  { label: 'AI & 大模型', items: ['Spring AI', 'MCP', 'RAG', 'LLM', 'WebSocket'] },
  { label: '云原生 & DevOps', items: ['Docker', 'Kubernetes', 'Linux', 'GitLab CI/CD', 'Nginx'] },
  { label: '开发工具', items: ['VS Code', 'IntelliJ IDEA', 'Postman', 'Git'] },
]
const timeline = [
  ['2023.09 — 2027.06', '数据科学与大数据技术', '莆田学院'],
  ...experiences.map((item) => [String(item.frontmatter.period || ''), String(item.frontmatter.title || ''), `${item.frontmatter.organization || ''} · ${item.frontmatter.location || ''}`]),
]
const hobbies = [
  ['▣', '技术探索', '探索新技术，学习最佳实践'], ['⌘', '开源贡献', '参与开源项目，回馈社区'], ['♡', '知识分享', '分享技术文章，帮助他人'], ['↗', '运动健身', '保持健康，热爱运动'], ['▤', '阅读思考', '阅读技术书籍，思考总结'], ['◉', '旅行摄影', '记录美好瞬间，开阔眼界'],
]
</script>

<template>
  <main class="page page-about is-active violet-about">
    <div class="container page-container">
      <section class="about-profile-hero">
        <div class="about-profile-copy">
          <span class="section-index violet-index">关于我 / ABOUT ME</span>
          <h1>你好，我是 <em>Xerina</em> 👋</h1>
          <h2>Java 后端开发 &amp; AI 应用工程化探索者</h2>
          <p>{{ value('aboutLead', '热爱技术，乐于分享，持续学习，致力于将 AI 技术与传统业务相结合，创造更有价值的产品和服务。') }}</p>
          <div class="about-profile-stats"><span><b>2023.09</b><small>开始学习编程</small></span><span><b>{{ projects.length }}+</b><small>重点项目</small></span><span><b>{{ experiences.length }}+</b><small>实践经历</small></span><span><b>中国 · 莆田</b><small>GMT+8 时区</small></span></div>
          <div class="hero-actions"><a class="button button-primary" :href="url('/resume/xerina-java-backend-resume.pdf')" download>下载简历 <span>↓</span></a><a class="button button-secondary" :href="`mailto:${value('email', 'hsq_hi@126.com')}`">联系我 <span>✉</span></a><div class="social-links about-socials"><a href="https://github.com/jiangnuonnuo" target="_blank" rel="noreferrer"><span>GH</span></a><a href="https://www.zhihu.com/people/6-10-31-7" target="_blank" rel="noreferrer"><span>知</span></a><a href="https://www.linkedin.com/" target="_blank" rel="noreferrer"><span>in</span></a><a :href="`mailto:${value('email', 'hsq_hi@126.com')}`"><span>✉</span></a></div></div>
        </div>
        <div class="about-profile-art"><div class="about-art-glow"></div><img :src="url('/brand/xerina-avatar.png')" alt="Xerina" /><div class="about-art-card card-java"><span>☕</span><b>Java</b></div><div class="about-art-card card-spring"><span>◒</span><b>Spring Boot</b></div><span class="about-art-code">&lt;/&gt;<br /><i>▰ ▰ ▰</i></span></div>
      </section>

      <section class="about-content-grid">
        <article class="about-panel about-intro-panel"><h2><span class="panel-icon"><ItemIcon name="scan-search" :size="18" /></span>个人简介</h2><div class="about-copy"><Content /></div><div class="about-chip-row"><span>热爱编程</span><span>持续学习</span><span>开源贡献</span><span>技术分享</span><span>产品思维</span></div></article>
        <article id="skills" class="about-panel about-skills-panel"><h2><span class="panel-icon"><ItemIcon name="workflow" :size="18" /></span>我的技术栈</h2><div v-for="group in skillGroups" :key="group.label" class="skill-group"><span>{{ group.label }}</span><div><b v-for="skill in group.items" :key="skill">{{ skill }}</b></div></div></article>
        <article class="about-panel about-timeline-panel"><h2><span class="panel-icon"><ItemIcon name="workflow" :size="18" /></span>成长历程</h2><ol class="about-timeline"><li v-for="entry in timeline" :key="entry[0]"><i></i><div><small>{{ entry[0] }}</small><strong>{{ entry[1] }}</strong><span>{{ entry[2] }}</span></div></li></ol></article>
      </section>

      <section id="honors" class="about-panel about-hobbies-panel"><h2><span class="panel-icon">♡</span>兴趣爱好</h2><div class="hobby-grid"><div v-for="hobby in hobbies" :key="hobby[1]" class="hobby-item"><span>{{ hobby[0] }}</span><div><strong>{{ hobby[1] }}</strong><small>{{ hobby[2] }}</small></div></div></div></section>
    </div>
  </main>
</template>
