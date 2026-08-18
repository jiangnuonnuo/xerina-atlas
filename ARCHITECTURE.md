# Xerina Atlas 内容架构与落地计划

> 状态：原型方案已确认，本文是进入 VitePress + Teek 实现前的架构基线。
>
> 目标：内容放进 GitHub 后，执行一次构建即可生成静态网页；后续新增项目章节、实习经历或文章时，尽量只增加 Markdown 文件，不修改页面模板。

## 1. 架构结论

Xerina Atlas 采用“Markdown 内容源 + VitePress 静态构建 + Teek 文档主题 + 少量 Vue 自定义页面组件”的结构。

| 内容或能力 | 推荐实现 | 原因 |
| --- | --- | --- |
| 首页首屏、求职定位、联系方式 | index.md + HomePage.vue | 视觉与信息密度是作品集的核心，需要自定义布局，但文字仍然可以从内容数据读取 |
| 实习经历列表、项目经历列表、文章列表 | index.md + Vue 列表组件 + build-time data loader | 页面只负责展示，条目从 Markdown frontmatter 自动发现 |
| 作品集与竞赛荣誉 | portfolio/index.md + PortfolioPage.vue | 汇总项目作品和关于页中的 honors，给 HR 一个集中查看入口 |
| 实习经历详情 | experience/<slug>/index.md + ExperienceDetailLayout.vue | 角色、职责、成果需要长期编辑，正文应由 Markdown 管理 |
| 项目文档详情 | projects/<slug>/*.md + ProjectDocLayout.vue + Teek | 需要左侧目录、正文、代码、图片、章节跳转，完全符合文档型页面 |
| 技术文章与知识库 | notes/**/*.md + Teek 默认文章布局 | 文章数量会持续增长，使用文件即页面的路由模型 |
| 关于页 | about/index.md + AboutPage.vue | 个人介绍、图集和联系方式需要自定义排版，但不需要单独写 HTML |
| 顶部项目文档下拉菜单 | VitePress themeConfig.nav + 构建期扫描项目索引 | 不设置“项目文档索引页”，直接从导航选择项目进入完整文档 |
| 生成的 HTML | VitePress build 产物 | 不手写、不提交、不在源码中重复维护 |

这里的“HTML 页面”指最终部署的构建结果，不建议在源码中维护 HTML 文件。VitePress 的 Markdown 文件会按目录结构生成对应的静态 HTML；Vue 只负责布局、交互和数据展示。

## 2. 两层阅读模型

网站同时服务两种阅读任务，不能把项目经历和项目文档混成同一页：

~~~mermaid
flowchart LR
  HR[HR / 30 秒扫描] --> HOME[首页首屏]
  HR --> EXPERIENCE_LIST[实习经历列表]
  HR --> PROJECT_LIST[项目经历列表]

  TECH[技术面试官 / 学习者] --> EXPERIENCE_DETAIL[实习经历详情]
  TECH --> PROJECT_DOC_NAV[项目文档下拉导航]
  PROJECT_DOC_NAV --> PROJECT_DOC[项目文档阅读页]
  TECH --> NOTES[技术文章 / 知识库]

  CONTENT[Markdown 内容文件] --> DISCOVERY[构建期内容发现]
  DISCOVERY --> HOME
  DISCOVERY --> EXPERIENCE_LIST
  DISCOVERY --> PROJECT_LIST
  DISCOVERY --> PROJECT_DOC_NAV
  DISCOVERY --> TEEK[Teek 侧栏与文章阅读]
~~~

### 2.1 面向 HR 的快速视图

固定页面：

- /：个人定位、求职方向、教育、实习经历摘要、项目经历摘要、技能和联系方式。
- /experience/：实习与实践经历时间线，实习经历优先展示。
- /projects/：项目经历快速扫描，只展示项目目标、个人职责、技术栈和结果。
- /portfolio/：项目作品与竞赛荣誉集中展示，适合快速确认完整成果。

这三页不放大段技术正文。每个条目只保留明确标题、身份/角色、时间、结果和“查看详情”入口。

### 2.2 面向技术人员的深度视图

动态页面：

- /experience/<slug>/：一段经历的角色、工作范围、具体参与、结果、复盘和关联项目。
- /projects/<slug>/：一个项目的完整文档，项目章节由同一目录下的 Markdown 文件组成。
- /notes/<slug> 或 /notes/<category>/<slug>：独立技术文章。

顶部“项目文档”是一个下拉导航，不再设置 /docs/ 这种只有项目选择功能的中间页。进入项目后，使用 Teek/自定义项目文档布局展示左侧目录与正文。

