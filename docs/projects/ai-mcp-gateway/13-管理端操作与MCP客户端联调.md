---
title: 管理端操作与 MCP 客户端联调：按真实接口跑通一条能力
type: project-chapter
project: ai-mcp-gateway
group: 落地实战
order: 13
description: 将管理端 API、能力包工作台、包级 Token 和 Streamable HTTP MCP 客户端组合成一份可以复用的本地联调手册，并明确每一步的输入、输出和失败判断。
sidebar: true
layout: project-doc
---

## 我先确定这份手册的联调对象

这份手册只针对当前工程已经实现的能力包主链路，不混用旧的网关级兼容接口。联调目标是创建一个只读能力包，包含 `get_company_profile` 和 `search_company_employees` 两个本地 HTTP 工具，再通过 Streamable HTTP 建立会话，完成发现、调用和 LLM 验收。

管理端基础地址是：

```text
http://127.0.0.1:8797/api-gateway/admin
```

MCP 地址是：

```text
http://127.0.0.1:8797/api-gateway/{gatewayId}/mcp
```

管理端响应统一使用 `code`、`info`、`data`。业务错误可能仍然返回 HTTP 200，所以每次请求都先判断 `code == "0000"`，不能只看 HTTP 状态码。

## 一、启动前检查

### 1. 确认本地依赖

```bash
java -version
./mvnw -q -pl ai-mcp-gateway-app -am package -DskipTests
```

应用默认使用 dev profile，MySQL 数据库名、Redis 地址和应用端口以 `ai-mcp-gateway-app/src/main/resources/application-dev.yml` 为准。数据源联调还必须有：

```bash
export MCP_DATASOURCE_AES_KEY="<base64-aes-key>"
export MCP_ACCESS_TOKEN_HMAC_SECRET="<hmac-secret>"
```

### 2. 启动真实数据源测试栈

需要 MySQL/Redis 时：

```bash
docker compose -p mcp-gateway-datasource-test \
  -f docs/dev-ops/docker-compose-datasource-test.yml up -d --wait
```

本地 HTTP 示例下游由应用内的联调 Controller 提供，不需要额外启动一个第三方服务。它的 `sessionId` 固定为联调样例值，目的是验证 HTTP mapping，不是模拟生产鉴权。

## 二、先检查网关和工具

### 1. 查询网关

```bash
curl -s \
  'http://127.0.0.1:8797/api-gateway/admin/query_gateway_config_list'
```

从响应中取出 `gatewayId`。后续所有协议、工具、能力包和 MCP 请求都要使用同一个 `gatewayId`，不要在前端把工具名当作全局唯一标识。

### 2. 查询当前网关的可编排工具

```bash
curl -s \
  'http://127.0.0.1:8797/api-gateway/admin/query_gateway_tool_list_by_gateway_id?gatewayId=gateway-demo'
```

如果这里没有工具，先完成协议导入或数据源工具导入，不要直接创建空能力包。工具列表返回的是管理侧可编排资产，不能当作 MCP 客户端的最终工具列表。

## 三、导入 HTTP/OpenAPI 工具

### 1. 查询 operation 候选

管理端提交 OpenAPI/Swagger 文档后调用 operation 候选接口。请求体要包含网关归属、文档格式和文档内容；文档内容可以是 JSON 或 YAML。

```text
POST /api-gateway/admin/query_protocol_operation_candidates
```

结果重点查看 `method`、`path`、`operationId`、`summary`、`tags` 和 warnings。对当前联调样例，应该选择企业详情 GET 与员工搜索 POST 两个 operation。

### 2. 预览映射

```text
POST /api-gateway/admin/preview_gateway_protocol
```

预览结果必须能看出：

- `companyId` 将要放到 path；
- `lang`、`pageNo`、`pageSize`、`status` 将要放到 query；
- `sessionId`、`X-Tenant-Id`、`X-Trace-Id` 将要进入 header；
- POST 的 `keyword`、`departmentIds`、`sortBy` 和 `includeInactive` 将要进入 body；
- response mapping 是从 body 取值，还是从 header 取值。

如果 operationId 缺失或响应结构是标量，预览应显示 warning。warning 不是可以忽略的日志，它决定管理员是否理解导入后模型将看到什么。

### 3. 保存协议和工具

```text
POST /api-gateway/admin/import_gateway_protocol
```

保存成功后重新查询网关工具列表，确认工具名称已经稳定且是小写 `snake_case`。当前 MVP 验收使用的工具名是：

```text
get_company_profile
search_company_employees
```

协议保存成功仍然只是草稿配置，不能直接跳到 MCP 客户端验证。下一步要建立能力包。

## 四、注册 MySQL/Redis 工具时如何操作

### 1. 注册并测试连接

```text
POST /api-gateway/admin/register_data_source
POST /api-gateway/admin/test_data_source_connection?dataSourceId={dataSourceId}
```

注册请求只保存数据源的类型、名称、连接属性、超时、最大返回量、写开关和加密凭证。MCP 客户端永远不会收到凭证原文。

