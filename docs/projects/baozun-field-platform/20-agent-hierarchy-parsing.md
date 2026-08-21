---
title: 20 · 受限 Agent 层级解析
type: project-chapter
project: baozun-field-platform
order: 20
group: 解析
description: 受限 Agent 怎么把字段证据变成可验收的候选字段树。
layout: project-doc
---

## 受限 Agent 层级解析

> 解析是把"字段证据"变成"候选字段树"的过程。这一节讲为什么是受限 Agent、提示怎么组装、编排怎么跑、反馈怎么接。

---

## 为什么是"受限" Agent

页面内容不可信、不可控，不能让 Agent 自由发挥。受限指三件事：

- **输入受限**：只吃字段证据，不吃原始 HTML 噪音；
- **动作受限**：只产出"候选字段树"，不做无关操作；
- **验证受限**：输出必须可验收（结构合法、父级存在、类型可识别）。

把"智能"框在"可信任"的边界里，结果才可用。

## 提示上下文怎么组装

提示不是把证据一古脑塞进去，而是分层组装：

- **系统规则层**：你是字段解析器，输出必须符合候选树契约；
- **证据层**：当前页面的字段证据快照；
- **输出契约层**：候选树的字段定义与示例；
- **反馈层**：上一次校验失败的原因（如果有）。

<InteractiveDiagram
  title="提示上下文组装：规则 + 证据 + 反馈"
  src="/media/projects/baozun-field-platform/diagrams/prompt-assembly/index.html?embed=1"
  poster="/media/projects/baozun-field-platform/diagrams/prompt-assembly/preview.png"
  description="系统规则、输出契约、页面证据与修订上下文的分层拼装。"
/>

## 编排：受限 ReAct

解析用受限的 ReAct 循环，但每一步都有边界：

- **加载**：读入字段证据与页面上下文；
- **思考**：基于规则决定下一步抽哪一类字段；
- **行动**：调用"抽取某类字段"的工具；
- **观察**：拿到工具结果，校验结构；
- **收尾**：组装成候选字段树。

行动空间被限制在"抽取工具"内，不会去调无关能力。

<InteractiveDiagram
  title="受限 ReAct 层级解析编排"
  src="/media/projects/baozun-field-platform/diagrams/react-orchestration/index.html?embed=1"
  poster="/media/projects/baozun-field-platform/diagrams/react-orchestration/preview.png"
  description="加载、组装、抽取、校验、预览的七节点应用层编排。"
/>

## 解析预览、反馈与可信入库

解析产出候选树后，先**预览**给用户 / 上游确认，而不是立刻入库：

- 预览展示候选树的层级与字段；
- 用户或上游可以**反馈**（某节点错了、某字段漏了）；
- 反馈作为"反馈层"重跑解析，直到可验收；
- 验收通过后，才**可信入库**。

这个过程用 SSE 把解析进度推给前端，但**持久化任务状态与观察通道分离**，避免连接断了就丢状态。

<InteractiveDiagram
  title="解析预览、反馈重跑与可信入库"
  src="/media/projects/baozun-field-platform/diagrams/feedback-sse/index.html?embed=1"
  poster="/media/projects/baozun-field-platform/diagrams/feedback-sse/preview.png"
  description="SSE 观察通道与持久化任务状态分离。"
/>

> 一句话收尾：解析的难点不在"抽得出来"，而在"抽得可验收"——受限，是为了可信任。
