---
title: 核心业务流程
type: project-chapter
project: aigc-print-platform
group: 系统设计
order: 12
description: 批量绘图、印花提取与换装全流程时序图，消息生命周期与状态机全景。
sidebar: true
layout: project-doc
---

> 本章用 Mermaid 时序图/流程图讲清三个核心闭环：**批量绘图全流程、消息生命周期、印花提取/换装流程**。每个环节标注"做什么、为什么、失败怎么办"。

---

## 1. 批量 AI 绘图全流程（主流程）

```mermaid
sequenceDiagram
    autonumber
    actor U as 运营用户
    participant NG as 网关(限流/鉴权)
    participant C as 批量提交接口
    participant S as 任务编排Service
    participant DB as MySQL
    participant OB as Outbox投递任务
    participant MQ as RabbitMQ
    participant W as 绘图Consumer(5-10并发)
    participant UP as MJ Proxy 上游
    participant CB as 回调接口 /mj/run/{id}
    participant OS as OSS

    U->>NG: POST /mj/batch-process (批量提示词)
    NG->>C: 令牌桶限流 + Sa-Token鉴权
    C->>S: 创建批量任务
    S->>S: 余额预校验(失败→整批失败返回)
    S->>DB: 事务: 建批量任务+子任务(status=0)+进度表
    S->>DB: 事务内写 Outbox 记录(待投递)
    S-->>U: 返回 taskId（毫秒级，异步化）
    S->>OB: 事务提交后扫描/触发投递
    OB->>MQ: 逐条发布到 biz.queue(priority=业务优先级)
    MQ->>W: 消费(手动ack)
    W->>W: 幂等检查(status==0才处理)
    W->>UP: 提交任务(携带回调地址 /mj/run/{id})
    alt 提交成功(code=1)或排队(code=22)
        W->>DB: 记录 mj_task(SUBMITTED)，子任务 status=1(处理中)
        W->>MQ: ack
    else 提交失败
        W->>DB: 子任务 status=3 + error_msg
        W->>MQ: nack(requeue=false)→进入延迟重试/死信链路
    end
    UP-->>CB: 出图完成回调
    CB->>DB: 条件更新子任务 status=2(成功)+image_url
    CB-->>UP: 200 OK(回调确认)
    Note over DB: 全部子任务完成→主任务 status=1<br/>通知压缩队列
    OS-->>DB: 结果图上传OSS，回写URL
    U->>NG: 查询任务进度/下载ZIP
    NG->>OS: 预签名URL直连下载(权限校验)
```

**步骤解读（小白版）**：
- 步骤 1~6：用户提交 → 系统只做"记账"（建任务）并**立刻返回**，不等待出图——这就是"异步化"；
- 步骤 8~10：后台消费线程（并发 5~10 个）从队列取任务逐个调上游，**队列就是缓冲区**，请求再多也不会直接打到上游；
- 步骤 15~17：上游画完图会回调本系统（或系统轮询），回调把任务状态改成"成功"；
- 步骤 18~20：全部画完后打包上传 OSS，用户下载走预签名直链，**不占用应用服务器带宽**。

**失败怎么办**：第 14 行"提交失败"不直接丢弃——按 13 章规则进入延迟重试（30s/5min 分级）→ 封顶后进死信 → 置失败+告警，用户可看到失败原因。

## 2. 消息完整生命周期（一图看懂重试流转）

```mermaid
flowchart LR
    P["生产者<br/>(Outbox投递)"] -->|publish + confirm| X["biz.exchange"]
    X -->|routing key| Q["biz.queue<br/>业务主队列"]
    Q -->|投递给消费者| W["业务消费者"]
    W -->|处理成功 ack| OK["✅ 终态：成功"]
    W -->|可重试异常<br/>nack(requeue=false)| DLX1["retry.exchange"]
    DLX1 -->|retry.key| RQ["retry.queue<br/>TTL 30s/5min 无消费者"]
    RQ -->|TTL到期 自动死信| DLX2["retry.exchange"]
    DLX2 -->|回到业务队列| Q
    Q -->|x-death计数>=封顶轮数| DLXF["dlx.exchange"]
    DLXF -->|dlq.key| DQ["dlq.queue 最终死信"]
    DQ --> DLQC["死信消费者:<br/>置失败+归档+告警+人工重放"]
    W -->|不可重试异常<br/>(参数/审核拒绝)| DLXF
```