连接测试成功后只说明数据源可连接。接下来要调用能力预览：

```text
GET /api-gateway/admin/preview_data_source_capabilities?dataSourceId={dataSourceId}
```

### 2. 选择允许的操作

MySQL 只选择 `list_tables`、`describe_table`、`select`；Redis 只选择结构化的 String、Hash、List、Set、ZSet 操作。即使底层客户端可以执行更多命令，预览结果也不应出现万能 `command`。

```text
POST /api-gateway/admin/import_data_source_tools
```

如果以后要增加写操作，先在数据源配置中开启 `writeEnabled=true`，再在工具级别通过调用参数要求 `confirmWrite=true`。两道条件缺一不可。

## 五、创建能力包并准备发布

### 1. 创建包

```bash
curl -s -X POST \
  'http://127.0.0.1:8797/api-gateway/admin/create_capability_package' \
  -H 'Content-Type: application/json' \
  -d '{
    "gatewayId":"gateway-demo",
    "packageCode":"fulfillment_ops",
    "packageName":"履约排障",
    "packageDescription":"面向履约异常的只读工具集合"
  }'
```

记录返回的 `packageId` 和顶层 `version`。新包状态是 `DRAFT`，前端不能自行生成 `packageId`。

### 2. 添加成员

对每个工具调用：

```text
POST /api-gateway/admin/save_capability_package_member
```

请求示例：

```json
{
  "gatewayId": "gateway-demo",
  "packageId": "10001",
  "toolId": "20001",
  "includeReason": "用于查询企业基本信息，是排障入口。",
  "memberStatus": "ENABLED",
  "sortOrder": 10
}
```

每次成员保存后重新读取能力包详情，因为服务端会更新顶层和成员版本。成员全部数量最多 20，`DISABLED` 成员也占用这个上限。

### 3. 生成并保存语义卡

没有语义卡时：

```text
POST /api-gateway/admin/generate_tool_semantic_card_draft
GET  /api-gateway/admin/query_tool_semantic_card?gatewayId={gatewayId}&toolId={toolId}
POST /api-gateway/admin/save_tool_semantic_card
```

置为 `READY` 时必须补齐数据源、业务域、资源对象、动作、至少三条意图、输入范围、输出口径、相邻工具边界、标签、风险等级、副作用标记、自然语言示例问题和 JSON 示例参数。

### 4. 按模板测试工具

先取动态模板：

```bash
curl -s \
  'http://127.0.0.1:8797/api-gateway/admin/query_gateway_tool_test_template?gatewayId=gateway-demo&toolId=20001'
```

再提交对象类型的 arguments：

```bash
curl -s -X POST \
  'http://127.0.0.1:8797/api-gateway/admin/test_gateway_tool' \
  -H 'Content-Type: application/json' \
  -d '{
    "gatewayId":"gateway-demo",
    "toolId":"20001",
    "arguments":{"companyId":"company-1001","lang":"zh-CN"},
    "confirmSideEffect":false
  }'
```

POST 员工搜索工具的 arguments 示例：

```json
{
  "companyId": "company-1001",
  "pageNo": 1,
  "pageSize": 10,
  "status": "ACTIVE",
  "keyword": "MCP",
  "departmentIds": ["RD", "QA"],
  "sortBy": "employeeName",
  "includeInactive": false
}
```

测试结果要检查 `testStatus`、`httpStatus`、`durationMs`、脱敏摘要、`traceId` 和 `fingerprint`。如果期间工具配置变化，即使本次调用曾经成功，能力包详情里的 `currentTestPassed` 也必须重新确认。

## 六、签发运行 Token 并发布

### 1. 签发 Token

```bash
curl -s -X POST \
  'http://127.0.0.1:8797/api-gateway/admin/issue_package_access_token' \
  -H 'Content-Type: application/json' \
  -d '{
    "gatewayId":"gateway-demo",
    "packageId":"10001",
    "tokenName":"履约排障联调",
    "expireMinutes":60,
    "rateLimit":10,
    "rateLimitWindowSeconds":60
  }'
```

立即复制响应中的 `token` 并放入当前终端环境变量：

```bash
export MCP_PACKAGE_TOKEN='<copy-once-token-plaintext>'
```

不要把它放入 URL、Git、shell 历史、前端 localStorage、日志或普通截图。查询 Token 列表只能看到 `tokenHint`，拿不到明文。

### 2. 发布能力包

重新查询能力包详情，使用最新顶层 `version`：

```bash
curl -s -X POST \
  'http://127.0.0.1:8797/api-gateway/admin/publish_capability_package' \
  -H 'Content-Type: application/json' \
  -d '{
    "gatewayId":"gateway-demo",
    "packageId":"10001",
    "version":"3"
  }'
```

发布失败时，根据 `code` 处理：`3001` 是生命周期不允许，`3002` 是没有启用成员，`3003` 是工具数量超限，`3004` 是语义卡未 READY，`3005` 是当前指纹测试未通过，`3006` 是没有有效 ACTIVE Token。不要根据中文 `info` 做程序分支。

