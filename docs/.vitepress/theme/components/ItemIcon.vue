<script setup lang="ts">
import { computed } from 'vue'
import {
  FileSpreadsheet,
  ImagePlus,
  ListTree,
  Network,
  ScanSearch,
  ServerCog,
  SquareTerminal,
  Workflow,
} from '@lucide/vue'

const props = withDefaults(defineProps<{
  name?: string
  size?: number
  strokeWidth?: number
}>(), {
  name: 'workflow',
  size: 24,
  strokeWidth: 1.7,
})

const icons = {
  'file-spreadsheet': FileSpreadsheet,
  'image-plus': ImagePlus,
  'list-tree': ListTree,
  network: Network,
  'scan-search': ScanSearch,
  'server-cog': ServerCog,
  terminal: SquareTerminal,
  workflow: Workflow,
}

const icon = computed(() => icons[props.name as keyof typeof icons] || Workflow)
</script>

<template>
  <component :is="icon" :size="size" :stroke-width="strokeWidth" aria-hidden="true" />
</template>
