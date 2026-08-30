# Xerina Knowledge Companion

## Subject and job

The companion serves recruiters, engineers, and portfolio visitors who want grounded answers about Xerina's projects, experience, and technical judgment without leaving the page. Its single job is to turn the custom pet into the visible, trustworthy entry point for that conversation.

## Design tokens

- Porcelain `#FBFDFD`: the pet's jacket and the assistant surface.
- Sea glass `#2F8179`: knowledge retrieval, focus, and the pet's technical accents.
- Deep sea `#1F625D`: primary controls and high-contrast interactive text.
- Soft coral `#C96F5D`: unavailable, interrupted, and stop states.
- Graphite `#17252E`: primary reading text.
- Mist `#EDF6F4`: quiet user messages, hover states, and connection context.

Typography stays aligned with Atlas: Noto Sans SC for conversation and JetBrains Mono for compact system state. The companion deliberately avoids introducing a third display voice.

## Layout

```text
desktop                                      mobile
┌──────────────────────────────┐             ┌──────────────────────────┐
│ avatar · name · new · close  │             │ avatar · name · controls │
├ knowledge status ────────────┤             ├ knowledge status ────────┤
│                              │             │                          │
│ ▸ retrieved personal context │◀─ tail      │ ▸ retrieval process      │
│ final answer bubble           │             │ final answer bubble      │
│                              │             │                          │
├ composer ────────────── send ┤             ├ composer ────────── send ┤
└──────────────────────────────┘             └──────────────────────────┘
                           pet                         tail ↘ pet
```

The conversation is a speech bubble rather than a detached utility panel. On desktop it opens from the pet's side, with a tail pointing back at the current launcher position. When a dragged pet leaves insufficient room on its left, the panel flips to the other side and reverses its tail. On narrow screens it remains an inset bubble above the pet instead of becoming a bottom sheet, preserving the same visual relationship.

On desktop, the closed launcher can be dragged with a 6 px intent threshold, clamped to the visible viewport, and restored after reload. Opening the panel anchors it beside the pet while keeping the whole bubble in the viewport. Dragging is disabled on mobile so page scrolling remains predictable. A header action resets the pet to its default bottom-right position.

The greeting and suggested questions use compact, wrapping buttons rather than full-width stacked cards. The conversation itself is rendered as left-aligned assistant bubbles and right-aligned visitor bubbles. Retrieval activity appears as a quiet disclosure row above the answer: its label and state remain visible, while the complete RAG result is available only after the visitor expands it. The answer begins as a three-dot indicator and expands in place as final text arrives.

## Conversation lifecycle

- Agent `300000` is checked before interaction and receives a stable anonymous visitor ID.
- A session is created once and reused for multi-turn context. “New conversation” creates a distinct backend session before clearing the visible transcript.
- The user message and assistant placeholder render immediately. NDJSON `text.fullText` snapshots update their own final-answer segment idempotently; separate assistant message IDs are composed in order.
- `tool_call` and `tool_result` are paired by `toolCallId`. Each pair becomes one collapsed retrieval disclosure, so RAG material remains inspectable without being mistaken for the Agent's answer.
- Tool arguments are not rendered. The expandable body contains the returned retrieval text, while the status line and pet animation communicate the active phase.
- `done.content.content` corrects the final answer in place and never creates a second assistant bubble. Tool results carried by `done` are not appended again.
- Completed, stopped, failed, and reconnected streams each have an explicit visible state. Stopping a stream preserves any partial answer and marks it as stopped.
- Answer and retrieval text use Markdown rendering with raw HTML disabled, so streamed formatting remains readable without allowing model output to inject executable markup.

## Signature

The pet is not an ornamental badge. Its v2 atlas state is the conversation's status language: it waits while the Agent is unavailable, works during ReAct, reviews returned material, reacts to failure, and tracks the pointer through all 16 look directions when idle.

## Review

The first concept leaned toward a generic chat bubble with an AI-purple accent. That was rejected because it could belong to any assistant. The final direction derives its sea-glass, porcelain, chestnut, and silver cues from Xerina's pet and keeps the site's existing technical editorial language. The only expressive risk is the living sprite; the panel itself remains quiet.
