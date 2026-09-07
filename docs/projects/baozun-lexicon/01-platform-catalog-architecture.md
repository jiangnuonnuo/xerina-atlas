---
title: 01 · 完整需求定位与架构
type: project-chapter
project: baozun-lexicon
order: 2
group: 架构与定位
description: 问题边界、DOM-SCOUT 内部定制方案、受限 Agent 职责、端到端链路与架构取舍。
layout: project-doc
---


## 项目需求：问题不在"字段录入"，而在"字段散落"

业务系统里大量"字段定义"散落在页面代码中：菜单名、页签名、分组标题、表单字段、表格列、指标口径……它们**没有统一来源、没有版本、没有血缘，在不同的层级关系中，可能代表的含义也不相同**。
公司内部的数仓保存着业务落库后的真实数据，周报、日报都从数仓取数；但报表使用的字段口径挂在业务页面字段的语义上——报表同学按字典里登记的语义（例如"售后管理 → 退款单 → 退款金额"，口径"已退到账的金额"）写 SQL、做数仓字段映射。**页面字段是业务语义的源头，数仓字段是数据落地的物理载体，两者不是同一份内容的新旧版本，而是需要通过字典建立映射的两套东西。**

而平台页面是持续变化的：字段可能改名、挪层级、随版本下线。数仓的字段维护无法实时感知这些变化，也不可擅自改动既有口径，于是需要一个平台去维护"页面字段 ↔ 数仓字段"的映射资产；页面后续的变更，再通过树形目录结构被同步识别与维护。

带来的问题很具体：

- **定义漂移**：同一个"订单状态"，A 页面叫"状态"，B 页面叫"订单状态"，C 页面叫"order_status"。
- **改造返工**：页面改版时，没人知道哪些字段被影响，只能人肉核对。
- **口径打架**：指标"GMV"在三个报表里三个算法，谁都不对。
- **采集困难**：需要覆盖的业务平台超过 15 个、需长期维护的字段超过 100 万，纯人工逐页核对采集成本高、错误难以定位。

所以项目目标不是"做个录入框"，而是**把散落的字段沉淀为可维护的目录**，并让这个目录能随页面演进自动维护 / 人工维护，方便快速的定位层级问题。

## 全栈职责与边界

平台的**全栈研发与智能化方案**覆盖：

- **采集端**：DOM-SCOUT 内部定制插件、人工多选区与证据预览、受限 Playwright 自动入口、Easy Copy DOM 降级；
- **智能解析端**：DOM 清洗、受限 Agent、HierarchyProposal 编译为 FieldTreeDraft、反馈重算与进度推送；
- **平台前端**：目录树懒加载、批量录入、拖拽移动、草稿差异审核与导出任务工作台；
- **平台后端**：目录领域模型、闭包表事务、并发控制、异步导出与文件交付；
- **工程治理**：认证、接口契约、测试、部署、可观测性、安全和评估指标。

平台不修改被采集业务系统的页面逻辑，也不定义下游数仓的业务计算口径；它负责字段从页面证据到目录资产，再到字典交付的完整技术链路。

## 端到端链路

字段从页面到目录，再交付为字典，链路是：

![页面到目录的端到端链路](./assets/end-to-end-chain.svg)

Agent 运行边界的 Fireworks Tech Graph 版本：[查看企业 Agent 底座与字段项目编排架构](./assets/agent-runtime-architecture.svg)，<a href="../../media/projects/baozun-lexicon/diagrams/agent-runtime-architecture/index.html" target="_blank" rel="noreferrer">打开交互版</a>。它用于补充说明：插件采集、项目工作流和 Prompt 属于本项目编排，模型网关、检查点、工具注册和事件推送属于企业内部 Agent 底座。

下面这张图给出端到端全景：

