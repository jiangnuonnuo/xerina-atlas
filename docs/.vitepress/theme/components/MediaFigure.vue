<script setup lang="ts">
import { withBase } from 'vitepress'

defineProps<{
  src: string
  alt: string
  caption?: string
}>()
</script>

<template>
  <figure class="media-figure">
    <img :src="withBase(src)" :alt="alt" loading="lazy" decoding="async" />
    <figcaption v-if="caption">{{ caption }}</figcaption>
  </figure>
</template>
