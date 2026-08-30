---
title: Java 后端开发实习生
type: experience
experienceType: internship
organization: 厦门乘骋科技有限公司
period: 2025.02 — 2025.10
location: 厦门 / 中国
icon: server-cog
visual: aigc-backend
order: 10
featured: true
summary: 面向 C 端用户和 B 端运营人员建设 AI 生图、视频生成、印花提取与素材交付能力，负责把 Midjourney 等不稳定的外部大模型能力包装成高可用后端服务。最体现后端工程能力的链路有五条：长耗时 AI 任务的异步编排、消息可靠性与三层幂等、状态机统一竞态、OSS 直传去中转、以及高并发权益防超卖四道闸门。
detailLead: 在实习期间承担 AI 应用的后端工程底座设计与开发，把耗时且不稳定的外部 AI 调用收敛成可提交、可追踪、可恢复、可水平扩展的业务系统，并以四道闸门守住权益活动的并发不变量。
business: AI 创作与素材交付
focus: 异步任务编排 · 消息可靠性 · 状态机幂等 · 资源卸载 · 高并发防超卖
evidence: 200+ QPS 提交吞吐 · 终态成功率 75%→92% · 图片 300ms→120ms · 1000+ 并发零超卖
skills:
  - Java
  - Spring Boot
  - RabbitMQ
  - Redis
  - MySQL
  - OSS
  - 高并发
  - 分布式事务
  - 幂等设计
relatedProjects:
  - aigc-print-platform
layout: experience-detail
---

<section id="role" class="experience-detail-section">

## 我的角色

在 AIGC + 印花提取平台中承担**后端工程底座**的设计与开发：不是重新训练模型，而是把 Midjourney 等外部大模型能力接入产品，做成用户能直接提交、运营能批量推进、系统在峰值下不雪崩的高可用服务。我的工作覆盖异步任务编排、消息可靠性治理、状态幂等、文件链路卸载与权益活动高并发控制，是这条 AI 业务链路的稳定性与扩展性支柱。

<div class="experience-facts"><div><span>ROLE</span><strong>后端开发实习生（AI 应用方向）</strong></div><div><span>DOMAIN</span><strong>AI 生图 / 视频生成 / 权益高并发</strong></div><div><span>COLLABORATION</span><strong>前端 · 产品 · 后端 · 外部大模型</strong></div></div>

</section>

<section id="context" class="experience-detail-section">

## 业务背景

平台同时服务 C 端创作用户和 B 端运营人员：用户提交提示词或图片发起生图、印花提取、视频生成；运营需要批量提交、监控状态、处理失败并管理素材交付。一次 AI 调用可能持续几十秒到数分钟，且上游存在排队、限流、超时、回调延迟与结果地址失效。更棘手的是，活动期间海量用户并发领取额度并触发生图，任何一处库存不变量失守都会超卖。

因此后端要解决的不是"能不能调通模型"，而是如何让一条长耗时、强依赖外部、且伴随高并发写竞争的 AI 业务链路，做到**峰值可削峰、失败可恢复、状态可追踪、库存不超发**。这五个问题分别决定了异步编排、消息可靠性、状态机、文件卸载与防超卖的设计形态。

</section>

<section id="business-value" class="experience-detail-section">

## 业务价值

<div class="experience-value-grid"><div><span>对用户</span><strong>提交即返回，进度可观测</strong><p>入口只做校验与受理，AI 任务在后台执行，用户依任务状态查看进度与结果，长耗时外部调用不再占用请求线程，体验从"卡死等待"变为"可预期"。</p></div><div><span>对运营</span><strong>批量任务具备全生命周期可追溯</strong><p>主任务、子任务、投递记录与外部任务身份被串联，失败原因、重试轮次与死信入口可用于定位与重放，而非让运营重复提交或重复消耗额度。</p></div><div><span>对平台</span><strong>峰值不雪崩、库存不超卖</strong><p>RabbitMQ 缓冲层削峰填谷；文件流量经 OSS 直传卸载出应用服务器；权益发放以 Redisson/Lua/数据库/分布式锁四道闸门守住并发不变量，活动高峰期系统稳定且额度精准。</p></div></div>

</section>

<section id="participation" class="experience-detail-section">

## 具体实现

