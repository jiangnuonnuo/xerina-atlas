---
title: DDD 分层与系统架构：把协议变化挡在领域边界之外
type: project-chapter
project: ai-mcp-gateway
group: 架构设计
order: 2
description: 按真实 Maven 模块说明 Trigger、Case、Domain、Infrastructure、App、API 和 Types 的职责、依赖方向、端口设计与事务边界。
sidebar: true
layout: project-doc
---

## 我为什么采用分层单体

这个项目同时面对两类变化：一类来自 MCP、SSE、JSON-RPC、OpenAPI 等协议；另一类来自 HTTP、MySQL、Redis、上游 MCP 和 LLM 等外部资源。它们变化频率不同，故障模式也不同。如果把所有代码放在 Controller 或一个大 Service 中，协议字段、业务规则、连接实现和存储细节会很快耦合在一起。

我选择 DDD 分层架构，不是为了把类拆得更多，而是为了让变化沿着边界停留：入口适配请求，Case 组织用例，Domain 判断业务，Infrastructure 实现端口。当前部署仍是一个 Spring Boot 单体，分层解决的是依赖和责任问题，暂时不承担微服务拆分、跨服务事务或服务网格治理。

![DDD 分层架构](./assets/ddd-layers.gif)

图要回答的问题：协议入口、场景编排、业务规则和外部适配如何分开，以及同一套 Domain 规则如何被管理测试和 MCP 正式调用共同复用。

## 模块与架构层的对应关系

| 层 | 模块 | 真实职责 | 允许依赖 |
| --- | --- | --- | --- |
| API | `ai-mcp-gateway-api` | 对外服务接口、请求/响应协议和分页等公共模型 | Types、Domain 可复用契约 |
| Trigger | `ai-mcp-gateway-trigger` | `AdminController`、`McpGatewayController`、Redis Listener 等入口适配 | API、Case、Domain 命令 |
| Case | `ai-mcp-gateway-case` | 管理用例、MCP 消息用例、Streamable HTTP 结果编排 | Domain、API、Types |
| Domain | `ai-mcp-gateway-domain` | 聚合、值对象、领域服务、规则、Port 和 Repository 接口 | Types、稳定第三方抽象 |
| Infrastructure | `ai-mcp-gateway-infrastructure` | MyBatis DAO、Repository、Redis、HTTP、上游 MCP、LLM 实现 | Domain Port、外部 SDK |
| App | `ai-mcp-gateway-app` | Spring Boot 启动、Bean 组装、配置、线程和运行环境 | 所有模块 |
| Types | `ai-mcp-gateway-types` | `AppException`、响应码、MCP 错误码和公共常量 | 基础依赖 |

依赖方向最终应该指向 Domain 的业务抽象，而不是从 Domain 直接指向 MyBatis、Redisson 或某个 HTTP SDK。Infrastructure 可以依赖 Domain 接口来实现 Repository 和 Port；Trigger 不应该越过 Case 直接操作 DAO。

## Trigger 层：把外部请求翻译成命令

### MCP Controller 的职责

`McpGatewayController` 暴露两类协议：旧 SSE 路径和 Streamable HTTP 路径。它读取 `gatewayId`、`Mcp-Session-Id`、`Authorization`、`Accept`、`Last-Event-ID`、`MCP-Protocol-Version` 和 JSON-RPC body，组装成 Domain 命令，再把结果写成 JSON、SSE 或 HTTP 状态。

它做的是协议级校验，例如 Streamable HTTP 必须同时声明 JSON 和事件流，包级 token 不能通过旧 SSE query 参数传递；它不做工具范围判断，也不做 SQL 关键字判断。这样控制器的测试可以专注于请求头、状态码和返回形态，安全规则由 Domain 测试单独验证。

### Admin Controller 的职责

`AdminController` 面向管理端，提供网关、协议导入、数据源、工具配置、工作台、语义卡片、能力包、访问令牌和 LLM 测试等入口。它把 JSON DTO 变成 Case/Domain 命令，校验基本格式并透传上下文；不会因为是“管理接口”就绕过 Domain 的发布和数据源规则。

