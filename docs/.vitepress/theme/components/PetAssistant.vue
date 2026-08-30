<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import PetSprite, { type PetState } from './PetSprite.vue'
import {
  cancelKnowledgeAnswer,
  createKnowledgeSession,
  isAbortError,
  queryKnowledgeAgent,
  streamKnowledgeAnswer,
  type ReActEvent,
} from '../services/knowledge-agent'

type Availability = 'checking' | 'available' | 'unavailable' | 'error'
type RetrievalActivity = {
  id: string
  toolName: string
  label: string
  status: 'running' | 'completed' | 'failed' | 'stopped'
  content: string
}
type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  pending?: boolean
  activities?: RetrievalActivity[]
}

const visitorKey = 'xerina-atlas-visitor-id'
const sessionKey = 'xerina-atlas-knowledge-session'
const conversationKeyPrefix = 'xerina-atlas-knowledge-conversation:'
const positionKey = 'xerina-atlas-pet-position'
const conversationStorageVersion = 1
const maxPersistedMessages = 100
const dragThreshold = 6
const viewportPadding = 12
const suggestions = [
  'Xerina 最擅长解决哪类 Java 后端问题？',
  '介绍一下她的 AI Agent 工程实践',
  '哪个项目最能体现她的系统设计能力？',
]
const markdown = new MarkdownIt({
  breaks: true,
  html: false,
  linkify: true,
  typographer: false,
})

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
const panelSide = ref<'left' | 'right'>('left')
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
let persistConversationTimer: number | undefined

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

function conversationKey(sessionId: string) {
  return `${conversationKeyPrefix}${sessionId}`
}

function isMessageRole(value: unknown): value is Message['role'] {
  return value === 'user' || value === 'assistant'
}

function isActivityStatus(value: unknown): value is RetrievalActivity['status'] {
  return value === 'running' || value === 'completed' || value === 'failed' || value === 'stopped'
}

function parseStoredActivity(value: unknown): RetrievalActivity | undefined {
  if (!value || typeof value !== 'object') return undefined
  const activity = value as Partial<RetrievalActivity>
  if (typeof activity.id !== 'string' || typeof activity.label !== 'string') return undefined

  return {
    id: activity.id,
    toolName: typeof activity.toolName === 'string' ? activity.toolName : '',
    label: activity.label,
    status: isActivityStatus(activity.status) ? activity.status : 'stopped',
    content: typeof activity.content === 'string' ? activity.content : '',
  }
}

function parseStoredMessage(value: unknown): Message | undefined {
  if (!value || typeof value !== 'object') return undefined
  const message = value as Partial<Message>
  if (typeof message.id !== 'string' || !isMessageRole(message.role) || typeof message.content !== 'string') {
    return undefined
  }

  const activities = Array.isArray(message.activities)
    ? message.activities.map(parseStoredActivity).filter((activity): activity is RetrievalActivity => Boolean(activity))
    : undefined

  const restored: Message = {
    id: message.id,
    role: message.role,
    content: message.content,
    pending: false,
    activities,
  }

  if (message.pending && restored.role === 'assistant') {
    restored.activities?.forEach((activity) => {
      if (activity.status === 'running') activity.status = 'stopped'
    })
    restored.content = restored.content
      ? `${restored.content}\n\n上一次回答因页面刷新而中断。`
      : '上一次回答因页面刷新而中断。'
  }

  return restored
}

function saveConversationNow() {
  if (persistConversationTimer != null) {
    window.clearTimeout(persistConversationTimer)
    persistConversationTimer = undefined
  }

  const sessionId = window.sessionStorage.getItem(sessionKey)
  if (!sessionId) return

  try {
    const payload = {
      version: conversationStorageVersion,
      sessionId,
      updatedAt: Date.now(),
      messages: messages.value.slice(-maxPersistedMessages),
    }
    window.localStorage.setItem(conversationKey(sessionId), JSON.stringify(payload))
  } catch {
    // The conversation remains available in memory if browser storage is unavailable or full.
  }
}

function scheduleConversationSave() {
  if (persistConversationTimer != null) window.clearTimeout(persistConversationTimer)
  persistConversationTimer = window.setTimeout(saveConversationNow, 120)
}

function restoreConversation() {
  const sessionId = window.sessionStorage.getItem(sessionKey)
  if (!sessionId) return

  const key = conversationKey(sessionId)
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return
    const payload = JSON.parse(raw) as {
      version?: unknown
      sessionId?: unknown
      messages?: unknown
    }
    if (
      payload.version !== conversationStorageVersion
      || payload.sessionId !== sessionId
      || !Array.isArray(payload.messages)
    ) {
      window.localStorage.removeItem(key)
      return
    }

    messages.value = payload.messages
      .map(parseStoredMessage)
      .filter((message): message is Message => Boolean(message))
      .slice(-maxPersistedMessages)
  } catch {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // Ignore browser storage restrictions and continue with an empty in-memory conversation.
    }
  }
}

