---
title: 消息队列设计（RabbitMQ 完整可靠性方案）
type: project-chapter
project: aigc-print-platform
group: 核心实现
order: 13
description: 队列拓扑、消费失败分类、TTL 延迟重试、死信收容与人工重放、幂等/顺序/积压治理与压测方案。
sidebar: true
layout: project-doc
---

> 本章是全文档**最核心**的一章：把消息从"发送 → 消费 → 失败 → 重试 → 积压 → 死信 → 最终处理"的完整链路讲透，并修正初版方案中"消费者线程内重试阻塞消费、死信可能循环"等缺陷。
> 阅读收益：掌握一套**可直接照抄落地**的 RabbitMQ 可靠消息方案（拓扑、参数、代码语义、监控、压测）。

---

## 1. 设计目标与约束

| 目标 | 说明 |
|------|------|
| **不丢消息** | 生产者确认 + Outbox + 手动 ack + 死信收容，任何环节崩溃都不丢 |
| **不无限重试** | 重试轮数封顶（默认 3 轮），杜绝死循环 |
| **不堵塞主队列** | 失败消息快速离开主队列（nack requeue=false），重试走独立延迟队列，主队列永远通畅 |
| **不重复消费副作用** | 消费幂等（见 14 章），重复投递无副作用 |
| **可观测** | 队列深度、消费速率、失败率、死信量全部可监控告警 |
| **故障隔离** | 各业务独立队列 + 独立死信，一类故障不拖垮其他业务 |

**约束（本业务特性）**：
- 消息量级：万级/日（批量提交，每条提示词一条消息），不需要 Kafka 级别的吞吐；
- 延迟要求：出图本身 30s~2min，消息延迟 30s 级完全可接受——这决定了"TTL 延迟重试"是合适方案；
- 顺序要求：**批次内子任务相互独立，无强顺序要求**（顺序见 §7.3 说明）。

## 2. 总体拓扑（命名规范 + 全量清单）

### 2.1 命名规范（企业级标准）

| 对象 | 命名规则 | 示例 |
|------|---------|------|
| 业务交换机 | `{biz}.exchange`，direct | `mj.exchange`、`print.extract.exchange` |
| 业务队列 | `{biz}.queue` | `mj.queue`、`print.extract.queue` |
| 延迟重试交换机 | `retry.exchange`（共享一个） | `retry.exchange` |
| 延迟重试队列 | `retry.{biz}.{ttl}.queue` | `retry.mj.30s.queue`、`retry.mj.5m.queue` |
| 最终死信交换机 | `dlx.exchange`（共享一个） | `dlx.exchange` |
| 最终死信队列 | `dlq.{biz}.queue` | `dlq.mj.queue` |
| 路由键 | 与目标队列同名（direct 下最直观） | `mj.queue`、`dlq.mj.queue` |

> 初版方案的命名（`mj_task`/`mj_task_queue`/`mj_task_exchange`）可保留兼容，新增队列按上表命名，避免运维混乱。

### 2.2 队列/交换机/路由键全量清单（单业务示例，其余业务同理）

```mermaid
flowchart LR
    subgraph 业务域(mj)
        P1["生产者 Outbox"] -->|publish| BE["mj.exchange (direct)"]
        BE -->|"mj.queue"| BQ["mj.queue<br/>x-max-priority=10<br/>DLX=retry.exchange DLK=retry.mj.30s.queue"]
        BQ --> W["MjConsumer<br/>concurrency 5-10"]
        W -->|成功 ack| DONE
        W -->|可重试 nack| RE["retry.exchange (direct)"]
        RE -->|"retry.mj.30s.queue"| RQ1["retry.mj.30s.queue<br/>x-message-ttl=30000<br/>无消费者<br/>DLX=retry.exchange<br/>DLK=mj.queue"]
        RE -->|"retry.mj.5m.queue"| RQ2["retry.mj.5m.queue<br/>x-message-ttl=300000<br/>无消费者<br/>DLX=retry.exchange<br/>DLK=mj.queue"]
        RQ1 -->|TTL到期| RE
        RQ2 -->|TTL到期| RE
        BQ -->|"x-death≥3 或不可重试<br/>转投"| DX["dlx.exchange (direct)"]
        DX -->|"dlq.mj.queue"| DQ["dlq.mj.queue<br/>消费者:归档+置失败+告警"]
        DQ --> M["人工重放面板<br/>→重投 mj.exchange"]
    end
```

