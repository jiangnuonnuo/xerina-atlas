---
title: AI 应用开发实习生（表格处理工作流 Skills 定制）
type: experience
experienceType: internship
organization: 宝尊
period: 2026.06 — 2026.09
location: 中国
icon: file-spreadsheet
visual: spreadsheet-skills
order: 21
featured: true
summary: 依据业务人员提供的固定 SOP，将跨系统"表格流转"任务——从源系统下载文件表格、对大表格执行固定的清洗/计算/校验工作流、再把结果回写目标系统——按需定制为可复用的 Skills，累计定制 6 个、合计对接数十个内部/外部源系统、覆盖数百种表格类型，并通过飞书机器人与企业内置 IM 机器人交付业务人员自助使用，把单任务处理时长从小时级压缩到 10 分钟以内。
detailLead: 围绕"业务人员给 SOP、我把它变成可自助触发的 Skill"的思路，把分散在数十个系统间的一次性人工表格操作，逐个按业务场景定制为独立 Skill（非一个 Skill 通吃），并把入口收敛到企业已有的 IM 里，降低门槛、释放研发排期。
business: 跨系统表格流转的 Skills 定制（业务给 SOP → 下载 → 大表格处理 → 回写）
focus: 定制化 Skill 编排 · 大表格固定处理工作流 · 异构系统对接(数十个源) · 飞书与企业 IM 集成
evidence: 按 SOP 定制 6 个 Skill(合计对接数十个系统/数百种表格类型) · 大表格批处理工作流 · 异构源系统下载/目标系统回写 · 飞书/企业机器人入口
skills:
  - Java
  - 定制化 Skill 编排
  - 大表格批处理
  - 文件解析
  - 异构系统对接(下载 · 回写)
  - 飞书机器人
  - 企业 IM 集成
  - 业务自助工作流
layout: experience-detail
---

<section id="role" class="experience-detail-section">

## 我的角色

负责把企业**跨系统的固定表格处理工作流**按业务需求**定制为独立的 Skills**，并接入**飞书机器人与企业内置 IM 机器人**，让业务人员无需研发排期即可自助完成"从源系统下载表格 → 大表格固定处理 → 结果回写目标系统"的完整链路。我的做法是：业务人员提供固定 SOP，我据此把每类流程定制为一个独立、可复用的 Skill（**不是单个 Skill 通吃，而是每类流程一个定制 Skill**），累计定制 6 个；6 个 Skill 合计对接数十个内部/外部源系统、覆盖数百种表格类型。我主导了 SOP 抽象、Skill 能力封装与 IM 入口对接。

<div class="experience-facts"><div><span>ROLE</span><strong>AI 应用开发实习生</strong></div><div><span>DOMAIN</span><strong>表格工作流 Skills 定制 / 业务自助 / 企业 IM 集成</strong></div><div><span>COLLABORATION</span><strong>业务人员(提供 SOP) · 研发 · 飞书/IM 平台 · 各类内部/外部源系统</strong></div></div>

</section>

<section id="context" class="experience-detail-section">

## 业务背景

业务人员日常需在**数十个内部系统与外部业务平台**间按固定 SOP 处理"表格流转"任务：从源系统（内部产品数据中心、外部主流电商商家后台等，因保密不逐一列名）**下载文件表格**，对**大表格**执行固定的清洗 / 计算 / 校验工作流，再把结果表**回写目标系统**。这类表格类型多达**数百种**，原方式依赖人工逐表操作，存在三类痛点：**（1）单任务平均耗时小时级**，表格越大、系统越多越慢；**（2）人工易错、且每次都要研发排期支持**，研发被重复流程拖住；**（3）流程不沉淀、不可复用、不可审计**，换个业务方又得重来。关键约束是——这些是**不同业务方的不同固定 SOP**，不能靠一个通用 Skill 覆盖，必须**按业务提供的 SOP 逐个定制化**。（注：具体客户与平台名称因保密不披露。）

</section>

<section id="business-value" class="experience-detail-section">

## 业务价值

<div class="experience-value-grid"><div><span>对业务人员</span><strong>从"找研发排期"变成"对话/表单即可跑"</strong><p>业务人员把固定表格流程的 SOP 交给我，我据此定制出独立 Skill；之后业务人员通过飞书/企业机器人用自然语言或表单触发，不用懂开发、不用等排期，自己就能把"下载 → 处理 → 回写"跑完。6 个定制 Skill 已覆盖对接数十个系统、数百种表格类型的高频场景。</p></div><div><span>对研发团队</span><strong>从"每次重复造流程"转为"按 SOP 定制 Skill 供复用"</strong><p>流程被抽象为可复用 Skill 后，同类需求不再逐个排期，新业务方接入只需给 SOP、配置一次；研发从重复劳动中释放，形成可横向扩展的 Skill 资产。</p></div><div><span>对企业</span><strong>流程可复用、可审计、提效显著</strong><p>平均单任务处理时长从小时级压缩到 10 分钟以内；每个 Skill 对应一份明确的 SOP 契约，具备版本与复用能力，业务提效与研发减负双赢。</p></div></div>

</section>

<section id="participation" class="experience-detail-section">

## 具体实现