<InteractiveDiagram
  title="Lexicon · AI 字段词典平台端到端全景"
  src="../../media/projects/baozun-lexicon/diagrams/platform-overview/index.html?embed=1"
  poster="../../media/projects/baozun-lexicon/diagrams/platform-overview/preview.png"
  description="从字段采集、层级解析、目录治理、字典交付到变更审核的闭环能力地图。"
/>

## 关键取舍

### 1. 采集：通用复制插件 vs 业务证据采集器

Easy Copy DOM 能完成“点选一个节点并复制 `outerHTML`”，适合低成本验证局部 DOM 路线，但它把选区、上下文补充、复制粘贴和格式校验拆成多次人工操作，无法直接表达多选区、元素指纹、采集版本和页面状态。

主方案因此升级为 **DOM-SCOUT + 内部字段证据适配层**。DOM-SCOUT 提供可视化高亮、多选、父子级导航、结构化格式、可访问性摘要、定位器指纹和 Token 预估；内部定制层负责字段场景专用格式、敏感值预清洗、页面上下文和 Agent 输入归一。内部 Agent 仍负责字段含义与业务层级，插件不做业务语义判断。

<InteractiveDiagram
  title="采集方案演进：固定输入与 DOM-SCOUT 业务证据采集器"
  src="../../media/projects/baozun-lexicon/diagrams/strategy-pivot/index.html?embed=1"
  poster="../../media/projects/baozun-lexicon/diagrams/strategy-pivot/preview.png"
  description="从固定输入、Agent + Playwright 全量探索、Easy Copy DOM 验证，演进到 DOM-SCOUT 内部定制采集与 Agent 语义解析。"
/>

这里的“取代”有明确边界：DOM-SCOUT 内部版可以取代 Easy Copy DOM 成为主选区与结构清洗入口，但不能取代页面状态判断、Agent 业务语义、FieldTreeDraft 编译校验和人工审核。Easy Copy DOM 在双轨验证期保留为无插件降级方案，达到质量门后再退出默认入口。

### 2. 解析：纯 Agent 探索 vs 受限多 Agent

Agent + Playwright 全量探索适合结构简单、状态有限的页面，但在复杂业务系统中容易受到登录态与风控、动态渲染（折叠框、虚拟列表、未渲染页签）和整页 HTML 上下文成本的影响，且 Agent 无法自证"采集完整"，结果不可控。主流程采用**受限 Agent**：输入只接收清洗后的 DomSnapshot，输出先形成 HierarchyProposal，再由后端编译为可编辑 FieldTreeDraft，不能直接写正式目录。

“内部微调”也分成两类：插件侧是序列化、清洗、权限和格式的工程定制；Agent 侧优先使用 Evidence、Hierarchy、Field Semantics、Reflection 和 ReAct 节点的角色化 Prompt、业务术语库、目录查询工具和固定评估集。只有积累足够的人工修订样本，并证明错误来自稳定的领域模式而非缺少 DOM 证据时，才评估模型微调，避免用训练掩盖采集问题。

### 3. 治理：关系库 vs 文档树

字段目录本质是树，而查询（找祖先、展开子树）和修改（新增、移动、删除）都是日常高频操作，不能为了一方牺牲另一方：只用父子关系表，写入简单但祖先链与子树查询贵；把整棵树存成文档，查询快但并发写入难。因此必须折中。
方案取中间路径：**邻接表保存直接父级事实 + 闭包表按需展开祖先/子树**，并维护结构不变量。
### 4. 交付：同步返回 vs 异步导出

字段字典可能很大、消费方很多。在请求线程里同步拼装会拖垮写入链路（同时占住 HTTP 线程和 MySQL 连接，堆内存随数据量线性上涨），所以用**独立导出任务**：在一致性快照上流式写入，状态可查、失败可重试、交付原子，把导出与日常在线操作分离；导出执行使用有界线程池 + 信号量限流，避免无界并发把 MySQL 连接池打满、反向拖垮采集与目录写入。

> 一句话收尾：架构的所有取舍，都围绕一个目标——**在不信任的输入上，交付可信任的结构**。
