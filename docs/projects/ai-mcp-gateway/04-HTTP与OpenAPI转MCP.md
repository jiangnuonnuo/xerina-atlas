---
title: HTTP 与 OpenAPI 转 MCP：先生成契约，再允许执行
type: project-chapter
project: ai-mcp-gateway
group: 协议接入
order: 4
description: 复盘 OpenAPI/Swagger 文档解析、operation 选择、请求映射、响应解包和旧工具兼容的完整实现。
sidebar: true
layout: project-doc
---

## 我为什么把“导入接口”和“调用接口”分成两件事

OpenAPI 文档是一个能力目录，不是某个 AI 场景的最终工具清单。文档可能包含管理接口、删除接口、内部调试接口和多个不适合模型直接使用的 operation。导入时如果把所有 operation 直接保存并暴露，管理面无法做选择，发布面也无法做风险控制。

我的设计是先把文档解析为统一的领域模型，再产生候选 operation；管理员选择候选项后，系统才构建可以保存的 HTTP 协议草稿。真正运行时再根据 MCP arguments 组装 HTTP 请求，并按照 response mapping 生成 MCP 返回文本。候选、配置、执行和结果解包分别有自己的边界。

![HTTP/OpenAPI 转 MCP](./assets/http-to-mcp.gif)

图要回答的问题：OpenAPI 文档如何经过解析、归一化、候选选择和映射生成，最后进入 HTTP 执行和 MCP 响应；失败分支停留在对应阶段，不会把错误配置强行推入运行面。

## 输入模型：先屏蔽规范和格式差异

管理端可以提交 OpenAPI 3 或 Swagger 2 文档，格式可以是 JSON 或 YAML。Domain 通过 `IProtocolDocumentParserPort` 依赖统一的解析端口，Infrastructure 负责具体解析库和规范差异，返回 `ApiDocumentVO`。

统一文档模型至少包含：

| 模型 | 关键内容 | 后续用途 |
| --- | --- | --- |
| `ApiDocumentVO` | specType、baseUrl、operations、warnings | 管理预览和候选集合 |
| `ApiOperationVO` | method、path、operationId、summary、tags、deprecated | 形成 operation 候选 |
| `ApiParameterVO` | name、in、required、schema | query/path/header 参数映射 |
| `ApiSchemaVO` | type、properties、required、items、enum、default、example | MCP JSON Schema 和 HTTP Body |
| `ApiResponseVO` | statusCode、content type、schema | 响应映射和解包 |

解析端口返回的不是可直接执行的 HTTP 客户端对象，而是协议事实。这样协议解析库替换时，Domain 的候选和映射规则不需要变化。

## 文档归一化：让脏文档变成稳定候选

`ProtocolDocumentNormalizer` 在预览前做三件事：

1. 去掉 method、path 和文本字段的多余空格，并把 method 统一为小写。
2. 确保 path 以 `/` 开头，避免同一接口因为文档写法不同产生不同 URL 结果。
3. 如果 operation 缺少 operationId，按照 method 和 path 生成稳定的 synthetic id，并把这次修复写入 warnings。

归一化还会按 path、method 排序 operations，让候选列表在不同解析顺序下仍然稳定。它不会偷偷丢弃有问题的 operation，而是用 warning 将缺失 operationId、未命中 selector 或标量响应等信息带回管理预览。这样管理员能看到系统做了什么修正。

## 候选与选择：管理者决定哪些能力上线

`ProtocolAnalysis.queryOperationCandidates` 只从统一文档模型生成候选摘要，包含 method、path、operationId、summary、tags 和 deprecated 标志。这个接口不会写数据库，也不会默认选中所有 operation。

选择时，`OperationSelectorVO` 用 method、path 和 operationId 精确匹配归一化后的 operation。`ProtocolPreviewBuilder` 对每个 selector 独立构建 HTTP 协议预览：如果 selector 找不到，对应项进入 warnings，其它有效 selector 仍可以继续生成预览。这个处理适合文档升级后部分 operation 被删除的场景，管理侧可以根据 warning 修正选择，而不是得到一个没有上下文的空失败。

预览结果包含三块内容：候选列表、选中 operation 生成的 HTTP 协议草稿和 warnings。只有管理员确认并保存后，网关工具和协议仓储才拥有可执行事实。

