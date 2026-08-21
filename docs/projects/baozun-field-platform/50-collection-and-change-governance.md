---
title: 50 · 采集与变更治理
type: project-chapter
project: baozun-field-platform
order: 50
group: 变更治理
description: 再采集、变化集、身份匹配与人工审核发布。
layout: project-doc
---

## 采集与变更治理

> 目录不是一次性产物，要随页面演进持续维护。这一节讲再采集、变化集、身份匹配与人工审核。

---

## 再采集与变化集

页面改版后，重新采集拿到**新快照**，和**旧快照**做 diff，得到**变化集**：

- **新增**：页面多了字段 / 分组；
- **删除**：页面去掉了字段 / 分组；
- **修改**：字段文案 / 层级变了。

变化集是"目录怎么变"的最小表达，下游据此更新，而不是全量重来。

## 身份匹配

变化集成立的前提是**身份匹配**：新旧快照里的同一个字段，要能对上。

- 用**定位路径 + 语义特征**做主键；
- 路径变了但语义不变的，靠语义特征兜底；
- 匹配不上的，标记为"待人工确认"，不盲改。

<InteractiveDiagram
  title="从采集快照到审核发布的变更闭环"
  src="/media/projects/baozun-field-platform/diagrams/change-governance/index.html?embed=1"
  poster="/media/projects/baozun-field-platform/diagrams/change-governance/preview.png"
  description="身份匹配、变化集表达与人工审核发布。"
/>

## 人工审核与发布

变化集不直接生效，要**人工审核**：

- 审核看"增删改是否合理"；
- 审核通过才**发布**到正式目录；
- 审核拒绝则保留旧版本，记录原因。

这样目录的演进是**可审计、可回滚**的。

> 一句话收尾：变更治理让目录从"一次性快照"变成"长青资产"——前提是每一步变化都可见、可审、可回。
