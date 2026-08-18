<script setup lang="ts">
import { withBase } from 'vitepress'

defineProps<{
  href: string
  title: string
  meta?: string
}>()
</script>

<template>
  <a class="download-link" :href="withBase(href)" download><span>{{ title }}</span><small>{{ meta || '下载附件' }}</small><b aria-hidden="true">↓</b></a>
</template>
