<script setup lang="ts">
import { computed, ref } from "vue";
import { projects } from "../../data/site";
import ProjectCard from "./ProjectCard.vue";

const categories = ["全部", ...new Set(projects.map((project) => project.category))];
const activeCategory = ref("全部");
const filteredProjects = computed(() =>
  activeCategory.value === "全部"
    ? projects
    : projects.filter((project) => project.category === activeCategory.value),
);
</script>

<template>
  <main id="main-content" class="custom-page inner-page projects-page">
    <header class="page-hero">
      <p class="eyebrow">PROJECTS</p>
      <h1>项目是能力最短的证明路径。</h1>
      <p>不只列出“用了什么”，更说明为什么这样设计、我负责什么，以及结果如何被验证。</p>
    </header>

    <div class="filter-bar" aria-label="按项目类型筛选">
      <span>筛选</span>
      <div class="filter-options">
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          :class="{ active: activeCategory === category }"
          :aria-pressed="activeCategory === category"
          @click="activeCategory = category"
        >
          {{ category }}
        </button>
      </div>
      <span class="filter-count">{{ filteredProjects.length }} 个项目</span>
    </div>

    <TransitionGroup name="filter-list" tag="section" class="project-grid project-grid--all" aria-live="polite">
      <ProjectCard v-for="project in filteredProjects" :key="project.slug" :project="project" />
    </TransitionGroup>
  </main>
</template>

