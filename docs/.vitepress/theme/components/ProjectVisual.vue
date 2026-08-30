<script setup lang="ts">
import { computed } from 'vue'
import ItemIcon from './ItemIcon.vue'

const props = defineProps<{ kind?: string, icon?: string }>()
const visualKinds = new Set(['skills', 'mcp', 'ssh', 'aigc', 'lexicon'])
const visualKind = computed(() => visualKinds.has(props.kind || '') ? props.kind! : 'lexicon')
</script>

<template>
  <div class="project-visual" :class="`project-visual-${visualKind}`" aria-hidden="true">
    <div class="project-visual-icon"><ItemIcon :name="icon" :size="44" :stroke-width="1.45" /></div>
    <template v-if="visualKind === 'mcp'">
      <div class="mcp-orbit"><i></i><i></i><i></i><i></i></div>
      <div class="visual-system-label">MCP<br /><b>GATEWAY</b></div>
    </template>
    <template v-else-if="visualKind === 'ssh'">
      <div class="terminal-lines"><i></i><i></i><i></i><i></i></div>
      <div class="visual-system-label">SSH<br /><b>AGENT</b></div>
    </template>
    <template v-else-if="visualKind === 'aigc'">
      <div class="aigc-frames"><i></i><i></i><i></i></div>
      <div class="visual-system-label">AIGC<br /><b>PIPELINE</b></div>
    </template>
    <template v-else-if="visualKind === 'skills'">
      <div class="skills-grid"></div>
      <div class="skills-network">
        <i class="skills-link skills-link-a"></i><i class="skills-link skills-link-b"></i><i class="skills-link skills-link-c"></i>
        <span class="skills-node skills-node-a">01</span><span class="skills-node skills-node-b">02</span><span class="skills-node skills-node-c">03</span>
      </div>
      <div class="visual-system-label">V-TEAM<br /><b>DELIVERY</b></div>
    </template>
    <template v-else>
      <div class="lexicon-tree"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="visual-system-label">LEXICON<br /><b>FIELD TREE</b></div>
    </template>
  </div>
</template>
