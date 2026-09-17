# MetricSQL 执行引擎 · 文章编写规范

> 不进入读者导航。60 / 61 / 62 的写作合同。知识源是 `cognida/study/编译引擎/` 与 `metricsql` 源码；文风对齐 50 / 51；图只用 fireworks 静态 SVG。

---

## 目标

没写过编译器的人读完三篇，能拿着「电商销售」模型包和一份 Agent Query，逐步写出 SQL，并解释失败为什么必须是空字符串。

---

## 对齐 50 / 51 的写法

1. 开篇「这篇要让你看懂什么」：4–7 条可复述能力，写明上一篇交到哪、本篇停在哪。
2. 每一编译步骤按同一骨架：为什么需要 → 输入从哪来 → 读模型哪些字段 → 成功产出 → 失败算未覆盖 → 贯穿案例本步结果 → SVG → 常见误解。
3. 表格优先（字段 / 语义 / 缺了会怎样）。一句合同用引用块。
4. 贯穿案例三篇共用：「上周华东区的 GMV 是多少？按天展示」。61 走单表命中；62 加「城市」和「实时库存」。
5. 只许 `![说明](./assets/xxx.svg)`。禁止 `illustrations/` 生活图、ASCII 流程主图、新的 InteractiveDiagram。
6. 不写 Agent 如何选工具、不写只读执行、不写模型怎么录入。Go 源码最多当一句「实现里叫这个」，中间结果用脱敏快照。

## 知识源优先级

1. `services/cognida-go/internal/service/agent/metricsql/engine.go`（及索引、装配）——行为真源。
2. `study/编译引擎/step/*` ——讲解、误区、例子。
3. `cmd/seed/semantic/main.go` + 已发表的 51 快照 ——案例对象。
4. study 与代码冲突时，以代码为准。

| study | 落入 |
| --- | --- |
| `index.md` 五步与两种出口 | 60 总图、61 链路 |
| `01-索引构建` | 60 索引 |
| `02-维度解析` | 60 维度 |
| `02.5-时间智能` | 60 时间、61 分桶 |
| `03-指标解析` | 60 指标 |
| `03.5-过滤器` | 60 过滤、61 WHERE |
| `04-覆盖与JOIN` | 62 |
| `05-SQL装配` | 61 最终 SQL、62 装配 |

## 三篇合同

- **60**：对象如何被每一步读掉。不许出现完整最终 SQL。
- **61**：Agent Query 字段 + 同一案例从 Query 装配成 SQL。
- **62**：空 SQL、跨表 JOIN、子句装配、按版本复用。

冻结 Query：

```json
{
  "metrics": ["营收"],
  "dimensions": ["大区", "下单日期"],
  "filters": [
    { "field": "大区", "op": "=", "values": ["华东"] },
    { "field": "下单日期", "op": ">=", "values": ["2026-09-07"] },
    { "field": "下单日期", "op": "<", "values": ["2026-09-14"] }
  ],
  "time_grain": "day",
  "order_by": [{ "field": "下单日期", "desc": false }]
}
```

## 配图

Style 1，JSON 在 `assets/fireworks/`，正文引用 `./assets/*.svg`。图例不得压节点。新图 slug：

| slug | 章 |
| --- | --- |
| `engine-model-pipeline` | 60 |
| `engine-index-maps` | 60 |
| `query-from-utterance` | 61 |
| `grain-vs-range` | 61 |
| `query-to-sql-chain` | 61 |
| `query-parts-board` | 61 |
| `coverage-gate` | 62 |
| `join-choose-base` | 62 |
| `assemble-slots` | 62 |

复用：`semantic-object-tree`、`metric-expand`、`dimension-value-map`、`relation-lookup`、`semantic-sql-reuse`。

## 验收

读者只读过 50/51 应能回答：索引为什么不查库；GMV 为何等于营收；按天和上周为何进不同子句；已完成为何变成物理枚举；无边为何不能猜 ON；未覆盖为何不能先拼 SELECT。
