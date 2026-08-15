<script setup lang="ts">
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  Download,
  Github,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-vue-next";
import { articles, competitions, profile, projects } from "../../data/site";
import ProjectCard from "./ProjectCard.vue";
import SectionHeading from "./SectionHeading.vue";

const featuredProjects = projects.filter((project) => project.featured).slice(0, 2);
const latestArticles = articles.slice(0, 3);
</script>

<template>
  <main id="main-content" class="custom-page home-page">
    <section class="hero-shell" aria-labelledby="hero-title">
      <div class="hero-copy">
        <div class="status-pill">
          <span class="status-dot" aria-hidden="true"></span>
          {{ profile.availability }}
        </div>
        <p class="hero-overline">Hello, I&apos;m</p>
        <h1 id="hero-title">{{ profile.name }}</h1>
        <p class="hero-role">{{ profile.role }}</p>
        <p class="hero-tagline">{{ profile.tagline }}</p>
        <div class="hero-actions" aria-label="主要操作">
          <a class="button button--primary" href="/projects/">
            查看项目
            <ArrowRight :size="18" aria-hidden="true" />
          </a>
          <a class="button button--secondary" :href="profile.resumeUrl" download="Xerina-Resume.md">
            <Download :size="18" aria-hidden="true" />
            下载简历
          </a>
        </div>
        <div class="hero-contact">
          <a :href="`mailto:${profile.email}`">
            <Mail :size="17" aria-hidden="true" />
            {{ profile.email }}
          </a>
          <span>
            <MapPin :size="17" aria-hidden="true" />
            {{ profile.location }}
          </span>
        </div>
      </div>

      <aside class="signal-card" aria-label="Xerina 求职信息摘要">
        <div class="signal-card__header">
          <span>Candidate snapshot</span>
          <span class="signal-card__code">XA / 26</span>
        </div>
        <div class="signal-card__identity">
          <div class="monogram" aria-hidden="true">X</div>
          <div>
            <strong>{{ profile.name }}</strong>
            <span>{{ profile.role }}</span>
          </div>
        </div>
        <dl class="signal-list">
          <div>
            <dt>教育</dt>
            <dd>{{ profile.education.degree }}</dd>
          </div>
          <div>
            <dt>毕业时间</dt>
            <dd>2026 年</dd>
          </div>
          <div>
            <dt>技术重点</dt>
            <dd>Java · DDD · AI</dd>
          </div>
        </dl>
        <div class="signal-card__footer">
          <CheckCircle2 :size="18" aria-hidden="true" />
          <span>可投递 · 可面试 · 作品可验证</span>
        </div>
      </aside>
    </section>

    <section class="content-section intro-grid" aria-labelledby="profile-title">
      <div class="intro-main">
        <p class="eyebrow">01 / PROFILE</p>
        <h2 id="profile-title">不只展示技术名词，<br />更展示解决问题的过程。</h2>
        <p>{{ profile.summary }}</p>
      </div>
      <div class="advantage-list">
        <article v-for="(advantage, index) in profile.advantages" :key="advantage">
          <span>0{{ index + 1 }}</span>
          <p>{{ advantage }}</p>
        </article>
      </div>
    </section>

    <section class="content-section" aria-labelledby="skills-title">
      <SectionHeading
        eyebrow="02 / CAPABILITIES"
        title="能力栈"
        description="围绕交付完整系统组织能力，而不是堆叠孤立关键词。"
      />
      <div class="skill-grid">
        <article v-for="skill in profile.skills" :key="skill.group" class="skill-card">
          <span class="skill-card__index">{{ String(profile.skills.indexOf(skill) + 1).padStart(2, "0") }}</span>
          <h3>{{ skill.group }}</h3>
          <ul>
            <li v-for="item in skill.items" :key="item">{{ item }}</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="content-section" aria-labelledby="projects-title">
      <SectionHeading
        eyebrow="03 / SELECTED WORK"
        title="代表项目"
        description="每个项目都说明背景、职责、架构判断、难点与可验证成果。"
        action-label="查看全部项目"
        action-href="/projects/"
      />
      <div class="project-grid project-grid--featured">
        <ProjectCard v-for="project in featuredProjects" :key="project.slug" :project="project" />
      </div>
    </section>

    <section class="content-section split-section" aria-labelledby="experience-preview-title">
      <div class="split-section__primary">
        <SectionHeading eyebrow="04 / JOURNEY" title="教育与经历" />
        <div class="education-card">
          <div class="education-card__icon"><BookOpen :size="22" aria-hidden="true" /></div>
          <div>
            <span>{{ profile.education.period }}</span>
            <h3>{{ profile.education.degree }}</h3>
            <p>{{ profile.education.focus }}</p>
          </div>
        </div>
        <a class="text-link text-link--standalone" href="/experience">
          查看完整时间线 <ArrowRight :size="17" aria-hidden="true" />
        </a>
      </div>
      <div class="split-section__secondary">
        <div class="mini-heading">
          <BriefcaseBusiness :size="20" aria-hidden="true" />
          <span>竞赛与实践</span>
        </div>
        <article v-for="competition in competitions" :key="competition.name" class="competition-row">
          <span>{{ competition.year }}</span>
          <div>
            <h3>{{ competition.name }}</h3>
            <p>{{ competition.result }} · {{ competition.focus }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="content-section" aria-labelledby="articles-title">
      <SectionHeading
        eyebrow="05 / WRITING"
        title="最近在写"
        description="以写作检验理解，把项目判断沉淀成可复用的方法。"
        action-label="浏览全部文章"
        action-href="/articles/"
      />
      <div class="article-list article-list--home">
        <article v-for="article in latestArticles" :key="article.href" class="article-row">
          <a class="card-hit-area" :href="article.href" :aria-label="`阅读文章：${article.title}`"></a>
          <div class="article-row__meta">
            <span>{{ article.category }}</span>
            <time :datetime="article.date">{{ article.date }}</time>
          </div>
          <div class="article-row__content">
            <h3>{{ article.title }}</h3>
            <p>{{ article.description }}</p>
          </div>
          <ArrowRight class="article-row__arrow" :size="20" aria-hidden="true" />
        </article>
      </div>
    </section>

    <section class="contact-section" aria-labelledby="contact-title">
      <div>
        <p class="eyebrow">06 / CONTACT</p>
        <h2 id="contact-title">如果你正在寻找认真、清晰、<br />能把事情做完的工程师。</h2>
      </div>
      <div class="contact-section__actions">
        <p>欢迎聊聊岗位、项目，或任何值得深入的技术问题。</p>
        <a class="button button--light" :href="`mailto:${profile.email}`">
          <Mail :size="18" aria-hidden="true" />
          给我发邮件
        </a>
        <a class="button button--ghost-light" :href="profile.github" target="_blank" rel="noreferrer">
          <Github :size="18" aria-hidden="true" />
          GitHub
        </a>
      </div>
      <Sparkles class="contact-section__mark" :size="28" aria-hidden="true" />
    </section>
  </main>
</template>

