---
title: 70 · SQL 安全边界、正确性验证与面试追问
type: project-chapter
project: baozun-lexicon
order: 70
group: 数仓与智能报表
description: 说明只读闸门、结果信封、Golden Query 和正式报表生命周期，并整理面试官最可能追问的问题。
layout: project-doc
---

## 70 · SQL 安全边界、正确性验证与面试追问

> 示例只用于说明方法。这一章回答面试官的第二层问题：SQL 能跑，为什么还不能当周报？自动修复边界在哪？你怎么证明生成是对的？

## 1. 「能执行」不等于「结果正确」

风险分两类：

- **安全风险**：写入、删除、DDL、越权或高成本扫描；
- **语义风险**：SQL 能跑，但选错表、时间、粒度、JOIN 或指标公式，周报数字是错的。

下面三条都可能执行成功，却不一定回答同一个问题：

```sql
SELECT SUM(order_amount) FROM order_detail;
SELECT SUM(paid_amount) FROM order_detail WHERE status = 'PAID';
SELECT SUM(paid_amount) FROM daily_sales_summary;
```

它们可能分别是下单金额、支付明细和已汇总支付金额。数据库只负责执行。所以校验分三道门：

1. 是不是安全、可控的只读查询；
2. 是不是引用了真实 Schema 和已确认语义；
3. 结果是否满足日报周报的结构、范围和质量。

![SQL 正确性与数仓安全双重闸门](./assets/sql-correctness-guardrails.svg)

<InteractiveDiagram
  title="SQL 正确性与数仓安全双重闸门"
  src="../../media/projects/baozun-lexicon/diagrams/sql-correctness-guardrails/index.html?embed=1"
  poster="../../media/projects/baozun-lexicon/diagrams/sql-correctness-guardrails/preview.png"
  description="SQL 候选经过语法、安全策略、Schema、只读执行和结果校验，固定报表再与审核基准对照。"
/>

## 2. 第一层：应用级只读校验

`sql_execute` 把行为收敛到 `SELECT` / `WITH`：

- 拒绝 `INSERT`、`UPDATE`、`DELETE`、`DROP`、`ALTER`、`CREATE`、`TRUNCATE`；
- 拒绝 `GRANT`、`REVOKE`、`EXECUTE`；
- 拒绝注释和多语句；
- 外层强制 `LIMIT`，默认 100、上限 1000；
- 30 秒超时；瞬时故障只做有限退避重试。

例如必须拒绝：

```sql
UPDATE daily_sales_summary
SET paid_amount = paid_amount * 0.9
WHERE stat_date = '2026-08-30';
```

以及以 `SELECT` 开头但后面还跟着写操作的语句。

字符串黑名单不是唯一保护。数据库侧还要用只读账号、最小权限和目标 Schema 白名单。即使应用校验回归，账号也不该拥有改数仓的权限。

## 3. 第二层：数据源路由和资源边界

```text
显式 database_id     → 已注册外部数据源
空                   → 会话选定数据源
仍为空               → 应用业务库（兼容）
非法 id / 无 provider → 明确报错，绝不静默换库
```

语义模型绑定了数据源时，必须把 `database_id` 原样传给执行工具。逻辑表绑了多个不同库，属于建模错误，不能随便挑一个。

| 边界 | 控制方式 | 目的 |
| --- | --- | --- |
| 返回量 | 默认 100、最大 1000 | 防止无界结果灌进 Agent |
| 时长 | 30 秒超时 | 防止占死连接 |
| 列范围 | 避免 `SELECT *` | 降低网络和内存 |
| 时间范围 | 报表必须有周期 | 防止全表扫描 |
| 权限 | 外部源只读、租户隔离 | 防止跨租户和写入 |
| 重试 | 只对瞬时错误有限重试 | 防止错误 SQL 空转 |

`SELECT * FROM order_detail` 语法合法，也不适合当日报查询。

## 4. 第三层：Schema 和语义正确性

Schema 校验：表和列是否存在、类型是否适合过滤和聚合、JOIN 键是否存在、时间字段是否符合报告口径、`database_id` 是否和表所属源一致。

语义校验：

| 对象 | 要验证什么 |
| --- | --- |
| Dimension | 能否筛选、分组；业务标签如何映射到物理枚举 |
| Measure | 默认聚合是 `SUM`、`COUNT` 还是去重 |
| Metric | 公式、过滤、时间字段、口径描述 |
| Relation | 连接键、连接后会不会把事实行打爆 |
| Model | 版本、状态、数据源绑定、覆盖范围 |

Agent 可以提交指标选择和过滤值，不能未经审核把自然语言写进指标公式或 JOIN 条件。

覆盖失败时回退 `get_schema + sql_execute`。回退不能被隐藏成治理成功：报告必须标明「未命中治理口径，按物理 Schema 推断」；核心周报不能拿这种结果自动发布。

## 5. 结果信封：成功、可信、可发布是三件事

![查询结果信封与失败边界](./assets/text2sql-result-envelope.svg)

<InteractiveDiagram
  title="查询结果信封与失败边界"
  src="../../media/projects/baozun-lexicon/diagrams/text2sql-result-envelope/index.html?embed=1"
  poster="../../media/projects/baozun-lexicon/diagrams/text2sql-result-envelope/preview.png"
  description="查询成功、结果可信和报告发布分开判断，错误通过有限修复或停止升级处理。"
/>

回灌 Agent 的只是有界信封：`result_id`、列名、类型、行数、样本、聚合摘要、截断标记、耗时、实际执行 SQL。完整行集按租户和会话隔离。后续分析、出图都通过 `result_id` 回源。