**同一套拓扑按业务复制**：绘图（mj）、放大（upscale）、压缩通知（compress）、印花提取（print.extract）、产品生场景（product.scene）、换装（product.tryon）、视频转发/轮询（video.forward / video.result.poll）——业务之间队列完全隔离。

## 3. 消费失败分类（重试策略的前提）

**错误分类是第一决策**：不是所有失败都值得重试。消费失败先分类，再决定走"延迟重试"还是"直接死信"。

| 分类 | 类型 | 典型场景 | 策略 |
|------|------|---------|------|
| **可重试-瞬时** | 网络抖动、上游 5xx/超时、连接池耗尽、DB 死锁（1213）、MQ 通道异常 | 上游偶发不可用 | TTL 延迟重试，退避递增（30s → 5min） |
| **可重试-限流** | 上游 429/限流、MJ 账户队列满 | 上游繁忙 | 延迟重试 + 降低该账户并发；重试窗口加长 |
| **不可重试-参数** | 反序列化失败、提示词为空/超长、格式非法 | 请求本身有问题 | **直接死信**，不浪费重试 |
| **不可重试-业务** | 内容审核拒绝（output_moderation/input_moderation）、余额不足 | 业务规则判定 | **直接死信** + 标记失败原因（可原样返回给用户） |
| **不可重试-上游明确拒绝** | 上游返回"任务不存在"等确定性错误码 | 重试无意义 | **直接死信** |

**代码落地**：定义自定义异常 `RetryableException`（可重试）与 `NonRetryableException`（不可重试），消费者统一 catch 后按类型决定 ack/nack 与转投目标（见 §4.5 代码示例）。

## 4. 完整消息生命周期（链路推导）

### 4.1 第一步：发送（可靠发布）

1. **业务事务内写 Outbox 表**（与建任务同事务，见 14-§3），事务提交后投递；
2. 投递采用 **publisher confirms**（`publisher-confirm-type: correlated`）：发送后等待 broker 确认，未确认则标记 outbox 待重投，由补偿任务补发；
3. 开启 **mandatory + ReturnCallback**：消息路由不到任何队列时（如队列被误删）返回回调，记录告警，防止静默丢失。

### 4.2 第二步：消费（手动 ack 语义）

- 手动 ack（`AcknowledgeMode.MANUAL`），**业务处理成功（DB 提交）之后才 ack**；
- 处理抛异常时 **nack(requeue=false)**——不进原队列，交给死信/重试链路；
- ⚠️ **修正点**：初版在消费者线程内用 Spring Retry 同步重试（5s/10s/20s 指数退避，最多 3 次），失败消息会**占住消费者线程最长 35s**，并发 5~10 时消费能力骤降，且与 Broker 层重试职责重叠。**本方案移除线程内重试**，消费者"一次消费、快速 nack"，重试统一交给延迟队列（§4.3）。

### 4.3 第三步：延迟重试（TTL + DLX，Broker 级，不占线程）

**机制推导**（为什么这样设计）：

```
nack(requeue=false)
   → 消息进入 mj.queue 的 DLX = retry.exchange，路由键 retry.mj.30s.queue
   → 消息进入 retry.mj.30s.queue（无消费者，x-message-ttl=30s）
   → 30s 后 TTL 到期，该队列自动死信到它的 DLX = retry.exchange，
     路由键 mj.queue（回到业务队列）
   → 业务消费者再次收到，再试一次
```

要点：
1. **重试队列没有消费者**——"等待"由 broker 的 TTL 完成，不占用任何应用线程；
2. **分级退避**：两个重试队列 30s、5min，按失败次数路由（第 1~2 次失败→30s 队列，第 3 次→5min 队列）；
3. **轮数封顶**：每次死信 RabbitMQ 都会在消息 header 追加 `x-death` 记录。消费者在拿到消息时读取 `x-death` 累计次数（`sum(count)`），**≥ 封顶轮数（默认 3）就不再 nack，而是转投最终死信队列并 ack 原消息**——这是防死循环的关键；
4. 为什么不用 RabbitMQ Delayed Message 插件：多一个 broker 插件依赖，运维成本高；TTL+DLX 是**原生能力**，语义清晰、可审计（管理台可见每条消息的死信记录）。插件方案作为备选记录在 17-§4.4。

