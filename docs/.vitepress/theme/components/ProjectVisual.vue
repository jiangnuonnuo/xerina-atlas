<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ kind?: string }>()
const visualKinds = new Set(['atlas', 'ai', 'domain', 'platform', 'skills'])
const visualKind = computed(() => visualKinds.has(props.kind || '') ? props.kind! : 'atlas')
</script>

<template>
  <div class="project-visual" :class="`project-visual-${visualKind}`" aria-hidden="true">
    <template v-if="visualKind === 'domain'">
      <div class="order-lines"><i></i><i></i><i></i><i></i></div>
      <div class="order-status">ORDER<br /><b>READY</b></div>
    </template>
    <template v-else-if="visualKind === 'platform'">
      <div class="platform-flow">
        <div class="platform-node"><b>QUEUE</b><span>ASYNC</span></div>
        <i class="platform-connector"></i>
        <div class="platform-node platform-node-main"><b>WORKER</b><span>RETRY / DLQ</span></div>
        <i class="platform-connector"></i>
        <div class="platform-node"><b>OSS</b><span>DIRECT</span></div>
      </div>
      <div class="platform-status">MESSAGE<br /><b>DELIVERED</b></div>
    </template>
    <template v-else-if="visualKind === 'skills'">
      <div class="skills-grid"></div>
      <div class="skills-network">
        <i class="skills-link skills-link-a"></i><i class="skills-link skills-link-b"></i><i class="skills-link skills-link-c"></i>
        <span class="skills-node skills-node-core">V</span><span class="skills-node skills-node-a">01</span><span class="skills-node skills-node-b">02</span><span class="skills-node skills-node-c">03</span>
      </div>
      <span class="skills-word">V-TEAM</span><span class="skills-caption">JUDGE<br />DESIGN<br />DELIVER</span>
    </template>
    <template v-else-if="visualKind === 'ai'">
      <span class="lab-cross cross-a"></span><span class="lab-cross cross-b"></span>
      <div class="lab-core">AI<br /><b>AGENT</b></div>
      <span class="lab-axis axis-x"></span><span class="lab-axis axis-y"></span>
    </template>
    <template v-else>
      <div class="visual-grid"></div><span class="visual-word">ATLAS</span><span class="visual-caption">CONTENT<br />KNOWLEDGE<br />SYSTEM</span>
    </template>
  </div>
</template>