## 3. 推荐的源码目录

最终实现建议使用 docs/ 作为 VitePress 的内容根目录，符合 CodeGuide 和常见 VitePress 项目的维护习惯。

~~~text
xerina-atlas/
├── package.json
├── package-lock.json
├── tsconfig.json
├── README.md
├── ARCHITECTURE.md
├── CONTENT_AUTHORING_GUIDE.md           # 人工与 AI 的内容定位、写作和引用手册
├── content-templates/                   # 不参与构建的 Markdown 标准模板
│   ├── project-index.md
│   ├── project-chapter.md
│   ├── experience.md
│   └── note.md
├── content-drafts/                      # AI 默认草稿区，不进入线上构建
│   ├── README.md
│   ├── projects/<project-slug>/
│   ├── experience/<experience-slug>/
│   └── notes/<category>/
├── content-sources/                     # 可编辑但不直接发布的资产源文件
│   └── archify/README.md
├── schemas/
│   └── content/                         # frontmatter 与媒体引用契约
│       ├── project.schema.json
│       ├── project-chapter.schema.json
│       ├── experience.schema.json
│       ├── note.schema.json
│       └── media.schema.json
├── scripts/
│   ├── validate-content.ts              # frontmatter、路由、关联关系检查
│   └── validate-assets.ts               # 发布资源命名与基础存在性检查
├── docs/                                # VitePress 源码根目录
│   ├── public/                           # 不经过 Markdown 解析的静态资源
│   │   ├── resume/
│   │   │   └── xerina-java-backend-resume.pdf
│   │   ├── brand/
│   │   │   └── favicon.svg
│   │   ├── media/                        # 需要稳定 URL 的发布型媒体
│   │   │   ├── shared/
│   │   │   ├── projects/<project-slug>/
│   │   │   │   ├── diagrams/<diagram-slug>/
│   │   │   │   │   ├── index.html       # Archify 等交互式独立页面
│   │   │   │   │   ├── preview.webp     # Markdown/移动端/无 JS 回退图
│   │   │   │   │   └── diagram.svg      # 可选静态矢量导出
│   │   │   │   ├── videos/
│   │   │   │   │   ├── demo.mp4
│   │   │   │   │   ├── demo-poster.webp
│   │   │   │   │   └── demo.zh-CN.vtt
│   │   │   │   └── downloads/
│   │   │   ├── notes/<note-slug>/
│   │   │   └── experience/<experience-slug>/
│   │   └── downloads/                    # 跨内容共享的 PDF、压缩包等附件
│   ├── snippets/                         # 可由 Markdown 导入的真实代码文件（按需添加）
│   │   └── projects/<project-slug>/
│   ├── index.md                         # 首页内容入口，挂载 HomePage.vue
│   ├── about/
│   │   └── index.md                     # 关于页
│   ├── experience/
│   │   ├── index.md                     # 实习与实践列表
│   │   └── xiamen-chengcheng/
│   │       └── index.md                 # 实习详情
│   ├── portfolio/
│   │   └── index.md                     # 项目作品与竞赛荣誉聚合页
│   ├── projects/
│   │   ├── index.md                     # 项目经历 HR 快速视图
│   │   ├── nexus-flow-ai/
│   │   │   ├── index.md                 # 项目总览，也是项目文档入口
│   │   │   ├── 10-problem-and-solution.md
│   │   │   ├── 20-ai-drawio.md
│   │   │   ├── 30-mcp-gateway.md
│   │   │   ├── 40-rag-and-agent.md
│   │   │   └── 50-results-and-next.md
│   │   └── aigc-print-platform/
│   │       ├── index.md
│   │       ├── 20-async-task.md
│   │       ├── 30-reliable-message.md
│   │       └── 40-oss-and-inventory.md
│   ├── notes/
│   │   ├── index.md                     # 文章索引、筛选和搜索入口
│   │   └── engineering/
│   │       └── mcp-gateway.md
│   └── .vitepress/
│       ├── config.ts                    # 站点、导航、侧栏、搜索、构建配置
│       ├── env.d.ts                     # Vue/Vite 类型声明
│       ├── data/
│       │   ├── profile.data.ts          # 读取关于页中的个人资料 frontmatter
│       │   ├── projects.data.ts         # 项目索引数据
│       │   ├── experiences.data.ts      # 经历索引数据
│       │   ├── notes.data.ts            # 文章索引数据
│       │   └── chapters.data.ts         # 当前项目的章节导航数据
│       ├── utils/
│       │   └── content-discovery.ts     # 配置与 data loader 共用
│       └── theme/
│           ├── index.ts                 # Teek 主题入口和 enhanceApp
│           ├── components/
│           │   ├── HomePage.vue
│           │   ├── ExperienceIndexPage.vue
│           │   ├── ProjectIndexPage.vue
│           │   ├── NotesIndexPage.vue
│           │   ├── AboutPage.vue
│           │   ├── PortfolioPage.vue
│           │   ├── ProjectVisual.vue
│           │   ├── SiteHeader.vue
│           │   ├── SiteFooter.vue
│           │   ├── MediaFigure.vue
│           │   ├── MediaVideo.vue
│           │   ├── InteractiveDiagram.vue
│           │   └── DownloadLink.vue
│           ├── layouts/
│           │   ├── CustomLayout.vue
│           │   ├── ProjectDocLayout.vue
│           │   └── ExperienceDetailLayout.vue
│           └── styles.css
└── .github/                              # 按最终部署平台按需新增
    └── workflows/                       # CI 或 GitHub Pages 部署工作流
