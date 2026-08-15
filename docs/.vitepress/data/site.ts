export interface Project {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  category: "后端工程" | "AI 应用" | "全栈实践";
  year: string;
  status: string;
  featured: boolean;
  technologies: string[];
  facts: Array<{ label: string; value: string }>;
  background: string;
  responsibilities: string[];
  architecture: string[];
  challenges: Array<{ title: string; description: string }>;
  outcomes: string[];
  links: Array<{ label: string; href: string }>;
}

export interface ArticleSummary {
  title: string;
  description: string;
  date: string;
  category: "架构设计" | "工程实践" | "AI 工程";
  tags: string[];
  readingTime: string;
  href: string;
}

export const profile = {
  name: "Xerina",
  role: "Java 后端 / AI 应用工程师",
  tagline: "把复杂问题拆成可靠系统，也把工程经验写成可复用的知识。",
  summary:
    "软件工程本科在读，关注 Java 服务端、领域建模与 AI 工程化。能够从需求分析、架构设计推进到可验证的产品交付。",
  availability: "正在寻找 2026 届校招 / 实习机会",
  location: "中国 · 可远程",
  email: "hello@xerina.dev",
  github: "https://github.com/",
  resumeUrl: "/resume-xerina.md",
  education: {
    degree: "本科 · 软件工程",
    period: "2022.09 — 2026.06",
    focus: "主修数据结构、操作系统、计算机网络、数据库与软件工程",
  },
  advantages: [
    "能把业务语言转译为边界清晰、可测试的系统设计",
    "重视可观测性、异常路径与工程交付质量",
    "持续写作复盘，让个人经验成为团队可复用资产",
  ],
  skills: [
    { group: "后端", items: ["Java", "Spring Boot", "MySQL", "Redis"] },
    { group: "架构", items: ["DDD", "事件驱动", "消息队列", "可观测性"] },
    { group: "AI 工程", items: ["RAG", "Agent", "Prompt", "评测"] },
    { group: "工程", items: ["Git", "Docker", "CI/CD", "VitePress"] },
  ],
};

export const projects: Project[] = [
  {
    slug: "xerina-atlas",
    title: "Xerina Atlas",
    eyebrow: "内容驱动的个人技术品牌站",
    description:
      "将求职作品集、技术博客和知识库统一为一个可持续更新的内容系统，让 HR 与技术面试官获得不同深度的浏览路径。",
    category: "全栈实践",
    year: "2026",
    status: "持续迭代",
    featured: true,
    technologies: ["VitePress", "Teek", "Vue 3", "TypeScript"],
    facts: [
      { label: "角色", value: "需求 / 设计 / 前端" },
      { label: "周期", value: "2 周 MVP" },
      { label: "重点", value: "内容模型与体验" },
    ],
    background:
      "传统简历承载的信息有限，而博客又缺少面向招聘决策的入口。项目把两类内容放进同一信息架构：首屏用于快速判断，项目与文章负责提供能力证据。",
    responsibilities: [
      "梳理 HR、面试官和技术同行三类用户的决策任务",
      "建立个人资料、项目、经历和文章的统一数据模型",
      "完成响应式视觉系统、组件实现与可访问性检查",
      "保留 Teek 的长文阅读能力，降低后续维护成本",
    ],
    architecture: ["Markdown / TypeScript 数据", "VitePress 构建层", "Teek 阅读体验", "静态站点交付"],
    challenges: [
      {
        title: "首屏信息很多，但不能像简历表格",
        description: "用单一主叙事和紧凑的状态面板组织信息，先回答是谁、做什么、是否求职，再提供深度入口。",
      },
      {
        title: "自定义页面与主题体验容易割裂",
        description: "复用 VitePress 语义色和导航结构，自定义层只扩展页面内容，不重做文章阅读系统。",
      },
    ],
    outcomes: ["7 类核心页面形成一致浏览路径", "个人信息与项目卡片支持数据驱动更新", "桌面与移动端共享同一语义组件"],
    links: [
      { label: "查看源码", href: "https://github.com/" },
      { label: "阅读设计说明", href: "/articles/vitepress-teek" },
    ],
  },
  {
    slug: "ai-review",
    title: "AI Code Review Pipeline",
    eyebrow: "可追踪的智能代码评审流程",
    description: "把规则扫描、上下文检索与大模型评审组织成可回放的流水线，输出带证据的风险建议。",
    category: "AI 应用",
    year: "2025",
    status: "原型完成",
    featured: true,
    technologies: ["Spring AI", "RAG", "GitHub API", "PostgreSQL"],
    facts: [
      { label: "角色", value: "后端 / AI 工程" },
      { label: "形态", value: "事件驱动服务" },
      { label: "重点", value: "证据与可追踪" },
    ],
    background: "单次提示词能给出建议，却难以解释上下文来源，也无法稳定接入团队流程。项目将评审拆成确定性检查与模型判断两个阶段。",
    responsibilities: ["设计评审任务状态机", "实现仓库上下文切片与检索", "定义结构化评审结果与置信度", "记录模型输入、输出与版本"],
    architecture: ["Webhook 事件", "任务编排", "代码上下文检索", "LLM 评审", "结果回写"],
    challenges: [
      { title: "上下文窗口有限", description: "按变更影响面选择文件，并优先保留调用关系、测试与配置证据。" },
      { title: "建议存在误报", description: "将规则结论与模型推断分层展示，并要求每条高风险建议关联代码证据。" },
    ],
    outcomes: ["评审过程可回放", "支持按风险等级聚合", "为后续离线评测保留样本"],
    links: [{ label: "查看架构笔记", href: "/articles/ai-ready-content" }],
  },
  {
    slug: "campus-hub",
    title: "Campus Service Hub",
    eyebrow: "校园事务聚合服务",
    description: "围绕活动、预约与通知构建模块化服务，练习从业务规则到接口、数据与异常路径的完整设计。",
    category: "后端工程",
    year: "2024",
    status: "课程项目",
    featured: false,
    technologies: ["Spring Boot", "MySQL", "Redis", "Docker"],
    facts: [
      { label: "角色", value: "后端负责人" },
      { label: "团队", value: "4 人" },
      { label: "重点", value: "一致性与权限" },
    ],
    background: "校园服务分散在不同入口，状态与通知缺少统一表达。项目以学生事务为主线整合预约、活动和消息模块。",
    responsibilities: ["划分用户、活动、预约与通知模块", "设计接口错误码与权限模型", "实现热点数据缓存与失效策略", "编写部署文档与接口测试"],
    architecture: ["Web 客户端", "REST API", "领域服务", "MySQL / Redis", "通知适配器"],
    challenges: [
      { title: "名额扣减并发冲突", description: "用数据库约束保证最终正确，并通过缓存减少热点读取压力。" },
      { title: "权限规则散落", description: "提取统一授权策略，在用例入口完成身份与资源关系检查。" },
    ],
    outcomes: ["核心用例具备自动化测试", "服务可通过 Docker 一键启动", "接口文档覆盖主要异常路径"],
    links: [{ label: "阅读事件设计", href: "/articles/event-driven" }],
  },
];

