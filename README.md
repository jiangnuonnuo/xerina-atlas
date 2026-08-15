# Xerina Atlas

面向求职展示、技术博客与个人知识库的聚合站点，基于 VitePress + Teek 构建。

## 本地运行

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
npm run preview
```

## 更新内容

- 个人资料、经历、项目和文章摘要集中在 `docs/.vitepress/data/site.ts`
- 首页、项目、经历和关于页面为 Vue 数据驱动组件
- 技术文章使用 Markdown 编写，沿用 Teek 的目录、代码块和上下篇导航
- `docs/public/resume-xerina.md` 是可下载的简历占位文件，上线前应替换为同路径的 PDF 并同步更新数据配置

> 当前人物信息与项目数据用于展示信息结构。上线前请按真实履历更新，避免保留示例数据。