### Listener 的职责

Redis 会话同步监听器只接收跨实例会话事件，再交给会话管理服务重建或移除本地资源。它不直接修改会话 map，也不把 Redis 消息当作永久业务事件。这个设计把消息适配和会话生命周期判断分开。

## Case 层：按场景编排，而不是重复领域规则

Case 层在当前工程中有两条重要场景：

| 用例 | 入口 | 主要编排 | 复用的 Domain 能力 |
| --- | --- | --- | --- |
| MCP Streamable HTTP | `McpStreamableHttpService` | 区分 initialize、普通消息、通知、GET 监听、DELETE，并决定 JSON/SSE 返回 | Session、Auth、Message、Streamable Service |
| 管理工作台 | `AdminWorkbenchService` | 生成测试模板、执行工具测试、记录结果、发布服务、生成连接卡 | Tool Invocation、Workbench、Semantic Card、Package |

Case 层可以决定一次请求先调用哪个用例、哪个结果对象要转换成 HTTP 响应，但不能在这里复制“工具必须属于已发布能力包”或“写操作必须 confirmWrite=true”的规则。规则如果被写在 Case 中，管理测试入口和 MCP 正式入口很容易产生差异。

## Domain 层：把业务判断集中到可替换的核心

### 领域模型

Domain 按业务方向组织包，而不是按 Controller 组织：

- `gateway`：工具调用命令、统一结果和策略选择。
- `protocol`：OpenAPI/Swagger 分析、映射归一化、响应解包和上游 MCP。
- `datasource`：数据源类型、操作模型、凭证抽象和安全责任链。
- `session`：会话配置、JSON-RPC 消息、Streamable HTTP 事件和租约语义。
- `workbench`：工具测试、语义卡片、能力包、发布规则和指纹。
- `auth`：访问授权、包级 token、过期和限流信息。
- `llm`：LLM 调用命令、工具调用轨迹和端口。

值对象负责描述跨层传递的业务事实，例如 `McpToolConfigVO`、`PublishedCapabilityPackageVO`、`SessionConfigVO` 和 `ToolInvocationResultVO`；DAO PO 只在 Infrastructure 存在，不能让表字段直接决定领域对象的行为。

### Domain Port 与 Repository

Domain 通过两类接口隔离外部世界：

| 抽象 | 示例 | 解决的问题 |
| --- | --- | --- |
| Adapter Port | `IHttpExecutionPort`、`IDataSourceRuntimePort`、`IMcpUpstreamPort`、`ILLMPort`、`IStreamableSessionReplayPort` | Domain 需要“执行什么”，但不应知道由哪种客户端执行 |
| Repository Port | `ISessionRepository`、`ICapabilityPackageRepository`、`IToolInvocationRepository`、`IWorkbenchRepository` | Domain 需要读取或保存业务事实，但不应知道 SQL、DAO 和缓存格式 |

例如，`ToolInvocationService` 只向 `IToolInvocationRepository` 查询工具协议，再让策略调用 `IHttpExecutionPort`、`IDataSourceRuntimePort` 或 `IMcpUpstreamPort`。同一个入口既能服务 MCP `tools/call`，也能服务管理工作台工具测试，保证两条路径经过同一套执行策略。

## Infrastructure 层：适配现实系统的复杂性

Infrastructure 不是“把 Domain 代码搬到另一个包”，它负责处理最容易变化和最容易失败的外部细节：

### 数据持久化

MyBatis DAO 读写 `mcp_gateway`、工具、协议、映射、能力包、成员、语义卡片、测试状态、数据源和 token 等数据。Repository 将多张表组装成 Domain 所需的配置对象，尤其是已发布能力包工具查询，需要按能力包投影中的有序工具 ID 重新排序，不能依赖数据库 `IN` 查询的返回顺序。

### Redis

Redis 承载会话元数据、会话同步 Topic、能力包运行时投影、版本键、脏标记、负缓存和回源锁。Redis 的 JSON 解析和 TTL 细节留在 Infrastructure；Domain 只看到“当前发布投影”“会话元数据”或“缓存不可用时回源”的接口语义。