export const experiences = [
  {
    period: "2025.07 — 2025.10",
    type: "实习",
    title: "后端开发实习生",
    organization: "软件研发团队",
    summary: "参与服务端功能迭代与问题排查，关注接口稳定性和研发反馈闭环。",
    highlights: ["拆解需求并完成接口与数据模型设计", "补充关键链路日志与异常信息", "通过复盘文档沉淀排障过程"],
  },
  {
    period: "2024.09 — 2025.05",
    type: "竞赛",
    title: "大学生软件设计竞赛",
    organization: "团队核心成员",
    summary: "负责系统方案、后端实现与答辩材料，把技术选择与实际问题建立对应关系。",
    highlights: ["完成可演示的端到端产品原型", "建立任务分工与每周验收机制", "获得区域赛奖项"],
  },
  {
    period: "2022.09 — 2026.06",
    type: "教育",
    title: "软件工程 · 本科",
    organization: "计算机相关院系",
    summary: "以工程实践为主线学习计算机基础，并持续通过项目与写作验证理解。",
    highlights: ["核心课程：数据结构、操作系统、网络、数据库", "关注领域建模与分布式系统", "维护个人技术知识库"],
  },
];

export const competitions = [
  { name: "大学生软件设计竞赛", result: "区域赛奖项", year: "2025", focus: "系统设计 / 团队协作" },
  { name: "服务外包创新创业竞赛", result: "校级推荐", year: "2024", focus: "需求分析 / 产品实现" },
];

export const articles: ArticleSummary[] = [
  {
    title: "为 AI 更新设计内容模型",
    description: "让个人信息、项目与文章既适合人工阅读，也能被自动化流程稳定更新。",
    date: "2026-08-12",
    category: "AI 工程",
    tags: ["内容模型", "自动化", "Schema"],
    readingTime: "8 分钟",
    href: "/articles/ai-ready-content",
  },
  {
    title: "事件驱动系统的边界设计",
    description: "从校园预约场景出发，解释事件、事务边界与失败恢复如何协同。",
    date: "2026-08-05",
    category: "架构设计",
    tags: ["事件驱动", "一致性", "DDD"],
    readingTime: "11 分钟",
    href: "/articles/event-driven",
  },
  {
    title: "VitePress + Teek 的作品集实践",
    description: "保留知识库的阅读效率，同时为求职首页和项目页建立独立表达。",
    date: "2026-07-28",
    category: "工程实践",
    tags: ["VitePress", "Teek", "Vue"],
    readingTime: "6 分钟",
    href: "/articles/vitepress-teek",
  },
];

