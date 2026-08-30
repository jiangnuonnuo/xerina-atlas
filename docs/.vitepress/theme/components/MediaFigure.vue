<script setup lang="ts">
import { useRoute } from 'vitepress'
import { relativeUrl } from '../utils/relative-url'

defineProps<{
  src: string
  alt: string
  caption?: string
}>()

const route = useRoute()
const url = (path: string) => relativeUrl(path, route.path)
</script>

<template>
  <figure class="media-figure">
    <img :src="url(src)" :alt="alt" loading="lazy" decoding="async" />
    <figcaption v-if="caption">{{ caption }}</figcaption>
  </figure>
</template>
