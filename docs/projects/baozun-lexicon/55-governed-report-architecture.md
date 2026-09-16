---
title: 55 · 治理型语义层与日报周报查询架构
type: project-chapter
project: baozun-lexicon
order: 55
group: 数仓与智能报表
description: 从实习生视角说明 Cognida 如何承接 Lexicon 字段词典，用治理型语义层而不是裸 Text2SQL，支撑电商数仓的日报周报查询。
layout: project-doc
---

## 55 · 治理型语义层与日报周报查询架构

## 1.我在这条链路上做什么

如果面试官问「你在数仓相关工作里做了什么」，我不会先说「我做了一个会写 SQL 的 AI」。

电商数仓里，分析师每周都在重复同一类劳动：拉 GMV、订单数、客单价，按渠道和时间做趋势和分群，再写成日报、周报。痛点通常不是 SQL 语法，而是三件事叠在一起：

1. **口径不稳定**：同样说「营收」，有人含退款、有人按下单时间、有人按支付时间；
2. **工作重复**：周报结构几乎固定，SQL 却每周重写、每周对一遍数；
3. **不敢把问数交给业务**：模型直接写 SQL，下周同一句话数字可能变。

我参与的工作，是把 Lexicon 沉淀下来的**业务字段语言**接到 Cognida 的**受治理查询层**：让业务用自然语言要一份经营报告，数字走已经钉死的同一口径。分析师从「每周手写 SQL」变成「维护指标口径」。

准确的产品位置是：

> Cognida 夹在业务问题和数仓之间。它负责理解问题、对齐口径、只读取数、组织报告。数仓仍然负责事实表和主题汇总；指标 Owner 仍然负责公式；正式发布仍然需要审核。当前是对话按需出数，还没有「每天定时推送正式日报」的调度层。

## 2. 为什么主叙事不是裸 Text2SQL

最直觉的方案是：用户说「出上周经营周报」，模型看表结构，写出一堆 `SELECT`，再拼成 Markdown。Demo 好看，电商周报过不了业务关：

- **口径会漂**：同一句「营收」这次 `SUM(pay_amount)`，下次再扣一次优惠；
- **JOIN 会漂**：订单和退款怎么连、粒度是订单还是明细，模型每次可能不一样；
- **数字会编**：模型擅长叙述，不擅长保证贡献度拆解正确；
- **安全过不了**：外部业务库必须只读，不能让 Agent 误跑 `UPDATE`。

所以第一性设计是把职责拆开：

| 谁 | 只做什么 | 绝不做什么 |
| --- | --- | --- |
| LLM / Data Agent | 理解问题、选指标和维度、拆报告章节、写业务解读 | 发明口径、口算关键数字、未覆盖时猜表猜列 |
| 语义引擎 `metricsql` | 按已建模口径确定性生成 SQL | 推断「营收」的业务含义 |
| `sql_execute` | 只读执行、限行、超时、路由数据源 | 翻译自然语言 |
| 分析代码 | 趋势、对比、归因等有公式的计算 | 用散文代替统计 |

一句话，也是简历上最该留下的一句：

> **口径归治理，SQL 归引擎，数字归代码，叙述归模型。**

![口径归治理，SQL 归引擎，数字归代码](./assets/duty-split.svg)

## 3. 系统在数仓上的位置

![电商数仓上的自然语言查询层](./assets/text2sql-runtime-architecture.svg)


请求从 `POST /api/v1/agent/text2sql/stream` 进来后，会强制进入 Data Agent，而不是旧的 Plan-Execute-Reflect 流水线。会话默认只给 **read** 权限；如果绑定了外部电商只读库，查询打到那个库，不会静默落到应用自己的元数据库。

数仓在这条链路里仍然是「统一事实存储」。Cognida 做的是上层消费：把人话收成可验证的查询，把结果收成可引用的 `result_id`。

## 4. 三条查询路径，不要混成一句「AI 会写 SQL」

| 路径 | 适用问题 | 谁写 SQL | 可信等级 |
| --- | --- | --- | --- |
| 治理指标查询 | GMV、订单数、客单价等已建模指标 | `metricsql.Build()` 确定性装配 | 周报主路 |
| 即席 Text2SQL | 一个数字、一张明细、尚未治理的字段 | LLM 看完 `get_schema` 后写 | 探索降级 |
| 综合报告 | 日报、周报、经营概览 | 多段取数，优先走治理路径再汇总 | 结构由 skill 约束 |

综合报告不是让模型一次性凭空写出整份周报。`report-composition` 会把报告拆成总览、趋势、分群等块，能走语义层的走语义层，走不了的才回退，并且必须在回答里标明「这是推断口径」。

