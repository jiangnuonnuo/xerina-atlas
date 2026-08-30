# Xerina Atlas 内容编写与 AI 投递指南

> 本文是人工作者和 AI 作者的操作入口。
>
> 开始写作前先阅读本文件；涉及目录、组件或构建机制调整时，再阅读 ARCHITECTURE.md。

## 1. 最重要的规则

1. AI 默认把新内容写入 content-drafts，不直接发布到 docs。
2. 人工确认事实、隐私和表述后，再将内容放入 docs 对应目录。
3. Markdown 是正文唯一事实源；首页、列表、导航只读取 frontmatter。
4. 项目经历页用于 HR 快速了解，项目 Markdown 文档用于技术人员深入阅读。
5. 竞赛荣誉统一维护在 `docs/about/index.md` 的 `honors` frontmatter，由首页和 `/portfolio/` 自动展示。
6. 标题必须明确描述内容，例如“订单状态机设计”，不使用“想法落到现实”之类泛化标题。
7. 图片、视频、附件、Archify 图和代码按本指南选择目录，不把大段 HTML 或二进制内容塞进 Markdown。
8. 项目总览和项目章节统一使用 `layout: project-doc`，字体、字号、目录宽度、间距和响应式行为由统一布局控制，Markdown 文件不单独写样式。
9. 项目文档正文不要重复添加 `# 一级标题`；布局会根据 frontmatter 的 `title` 自动渲染页面标题。
10. AI 不修改 .vitepress/theme、schema、scripts 和部署配置，除非任务明确要求修改架构。

## 2. 内容应该放在哪里

| 要新增的内容 | 草稿位置 | 审核后的正式位置 | 是否自动生成网页 |
| --- | --- | --- | --- |
| 新项目 | content-drafts/projects/<project-slug>/index.md | docs/projects/<project-slug>/index.md | 是 |
| 项目章节 | content-drafts/projects/<project-slug>/<chapter>.md | docs/projects/<project-slug>/<chapter>.md | 是 |
| 实习/实践经历 | content-drafts/experience/<experience-slug>/index.md | docs/experience/<experience-slug>/index.md | 是 |
| 技术文章 | content-drafts/notes/<category>/<slug>.md | docs/notes/<category>/<slug>.md | 是 |
| 关于页资料 | content-drafts/about.md | docs/about/index.md | 是，更新固定页面 |
| 竞赛与荣誉 | content-drafts/about.md | docs/about/index.md 的 `honors` | 首页与 `/portfolio/` 自动更新 |
| 项目独占图片 | 与草稿一起准备 | docs/projects/<project-slug>/assets/images/ | 否，必须由 Markdown 引用 |
| 大视频/字幕/poster | 先记录媒体清单 | docs/public/media/projects/<project-slug>/videos/ | 否，必须由 Markdown 引用 |
| PDF/压缩包等附件 | 先记录媒体清单 | docs/public/media/.../downloads/ | 否，必须由 Markdown 引用 |
| Archify 原始 JSON | content-sources/archify/... | 保持原位置 | 否，不直接发布 |
| Archify HTML/SVG/预览图 | 生成后检查 | docs/public/media/.../diagrams/<diagram-slug>/ | 否，必须由 Markdown 引用 |
| 可复用代码片段 | 与文章草稿一起准备 | docs/snippets/projects/<project-slug>/ | 否，由 Markdown import |

约定：

- slug 只使用小写英文、数字和连字符，例如 order-fulfillment。
- 已发布 slug 不跟随中文标题变化。
- 项目章节文件名前缀使用 10、20、30，给后续插入章节留出空间。
- category 优先使用 engineering、ai、methodology，新增分类前先确认是否真的需要。
- 模板中的 `draft: true` 是保护标记；正式发布前必须移除或改为 `false`。

## 3. AI 写作标准流程

### 第一步：判断内容类型

先回答：