~~~

### 3.1 为什么不把全部内容放到 app.js 或一份 JSON

原型阶段可以把示例数据放在 app.js，正式版本不应该继续这样做：

- 大段正文不适合放在 JavaScript 字符串中，无法自然使用 Markdown 的代码块、表格、图片、目录和链接能力。
- 一份总 JSON 会让内容修改和页面模板耦合，AI 后续更新也容易覆盖不相关内容。
- Markdown 文件天然对应 URL，Git diff 易读，GitHub 上可以直接审阅和回滚。
- frontmatter 只存“索引字段”，正文只存“阅读内容”，首页和列表只读取索引字段，数据边界清楚。

### 3.2 分层架构

正式实现按职责划分为九层，每层只依赖它下方的稳定契约：

| 层级 | 主要目录 | 职责 | 不应该承担的职责 |
| --- | --- | --- | --- |
| 01 写作与治理层 | content-templates、content-drafts | AI/人工起草、模板选择、事实复核 | 不参与线上构建 |
| 02 内容契约层 | schemas/content | 定义 frontmatter、媒体引用和关联字段 | 不包含页面样式 |
| 03 内容源层 | docs/projects、experience、notes、about | Markdown 正文、页面元数据、内容内引用 | 不写导航数组和布局代码 |
| 04 可编辑资产源层 | content-sources | 保存 Archify JSON IR、可重新生成的原始资产 | 不直接暴露为网页 URL |
| 05 发布媒体层 | docs/public、内容目录 assets | 图片、视频、附件、交互 HTML 和回退图 | 不作为项目/文章索引数据源 |
| 06 发现与视图模型层 | .vitepress/data、utils | 扫描 Markdown，生成首页、列表、导航和侧栏所需数据 | 不拼接正文 HTML |
| 07 展示层 | .vitepress/theme、Teek | 布局、组件、响应式、媒体容器和交互 | 不读取文件系统 |
| 08 构建与质量层 | scripts、VitePress build | schema、链接、媒体、可访问性和静态构建检查 | 不修改内容事实 |
| 09 交付层 | .github/workflows、dist、服务器/CDN | 发布静态产物、缓存和回滚 | 不保存写作源文件 |

依赖方向必须保持单向：

~~~text
模板/草稿
  ↓ 人工审核
内容契约 → Markdown 内容 + 资产源
  ↓ 构建期扫描与校验
视图模型 → Teek/自定义布局
  ↓ VitePress SSG
静态 HTML/CSS/JS/媒体 → 服务器/CDN
~~~

关键隔离规则：

1. Markdown 不直接 import 主题内部实现，只使用已注册的稳定内容组件。
2. Vue 组件不读取文件系统，只消费 data loader 或 frontmatter 生成的视图模型。
3. data loader 不渲染长正文，只输出首页、列表、导航所需的小型 JSON 数据。
4. Archify JSON、原始视频工程等可编辑源文件不放在 public，避免无意公开和增加部署体积。
5. 生成的 Archify HTML、视频、PDF 等发布资产不反向成为项目元数据来源；项目标题、摘要和关联关系仍以 Markdown frontmatter 为准。
6. content-drafts 位于 docs 之外，AI 草稿不会因为漏写 draft 字段而被意外构建上线。

## 4. Markdown 与 Vue/HTML 的具体分工

### 4.1 用 Markdown 的内容

以下全部使用 Markdown：