### 4.4 第四步：最终死信（收容 + 人工处置）

- 不可重试异常、重试耗尽的消息 → 转投 `dlx.exchange` → `dlq.mj.queue`；
- **死信消费者职责**（重要：不允许自动重投上游）：
  1. 解析消息，将对应子任务置为 `status=3`（失败）+ `error_msg`（含失败分类与原因）；
  2. 更新批量任务失败计数、进度；
  3. 记录死信明细表 `sys_dlq_record`（消息体、原因、时间、处置状态）；
  4. **发送告警**（死信量突增 = 上游事故信号）；
  5. 支持**人工重放**：运维确认问题修复后，在管理后台把死信记录重新投递回 `mj.exchange`（重新走全流程），重放时带 `X-Retry-Overridden` 头清零 x-death 计数。
- ⚠️ **修正点**：初版 DLQ 消费者会"再调一次上游"，若再次失败且 DLQ 无 TTL/无上限，存在**循环重投上游**风险。本方案 DLQ 只收容，重试全部发生在上游调用之前的队列链路里。

### 4.5 消费者代码语义（伪代码，可直接落地）

```java
@RabbitListener(queues = "mj.queue", concurrency = "5-10",
        containerFactory = "manualAckContainerFactory")
public void onMessage(String json, Channel channel, Message message) throws IOException {
    long tag = message.getMessageProperties().getDeliveryTag();
    String msgId = message.getMessageProperties().getMessageId(); // 幂等键之一
    try {
        // 0. 幂等检查（14-§4）
        if (idempotentService.alreadyConsumed(msgId)) { channel.basicAck(tag, false); return; }
        // 1. 反序列化（失败=不可重试）
        SysMjBatchPrompt prompt = JSONUtil.toBean(json, SysMjBatchPrompt.class);
        // 2. 状态幂等：仅处理待处理任务
        if (!"0".equals(prompt.getStatus())) { channel.basicAck(tag, false); return; }
        // 3. 执行业务（调上游），成功落库后 ack
        execute(prompt);
        channel.basicAck(tag, false);
    } catch (NonRetryableException e) {
        // 不可重试 → 直接最终死信
        dlqPublisher.publishToDlq(json, classify(e), msgId);
        channel.basicAck(tag, false);          // ack 原消息，避免再次进入重试
    } catch (RetryableException e) {
        // 可重试 → 判断轮数
        int deathCount = sumDeathCount(message);        // 读取 x-death 累计
        if (deathCount >= MAX_RETRY_ROUNDS) {           // 封顶 3 轮
            dlqPublisher.publishToDlq(json, "retry_exhausted", msgId);
            channel.basicAck(tag, false);
        } else {
            // nack 不回队列 → 走 TTL 延迟重试（30s / 5min 按轮数路由）
            channel.basicNack(tag, false, false);
        }
    } catch (Exception e) {
        log.errorWithTrace("consume error", e);
        channel.basicNack(tag, false, false);           // 未知异常按可重试处理，但计数
    }
}
```

> 注：nack 后消息走向由队列的 DLX 决定（`retry.exchange`），"30s 还是 5min"由轮数决定路由键——可在 nack 前用 `basicPublish` 按轮数转投到对应延迟队列后 ack 原消息（更精确）；两种写法皆可，团队约定一种即可。

### 4.6 第六步：可靠性兜底清单（逐项核对）

| 可靠性项 | 方案 | 失败时的兜底 |
|---------|------|------------|
| 生产丢失（应用崩溃） | Outbox 表 + 补偿投递 | 扫描未投递记录补发（14-§3） |
| 生产到 broker 丢失 | publisher confirms | 未确认→重投；超时→告警 |
| 路由不到队列 | mandatory + ReturnCallback | 记录+告警（多为配置事故） |
| broker 宕机 | 集群 + 镜像队列/仲裁队列 | 连接自动重连；消息落盘不丢（durable） |
| 消费者崩溃（已取未 ack） | 未 ack 自动重回队列 | 幂等消费兜住重复 |
| 处理中崩溃（已落库未 ack） | 未 ack 重回队列 | 幂等检查跳过已成功任务 |
| 死信积压 | 死信量监控 + 告警 + 人工重放 | 积压即告警，人工介入 |