### 3. 查询连接卡

```bash
curl -s \
  'http://127.0.0.1:8797/api-gateway/admin/query_capability_package_codex_connection?gatewayId=gateway-demo&packageId=10001'
```

只有 `available=true` 时才使用返回的 URL 和 TOML。连接卡中的环境变量名不是 Token 明文，只是客户端读取 Token 的安全引用。

## 七、使用 curl 完成 Streamable HTTP MCP 联调

### 1. initialize

```bash
curl -i -s -X POST \
  'http://127.0.0.1:8797/api-gateway/gateway-demo/mcp' \
  -H "Authorization: Bearer ${MCP_PACKAGE_TOKEN}" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"initialize",
    "params":{
      "protocolVersion":"2025-03-26",
      "capabilities":{},
      "clientInfo":{"name":"curl-mcp-client","version":"1.0.0"}
    }
  }'
```

从响应头记录 `Mcp-Session-Id`。如果没有 session id，不继续发送 `tools/list`；先查 Token、能力包发布状态、Accept 头和 gateway 路径。

### 2. tools/list

```bash
curl -s -X POST \
  'http://127.0.0.1:8797/api-gateway/gateway-demo/mcp' \
  -H "Authorization: Bearer ${MCP_PACKAGE_TOKEN}" \
  -H "Mcp-Session-Id: ${MCP_SESSION_ID}" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

检查返回的 `tools` 是否只包含当前能力包启用成员，并核对工具名、描述和 input schema。列表中出现未发布工具，说明 scope 或缓存投影存在严重问题，应停止联调。

### 3. tools/call

```bash
curl -s -X POST \
  'http://127.0.0.1:8797/api-gateway/gateway-demo/mcp' \
  -H "Authorization: Bearer ${MCP_PACKAGE_TOKEN}" \
  -H "Mcp-Session-Id: ${MCP_SESSION_ID}" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{
    "jsonrpc":"2.0",
    "id":3,
    "method":"tools/call",
    "params":{
      "name":"get_company_profile",
      "arguments":{"companyId":"company-1001","lang":"zh-CN"}
    }
  }'
```

成功响应要同时满足 JSON-RPC 响应存在、`isError=false`、MCP content 有结果文本，以及本地 HTTP 下游返回 200。只看到 HTTP 200 不能证明工具成功，因为业务错误可能被封装在 MCP 结果中。

## 八、断线、恢复和停用验证

### 1. GET 监听

Streamable HTTP GET 用来监听服务器事件，首次监听会发送 priming event；客户端应保存事件 ID。断线后带 `Last-Event-ID` 重新 GET，服务端在 replay buffer 有记录时先回放，再接入实时流。

当前实现的 replay buffer 每个 session 固定最多 200 个事件，且保存在当前 JVM。它适合单实例和短暂断线验证，不等于跨实例可靠事件日志。

### 2. Token 吊销和包停用

Token 吊销调用：

```text
POST /api-gateway/admin/revoke_package_access_token
```

包停用调用：

```text
POST /api-gateway/admin/disable_capability_package
```

验证重点是：新建 session 被拒绝、已存在 session 的后续调用不会借助旧投影继续扩大能力、工具列表不再显示停用包。重新启用只回到 `DRAFT`，需要重新测试和发布，不直接恢复历史发布快照。

## 九、一次联调失败怎样判断

| 现象 | 先检查 | 不要先做的事情 |
| --- | --- | --- |
| 创建包失败 | `gatewayId`、包编码格式和唯一性 | 不要重复点击创建 |
| 工具不在可选列表 | 协议导入/数据源导入是否完成 | 不要手动伪造 toolId |
| 发布返回 `3004` | 启用成员的语义卡状态 | 不要直接改成 READY |
| 发布返回 `3005` | 当前配置指纹和测试状态 | 不要沿用上一次成功记录 |
| initialize 失败 | Bearer Token、包状态、Accept 和 URL | 不要只删除 session header |
| tools/list 为空 | publishedVersion、Redis dirty、成员状态 | 不要把缓存 miss 当空能力 |
| tools/call 被拒绝 | 工具是否属于包 scope、参数是否为 object | 不要关闭调用前复核 |
| HTTP 下游 401 | 固定 sessionId/header mapping | 不要先重试几十次 |
| SQL/Redis 被拒绝 | operation、写开关、确认参数和安全规则 | 不要改成 command 透传 |

## 本篇结论

管理端联调的关键是每一步都保存“服务端返回的事实”：gatewayId、packageId、顶层 version、成员 version、测试 fingerprint、Token hint、publishedVersion 和 session id。使用这些事实继续下一步，才能让并发冲突、发布失效和断线恢复有迹可循；只在页面里保留一份本地状态，无法证明 AI 最终拿到的是哪一版能力。

上一篇：[从 0 到 1 开发与上线链路](./12-从0到1开发与上线链路.md) · 下一篇：[困难与技术取舍复盘](./14-困难与技术取舍复盘.md)