![周报取数：治理主路与词法回退](./assets/governed-vs-lexical.svg)

<InteractiveDiagram
  title="周报取数：治理主路与词法回退"
  src="../../media/projects/baozun-lexicon/diagrams/governed-vs-lexical/index.html?embed=1"
  poster="../../media/projects/baozun-lexicon/diagrams/governed-vs-lexical/preview.png"
  description="意图命中报告后先判断语义覆盖：覆盖则由 metricsql 写 SQL，未覆盖才回退 get_schema 后的 Text2SQL。"
/>

未覆盖时返回 `covered=false`，**不生成半截 SQL、不猜测**。这是治理优先：猜错口径比查不出数更危险。

## 5. 六点契约：错误最多停在候选阶段

![查询链路的六点输入输出契约](./assets/text2sql-contracts.svg)

<InteractiveDiagram
  title="查询链路的六点输入输出契约"
  src="../../media/projects/baozun-lexicon/diagrams/text2sql-contracts/index.html?embed=1"
  poster="../../media/projects/baozun-lexicon/diagrams/text2sql-contracts/preview.png"
  description="自然语言、查询意图、字段绑定、SQL 候选、受控查询和结果信封逐级传递。"
/>

| 阶段 | 输入 | 处理 | 输出 | 不能越过的边界 |
| --- | --- | --- | --- | --- |
| 1. 请求接收 | 自然语言、会话、租户、数据源 | 判断取数 / 趋势 / 归因 / 报告 | 带 request_id 的任务 | 未明确数据源时不能静默换库 |
| 2. 意图解析 | 用户问题 | 抽出时间、维度、指标、过滤、对比 | 结构化意图 | 歧义时先澄清 |
| 3. 语义绑定 | 意图、Schema、语义模型、词典 | 业务词对齐到 Metric / Dimension | 绑定结果与 uncovered | 不能用中文名冒充物理列 |
| 4. SQL 生成 | 绑定结果 | 引擎装配，或受限模型生成候选 | SQL、版本、覆盖状态 | 只能引用已发现或已治理对象 |
| 5. 受控执行 | SQL、`database_id`、行数上限 | 只读校验、LIMIT、超时、暂存 | 结果信封与 `result_id` | 模型不能持有数据库连接 |
| 6. 报表产出 | 结果引用和报告结构 | 代码算数字，模型组织解释 | 表格、图表、摘要、审计 | 未审核结果不能当正式口径 |

## 6. Lexicon 词典怎么接到物理字段

Lexicon 回答「业务人员说的销售额在哪个页面、属于哪个模块」。Cognida 还要继续确认：这个词对应哪张物理表、哪一列、什么聚合、要不要值映射。

![业务词到物理字段的绑定路径](./assets/text2sql-semantic-binding.svg)

<InteractiveDiagram
  title="业务词到物理字段的绑定路径"
  src="../../media/projects/baozun-lexicon/diagrams/text2sql-semantic-binding/index.html?embed=1"
  poster="../../media/projects/baozun-lexicon/diagrams/text2sql-semantic-binding/preview.png"
  description="业务词先经过词典和指标口径，再与真实 Schema 绑定；歧义时回到澄清或人工审核。"
/>

| 业务词 | 语义对象 | 物理对象 | 必须确认的事实 |
| --- | --- | --- | --- |
| 销售额 | Metric / Measure | 支付金额列或表达式 | 支付还是下单；是否过滤成功状态 |
| 支付订单量 | Metric | 汇总列或去重订单 ID | 汇总表能否直接 `SUM` |
| 渠道 | Dimension | 渠道列或维表 | 「直营」是否要映射成 `DIRECT` |
| 退款金额 | Metric | 退款金额列 | 按退款发生日还是订单日 |

页面上的「销售额」不能直接变成 `sales_amount`。字段词典是召回和解释证据，不是物理库的替代品。

## 7. 「AI 可以执行 SQL」到底指什么

准确说法：**AI 可以生成或选择一条 SQL，通过工具请求后端执行；真正连库、鉴权、跑查询、存结果的是后端。**

```text
用户问题
  → Data Agent 判断需要查数
  → semantic_query 或 get_schema
  → SQL 候选
  → sql_execute
  → 只读校验、数据源路由、LIMIT、超时
  → 数仓返回结果
  → Result Store 保存完整行集
  → Agent 只看到有界信封
```

模型看不到密码，也不能绕过工具直连。语义模型绑定的 `database_id` 必须原样传给执行工具，否则治理 SQL 是裸表名，可能打到应用库。