- 这是项目总览、项目章节、经历详情、技术文章还是个人资料？
- 内容归属于哪个 project/experience/note slug？
- 是否需要图片、视频、附件、交互图或外部代码？
- 内容是否包含未经 Xerina 确认的事实、数据或公司隐私？

无法确认事实时不要编造，在草稿中使用明确标记：

~~~text
[NEEDS_REVIEW: 需要 Xerina 确认具体指标、时间或职责边界]
~~~

### 第二步：从标准模板开始

从 content-templates 中选择对应模板，不复制已有文章后再大范围删除。模板决定必填字段、标题层级和内容顺序。

### 第三步：写入草稿区

AI 默认只能写：

~~~text
content-drafts/
content-sources/archify/                 # 仅在任务涉及 Archify 源文件时
~~~

正式发布目录 docs 由人工审核后接收；如果任务明确授权 AI 直接发布，仍必须执行所有校验。

### 第四步：添加媒体与代码

根据第 8—11 节选择存放方式，不手写任意 iframe、script、style、object 或 embed。

### 第五步：执行检查

未来实现完成后，提交前执行：

~~~bash
npm run check
npm run build
~~~

检查失败时修复内容和引用，不使用 ignoreDeadLinks 或跳过 schema 来掩盖错误。

### 第六步：人工审核

人工至少确认：

- 姓名、时间、组织、职位、结果和量化数据真实。
- 没有泄露公司、客户、账号、Token、密钥、内网地址和受限代码。
- 项目职责没有把团队成果夸大为个人独立成果。
- 图片、视频、截图和引用具有发布权限。
- 标题、摘要和正文的受众一致。

## 4. 项目总览怎么写

正式文件：

~~~text
docs/projects/<project-slug>/index.md
~~~

frontmatter 至少包含：

~~~yaml
---
title: 订单履约服务
type: project
category: domain
year: 2025
order: 20
featured: true
status: completed
summary: 以订单状态机为核心，拆解用户、库存、支付与履约边界。
role: 后端设计与核心接口实现
stack:
  - Java
  - Spring Boot
  - DDD
tags:
  - 业务系统
  - 状态机
nav: true
sidebar: true
layout: project-doc
---
~~~

正文推荐顺序：

1. 项目背景。
2. 使用者与业务问题。
3. 我的角色和职责边界。
4. 项目目标与结果。
5. 技术方案总览。
6. 文档阅读路径。
7. 代码仓库、演示地址和关联文章。

index.md 同时承担：

- 项目文档入口。
- 项目经历页摘要的数据源。
- 首页项目卡片的数据源。
- 顶部“项目文档”下拉菜单的数据源。

因此摘要和职责必须准确、短而具体，不在 frontmatter 中写长篇正文。

## 5. 项目章节怎么写

正式文件示例：

~~~text
docs/projects/order-fulfillment/30-system-design.md
~~~

frontmatter 示例：

~~~yaml
---
title: 系统设计
type: project-chapter
project: order-fulfillment
group: 系统设计
order: 30
description: 订单聚合、领域边界和状态事件的设计。
sidebar: true
layout: project-doc
---
~~~

正文推荐结构：

~~~md
## 设计目标

## 约束与取舍

## 整体架构

## 核心模块

## 关键流程

## 异常与边界情况

## 验证方式

## 本章结论
~~~

项目文档布局会从 frontmatter 的 `title` 输出一级标题，因此项目总览和章节正文不要再重复写 `# 标题`；普通 Teek 技术文章仍可按文章自身需要保留一级标题。

所有使用 `layout: project-doc` 的项目文件都会自动获得统一的文档阅读样式，包括中文字体栈、标题和正文层级、左侧目录宽度、目录项行高与移动端折叠行为。新增项目文件只需使用模板并补齐 frontmatter，不要在 Markdown 中通过 HTML、内联样式或自定义字体覆盖这套规则。

章节只解决一个独立阅读任务。若同时出现需求分析、数据库设计和部署步骤，应拆分成多个 Markdown 文件。

## 6. 实习与实践经历怎么写

