---
title: Java 后端开发实习生
type: experience
experienceType: internship
organization: 宝尊
period: 实习期间
location: 中国
order: 20
featured: true
summary: 参与字段目录平台研发，将业务页面中的字段信息沉淀为可审核、可维护、可导出的层级目录。
detailLead: 围绕页面字段采集、受限 Agent 解析、目录结构治理和字段字典交付，参与从页面证据到结构化资产的完整链路设计。
skills:
  - Java
  - Spring Boot
  - MySQL
  - SQLite
  - Agent
  - Apache POI
relatedProjects:
  - baozun-field-platform
layout: experience-detail
---

<section id="role" class="experience-detail-section">

## 我的角色

参与字段目录平台的需求分析、技术方案设计和全栈研发，重点处理页面字段采集、层级目录治理及字段字典导出等链路，并与业务人员、前端和后端协作确认数据边界与接口契约。

<div class="experience-facts"><div><span>ROLE</span><strong>Java 后端开发</strong></div><div><span>DOMAIN</span><strong>字段采集 / 元数据治理 / 字典交付</strong></div><div><span>COLLABORATION</span><strong>业务人员 · 前端 · Agent · 后端</strong></div></div>

</section>

<section id="context" class="experience-detail-section">

## 工作背景

业务页面中的菜单、页签、分组、表单字段和表格列缺少统一的层级目录，页面改版和字段交付需要反复人工核对。项目通过页面证据采集、层级解析、人工审核、正式目录治理和字段字典导出形成字段管理闭环。

</section>

<section id="collaboration" class="experience-detail-section">

## 协作方式

与业务人员确认页面状态和采集范围，与前端约定目录树、草稿、SSE 事件和任务状态等接口契约，并围绕异常树、版本冲突、导出恢复和文件校验共同整理验证场景。

</section>

<section id="participation" class="experience-detail-section">

## 具体参与

<ul class="experience-detail-list">
  <li><span>01</span><p>设计半人工字段采集链路，由业务人员确定页面范围，定制 DOM-SCOUT 完成多选区采集、DOM 清洗、脱敏和结构化，统一产出可追踪的 <code>DomSnapshot</code>，为后续解析和人工审核提供稳定证据。</p></li>
  <li><span>02</span><p>设计邻接表 + 闭包表的层级目录模型，在事务内维护祖先路径、节点层级和目录版本，结合 CAS、稳定锁序与锁后复查支持目录新增、子树移动、删除恢复及并发一致性控制。</p></li>
  <li><span>03</span><p>实现异步字段字典导出，将 MySQL 一致性快照、SQLite 阶段工作区、DFS 路径展开和 Apache POI SXSSF 流式写入解耦，通过任务幂等、重试恢复和原子文件提交避免导出阻塞采集与目录写入。</p></li>
</ul>

</section>

<section id="outcomes" class="experience-detail-section">

## 结果与复盘

<ul class="experience-outcomes"><li><span class="checkmark">✓</span><p>将人工选区、DOM 清洗、Agent 解析和人工确认组织为一条可追踪的字段治理链路。</p></li><li><span class="checkmark">✓</span><p>通过邻接表与闭包表维护层级关系，使目录查询、祖先路径和子树变更具备明确的数据基础。</p></li><li><span class="checkmark">✓</span><p>通过一致性快照、阶段文件和流式写入拆分大批量导出，保留失败重试、阶段恢复和文件校验边界。</p></li></ul>

</section>

<section id="skills" class="experience-detail-section experience-detail-last">

## 实践中的技能

<div class="experience-skill-list"><span v-for="skill in ['Java', 'Spring Boot', 'MySQL', 'SQLite', 'Chrome Extension', 'Agent', 'SSE', 'Apache POI', '闭包表', '异步任务']" :key="skill">{{ skill }}</span></div>

</section>
