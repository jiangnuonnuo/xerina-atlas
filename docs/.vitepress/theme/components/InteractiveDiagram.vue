<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vitepress'
import { isLocalUrl, relativeUrl } from '../utils/relative-url'

const props = defineProps<{
  src: string
  title: string
  poster: string
  description?: string
}>()
const route = useRoute()

// Diagrams are interactive by default — no click / poster gate.
const loaded = ref(true)
const expanded = ref(false)
const preview = ref<HTMLElement | null>(null)
const frame = ref<HTMLIFrameElement | null>(null)
const modalFrame = ref<HTMLIFrameElement | null>(null)
const frameHeight = ref('520px')
let previewObserver: ResizeObserver | null = null

const safeSource = computed(() => (isLocalUrl(props.src) ? relativeUrl(props.src, route.path) : ''))
const safePoster = computed(() => (isLocalUrl(props.poster) ? relativeUrl(props.poster, route.path) : ''))

// Present mode expands the diagram to fill the viewport (hides cards/footer).
const presentSource = computed(() => {
  if (!safeSource.value) return ''
  if (typeof window === 'undefined') return safeSource.value
  try {
    const u = new URL(safeSource.value, window.location.href)
    u.searchParams.delete('embed')
    u.searchParams.set('present', '1')
    return relativeUrl(u.pathname + u.search, route.path)
  } catch {
    return safeSource.value.replace('embed=1', 'present=1')
  }
})

// Same-origin iframe (allow-same-origin) lets us listen for dblclick inside it.
function bindInside(elm: HTMLIFrameElement | null, handler: () => void) {
  if (!elm) return
  try {
    const doc = elm.contentDocument
    if (doc) doc.addEventListener('dblclick', handler)
  } catch {
    /* cross-origin fallback: use the caption affordance */
  }
}

function fitEmbeddedDiagram(elm: HTMLIFrameElement | null) {
  if (!elm) return
  try {
    const doc = elm.contentDocument
    const container = doc?.querySelector('.diagram-container') as HTMLElement | null
    if (!container) return

    // The diagram is an SVG with a responsive viewBox. Measure its intrinsic
    // container instead of guessing a fixed iframe height, so no lower nodes
    // are hidden when the article column becomes wider or narrower.
    const height = Math.ceil(container.getBoundingClientRect().height)
    if (height > 0) frameHeight.value = `${Math.max(480, height)}px`
  } catch {
    /* cross-origin fallback keeps the safe default height */
  }
}

function onFrameLoad(elm: HTMLIFrameElement | null, handler: () => void) {
  bindInside(elm, handler)
  fitEmbeddedDiagram(elm)
}

function openFullscreen() {
  expanded.value = true
}
function closeFullscreen() {
  expanded.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') expanded.value = false
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  if (typeof ResizeObserver !== 'undefined' && preview.value) {
    previewObserver = new ResizeObserver(() => fitEmbeddedDiagram(frame.value))
    previewObserver.observe(preview.value)
  }
  fitEmbeddedDiagram(frame.value)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  previewObserver?.disconnect()
})
</script>

<template>
  <figure class="interactive-diagram">
    <div ref="preview" class="interactive-diagram-preview">
      <img v-if="!loaded && safePoster" :src="safePoster" :alt="description || title" loading="lazy" decoding="async" />
      <iframe
        v-if="loaded && safeSource"
        ref="frame"
        :src="safeSource"
        :style="{ height: frameHeight }"
        :title="title"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
        @load="onFrameLoad(frame, openFullscreen)"
      />
    </div>
    <figcaption>
      <strong>{{ title }}</strong>
      <span v-if="description">{{ description }}</span>
      <span class="interactive-diagram-hint">
        <button v-if="safeSource" type="button" @click="openFullscreen">双击展开全图 ↗</button>
        <a :href="safeSource || safePoster" target="_blank" rel="noreferrer">打开完整图</a>
      </span>
    </figcaption>
  </figure>

  <Teleport to="body">
    <div v-if="expanded" class="interactive-diagram-modal" @click.self="closeFullscreen">
      <div class="interactive-diagram-modal-inner">
        <iframe
          v-if="presentSource"
          ref="modalFrame"
          :src="presentSource"
          :title="`${title}（展开）`"
          sandbox="allow-scripts allow-same-origin"
          @load="bindInside(modalFrame, closeFullscreen)"
        />
        <button class="interactive-diagram-close" type="button" @click="closeFullscreen" aria-label="关闭">×</button>
      </div>
    </div>
  </Teleport>
</template>