正式文件：

~~~text
docs/experience/<experience-slug>/index.md
~~~

frontmatter 示例：

~~~yaml
---
title: 后端开发实习生
type: experience
experienceType: internship
organization: 待填写组织名称
period: 2025.06 — 2025.09
location: CHINA / REMOTE
order: 10
featured: true
layout: experience-detail
summary: 参与领域建模、接口交付与线上问题定位。
skills:
  - Java
  - Spring Boot
  - 接口设计
relatedProjects:
  - order-fulfillment
---
~~~

正文顺序固定为：

1. 我的角色。
2. 工作背景和目标。
3. 具体参与。
4. 协作方式。
5. 结果与证据。
6. 遇到的问题与复盘。
7. 实践中的技能。
8. 关联项目。

实习经历优先说明“我承担什么、为什么这样做、最后得到什么结果”，项目经历再展开技术实现。

## 7. 技术文章怎么写

正式文件：

~~~text
docs/notes/<category>/<article-slug>.md
~~~

frontmatter 示例：

~~~yaml
---
title: RAG 应用的评测：不要只看回答像不像
type: note
category: ai
date: 2026-06-18
order: 10
summary: 把命中、引用和回答质量拆开，建立可持续回归的最小评测集。
tags:
  - RAG
  - Evaluation
relatedProjects:
  - rag-lab
---
~~~

正文推荐顺序：

1. 问题是什么。
2. 为什么值得解决。
3. 前置知识和环境。
4. 方案设计。
5. 实现步骤。
6. 代码与结果。
7. 常见错误和边界。
8. 验证方法。
9. 总结与关联项目。

教程必须写清版本、前置条件和验证结果；观点文章必须区分事实、经验和个人判断。

## 8. 图片怎么放

项目独占图片放在 Markdown 同目录的 assets/images；当前采用文件式布局的技术文章，则放在与文章同名的 assets/images 目录：

~~~text
docs/projects/order-fulfillment/
├── 30-system-design.md
└── assets/images/
    └── order-context.webp

docs/notes/engineering/
├── wiki-and-rag.md
└── wiki-and-rag/assets/images/
    └── rag-pipeline.png
~~~

Markdown 使用相对路径：

~~~md
![订单履约领域上下文图](./assets/images/order-context.webp)
~~~

技术文章使用以文章文件名命名的资源目录：

~~~md
![RAG 全流程](./wiki-and-rag/assets/images/rag-pipeline.png)
~~~

要求：

- alt 描述图片表达的事实，不写“图片”“截图”。
- 文件名使用英文小写和连字符。
- 推荐 WebP/AVIF，必须保真时使用 PNG/SVG。
- 不把代码主要内容做成截图。
- 一张图被多个页面共享时，放 docs/public/media/shared 或对应作用域，并通过 MediaFigure 引用。

## 9. 视频怎么放

视频媒体包：

~~~text
docs/public/media/projects/order-fulfillment/videos/
├── order-demo.mp4
├── order-demo-poster.webp
└── order-demo.zh-CN.vtt
~~~

Markdown 使用统一组件：

~~~md
<MediaVideo
  title="订单创建到履约完成演示"
  src="/media/projects/order-fulfillment/videos/order-demo.mp4"
  poster="/media/projects/order-fulfillment/videos/order-demo-poster.webp"
  captions="/media/projects/order-fulfillment/videos/order-demo.zh-CN.vtt"
/>
~~~

要求：

- 不自动播放。
- 必须有 poster。
- 有讲解语音时建议提供字幕。
- 正文同时提供文字结论，不能让视频成为唯一信息来源。
- 大文件使用对象存储/CDN 或 Git LFS，保留相同组件接口。

## 10. Archify 图怎么放

Archify 原始源文件与网页发布产物分开：

~~~text
content-sources/archify/projects/order-fulfillment/order-context/
└── source.architecture.json

docs/public/media/projects/order-fulfillment/diagrams/order-context/
├── index.html
├── preview.webp
└── diagram.svg
~~~

