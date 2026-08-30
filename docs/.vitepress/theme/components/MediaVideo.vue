<script setup lang="ts">
import { useRoute } from 'vitepress'
import { relativeUrl } from '../utils/relative-url'

defineProps<{
  src: string
  title: string
  poster?: string
  captions?: string
}>()

const route = useRoute()
const url = (path: string) => relativeUrl(path, route.path)
</script>

<template>
  <figure class="media-video">
    <video controls playsinline preload="metadata" :poster="poster ? url(poster) : undefined" :aria-label="title">
      <source :src="url(src)" type="video/mp4" />
      <track v-if="captions" kind="captions" :src="url(captions)" srclang="zh-CN" label="中文" default />
      当前浏览器不支持视频播放，请<a :href="url(src)">下载视频</a>。
    </video>
    <figcaption>{{ title }}</figcaption>
  </figure>
</template>
