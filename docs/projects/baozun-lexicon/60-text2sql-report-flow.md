---
title: 60 · 我参与的日报周报 SQL 生成流程
type: project-chapter
project: baozun-lexicon
order: 60
group: 数仓与智能报表
description: 用脱敏日报和周报案例，拆解 Cognida 从自然语言解析、指标绑定到 SQL 执行和报告结果的完整流程。
layout: project-doc
---

## 我参与的日报周报 SQL 生成流程

> 本文中的表名、字段名、日期、数值和接口名称均为脱敏或泛化示例，仅用于说明技术流程。

![Text2SQL 日报周报流程](./assets/text2sql-report-flow.svg)

<InteractiveDiagram
  title="Text2SQL 日报周报流程"
  src="../../media/projects/baozun-lexicon/diagrams/text2sql-report-flow/index.html?embed=1"
  poster="../../media/projects/baozun-lexicon/diagrams/text2sql-report-flow/preview.png"
  description="从业务问题、意图解析和 Schema 探查，到 SQL 生成、只读执行、结果保存和报告交付。"
/>

## 1. 先区分日报周报和普通问数

“查一个数字”和“生成日报/周报”看起来都可以用自然语言转 SQL，但工程要求不同：

| 场景 | 结果 | 允许的生成方式 | 质量要求 |
| --- | --- | --- | --- |
| 即席问数 | 一个数、一张明细或一个排行 | `get_schema → SQL → sql_execute` | 结果可解释，失败可重试 |
| 日报 | 当前日指标、维度分布、对比值 | 语义查询优先，必要时受控 SQL | 日期边界、指标口径和总计必须可复核 |
| 周报 | 周期汇总、趋势、环比或同比 | 审核 SQL 模板 + 参数替换 | 同一模板跨周期稳定，不能每天换口径 |

项目里的 `report-composition` 技能把报告拆成总览、趋势、分群和对比等多个查询块，分别取数后再分析和渲染。我的落地原则是：**自然语言负责提出需求，已审核的 SQL 或语义模型负责稳定取数，代码负责计算数字，模型负责组织解释。**

## 2. 脱敏日报案例：从一句话到查询意图

业务问题：

> 查询 2026 年 8 月 30 日各渠道销售额、支付订单量和退款金额，并与上周同日比较，生成日报，按销售额从高到低输出。

我不会把这句话直接放进 SQL 字符串，而是先拆解：

| 查询要素 | 解析结果 | 需要确认的边界 |
| --- | --- | --- |
| 当前周期 | `2026-08-30 00:00:00` 到 `2026-08-31 00:00:00` | 使用公司业务时区，还是数据源时区 |
| 对比周期 | `2026-08-23` 同一自然日 | “上周”是否指上周同日 |
| 维度 | 渠道 | 使用渠道名称还是渠道 ID |
| 指标 | 销售额、支付订单量、退款金额 | 销售额的正式业务口径是什么 |
| 对比方式 | 差值、变化率 | 对比值为 0 时如何展示 |
| 排序 | 当前销售额降序 | 是否限制 Top 100 |
| 输出 | 日报表格、图表和摘要 | 哪些字段允许进入报告 |

如果“销售额”没有被确认是支付金额，“上周”没有统一解释，系统应先返回澄清问题。这是查询正确性的一部分，不是体验上的多余步骤。

说明性的意图结构可以是：

```json
{
  "report_type": "daily",
  "time_zone": "business_timezone",
  "period": { "start": "2026-08-30", "end": "2026-08-30" },
  "compare": { "start": "2026-08-23", "end": "2026-08-23", "kind": "same_day_last_week" },
  "dimensions": ["渠道"],
  "metrics": ["销售额", "支付订单量", "退款金额"],
  "derived_metrics": ["销售额差值", "销售额变化率"],
  "order_by": [{ "name": "销售额", "direction": "desc" }],
  "limit": 100
}
```

这个对象的重点是把“时间、维度、指标和计算关系”显式化。它允许后端逐项校验，也允许前端在执行前把 SQL 草稿和口径展示给审核人。

## 3. Schema 探查：生成 SQL 前先认识数据

即席 Text2SQL 的第一步是 `get_schema`。它可以从数据源的元数据中获取表清单、表说明、列名、类型、可空性和列注释；不确定表名时，先获取表清单再定位。

脱敏后的候选表如下：

| 逻辑含义 | 示例表 | 字段 | 类型 | 用途 |
| --- | --- | --- | --- | --- |
| 渠道日报汇总 | `daily_sales_summary` | `stat_date` | date | 日期间过滤 |
| 渠道日报汇总 | `daily_sales_summary` | `channel` | varchar | 分组维度 |
| 渠道日报汇总 | `daily_sales_summary` | `paid_amount` | decimal | 支付金额 |
| 渠道日报汇总 | `daily_sales_summary` | `paid_orders` | bigint | 已聚合支付订单数 |
| 渠道日报汇总 | `daily_sales_summary` | `refund_amount` | decimal | 退款金额 |

