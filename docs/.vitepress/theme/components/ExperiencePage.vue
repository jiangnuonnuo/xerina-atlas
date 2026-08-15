<script setup lang="ts">
import { ArrowRight, Award, BookOpen, BriefcaseBusiness } from "lucide-vue-next";
import { competitions, experiences, profile } from "../../data/site";

const icons = {
  教育: BookOpen,
  实习: BriefcaseBusiness,
  竞赛: Award,
};
</script>

<template>
  <main id="main-content" class="custom-page inner-page experience-page">
    <header class="page-hero page-hero--split">
      <div>
        <p class="eyebrow">EXPERIENCE</p>
        <h1>经历不是清单，<br />而是一条能力增长曲线。</h1>
      </div>
      <p>{{ profile.summary }} 下面按时间说明学习、实践与复盘如何互相支撑。</p>
    </header>

    <section class="timeline" aria-label="个人经历时间线">
      <article v-for="experience in experiences" :key="experience.period + experience.title" class="timeline-item">
        <div class="timeline-item__rail">
          <span class="timeline-item__dot" aria-hidden="true"></span>
          <time>{{ experience.period }}</time>
        </div>
        <div class="timeline-item__card">
          <div class="timeline-item__type">
            <component :is="icons[experience.type as keyof typeof icons]" :size="18" aria-hidden="true" />
            {{ experience.type }}
          </div>
          <h2>{{ experience.title }}</h2>
          <p class="timeline-item__organization">{{ experience.organization }}</p>
          <p>{{ experience.summary }}</p>
          <ul class="detail-list">
            <li v-for="highlight in experience.highlights" :key="highlight">{{ highlight }}</li>
          </ul>
        </div>
      </article>
    </section>

    <section class="content-section experience-awards" aria-labelledby="awards-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">COMPETITIONS</p>
          <h2 id="awards-title">竞赛与协作</h2>
          <p class="section-description">结果是阶段性反馈，更重要的是在有限时间里完成取舍与交付。</p>
        </div>
      </div>
      <div class="award-grid">
        <article v-for="competition in competitions" :key="competition.name" class="award-card">
          <div><span>{{ competition.year }}</span><strong>{{ competition.result }}</strong></div>
          <h3>{{ competition.name }}</h3>
          <p>{{ competition.focus }}</p>
        </article>
      </div>
    </section>

    <section class="next-step-panel">
      <div>
        <p class="eyebrow">NEXT</p>
        <h2>从经历继续看作品证据</h2>
      </div>
      <a class="button button--primary" href="/projects/">
        查看项目 <ArrowRight :size="18" aria-hidden="true" />
      </a>
    </section>
  </main>
</template>

