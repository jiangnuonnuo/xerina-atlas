---
title: NexusFlow AI
type: project
category: ai
categoryLabel: AI 应用
visual: ai
year: 2026
order: 10
featured: true
status: active
summary: 基于 Agent 平台搭建 AI + draw.io 智能绘图、MCP 网关与 RAG 知识库能力，记录从协议接入到智能体工程化的完整实践。
role: Java 后端开发
stack:
  - Java
  - MCP
  - RAG
  - Agent
  - draw.io
tags:
  - AI 应用工程化
  - 工具调用
  - 检索增强
nav: true
sidebar: true
layout: project-doc
---

## 项目定位

NexusFlow AI 是一个围绕 Agent 平台持续构建的 AI 应用工程实践项目。我主要承担 Java 后端开发，重点落地智能绘图、MCP 网关、RAG 知识库和多类型 Agent 模板等能力。

## 核心结果

- 通过“AI 生成 + 人工微调”模式支持架构图、产品图和业务流程图等场景，出图效率提升 90% 以上。
- 统一封装 HTTP/RPC 接口为标准 MCP 工具，外部工具接入与维护成本降低约 70%。
- 兼容 SSE、Streamable HTTP 通信协议，减少约 60% 的工具重复注册成本。
- Agent 搭建耗时从 5+ 分钟降低到 1 分钟内。

## 文档阅读路径

建议按照“问题与目标 → 智能绘图 → MCP 网关 → RAG 与 Agent → 验证结果”的顺序阅读：

- [问题与整体方案](./10-problem-and-solution)
- [AI + draw.io 智能绘图](./20-ai-drawio)
- [MCP 网关与协议适配](./30-mcp-gateway)
- [RAG 与 Agent 模板](./40-rag-and-agent)
- [结果与后续计划](./50-results-and-next)

## 我的职责边界

我负责后端功能设计与开发，关注协议适配、鉴权、路由、参数映射、响应封装、检索流程和 Agent 模板等工程问题；产品体验、视觉设计和具体模型效果需要与其他角色协作完成。