- 项目总览和项目章节。
- 实习经历详情，包括我的角色、职责、协作方式、成果和复盘。
- 技术文章、教程、知识库条目。
- 关于页的个人介绍长文和图集说明文字。
- 代码、命令、表格、流程说明、引用、图片和外部链接。

Markdown 可以包含少量 Vue 组件，例如项目文档中的架构图、指标卡或可折叠说明，但不把正文重写成一整页 HTML。

### 4.2 用 Vue 组件的内容

以下使用 Vue 组件或主题布局：

- 首页首屏及其响应式布局。
- 实习列表、项目列表、文章索引。
- 首页中的项目摘要卡、经历摘要卡、标签筛选。
- 项目文档顶部的项目身份、项目章节导航和侧栏容器。
- 实习详情顶部的角色、组织、时间、地点等元信息。
- 关于页图集网格和联系方式区域。
- 移动端导航、下拉菜单、筛选、搜索和复制邮箱等交互。

### 4.3 不建议手写 HTML 的地方

不要为每一篇文章单独创建 article-001.html，也不要把项目正文复制到 Vue 模板里。页面结构只写一次，内容通过 Markdown 和 frontmatter 注入。

这里的“自定义页面”不等于手写 HTML 文件。VitePress 的源码与最终产物应这样划分：

| 场景 | 源码形式 | 最终结果 |
| --- | --- | --- |
| 项目、经历、文章、关于页长文 | Markdown + frontmatter | VitePress 构建为静态 HTML |
| 首页、列表、筛选、项目文档外壳 | index.md 挂载 Vue layout/component | VitePress 构建为静态 HTML + 必要客户端交互 |
| Teek 通用文章阅读页 | Markdown + Teek 主题 | VitePress 构建为静态 HTML |
| Archify 等自包含交互图 | docs/public 下的独立 HTML 媒体包 | 原样复制，通过受控组件按需嵌入或新窗口打开 |
| docs/.vitepress/dist 中的页面 | 构建产物，不作为写作源文件 | 部署到服务器，不提交内容修改 |

因此，正式源码中不新增 home.html、project-detail.html、article.html 这类页面文件。首页和项目详情的差异由 Vue 布局解决，正文由 Markdown 解决，独立 HTML 只承担隔离的交互媒体，不承担网站内容页职责。

### 4.4 静态资产分级

不同资产必须按“是否需要构建处理、是否需要稳定 URL、是否可重新生成”分类：

| 资产 | 存放位置 | Markdown 引用方式 | 构建行为 |
| --- | --- | --- | --- |
| 当前文章独占图片、截图、小型 GIF | 同级 assets/images | 相对路径 | Vite 处理、哈希并复制，仅复制被引用文件 |
| 小型音视频或轻量媒体 | 同级 assets/lightweight-media | 相对路径或媒体组件 | Vite 作为媒体资产处理 |
| 大视频、音频、字幕、PDF、压缩包 | docs/public/media 或 downloads | 根绝对路径 + 内容组件 | 按原文件名复制，URL 稳定 |
| Archify 可编辑 JSON IR | content-sources/archify | 不直接在 Markdown 中引用 | Git 追踪，不进入网站构建 |
| Archify 交互 HTML | docs/public/media/.../diagrams/.../index.html | InteractiveDiagram 组件 | 作为独立静态页面发布 |
| Archify SVG/PNG/WebP 回退图 | 与交互 HTML 同一媒体包 | poster/图片路径 | 无 JS、移动端和打印回退 |
| 一次性短代码 | Markdown fenced code block | Markdown 原生语法 | Shiki 高亮；代码块默认不会执行 Vue 插值 |
| 可复用或需要保持真实的代码 | docs/snippets | VitePress snippet import | 构建时读取；文件不存在时构建失败 |

VitePress 对 Markdown 中的相对图片和常见媒体进行资产处理，但 PDF、独立 HTML 等普通下载链接不会自动成为构建资产，因此这类文件统一进入 docs/public，并使用根路径引用。

### 4.5 Archify 产物兼容方式

Archify 在内容系统中被视为一个“可追溯媒体包”，不是 Markdown 页面模板。推荐一个图对应一组源文件与发布文件：

~~~text
content-sources/archify/projects/order-fulfillment/order-context/
└── source.architecture.json             # 可编辑、可重新生成

docs/public/media/projects/order-fulfillment/diagrams/order-context/
├── index.html                           # 自包含交互式 Archify 页面
├── preview.webp                         # 正文首屏和无 JS 回退
└── diagram.svg                          # 可选下载/打印版本
~~~