```text
EXECUTED   = 数据库接受并完成了 SQL
TRUSTED    = 结构、口径、结果和来源通过检查
PUBLISHED  = 经过正式报表审核并允许交付
```

空结果可能是真没数据，也可能是日期或值映射错了，不能直接当成 0。

日报结果还要检查：当前和对比周期是否同一口径、`GROUP BY` 是否覆盖非聚合维度、变化率是否处理零分母、分渠道汇总是否对得上总计、报告里的每个数字能否追溯到结果集。

## 6. Golden Query：怎么证明生成是对的

固定日报周报可以为每个问题保存人工审核的金标准：问题、参数、SQL、预期结果集、允许差异、口径和版本。评测看三个维度：

| 指标 | 判断方式 | 解决什么 |
| --- | --- | --- |
| 精确匹配 | SQL 归一化后是否一致 | 固定模板是否被意外改写 |
| 结构组件匹配 | SELECT / FROM / WHERE / JOIN / GROUP BY 等 F1 | 容忍空白和等价写法，发现结构偏差 |
| 执行准确率 | 两边结果集按无序多重集合比较 | 最终数据是否一致 |

业务验收更看执行准确率，因为等价 SQL 文本可能不同。金标准自己没跑成功，不能伪装成生成对或错；金标准成功而生成缺失，应记失败，不能靠剔除样本虚高准确率。

测试集至少覆盖：单日汇总、周期对比、跨周跨月和时区、对比期无数据、去重计数、退款和负数、渠道别名、字段改名。

## 7. 什么可以自动修，什么必须停

```text
SQL 失败 → 分类错误 → 回注最小 Schema 线索
        → 改候选 SQL → 重新过全部闸门 → 成功后仍要结果校验
```

| 问题 | 可以做 | 必须停止 |
| --- | --- | --- |
| 字段拼写错误 | 从真实 Schema 重匹配 | 没有唯一候选 |
| 表名错误 | 结合注释和业务路径召回 | 多张表都可能对 |
| 枚举不匹配 | 读 ValueMap 或列画像 | 值含义无法确认 |
| 权限错误 | 返回权限问题 | 禁止绕过重试 |
| 结果为空 | 查日期、映射、数据新鲜度 | 原因解释不了 |
| 口径歧义 | 反问澄清 | 不能让模型猜公式 |

相同工具和错误类型持续失败时，失败护栏会阻止空转。自修复次数有限，每次候选 SQL 和错误类型都要留存，方便补进评测集。

## 8. 正式日报周报的生命周期

固定报告不应该每天让模型重写 SQL。

![固定日报 / 周报的发布生命周期](./assets/text2sql-report-lifecycle.svg)

<InteractiveDiagram
  title="固定日报 / 周报的发布生命周期"
  src="../../media/projects/baozun-lexicon/diagrams/text2sql-report-lifecycle/index.html?embed=1"
  poster="../../media/projects/baozun-lexicon/diagrams/text2sql-report-lifecycle/preview.png"
  description="自然语言负责生成查询草稿，审核后的参数化 SQL 模板负责稳定运行；定时推送仍需企业调度承接。"
/>

生成阶段：自然语言 → 治理查询或 Text2SQL 候选 → Schema / 语义 / 安全 / 结果校验 → Golden Query → 技术和业务确认 → 保存模板、参数、模型版本。

运行阶段：调度器只替换日期参数 → 只读执行已审核 SQL → 检查行数、空值、总计、波动 → 代码生成表格和派生数字 → 过门禁后发布。任一关键检查失败就阻断，不发一份看起来完整但未验证的报告。

**当前 Cognida 已具备对话按需出数；定时调度、消息推送、审批流仍需企业现有调度或新增任务模块。面试时主动把这句说出来，比把规划说成上线更加分。**

## 9. 面试官最可能追问

**为什么不让模型直接写周报 SQL？**  
周报要可重复口径。模型每次 JOIN 和过滤都可能变。语义层把公式钉在建模侧，用户输入只进名称解析和过滤值转义。覆盖失败就回退、不猜测。

**和普通 ChatBI 差在哪？**  
ChatBI 停在「能不能查出数」。这里停在「同样的指标，这周和上周是否同一口径，查错了能否回退、数字能否复算」。

**为什么还保留 Text2SQL？**  
语义层覆盖不到 100%。没有退路，Agent 会在未建模指标上装懂。退路必须可见：`covered=false` + fallback 提示。

**如何证明 SQL 对？**  
抓最后一次执行的 SQL，和金标准比结构，再比执行结果集。口径变更跟着模型版本失效缓存。

**你个人贡献怎么说才不虚？**  
可以说清：需求是降低重复周报 SQL、主路径是治理型语义层、回退路径如何诚实降级、只读和结果引用如何保证安全。不要把平台全部能力说成一个人从零实现，也不要编上线用户量和准确率。

## 10. 最终边界

这项能力可以用于：业务用自然语言提出日报周报需求；高频指标走统一口径；未覆盖问题在只读边界内回退；结果通过 `result_id` 进入分析和图表；Golden Query 和人工审核保障正式报表。

它不能被描述成：模型可以直接改生产数仓；SQL 能执行就代表业务正确；自然语言已经替代指标治理；当前对话能力已经自动完成每天的正式日报推送。

工程原则收束成一句：

> **AI 负责理解问题和提出查询，语义层负责统一口径，后端负责安全执行，代码负责计算和校验，人工负责正式发布。**
