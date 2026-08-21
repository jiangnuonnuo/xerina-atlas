---
title: 字段目录平台
type: project
category: engineering
categoryLabel: 字段目录平台
year: 2026
order: 40
featured: true
status: active
summary: 把业务页面上的菜单、页签、分组、字段与指标沉淀为可维护的层级目录，以一致性快照与异步导出交付字段字典；上游探索 DOM-first 的页面字段采集与受限 Agent 层级解析。
role: 字段目录平台｜后端 / 平台研发实习
stack:
  - Java
  - Spring Boot
  - MySQL
  - Agent
  - Archify
tags:
  - 字段目录平台
  - 元数据治理
  - Agent 应用工程
  - DOM-first 采集
  - 异步字典交付
nav: true
sidebar: true
layout: project-doc
---

## 字段目录平台

> 这是一份面向 HR、技术面试官与项目协作者的"项目说明书"。它把"字段目录平台"这件事拆成可验证的工程问题：字段从哪来、怎么被解析成层级、怎么治理成目录、怎么交付成字典、怎么在页面变化后继续维护。

---

## 先看这一页

如果你只想快速判断"这个人能不能聊这个项目"，读这两节就够：

- **[00 · 面试导读](/projects/baozun-field-platform/interview-guide)**：实习讲解怎么讲、简历怎么写、高频追问怎么答。
- **[01 · 完整需求定位与架构](/projects/baozun-field-platform/01-platform-catalog-architecture)**：项目边界、我的角色、端到端链路、关键取舍。

如果你要深聊技术，按这个顺序往下读：

- **[10 · DOM-first 页面字段采集](/projects/baozun-field-platform/10-dom-field-capture)**：字段证据怎么来，覆盖与降级怎么处理。
- **[20 · 受限 Agent 层级解析](/projects/baozun-field-platform/20-agent-hierarchy-parsing)**：Agent 怎么把证据变成可验收的候选字段树。
- **[30 · 平台字段目录结构治理](/projects/baozun-field-platform/30-platform-field-structure-management)**：目录树不变量、生命周期与一致性。
- **[40 · 字段字典数据交付](/projects/baozun-field-platform/40-field-dictionary-data-delivery)**：从快照到异步导出与原子交付。
- **[50 · 采集与变更治理](/projects/baozun-field-platform/50-collection-and-change-governance)**：再采集、变化集与人工审核。
- **[60 · 可靠性、安全与评估](/projects/baozun-field-platform/60-reliability-security-and-evaluation)**：横切能力与边界。

---

## 阅读导航

| 章节 | 主题 | 你会带走什么 |
| --- | --- | --- |
| [00 · 面试导读](/projects/baozun-field-platform/interview-guide) | 实习讲解、简历、高频追问 | 一份能讲清楚的"项目故事" |
| [01 · 完整需求定位与架构](/projects/baozun-field-platform/01-platform-catalog-architecture) | 需求边界、角色、链路、取舍 | 一张端到端架构图 |
| [10 · DOM-first 页面字段采集](/projects/baozun-field-platform/10-dom-field-capture) | 采集来源、覆盖、降级 | 字段证据的"契约" |
| [20 · 受限 Agent 层级解析](/projects/baozun-field-platform/20-agent-hierarchy-parsing) | 解析编排、提示、反馈 | 可验收的候选字段树 |
| [30 · 平台字段目录结构治理](/projects/baozun-field-platform/30-platform-field-structure-management) | 树不变量、生命周期、一致性 | 目录结构的"地基" |
| [40 · 字段字典数据交付](/projects/baozun-field-platform/40-field-dictionary-data-delivery) | 快照、导出、原子交付 | 可复现的交付物 |
| [50 · 采集与变更治理](/projects/baozun-field-platform/50-collection-and-change-governance) | 再采集、变化集、审核 | 目录如何"长青" |
| [60 · 可靠性、安全与评估](/projects/baozun-field-platform/60-reliability-security-and-evaluation) | 可靠性、安全、评估 | 工程化的边界意识 |

---

## 平台全景（可交互）

<InteractiveDiagram
  title="字段目录平台端到端全景"
  src="/media/projects/baozun-field-platform/diagrams/platform-overview/index.html?embed=1"
  poster="/media/projects/baozun-field-platform/diagrams/platform-overview/preview.png"
  description="从字段采集、层级解析、目录治理、字典交付到变更审核的闭环能力地图。"
/>

---

## 如果只准备一次面试

建议按这个顺序读：

1. **00 → 01**：先讲清楚"这是什么、我做了什么"。
2. **10 → 20 → 30**：再讲"字段怎么来、怎么解析、怎么治理"。
3. **40 → 50 → 60**：最后讲"怎么交付、怎么维护、工程边界在哪"。

---

## 一张图看懂文档结构

```text
字段目录平台 · 项目文档
├─ 00 面试导读
│   ├─ 实习讲解怎么说
│   ├─ 简历怎么写
│   └─ 高频追问怎么答
├─ 01 完整需求定位与架构
│   ├─ 问题不在"字段录入"，而在"字段散落"
│   ├─ 我的角色与边界
│   └─ 端到端链路与关键取舍
├─ 10 DOM-first 页面字段采集
├─ 20 受限 Agent 层级解析
├─ 30 平台字段目录结构治理
├─ 40 字段字典数据交付
├─ 50 采集与变更治理
└─ 60 可靠性、安全与评估
```

---

> **说明**：本仓库的图表采用 Archify 生成，交互版本通过 `InteractiveDiagram` 内嵌展示；静态封面用于快速预览。
