<script setup lang="ts">
defineProps<{ kind?: string }>()
</script>

<template>
  <div class="project-visual" :class="`project-visual-${kind || 'atlas'}`">
    <template v-if="kind === 'domain'">
      <div class="order-lines"><i></i><i></i><i></i><i></i></div>
      <div class="order-status">ORDER<br /><b>READY</b></div>
    </template>
    <template v-else-if="kind === 'ai'">
      <span class="lab-cross cross-a"></span><span class="lab-cross cross-b"></span>
      <div class="lab-core">AI<br /><b>AGENT</b></div>
      <span class="lab-axis axis-x"></span><span class="lab-axis axis-y"></span>
    </template>
    <template v-else>
      <div class="visual-grid"></div><span class="visual-word">ATLAS</span><span class="visual-caption">CONTENT<br />KNOWLEDGE<br />SYSTEM</span>
    </template>
  </div>
</template>
