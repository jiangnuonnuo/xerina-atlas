<script setup lang="ts">
import { useRoute } from 'vitepress'
import { relativeUrl } from '../utils/relative-url'

defineProps<{
  href: string
  title: string
  meta?: string
}>()

const route = useRoute()
const url = (path: string) => relativeUrl(path, route.path)
</script>

<template>
  <a class="download-link" :href="url(href)" download><span>{{ title }}</span><small>{{ meta || '下载附件' }}</small><b aria-hidden="true">↓</b></a>
</template>
