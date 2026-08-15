<script setup lang="ts">
import { ArrowUpRight } from "lucide-vue-next";
import type { Project } from "../../data/site";

defineProps<{ project: Project; compact?: boolean }>();
</script>

<template>
  <article class="project-card" :class="{ 'project-card--compact': compact }">
    <a class="card-hit-area" :href="`/projects/${project.slug}`" :aria-label="`查看项目：${project.title}`"></a>
    <div class="project-card__top">
      <span class="card-kicker">{{ project.category }}</span>
      <ArrowUpRight :size="20" :stroke-width="1.8" aria-hidden="true" />
    </div>
    <div>
      <p class="project-card__year">{{ project.year }} · {{ project.status }}</p>
      <h3>{{ project.title }}</h3>
      <p>{{ project.description }}</p>
    </div>
    <ul class="tag-list" aria-label="项目技术栈">
      <li v-for="technology in project.technologies" :key="technology">{{ technology }}</li>
    </ul>
  </article>
</template>

