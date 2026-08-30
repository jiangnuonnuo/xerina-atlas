---
title: MCP 会话、Streamable HTTP 与 SSE：把连接当成有生命周期的资源
type: project-chapter
project: ai-mcp-gateway
group: MCP 运行时
order: 6
description: 结合真实 Controller、Case、SessionManagementService 和 replay port，说明 initialize、GET、POST、DELETE、SSE、心跳和断线恢复的边界。
sidebar: true
layout: project-doc
---

## 我为什么把连接单独建模

MCP 客户端看到的是一个服务地址，但协议上至少存在三种不同生命周期：一次 JSON-RPC 请求、一个 Streamable HTTP 会话、一个具体的 SSE 监听连接。它们不能混成“请求进来就执行、连接断开就删除”的简单逻辑。

Streamable HTTP 的 POST 可以创建会话，也可以在已有会话上处理 `tools/list` 或 `tools/call`；GET 只是建立事件监听，连接取消不代表会话应该被删除；DELETE 才是客户端主动释放会话。会话还要保存认证范围、网关归属、transport、最后访问时间和事件恢复所需的游标。

![Streamable HTTP 会话时序](./assets/session-sequence.gif)

图要回答的问题：客户端如何通过 initialize 获得会话标识，GET 如何监听，POST 如何处理 JSON-RPC，事件如何同时进入实时流和 replay buffer，断线后又如何恢复。

## 对外接口和返回形态

`McpGatewayController` 当前同时保留旧 SSE 和 Streamable HTTP：

| HTTP 接口 | 请求作用 | 返回形态 | 会话行为 |
| --- | --- | --- | --- |
| `GET /{gatewayId}/mcp/sse` | 建立旧 SSE 监听 | `text/event-stream` | 创建 SSE session，并发送 endpoint 事件 |
| `POST /{gatewayId}/mcp/sse` | 向旧 SSE 会话提交消息 | 空响应或错误状态 | 从 query sessionId 恢复会话 |
| `POST /{gatewayId}/mcp` | initialize 或普通 JSON-RPC | JSON、SSE 或 202 | initialize 创建 Streamable session |
| `GET /{gatewayId}/mcp` | 建立 Streamable HTTP 监听 | SSE 长连接 | 监听断开时保留 session |
| `DELETE /{gatewayId}/mcp` | 主动删除 Streamable session | 空响应 | 回收本地资源并删除共享元数据 |

Streamable HTTP POST 要求 Accept 同时兼容 `application/json` 与 `text/event-stream`；不满足时在进入用例前返回 400。包级 token 只允许放在 Authorization Bearer，旧 SSE 不接受 `mcp_` token 作为 query 参数，避免高价值凭证继续沿用旧路径传输。

## initialize：认证成功后才创建会话

客户端第一次 POST `initialize` 时通常没有 `Mcp-Session-Id`。Case 层的 `McpStreamableHttpService` 识别 JSON-RPC method 后，调用 `AuthLicenseService` 做网关和凭证认证：

- `mcp_` 开头的凭证进入包级 token 解析和校验。
- 旧 API Key 进入兼容认证分支。
- 认证失败返回 `403` 和 MCP insufficient permissions 错误，不创建 session。
- 认证成功后，先生成 initialize JSON-RPC 响应，再创建带授权上下文的 Streamable HTTP session。

SessionConfigVO 保存 gatewayId、transport、legacyAuth 或 packageId/tokenId、限流窗口、创建时间、最后访问时间和本地 Sink；包级 token 的明文不会作为新认证会话的长期 `apiKey` 保存。响应通过 `Mcp-Session-Id` 返回新会话标识，客户端随后必须带这个 header。

initialize 本身不需要工具 scope，因为它只返回协议能力和服务信息；但会话创建时必须把认证结果写入 scope，后续 `tools/list` 和 `tools/call` 会从服务端 session 恢复，而不是从客户端 body 读取。

## 后续 POST：先恢复服务端会话，再分派 JSON-RPC

已有会话的 POST 不能再次依赖 Authorization 来决定能力范围。Case 层通过 sessionId 查询本地会话，确认它存在、属于当前 path 的 gateway，并且 transport 是 Streamable HTTP。找不到会话或网关不匹配，返回 404；不允许把相同 sessionId 拿到另一个 gateway 下使用。

