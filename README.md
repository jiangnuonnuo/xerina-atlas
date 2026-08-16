# Xerina Atlas

Xerina 的个人求职作品集、项目解析与技术知识库，基于 VitePress + Teek 构建。

## 本地运行

```bash
npm install
npm run dev
```

常用命令：

```bash
npm run check   # 校验 Markdown frontmatter 与发布资源
npm run build   # 校验并生成静态站点
npm run preview # 预览构建产物
```

## 内容入口

- 首页：`docs/index.md`
- 实习经历：`docs/experience/<slug>/index.md`
- 项目总览与项目文档：`docs/projects/<project-slug>/`
- 技术文章：`docs/notes/<category>/<slug>.md`
- 关于页：`docs/about/index.md`
- 稳定 URL 的图片、视频、交互图和附件：`docs/public/`

新增 Markdown 后，构建期会自动发现并生成页面、列表项、顶部项目文档导航和项目章节侧栏。详细规则见：

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [CONTENT_AUTHORING_GUIDE.md](./CONTENT_AUTHORING_GUIDE.md)
- [content-templates/](./content-templates/)

模板只约束最小 frontmatter 契约，不限制正文必须使用固定标题。正文可以根据项目事实自由组织，并通过 Markdown 兼容图片、视频、代码、附件和 Archify 交互图发布资产。
