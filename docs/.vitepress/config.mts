import { defineConfig } from "vitepress";
import { defineTeekConfig } from "vitepress-theme-teek/config";

const teekConfig = defineTeekConfig({
  author: {
    name: "Xerina",
  },
  // 作品集使用固定视觉系统；关闭主题色/布局定制面板，避免额外的客户端弹层与 SSR 水合差异。
  themeEnhance: {
    enabled: false,
  },
});

export default defineConfig({
  extends: teekConfig,
  lang: "zh-CN",
  title: "Xerina Atlas",
  titleTemplate: ":title · Xerina Atlas",
  description: "Xerina 的个人作品集、技术博客与知识库",
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ["link", { rel: "icon", href: "/brand-mark.svg", type: "image/svg+xml" }],
    ["meta", { name: "theme-color", content: "#0f766e" }],
  ],
  themeConfig: {
    logo: "/brand-mark.svg",
    nav: [
      { text: "首页", link: "/" },
      { text: "经历", link: "/experience" },
      { text: "项目", link: "/projects/" },
      { text: "文章", link: "/articles/" },
      { text: "关于", link: "/about" },
    ],
    search: {
      provider: "local",
      options: {
        translations: {
          button: { buttonText: "搜索", buttonAriaLabel: "搜索站点内容" },
          modal: {
            noResultsText: "没有找到相关内容",
            resetButtonTitle: "清除搜索",
            footer: { selectText: "选择", navigateText: "切换", closeText: "关闭" },
          },
        },
      },
    },
    outline: {
      label: "本页目录",
      level: [2, 3],
    },
    docFooter: {
      prev: "上一篇",
      next: "下一篇",
    },
    lastUpdated: {
      text: "最后更新",
      formatOptions: {
        dateStyle: "medium",
        timeStyle: "short",
      },
    },
    sidebar: {
      "/articles/": [
        {
          text: "技术文章",
          items: [
            { text: "文章索引", link: "/articles/" },
            { text: "为 AI 更新设计内容模型", link: "/articles/ai-ready-content" },
            { text: "事件驱动系统的边界设计", link: "/articles/event-driven" },
            { text: "VitePress + Teek 的作品集实践", link: "/articles/vitepress-teek" },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/", ariaLabel: "GitHub" },
    ],
    footer: {
      message: "用作品说明能力，用文章沉淀思考。",
      copyright: "© 2026 Xerina",
    },
  },
});
