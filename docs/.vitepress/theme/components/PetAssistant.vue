<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import PetSprite, { type PetState } from './PetSprite.vue'
import {
  cancelKnowledgeAnswer,
  createKnowledgeSession,
  isAbortError,
  queryKnowledgeAgent,
  streamKnowledgeAnswer,
} from '../services/knowledge-agent'

type Availability = 'checking' | 'available' | 'unavailable' | 'error'
type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  pending?: boolean
}

const visitorKey = 'xerina-atlas-visitor-id'
const sessionKey = 'xerina-atlas-knowledge-session'
const positionKey = 'xerina-atlas-pet-position'
const dragThreshold = 6
const viewportPadding = 12
const suggestions = [
  'Xerina 最擅长解决哪类 Java 后端问题？',
  '介绍一下她的 AI Agent 工程实践',
  '哪个项目最能体现她的系统设计能力？',
]

const open = ref(false)
const availability = ref<Availability>('checking')
const statusText = ref('正在连接知识库')
const input = ref('')
const busy = ref(false)
const creatingConversation = ref(false)
const messages = ref<Message[]>([])
const inputElement = ref<HTMLTextAreaElement>()
const messageList = ref<HTMLElement>()
const panelElement = ref<HTMLElement>()
const launcherElement = ref<HTMLButtonElement>()
const activeRequestId = ref('')
const activeController = ref<AbortController>()
const petState = ref<PetState>('idle')
const lookDirection = ref(0)
const looking = ref(false)
const positioned = ref(false)
const customPosition = ref(false)
const dragging = ref(false)
const petPosition = reactive({ x: 0, y: 0 })
const panelPosition = reactive({ active: false, x: 0, y: 0 })
let sessionPromise: Promise<string> | undefined
let settleTimer: number | undefined
let pointerFrame: number | undefined
let dragPointerId: number | undefined
let dragStartPointerX = 0
let dragStartPointerY = 0
let dragStartPetX = 0
let dragStartPetY = 0
let suppressLauncherClick = false

const visiblePetState = computed<PetState>(() => {
  if (busy.value) return petState.value
  if (availability.value === 'checking' || availability.value === 'unavailable') return 'waiting'
  if (looking.value) return 'look'
  return petState.value
})

const assistantStyle = computed(() => positioned.value
  ? { left: `${petPosition.x}px`, top: `${petPosition.y}px` }
  : undefined)

const panelStyle = computed(() => panelPosition.active
  ? {
      position: 'fixed' as const,
      left: `${panelPosition.x}px`,
      top: `${panelPosition.y}px`,
      right: 'auto',
      bottom: 'auto',
    }
  : undefined)

function makeId(prefix: string) {
  const suffix = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `${prefix}-${suffix}`
}

function visitorId() {
  const existing = window.localStorage.getItem(visitorKey)
  if (existing) return existing
  const id = makeId('site-visitor')
  window.localStorage.setItem(visitorKey, id)
  return id
}

async function ensureSession(userId: string) {
  const existing = window.sessionStorage.getItem(sessionKey)
  if (existing) return existing
  if (!sessionPromise) {
    sessionPromise = createKnowledgeSession(userId)
      .then((sessionId) => {
        window.sessionStorage.setItem(sessionKey, sessionId)
        return sessionId
      })
      .finally(() => {
        sessionPromise = undefined
      })
  }
  return sessionPromise
}

function publicError(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  return '暂时无法连接知识助手，请稍后重试'
}

function scrollToLatest() {
  void nextTick(() => {
    if (messageList.value) messageList.value.scrollTop = messageList.value.scrollHeight
  })
}

function setTransientPetState(state: PetState, duration = 1800) {
  if (settleTimer != null) window.clearTimeout(settleTimer)
  petState.value = state
  settleTimer = window.setTimeout(() => {
    petState.value = 'idle'
  }, duration)
}

