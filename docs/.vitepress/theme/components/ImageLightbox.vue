<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const open = ref(false)
const source = ref('')
const alt = ref('')
const closeButton = ref<HTMLButtonElement | null>(null)
const lastFocused = ref<HTMLElement | null>(null)
let previousBodyOverflow = ''

function getEmbeddedImage(target: EventTarget | null) {
  if (!(target instanceof HTMLImageElement)) return null
  if (!target.closest('.doc-content, .experience-content, .vp-doc')) return null
  if (target.closest('.interactive-diagram, .image-lightbox')) return null
  return target
}

async function openImage(image: HTMLImageElement) {
  lastFocused.value = document.activeElement instanceof HTMLElement ? document.activeElement : null
  source.value = image.currentSrc || image.src
  alt.value = image.alt
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  open.value = true
  await nextTick()
  closeButton.value?.focus()
}

function closeImage() {
  open.value = false
  document.body.style.overflow = previousBodyOverflow
  nextTick(() => lastFocused.value?.focus())
}

function handleDoubleClick(event: MouseEvent) {
  const image = getEmbeddedImage(event.target)
  if (!image) return
  event.preventDefault()
  event.stopPropagation()
  void openImage(image)
}

function handleKeydown(event: KeyboardEvent) {
  if (!open.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    closeImage()
  }
}

onMounted(() => {
  // Capture before the default article image viewer can consume the event.
  document.addEventListener('dblclick', handleDoubleClick, true)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('dblclick', handleDoubleClick, true)
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = previousBodyOverflow
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="完整图片预览"
      @click.self="closeImage"
    >
      <div class="image-lightbox-inner" @click.stop>
        <img class="image-lightbox-image" :src="source" :alt="alt" />
        <button
          ref="closeButton"
          class="image-lightbox-close"
          type="button"
          aria-label="关闭图片预览"
          @click="closeImage"
        >
          ×
        </button>
      </div>
    </div>
  </Teleport>
</template>
