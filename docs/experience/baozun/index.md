---
title: AI 应用开发实习生
type: experience
experienceType: internship
organization: 宝尊
period: 2026.06 — 2026.09
location: 中国
icon: scan-search
visual: field-intelligence
cardImage: /media/experience/field-intelligence-cover.webp
order: 20
featured: true
summary: 参与Lexicon · AI 字段词典平台的 AI 应用研发，把分散在业务页面里的菜单、页签、表单与表格列沉淀为可审核、可维护、可导出的层级化字段资产。最体现价值的链路有三条：把"全量 Agent 自动抓"演进为"人工定界 + 插件采集 + Agent 解析"的半智能化采集范式；设计读写分离、流式落盘的异步 XLSX 导出；以及用邻接表 + 闭包表 + 版本 CAS 解决目录入库的防重与并发子节点问题。
detailLead: 围绕"页面上看得到、系统里管得住、业务方交付得走"的目标，参与从页面证据采集、Agent 受限解析、目录治理到字段字典交付的完整链路，核心是用工程手段把不稳定的页面与模型能力收敛成可信、可控、可复现的业务结果。
business: 字段治理与 AI 辅助字典交付
focus: 采集范式演进 · 读写分离导出 · 高并发目录治理
evidence: 半智能采集(DOM-SCOUT) · 一致性快照+SXSSF 流式导出 · 邻接表+闭包表+CAS 并发控制
skills:
  - Java
  - Spring Boot
  - MySQL
  - SQLite
  - JavaScript
  - Chrome Extension MV3
  - 多 Agent 编排
  - LLM 应用
  - Prompt 工程
  - SSE
  - 邻接表
  - 闭包表
  - CAS
  - 读写分离
  - Apache POI
relatedProjects:
  - baozun-lexicon
layout: experience-detail
---

<section id="role" class="experience-detail-section">

## 我的角色

参与Lexicon · AI 字段词典平台的 **AI 应用研发**，负责把业务页面中的结构信息转化为后端可校验、前端可审核、业务可维护的字段目录资产。我主导解决了三条最关键链路：**采集范式演进（让抓取可控、便宜、准）、百万级字段字典的异步导出（内存不爆、不阻塞业务）、以及目录入库的防重与并发子节点处理（不丢更新、不重复、不断链）**。

<div class="experience-facts"><div><span>ROLE</span><strong>AI 应用开发实习生</strong></div><div><span>DOMAIN</span><strong>字段采集 / 元数据治理 / 字典交付</strong></div><div><span>COLLABORATION</span><strong>业务人员 · 前端 · Agent · 后端</strong></div></div>

</section>

<section id="context" class="experience-detail-section">

## 业务背景

业务系统的字段定义散落在菜单、页签、区块、表单与表格列中：同一概念在不同页面叫不同名字，页面改版后难以确认哪些字段受影响，业务方要字典只能重新打开页面人工复制核对。项目目标不是做一个静态录入框，而是建立一条"页面证据 → 结构化目录 → 可交付字典"的 AI 辅助治理链路。

最关键的三类工程问题是：**（1）页面难抓、模型不可信、token 贵**；**（2）字典体量达百万级字段，同步导出会拖垮服务**；**（3）目录是长期维护的树，并发写入会产生重复、断链与丢更新**。这三条分别决定了采集范式、导出架构与入库设计的形态。

</section>

<section id="business-value" class="experience-detail-section">

## 业务价值

<div class="experience-value-grid"><div><span>对业务人员</span><strong>从逐字段录入变成选区后审核</strong><p>业务人员只界定页面与业务范围，采集器保留当前页面的结构证据，Agent 解析结果以草稿形式呈现，人工只需确认和修订有问题的节点，把 AI 产出变成可审阅的输入，显著降低采集成本与错误率。</p></div><div><span>对研发团队</span><strong>百万字段导出不再阻塞服务</strong><p>导出与实时采集、目录写入彻底解耦：导出只在 MySQL 上建立一致性只读快照，不持目录写锁；流式落盘让 JVM 内存恒定，50 万字段导出期间业务照常运行，服务内存平稳。</p></div><div><span>对下游使用方</span><strong>字段目录具备来源、层级与版本</strong><p>目录节点不再是孤立名称，而是可回溯来源证据、查询祖先路径、识别版本冲突并安全执行子树变更的结构化资产；并发写入有确定性不变量兜底，字典成为可复现的交付物。</p></div></div>

</section>

<section id="participation" class="experience-detail-section">

## 具体实现

