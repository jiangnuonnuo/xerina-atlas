---
title: AIGC + 印花提取平台
type: project
category: platform
categoryLabel: 平台工程
visual: atlas
year: 2025
order: 20
featured: true
status: completed
summary: 面向 AI 生图/视频生成场景，设计异步任务、消息可靠性、OSS 直传和高并发权益发放能力。
role: Java 后端开发
stack:
  - Java
  - RabbitMQ
  - Redis
  - OSS
  - MySQL
tags:
  - 异步任务
  - 状态机
  - 高并发
nav: true
sidebar: true
layout: project-doc
---

## 项目背景

在厦门乘骋科技有限公司实习期间，我承担该平台的后端开发角色，关注 AI 生图/视频生成耗时长、上游服务不稳定、资源直传和活动权益库存控制等问题。

## 核心结果

- 基于 RabbitMQ 设计异步任务处理架构，峰值处理能力提升至 50+ QPS。
- 通过消息重试、死信队列和任务状态机，任务最终成功率从 75% 提升至 90% 以上。
- 落地阿里云 OSS 直传，图片加载耗时从约 300ms 优化至 120ms，服务器出网带宽占用从 80% 降至 20% 以下。
- 采用 Redisson 原子操作、Lua 脚本和分布式锁的双层并发控制，400+ 并发压测无超卖。

## 文档阅读路径

- [异步任务与削峰填谷](./20-async-task)
- [消息可靠性与任务状态机](./30-reliable-message)
- [OSS 直传与权益库存](./40-oss-and-inventory)
