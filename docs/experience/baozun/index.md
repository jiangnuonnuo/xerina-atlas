---
title: Java 后端开发实习生
type: experience
experienceType: internship
organization: 宝尊
period: 实习期间
location: 中国
order: 20
featured: true
summary: 参与字段目录平台研发，将分散在业务页面中的菜单、页签、分组、表单字段和表格列沉淀为可审核、可维护、可导出的层级化字段资产。
detailLead: 围绕“页面上看得到、系统里管得住、业务方交付得走”的目标，参与从页面证据采集、受限 Agent 解析到目录治理和字段字典交付的完整链路设计。
business: 企业字段治理与字典交付
focus: 半人工采集 · 层级目录 · 异步导出
evidence: 证据链：页面快照 · 人工审核 · 版本目录 · 可恢复字典
skills:
  - Java
  - Spring Boot
  - MySQL
  - SQLite
  - JavaScript
  - Chrome Extension MV3
  - Agent
  - Apache POI
relatedProjects:
  - baozun-field-platform
layout: experience-detail
---

<section id="role" class="experience-detail-section">

## 我的角色

参与字段目录平台的需求分析、技术方案设计和全栈研发，负责把业务页面中的结构信息转化为后端可以校验、前端可以审核、业务可以继续维护的字段目录资产。我的工作覆盖采集入口、解析中间态、目录写入和字段字典导出，并与业务人员、前端、后端和 Agent 能力协作确认数据边界与接口契约。

<div class="experience-facts"><div><span>ROLE</span><strong>Java 后端开发实习生</strong></div><div><span>DOMAIN</span><strong>字段采集 / 元数据治理 / 字典交付</strong></div><div><span>COLLABORATION</span><strong>业务人员 · 前端 · Agent · 后端</strong></div></div>

</section>

<section id="context" class="experience-detail-section">

## 业务背景

业务系统中的字段定义分散在菜单、页面、页签、区块、表单和表格列中。同一个业务概念可能在不同页面使用不同名称，页面改版后也很难快速确认哪些字段受到影响；当业务方需要字段字典时，往往只能重新打开页面、人工复制并反复核对。

项目的目标不是再做一个静态录入页面，而是建立一条从页面证据到结构化目录、再到可交付字典的治理链路：业务人员负责确定页面状态和采集范围，系统负责保留证据、辅助解析、校验层级、管理版本并生成可追踪的交付物。Agent 可以帮助判断字段语义，但不能绕过后端校验和人工确认直接写入正式目录。

</section>

<section id="business-value" class="experience-detail-section">

## 业务价值

<div class="experience-value-grid"><div><span>对业务人员</span><strong>从逐字段录入变成选区后审核</strong><p>业务人员先界定页面和业务范围，采集器保留当前页面的结构证据，解析结果以草稿形式呈现，人工只需要确认和修订有问题的节点。</p></div><div><span>对研发团队</span><strong>字段目录具备来源、层级和版本</strong><p>目录节点不再只是孤立名称，而是可以回溯来源证据、查询祖先路径、识别版本冲突并安全执行子树变更的结构化资产。</p></div><div><span>对下游使用方</span><strong>字段字典成为可复现的交付物</strong><p>导出从在线写入链路中独立出来，使用一致性快照生成阶段文件和 XLSX；任务状态、校验信息与失败恢复边界都可以被查询。</p></div></div>

</section>

<section id="participation" class="experience-detail-section">

## 具体实现

<ul class="experience-detail-list">
  <li><span>01</span><p><strong>半人工字段采集：</strong>针对业务页面动态渲染、组件层级复杂且全量自动浏览容易采集到无关内容的问题，采用“业务人员定范围、采集器提供证据、Agent 判断语义”的协作方式；定制 DOM-SCOUT 支持多选区高亮、父子导航、结构摘要、敏感值清洗和页面状态指纹，统一输出可追踪的 <code>DomSnapshot</code>，让后续解析与人工审核建立在同一份页面事实之上。<a class="experience-detail-link" href="/projects/baozun-field-platform/10-dom-field-capture">查看页面采集实现 ↗</a></p></li>
  <li><span>02</span><p><strong>受限解析与人工审核：</strong>针对固定模板难以覆盖不同组件库、全量模型又容易受到页面噪声和上下文成本影响的问题，将清洗后的结构证据交给受限 Agent 生成候选层级，再由后端编译为可编辑草稿；通过父级存在、唯一父级、无环、类型和来源证据校验，把“模型建议”与“正式目录事实”隔离，业务人员确认后才允许进入目录写入。<a class="experience-detail-link" href="/projects/baozun-field-platform/20-agent-hierarchy-parsing">查看解析与审核实现 ↗</a></p></li>
  <li><span>03</span><p><strong>闭包表目录治理：</strong>针对目录既要支持按层查询，又要支持祖先路径和子树移动的问题，采用邻接表保存直接父级关系，并用闭包表维护祖先—后代路径；在事务内结合节点版本、平台树版本、CAS、稳定锁序和锁后复查，处理新增、批量录入、改名、子树移动、删除恢复等变更，避免并发操作产生断链、环路或跨版本覆盖。<a class="experience-detail-link" href="/projects/baozun-field-platform/30-platform-field-structure-management">查看闭包表治理实现 ↗</a></p></li>
  <li><span>04</span><p><strong>字段治理工作台：</strong>参与目录树懒加载、游标分页、批量录入、拖拽意图、草稿差异审核和任务状态展示的链路设计；前端提交带基线版本的目录命令，后端根据当前事实做最终校验，冲突时返回可恢复的版本错误而不是静默覆盖，并通过 SSE 推送解析和导出阶段，帮助使用者区分“还在处理”和“已经失败”。<a class="experience-detail-link" href="/projects/baozun-field-platform/25-full-stack-workbench">查看工作台实现 ↗</a></p></li>
  <li><span>05</span><p><strong>异步字段字典导出：</strong>针对大批量导出会占用 HTTP 线程、数据库连接和 JVM 内存的问题，将任务登记、MySQL 一致性快照、SQLite 阶段工作区、DFS 路径展开和 Apache POI SXSSF 流式写入拆开；通过任务幂等、阶段 manifest、失败重试、行数与 SHA-256 校验及临时文件原子提交，使导出可以从已完成阶段恢复，也不会阻塞采集和目录写入。<a class="experience-detail-link" href="/projects/baozun-field-platform/40-field-dictionary-data-delivery">查看异步导出实现 ↗</a></p></li>
