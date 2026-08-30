<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'
import { relativeUrl } from '../utils/relative-url'

export type PetState =
  | 'idle'
  | 'running-right'
  | 'running-left'
  | 'waving'
  | 'jumping'
  | 'failed'
  | 'waiting'
  | 'running'
  | 'review'
  | 'look'

const props = withDefaults(
  defineProps<{
    state?: PetState
    direction?: number
    scale?: number
    label?: string
  }>(),
  {
    state: 'idle',
    direction: 0,
    scale: 0.58,
    label: 'Xerina 桌宠',
  },
)
const route = useRoute()

const rows: Record<Exclude<PetState, 'look'>, { row: number; durations: number[] }> = {
  idle: { row: 0, durations: [280, 110, 110, 140, 140, 320] },
  'running-right': { row: 1, durations: [120, 120, 120, 120, 120, 120, 120, 220] },
  'running-left': { row: 2, durations: [120, 120, 120, 120, 120, 120, 120, 220] },
  waving: { row: 3, durations: [140, 140, 140, 280] },
  jumping: { row: 4, durations: [140, 140, 140, 140, 280] },
  failed: { row: 5, durations: [140, 140, 140, 140, 140, 140, 140, 240] },
  waiting: { row: 6, durations: [150, 150, 150, 150, 150, 260] },
  running: { row: 7, durations: [120, 120, 120, 120, 120, 220] },
  review: { row: 8, durations: [150, 150, 150, 150, 150, 280] },
}

const frame = ref(0)
const reduceMotion = ref(false)
let timer: number | undefined

const lookIndex = computed(() => Math.round(((props.direction % 360) + 360) % 360 / 22.5) % 16)
const row = computed(() => (props.state === 'look' ? (lookIndex.value < 8 ? 9 : 10) : rows[props.state].row))
const column = computed(() => (props.state === 'look' ? lookIndex.value % 8 : frame.value))

const spriteStyle = computed(() => ({
  width: `${192 * props.scale}px`,
  height: `${208 * props.scale}px`,
  backgroundImage: `url(${relativeUrl('/pets/xerina/spritesheet.webp', route.path)})`,
  backgroundPosition: `${(column.value * 100) / 7}% ${row.value * 10}%`,
}))

function stopAnimation() {
  if (timer != null) window.clearTimeout(timer)
  timer = undefined
}

function scheduleFrame() {
  stopAnimation()
  if (reduceMotion.value || props.state === 'look') {
    frame.value = 0
    return
  }

  const durations = rows[props.state].durations
  timer = window.setTimeout(() => {
    frame.value = (frame.value + 1) % durations.length
    scheduleFrame()
  }, durations[frame.value] || durations[0])
}

watch(
  () => props.state,
  () => {
    frame.value = 0
    scheduleFrame()
  },
)

onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  scheduleFrame()
})

onBeforeUnmount(stopAnimation)
</script>

<template>
  <span class="pet-sprite" role="img" :aria-label="label" :style="spriteStyle"></span>
</template>
