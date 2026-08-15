<script setup lang="ts">
import { ArrowRight, Download, Github, Mail, MapPin } from "lucide-vue-next";
import { profile } from "../../data/site";
</script>

<template>
  <main id="main-content" class="custom-page inner-page about-page">
    <header class="about-hero">
      <div class="about-portrait" aria-label="Xerina 字母头像">
        <span>X</span>
        <small>XA · 2026</small>
      </div>
      <div class="about-hero__copy">
        <p class="eyebrow">ABOUT XERINA</p>
        <h1>我喜欢把模糊的问题，<br />整理成可以运行、可以验证的系统。</h1>
        <p>{{ profile.summary }}</p>
        <div class="hero-contact">
          <span><MapPin :size="17" aria-hidden="true" />{{ profile.location }}</span>
          <a :href="`mailto:${profile.email}`"><Mail :size="17" aria-hidden="true" />{{ profile.email }}</a>
        </div>
      </div>
    </header>

    <section class="about-content-grid">
      <div class="about-narrative">
        <p class="eyebrow">HOW I WORK</p>
        <h2>先理解约束，再选择技术。</h2>
        <p>
          我不会把框架名称当成答案。开始实现前，我会先确认用户任务、系统边界、失败路径与验收方式；实现过程中，用小步交付和自动化验证降低不确定性。
        </p>
        <p>
          写作是我的第二套测试工具。把一个决定写清楚，往往能暴露概念混淆、隐含假设和没有验证的结论。这个站点既是作品集，也是一份持续更新的工程日志。
        </p>
      </div>
      <aside class="about-principles" aria-label="工作原则">
        <article v-for="(advantage, index) in profile.advantages" :key="advantage">
          <span>{{ String(index + 1).padStart(2, "0") }}</span>
          <p>{{ advantage }}</p>
        </article>
      </aside>
    </section>

    <section class="about-links" aria-labelledby="about-links-title">
      <div>
        <p class="eyebrow">LET&apos;S TALK</p>
        <h2 id="about-links-title">获取更完整的信息</h2>
        <p>简历适合快速流转，项目和文章适合继续验证我的思考与实现能力。</p>
      </div>
      <div class="about-links__actions">
        <a class="button button--primary" :href="profile.resumeUrl" download="Xerina-Resume.md">
          <Download :size="18" aria-hidden="true" />下载简历
        </a>
        <a class="button button--secondary" :href="`mailto:${profile.email}`">
          <Mail :size="18" aria-hidden="true" />联系我
        </a>
        <a class="button button--text" :href="profile.github" target="_blank" rel="noreferrer">
          <Github :size="18" aria-hidden="true" />GitHub <ArrowRight :size="17" aria-hidden="true" />
        </a>
      </div>
    </section>
  </main>
</template>