Markdown 中不直接粘贴 Archify 的整份 HTML、style 或 script。统一使用全局组件：

~~~md
<InteractiveDiagram
  title="订单履约上下文架构"
  src="/media/projects/order-fulfillment/diagrams/order-context/index.html?embed=1"
  poster="/media/projects/order-fulfillment/diagrams/order-context/preview.webp"
  description="订单、库存、支付和履约之间的领域边界。"
/>
~~~

InteractiveDiagram 的实现约束：

- 服务端渲染阶段先输出标题、说明、poster 和“打开完整图”链接，保证无 JavaScript 时仍可阅读。
- iframe 默认不立即加载，用户点击“交互查看”后再挂载，避免项目文章首屏被大型交互资源拖慢。
- iframe 使用 title、lazy loading、受控 sandbox 和 allow 属性；只允许站内 media 路径，不接受任意脚本字符串。
- 组件内部使用 VitePress withBase 处理 GitHub Pages 子路径，Markdown 作者不手工拼 base。
- 移动端默认优先 poster，交互图在固定比例容器内横向适配；打印和 RSS 只保留静态图与完整图链接。
- Archify HTML 的内部主题、导出和交互保持独立，不允许其全局 CSS/JS 污染 Teek 页面。

### 4.6 图片、视频与附件组件

展示层只提供少量稳定组件，AI 可以安全复用，不自行编写 video、iframe 或复杂 HTML：

- MediaFigure：图片、alt、说明、来源和尺寸；正文图片默认懒加载。
- MediaVideo：视频、poster、字幕和说明；默认 controls、playsinline、preload=metadata，禁止 autoplay。
- InteractiveDiagram：Archify 或其他可信独立 HTML，poster 优先、交互按需加载。
- DownloadLink：PDF、压缩包、源码样例等附件，展示类型和文件大小。

视频至少同时提供 poster；包含讲解语音时建议提供 WebVTT 字幕。体积超过仓库约定阈值的媒体使用对象存储/CDN 或 Git LFS，Markdown 路径仍通过组件统一管理。

### 4.7 代码块兼容策略

小段代码直接写在 Markdown fenced code block 中，这是默认方案。代码中的双花括号等 Vue 语法在 fenced code block 内默认按原文展示。

需要复用、测试或与真实源码同步的代码放入 docs/snippets，再在 Markdown 中导入：

~~~md
<<< @/snippets/projects/order-fulfillment/OrderState.java#state-machine{java:line-numbers}
~~~

不建议把几十行可运行代码复制到 frontmatter，也不建议把代码截图作为主要内容；截图只能作为补充说明，真实代码仍应可复制、可搜索。

## 5. URL 与文件映射

VitePress 使用文件路由，建议固定以下映射。链接不带 .md 或 .html 扩展名。

| 页面 | 源文件 | 说明 |
| --- | --- | --- |
| 首页 | docs/index.md | 自定义首页布局 |
| 实习经历 | docs/experience/index.md | 面向 HR 的时间线和筛选 |
| 实习详情 | docs/experience/<slug>/index.md | Markdown 正文 + 经历详情布局 |
| 项目经历 | docs/projects/index.md | 面向 HR 的快速视图 |
| 作品集 | docs/portfolio/index.md | 聚合项目作品与竞赛荣誉 |
| 项目文档入口 | docs/projects/<slug>/index.md | 顶部下拉直接进入，不经过中间选择页 |
| 项目章节 | docs/projects/<slug>/<chapter>.md | 左侧侧栏自动生成 |
| 文章索引 | docs/notes/index.md | 文章列表和搜索 |
| 文章正文 | docs/notes/<category>/<slug>.md | Teek 文章阅读布局 |
| 关于 | docs/about/index.md | 个人介绍、图集、联系方式 |

最终站点路径由 VitePress 的 cleanUrls 和服务器配置共同决定。无论是否使用 clean URL，源码链接都保持不写扩展名。

## 6. 内容 frontmatter 约定

frontmatter 是自动发现的契约。字段命名必须稳定，页面组件不要直接依赖正文中的某一段文字。

### 6.1 项目入口 projects/<slug>/index.md

~~~yaml
---
title: 订单履约服务
author: Xerina
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
  - 领域建模
nav: true
sidebar: true
layout: project-doc
---

## 项目正文

项目文档布局已经使用 frontmatter 的 title 输出一级标题，正文从二级标题开始，避免标题重复。
~~~

字段规则：

