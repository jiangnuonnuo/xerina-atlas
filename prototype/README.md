# Xerina Atlas 交互式原型

这是独立于未来 VitePress + Teek 实现的产品原型，当前用于确认信息架构、视觉语言、响应式布局和页面交互，不代表最终业务代码结构。

正式实现的目录、Markdown frontmatter、自动发现、导航生成和部署方案见仓库根目录的 [ARCHITECTURE.md](../ARCHITECTURE.md)；后续人工或 AI 新增内容时，遵循 [CONTENT_AUTHORING_GUIDE.md](../CONTENT_AUTHORING_GUIDE.md) 与 `content-templates/` 中的模板。

## 预览

在仓库根目录执行：

```bash
python3 -m http.server 4173 -d prototype
```

然后访问 `http://localhost:4173`。

## 已覆盖的路径

- 首页：首屏定位、求职状态、项目、经历、文章、联系方式
- 实习与实践经历：首页优先展示，支持进入角色、职责、成果与复盘详情
- 项目经历：面向 HR 的快速扫描、分类筛选与项目摘要
- 项目文档：顶部导航下拉菜单，直接选择项目进入完整技术文档
- 项目详情：顶部项目章节导航、左侧完整目录、右侧 Markdown 风格正文
- 项目文档章节：项目简介、需求分析、系统设计、核心实现、部署验证、项目复盘
- 个人经历：时间轴、工作关键词
- 知识库：文章筛选与标题搜索
- 关于：个人介绍、个人图集、联系方式与简历入口

## 数据驱动说明

当前内容写在 HTML 与 `app.js` 的示例数据对象中，仅用于快速验证。正式实现时，项目、文章和经历会迁移到 VitePress 的 Markdown 内容目录，由 frontmatter 和构建期数据加载驱动首页、列表、顶部项目文档下拉和项目侧栏。项目详情与经历详情的建议目录分别为 `docs/projects/<project>/` 与 `docs/experience/<experience>/`。
