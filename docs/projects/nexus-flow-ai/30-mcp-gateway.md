---
title: MCP 网关与协议适配
type: project-chapter
project: nexus-flow-ai
group: 平台能力
order: 30
description: 将 HTTP/RPC 接口统一转换为 MCP 工具，并集中处理协议、鉴权和调用适配。
sidebar: true
layout: project-doc
---

## 背景

已有 HTTP/RPC 接口如果逐个进行工具化，会带来重复注册、维护成本高和调用方式不统一的问题。因此设计 MCP 网关，统一将已有接口封装为标准 MCP 工具。

## 网关职责

- 支持 JSON/YAML 格式导入并一键转换协议。
- 统一鉴权、路由转发、参数映射和响应封装。
- 兼容 SSE、Streamable HTTP 标准 MCP 通信协议。
- 统一处理调用超时和错误返回。

## 价值

通过网关调用适配层，将协议差异和重复注册工作集中在平台侧处理，外部工具接入与维护成本降低约 70%，工具重复注册成本减少约 60%。

## 后续需要补充

协议版本兼容矩阵、工具权限模型、限流策略、调用链日志和重试边界应继续以独立 Markdown 章节沉淀。