## 请求映射如何形成 MCP 输入契约

协议预览阶段会递归展开请求 schema，生成 `request` 类型的映射节点。每个节点包含 MCP path、字段名、MCP 类型、描述、是否必填、HTTP path、HTTP location、默认值、示例值、枚举和排序。

### query、path、header 和 cookie 参数

OpenAPI parameter 的 `in` 值会保留为 HTTP location。参数名成为 MCP 根路径；如果参数 schema 是对象，系统继续递归展开子属性。path 参数的 HTTP path 用来匹配 URL 中的变量，query 参数在 GET 请求中通常映射到查询串，header 和 cookie 则分别进入请求头和 Cookie 集合。

### request body

requestBody 会被包装为一个 MCP 根对象：优先使用 `$ref` 或 schema title 转成 lower camel case，没有稳定名称时使用 `requestBody`。对象内部属性递归成为子映射，父节点只描述结构，叶子节点才承担真实 HTTP Body path。

### 为什么要保留父子路径

MCP 输入需要的是一个可以被模型理解的嵌套结构，HTTP 下游可能需要另一个字段路径。`parentPath`、`mcpPath` 和 `httpPath` 同时保留，才能表达类似“模型提交一个嵌套对象，但下游 JSON Body 使用不同字段名”的情况。映射排序决定 `tools/list` 中 schema 属性和请求组装的稳定顺序。

## `tools/list` 怎样把映射树重新变成 JSON Schema

运行时 `ToolsListHandler` 读取当前授权范围内的 `McpToolConfigVO`，对 HTTP 工具按 request mapping 重新建立根节点、子节点、required 列表和类型。如果只有一个根节点，处理器可以使用根节点类型；多个根节点则生成 object，并把各根节点放进 properties。

这个阶段的几个细节直接影响模型行为：

- 只把 request mapping 暴露给 input schema，不把 response mapping 当成输入参数。
- 按 sortOrder 组织父子节点，避免客户端每次看到的 schema 顺序变化。
- 把 description、enum、default、example 和输入范围元数据保留到字段定义。
- 协议配置缺少 request mapping 时，继续兼容旧工具的历史透传方式；这不是新配置的推荐形式。

`tools/list` 只是生成契约。即使客户端根据 schema 正确生成参数，`tools/call` 仍需在执行前检查工具 scope、参数类型和下游协议配置。

## `ProtocolExecuteService` 如何组装请求

运行时 `ProtocolExecuteService.assembleRequest` 先把 arguments 转成 Map，再解析协议中保存的 HTTP headers 和 method。存在 request mappings 时，它只提取叶子节点；结构节点不会重复生成请求字段。

每个叶子节点都先按 MCP path 从 arguments 取值，再根据 HTTP location 放入以下位置：

| HTTP 位置 | 组装动作 | 典型风险 |
| --- | --- | --- |
| path | 替换 URL 中的 `{variable}` | 必须确保变量确实存在，不能把未解析的占位符交给下游 |
| query | 写入 queryParams | 值类型和编码交给 HTTP 适配器处理 |
| header | 写入 requestHeaders | 配置中的固定头和映射头要分别可追踪 |
| cookie | 写入 cookies | 不应把客户端隐式凭证混入工具参数 |
| body | 按 httpPath 写入嵌套 bodyMap | 只允许配置映射字段参与请求 |

当 mapping 没有显式 HTTP location 时，系统会根据 URL 是否包含 path variable、HTTP method 和 path 推导位置；配置明确时优先使用显式值。单根 body 结构会去掉重复的根路径，使 MCP 中的 `requestBody.customer.name` 可以落到下游 Body 的 `customer.name`。

请求组装完成后形成 `HTTPExecuteRequestVO`，包含 method、url、headers、cookies、queryParams、body 和 timeout。Domain 不直接发网络请求，而是把它交给 `IHttpExecutionPort`。

## 响应解包：成功不是把任何 body 都当 JSON

HTTP 适配器返回 statusCode、headers、contentType 和 body，`ProtocolExecuteService.unpackResponse` 再按照 response mapping 做解包。

### 先判断是否真的需要解析 body

