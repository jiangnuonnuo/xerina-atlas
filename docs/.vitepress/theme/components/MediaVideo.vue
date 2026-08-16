<script setup lang="ts">
import { withBase } from 'vitepress'

defineProps<{
  src: string
  title: string
  poster?: string
  captions?: string
}>()
</script>

<template>
  <figure class="media-video">
    <video controls playsinline preload="metadata" :poster="poster ? withBase(poster) : undefined" :aria-label="title">
      <source :src="withBase(src)" type="video/mp4" />
      <track v-if="captions" kind="captions" :src="withBase(captions)" srclang="zh-CN" label="中文" default />
      当前浏览器不支持视频播放，请<a :href="withBase(src)">下载视频</a>。
    </video>
    <figcaption>{{ title }}</figcaption>
  </figure>
</template>