### 外部调用

HTTP 执行适配器负责连接、请求头、Cookie、Body、超时和返回体；上游 MCP 适配器负责 `initialize`、`tools/list`、`tools/call` 和重连；LLM 适配器负责 Spring AI ChatModel、MCP callback provider 和 provider timeout。这些适配器捕获连接异常并转换为 Domain 能理解的失败结果，不能让外部 SDK 异常类型泄露到 Controller。

## 三条真实调用路径

### 管理路径

管理端保存协议、数据源或工具配置时，Trigger 转成管理命令，Case 调用 Domain Service，Domain 验证对象归属、版本和业务规则，Repository 通过 DAO 写入 MySQL，缓存失效在事务同步点处理。管理路径结束的标志是“配置事实已经保存”，不是“客户端立刻看到新工具”。

### MCP 运行路径

MCP Controller 接收消息后，Case 先处理响应形态和会话用例；Domain 从服务端 session 恢复 gateway 与 package scope，再由 `SessionMessageService` 按方法映射到 `InitializeHandler`、`ToolsListHandler` 或 `ToolsCallHandler`。`ToolsCallHandler` 调用共享的 `IToolInvocationService`，策略再进入具体下游端口。

### LLM 联调路径

管理端发起 LLM 测试时，Case 组织网关和 MCP 配置，Domain 的 `LLMService` 校验命令，Infrastructure 的 `LLMGatewayService` 建立 MCP client、发现 callback、组装 Spring AI ChatModel，再由模型自主选择工具。工具回调最终回到 MCP 运行面，轨迹记录器只保留工具名和成功/失败/未知状态，不保存敏感输入。

## 事务边界如何划分

我把事务边界放在“同一组 MySQL 业务事实必须一起成立”的场景，而不是放在整个网络调用链上：

| 场景 | 事务内动作 | 事务外动作 |
| --- | --- | --- |
| 能力包成员变更 | 锁住能力包、校验版本、保存成员、更新版本 | 事务完成后让运行时缓存版本失效 |
| 能力包发布 | 锁住包、加载成员、执行发布规则、写发布版本和指纹 | 运行时缓存按新版本懒加载 |
| 工具测试结果 | 复读当前配置、比对指纹、保存工作台状态和工具测试状态 | 下游 HTTP/数据源调用本身不包在数据库事务中 |
| MCP 工具调用 | 无长事务，只读取配置和执行下游 | 网络超时、数据源执行和 LLM 调用各自受超时控制 |
| 会话元数据 | Redis 写入和刷新由会话分布式服务完成 | 本地 Sink、Replay buffer 属于当前 JVM 资源 |

能力包缓存失效会先建立事务脏标记，提交后切换网关运行时版本，回滚则清理当前 mutation 的脏标记。这样 MySQL 事务和 Redis 投影不宣称原子一致，但能避免事务未提交时继续使用旧投影或把旧配置写进新版本。

## 为什么暂时不拆成微服务

现在拆成独立服务会引入新的问题：管理配置、发布门禁、会话 scope、缓存版本和工具调用之间需要跨服务传递上下文；如果没有稳定事件模型和统一审计，拆分只会把本来可以单库事务解决的问题变成分布式一致性问题。

当前分层单体已经通过端口和模块把未来可能拆出的边界标出来：数据源运行时、上游 MCP、LLM、能力包运行时缓存和会话管理都有明确接口。等到部署规模、团队边界或安全隔离确实需要拆分时，可以先把 Infrastructure 适配和 Case 用例迁移出去，再设计跨服务事件，而不是从 Controller 直接切服务。

## 本篇结论

DDD 在这个项目中的价值是让“协议可以变、下游可以换、规则不能散”。Trigger 和 Case 负责表达外部场景，Domain 负责能力包、工具、会话和安全规则，Infrastructure 负责把这些规则落到 MySQL、Redis 和外部网络。下一篇继续说明这些层里最重要的对象边界：为什么工具、协议、数据源、能力包和会话必须单独建模。

下一篇：[领域模型与业务边界](./03-领域模型与业务边界.md)
