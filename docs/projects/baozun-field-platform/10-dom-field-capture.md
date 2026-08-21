---
title: 10 · DOM-first 页面字段采集
type: project-chapter
project: baozun-field-platform
order: 10
group: 采集
description: 字段证据怎么来，人工与自动双入口如何收敛，覆盖与降级怎么处理。
layout: project-doc
---

## DOM-first 页面字段采集

> 字段不是"录入"出来的，而是从页面"采集"出来的。这一节讲字段证据怎么来、两条入口如何收敛、覆盖与降级怎么处理。

---

## 字段证据是什么

字段证据（Field Evidence）是页面上能观察到的、可定位的字段痕迹，包括：

- **结构痕迹**：菜单、页签、分组标题、表单 label、表格列头；
- **语义痕迹**：placeholder、字段说明、校验文案；
- **位置痕迹**：DOM 路径、可见性、层级深度。

一条证据至少包含：`页面标识 + 定位路径 + 原始文本 + 采集方式 + 采集时间`。它是后续解析的**唯一可信输入**。

## 两条入口：人工与自动

采集有两条入口，最终汇入同一种证据契约：

- **人工录入**：业务同学在页面上框选字段，标注"这是什么"。快、准、可控，但不可规模。
- **自动采集**：从渲染后的 DOM 抽取结构与语义痕迹。能规模、能覆盖，但需验收。

两条入口产出**同一份字段证据快照**，区别只在`采集方式`字段。下游解析不关心来源，只吃契约。

<InteractiveDiagram
  title="人工与自动采集汇入同一字段快照"
  src="/media/projects/baozun-field-platform/diagrams/dom-capture/index.html?embed=1"
  poster="/media/projects/baozun-field-platform/diagrams/dom-capture/preview.png"
  description="两条入口产出统一的字段证据契约。"
/>

## DOM-first 而不是模板-first

为什么不从"固定模板 / 固定缩进"抽字段？因为页面结构千奇百怪：

- 有的用 Tab 切换内容，有的用折叠面板；
- 有的字段在弹窗里，有的在滚动区底部；
- 有的"分组"只是视觉分割，不是语义分组。

**DOM-first** 直接从渲染后的 DOM 抽证据，让"页面怎么长"由页面自己决定，采集逻辑只负责"看"和"记"。

## 页面状态与部分完成

页面不是静态的。Tab 未点开、折叠未展开、滚动未到底，字段就"还没出现"。采集要处理这些**页面状态**：

- **可见性状态**：元素是否在 DOM 且可见；
- **交互状态**：是否需要点击 / 滚动才能暴露；
- **条件状态**：是否依赖其他字段值才出现。

对"未暴露"的字段，采集标记为**部分完成**，记录"还差哪一步交互"，而不是假装采全了。

<InteractiveDiagram
  title="页面状态探索与部分完成"
  src="/media/projects/baozun-field-platform/diagrams/page-state-exploration/index.html?embed=1"
  poster="/media/projects/baozun-field-platform/diagrams/page-state-exploration/preview.png"
  description="Tab、折叠、滚动、条件区等状态下的覆盖与降级。"
/>

## 覆盖与降级

采集不可能 100% 完美，工程上要接受**部分覆盖 + 明确降级**：

- **覆盖策略**：先采结构稳定的部分（菜单、页签、列头），再采需要交互的部分；
- **降级策略**：交互拿不到的，标记为"待人工补采"，不阻塞主链路；
- **去重策略**：同一字段多种痕迹，按定位路径合并，保留最强证据。

> 一句话收尾：采集的目标不是"采全"，而是"采到的都可信任、采不到的都看得见"。
