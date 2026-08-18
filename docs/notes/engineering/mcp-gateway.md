---
title: MCP 网关应该统一什么
type: note
category: engineering
date: 2026-04-20
order: 10
summary: 从 NexusFlow AI 项目出发，整理 MCP 工具统一接入时需要集中处理的协议与调用问题。
tags:
  - MCP
  - 网关
  - AI 应用工程化
readingTime: 6 min
relatedProjects:
  - nexus-flow-ai
---

# MCP 网关应该统一什么

## 问题是什么

当一个系统已经存在多种 HTTP/RPC 接口时，逐个把接口注册成 Agent 工具会产生重复工作。工具描述、参数映射、认证、路由和错误处理容易散落在不同业务模块中。

## 网关的边界

一个合适的 MCP 网关至少需要统一四类工作：

1. 协议转换：支持 JSON/YAML 导入，并转换为标准 MCP 工具描述。
2. 通信适配：兼容 SSE、Streamable HTTP 等标准 MCP 通信方式。
3. 调用治理：统一鉴权、路由、参数映射、响应封装和超时控制。
4. 成本控制：减少外部工具重复注册和后续维护成本。

## 工程上的提醒

网关不是把所有业务逻辑搬到一处，而是把跨工具重复出现的接入和治理能力集中起来。业务接口仍然应该保持自己的领域边界，网关只负责协议与调用适配。

## 关联项目

本文对应 [NexusFlow AI 的 MCP 网关与协议适配](../../projects/nexus-flow-ai/30-mcp-gateway)。