如果 response mapping 全部来自 header，服务不解析 body，直接从响应头取值并重建 MCP 结果。这样对文件名、版本号或请求追踪头这种场景更合理，也避免一个无关的非法 JSON body 破坏 Header-only 结果。

### 再判断 body 载荷类型

body 映射存在时，系统先把载荷分为：空 body、JSON object/array、JSON scalar、纯文本或其它格式。

- Object/Array 才进入按路径提取和结构重建。
- JSON scalar 直接返回标量文本；如果映射期望结构化 body，则记录 warning 并回退原文。
- 纯文本或无法解析的格式直接保留原始响应；如果映射没有提取到任何字段，也回退原文。

这里的回退很重要：解包失败和下游返回空 body 不能被伪装成一个空对象成功。MCP 客户端至少能看到真实响应文本，工作台也能通过 failureReason 和响应摘要定位是下游格式不符合预期。

### 成功状态和业务错误分别表达

HTTP 2xx 才会被统一策略视为网络调用成功；非 2xx 会保留响应和解包文本，同时设置失败原因。响应解包异常不会重新发起 HTTP 请求，因为网络调用已经产生；它只标记“响应解释失败”，避免重试造成重复副作用。

## 旧配置兼容：为什么保留透传兜底

项目在引入显式映射前已经存在一部分 HTTP 工具。如果所有旧工具都必须立刻补齐 request mapping，会造成配置迁移窗口和线上兼容风险。因此，当映射为空或没有可执行叶子节点时，`ProtocolExecuteService` 保留旧工具透传逻辑：GET/DELETE 尽量把 arguments 作为 query 并替换路径变量，POST/PUT 把 arguments 作为 body。

这个兜底只保证历史配置继续运行，不代表它具有与显式 mapping 相同的参数最小化能力。新工具应该使用显式映射、明确 schema、工作台测试和能力包发布；旧工具迁移时需要重新生成映射并通过当前指纹测试。

## 失败边界和处理方式

| 失败位置 | 典型原因 | 处理方式 |
| --- | --- | --- |
| 解析 | 文档格式错误、规范不支持 | 管理预览失败，不写可执行配置 |
| 归一化 | operationId 缺失、path 不规范 | 生成稳定修复并记录 warning |
| 选择 | selector 与文档不匹配 | 单项 warning，其它选择继续预览 |
| 映射 | schema 缺字段、位置不支持 | 保存前暴露配置问题 |
| 组装 | arguments 不是对象、路径值缺失、HTTP location 不支持 | 执行前返回参数异常 |
| 网络 | 连接失败、超时 | 统一工具结果记录失败，不伪造响应 |
| 状态 | HTTP 非 2xx | 返回下游响应并标记工具错误 |
| 解包 | body 类型和映射不匹配、没有提取到字段 | 保留原始文本并记录解包失败语义 |

## 我用哪些测试确认这条链路

当前测试覆盖了协议执行和适配边界：

- `SessionPortHttpExecutionTest` 验证 GET query/path/header、POST JSON body、Content-Type 和网络异常。
- `ToolInvocationServiceTest` 验证工具配置读取、HTTP 策略选择和缺失配置异常。
- `AdminWorkbenchServiceTest` 验证工作台测试调用与发布状态之间的关系。
- `UpstreamMcpImportServiceTest` 验证上游 `tools/list` 预览只导入管理员选择的工具。
- `McpUpstreamPortIntegrationTest` 验证上游 initialize、tools/list、tools/call 和断链重连。
- MVP 端到端验收记录了两个真实 OpenAPI operation 被导入、调用均返回 HTTP 200，并通过 MCP `tools/list` 和 `tools/call`。

## 本篇结论

HTTP 转 MCP 的关键不是把 HTTP method 改名成 `tools/call`，而是把原始文档变成可审阅的候选，把 schema 变成明确的 request mapping，再在执行时只使用映射叶子节点组装请求，最后按载荷类型安全地解包响应。下一篇进入风险更高的数据源能力：为什么 MySQL 和 Redis 必须使用操作白名单与调用前责任链。

下一篇：[MySQL、SQL 与 Redis 转 MCP](./05-MySQL-SQL与Redis转MCP.md)
