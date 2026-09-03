<script setup lang="ts">
import ItemIcon from './ItemIcon.vue'

withDefaults(defineProps<{
  src: string
  alt: string
  label: string
  icon?: string
}>(), {
  icon: 'workflow',
})
</script>

<template>
  <span class="content-card-media">
    <img class="content-card-media-image" :src="src" :alt="alt" loading="lazy" decoding="async" />
    <span class="content-card-media-badge"><ItemIcon :name="icon" :size="13" :stroke-width="1.8" />{{ label }}</span>
  </span>
</template>
