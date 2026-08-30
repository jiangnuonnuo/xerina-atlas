---
title: 40 核心实现：用契约传递事实，用状态保存接续点
type: project-chapter
project: V-Team-Skills
group: 核心实现
order: 40
description: 通过契约生命周期、恢复状态、模块完成和里程碑把事实落到 CLI。
sidebar: true
layout: project-doc
---

[返回总览](./) · [系统设计](./30-system-design) · [验证与接入](./50-testing-and-deployment)

V-Team 的核心实现由一套 Python 标准库 CLI 提供。它不负责“自动思考”，而是把跨角色协作中容易说不清、记不准、接不上三类问题变成稳定结构：契约索引、恢复状态和完成事实。

<InteractiveDiagram
  title="跨角色契约协作链路"
  src="../../media/projects/v-team-skills/diagrams/contract-collaboration/index.html?embed=1"
  poster="../../media/projects/v-team-skills/diagrams/contract-collaboration/preview.png"
  description="提供者发布并验证，消费者按唯一契约发现、联调和记录证据。"
/>

## 为什么需要 CLI

一次会话内，后端说“接口好了”，前端通常知道它指什么。换一个会话后，“好了”可能表示代码写完、单测通过、服务可启动，或者只是开发者今天心态不错。

CLI 为关键事实增加可验证语义：

- `draft` 只能用于 mock，不能真实联调；
- `ready` 必须有提供者的直接验证证据；
- `verified` 表示登记的消费者已经验证；
- 多个候选契约必须明确选择；
- 完成模块时必须提供验证证据；
- 恢复记录按 capability 覆盖，不无限追加。

它所做的不多，但每一项都对应跨会话和跨角色最常见的误解。

## 命令总览

脚本入口是 `scripts/vteam.py`：

```text
python3 scripts/vteam.py <command> [options]
```

| 命令 | 用途 | 是否写状态 |
| --- | --- | --- |
| `context` | 读取角色的最小上下文 | 否 |
| `contract publish` | 创建或更新契约索引 | 是 |
| `contract discover` | 按 capability 和消费者发现契约 | 否 |
| `contract verify` | 记录消费者验证证据 | 是 |
| `contract deprecate` | 停用契约并指向替代项 | 是 |
| `resume set` | 覆盖 capability 的恢复记录 | 是 |
| `resume clear` | 清除恢复记录 | 按需 |
| `module complete` | 记录完成事实并清除 active | 是 |
| `milestone record` | 记录重大里程碑引用 | 是 |
| `milestone list/show` | 读取紧凑索引或单项详情 | 否 |

普通任务不需要运行这些命令。只有出现跨角色契约、明确跨会话恢复或重大里程碑时，结构化状态才比对话上下文更有价值。

## `context`：只拿当前角色需要的内容

```text
python3 scripts/vteam.py context \
  --project-root /path/to/project \
  --role-id frontend-order-export \
  --capability order-export
```

输出包括：

- 角色职能与对应参考文件；
- capability 的完成事实；
- 与该角色有关的可发现契约；
- 当前 active 恢复记录；
- 里程碑数量；
- 状态文件是否存在。

如果前端冷启动时还不知道 capability，可以先省略 `--capability` 读取角色收件箱。上下文不会加载里程碑正文，也不会把无关 capability 全部倒进会话。

## 契约生命周期

### 1. 提供者发布索引

契约正文应先写入项目的 OpenAPI、Schema、protobuf、共享类型或契约测试。然后将位置登记到 V-Team：

```text
python3 scripts/vteam.py contract publish \
  --project-root /path/to/project \
  --id order-export-api \
  --capability order-export \
  --provider backend-order-export \
  --consumer frontend-order-export \
  --source openapi \
  --source-ref api/openapi.yaml#/paths/~1orders~1export \
  --status draft
```

`source` 支持：

- `openapi`
- `graphql`
- `protobuf`
- `json-schema`
- `shared-types`
- `contract-test`

本地 `source_ref` 必须指向项目内真实文件，可以附带 fragment；也可以使用外部 URI 指向项目已有 Catalog 或 Registry。

### 2. 从 draft 升级到 ready

实现完成并取得直接证据后，提供者再次发布同一契约：

```text
python3 scripts/vteam.py contract publish \
  --project-root /path/to/project \
  --id order-export-api \
  --capability order-export \
  --provider backend-order-export \
  --consumer frontend-order-export \
  --source openapi \
  --source-ref api/openapi.yaml#/paths/~1orders~1export \
  --status ready \
  --verification "导出接口集成测试通过"
```

`ready` 没有 `--verification` 会被拒绝。输出中的 `integration_allowed` 只有在状态为 `ready` 或 `verified` 时才为 `true`。

### 3. 消费者发现契约

```text
python3 scripts/vteam.py contract discover \
  --project-root /path/to/project \
  --capability order-export \
  --consumer frontend-order-export
```

发现规则很明确：

- 没有匹配：报错并禁止猜接口；
- 一个匹配：直接返回；
- 多个匹配：要求使用 `--contract-id` 明确选择；
- 已停用契约：不进入可发现结果。

