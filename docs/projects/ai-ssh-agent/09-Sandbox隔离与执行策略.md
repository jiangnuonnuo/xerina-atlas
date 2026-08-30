---
title: Sandbox 隔离与执行策略
type: project-chapter
project: ai-ssh-agent
group: 安全执行
order: 9
description: 说明 HOST、交互终端和目标 SSH 主机上的 Docker Sandbox 如何按命令风险选择，并解释不静默降级的原因。
sidebar: true
layout: project-doc
---

## 我为什么需要两个执行目标

运维命令和不可信脚本的风险不同。普通状态查询需要作用于真实主机，下载后立即执行、动态解码执行或其他不可信脚本则不应直接进入 HOST。项目把执行目标显式分成 `HOST`、`INTERACTIVE_TERMINAL` 和 `SANDBOX`，让“在哪里运行”成为请求的一部分，而不是工具内部的隐含决定。

## 策略决策

内置 Agent 配置把 HOST、Sandbox 和终端的适用范围写进工具说明，但服务端还会在执行策略中判断危险命令、环境要求和是否必须隔离。命令被判定为 `SANDBOX_REQUIRED` 时，正确路径是：检查目标服务器 Docker 能力，创建适合的 Sandbox，再调用 Sandbox 执行。

![SSH Agent 隔离边界](./assets/isolation/isolation.gif)

图要回答的问题：普通 HTTP、MCP、进程内运行时、Execution Case 和远程主机之间的真实隔离边界在哪里。HTTP API 与 MCP Endpoint 是不同入口，Runtime Memory 与远端主机也不是同一资源；图下注明的 `/mcp` 认证范围和普通 API 的 `userId/default` 边界是当前实现事实。

## Sandbox 生命周期

Sandbox 能力包括能力检查、模板查询、创建、查询、列表、执行、重置和销毁。Sandbox 实现在目标 SSH 服务器上通过 Docker 网关工作，不是本地开发机的默认容器，也不是 SSH Session 的替代品。

创建时需要区分工作区模式。强制隔离场景不能把用户工作区自动挂入；如果已有 Sandbox 属于 `USER_BOUND` 或 `LEGACY_UNKNOWN`，需要重新创建 `MANAGED_ISOLATED` Sandbox。资源规格、网络模式、镜像和工作区策略由 Sandbox 请求和领域值对象共同约束。

默认 Sandbox 存活 2 小时，最大 8 小时；过期清理由定时任务每分钟扫描，每轮最多处理配置的批量数量。创建成功后返回 Sandbox ID、运行时模板、工作区、资源、网络、过期时间和下一步动作；创建中、重置中或销毁中需要继续查询，而不是重复创建。

Sandbox 执行仍通过对应 SSH 连接进入目标服务器，随后由远程 Docker 网关运行容器内命令。Sandbox 的命令也进入统一 Execution 生命周期，因此仍然拥有 executionId、超时、输出、查询和取消语义；不同之处只是目标策略把实际执行位置改成容器。

## 不静默降级

目标主机可能没有 Docker，或 Docker 权限不足、daemon 不可用。实现把这些能力状态区分为 `DOCKER_NOT_INSTALLED`、`DOCKER_PERMISSION_DENIED` 和 `DOCKER_DAEMON_UNAVAILABLE` 等结果。没有 Docker 时 SSH 仍可能正常可用，但系统不能在收到 `SANDBOX_REQUIRED` 后悄悄把同一命令重试到 HOST。

我的取舍是牺牲一部分自动完成率，换取执行目标的可解释性。用户可以继续使用普通 SSH 运维，也可以明确处理 Docker 环境问题；系统不替用户把隔离要求降级成直接执行。

## Sandbox 与 SSH、SFTP 的边界

Sandbox 中的命令仍由 SSH 连接进入目标服务器，但命令目标是容器运行时；SFTP 文件操作则是远程文件平面的能力，不会自动变成容器内文件操作。要修改主机文件，使用 SFTP 或受控 sudo；要执行不可信脚本，使用 Sandbox。两者的路径和权限不能凭工具名称推断。

## 策略和风险规则

执行策略包含灾难性 HOST 命令规则、不可信主机命令规则和 Sandbox 隔离边界规则。另有 Permission Guard 对危险 Docker、敏感文件和需要用户确认的操作做分类。当前实现的一个重要风险是：AI 风险分类失败时存在默认放行路径，因此不能把 AI 分类器当成唯一安全防线，生产环境必须依赖确定性规则、人工确认和更严格的默认拒绝策略。

我把策略结果看成四种不同的业务动作：`ALLOW` 继续原目标，`DENY` 直接拒绝，`SANDBOX_REQUIRED` 要求先准备任意可用的隔离容器，`ISOLATED_SANDBOX_REQUIRED` 还要求工作区是系统管理的隔离模式。这样“Docker 有无”和“当前 Sandbox 是否足够隔离”是两个检查，不会因为已有一个用户挂载目录的容器就错误放行。

## 验证方式

Sandbox 领域测试覆盖生命周期、能力状态、资源规格和网络模式；执行策略测试覆盖 HOST、SANDBOX、终端目标以及隔离必选命令；Docker 网关测试覆盖命令构造、工作区挂载和 daemon 错误。真实验收需在 Docker 已安装、未安装、权限拒绝和 daemon 不可用四种环境分别验证。

下一篇：[ReAct 对话与 Agent 调用链](./10-ReAct对话与Agent调用链.md) · 相关：[SSH 命令执行主链路](./06-SSH命令执行主链路.md)
