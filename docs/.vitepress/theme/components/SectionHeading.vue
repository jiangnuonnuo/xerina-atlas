<script setup lang="ts">
defineProps<{
  eyebrow: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}>();
</script>

<template>
  <header class="section-heading">
    <div>
      <p class="eyebrow">{{ eyebrow }}</p>
      <h2>{{ title }}</h2>
      <p v-if="description" class="section-description">{{ description }}</p>
    </div>
    <a v-if="actionLabel && actionHref" class="text-link" :href="actionHref">
      {{ actionLabel }}
      <span aria-hidden="true">→</span>
    </a>
  </header>
</template>