**核心设计点**（详细推导见 13 章）：
1. **延迟重试队列没有消费者**，消息靠"TTL 到期自动死信"回到业务队列，天然实现"等 30s 再试"；
2. 每次死信 RabbitMQ 自动记录 `x-death` 计数，**重试轮数封顶**（默认 3 轮），杜绝无限循环；
3. **不可重试异常直接进最终死信**，不浪费重试轮次；
4. 死信消费者**只归档不重投上游**，防止"死信又回上游"的死循环。

## 3. 印花提取 / 产品生场景 / 换装流程（第三方 API + 轮询兜底）

```mermaid
sequenceDiagram
    autonumber
    actor U as 用户
    participant C as 提交接口
    participant S as 业务Service
    participant DB as MySQL
    participant MQ as RabbitMQ
    participant WC as 提取消费者(3-8并发)
    participant API as 第三方AIGC API(grsai)
    participant T as 定时任务(10s轮询)
    participant OS as OSS

    U->>C: 上传素材图+场景要求
    C->>S: 校验(文件大小/格式/分辨率)
    S->>DB: 建任务(status=0)+写Outbox
    S-->>U: 返回任务ID
    S->>MQ: 投递提取消息
    MQ->>WC: 消费→幂等检查→status=1(处理中)
    WC->>API: 提交绘制任务(携带webHook)
    API-->>WC: 返回 api_task_id
    WC->>DB: 记录 sys_api_task_record(running)
    WC->>MQ: ack
    loop 每10秒(未收到回调时兜底)
        T->>API: 查询任务状态
        alt 状态=succeeded
            T->>OS: 下载结果→上传OSS→回写URL
            T->>DB: 记录succeeded + 进度100%
            T->>DB: 更新主任务统计→全部完成→通知压缩队列
        else 状态=failed
            T->>DB: 记录failed + failure_reason
        end
    end
```

**为什么回调之外还要轮询**：第三方 API 的回调 webHook 可能丢失、可能延迟、可能重复。**回调 + 轮询双通道**，谁先到谁生效（靠状态机条件更新去重，见 14-§4.3），保证任务最终收敛。

## 4. 状态机全景（三张状态图）

**4.1 子任务状态机（`sys_mj_batch_prompt.status`）**

```mermaid
stateDiagram-v2
    [*] --> 待处理0: 创建
    待处理0 --> 处理中1: 消费者开始处理
    待处理0 --> 失败3: 不可重试异常(参数错误等)
    处理中1 --> 成功2: 回调/轮询成功
    处理中1 --> 失败3: 回调失败/重试耗尽
    处理中1 --> 失败3: 超时(生成30min/8h兜底)
    待处理0 --> 失败3: 超时(从未被消费,8h兜底)
    成功2 --> [*]
    失败3 --> [*]
    失败3 --> 待处理0: 人工重放(DLQ)
```

**4.2 主任务状态机（`sys_mj_batch_task.status`）**

```mermaid
stateDiagram-v2
    [*] --> 处理中0: 创建批量任务
    处理中0 --> 已完成1: 全部子任务收敛(成功+失败=总数)
    处理中0 --> 失败2: 全部失败/余额不足/异常
    已完成1 --> [*]
    失败2 --> [*]
```

**4.3 第三方 API 任务记录（`sys_api_task_record.status`）**

```mermaid
stateDiagram-v2
    [*] --> pending: 提交成功
    pending --> running: 已拿到api_task_id
    running --> succeeded: 回调/轮询成功(progress=100)
    running --> failed: 回调/轮询失败(带failure_reason)
    failed --> [*]
    succeeded --> [*]
```

> 状态机三大纪律（详见 16-§4）：**① 只允许合法迁移（条件更新）；② 每个状态都有超时；③ 所有路径最终收敛到终态。**

---

*下一章：[13-message-queue-design.md](./13-message-queue-design.md)（本章核心）*