<ul class="experience-detail-list">
  <li><span>01</span><p><strong>长耗时 AI 任务异步编排：提交即返回、峰值不雪崩（核心后端工程能力）。</strong><strong>难点：</strong>生图/视频单次调用几十秒到数分钟，同步接口会被上游排队/限流/超时直接拖垮，C 端高并发提交时入口线程被打满。<strong>解法：</strong>把"提交—执行—回写"拆为独立阶段——接口只做校验并生成稳定任务 ID 落库，经 RabbitMQ <code>Publisher Confirm</code> 投递；消费者按业务类型走独立队列、受控并发、小 <code>prefetch</code> 并对齐上游账号限流动态消费，入口吞吐与上游执行能力彻底解耦。<strong>数据：</strong>任务提交峰值 <strong>200+ QPS</strong>，批量波峰由队列削峰填谷，长耗时外部调用不再占用请求线程。<a class="experience-detail-link" href="../../projects/aigc-print-platform/11-async-task-processing">查看异步任务实现 ↗</a></p></li>
  <li><span>02</span><p><strong>消息可靠性与三层幂等：终态成功率 75%→92%。</strong><strong>难点：</strong>上游限流、网络抖动、提交超时与回调丢失使"至少一次投递"产生重复副作用与悬空任务。<strong>解法：</strong>异常按可恢复/不可恢复/结果未知分类——可恢复进分级延迟重试，不可恢复快速失败，超界进死信并保留完整上下文；再以业务幂等键 + 消息幂等键 + 状态条件更新三道防线，把"至少一次投递"收敛为"业务副作用有效一次"。<strong>数据：</strong>任务终态成功率由 <strong>75% 提升至 92%</strong>，失败任务可解释、可人工重放。<a class="experience-detail-link" href="../../projects/aigc-print-platform/13-reliable-message-processing">查看可靠性实现 ↗</a></p></li>
  <li><span>03</span><p><strong>状态机统一竞态：重复事件不覆盖新状态。</strong><strong>难点：</strong>重复点击、重复消费、迟到回调并发到达，容易把"已成功/已取消"状态被旧事件错误覆盖，造成重复扣费、重复归档。<strong>解法：</strong>将提交、处理中、成功、失败、重试、取消建模为状态机，回调与轮询统一走带版本条件的状态迁移；非法迁移拒绝、重复/迟到事件只记录或跳过，绝不重复扣费、归档或触发后续动作。<strong>数据：</strong>从机制上消除"重复事件覆盖新状态"，状态收敛可追踪、可追溯。<a class="experience-detail-link" href="../../projects/aigc-print-platform/14-state-machine-and-idempotency">查看状态机实现 ↗</a></p></li>
  <li><span>04</span><p><strong>文件链路去中转（OSS 直传）：图片 300ms→120ms、带宽 80%→20%。</strong><strong>难点：</strong>图片与生成结果经应用服务器中转，承担大文件 IO 与出网带宽，加载慢且挤压业务请求资源。<strong>解法：</strong>服务端签发临时凭证 → 客户端直传 OSS → 服务端确认对象真实存在后再绑定业务，大文件 IO 彻底移出应用侧。<strong>数据：</strong>图片加载耗时由约 <strong>300ms 降至 120ms</strong>，应用服务器出网带宽占用由 <strong>80% 降至 20%</strong>。<a class="experience-detail-link" href="../../projects/aigc-print-platform/15-oss-direct-upload">查看 OSS 直传实现 ↗</a></p></li>
  <li><span>05</span><p><strong>高并发权益防超卖（四道闸门）：1000+ 并发零超卖。</strong><strong>难点：</strong>活动期海量用户并发领额度并触发生图，组队名额、活动预算、用户额度、任务冻结额度是多对象库存，任一不变量失守即超卖。<strong>解法：</strong>把额度拆为不同库存对象；以 Redisson 原子计数作快速闸门，Lua 多 key 原子决策守住名额与冻结，数据库条件更新作为持久化边界，唯一业务号与流水防重复发放，分布式锁仅作低频兜底。<strong>数据：</strong>在 <strong>1000+ 并发</strong>压测下验证"名额不超卖、额度不重复发放、失败资源可对账"，活动与 AIGC 消耗解耦为可复用额度模型。<a class="experience-detail-link" href="../../projects/aigc-print-platform/16-benefit-issuance-and-inventory">查看权益链路实现 ↗</a></p></li>