async function refreshAvailability() {
  availability.value = 'checking'
  statusText.value = '正在连接知识库'
  try {
    const result = await queryKnowledgeAgent()
    availability.value = result.available ? 'available' : 'unavailable'
    statusText.value = result.available ? '知识库已连接' : '知识问答暂未启用'
  } catch {
    availability.value = 'error'
    statusText.value = '知识服务暂时无法访问'
    setTransientPetState('failed')
  }
}

async function togglePanel() {
  open.value = !open.value
  if (open.value) {
    setTransientPetState('waving', 1400)
    await nextTick()
    updatePanelPosition()
    inputElement.value?.focus()
  } else {
    panelPosition.active = false
  }
}

function closePanel() {
  open.value = false
  panelPosition.active = false
  void nextTick(() => launcherElement.value?.focus())
}

async function startNewConversation() {
  if (busy.value || creatingConversation.value || availability.value !== 'available') return

  creatingConversation.value = true
  statusText.value = '正在创建新对话'
  petState.value = 'running'
  try {
    const sessionId = await createKnowledgeSession(visitorId())
    window.sessionStorage.setItem(sessionKey, sessionId)
    sessionPromise = undefined
    messages.value = []
    input.value = ''
    statusText.value = '新对话已开始'
    setTransientPetState('waving', 1400)
    await nextTick()
    inputElement.value?.focus()
  } catch (error) {
    statusText.value = publicError(error)
    setTransientPetState('failed', 2400)
  } finally {
    creatingConversation.value = false
  }
}

function eventStatus(event: { event: string; toolName?: string; statusMessage?: string; content?: string }) {
  if (event.event === 'round_start') {
    statusText.value = '正在分析问题'
    petState.value = 'running'
  } else if (event.event === 'tool_call') {
    statusText.value = event.toolName === 'web_search' ? '正在检索公开资料' : '正在查询个人知识库'
    petState.value = 'running'
  } else if (event.event === 'tool_result') {
    statusText.value = '资料已返回，正在组织回答'
    petState.value = 'review'
  } else if (event.event === 'status' && event.statusMessage) {
    statusText.value = event.statusMessage
  } else if (event.event === 'warning') {
    statusText.value = '检索过程出现波动，正在继续处理'
  }
}

async function sendMessage(preset?: string) {
  const question = (preset ?? input.value).trim()
  if (!question || busy.value || availability.value !== 'available') return

  input.value = ''
  busy.value = true
  petState.value = 'running'
  statusText.value = '正在准备回答'

  const userMessage: Message = { id: makeId('user'), role: 'user', content: question }
  const assistantMessage = reactive<Message>({ id: makeId('assistant'), role: 'assistant', content: '', pending: true })
  messages.value.push(userMessage, assistantMessage)
  scrollToLatest()

  const controller = new AbortController()
  const requestId = makeId('qa')
  activeController.value = controller
  activeRequestId.value = requestId

  try {
    const userId = visitorId()
    const sessionId = await ensureSession(userId)
    const result = await streamKnowledgeAnswer({
      userId,
      sessionId,
      message: question,
      requestId,
      signal: controller.signal,
      onText: (fullText) => {
        assistantMessage.content = fullText
        scrollToLatest()
      },
      onEvent: (event) => eventStatus(event),
    })

    assistantMessage.content = result.content || assistantMessage.content || '当前资料不足，暂时无法给出可靠回答。'
    assistantMessage.pending = false
    const completed = result.stopReason === 'completed' || result.stopReason === 'finish'
    statusText.value = result.stopReason === 'user_stop' ? '已停止' : completed ? '回答完成' : '回答未完整完成，可缩小问题后重试'
    setTransientPetState(result.stopReason === 'user_stop' || !completed ? 'waiting' : 'review')
  } catch (error) {
    assistantMessage.pending = false
    if (isAbortError(error)) {
      assistantMessage.content = assistantMessage.content
        ? `${assistantMessage.content}\n\n本次回答已停止。`
        : '本次回答已停止。'
      statusText.value = '已停止'
      setTransientPetState('waiting')
    } else {
      assistantMessage.content = assistantMessage.content || publicError(error)
      statusText.value = '回答中断，请重试'
      setTransientPetState('failed', 2400)
    }
  } finally {
    busy.value = false
    activeController.value = undefined
    activeRequestId.value = ''
    scrollToLatest()
  }
}

