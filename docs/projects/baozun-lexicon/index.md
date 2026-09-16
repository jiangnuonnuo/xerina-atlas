---
title: Lexicon · AI 字段词典平台
type: project
category: engineering
categoryLabel: Lexicon · AI 字段词典平台
visual: lexicon
icon: list-tree
cardImage: /media/projects/lexicon-cover.webp
year: 2026
order: 10
featured: true
status: active
summary: 把业务页面上的菜单、页签、分组、字段与指标沉淀为可维护的层级目录，通过 DOM-SCOUT 内部定制采集、受限 Agent 语义解析、一致性快照与异步导出形成完整字段治理闭环。
role: Lexicon · AI 字段词典平台｜全栈研发
stack:
  - Java
  - Spring Boot
  - MySQL
  - SQLite
  - JavaScript
  - HTML/CSS
  - Chrome Extension MV3
  - Agent
  - Apache POI
  - Nginx
tags:
  - Lexicon · AI 字段词典平台
  - 元数据治理
  - Agent 应用工程
  - DOM-SCOUT 定制采集
  - 异步字典交付
nav: true
sidebar: true
layout: project-doc
---

## Lexicon · AI 字段词典平台

> 这是一份Lexicon的全栈技术专栏。它系统拆解 DOM-SCOUT 内部定制采集、受限 Agent 业务语义解析、交互工作台、目录树事务并发、数据库并发和异步 XLSX 字典交付。

---

## 先看这一页

如果你要系统理解项目需求、完整技术方案和核心实现，先读：

- **[00 · Lexicon项目技术总纲](./project-knowledge-directory)**：从全栈职责、端到端架构、关键取舍到完整文章目录的技术地图。

然后阅读 **[01 · 完整需求定位与架构](./01-platform-catalog-architecture)**，建立项目边界、端到端链路和关键取舍。

如果你要深聊技术，按这个顺序往下读：

- **[10 · DOM-SCOUT 驱动的页面字段采集](./10-dom-field-capture)**：开源能力如何内部定制，人工如何选区，插件如何清洗，证据如何进入 Agent。
- **[20 · 受限 Agent 层级解析](./20-agent-hierarchy-parsing)**：Agent 怎么把证据变成可验收的候选字段树。
- **[25 · 字段治理交互工作台](./25-full-stack-workbench)**：采集、解析、目录审核和导出任务如何形成统一交互闭环。
- **[30 · 平台字段目录结构治理](./30-platform-field-structure-management)**：目录树不变量、生命周期与一致性。
- **[40 · 数据库并发与 XLSX 字典交付](./40-field-dictionary-data-delivery)**：从数据库快照到异步导出、原子交付与高并发边界。

如果你要理解字段字典如何变成可执行口径，再接到日报周报问数，按三层阅读：

**语义模型**

- **[50 · 从字段字典到可执行语义](./50-semantic-model-from-dictionary)**：为什么字典还不够，一行字典如何变成逻辑表、度量和指标。
- **[51 · 语义对象、流转与目录卡](./51-semantic-objects-and-runtime-flow)**：六个对象怎么分工，为什么对话只能看到业务目录。本层停在「模型包交给编译」。

**执行引擎**

- **[60 · 编译步骤如何使用语义模型](./60-metricsql-compile-engine)**：每一步读模型里哪些对象，怎样串到下一步。
- **[61 · 从 Agent Query 到最终 SQL](./61-metricsql-name-resolution)**：Agent 允许返回什么，再用「上周华东 GMV 按天」装配成一条 SQL。
- **[62 · 覆盖、JOIN 与 SQL 装配](./62-metricsql-join-and-assemble)**：未覆盖必须空 SQL，只走已登记的边，再按版本复用。

**Agent 循环**

- **[55 · 治理型语义层与日报周报查询架构](./55-governed-report-architecture)**：谁调用引擎、治理主路与词法回退、只读执行边界。面试 90 秒口播也用这篇，不另占一层。

---

## 阅读导航

| 章节 | 主题 | 你会带走什么 |
| --- | --- | --- |
| [00 · Lexicon项目技术总纲](./project-knowledge-directory) | 全栈职责、整体架构、技术取舍、知识目录 | 一份可逐章展开的项目技术地图 |
| [01 · 完整需求定位与架构](./01-platform-catalog-architecture) | 需求边界、角色、链路、取舍 | 一张端到端架构图 |
| [10 · DOM-SCOUT 驱动的页面字段采集](./10-dom-field-capture) | 插件定制、人工选区、清洗、补采与降级 | `DomSnapshot` 证据契约 |
| [20 · 受限 Agent 层级解析](./20-agent-hierarchy-parsing) | 解析编排、提示、反馈 | 可验收的候选字段树 |
| [25 · 字段治理交互工作台](./25-full-stack-workbench) | 采集、解析、审核、目录和导出交互 | 一条完整的前后端状态链路 |
| [30 · 平台字段目录结构治理](./30-platform-field-structure-management) | 树不变量、生命周期、一致性 | 目录结构的"地基" |
| [40 · 数据库并发与 XLSX 字典交付](./40-field-dictionary-data-delivery) | 数据库并发、快照、XLSX、原子交付 | 不影响采集的可复现交付物 |
| [50 · 从字段字典到可执行语义](./50-semantic-model-from-dictionary) | 语义模型 · 静态字典升级为可执行口径 | 一行字典如何变成语义对象 |
| [51 · 语义对象、流转与目录卡](./51-semantic-objects-and-runtime-flow) | 语义模型 · 对象分工、写入读取、目录卡 | 对话和编译为什么不能看同一份资料 |
| [60 · 编译步骤如何使用语义模型](./60-metricsql-compile-engine) | 执行引擎 · 步骤与模型对象串联 | 每一步消费哪类语义对象 |
| [61 · 从 Agent Query 到最终 SQL](./61-metricsql-name-resolution) | 执行引擎 · Query 契约与完整案例 | 上周华东 GMV 如何变成一条 SQL |
| [62 · 覆盖、JOIN 与 SQL 装配](./62-metricsql-join-and-assemble) | 执行引擎 · 覆盖、连表、装配、复用 | 无边为什么不能猜 ON |
| [55 · 治理型语义层与日报周报查询架构](./55-governed-report-architecture) | Agent 循环 · 职责拆分与问数主路 | 口径、SQL、数字各归谁 |

---

## 平台全景（可交互）

<InteractiveDiagram
  title="Lexicon端到端全景"
  src="../../media/projects/baozun-lexicon/diagrams/platform-overview/index.html?embed=1"
  poster="../../media/projects/baozun-lexicon/diagrams/platform-overview/preview.png"
  description="从字段采集、层级解析、草稿确认、目录治理到字典交付的闭环能力地图。"
/>

---

## 一张图看懂文档结构

![Lexicon文章结构](./assets/document-map.svg)

---

> **说明**由于为公司内部实现项目，相关源码，数据库结构，具体代码实现等都进行脱敏和安全防护，该项目文章只分享工作流和大概的实现路线。
