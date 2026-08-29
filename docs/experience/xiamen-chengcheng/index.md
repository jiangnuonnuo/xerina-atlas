---
title: Java 后端开发
type: experience
experienceType: internship
organization: 厦门乘骋科技有限公司
period: 2025.02 — 2025.10
location: 厦门 / 中国
order: 10
featured: true
summary: 承担 AI 生图/视频生成平台后端开发，参与异步任务、消息可靠性、OSS 直传和高并发权益发放。
detailLead: 在实习期间，我承担项目后端开发角色，参与 AIGC + 印花提取平台的研发设计，也参与公司切片视频平台的需求讨论、开发节奏和团队协同。
skills:
  - Java
  - RabbitMQ
  - Redis
  - MySQL
  - OSS
  - 高并发
relatedProjects:
  - aigc-print-platform
layout: experience-detail
---

<section id="role" class="experience-detail-section">

## 我的角色

我负责后端功能的设计与开发，参与需求讨论，并与前端、产品人员统一进度，保障核心功能按期交付。

<div class="experience-facts"><div><span>ROLE</span><strong>Java 后端开发</strong></div><div><span>DOMAIN</span><strong>AIGC 生图 / 视频生成 / 权益活动</strong></div><div><span>COLLABORATION</span><strong>前端 · 产品 · 后端</strong></div></div>

</section>

<section id="context" class="experience-detail-section">

## 工作背景

项目面向 C 端用户和 B 端运营人员提供 AI 生图、视频生成、印花提取和素材交付能力。由于上游任务耗时长、状态异步变化且文件体积较大，后端需要同时处理任务削峰、消息可靠性、权益额度和文件传输等问题。

</section>

<section id="collaboration" class="experience-detail-section">

## 协作方式

参与需求讨论和接口联调，与前端、产品和后端协作确认任务状态、异常提示、文件访问和权益规则；通过任务 ID、外部任务 ID、错误分类和日志链路定位异步任务问题，并跟进测试与修复验证。

</section>

<section id="participation" class="experience-detail-section">

## 具体参与

<ul class="experience-detail-list">
  <li><span>01</span><p>针对 AI 生图/视频生成耗时长、同步调用易阻塞的问题，基于 RabbitMQ 设计异步任务处理架构，通过 concurrency 多消费者并发消费实现任务削峰填谷，系统峰值处理能力提升至 50+ QPS。</p></li>
  <li><span>02</span><p>针对 Midjourney 等上游服务不稳定的问题，设计提交、处理、成功、失败、重试状态机，结合消息重试、死信队列和数据库唯一键幂等消费，任务最终成功率从 75% 提升至 90% 以上。</p></li>
  <li><span>03</span><p>设计并落地阿里云 OSS 直传方案，图片加载耗时从约 300ms 优化至 120ms，服务器出网带宽占用从 80% 降至 20% 以下。</p></li>
  <li><span>04</span><p>参与生图平台权益发放活动的库存预扣设计，采用 Redisson 原子操作与 Lua 脚本为主、分布式锁为兜底的双层并发控制方案，支撑 400+ 并发压测无超卖。</p></li>
</ul>

</section>

<section id="outcomes" class="experience-detail-section">

## 结果与复盘

<ul class="experience-outcomes"><li><span class="checkmark">✓</span><p>把长耗时任务从同步请求链路中拆出，改善系统吞吐能力。</p></li><li><span class="checkmark">✓</span><p>通过状态机、重试和死信队列组合，让失败任务具备可观测、可恢复的业务状态。</p></li><li><span class="checkmark">✓</span><p>通过对象存储直传和库存并发控制，分别处理文件传输瓶颈和活动超卖风险。</p></li></ul>

</section>

<section id="skills" class="experience-detail-section experience-detail-last">

## 实践中的技能

<div class="experience-skill-list"><span v-for="skill in ['Java', 'RabbitMQ', 'Redis', 'MySQL', 'OSS', '状态机', '幂等消费', '高并发']" :key="skill">{{ skill }}</span></div>

</section>
