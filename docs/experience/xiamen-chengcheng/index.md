---
title: Java 后端开发
type: experience
experienceType: internship
organization: 厦门乘骋科技有限公司
period: 2025.02 — 2025.10
location: 厦门 / 中国
order: 10
featured: true
summary: 面向 C 端用户和 B 端运营人员建设 AI 生图、视频生成、印花提取与素材交付能力，参与后端异步链路、消息可靠性和权益活动研发。
detailLead: 在实习期间承担后端功能设计、开发和联调，将耗时且不稳定的外部 AI 能力接入可追踪、可恢复的业务流程，并持续处理文件传输、额度消耗和高并发活动中的工程边界。
business: AI 创作与素材交付
focus: 后端链路设计 · 异步任务 · 可靠性治理
evidence: 项目记录：50+ QPS · 75% → 90%+ · 400+ 并发
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

在 AIGC + 印花提取平台中承担后端功能的设计、开发、接口联调和问题排查，参与从需求讨论到测试验证的完整交付过程。我的工作重点不是重新实现模型，而是把 Midjourney 等外部能力接入产品链路，让用户可以提交任务、观察进度、获取结果，运营人员可以批量推进任务并处理异常。

<div class="experience-facts"><div><span>ROLE</span><strong>Java 后端开发</strong></div><div><span>DOMAIN</span><strong>AIGC 生图 / 视频生成 / 权益活动</strong></div><div><span>COLLABORATION</span><strong>前端 · 产品 · 后端 · 外部服务</strong></div></div>

</section>

<section id="context" class="experience-detail-section">

## 业务背景

平台同时服务 C 端创作用户和 B 端运营人员：用户提交提示词或图片素材，发起生图、印花提取、场景合成和视频生成任务；运营人员需要批量提交、查看任务状态、处理失败结果并管理素材交付。一次 AI 调用可能持续几十秒到几分钟，上游还会出现排队、限流、超时、回调延迟和结果地址失效等情况。

因此，后端要解决的不是单个接口能否调用成功，而是如何让一次业务任务从受理、排队、执行、失败恢复到结果交付都能被追踪；同时还要避免大文件占用应用服务器、重复消息造成重复任务，以及权益活动在并发请求下出现超发或库存不一致。

</section>

<section id="business-value" class="experience-detail-section">

## 业务价值

<div class="experience-value-grid"><div><span>对用户</span><strong>提交后不必长时间等待接口</strong><p>入口只负责校验和受理，任务在后台执行，用户可以根据任务状态查看进度和结果，长耗时的外部调用不再直接占用请求线程。</p></div><div><span>对运营</span><strong>批量任务具备可追踪的处理状态</strong><p>主任务、子任务、投递记录和外部任务身份被串联起来，失败原因、重试轮次和死信入口可用于定位和恢复，而不是让运营人员重复提交。</p></div><div><span>对平台</span><strong>把文件和权益风险隔离在明确边界内</strong><p>素材通过 OSS 直传，服务端保留鉴权和元数据；权益发放通过原子预扣、幂等记录和补偿路径控制并发副作用。</p></div></div>

</section>

<section id="participation" class="experience-detail-section">

## 具体实现

<ul class="experience-detail-list">
  <li><span>01</span><p><strong>异步任务编排：</strong>针对 AI 生图和视频生成耗时长、同步接口容易被上游拖住的问题，将任务提交拆成校验、落库、消息投递、消费者执行和结果回写几个阶段；使用 RabbitMQ 作为缓冲层，按任务类型控制消费者并发、prefetch 和上游账号额度，使入口流量与外部执行能力解耦，项目记录的峰值处理能力达到 50+ QPS。<a class="experience-detail-link" href="/projects/aigc-print-platform/11-async-task-processing">查看异步任务实现 ↗</a></p></li>
  <li><span>02</span><p><strong>消息可靠性治理：</strong>针对上游限流、网络抖动、提交超时和回调丢失等问题，将异常区分为可恢复、不可恢复和结果未知三类；可恢复错误进入延迟重试，不可恢复错误快速失败，超过边界的消息进入死信并保留上下文，同时沿用稳定任务 ID 和业务幂等键，避免重试变成重复创建，项目记录的终态成功率由 75% 提升至 90% 以上。<a class="experience-detail-link" href="/projects/aigc-print-platform/13-reliable-message-processing">查看可靠性实现 ↗</a></p></li>
  <li><span>03</span><p><strong>状态与幂等控制：</strong>把提交、处理中、成功、失败、重试和取消定义为能指导下一步动作的状态，统一处理回调与轮询的竞态；通过业务键、消息键和条件更新限制重复副作用，重复点击、重复消费和迟到回调只能记录或跳过，不能重复扣费、归档或触发后续动作。<a class="experience-detail-link" href="/projects/aigc-print-platform/14-state-machine-and-idempotency">查看状态机实现 ↗</a></p></li>
  <li><span>04</span><p><strong>文件链路改造：</strong>针对图片和生成结果经过应用服务器中转造成的带宽与加载压力，设计服务端签发临时凭证、客户端直传 OSS、服务端确认对象和短时预签名访问的链路；在保留用户权限、对象大小、类型和归属校验的前提下，图片加载耗时由约 300ms 降至 120ms，应用服务器出网带宽占用由 80% 降至 20% 以下。<a class="experience-detail-link" href="/projects/aigc-print-platform/15-oss-direct-upload">查看 OSS 直传实现 ↗</a></p></li>
  <li><span>05</span><p><strong>权益活动并发控制：</strong>参与邀请组队和 AIGC 额度发放链路设计，将团队名额、用户额度和任务冻结额度拆成不同库存对象；使用 Redis 原子操作与 Lua 脚本作为快速闸门，数据库条件更新作为最终事实，配合分布式锁兜底、幂等流水和超时回补，支撑 400+ 并发压测无超卖。<a class="experience-detail-link" href="/projects/aigc-print-platform/16-benefit-issuance-and-inventory">查看权益链路实现 ↗</a></p></li>