async function ensureSession(userId: string) {
  const existing = window.sessionStorage.getItem(sessionKey)
  if (existing) return existing
  if (!sessionPromise) {
    sessionPromise = createKnowledgeSession(userId)
      .then((sessionId) => {
        window.sessionStorage.setItem(sessionKey, sessionId)
        saveConversationNow()
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

function renderMarkdown(content: string) {
  return markdown.render(content)
}

function retrievalLabel(toolName?: string) {
  const normalized = String(toolName || '').toLowerCase()
  if (normalized.includes('list_knowledge')) return '定位个人知识库'
  if (normalized.includes('knowledge') || normalized.includes('rag')) return '检索个人知识库'
  if (normalized.includes('web') || normalized.includes('search')) return '检索公开资料'
  return '检索相关资料'
}

function retrievalStatus(activity: RetrievalActivity) {
  if (activity.status === 'running') return '正在检索'
  if (activity.status === 'failed') return '检索未完成'
  if (activity.status === 'stopped') return '检索已停止'
  return '已检索，可展开查看'
}

function readableToolResult(content?: string) {
  if (!content) return ''
  try {
    const parsed = JSON.parse(content) as unknown
    if (parsed && typeof parsed === 'object' && 'result' in parsed) {
      const result = (parsed as { result?: unknown }).result
      if (Array.isArray(result)) {
        const texts = result.flatMap((item) => {
          if (typeof item === 'string') return [item]
          if (item && typeof item === 'object' && 'text' in item) {
            const text = (item as { text?: unknown }).text
            return typeof text === 'string' ? [text] : []
          }
          return []
        })
        if (texts.length) return texts.join('\n\n')
      }
      if (typeof result === 'string') return result
    }
    return typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2)
  } catch {
    return content
  }
}

function updateRetrievalActivity(message: Message, event: ReActEvent) {
  if (event.event !== 'tool_call' && event.event !== 'tool_result') return

  const activityId = event.toolCallId || makeId('retrieval')
  const activities = message.activities || (message.activities = [])
  let activity = activities.find((item) => item.id === activityId)
  if (!activity) {
    activity = {
      id: activityId,
      toolName: event.toolName || '',
      label: retrievalLabel(event.toolName),
      status: 'running',
      content: '',
    }
    activities.push(activity)
  }

  if (event.toolName) {
    activity.toolName = event.toolName
    activity.label = retrievalLabel(event.toolName)
  }
  if (event.event === 'tool_result') {
    activity.status = event.status === 'failed' || event.status === 'error' ? 'failed' : 'completed'
    activity.content = readableToolResult(event.content)
  }
}

function settleRetrievalActivities(message: Message, status: 'completed' | 'failed' | 'stopped') {
  message.activities?.forEach((activity) => {
    if (activity.status === 'running') activity.status = status
  })
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
    saveConversationNow()
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
    const toolName = String(event.toolName || '').toLowerCase()
    statusText.value = toolName.includes('web') ? '正在检索公开资料' : '正在查询个人知识库'
    petState.value = 'running'
  } else if (event.event === 'tool_result') {
    statusText.value = '资料已返回，正在生成回答'
    petState.value = 'review'
  } else if (event.event === 'text') {
    statusText.value = '正在生成回答'
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
  const assistantMessage = reactive<Message>({
    id: makeId('assistant'),
    role: 'assistant',
    content: '',
    pending: true,
    activities: [],
  })
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
      onAnswerText: (fullText) => {
        assistantMessage.content = fullText
        scrollToLatest()
      },
      onEvent: (event) => {
        eventStatus(event)
        updateRetrievalActivity(assistantMessage, event)
        if (event.event === 'tool_call' || event.event === 'tool_result') scrollToLatest()
      },
    })

    assistantMessage.content = result.content || assistantMessage.content || '当前资料不足，暂时无法给出可靠回答。'
    assistantMessage.pending = false
    settleRetrievalActivities(assistantMessage, 'completed')
    const completed = result.stopReason === 'completed' || result.stopReason === 'finish'
    statusText.value = result.stopReason === 'user_stop' ? '已停止' : completed ? '回答完成' : '回答未完整完成，可缩小问题后重试'
    setTransientPetState(result.stopReason === 'user_stop' || !completed ? 'waiting' : 'review')
  } catch (error) {
    assistantMessage.pending = false
    if (isAbortError(error)) {
      settleRetrievalActivities(assistantMessage, 'stopped')
      assistantMessage.content = assistantMessage.content
        ? `${assistantMessage.content}\n\n本次回答已停止。`
        : '本次回答已停止。'
      statusText.value = '已停止'
      setTransientPetState('waiting')
    } else {
      settleRetrievalActivities(assistantMessage, 'failed')
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
    const gap = 18
    const leftX = launcherRect.left - panelWidth - gap
    const rightX = launcherRect.right + gap
    const preferredY = launcherRect.bottom - panelHeight - 22

    if (leftX >= viewportPadding || rightX > maxX) {
      panelSide.value = 'left'
      panelPosition.x = Math.min(Math.max(viewportPadding, leftX), maxX)
    } else {
      panelSide.value = 'right'
      panelPosition.x = Math.min(Math.max(viewportPadding, rightX), maxX)
    }

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

watch(messages, scheduleConversationSave, { deep: true })

onMounted(() => {
  window.addEventListener('keydown', handleWindowKeydown)
  window.addEventListener('resize', handleWindowResize)
  window.addEventListener('pagehide', saveConversationNow)
  restoreConversation()
  void nextTick(restorePetPosition)
  void refreshAvailability()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleWindowKeydown)
  window.removeEventListener('resize', handleWindowResize)
  window.removeEventListener('pagehide', saveConversationNow)
  saveConversationNow()
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
      :class="`is-panel-${panelSide}`"
      :style="panelStyle"
      role="dialog"
      aria-modal="false"
      aria-labelledby="pet-assistant-title"
    >
      <header class="pet-assistant-header">
        <div class="pet-assistant-identity">
          <span class="pet-assistant-avatar" aria-hidden="true">
            <PetSprite :state="visiblePetState" :direction="lookDirection" :scale="0.2" label="" />
          </span>
          <div>
            <span class="pet-assistant-kicker">XERINA / KNOWLEDGE COMPANION</span>
            <h2 id="pet-assistant-title">问问 Xerina</h2>
          </div>
        </div>
        <div class="pet-assistant-actions">
          <button class="pet-new-conversation" type="button" :disabled="busy || creatingConversation || availability !== 'available'" @click="startNewConversation">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v11H9l-4 3V5zM12 8v5M9.5 10.5h5" /></svg>
            <span>新对话</span>
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

      <div ref="messageList" class="pet-message-list" aria-live="polite" aria-relevant="additions text" :aria-busy="busy">
        <div v-if="!messages.length" class="pet-assistant-empty">
          <strong>你好，我是 Xerina 的知识搭档。</strong>
          <p>可以问我她的项目、实习经历、技术判断与 AI 工程实践。</p>
          <div class="pet-suggestions" aria-label="推荐问题">
            <button v-for="suggestion in suggestions" :key="suggestion" type="button" :disabled="availability !== 'available' || busy || creatingConversation" @click="sendMessage(suggestion)">
              {{ suggestion }}
            </button>
          </div>
        </div>

        <article
          v-for="message in messages"
          :key="message.id"
          class="pet-message"
          :class="`is-${message.role}`"
          :aria-label="message.role === 'user' ? '你的消息' : 'Xerina 的回答'"
        >
          <span v-if="message.role === 'assistant'" class="pet-message-avatar" aria-hidden="true">X</span>
          <div class="pet-message-content">
            <div v-if="message.role === 'assistant' && message.activities?.length" class="pet-reasoning-list" aria-label="检索与思考过程" aria-live="off">
              <details
                v-for="activity in message.activities"
                :key="activity.id"
                class="pet-reasoning-item"
                :class="`is-${activity.status}`"
              >
                <summary>
                  <span class="pet-reasoning-icon" aria-hidden="true">
                    <svg v-if="activity.status === 'running'" viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9" /></svg>
                    <svg v-else-if="activity.status === 'completed'" viewBox="0 0 24 24"><path d="m6.5 12.5 3.5 3.5 7.5-8" /></svg>
                    <svg v-else-if="activity.status === 'stopped'" viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="1" /></svg>
                    <svg v-else viewBox="0 0 24 24"><path d="M12 8v5M12 17h.01M12 3l9 17H3L12 3z" /></svg>
                  </span>
                  <span class="pet-reasoning-summary">
                    <strong>{{ activity.label }}</strong>
                    <small>{{ retrievalStatus(activity) }}</small>
                  </span>
                  <svg class="pet-reasoning-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4" /></svg>
                </summary>
                <div class="pet-reasoning-body">
                  <div v-if="activity.content" class="pet-rendered-markdown" v-html="renderMarkdown(activity.content)"></div>
                  <p v-else>正在等待检索结果…</p>
                </div>
              </details>
            </div>

            <div class="pet-message-bubble">
              <div v-if="message.content && message.role === 'assistant'" class="pet-rendered-markdown" v-html="renderMarkdown(message.content)"></div>
              <p v-else-if="message.content">{{ message.content }}</p>
              <span v-else class="pet-typing-indicator" aria-label="正在组织回答">
                <i></i><i></i><i></i>
              </span>
            </div>
          </div>
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