<ul class="experience-detail-list">
  <li><span>01</span><p><strong>按业务 SOP 定制 Skills：把一类固定表格流程变成一个独立、可复用的 Skill。</strong>业务人员提供固定 SOP，我据此把"下载表格 → 大表格固定处理工作流 → 回写目标系统"定制为一个独立 Skill，为每个场景定义清晰的输入/输出契约——源系统、处理规则（字段映射 / 清洗 / 计算 / 校验）、目标系统与写入方式，使 Skill 可独立调用、可审计。<strong>按此方式累计定制 6 个 Skills</strong>；这 6 个 Skill <strong>合计对接数十个内部/外部源系统、覆盖数百种表格类型</strong>。强调：不是一个 Skill 通吃，而是每类业务 SOP 对应一个定制 Skill，契合"不同业务方不同固定流程"的真实约束。<strong>效果：固定表格流程从一次性人工操作沉淀为可复用、可审计的 Skill 资产。</strong></p></li>
  <li><span>02</span><p><strong>大表格固定处理工作流：把"人肉逐表处理"变成"规则化批处理"。</strong>对从源系统下载的**大表格**执行固定的解析、字段映射、清洗、计算与校验工作流，产出结构化结果表；固定规则保证结果一致、可追溯，避免人工在处理大表时漏行、错算。<strong>效果：大表格处理由人工逐表操作转为确定性工作流，错误率显著下降、处理时长大幅缩短。</strong></p></li>
  <li><span>03</span><p><strong>异构系统对接 + 飞书/企业机器人集成：把入口收敛到业务人员已有的 IM。</strong>后端负责从各类源系统**下载文件表格**、把结果表**回写目标系统**；以<strong>飞书机器人 + 企业内部 IM 机器人</strong>为统一触发入口，业务人员通过对话或表单提交任务即可调用对应 Skill，后端完成鉴权、任务编排、状态回传与结果推送，业务人员全程在 IM 内完成，无需切换系统、无需开发。<strong>效果：使用门槛降到"会聊天/填表即可"，业务自助率显著提升。</strong></p></li>
  <li><span>04</span><p><strong>提效结果（业务价值闭环）。</strong>把原本小时级的人工表格流程通过"按 SOP 定制 Skill + IM 入口"交付后，<strong>平均单任务处理时长由小时级缩短至 10 分钟以内</strong>；研发从"每次排期做流程"转为"按 SOP 维护可复用 Skill"，业务侧可自助完成，形成提效与复用双赢。（具体对接的系统与平台名因保密不披露。）</p></li>
</ul>

</section>

<section id="implementation" class="experience-detail-section">

## 项目文章

<p>该工作暂无独立项目文章，核心能力（按 SOP 定制 Skill、异构系统对接、大表格处理工作流、IM 集成）可在对话与简历中展开；如需补充文章可后续沉淀。</p>

</section>

<section id="collaboration" class="experience-detail-section">

## 协作方式

与业务人员确认固定表格流程的步骤、输入字段、处理规则与目标系统，把口头 SOP 转成 Skill 契约（每类流程一个定制 Skill）；与研发对齐 Skill 复用方式与鉴权；与各源系统 / 目标系统对接下载与上传接口；与飞书/企业 IM 平台对接入口、鉴权与消息回传。坚持"流程可复用、调用可审计、结果可核对"的协作原则，避免 Skill 变成黑盒。

</section>

<section id="outcomes" class="experience-detail-section">

## 结果与证据

<ul class="experience-outcomes"><li><span class="experience-outcome-label">提效</span><p>平均单任务处理时长由<strong>小时级缩短至 10 分钟以内</strong>；业务人员通过飞书/企业机器人自助触发"下载 → 大表格处理 → 回写"，免去研发排期。</p></li><li><span class="experience-outcome-label">规模</span><p>按业务 SOP <strong>累计定制 6 个 Skills</strong>，合计<strong>对接数十个内部/外部源系统、覆盖数百种表格类型</strong>；每类固定流程对应一个定制 Skill，非单 Skill 通吃，证明工程化能力能按业务横向扩展。</p></li><li><span class="experience-outcome-label">表格工作流</span><p>大表格的固定清洗/计算/校验工作流把人工逐表操作收敛为确定性批处理，结果一致可追溯，减少漏行、错算。</p></li></ul>

</section>

<section id="skills" class="experience-detail-section experience-detail-last">

## 技术沉淀

<p>这段工作沉淀的是"按业务 SOP 把企业跨系统固定流程工程化为可复用 Skill"的方法：先吃透业务给的固定 SOP，把它定制为独立、可审计的 Skill（每类流程一个，而非一个通用 Skill 包打天下），再用固定工作流把大表格处理收敛为确定性批处理，最后把入口收敛到业务人员已有的 IM。6 个定制 Skill 合计对接数十个异构系统、覆盖数百种表格类型，证明这种"业务给 SOP、我定制 Skill"的模式能规模化复用，而非逐个排期。一句话——AI 应用落地的关键不是模型多强，而是能不能把业务的固定流程低成本、零门槛地变成业务人员自己就能用的能力。</p>

<div class="experience-skill-list"><span v-for="skill in ['Java', '定制化 Skill 编排', '大表格批处理', '文件解析', '异构系统对接(下载·回写)', '飞书机器人', '企业 IM 集成', '业务自助工作流']" :key="skill">{{ skill }}</span></div>

</section>
