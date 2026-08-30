<script setup lang="ts">
import { data as profile } from '../../data/profile.data'
import { Content, useRoute } from 'vitepress'
import { relativeUrl } from '../utils/relative-url'

function value(key: string, fallback = '') { return profile[key] || fallback }
const route = useRoute()
const url = (path: string) => relativeUrl(path, route.path)
</script>

<template>
  <main class="page page-about is-active">
    <div class="container page-container">
      <section class="about-hero">
        <div>
          <span class="section-index">04 / ABOUT XERINA</span>
          <h1>把工程能力，<br /><em>变成可复用的表达。</em></h1>
          <p>{{ value('aboutLead', '我关注后端系统如何稳定运行，也关注复杂技术如何被清楚地解释、复盘和继续使用。') }}</p>
        </div>
        <div class="about-portrait">
          <div class="portrait-frame"><span class="portrait-label">PROFILE / XERINA</span><span class="portrait-shape shape-one"></span><span class="portrait-shape shape-two"></span><div class="portrait-initial">X<span>.</span></div><span class="portrait-caption">JAVA BACKEND<br />AI APPLICATION<br />SYSTEM DESIGN</span></div>
          <div class="portrait-meta"><span>PUTIAN / CN</span><span>2023 — 2027</span></div>
        </div>
      </section>

      <section class="about-grid section-block">
        <aside class="about-side"><span class="toc-title">ON THIS PAGE</span><a href="#profile">个人介绍</a><a href="#education">教育背景</a><a href="#skills">技能栈</a><a href="#honors">竞赛与荣誉</a><a href="#contact">联系方式</a></aside>
        <article class="about-article">
          <section id="profile" class="about-section"><h2>个人介绍</h2><Content /></section>
          <section id="education" class="about-section"><h2>教育背景</h2><div class="about-facts"><div><span>学校</span><strong>{{ value('educationSchool', '莆田学院') }}</strong></div><div><span>专业</span><strong>{{ value('educationMajor', '数据科学与大数据技术') }}</strong></div><div><span>时间</span><strong>{{ value('educationPeriod', '2023-09 — 2027-06') }}</strong></div></div></section>
          <section id="skills" class="about-section"><h2>相关技能</h2><div class="skill-cloud"><span v-for="skill in (profile.skills || [])" :key="skill.name || skill">{{ skill.name || skill }}</span></div></section>
          <section id="honors" class="about-section"><h2>竞赛与荣誉</h2><ul class="honor-list"><li v-for="honor in (profile.honors || [])" :key="honor">{{ honor }}</li></ul></section>
          <section id="contact" class="about-section about-contact"><h2>联系方式</h2><p>如果你想了解项目细节、实习经历或 Java 后端方向，可以通过以下方式联系我。</p><div class="contact-links"><a :href="`mailto:${value('email', 'hsq_hi@126.com')}`">{{ value('email', 'hsq_hi@126.com') }}</a><a :href="`tel:${value('phone', '13437972251')}`">{{ value('phone', '13437972251') }}</a><a :href="value('githubUrl', 'https://github.com/jiangnuonnuo')" target="_blank" rel="noreferrer">GitHub / jiangnuonnuo</a><a :href="url('/resume/xerina-java-backend-resume.pdf')" download>下载简历 ↗</a></div></section>
        </article>
      </section>
    </div>
  </main>
</template>
