<script setup lang="ts">
import { computed } from 'vue'
import ItemIcon from './ItemIcon.vue'

const props = defineProps<{ kind?: string, icon?: string, index?: number }>()
const visualKinds = new Set(['aigc-backend', 'field-intelligence', 'spreadsheet-skills'])
const visualKind = computed(() => visualKinds.has(props.kind || '') ? props.kind! : 'field-intelligence')
const sequence = computed(() => String((props.index || 0) + 1).padStart(2, '0'))
</script>

<template>
  <div class="experience-index-visual" :class="`experience-visual-${visualKind}`" aria-hidden="true">
    <span class="experience-visual-sequence">{{ sequence }}</span>
    <span class="experience-visual-icon"><ItemIcon :name="icon" :size="42" :stroke-width="1.45" /></span>

    <template v-if="visualKind === 'aigc-backend'">
      <div class="experience-queue"><i>REQ</i><b></b><i>MQ</i><b></b><i>AI</i></div>
      <div class="experience-visual-label">ASYNC BACKEND<br /><strong>RELIABLE PIPELINE</strong></div>
    </template>
    <template v-else-if="visualKind === 'spreadsheet-skills'">
      <div class="experience-sheet"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="experience-sheet-flow"><span>INPUT</span><b></b><span>SKILL</span><b></b><span>WRITE</span></div>
      <div class="experience-visual-label">SHEET WORKFLOW<br /><strong>SKILLS DELIVERY</strong></div>
    </template>
    <template v-else>
      <div class="experience-capture-frame"><i></i><i></i><i></i><i></i><span></span></div>
      <div class="experience-field-tree"><i></i><i></i><i></i><i></i></div>
      <div class="experience-visual-label">FIELD CAPTURE<br /><strong>AGENT PARSING</strong></div>
    </template>
  </div>
</template>