async function stopAnswer() {
  const requestId = activeRequestId.value
  if (!requestId) return
  statusText.value = '正在停止'
  try {
    await cancelKnowledgeAnswer(requestId)
  } catch {
    // The local reader is still stopped even if the server task already ended.
  } finally {
    activeController.value?.abort()
  }
}

function handleInputKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault()
    void sendMessage()
  }
}

function handleDockPointer(event: PointerEvent) {
  if (open.value || dragging.value || dragPointerId != null || busy.value || availability.value !== 'available') return
  if (pointerFrame != null) return
  const target = event.currentTarget as HTMLElement
  const x = event.clientX
  const y = event.clientY
  pointerFrame = window.requestAnimationFrame(() => {
    pointerFrame = undefined
    const pet = target.querySelector('.pet-launcher-sprite')?.getBoundingClientRect()
    if (!pet) return
    const dx = x - (pet.left + pet.width / 2)
    const dy = y - (pet.top + pet.height / 2)
    lookDirection.value = (Math.atan2(dx, -dy) * 180) / Math.PI
    looking.value = true
  })
}

function stopLooking() {
  looking.value = false
}

function desktopDragEnabled() {
  return window.innerWidth > 680
}

function desktopFloatingPanelEnabled() {
  return desktopDragEnabled() && !(window.innerWidth <= 900 && window.innerHeight <= 500)
}

function clampPetPosition(x: number, y: number) {
  const launcher = launcherElement.value
  const width = launcher?.offsetWidth || 118
  const height = launcher?.offsetHeight || 132
  return {
    x: Math.min(Math.max(viewportPadding, x), Math.max(viewportPadding, window.innerWidth - width - viewportPadding)),
    y: Math.min(Math.max(viewportPadding, y), Math.max(viewportPadding, window.innerHeight - height - viewportPadding)),
  }
}

function setPetPosition(x: number, y: number) {
  const next = clampPetPosition(x, y)
  petPosition.x = next.x
  petPosition.y = next.y
  positioned.value = true
}

function setDefaultPetPosition() {
  const launcher = launcherElement.value
  setPetPosition(
    window.innerWidth - (launcher?.offsetWidth || 118) - 24,
    window.innerHeight - (launcher?.offsetHeight || 132) - 18,
  )
}

function restorePetPosition() {
  if (!desktopDragEnabled()) {
    positioned.value = false
    return
  }

  try {
    const stored = JSON.parse(window.localStorage.getItem(positionKey) || '') as { x?: unknown; y?: unknown }
    if (typeof stored.x === 'number' && Number.isFinite(stored.x) && typeof stored.y === 'number' && Number.isFinite(stored.y)) {
      customPosition.value = true
      setPetPosition(Number(stored.x), Number(stored.y))
      return
    }
  } catch {
    // Ignore missing or invalid saved positions and use the bottom-right default.
  }

  customPosition.value = false
  setDefaultPetPosition()
}

function savePetPosition() {
  window.localStorage.setItem(positionKey, JSON.stringify({ x: petPosition.x, y: petPosition.y }))
}

function resetPetPosition() {
  window.localStorage.removeItem(positionKey)
  customPosition.value = false
  if (desktopDragEnabled()) setDefaultPetPosition()
  updatePanelPosition()
}

