---
title: 异步任务与削峰填谷
type: project-chapter
project: aigc-print-platform
group: 核心架构
order: 20
description: 通过 RabbitMQ 和多消费者并发处理长耗时 AI 生成任务。
sidebar: true
layout: project-doc
---

## 问题

AI 生图和视频生成耗时较长，如果使用同步调用，接口线程会长时间阻塞，突发流量也会直接传递到上游服务。

## 方案

将任务提交和任务处理拆开：请求侧快速创建任务并投递消息，消费者异步调用上游服务并更新任务状态。RabbitMQ 负责缓冲任务，消费者通过 concurrency 配置提升并发处理能力。

## 结果

系统峰值处理能力提升至 50+ QPS，服务吞吐能力得到改善。后续需要补充队列容量、消费者数量和压测环境等完整证据。