<ul class="experience-detail-list">
  <li><span>01</span><p><strong>采集范式演进：从"全量 Agent 自动抓"到"人工定界 + 插件采集 + Agent 解析"（核心 AI 应用能力）。</strong>早期方案让 Agent 用 Playwright 驱动浏览器自动遍历业务页面抓字段，但实际暴露三大难点：①页面登录态/状态/权限复杂，React/Vue 动态 DOM、虚拟列表、Shadow DOM、跨域 iframe 导致<strong>抓取不全、抓取不准</strong>；②每次把整页 HTML 喂给模型，<strong>token 额度消耗极大</strong>；③模型自由发挥，结果<strong>不可控</strong>。我将采集重构为"人定范围、插件定结构、Agent 定语义"的半智能化范式：业务人员只选区（他清楚要采"退款信息"还是"物流信息"），在开源 DOM-SCOUT 基础上定制内部版插件，自动把选区清洗成简化父子结构、<strong>掩码输入框真实值</strong>、压缩组件库包装层、生成可回指的 <code>sourceNodeId</code>，再交给 Evidence / Hierarchy / Field Semantics / Reflection 角色化 Agent 判业务层级，人工预览核对层级结构后入库。<strong>效果：单页 DOM 输入体积从 18.2KB 压缩到 3.3KB（约 82%），Agent 上下文统一、LLM token 大幅下降；敏感值不出浏览器（合规）；结果可控、正确率高、额度消耗少。</strong><a class="experience-detail-link" href="../../projects/baozun-lexicon/10-dom-field-capture">查看页面采集实现 ↗</a><a class="experience-detail-link" href="../../projects/baozun-lexicon/20-agent-hierarchy-parsing">查看 Agent 编排实现 ↗</a></p></li>
  <li><span>02</span><p><strong>读写分离 + 异步导出：百万字段内存不爆、50 万行 35s 交付。</strong>字段字典需导出为 XLSX 供下游使用，但目录含百万级字段（树形），若在大查询里同步拼装会导致 HTTP 线程阻塞、JDBC/JVM 内存爆、导出时锁住目录写、与实时采集互相拖累。我设计了<strong>读写分离的分阶段可恢复导出管线</strong>：①MySQL 仅承担 <code>REPEATABLE READ</code> 一致性只读快照（forward-only cursor + <code>fetchSize=1000</code>），<strong>完全不持目录写锁</strong>，与采集/目录写入并行互不阻塞；②快照落到本地 SQLite 阶段工作区，用递归 CTE 计算树传递闭包 + <code>tree_path</code> 排序得到 DFS 前序流，JVM 仅用 <strong>O(depth) 的 Deque 维护当前祖先路径</strong>，叶节点即时落盘为 <code>.bin</code>，空间复杂度与节点总数无关；③Apache POI <code>SXSSF</code> 流式写 XLSX（<strong>内存窗口恒定 100 行</strong>），最后 <code>.part</code> 原子提交。配合任务状态机、幂等键、指数退避重试与行数/SHA-256 校验，失败可从已完成阶段恢复。<strong>真实数据：50 万字段字典导出耗时 35s；连接池（Hikari 上限 12、最小空闲 4）与本地处理信号量（1）受控，服务内存平稳、业务不中断。</strong><a class="experience-detail-link" href="../../projects/baozun-lexicon/40-field-dictionary-data-delivery">查看异步导出实现 ↗</a></p></li>
  <li><span>03</span><p><strong>入库设计：防重与并发子节点处理（不丢更新、不重复、不断链）。</strong>目录是长期维护的树，必须保证同父同名不重复、并发新增/改名/移动同一节点子树不产生断链、环路或覆盖。我的设计：①<strong>防重双层</strong>——应用层先读名称冲突预检，数据库用存储生成列 <code>unique_parent_id/unique_name</code> 建唯一索引做并发竞态最后防线，逻辑删除时生成列置 NULL 自动释放同名，冲突转 <code>409 DUPLICATE_SIBLING_NAME</code>；②<strong>并发子节点</strong>——新增/改名只锁"父节点行 + 同级排序尾行 <code>FOR UPDATE</code> + 版本号 CAS（<code>expectedVersion</code>）"，保证后写不覆盖先写、自动追加顺序稳定，<strong>不同节点可并行</strong>，不把整张表/整个平台锁死；③<strong>移动子树</strong>用"子树 + 新父级"按 ID 升序锁 + 锁后闭包集合复查 + 有限重试，把死锁概率降到可控；④树结构用<strong>邻接表（直接父级事实）+ 闭包表（祖先/子树 O(1) 查层级）</strong>双表，逻辑删除保留闭包支持恢复，任意结构变更在事务末尾递增 <code>tree_version</code>，前端凭版本失效刷新。<strong>可压测复现：同节点并发修改"一个成功、一个 409 NODE_VERSION_CONFLICT"；同级同名"一个成功、一个 409 DUPLICATE_SIBLING_NAME"；深度上限 64、单批 ≤100 节点、写事务 10s 超时。</strong><a class="experience-detail-link" href="../../projects/baozun-lexicon/30-platform-field-structure-management">查看闭包表治理实现 ↗</a></p></li>