Markdown 只使用 InteractiveDiagram：

~~~md
<InteractiveDiagram
  title="订单履约上下文架构"
  src="/media/projects/order-fulfillment/diagrams/order-context/index.html?embed=1"
  poster="/media/projects/order-fulfillment/diagrams/order-context/preview.webp"
  description="订单、库存、支付和履约之间的领域边界。"
/>
~~~

禁止：

- 把完整 Archify HTML 粘贴进 Markdown。
- 把 Archify script/style 合并进 Teek 主题。
- 只提供交互 HTML 而没有静态回退图。
- 使用本地绝对文件路径。
- 让媒体文件标题替代 Markdown 的正文说明。

正文仍需解释图的用途、关键节点、主要关系和结论。交互图是证据与阅读辅助，不是文章本身。

## 11. 代码怎么放

一次性短代码直接使用 fenced code block：

~~~~md
~~~java
public enum OrderState {
    CREATED,
    PAID,
    FULFILLING,
    COMPLETED
}
~~~
~~~~

需要复用、测试或与真实源码同步的代码放在 docs/snippets：

~~~text
docs/snippets/projects/order-fulfillment/OrderState.java
~~~

Markdown 导入：

~~~md
<<< @/snippets/projects/order-fulfillment/OrderState.java#state-machine{java:line-numbers}
~~~

不得在代码中出现真实 Token、密码、客户信息、内网地址或无法公开的公司源码。

## 12. 附件怎么放

PDF、压缩包和其他下载文件放在 public：

~~~text
docs/public/media/projects/<project-slug>/downloads/
docs/public/downloads/
~~~

使用 DownloadLink 组件，展示标题、文件类型和文件大小。不要假设普通 Markdown 链接会自动把 PDF 或压缩包复制到 VitePress 构建结果。

## 13. AI 可以和不可以修改的范围

默认允许：

~~~text
content-drafts/**
content-sources/archify/**                # 仅当任务要求生成或更新架构图源文件
~~~

经过明确授权后允许：

~~~text
docs/projects/**
docs/experience/**
docs/notes/**
docs/about/index.md
docs/snippets/**
docs/public/media/**
~~~

默认禁止：

~~~text
docs/.vitepress/theme/**
docs/.vitepress/config.ts
docs/.vitepress/data/**
docs/.vitepress/utils/**
schemas/**
scripts/**
.github/workflows/**
~~~

如果内容需求必须修改禁止区域，AI 应停止并说明原因、影响范围和建议变更，不自行扩大修改权限。

## 14. 发布前检查清单

- [ ] 文件放在正确的 scope 和 slug 下。
- [ ] 正式内容已移除 `draft: true` 或将其改为 `false`。
- [ ] frontmatter 类型、标题、摘要、排序和关联字段完整。
- [ ] 项目总览和项目章节使用 `layout: project-doc`，正文没有重复的 `# 一级标题`。
- [ ] 标题具体、准确，没有模糊口号。
- [ ] 项目职责与团队职责区分清楚。
- [ ] 所有事实和指标已由 Xerina 确认。
- [ ] 图片有 alt，视频有 poster，交互图有静态回退。
- [ ] Archify 源文件与发布产物分离。
- [ ] 代码可复制、无隐私和密钥。
- [ ] 没有手写 script、style、iframe、object 或 embed。
- [ ] 站内链接不写 .md 或 .html 后缀。
- [ ] npm run check 通过。
- [ ] npm run build 通过。

## 15. AI 接收任务时的最小上下文

给 AI 分配写作任务时，至少提供：

~~~text
内容类型：
归属 slug：
目标读者：
需要回答的问题：
已确认事实：
不可公开内容：
关联项目/经历/文章：
需要的图片、视频、Archify 图或代码：
期望状态：草稿 / 审核后发布
~~~

如果信息不足，AI 应优先生成结构完整、带 NEEDS_REVIEW 标记的草稿，而不是补造事实。