### 4.7 幂等与顺序性

**幂等（详细设计见 14 章）**：消息携带 `messageId`（UUID）；消费三重防线——① 业务唯一键（`sys_mj_task.mj_task_id` 唯一约束、子任务状态检查）；② 消费记录去重表（可选）；③ 状态机条件更新（`UPDATE ... WHERE status=前驱状态`）。保证"至少一次投递 + 幂等消费 = 有效一次"。

**顺序性**：
- 本业务**无强顺序要求**：批次内子任务相互独立，可乱序并行；`sequence` 字段仅用于结果展示排序，不依赖投递顺序；
- 若未来出现强顺序场景（如视频分镜必须按序生成）：方案 A 单队列 + `concurrency=1`（牺牲吞吐）；方案 B 按业务键哈希分区多队列（保序且并行）；**不要在乱序消费的架构上硬塞顺序**。

### 4.8 积压监控与治理

| 场景 | 监控指标 | 阈值（建议） | 治理动作 |
|------|---------|------------|---------|
| 正常波动 | `biz.queue` 深度 | < 1 万 | 无需处理（削峰填谷是特性） |
| 持续上涨 | 队列深度 + 消费速率 + 单条处理时长 | 深度 > 5 万 或 消费速率下降 | 定位上游故障；临时调高 concurrency/加实例 |
| 上游故障 | 失败率 + 死信速率 | 死信 > 100/min | 熔断降级（16-§3），暂停消费或转降级策略 |
| 内存压力 | 队列内存占用 | > 60% | 队列开启惰性模式（lazy queue，磁盘换内存） |

> 原则：**积压是特性不是事故**（削峰缓冲），真正要告警的是"积压持续增长且消费速率上不去"。

## 5. 压测方案与量化目标（50+ QPS 的来龙去脉）

**简历口径**：系统峰值处理能力 50+ QPS（消费端聚合消费速率）。面试前建议用以下方案复测并留存报告：

1. **压测工具**：JMeter 或自研脚本，向 `/mj/batch-process` 灌入批量任务（每批 50~100 条提示词），模拟运营峰值；
2. **观测点**：RabbitMQ 管理台 `biz.queue` 消费速率（msg/s）+ Prometheus 消费速率指标；
3. **容量模型**：单消费者处理一条消息约 100~200ms（组装参数+调上游+落库），并发 10 → 单实例理论 50~100 msg/s；50+ QPS 需要 5~10 并发 × 单条 < 200ms，符合本架构参数；
4. **调优变量**：`concurrency`（5-10）、HikariCP 连接池（maxPoolSize 50）、上游账户池并发上限、批次大小限制；
5. **结果记录**：QPS 曲线 + 队列深度曲线 + P95 接口耗时，作为简历数字的证据。

## 6. 关键配置示例（application.yml）

```yaml
spring:
  rabbitmq:
    host: ${RABBITMQ_HOST}
    port: 5672
    username: ${RABBITMQ_USER}
    password: ${RABBITMQ_PASS}
    virtual-host: /prod          # 环境隔离
    publisher-confirm-type: correlated   # 发布确认
    publisher-returns: true              # 不可路由回调
    listener:
      simple:
        acknowledge-mode: manual         # 手动 ack（必须）
        concurrency: 5                   # 初始并发
        max-concurrency: 10              # 最大并发（削峰填谷核心参数）
        prefetch: 20                     # 预取：单消费者未确认上限（背压控制）
        default-requeue-rejected: false  # 拒绝消息不重回原队列（走 DLX）
        retry:
          enabled: false                 # ⚠️ 关闭消费线程内重试（改 Broker 级）
```

> 关键参数含义（小白版）：`prefetch=20` 限制每个消费者手里最多 20 条未确认消息——这就是"背压"；`concurrency 5-10` 让消费能力随积压自动伸缩；`retry.enabled=false` 是本方案与初版的核心差异。

---

*下一章：[14-data-consistency-and-idempotency.md](./14-data-consistency-and-idempotency.md)*