</ul>

</section>

<section id="implementation" class="experience-detail-section">

## 项目文章

<p>项目文档围绕真实业务问题展开，按照“问题定位 → 方案取舍 → 数据契约 → 异常边界 → 验证方式”组织，页面中的每个关键实现都可以继续进入对应文章查看图文和交互流程。</p>

<div class="experience-project-links"><a href="/projects/baozun-field-platform/10-dom-field-capture"><span>01</span><strong>从页面证据开始采集字段</strong><small>人工定界、DOM-SCOUT、清洗、脱敏和快照契约</small></a><a href="/projects/baozun-field-platform/20-agent-hierarchy-parsing"><span>02</span><strong>把证据解析成可审核字段树</strong><small>受限 Agent、后端编译、校验反馈和人工确认</small></a><a href="/projects/baozun-field-platform/30-platform-field-structure-management"><span>03</span><strong>用闭包表治理层级目录</strong><small>祖先路径、子树变更、版本控制和并发一致性</small></a><a href="/projects/baozun-field-platform/40-field-dictionary-data-delivery"><span>04</span><strong>把目录异步交付为字段字典</strong><small>一致性快照、SQLite 阶段、DFS 展开和流式 XLSX</small></a><a href="/projects/baozun-field-platform/01-platform-catalog-architecture"><span>05</span><strong>阅读完整项目架构</strong><small>从页面采集到目录治理和字典交付的端到端闭环</small></a></div>

</section>

<section id="collaboration" class="experience-detail-section">

## 协作方式

与业务人员确认页面状态、采集范围和字段语义；与前端约定目录树、草稿差异、SSE 事件、任务状态和安全下载等接口契约；与后端共同确认目录版本、并发冲突、导出恢复、文件校验和异常返回边界。对 Agent 输出坚持“建议可生成、事实需校验、正式写入需确认”的协作原则，避免把模型结果直接当成业务数据。

</section>

<section id="outcomes" class="experience-detail-section">

## 结果与证据

<ul class="experience-outcomes"><li><span class="experience-outcome-label">业务链路</span><p>把人工选区、结构清洗、语义解析、人工审核、正式目录和字段字典交付串成一条可追踪链路，页面字段具备来源证据和后续治理入口。</p></li><li><span class="experience-outcome-label">数据治理</span><p>通过邻接表与闭包表同时保留直接父级和祖先路径，目录查询、子树移动、删除恢复和版本冲突都有明确的数据不变量与事务边界。</p></li><li><span class="experience-outcome-label">工程交付</span><p>通过一致性快照、阶段文件、流式写入和原子发布拆分导出资源占用，失败时可以重试或复用已完成阶段，避免浏览器刷新抹掉任务状态。</p></li><li><span class="experience-outcome-label">证据边界</span><p>当前项目材料主要证明技术方案、数据契约和恢复边界；未补充具体页面数、字段数、目录节点数和单次导出行数，因此页面不虚构规模指标。</p></li></ul>

</section>

<section id="skills" class="experience-detail-section experience-detail-last">

## 技术沉淀

<p>这个项目沉淀的是面向不稳定输入构建可信数据资产的方法：先保留证据，再约束解析；先建立目录不变量，再开放变更；先生成一致性阶段产物，再完成可校验交付。</p>

<div class="experience-skill-list"><span v-for="skill in ['Java', 'Spring Boot', 'MySQL', 'SQLite', 'JavaScript', 'Chrome Extension MV3', '受限 Agent', 'SSE', '邻接表', '闭包表', 'CAS', '异步任务', 'Apache POI']" :key="skill">{{ skill }}</span></div>

</section>