会话有效后，`SessionMessageService` 再从 session 推导 scope：

- legacy auth 会话保持旧的网关级工具范围。
- 新认证会话必须同时有正的 packageId 和 tokenId，否则返回权限不足。

JSON-RPC 请求通过 `SessionMessageHandlerMethodEnum` 映射到 `InitializeHandler`、`ToolsListHandler`、`ToolsCallHandler` 等处理器。未知 method 返回方法不存在，通知没有响应 body，JSON-RPC response 消息只记录而不重复生成业务响应。

## `tools/list` 和 `tools/call` 在会话中的不同门槛

`tools/list` 对包级会话读取当前已发布能力包投影，再按投影中的有序 toolId 加载完整工具定义，返回 JSON Schema。旧认证会话仍可读取网关级有效工具，这是兼容逻辑，不应被误解为新权限模型。

`tools/call` 不能只相信工具列表。`ToolsCallHandler` 从参数解析出 tool name 后，若 session 是包级 scope，先调用 `requirePublishedTool` 复核当前发布投影是否包含该名称，再进入共享 `IToolInvocationService`。客户端即使手动构造一个未出现在列表中的 tool name，也会在下游执行之前被拒绝。

对于包级 token，Streamable HTTP 只在 `tools/call` 上执行令牌配置的限流；`initialize` 和 `tools/list` 不消耗同一类工具调用额度。限流键使用旧认证的网关/API key，或新认证的 gateway/tokenId 与会话中的 rateLimit/window 配置，避免客户端自行提交额度。

## GET 监听流为什么单独使用 Case 规则树

GET 监听有自己的准入和恢复语义，项目把它放在 `McpStreamableHttpGetService` 和 GET 专用规则树中。规则节点的责任是：

| 节点 | 责任 | 失败/下一步 |
| --- | --- | --- |
| Root | 建立 GET 用例上下文 | 进入校验 |
| Validate | 调用 Domain Streamable Service 校验 session、Accept、协议版本等 | 拒绝或进入监听打开 |
| OpenStream | 根据监听模式选择默认、resume 或 replay | 分派到对应节点 |
| Replay | 命中 Last-Event-ID 且有积压时先补发事件 | 接续实时流 |
| Resume | 命中 Last-Event-ID 但无积压时直接接实时流 | 进入结束封装 |
| End | 把事件流和响应头封装为 GET 返回模型 | 返回 Controller |

规则树只编排节点，真正的 session 查询、协议版本解析、事件 priming、replay 和实时 Sink 由 Domain 会话服务完成。这样 GET 的返回包装变化不会修改事件顺序和会话租约规则。

## 首次 GET 和 Last-Event-ID 恢复

首次 GET 未带 `Last-Event-ID` 时，`StreamableSessionService` 会生成一个 priming event：它有 UUID eventId、空 data、`message` event name 和 reconnect retry，并先写入 replay buffer，再把事件放入实时 Flux。这个空事件不是业务消息，而是给客户端建立可持久化的重连游标。

带 `Last-Event-ID` 的 GET 不生成新的 priming event，而是查询 `IStreamableSessionReplayPort.replayAfter(sessionId, lastEventId)`：

- 命中且存在后续事件：监听模式为 REPLAY，先补发缺失事件，再衔接实时 Sink。
- 命中但没有后续事件：监听模式为 RESUME，直接接实时 Sink。
- 未命中：当前实现记录 warning，并回退默认监听语义；这意味着客户端无法证明中间事件仍在当前 buffer 中，生产实现需要根据可靠性要求决定是否改为明确的 gap 错误或重新初始化。

所有业务事件发布时，`SessionManagementService` 先生成单调的 session event id，写入 replay buffer，再尝试推送 Sink。Sink 推送失败时，事件仍然保留在 replay buffer，重连仍有机会拿到它；这也是先写 replay 再实时发布的原因。

## 事件、心跳和响应不能混用