</ul>

</section>

<section id="implementation" class="experience-detail-section">

## 项目文章

<p>项目文档围绕真实业务问题展开，按照"问题定位 → 方案取舍 → 数据契约 → 异常边界 → 验证方式"组织，页面中的每个关键实现都可以继续进入对应文章查看图文和交互流程。</p>

<div class="experience-project-links"><a href="../../projects/baozun-lexicon/10-dom-field-capture"><span>01</span><strong>从页面证据开始采集字段</strong><small>人工定界、DOM-SCOUT、清洗、脱敏和快照契约</small></a><a href="../../projects/baozun-lexicon/20-agent-hierarchy-parsing"><span>02</span><strong>多 Agent 把证据解析成可审核字段树</strong><small>受限编排、后端编译、校验门与人工确认</small></a><a href="../../projects/baozun-lexicon/30-platform-field-structure-management"><span>03</span><strong>用闭包表治理层级目录</strong><small>祖先路径、子树变更、版本控制和并发一致性</small></a><a href="../../projects/baozun-lexicon/40-field-dictionary-data-delivery"><span>04</span><strong>把目录异步交付为字段字典</strong><small>一致性快照、SQLite 阶段、DFS 展开和流式 XLSX</small></a><a href="../../projects/baozun-lexicon/01-platform-catalog-architecture"><span>05</span><strong>阅读完整项目架构</strong><small>从页面采集到目录治理和字典交付的端到端闭环</small></a></div>

</section>

<section id="collaboration" class="experience-detail-section">

## 协作方式

与业务人员确认页面状态、采集范围与字段语义；与前端约定目录树、草稿差异、SSE 事件、任务状态与安全下载等接口契约；与后端共同确认目录版本、并发冲突、导出恢复、文件校验与异常返回边界。对 Agent 输出坚持"建议可生成、事实需校验、正式写入需确认"的协作原则，把模型结果当成候选输入而非业务事实，避免幻觉直接进入正式数据。

</section>

<section id="outcomes" class="experience-detail-section">

## 结果与证据

<ul class="experience-outcomes"><li><span class="experience-outcome-label">采集范式</span><p>把"全量 Agent 自动抓（不全/不准/贵/不可控）"演进为"人工定界 + 插件采集 + Agent 解析"的半智能化范式；单页 DOM 输入体积 18.2KB→3.3KB（压缩约 82%），LLM token 大幅下降，敏感值不出浏览器，结果可控、正确率高、额度消耗少。</p></li><li><span class="experience-outcome-label">读写分离导出</span><p>导出只在 MySQL 上建立一致性只读快照、不持目录写锁，与采集/目录写入并行；SQLite 递归 CTE + O(depth) 祖先栈 + SXSSF 流式写入让 JVM 内存恒定，<strong>50 万字段导出 35s</strong>，百万级体量下服务内存平稳、业务不中断。</p></li><li><span class="experience-outcome-label">入库防重并发</span><p>应用层预检 + 数据库唯一索引双层防重；父节点行锁 + 排序尾行 <code>FOR UPDATE</code> + 版本 CAS 处理并发子节点，后写不覆盖先写、不同节点可并行；邻接表 + 闭包表 + 升序锁复查保证树不重复、不断链、不丢更新，冲突均可压测复现为 409 可恢复错误。</p></li></ul>

</section>

<section id="skills" class="experience-detail-section experience-detail-last">

## 技术沉淀

<p>这个项目沉淀的是"用工程手段收拢不确定"的方法：先用半智能化采集把页面与模型的不确定关进"人定界 + 插件清洗 + 受限 Agent + 人在回路"的笼子，再用读写分离与流式落盘把大体量导出对服务的冲击降到可忽略，最后用邻接表 + 闭包表 + 版本 CAS 把并发写入收敛成确定不变量。一句话——不稳定输入要靠确定架构兜底，而不是靠更聪明的模型。</p>

<div class="experience-skill-list"><span v-for="skill in ['Java', 'Spring Boot', 'MySQL', 'SQLite', 'JavaScript', 'Chrome Extension MV3', '多 Agent 编排', 'LLM 应用', 'Prompt 工程', 'SSE', 'DOM-SCOUT', '邻接表', '闭包表', 'CAS', '读写分离', 'Apache POI', 'SXSSF', '递归 CTE']" :key="skill">{{ skill }}</span></div>

</section>
