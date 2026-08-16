<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'

const props = defineProps<{
  src: string
  title: string
  poster: string
  description?: string
}>()

const loaded = ref(false)
const safeSource = computed(() => props.src.startsWith('/media/') ? withBase(props.src) : '')
const safePoster = computed(() => withBase(props.poster))
</script>

<template>
  <figure class="interactive-diagram">
    <div class="interactive-diagram-preview"><img :src="safePoster" :alt="description || title" loading="lazy" decoding="async" /><div class="interactive-diagram-overlay"><span>{{ title }}</span><button v-if="safeSource" type="button" @click="loaded = true">交互查看</button><a :href="safeSource || safePoster" target="_blank" rel="noreferrer">打开完整图 ↗</a></div><iframe v-if="loaded && safeSource" :src="safeSource" :title="title" loading="lazy" sandbox="allow-scripts allow-same-origin" /></div>
    <figcaption><strong>{{ title }}</strong><span v-if="description">{{ description }}</span></figcaption>
  </figure>
</template>
