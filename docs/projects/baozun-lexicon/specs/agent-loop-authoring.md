# Data Agent 循环 · 文章编写规范

> 不进入读者导航。71 / 72 的写作合同。知识源是 `cognida/study/agent调度执行/` 与 Agent 工具源码；文风对齐 61 / 62；图只用 fireworks 静态 SVG。

---

## 目标

没写过 Agent 的人读完两篇，能拿着同一句「上周华东区 GMV 按天」，写出工具调用顺序、`semantic_query` 的返回、`sql_execute` 的信封，并解释未覆盖时为什么必须换工具。

---

## 对齐 61 / 62 的写法

1. 开篇「这篇要让你看懂什么」：4–7 条可复述能力，写明上一篇交到哪、本篇停在哪。
2. 每一步同一骨架：为什么需要 → 输入从哪来 → 工具读什么 / 返回什么 → 本例结果 → SVG → 常见误解。
3. 表格优先。一句合同用引用块。
4. 贯穿案例与引擎三篇共用：「上周华东区的 GMV 是多少？按天展示」。71 走治理命中；72 加「实时库存」回退和「出上周经营周报」。
5. 只许 `![说明](./assets/xxx.svg)`。禁止生活图、ASCII 流程主图、新的 InteractiveDiagram。
6. 不重复 61 的 SQL 装配、不重复 62 的 JOIN 规则。Go 源码最多当一句「实现里叫这个」，中间结果用脱敏快照。
7. 不把七个子代理、Skill 全文、wind-down 写成百科。只写本例执行链用到的调度。

## 知识源优先级

1. `tools/semantic_query.go`、`tools/sql_execute.go`、`tools/get_schema.go`、`presets/data_agent/routing.go` ——行为真源。
2. `study/agent调度执行/` ——讲解、误区。
3. 已发表的 51 目录卡、61 冻结 Query、62 两种出口。
4. study 与代码冲突时，以代码为准。

| study / 代码 | 落入 |
| --- | --- |
| 意图分类 6 类、playbook | 71 循环前 |
| ReAct 一轮 = 选工具 + 回灌 | 71 循环 |
| `semantic_models` / `semantic_query` / `sql_execute` | 71 命中链 |
| 结果信封、`result_id` | 71 交付、72 细则 |
| `covered=false` + `get_schema` | 72 回退 |
| 只读校验、LIMIT、超时 | 72 闸门 |
| 受信缓存 TTL / 禁止写未覆盖 | 72 缓存 |
| report playbook 拆主题 | 72 周报 |

## 两篇合同

- **71**：谁调用引擎、命中路径如何从人话走到只读结果。不许把回退 `get_schema` 写成主路。
- **72**：空 SQL 之后换工具、只读闸门、信封与缓存、周报如何拆章。

冻结 Query 与 61 同一份。冻结 `database_id` 脱敏为 `ecommerce_dw`。

## 配图

Style 1，JSON 在 `assets/fireworks/`，正文引用 `./assets/*.svg`。

| slug | 章 |
| --- | --- |
| `agent-intent-to-loop` | 71 |
| `agent-hit-tool-chain` | 71 |
| `agent-result-envelope` | 71 |
| `agent-fallback-chain` | 72 |
| `agent-report-split` | 72 |

复用：`governed-vs-lexical`、`duty-split`、`query-from-utterance`。

## 验收

读者只读过 61/62 应能回答：为什么先看目录卡再提交 Query；`database_id` 为什么必须原样回传；信封为什么不是全量行；实时库存为什么改 `get_schema`；周报为什么不能一次裸写整份 SQL。