“我猜后端大概返回这个字段”在短期内很快，在联调时通常会变成一项团队考古活动。

### 4. 消费者记录验证

```text
python3 scripts/vteam.py contract verify \
  --project-root /path/to/project \
  --id order-export-api \
  --verifier frontend-order-export \
  --evidence "页面按当前筛选成功下载 CSV"
```

只有登记在 `consumers` 中的角色可以验证，且契约必须已经是 `ready` 或 `verified`。验证成功后状态成为 `verified`，证据和时间被追加保存。

### 5. 停用契约

```text
python3 scripts/vteam.py contract deprecate \
  --project-root /path/to/project \
  --id order-export-api \
  --reason "已迁移到异步导出协议" \
  --replacement order-export-job-api
```

替代契约不能是自身。停用记录保留原因、替代 ID 和时间，旧契约不再被新消费者发现。

## 契约状态语义

| 状态 | 含义 | 可以真实联调 |
| --- | --- | --- |
| `draft` | 结构可讨论，可用于 mock | 否 |
| `ready` | 提供者已实现并有直接证据 | 是 |
| `verified` | 消费者已完成验证 | 是 |
| `blocked` | 存在明确阻塞，必须附原因 | 否 |
| `deprecated` | 已停用，可记录替代契约 | 否 |

同一 contract ID 更新时不能改变 capability 或 provider，避免一个稳定名称悄悄变成另一份协议。

## 恢复状态：每个 capability 只保留一条当前记录

跨会话暂停时，可以保存接续点：

```text
python3 scripts/vteam.py resume set \
  --project-root /path/to/project \
  --capability order-export \
  --role frontend-order-export \
  --summary "后端契约 ready，页面尚未联调" \
  --next-step "发现 order-export-api 并完成下载流程" \
  --reference api/openapi.yaml
```

如果再次执行 `resume set`，同一 capability 的旧记录会被覆盖。可选字段 `--blocker` 用于说明当前阻塞，`--reference` 可以重复提供必要引用。

清除恢复点：

```text
python3 scripts/vteam.py resume clear \
  --project-root /path/to/project \
  --capability order-export
```

如果状态或记录不存在，清除操作直接返回 `cleared: false`，不会为了“清理不存在的东西”先创建一个新文件。这是一种小但令人安心的克制。

## 模块完成：以证据覆盖当前事实

```text
python3 scripts/vteam.py module complete \
  --project-root /path/to/project \
  --capability order-export \
  --summary "订单按筛选条件导出 CSV 已闭环" \
  --verification "后端导出集成测试通过" \
  --verification "页面主流程手动验收通过" \
  --contract order-export-api
```

完成命令会：

1. 要求至少一条非空验证证据；
2. 检查显式引用的契约属于同一 capability；
3. 检查这些契约处于 `ready` 或 `verified`；
4. 覆盖 capability 的当前完成事实；
5. 清除同一 capability 的 active 记录。

它只验证命令中显式传入的契约，不会猜测还应该关联哪些索引。因此完成前必须由执行者准确提供当前模块使用的契约列表。

## 重大里程碑：保存引用，不复制正文

只有确实需要长期定位的重要事实才记录里程碑：

```text
python3 scripts/vteam.py milestone record \
  --project-root /path/to/project \
  --id order-export-v1 \
  --capability order-export \
  --summary "同步导出 V1 已交付" \
  --reference docs/order-export.md \
  --reference api/openapi.yaml
```

`milestone list` 只返回 ID、capability 和摘要；`milestone show --id ...` 才读取单项引用。正文继续留在项目文档和契约中。

## 状态文件结构

V-Team 使用 schema version 2：

```json
{
  "schema_version": 2,
  "project": "shop-console",
  "capabilities": {
    "order-export": {
      "status": "completed",
      "summary": "订单导出已闭环",
      "contracts": ["order-export-api"],
      "verification": ["主流程验收通过"],
      "completed_at": "2026-08-17T08:00:00Z"
    }
  },
  "contracts": {},
  "active": {},
  "milestones": []
}
```

写入时使用 UTF-8、排序字段和缩进 JSON，并通过同目录临时文件原子替换。状态文件适合人和工具共同读取，也便于代码评审。

## 输入校验与错误语义

- ID 最长 128 个字符，只允许小写字母、数字、点、下划线和短横线；
- 角色职能限定为 requirement、product、architect、backend、frontend、qa，可附功能范围；
- 本地引用不能是绝对路径，不能通过 `..` 逃逸项目；
- 状态版本不兼容或字段类型错误时明确拒绝读取；
- 一般输入和状态错误退出码为 `2`；
- 多契约需要选择时退出码为 `3`；
- 文件系统错误退出码为 `1`；
- 所有命令可使用 `--json` 输出单行 JSON，方便自动化消费。

这些机制让 V-Team 的协作信息可以被程序验证，又保持足够小。真正的业务复杂度留在项目里，CLI 只确保交接时大家谈的是同一件事。
