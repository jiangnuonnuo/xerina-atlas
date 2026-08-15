<script setup lang="ts">
import { Printer } from "lucide-vue-next";
import { experiences, profile, projects } from "../../data/site";

const printResume = () => window.print();
</script>

<template>
  <main id="main-content" class="custom-page resume-page">
    <header class="resume-toolbar">
      <a href="/about">返回关于页</a>
      <button type="button" class="button button--primary" @click="printResume">
        <Printer :size="18" aria-hidden="true" />打印 / 保存为 PDF
      </button>
    </header>
    <article class="resume-sheet">
      <header>
        <div>
          <p class="eyebrow">RESUME</p>
          <h1>{{ profile.name }}</h1>
          <p class="resume-role">{{ profile.role }}</p>
        </div>
        <address>
          <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
          <span>{{ profile.location }}</span>
        </address>
      </header>
      <section>
        <h2>个人概述</h2>
        <p>{{ profile.summary }}</p>
      </section>
      <section>
        <h2>核心能力</h2>
        <div class="resume-skills">
          <div v-for="skill in profile.skills" :key="skill.group">
            <strong>{{ skill.group }}</strong><span>{{ skill.items.join(" / ") }}</span>
          </div>
        </div>
      </section>
      <section>
        <h2>经历</h2>
        <article v-for="experience in experiences" :key="experience.title" class="resume-entry">
          <div><strong>{{ experience.title }}</strong><time>{{ experience.period }}</time></div>
          <p>{{ experience.organization }} · {{ experience.summary }}</p>
        </article>
      </section>
      <section>
        <h2>代表项目</h2>
        <article v-for="project in projects.slice(0, 2)" :key="project.slug" class="resume-entry">
          <div><strong>{{ project.title }}</strong><time>{{ project.year }}</time></div>
          <p>{{ project.description }}</p>
        </article>
      </section>
    </article>
  </main>
</template>