function updatePanelPosition() {
  if (!open.value || !desktopFloatingPanelEnabled()) {
    panelPosition.active = false
    return
  }

  void nextTick(() => {
    const panel = panelElement.value
    const launcher = launcherElement.value
    if (!panel || !launcher || !open.value) return

    const panelWidth = panel.offsetWidth
    const panelHeight = panel.offsetHeight
    const launcherRect = launcher.getBoundingClientRect()
    const maxX = Math.max(viewportPadding, window.innerWidth - panelWidth - viewportPadding)
    const maxY = Math.max(viewportPadding, window.innerHeight - panelHeight - viewportPadding)
    const preferredX = launcherRect.right - panelWidth - 8
    const aboveY = launcherRect.top - panelHeight - 10
    const belowY = launcherRect.bottom + 10
    const preferredY = aboveY >= viewportPadding ? aboveY : belowY

    panelPosition.x = Math.min(Math.max(viewportPadding, preferredX), maxX)
    panelPosition.y = Math.min(Math.max(viewportPadding, preferredY), maxY)
    panelPosition.active = true
  })
}

function handleLauncherPointerDown(event: PointerEvent) {
  if (open.value || !desktopDragEnabled() || event.button !== 0) return
  dragPointerId = event.pointerId
  dragStartPointerX = event.clientX
  dragStartPointerY = event.clientY
  dragStartPetX = petPosition.x
  dragStartPetY = petPosition.y
  dragging.value = false
  launcherElement.value?.setPointerCapture(event.pointerId)
}

function handleLauncherPointerMove(event: PointerEvent) {
  if (dragPointerId !== event.pointerId) return
  const deltaX = event.clientX - dragStartPointerX
  const deltaY = event.clientY - dragStartPointerY
  if (!dragging.value && Math.hypot(deltaX, deltaY) < dragThreshold) return

  dragging.value = true
  looking.value = false
  event.preventDefault()
  setPetPosition(dragStartPetX + deltaX, dragStartPetY + deltaY)
  customPosition.value = true
  savePetPosition()
}

function finishLauncherDrag(event: PointerEvent) {
  if (dragPointerId !== event.pointerId) return
  const wasDragging = dragging.value
  dragPointerId = undefined
  dragging.value = false
  if (launcherElement.value?.hasPointerCapture(event.pointerId)) {
    launcherElement.value.releasePointerCapture(event.pointerId)
  }
  if (wasDragging) {
    customPosition.value = true
    savePetPosition()
    suppressLauncherClick = true
  }
}

function handleLauncherClick() {
  if (suppressLauncherClick) {
    suppressLauncherClick = false
    return
  }
  void togglePanel()
}

function handleWindowResize() {
  if (!desktopDragEnabled()) {
    positioned.value = false
  } else if (!customPosition.value) {
    setDefaultPetPosition()
  } else {
    setPetPosition(petPosition.x, petPosition.y)
  }
  updatePanelPosition()
}

function handleWindowKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) {
    closePanel()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleWindowKeydown)
  window.addEventListener('resize', handleWindowResize)
  void nextTick(restorePetPosition)
  void refreshAvailability()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleWindowKeydown)
  window.removeEventListener('resize', handleWindowResize)
  activeController.value?.abort()
  if (settleTimer != null) window.clearTimeout(settleTimer)
  if (pointerFrame != null) window.cancelAnimationFrame(pointerFrame)
})
</script>

