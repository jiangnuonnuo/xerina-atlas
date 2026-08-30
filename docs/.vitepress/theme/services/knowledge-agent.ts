export const KNOWLEDGE_AGENT_ID = '300000'

const API_BASE = String(import.meta.env.VITE_KNOWLEDGE_API_BASE || '').replace(/\/$/, '')

export type AgentAvailability = {
  available: boolean
  name?: string
  description?: string
}

type ApiResponse<T> = {
  code: string
  info: string
  data: T
}

export type ReActEvent = {
  event: string
  content?: string
  fullText?: string
  timestamp?: number
  statusMessage?: string
  toolCallId?: string
  toolName?: string
  args?: string
  status?: string
  outputChunk?: string
  assistantMessageId?: string
  roundIndex?: number
  stepInfo?: {
    currentStep: number
    maxSteps: number
    shouldContinue: boolean
    totalToolCalls: number
  }
}

export type ReActResult = {
  content: string
  totalSteps: number
  totalToolCalls: number
  maxStepsReached: boolean
  userStopped: boolean
  idleTimeout: boolean
  stopReason: string
  toolCalls?: unknown[]
  toolResults?: unknown[]
  error?: string | null
}

export type StreamOptions = {
  userId: string
  sessionId: string
  message: string
  requestId: string
  signal?: AbortSignal
  onAnswerText?: (fullText: string, event: ReActEvent) => void
  onEvent?: (event: ReActEvent, lastEventId: number) => void
}

class TerminalStreamError extends Error {}

function endpoint(path: string) {
  return `${API_BASE}${path}`
}

function requestError(action: string, response: Response) {
  return new TerminalStreamError(`${action}失败：HTTP ${response.status}`)
}

function abortError() {
  return new DOMException('The operation was aborted.', 'AbortError')
}

function wait(delay: number, signal?: AbortSignal) {
  if (signal?.aborted) return Promise.reject(abortError())

  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, delay)
    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer)
        reject(abortError())
      },
      { once: true },
    )
  })
}

export async function queryKnowledgeAgent(): Promise<AgentAvailability> {
  const response = await fetch(endpoint('/api/v1/query_ai_agent_config_list'))
  if (!response.ok) throw requestError('检查知识助手', response)

  const payload = (await response.json()) as ApiResponse<Array<Record<string, unknown>>>
  if (payload.code !== '0000' || !Array.isArray(payload.data)) {
    throw new TerminalStreamError(payload.info || '知识助手状态异常')
  }

  const agent = payload.data.find((item) => String(item.agentId) === KNOWLEDGE_AGENT_ID)
  return agent
    ? {
        available: true,
        name: String(agent.agentName || 'Xerina 知识助手'),
        description: String(agent.agentDesc || ''),
      }
    : { available: false }
}

export async function createKnowledgeSession(userId: string): Promise<string> {
  const response = await fetch(endpoint('/api/v1/create_session'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId: KNOWLEDGE_AGENT_ID, userId }),
  })
  if (!response.ok) throw requestError('创建会话', response)

  const payload = (await response.json()) as ApiResponse<{ sessionId: string }>
  if (payload.code !== '0000' || !payload.data?.sessionId) {
    throw new TerminalStreamError(payload.info || '创建会话失败')
  }
  return payload.data.sessionId
}

export async function streamKnowledgeAnswer(options: StreamOptions): Promise<ReActResult> {
  let lastEventId = 0
  let retry = 0
  const maxRetries = 5
  const segmentOrder: string[] = []
  const segments = new Map<string, string>()

  while (true) {
    try {
      const response = await fetch(endpoint('/api/v1/chat_stream'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/x-ndjson',
        },
        signal: options.signal,
        body: JSON.stringify({
          agentId: KNOWLEDGE_AGENT_ID,
          userId: options.userId,
          sessionId: options.sessionId,
          message: options.message,
          requestId: options.requestId,
          lastEventId,
        }),
      })

      if (!response.ok) throw requestError('问答请求', response)
      if (!response.headers.get('content-type')?.includes('application/x-ndjson')) {
        throw new TerminalStreamError('问答请求失败：服务端未返回 NDJSON 流')
      }
      if (!response.body) throw new TerminalStreamError('问答请求失败：服务端未返回流')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let terminal: ReActResult | undefined

      const consumeLine = (line: string) => {
        if (!line.trim()) return
        const event = JSON.parse(line) as ReActEvent
        lastEventId += 1
        options.onEvent?.(event, lastEventId)

        if (event.event === 'text' && (event.content != null || event.fullText != null)) {
          const segmentId = event.assistantMessageId || `round-${event.roundIndex ?? 0}`
          if (!segments.has(segmentId)) segmentOrder.push(segmentId)
          const previous = segments.get(segmentId) || ''
          segments.set(segmentId, event.fullText ?? `${previous}${event.content || ''}`)
          options.onAnswerText?.(segmentOrder.map((id) => segments.get(id) || '').join('\n\n'), event)
        } else if (event.event === 'done') {
          if (!event.content) throw new TerminalStreamError('服务端返回空的完成事件')
          terminal = JSON.parse(event.content) as ReActResult
        } else if (event.event === 'error') {
          throw new TerminalStreamError('知识助手执行失败，请稍后重试')
        }
      }

      try {
        while (!terminal) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split(/\r?\n/)
          buffer = lines.pop() || ''
          for (const line of lines) consumeLine(line)
        }
        if (!terminal) {
          buffer += decoder.decode()
          if (buffer.trim()) consumeLine(buffer)
        }
      } finally {
        if (terminal) await reader.cancel().catch(() => undefined)
        reader.releaseLock()
      }

      if (terminal) return terminal
      throw new Error('流式连接提前结束')
    } catch (error) {
      if (options.signal?.aborted) throw abortError()
      if (error instanceof TerminalStreamError) throw error

      retry += 1
      if (retry > maxRetries) {
        throw new TerminalStreamError('连接中断，请稍后重试')
      }
      await wait(Math.min(5000, 300 * 2 ** (retry - 1)), options.signal)
    }
  }
}

export async function cancelKnowledgeAnswer(requestId: string): Promise<boolean> {
  const response = await fetch(
    endpoint(`/api/v1/chat_stream/cancel?requestId=${encodeURIComponent(requestId)}`),
    { method: 'POST' },
  )
  if (!response.ok) throw requestError('停止回答', response)

  const payload = (await response.json()) as ApiResponse<boolean>
  if (payload.code !== '0000') throw new TerminalStreamError(payload.info || '停止回答失败')
  return payload.data === true
}

export function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}