- title、type、order、summary 必填。
- slug 来自目录名，只允许小写英文、数字和连字符。
- featured 决定是否出现在首页重点区域，不决定是否发布。
- nav: true 决定是否进入顶部“项目文档”下拉菜单。
- sidebar: true 决定项目章节是否进入文档侧栏。
- stack、tags、role 给首页和项目经历页使用。

### 6.2 项目章节 projects/<slug>/<chapter>.md

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

## 章节正文

代码、图表和复盘内容写在这里。项目文档布局已经输出本章一级标题。
~~~

排序优先使用 order，文件名只作为人类可读的备用排序依据。推荐使用 10、20、30 的间隔，后续插入章节时不需要大范围重命名。

### 6.3 实习/实践经历 experience/<slug>/index.md

~~~yaml
---
title: 后端开发实习生
type: experience
experienceType: internship
organization: 某技术服务团队 · 业务中台
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

# 我的角色

## 具体参与

## 结果与复盘
~~~

列表页只读 frontmatter，详情页渲染该文件正文。这样“实习经历的重要程度高于项目经历”可以通过 featured、排序和首页组件统一控制，而不是复制三份内容。

### 6.4 文章 notes/<category>/<slug>.md

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

# RAG 应用的评测：不要只看回答像不像
~~~

## 7. 自动发现与自动渲染规则

### 7.1 新增文章

只需新增：

~~~text
docs/notes/engineering/new-note.md
~~~

构建时自动完成：

1. 生成 /notes/engineering/new-note 页面。
2. 读取 frontmatter 加入文章索引页。
3. 根据 date 或 order 排序。
4. 生成文章的 SEO 标题、摘要和标签展示。

### 7.2 新增一段实习/实践经历

只需新增：

~~~text
docs/experience/new-experience/index.md
~~~

构建时自动完成：

1. 生成 /experience/new-experience/ 详情页。
2. 自动加入 /experience/ 时间线。
3. 按 order 排序，featured: true 的条目进入首页重点区域。
4. 读取 relatedProjects 生成关联项目入口。

### 7.3 新增一个项目

最小需要一个项目目录和一个入口文件：

~~~text
docs/projects/new-project/index.md
~~~

之后新增章节只需要继续放在该目录：

~~~text
docs/projects/new-project/10-requirements.md
docs/projects/new-project/20-system-design.md
docs/projects/new-project/30-implementation.md
~~~

构建时自动完成：

1. /projects/ 只使用 index.md 的 frontmatter 展示 HR 快速视图。
2. 顶部“项目文档”下拉菜单加入该项目，前提是 nav: true。
3. /projects/new-project/ 作为项目文档入口。
4. 同目录下的章节自动生成页面。
5. 章节按 group + order 生成左侧文档目录。
6. 项目文档布局读取同项目所有章节，生成项目内的章节导航。

因此不需要新增 Vue 页面，不需要修改首页卡片，不需要手动维护一份项目目录数组。

### 7.4 自动发现的实现方式

建议写一个共享的 .vitepress/utils/content-discovery.ts，被以下位置共同使用：

- .vitepress/config.ts：生成顶部项目文档下拉菜单和项目侧栏。
- projects.data.ts：读取项目入口 frontmatter，服务首页和项目经历页。
- experiences.data.ts：读取经历入口 frontmatter，服务首页和经历列表页。
- notes.data.ts：读取文章 frontmatter，服务文章索引页。
- validate-content.ts：检查必填字段、重复 slug、非法关联和排序。

不要让每个组件自己扫描文件，否则以后修改字段或排序规则会出现多个版本。

### 7.5 新增图片、视频、附件或 Archify 图

媒体文件本身不会创建页面，也不会自动进入导航；它必须被某一篇 Markdown 明确引用。这样可以避免 public 目录逐渐堆积无法定位的孤儿文件。

处理流程：

1. 确定媒体归属：project、note、experience 或 shared。
2. 普通图片放在 Markdown 同目录的 assets；需要稳定 URL 的文件放在 docs/public/media 对应作用域。
3. Archify 原始 JSON 放 content-sources/archify，生成的 HTML 与回退图放 docs/public/media 的 diagrams 媒体包。
4. Markdown 使用标准图片语法或 MediaFigure、MediaVideo、InteractiveDiagram、DownloadLink 组件引用。
5. validate-assets 检查文件存在、路径作用域、允许扩展名、体积、poster/字幕、重复名称和孤儿文件。

新增一个 Archify 图不会要求修改 Vue 页面；只有在首次实现 InteractiveDiagram 组件时需要写一次前端代码，之后所有文章共享该组件。

