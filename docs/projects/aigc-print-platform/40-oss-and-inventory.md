---
title: OSS 直传与权益库存
type: project-chapter
project: aigc-print-platform
group: 性能与并发
order: 40
description: 通过 OSS 直传降低服务器带宽压力，并用双层并发控制保障权益库存准确性。
sidebar: true
layout: project-doc
---

## OSS 直传

设计并落地阿里云 OSS 直传方案，让图片直接上传到对象存储，减少应用服务器在文件传输链路中的压力。

图片加载耗时从约 300ms 优化至 120ms，扩容时间从小时级降至分钟级，服务器出网带宽占用从 80% 降至 20% 以下。

## 权益库存

生图平台权益发放活动采用 Redisson 原子操作与 Lua 脚本为主、分布式锁为兜底的双层并发控制方案，实现活动名额和权益库存的精准预扣及异步发放。

在 400+ 并发压测下无超卖。
