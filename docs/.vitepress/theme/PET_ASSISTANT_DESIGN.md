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
desktop                                   mobile
┌──────────────────────────────┐          ┌──────────────────────────────┐
│ name                    close│          │ name                    close│
├ connection status ───────────┤          ├ connection status ───────────┤
│                              │          │                              │
│ grounded conversation        │          │ grounded conversation        │
│                              │          │                              │
├ labeled composer ────── send ┤          ├ labeled composer ────── send ┤
└──────────────────────────────┘          └──────────────────────────────┘
                         pet                                  bottom sheet
```

The desktop panel floats above the pet without masking primary navigation or document outlines. On narrow screens it becomes a bottom sheet with safe-area padding; the pet remains the launcher.

On desktop, the closed launcher can be dragged with a 6 px intent threshold, clamped to the visible viewport, and restored after reload. Opening the panel anchors it beside the pet while keeping the conversation surface inside the viewport. Dragging is disabled on mobile so the bottom sheet and page scrolling remain predictable. A header action resets the pet to its default bottom-right position.

## Conversation lifecycle

- Agent `300000` is checked before interaction and receives a stable anonymous visitor ID.
- A session is created once and reused for multi-turn context. “New conversation” creates a distinct backend session before clearing the visible transcript.
- The user message and assistant placeholder render immediately. NDJSON `text.fullText` snapshots update their own assistant segment idempotently; separate assistant message IDs are composed in order.
- Tool inputs and raw retrieval results stay private. Only readable progress states are surfaced through the status line and sprite animation.
- Completed, stopped, failed, and reconnected streams each have an explicit visible state. Stopping a stream preserves any partial answer and marks it as stopped.
- Message text is rendered as text rather than injected HTML, so model output cannot add executable markup to the page.

## Signature

The pet is not an ornamental badge. Its v2 atlas state is the conversation's status language: it waits while the Agent is unavailable, works during ReAct, reviews returned material, reacts to failure, and tracks the pointer through all 16 look directions when idle.

## Review

The first concept leaned toward a generic chat bubble with an AI-purple accent. That was rejected because it could belong to any assistant. The final direction derives its sea-glass, porcelain, chestnut, and silver cues from Xerina's pet and keeps the site's existing technical editorial language. The only expressive risk is the living sprite; the panel itself remains quiet.