## 8. 页面布局设计

### 8.1 HomeLayout.vue

数据顺序固定为：

1. Xerina、求职方向、一句话介绍、查看项目、下载简历、联系方式。
2. 教育与当前状态。
3. 实习与实践经历摘要，优先级高于项目经历。
4. 项目经历 HR 快速视图。
5. 技术文章与知识库摘要。
6. 联系方式与简历入口。

布局组件只读取 profile、experiences、projects、notes 的索引数据，不读取大段 Markdown 正文。

### 8.2 ExperienceDetailLayout.vue

统一渲染：

- 返回“实习经历”。
- 经历类型、职位、组织、时间、地点和状态。
- 左侧“经历内容”目录：我的角色、具体参与、结果与复盘、实践关键词。
- 右侧 Markdown 正文。
- 底部关联项目。

具体文字仍来自 experience/<slug>/index.md，布局和交互只实现一次。

### 8.3 ProjectDocLayout.vue

统一渲染：

- 项目身份与项目标题。
- 项目内章节导航。
- 左侧完整目录，移动端折叠为目录组件。
- 中间 Markdown 正文。
- 右侧当前页标题大纲由 Teek/VitePress 处理。
- 上一章、下一章和关联文章入口。

项目文档章节不能再写成一整页 HTML。章节文件只负责标题、正文、代码、图片和必要的 Vue 内容组件。

### 8.4 ArticleLayout

技术文章尽量沿用 Teek 默认能力，包括标题、目录、代码块、上/下一篇、编辑入口和阅读排版。只有文章索引页使用 Xerina 自定义的列表布局。

## 9. 导航和侧栏生成策略

### 9.1 全局顶部导航

固定项：

~~~text
首页 / 实习经历 / 项目经历 / 作品集 / 项目文档 / 文章 / 关于
~~~

“项目文档”是动态下拉菜单：

~~~ts
{
  text: '项目文档',
  items: projects
    .filter(project => project.nav !== false)
    .sort(byOrder)
    .map(project => ({
      text: project.title,
      link: '/projects/' + project.slug + '/'
    }))
}
~~~

正式代码中不保留 atlas/order/rag 这样的硬编码项目列表。

### 9.2 项目侧栏

侧栏按目录和 frontmatter 自动生成：

~~~text
项目总览                    -> projects/<slug>/index.md
01 项目概览
  项目背景与目标             -> 10-background.md
02 需求分析
  业务流程梳理               -> 20-requirements.md
03 系统设计
  领域模型与模块边界         -> 30-system-design.md
04 核心实现
  关键代码与验证             -> 40-implementation.md
05 部署验证
06 项目复盘
~~~

实际组名和章节数量由 Markdown frontmatter 决定，不要求每个项目必须有完全一样的章节，但推荐保持“总览—需求—设计—实现—验证—复盘”的主线。

## 10. 构建、校验与部署

建议的脚本入口：

~~~json
{
  "scripts": {
    "dev": "vitepress dev docs",
    "build": "npm run check && vitepress build docs",
    "preview": "vitepress preview docs",
    "check": "npm run check:content && npm run check:assets",
    "check:content": "tsx scripts/validate-content.ts",
    "check:assets": "tsx scripts/validate-assets.ts"
  }
}
~~~

GitHub 到服务器的流程：

~~~mermaid
flowchart LR
  EDIT[新增或修改 Markdown] --> PUSH[Push 到 GitHub]
  PUSH --> CI[GitHub Actions]
  CI --> CHECK[frontmatter / link / asset 校验]
  CHECK --> BUILD[vitepress build docs]
  BUILD --> ARTIFACT[docs/.vitepress/dist]
  ARTIFACT --> DEPLOY[上传服务器静态目录]
~~~

部署要求：

- 服务器只需要提供静态文件服务，不需要 CMS 后台和数据库。
- docs/.vitepress/dist 是构建产物，不提交到 Git。
- docs/public/resume/xerina-resume.pdf、图片和字体等静态资源随构建一起复制。
- 如果使用 clean URL，服务器需要支持 /path/ 到对应 HTML 的回退；否则使用 VitePress 默认的 .html 输出。
- 发布前必须执行内容校验，避免一个错误 frontmatter 让导航出现空标题或关联项目失效。
- VitePress 的 dead-link 检查保持开启，不使用全局 ignoreDeadLinks 跳过错误。
- content-drafts、content-templates、content-sources 不位于 docs 下，因此不会进入静态构建和站内搜索。
- docs 内部若存在 README、TODO 或局部说明文件，通过 srcExclude 明确排除，不依赖文件名约定猜测。