</ul>

</section>

<section id="implementation" class="experience-detail-section">

## 项目文章

<p>项目文档按“问题现象 → 方案取舍 → 失败边界 → 验证口径”展开，下面的文章对应页面中提到的实际实现链路，方便继续查看代码级设计和图文说明。</p>

<div class="experience-project-links"><a href="/projects/aigc-print-platform/11-async-task-processing"><span>01</span><strong>把耗时任务改成异步处理</strong><small>RabbitMQ、消费者并发、任务身份和结果回写</small></a><a href="/projects/aigc-print-platform/13-reliable-message-processing"><span>02</span><strong>处理上游失败、重试和死信</strong><small>错误分类、延迟重试、Publisher Confirm 和人工重放</small></a><a href="/projects/aigc-print-platform/15-oss-direct-upload"><span>03</span><strong>落地 OSS 直传</strong><small>凭证签发、对象确认、权限关系和预签名访问</small></a><a href="/projects/aigc-print-platform/16-benefit-issuance-and-inventory"><span>04</span><strong>控制权益发放和额度消耗</strong><small>库存预扣、幂等发放、补偿回补和防超卖</small></a><a href="/projects/aigc-print-platform/17-technical-decisions-and-metrics"><span>05</span><strong>复盘技术取舍与指标口径</strong><small>吞吐、终态成功率、文件耗时和资源边界</small></a></div>

</section>

<section id="collaboration" class="experience-detail-section">

## 协作方式

参与产品需求讨论和接口联调，与前端确认任务状态、异常提示、文件访问和进度展示；与后端共同约定任务 ID、外部任务 ID、错误分类、重试规则和日志链路；在测试阶段通过正常闭环、重复请求、消费者退出、上游超时、回调丢失、OSS 上传失败和高并发库存竞争等场景验证边界。

</section>

<section id="outcomes" class="experience-detail-section">

## 结果与证据

<ul class="experience-outcomes"><li><span class="experience-outcome-label">指标</span><p>项目材料记录了 50+ QPS 峰值处理能力、任务终态成功率由 75% 提升至 90% 以上、图片加载耗时由约 300ms 降至 120ms，以及 400+ 并发压测无超卖。</p></li><li><span class="experience-outcome-label">链路</span><p>任务提交、消息投递、上游调用、状态收敛、文件归档和权益消耗均保留明确的业务身份与失败路径，问题可以沿任务 ID 继续排查。</p></li><li><span class="experience-outcome-label">边界</span><p>页面中的性能和成功率沿用项目材料中的记录；正式对外使用时仍应补充统计窗口、任务类型、并发配置、图片大小和成功终态定义，避免把不同口径的结果混在一起。</p></li></ul>

</section>

<section id="skills" class="experience-detail-section experience-detail-last">

## 技术沉淀

<p>从这个项目中沉淀的重点不是简单接入中间件，而是围绕长链路业务建立任务身份、状态迁移、失败分类、幂等边界和资源隔离。</p>

<div class="experience-skill-list"><span v-for="skill in ['Java', 'RabbitMQ', 'Redis', 'MySQL', 'OSS', '异步任务', '状态机', '幂等消费', '延迟重试', '死信队列', '高并发库存']" :key="skill">{{ skill }}</span></div>

</section>