Schema 只回答“有什么”，不完全回答“应该怎么统计”。例如：

- `paid_orders` 如果来自日渠道汇总表，可以直接 `SUM`；
- 如果换成订单明细表，则可能必须 `COUNT(DISTINCT order_id)`；
- `refund_amount` 可能按退款发生日统计，也可能按订单创建日归属；
- `channel` 可能需要把页面上的“直营”映射成数据库中的 `DIRECT`。

所以 Schema 探查之后还要经过指标语义绑定，不能看到一个名为 `amount` 的字段就直接判定它是销售额。

## 4. 语义路径如何生成日报 SQL

对于日报和周报这种需要口径一致的场景，我会优先使用语义主路径：

```text
semantic_models
  → 识别已生效指标和维度
  → 将“销售额”对齐到治理指标，将“渠道”对齐到治理维度
  → semantic_query 提交 metrics / dimensions / filters / order_by
  → 指标引擎生成治理 SQL
  → sql_execute 执行生成的 SQL
```

`semantic_query` 的请求不是直接提交中文 SQL，而是提交结构化对象：

```json
{
  "model": "渠道销售模型",
  "metrics": ["销售额", "支付订单量", "退款金额"],
  "dimensions": ["渠道"],
  "filters": [
    { "field": "统计日期", "op": "=", "values": ["2026-08-30"] }
  ],
  "order_by": [{ "field": "销售额", "desc": true }],
  "limit": 100
}
```

指标引擎再根据逻辑表、物理表、度量表达式、默认聚合和关联关系装配 SQL。这样“销售额”的公式只在语义模型中维护一次，日报、周报和临时查询不会各自写出不同口径。

如果语义模型完整覆盖，结果会带有 `covered=true`、模型名称、模型版本和生成 SQL；如果某个指标、维度或过滤字段未覆盖，返回 `covered=false` 和未覆盖名称，Data Agent 回退到 `get_schema + sql_execute`。回退是可用性机制，不等于已经获得正式报表口径。

## 5. 脱敏 SQL 结果和每个子句的含义

假设示例表已经按日期和渠道完成汇总，且 `paid_orders` 的口径已确认，可能生成如下只读查询：

```sql
WITH current_day AS (
    SELECT
        channel,
        SUM(paid_amount) AS current_sales,
        SUM(paid_orders) AS current_orders,
        SUM(refund_amount) AS current_refund
    FROM daily_sales_summary
    WHERE stat_date = '2026-08-30'
    GROUP BY channel
), previous_day AS (
    SELECT
        channel,
        SUM(paid_amount) AS previous_sales
    FROM daily_sales_summary
    WHERE stat_date = '2026-08-23'
    GROUP BY channel
)
SELECT
    current_day.channel,
    current_day.current_sales,
    previous_day.previous_sales,
    current_day.current_sales
        - COALESCE(previous_day.previous_sales, 0) AS sales_difference,
    (
        current_day.current_sales
        - COALESCE(previous_day.previous_sales, 0)
    ) / NULLIF(previous_day.previous_sales, 0) AS wow_rate,
    current_day.current_orders,
    current_day.current_refund
FROM current_day
LEFT JOIN previous_day
    ON current_day.channel = previous_day.channel
ORDER BY current_day.current_sales DESC
LIMIT 100;
```

这段示例的关键点不是 SQL 长度，而是每个决策都有原因：

| SQL 部分 | 作用 | 错误时的后果 |
| --- | --- | --- |
| `current_day` | 当前日报周期按渠道聚合 | 日期错会导致整份日报错位 |
| `previous_day` | 上周同日使用相同维度和聚合 | 不能误用上一个自然周 |
| `SUM(paid_amount)` | 采用已确认的支付金额口径 | 可能把下单金额当销售额 |
| `SUM(paid_orders)` | 依赖汇总表的粒度 | 换成明细表会产生重复或错误计数 |
| `LEFT JOIN` | 保留当前周期有数据的渠道 | `INNER JOIN` 会丢掉新出现渠道 |
| `COALESCE` | 对缺失对比值给出约定默认值 | 需与业务约定区分空值和 0 |
| `NULLIF` | 避免对比值为 0 时除零 | 否则会执行失败或产生无穷值 |
| `LIMIT 100` | 限制报告输出规模 | 不限制可能拉取无界结果 |

这里还有一个必须说明的业务细节：如果对比周期不存在渠道，`previous_sales` 展示为空、0 或“不适用”，不能由模型私自决定。计算公式和展示规则都应写进指标或报告模板。

## 6. 周报只替换参数，不随机重写口径

周报例子：

> 统计 2026 年 8 月 24 日至 8 月 30 日各渠道销售额、支付订单量和退款金额，与 8 月 17 日至 8 月 23 日比较，输出周报。

这时查询意图变成：

```text
当前周期：2026-08-24 <= stat_date < 2026-08-31
对比周期：2026-08-17 <= stat_date < 2026-08-24
分组维度：channel
指标：销售额、支付订单量、退款金额
比较：当前周期 - 对比周期、变化率
```

