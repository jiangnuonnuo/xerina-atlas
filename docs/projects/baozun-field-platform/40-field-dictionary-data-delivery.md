---
title: 40 · 字段字典数据交付
type: project-chapter
project: baozun-field-platform
order: 40
group: 数据交付
description: 从一致性快照到异步导出，再到原子交付的全过程。
layout: project-doc
---

## 字段字典数据交付

> 目录是"内部资产"，字典是"对外交付物"。这一节讲从一致性快照到异步导出，再到原子交付的全过程。

---

## 从快照到产物

字段字典不能直接从"正在写的目录"导出，要从**一致性快照**导出：

- 快照冻结某一时刻的目录状态；
- 导出基于快照，不阻塞写入；
- 快照之间可比对，支撑变更集。

<InteractiveDiagram
  title="字段字典从快照到正式产物的流水线"
  src="/media/projects/baozun-field-platform/diagrams/delivery-pipeline/index.html?embed=1"
  poster="/media/projects/baozun-field-platform/diagrams/delivery-pipeline/preview.png"
  description="一致性快照、检查点、流式写入与原子提交。"
/>

## 异步导出任务

导出是独立任务，不是同步返回：

- 从快照**流式写入**字典文件 / 表；
- 状态可查：待执行 / 执行中 / 完成 / 失败；
- 失败可重试，从断点续传；
- 多消费方各自订阅自己的导出。

## 导出任务的生命周期

导出任务有明确生命周期，便于观测与干预：

- **待执行**：已创建，等待资源；
- **执行中**：流式写入中；
- **等待重试**：遇到可恢复系统错误，并记录下一次执行时间；
- **成功 / 失败 / 取消**：终态。

<InteractiveDiagram
  title="字段字典导出任务的生命周期"
  src="/media/projects/baozun-field-platform/diagrams/export-task-lifecycle/index.html?embed=1"
  poster="/media/projects/baozun-field-platform/diagrams/export-task-lifecycle/preview.png"
  description="待执行、执行中、等待重试、成功、失败、取消。"
/>

## 原子交付

最终交付要**原子**：消费方要么看到完整新版本，要么看到旧版本，不能看到半成品。

- 写入目标先落"临时区"；
- 全部成功后**一次性切换**版本指针；
- 切换失败可回滚到上一版本。

> 一句话收尾：交付的难点不在"生成字典"，而在"生成可复现、可回滚、可信任的字典"。