## 11. 内容发布约束

为了让 AI 后续自动更新仍然可控，建议固定以下约束：

1. AI 默认写入 content-drafts；通过人工事实审核后再进入 docs。除非任务明确授权，AI 不修改 Vue 布局、主题配置、schema、校验脚本和部署流程。
2. 每个条目必须有唯一目录 slug，slug 一旦发布不随标题变化。
3. 标题使用直接、准确的名词，不使用“想法落到现实”这类无法判断内容的泛化标题。
4. 项目经历的摘要控制在 1—3 句话，项目文档正文再展开完整决策过程。
5. 项目文档每章只聚焦一个主题，避免一个 Markdown 文件超过多个独立阅读任务。
6. 普通图片放在内容所属目录的 assets；交互 HTML、视频和附件进入 docs/public/media 对应作用域。文件名统一使用小写英文、数字和连字符。
7. 文章和章节链接使用站内路径，不写 .md、.html 和本地绝对路径。
8. 删除内容前先将 status 改为 archived 并保留一次构建验证，避免直接破坏旧链接。
9. AI 不直接写 iframe、script、style、object 或 embed；交互图和视频只能通过允许的全局内容组件接入。
10. 所有媒体必须有归属内容和可访问性信息：图片有 alt，视频有 poster，交互图有 title、description 和静态回退。

## 12. 分阶段实施顺序

### Phase 1：内容基线

- 初始化 VitePress、Teek 和 TypeScript 配置。
- 创建 docs、content-drafts、content-templates、content-sources 和 schemas 分层目录。
- 把原型中的示例项目、经历和文章转换成 Markdown frontmatter。
- 建立四类 Markdown 模板与 frontmatter schema。
- 写 validate-content.ts 和 validate-assets.ts，先保证字段、链接和媒体引用正确。

### Phase 2：主题壳

- 接入 Teek 默认文档布局。
- 实现 HomeLayout.vue、ProjectDocLayout.vue、ExperienceDetailLayout.vue。
- 实现 MediaFigure、MediaVideo、InteractiveDiagram 和 DownloadLink 内容组件。
- 将原型中的视觉 token、字体、间距和响应式规则迁移到主题 CSS。

### Phase 3：自动发现

- 实现 content-discovery.ts 和三个 data loader。
- 从 Markdown 自动生成首页摘要、经历列表、项目列表和文章索引。
- 从项目目录自动生成顶部项目文档下拉和项目侧栏。
- 增加 Archify 媒体包、代码 snippet 和 public 附件的构建检查。

### Phase 4：部署闭环

- 增加 GitHub Actions 构建。
- 在服务器上部署 docs/.vitepress/dist。
- 为大型视频和附件预留对象存储/CDN 路径，不改变 Markdown 组件接口。
- 接入真实简历、图片、GitHub 和联系方式。
- 用真实项目内容进行一次移动端、桌面端和链接回归检查。

## 13. 参考依据

- [VitePress Routing](https://vitepress.dev/guide/routing)：文件路由、index.md 和静态 HTML 输出。
- [VitePress Build-Time Data Loading](https://vitepress.dev/guide/data-loading)：createContentLoader、frontmatter 和构建期内容索引。
- [VitePress Markdown Extensions](https://vitepress.dev/guide/markdown)：Markdown、Vue 组件、目录和代码块能力。
- [VitePress Asset Handling](https://vitepress.dev/guide/asset-handling)：相对资产、public 稳定路径和非图片附件的处理边界。
- [VitePress Using Vue in Markdown](https://vitepress.dev/guide/using-vue)：在 Markdown 中使用受控 Vue 内容组件及 SSR 限制。
- [VitePress Site Config](https://vitepress.dev/reference/site-config)：srcExclude、dead link、输出目录和 base URL 配置。
- [VitePress Nav](https://vitepress.dev/reference/default-theme-nav)：顶部导航和下拉菜单配置。
- [VitePress Sidebar](https://vitepress.dev/reference/default-theme-sidebar)：多目录侧栏和可折叠分组配置。
- [CodeGuide](https://github.com/fuzhengwei/CodeGuide)：参考其按内容主题组织、以 Markdown/目录为主的知识库维护方式。
- [bugstack 实战项目文档](https://bugstack.cn/md/project/walissh/walissh.html)：参考其项目文档的章节导航、左侧目录和连续阅读方式，不复制其内容和首页结构。
