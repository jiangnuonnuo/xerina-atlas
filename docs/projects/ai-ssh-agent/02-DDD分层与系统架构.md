---
title: DDD 分层与系统架构
type: project-chapter
project: ai-ssh-agent
group: 架构设计
order: 2
description: 解释 Maven 模块、DDD 分层、端口适配器和 Agent/SSH 两条真实调用链如何组合成单体系统。
sidebar: true
layout: project-doc
---

## 我从目录中看到的结构

项目是 Java 17、Spring Boot 3.4.3 的 Maven 分层单体。模块边界不是按“页面功能”切包，而是按变化原因和依赖方向切开：协议入口、场景编排、领域规则、基础设施实现和启动配置分别承担不同职责。

![DDD 分层与 SSH 运行面](./assets/architecture/architecture.gif)

图要回答的问题：协议入口如何落到核心运行时，核心运行时如何同时连接 MySQL、Redis、SSH 工具和安全策略。图中的 `Trigger Surface` 是 HTTP、MCP 和工具注解暴露面，`ReAct Case` 与 `Agent Runtime` 负责编排，`SSH Tool Plane` 是副作用端口，`Audit Log` 和 `Redis` 分别承担命令摘要与长任务跟踪。

## 模块职责

| Maven 模块 | 我观察到的职责 | 不应该承担的职责 |
| --- | --- | --- |
| `walicode-server-types` | 通用常量、响应码、应用异常、跨层枚举 | SSH 连接规则、模型循环或具体数据库访问 |
| `walicode-server-api` | HTTP 服务接口、请求响应 DTO 和对外契约 | 直接操作 JSch、Redis 或线程池 |
| `walicode-server-domain` | SSH、Execution、Sandbox、Agent 等领域对象、值对象、领域服务和 Port | Spring MVC 路由、JSch 细节、Docker 命令拼接 |
| `walicode-server-case` | 用例编排、准入链、执行策略、ReAct 节点、恢复和响应组装 | 把协议字段直接当成领域状态，或绕过 Domain Port 访问外部设施 |
| `walicode-server-infrastructure` | MySQL/MyBatis、Redis、JSch、SFTP、Docker Sandbox、加密和仓储实现 | 决定用户意图、Agent 循环或 API 路由 |
| `walicode-server-trigger` | Controller、Spring AI `@Tool` 工具、MCP 会话解析和 SSE 进度 | 在 Controller 内自行执行远程命令 |
| `walicode-server-app` | Spring Boot 启动、配置、Agent 装配、过滤器、组件扫描和打包入口 | 承担全部业务规则 |

## 依赖方向

我采用的主方向是：`trigger` 接收外部输入，调用 `case`；`case` 使用 `domain` 的服务和端口；`infrastructure` 实现 `domain` 声明的 Port；`app` 将这些组件装进 Spring 上下文。`api` 与 `types` 为跨模块契约提供稳定类型。

这样做的直接收益是，SSH 命令准入规则不会因为 Controller 改成 MCP 工具而改变；SFTP Channel 的生命周期不会被页面接口重复实现；JSch 替换或 Redis 实现调整也不需要重新定义 Agent 的工具语义。

## 两条真实调用链

### Agent 装配链

应用收到 `ApplicationReadyEvent` 后进入 Agent 装配流程。配置被读取后，运行时依次形成 AI API、Chat Model、Agent、Workflow 和 Runner。工具贡献者再把内置 SSH、Sandbox、Execution、SFTP 能力与动态 MCP、Skills 能力汇总，最后把可运行的 Agent 注册到 Spring 上下文。

这条链解决的是“应用启动后有哪些 Agent 和工具可用”，不是一次用户聊天。一次聊天仍然要经过 [ReAct 对话与 Agent 调用链](./10-ReAct对话与Agent调用链.md)。

### SSH 请求链

一次 SSH 请求从 HTTP Controller、Spring AI 工具或 MCP 工具进入 SSH Case。Case 组装执行请求，调用 Execution Admission Chain；准入通过后选择 HOST、INTERACTIVE_TERMINAL 或 SANDBOX 策略，再通过 Domain Port 进入 Infrastructure。远端结果回到生命周期协调器，状态和输出分别进入内存跟踪、Redis 持久化以及 HTTP、SSE 或 MCP 响应。

## Port 和适配器的真实落点

Domain 中定义的端口不是抽象装饰，而是当前代码真正跨越技术边界的接口：

| Domain 端口 | Infrastructure 实现方向 | 外部依赖 | 由谁决定业务语义 |
| --- | --- | --- | --- |
| SSH Session、Managed Shell、Command、File、Terminal | JSch Session、Shell、SFTP 和终端网关 | 远端 SSH 服务 | SSH/Execution Domain 与 Case |
| SSH Credential | 加密组件和连接仓储映射 | 应用密钥、MySQL | SSH 认证策略 |
| SSH Execution Repository | Redis 执行服务 | Redis Hash、Stream、Sorted Set、Value | Execution Case |
| Chat History、Core Memory | MyBatis Repository | MySQL | Agent Domain |
| Sandbox Runtime、Managed Shell | Docker 命令构造和远端网关 | 目标主机 Docker | Sandbox Domain 与 Case |

因此依赖方向是“Domain 定义我要什么，Infrastructure 决定怎样接入”，而不是由 Domain 直接 import JSch、RedisTemplate 或 Docker CLI。

## 一个请求穿过哪些层

以 `ssh_execute` 为例，Trigger 只负责解析工具参数和补充来源/会话上下文；Case 负责规范化、校验、幂等、占用和策略路由；Domain 负责连接可用性、命令风险、终端或 Sandbox 规则；Infrastructure 负责建立 Channel、读写控制帧、调用 Redis 并把结果转换回来。响应组装再把领域状态映射为工具或 HTTP 可读的字段。

这种切分还决定了事务边界：连接配置保存和 JSch 建连是两次独立操作，远端命令和 Redis 输出也不是一个事务。文章 [数据一致性、并发与异常处理](./12-数据一致性并发与异常处理.md) 专门记录这些断点。

## 事务边界

我在源码中没有看到把“远端命令、Redis 输出、MySQL 连接事实和 HTTP 响应”放进一个本地数据库事务。这里存在四种不同的一致性：MySQL 保存连接和会话事实，JVM 内存保存正在运行的 Session、Terminal 和 Shell，上游远端主机保存真实执行状态，Redis 保存长任务元数据和输出流。

因此，连接创建可以先完成数据库保存，再单独尝试建立 JSch Session；命令执行可以已经在远端结束，但 Redis 转存仍然失败；本地事务回滚也不能撤销远端已经执行的命令。文档中的恢复方案都基于这个事实，而不是假设存在一个跨系统事务。

## 为什么不做一个“大服务类”

SSH 项目很容易把 Controller、命令安全、JSch 调用、输出拼接和响应映射写进一个类里，但这样无法回答“哪一层负责拒绝危险命令”“哪一层负责长任务恢复”“哪一层负责主机指纹”。我选择 DDD 分层，是因为这些规则会以不同速度变化，并且需要分别测试。

当前实现仍然是单体，不代表边界无效。单体内的 Port、Case 和领域服务让调用链可替换、可测试，也把未来拆分服务时真正需要保留的契约提前显现出来。

下一篇：[领域模型与业务边界](./03-领域模型与业务边界.md) · 相关：[Agent 装配与工具暴露](./04-Agent装配与工具暴露.md)