<template>
  <div
    class="pet-assistant"
    :class="{ 'is-open': open, 'is-positioned': positioned, 'is-dragging': dragging }"
    :style="assistantStyle"
    @pointermove="handleDockPointer"
    @pointerleave="stopLooking"
  >
    <section
      id="pet-assistant-panel"
      ref="panelElement"
      v-show="open"
      class="pet-assistant-panel"
      :style="panelStyle"
      role="dialog"
      aria-modal="false"
      aria-labelledby="pet-assistant-title"
    >
      <header class="pet-assistant-header">
        <div>
          <span class="pet-assistant-kicker">XERINA / KNOWLEDGE COMPANION</span>
          <h2 id="pet-assistant-title">问问 Xerina</h2>
        </div>
        <div class="pet-assistant-actions">
          <button class="pet-icon-button" type="button" aria-label="开始新对话" title="新对话" :disabled="busy || creatingConversation || availability !== 'available'" @click="startNewConversation">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v11H9l-4 3V5zM12 8v5M9.5 10.5h5" /></svg>
          </button>
          <button class="pet-icon-button" type="button" aria-label="将桌宠重置到默认位置" title="重置桌宠位置" @click="resetPetPosition">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 8A7 7 0 1 1 5 15M5.5 8V3M5.5 8h5" /></svg>
          </button>
          <button class="pet-icon-button" type="button" aria-label="关闭知识问答" title="关闭" @click="closePanel">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
      </header>

      <div class="pet-assistant-status" :data-state="availability" role="status">
        <span aria-hidden="true"></span>
        <p>{{ statusText }}</p>
        <button v-if="availability === 'unavailable' || availability === 'error'" type="button" @click="refreshAvailability">重新检查</button>
      </div>

      <div ref="messageList" class="pet-message-list" aria-live="polite" aria-relevant="additions text">
        <div v-if="!messages.length" class="pet-assistant-empty">
          <strong>你好，我是 Xerina 的知识搭档。</strong>
          <p>可以问我她的项目、实习经历、技术判断与 AI 工程实践。</p>
          <div class="pet-suggestions" aria-label="推荐问题">
            <button v-for="suggestion in suggestions" :key="suggestion" type="button" :disabled="availability !== 'available' || busy || creatingConversation" @click="sendMessage(suggestion)">
              {{ suggestion }}
            </button>
          </div>
        </div>

        <article v-for="message in messages" :key="message.id" class="pet-message" :class="`is-${message.role}`">
          <span>{{ message.role === 'user' ? '你' : 'Xerina' }}</span>
          <p>{{ message.content || '正在组织回答…' }}</p>
        </article>
      </div>

      <form class="pet-composer" @submit.prevent="sendMessage()">
        <label for="pet-question">想了解什么？</label>
        <div class="pet-composer-row">
          <textarea
            id="pet-question"
            ref="inputElement"
            v-model="input"
            rows="2"
            maxlength="800"
            :disabled="availability !== 'available' || busy || creatingConversation"
            :placeholder="availability === 'available' ? '问项目、经历或技术实践…' : '知识助手暂不可用'"
            @keydown="handleInputKeydown"
          ></textarea>
          <button v-if="busy" class="pet-submit is-stop" type="button" aria-label="停止回答" @click="stopAnswer">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1" /></svg>
          </button>
          <button v-else class="pet-submit" type="submit" aria-label="发送问题" :disabled="!input.trim() || availability !== 'available' || creatingConversation">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
          </button>
        </div>
        <small>Enter 发送 · Shift + Enter 换行</small>
      </form>
    </section>

    <button
      ref="launcherElement"
      class="pet-launcher"
      type="button"
      :aria-expanded="open"
      :aria-label="open ? '收起 Xerina 知识助手' : '打开 Xerina 知识助手；桌面端可拖动调整位置'"
      aria-controls="pet-assistant-panel"
      @click="handleLauncherClick"
      @pointerdown="handleLauncherPointerDown"
      @pointermove="handleLauncherPointerMove"
      @pointerup="finishLauncherDrag"
      @pointercancel="finishLauncherDrag"
      @lostpointercapture="finishLauncherDrag"
    >
      <span class="pet-launcher-sprite" aria-hidden="true">
        <PetSprite :state="visiblePetState" :direction="lookDirection" :scale="0.58" label="" />
      </span>
      <span class="pet-launcher-label">{{ open ? '收起' : '问问我' }}</span>
    </button>
  </div>
</template>