实时 Sink 使用 `ServerSentEvent`，业务事件带 id、event 和 data；心跳使用 SSE comment `ping`，不带 JSON-RPC data，避免 MCP 客户端把心跳误认为业务消息。Streamable HTTP 和旧 SSE 都会合并心跳 Flux，但取消语义不同：

| 连接 | 心跳作用 | 监听取消后的行为 |
| --- | --- | --- |
| 旧 SSE | 刷新活跃时间并保持旧连接 | 立即回收旧 SSE session |
| Streamable HTTP GET | 刷新活跃时间并保持监听 | 只关闭本次 GET，不删除 session |
| Streamable HTTP POST | `getSession` 刷新最后访问时间 | 由显式 DELETE 或 idle cleanup 回收 |

这一区分解决了 Streamable HTTP 的短暂断网：GET 可以断开，客户端稍后带 sessionId 和 Last-Event-ID 重连；如果 GET 取消就直接删除 session，恢复机制就没有意义。

## 会话租约和清理

当前配置提供 idle timeout、heartbeat interval、cleanup interval 和 reconnect retry。`SessionManagementService` 在启动时校验这些 Duration 必须为正数，从 Redis 恢复仍在租约内的会话元数据，并为每个有效会话重建本地 Sink。

运行时每次读取 session 会更新本地最后访问时间，并通过 `ISessionDistributedService` 刷新 Redis 元数据。后台单线程调度器按 cleanup interval 扫描本地会话：不 active 或超过 idle timeout 的会话，先移除本地 Sink、事件序列和 replay，再删除 Redis 共享元数据。

应用关闭时只回收当前 JVM 的本地资源，不主动删除 Redis 会话元数据，因为其它实例或下一次重启仍可能需要恢复。这个选择同时意味着：Redis 中的元数据不能单独代表当前实例已经有可用 Sink，连接恢复仍要在本地重建资源。

## 错误边界

| 错误 | HTTP/MCP 结果 | 会话是否创建/保留 |
| --- | --- | --- |
| gatewayId 或 Accept 不合法 | 400 | 不创建新会话 |
| token/API Key 认证失败 | 403 | 不创建新会话 |
| session 不存在 | 404 或 MCP session not found | 不创建；已有元数据不被伪造恢复 |
| session 跨 gateway/transport | 404 | 不执行 JSON-RPC |
| 未知 JSON-RPC method | MCP method not found | 会话保留，当前消息结束 |
| tools/call 命中限流 | 内部错误映射为调用失败 | 会话保留，后续窗口可继续 |
| 下游工具执行失败 | JSON-RPC tool result 的 `isError=true` 或 error | 会话保留 |
| Streamable GET 断开 | 客户端连接关闭 | session 保留到租约或 DELETE |

错误不会把已存在的会话删除，也不会因为一次工具失败重新创建 session；会话生命周期和工具执行生命周期保持独立。

## 我用哪些测试确认协议语义

`StreamableSessionServiceTest` 验证首次 GET 的 priming event、Last-Event-ID 命中有积压时 replay、命中但无积压时 resume、未命中时默认监听以及 reconnect retry 配置。

`SessionManagementServiceTest` 验证 SSE/Streamable session 创建、Redis 恢复、过期清理、心跳和本地资源回收；`SessionDistributedServiceTest` 验证共享元数据和 Topic 同步；`SessionMessageServicePackageScopeTest`、`ToolsListHandlerPackageScopeTest` 和 `McpStreamableHttpAuthenticationTest` 验证 session scope 不被客户端伪造。

Controller 层的 `McpGatewayControllerBearerTest` 还验证 Bearer 解析和旧 SSE 对包级 token 的拒绝。真实验收资料则验证 initialize、tools/list、tools/call 能够在 Streamable HTTP 上闭环。

## 本篇结论

MCP 会话的核心不是保存一个 session id，而是同时管理授权上下文、网关归属、transport、实时 Sink、事件游标和租约。Streamable HTTP 的 GET、POST、DELETE 不能用同一种取消语义；replay 先写后发是为了让实时流和恢复流看到同一事件序列。下一篇把视线转到“哪些工具真的可以被这个会话看到”：能力包发布和运行时缓存如何把草稿隔离在管理面之外。

下一篇：[能力包发布与运行时缓存](./07-能力包发布与运行时缓存.md)