</ul>

</section>

<section id="implementation" class="experience-detail-section">

## 项目文章

<p>项目文档按"问题现象 → 方案取舍 → 失败边界 → 验证口径"展开，下面的文章对应页面中提到的实际实现链路，方便继续查看代码级设计和图文说明。</p>

<div class="experience-project-links"><a href="../../projects/aigc-print-platform/11-async-task-processing"><span>01</span><strong>把耗时 AI 任务改成异步处理</strong><small>RabbitMQ、Publisher Confirm、消费者幂等与结果回写</small></a><a href="../../projects/aigc-print-platform/13-reliable-message-processing"><span>02</span><strong>处理上游失败、重试和死信</strong><small>错误分类、分级延迟重试、人工重放</small></a><a href="../../projects/aigc-print-platform/14-state-machine-and-idempotency"><span>03</span><strong>用状态机统一竞态</strong><small>合法迁移、条件更新、重复消费三道防线</small></a><a href="../../projects/aigc-print-platform/15-oss-direct-upload"><span>04</span><strong>落地 OSS 直传</strong><small>凭证签发、对象确认、预签名访问</small></a><a href="../../projects/aigc-print-platform/16-benefit-issuance-and-inventory"><span>05</span><strong>四道闸门控制防超卖</strong><small>Redisson、Lua、条件更新、分布式锁兜底</small></a><a href="../../projects/aigc-print-platform/17-technical-decisions-and-metrics"><span>06</span><strong>复盘技术取舍与指标口径</strong><small>吞吐、终态成功率、文件耗时与资源边界</small></a></div>

</section>

<section id="collaboration" class="experience-detail-section">

## 协作方式

参与产品需求讨论与接口联调，与前端约定任务状态、异常提示、文件访问与进度展示；与后端共同约定任务 ID、外部任务 ID、错误分类、重试规则与日志链路；在测试阶段通过正常闭环、重复请求、消费者退出、上游超时、回调丢失、OSS 上传失败与高并发库存竞争等场景验证边界。对外部大模型坚持"调用可重试、结果需对账、副作用需幂等"的工程原则，避免把不稳定的模型响应当成业务事实。

</section>

<section id="outcomes" class="experience-detail-section">

## 结果与证据

<ul class="experience-outcomes"><li><span class="experience-outcome-label">异步编排</span><p>异步解耦后任务提交峰值达 200+ QPS，入口流量与上游 AI 执行能力解耦，批量波峰由队列削峰填谷，长耗时调用不再占用请求线程。</p></li><li><span class="experience-outcome-label">消息可靠性</span><p>失败分类 + 分级重试 + 死信收容，三重幂等把"至少一次投递"收敛为"副作用有效一次"，任务终态成功率 75%→92%，失败可解释、可重放。</p></li><li><span class="experience-outcome-label">状态可控</span><p>状态机 + 带版本条件迁移统一竞态，重复点击/重复消费/迟到回调只记录或跳过，不重复扣费、不覆盖新状态。</p></li><li><span class="experience-outcome-label">资源卸载</span><p>OSS 直传将图片加载 300ms→120ms，应用服务器出网带宽 80%→20%，文件流量彻底移出应用侧。</p></li><li><span class="experience-outcome-label">高并发防超卖</span><p>Redisson/Lua/数据库/锁四道闸门在 1000+ 并发压测下守住"名额不超卖、额度不重复发放、失败资源可对账"的不变量。</p></li></ul>

</section>

<section id="skills" class="experience-detail-section experience-detail-last">

## 技术沉淀

<p>从这个 AI 应用后端项目中沉淀的重点不是接入中间件，而是围绕"外部模型不可控 + 高并发写竞争"两大本质，建立任务身份、状态迁移、失败分类、幂等边界、资源隔离与库存不变量——把不可靠的 AI 能力收敛成高可用、可扩展的业务系统。</p>

<div class="experience-skill-list"><span v-for="skill in ['Java', 'Spring Boot', 'RabbitMQ', 'Redis', 'MySQL', 'OSS', '异步任务编排', '状态机', '幂等消费', '延迟重试', '死信队列', '高并发库存', '分布式锁', 'OSS 直传']" :key="skill">{{ skill }}</span></div>

</section>
