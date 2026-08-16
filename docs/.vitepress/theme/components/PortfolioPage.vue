<script setup lang="ts">
import { data as profile } from '../../data/profile.data'
import { data as projects } from '../../data/projects.data'
import { withBase } from 'vitepress'
import ProjectVisual from './ProjectVisual.vue'

function url(path: string) {
  return withBase(path)
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
  <main class="page page-portfolio is-active">
    <div class="container page-container">
      <section class="page-intro portfolio-intro">
        <div>
          <span class="section-index">04 / PORTFOLIO</span>
          <h1>项目之外，<br /><em>也留下真实的答案。</em></h1>
          <p>这里集中展示我参与过的项目实践，以及在竞赛中持续训练问题分析、代码实现和协作能力留下的结果。</p>
        </div>
        <div class="portfolio-intro-meta"><strong>{{ projects.length + (profile.honors || []).length }}</strong><span>PROJECTS / HONORS</span><small>可继续展开为项目文档、实习经历和技术文章</small></div>
      </section>

      <section class="section-block portfolio-projects">
        <div class="section-heading"><div><span class="section-index">01 / PROJECT WORK</span><h2>项目作品</h2></div><a class="section-link" :href="url('/projects/')">项目快速了解 <span aria-hidden="true">↗</span></a></div>
        <div class="portfolio-project-grid">
          <article v-for="(project, index) in projects" :key="project.slug" class="portfolio-project-card">
            <div class="portfolio-project-media"><ProjectVisual :kind="project.frontmatter.visual" /><span class="portfolio-project-number">{{ String(index + 1).padStart(2, '0') }}</span></div>
            <div class="portfolio-project-copy"><div class="tag-row"><span v-for="tag in (project.frontmatter.stack || []).slice(0, 4)" :key="tag">{{ tag }}</span></div><h3>{{ project.frontmatter.title }}</h3><p>{{ project.frontmatter.summary }}</p><a class="card-arrow" :href="url(project.url)">进入项目文档 <span aria-hidden="true">↗</span></a></div>
          </article>
        </div>
      </section>

      <section id="honors" class="section-block portfolio-honors">
        <div class="section-heading"><div><span class="section-index">02 / COMPETITIONS &amp; HONORS</span><h2>竞赛与荣誉</h2></div><a class="section-link" :href="url('/about/#honors')">关于我的完整信息 <span aria-hidden="true">↗</span></a></div>
        <div class="portfolio-honor-list"><div v-for="honor in (profile.honors || [])" :key="honorText(honor)" class="portfolio-honor-row"><span>{{ honorYear(honor) }}</span><strong>{{ honorText(honor) }}</strong><i aria-hidden="true">↗</i></div></div>
      </section>

      <section class="portfolio-cta"><div><span class="section-index">03 / NEXT STEP</span><h2>想继续了解我的项目实践？</h2><p>可以从项目文档开始，也可以直接下载简历了解完整经历。</p></div><div class="hero-actions"><a class="button button-primary" :href="url('/projects/')">查看项目 <span aria-hidden="true">↗</span></a><a class="button button-secondary" :href="url('/resume/xerina-java-backend-resume.pdf')" download>下载简历 <span aria-hidden="true">↓</span></a></div></section>
    </div>
  </main>
</template>