如果日报 SQL 已经过审核，周报可以复用相同的指标绑定、JOIN 和派生公式，只替换周期参数和时间粒度。对于周报趋势，语义引擎的 `time_grain=week` 可以按数据源方言生成周粒度；对于固定报告，更推荐保存已经审核的参数化 SQL 模板，避免模型每周选择不同的日期函数。

日报和周报的日期边界必须使用半开区间：

```sql
WHERE stat_date >= :period_start
  AND stat_date < :period_end
```

这样可以避免把当天 00:00:00 重复算入前一天，也能较好地处理时间字段带时分秒的表。实际使用时还要统一业务时区、数据延迟和“最近完整日”的定义。

## 7. 结果怎样生成报表，而不是让模型编数字

查询成功后，结果处理分为三层：

1. **结果数据层**：完整行集保存到 Result Store，得到 `result_id`；
2. **确定性分析层**：代码基于结果集计算总计、差值、变化率、排名、趋势或异常；
3. **展示层**：前端用表格、图表和指标卡呈现，模型只解释已经返回的数据。

项目的结果信封包含列名、类型、总行数、有限样本、聚合摘要、截断状态和 `result_id`。大结果不直接完整回灌模型，后续 `data_analysis` 或 `render_ui` 通过引用读取。多段报告也可以把每一块的 `result_id` 传给对应分析子任务，主 Agent 只汇总结论和来源。

例如日报最终可以组织成：

```text
核心指标：今日销售额、支付订单量、退款金额
渠道表格：channel + 当前值 + 对比值 + 差值 + 变化率
图表：渠道销售额排名或当前/上周同日对比
摘要：基于结果集确定增长最高、下降最高和无历史数据的渠道
来源：query_id、result_id、数据源、统计周期、语义模型版本
```

“销售额增长 15%”这个数字应由查询结果和确定性计算得出；LLM 可以把它写成自然语言，但不应重新计算或凭空补充没有返回的数据。

## 8. 查询失败如何回到正确路径

Cognida 的自修复不是无限重试，而是“错误分类 → 回注必要线索 → 定向修改 → 重新过闸门”。典型过程如下：

| 错误 | 可执行的修复 | 是否可以自动进入正式报表 |
| --- | --- | --- |
| `unknown_column` | 重新读取 Schema，修正字段名 | 需要重新做结构和结果校验 |
| `unknown_table` | 依据候选表和语义重新选表 | 需要人工确认业务对象 |
| 类型或日期错误 | 修正参数格式或方言表达 | 测试通过后才可继续 |
| 结果为空 | 检查日期、值映射和数据新鲜度 | 不能直接把空结果当成 0 |
| 权限错误 | 停止自动重试，转人工申请权限 | 不自动绕过 |
| 查询超时 | 缩小周期、减少列或改用汇总表 | 不能无限扩大资源 |
| 连续同类错误 | 触发失败护栏，停止空转 | 必须人工排查 |

项目中的失败护栏会记录工具和错误类型的失败签名；相同错误达到阈值后注入再规划提示或提前结束，并把任务标记为部分完成，而不是耗尽迭代预算继续重复同一条 SQL。瞬时连接抖动只允许在只读查询内做有限退避重试，语义错误不会使用同样方式盲重试。

## 9. 从对话查询到正式日报周报

固定报告的发布链路建议分成两段：

```text
需求 → 自然语言生成 SQL 草稿 → 结构/口径/结果验证 → 技术与业务确认
    → 保存参数化 SQL + 语义模型版本 → 周期触发 → 只读执行
    → 结果质量检查 → 生成表格/图表/摘要 → 发布并留审计记录
```

生成阶段解决“这条 SQL 是否表达了需求”；运行阶段解决“这个周期的数据是否正常”。运行阶段不应该让模型重新选择表、重新发明指标公式，只传入已经校验过的日期参数。发生 Schema 漂移、指标版本变更、结果波动超阈值或权限失效时，应阻断发布并通知负责人。

当前 Cognida 已具备对话式 Data Agent、语义查询、只读 SQL、结果引用、分析和渲染能力；“每天定时生成并推送正式日报”需要由企业现有调度系统或新增报表任务模块承接。这个边界必须保留，才能准确区分项目已有能力和落地到公司流程时需要补齐的部分。

## 10. 这条流程的核心价值

我认为这个项目应用到数仓日报周报的价值，不是让业务人员完全不懂数据，而是把原来重复、分散、容易写错的 SQL 查询过程收敛为：

- 先用自然语言表达业务问题；
- 再用语义模型和 Schema 把业务词绑定到真实对象；
- 由确定性引擎或受限模型生成 SQL；
- 通过只读工具执行并保存可追溯结果；
- 用固定模板和质量门禁稳定生成日报周报。

这样既保留了 SQL 的可解释性，又利用 AI 降低了写查询和整理结果的成本。
