const pageMap = {
  home: "home",
  projects: "projects",
  experience: "experience",
  notes: "notes",
  about: "about",
};

const detailProjects = {
  atlas: {
    title: "Xerina Atlas",
    category: "项目经历 / 平台工程 · 2026",
    lede: "把个人作品集变成一套可被持续维护的内容系统：项目、文章、经历和首页摘要，都来自结构化内容。",
    stack: "VitePress · Vue · AI Workflow",
    status: "STATUS / BUILDING",
    updated: "UPDATED / 2026.08",
    path: "projects/xerina-atlas/",
    purpose: "一个面向求职沟通的内容驱动作品集，把 HR 的快速浏览、面试官的项目深挖和学习者的文章阅读放进同一套内容结构。",
    audience: "HR、技术面试官、技术学习者，以及希望了解项目完整过程的读者。",
    requirements: "首页需要在 30 秒内表达清楚个人方向；项目页需要承载完整技术过程；文章页需要保持长期维护和持续更新。",
    architecture: "以 Markdown 为内容源，使用 VitePress + Teek 承载文章阅读，再通过自定义页面把项目、经历和首页摘要组合成不同阅读视图。",
    implementation: "项目、文章、经历分别维护，页面只消费结构化字段。AI 工作流负责生成摘要、标签、关联项目和待确认内容，最终由 Xerina 审核后发布。",
    deployment: "当前原型先验证信息架构与阅读路径，后续接入 VitePress 构建、静态部署和内容文件自动检查。",
    reflection: "第一版先解决内容是否容易被理解，再解决自动化程度。技术感应该来自清晰的结构，而不是装饰性的复杂动画。",
    codeTitle: "content-model.yml",
    code: "project:\n  title: Xerina Atlas\n  type: platform\n  source: markdown\n  sections:\n    - overview\n    - requirements\n    - architecture\n    - implementation\n    - deployment\n    - reflection",
    metrics: [["30s", "让 HR 了解求职方向"], ["5m", "让面试官读懂项目取舍"], ["∞", "让内容可以持续迭代"]],
  },
  order: {
    title: "订单履约服务",
    category: "项目经历 / 业务系统 · 2025",
    lede: "围绕订单状态机拆解用户、库存、支付和履约之间的边界，记录一个业务系统从领域分析到接口交付的完整过程。",
    stack: "Java · Spring Boot · DDD",
    status: "STATUS / CASE STUDY",
    updated: "UPDATED / 2026.07",
    path: "projects/order-fulfillment/",
    purpose: "通过一个多角色、多状态流转的订单场景，验证领域建模、状态约束与可靠事件链路的设计方法。",
    audience: "希望了解后端业务建模、状态机和接口可靠性的技术面试官与学习者。",
    requirements: "订单状态必须可追踪、可校验、可恢复；不同角色的操作边界需要明确，异常路径不能依赖调用方猜测。",
    architecture: "以订单聚合为核心，拆分用户、库存、支付和履约边界，通过领域事件连接状态变化，保持每个模块的职责可解释。",
    implementation: "使用实体、值对象、领域服务和仓储接口表达业务约束，再通过应用层编排用例，基础设施层负责数据库与消息实现。",
    deployment: "通过接口测试、状态迁移测试和异常回放验证关键链路，记录本地启动、数据库初始化与服务联调步骤。",
    reflection: "这个项目让我确认，DDD 的价值不是目录结构，而是帮助团队用同一套业务语言讨论边界和变化。",
    codeTitle: "order-state.md",
    code: "CREATED -> PAID -> ALLOCATED\nALLOCATED -> FULFILLING -> COMPLETED\nPAID -> CANCELED\nFULFILLING -> AFTER_SALE",
    metrics: [["6", "核心状态节点"], ["4", "主要业务边界"], ["1", "可回放的状态链路"]],
  },
  rag: {
    title: "知识库问答实验室",
    category: "项目经历 / AI 应用 · 2025",
    lede: "从文档切分、向量检索、回答生成到离线评测，验证一个可解释、可迭代的知识库问答流程。",
    stack: "Python · RAG · Evaluation",
    status: "STATUS / EXPERIMENT",
    updated: "UPDATED / 2026.06",
    path: "projects/rag-lab/",
    purpose: "把“回答看起来不错”拆成可观察的检索命中、引用完整性和回答质量，让 AI 应用能够被持续评测。",
    audience: "关注 RAG 应用落地、提示词工程和评测方法的技术面试官与学习者。",
    requirements: "回答需要能够追溯来源，检索效果需要独立评估，新增文档和问题集后可以快速回归。",
    architecture: "文档解析、切分、向量化、检索、重排、回答生成和评测分别作为可替换步骤，使用统一的数据结构传递上下文。",
    implementation: "先建立最小问题集，再逐步加入引用检查、人工评分和离线指标，把调参过程记录为可复用的实验结果。",
    deployment: "保留本地实验脚本、数据集版本和评测结果，确保每次修改检索策略后都能重新运行并比较结果。",
    reflection: "AI 项目的难点不只在于调用模型，而在于让结果可解释、可回归、可被团队共同判断。",
    codeTitle: "evaluation-flow.py",
    code: "documents = load_documents(source)\nchunks = split_documents(documents)\nretriever = build_retriever(chunks)\nanswer = evaluate(query, retriever)\nassert answer.has_citations",
    metrics: [["3", "评测维度"], ["4", "实验迭代"], ["1", "可回归问题集"]],
  },
};

const experienceDetails = {
  internship: {
    title: "后端开发实习生",
    type: "INTERNSHIP / BACKEND ENGINEERING",
    organization: "某技术服务团队 · 业务中台",
    period: "2025.06 — 2025.09",
    location: "CHINA / REMOTE",
    status: "CURRENT FOCUS / BACKEND",
    lede: "在真实业务协作中参与订单与履约相关服务，把需求、领域对象、接口交付和线上问题定位连接成一条可复盘的工程链路。",
    role: "作为后端开发实习生，我负责具体接口和领域对象的实现，同时参与需求澄清、联调、问题复现与上线后的反馈闭环。",
    responsibilities: ["参与订单与履约领域对象梳理，确认状态、边界和异常路径。", "负责部分接口的设计、开发、联调和测试用例补充。", "通过日志、链路和最小复现用例定位线上问题，并跟进修复验证。"],
    outcomes: ["把模糊的线上反馈整理成可讨论、可复现的工程任务。", "沉淀接口契约、状态约束和问题排查记录，降低重复沟通成本。", "建立从业务问题到技术实现再到验证结果的完整表达方式。"],
    skills: ["Java", "Spring Boot", "领域建模", "接口设计", "问题定位"],
    related: "order",
  },
  "project-lead": {
    title: "校级创新项目负责人",
    type: "PROJECT LEAD / AI APPLICATION",
    organization: "知识库问答实验室 · 校级创新项目",
    period: "2024.11 — 2025.04",
    location: "TEAM OF 4",
    status: "PROJECT / 4 ITERATIONS",
    lede: "从用户访谈和资料整理开始，带领 4 人小组完成第一版 RAG 问答链路，并把回答质量拆成可以持续验证的指标。",
    role: "作为项目负责人，我负责目标拆解、方案取舍、任务协作和阶段性结果汇报，同时承担检索链路与评测设计。",
    responsibilities: ["组织用户访谈和资料整理，确认知识库问答的最小使用场景。", "设计文档切分、检索、生成和引用检查的实验流程。", "拆分迭代任务，维护问题集与评测结果，推动 4 次版本迭代。"],
    outcomes: ["将“回答看起来不错”拆成检索命中、引用完整性和人工评分三个维度。", "形成可复用的问题集、实验记录和评测流程。", "让团队从功能演示转向用证据讨论方案是否有效。"],
    skills: ["需求验证", "RAG", "评测设计", "团队协作", "项目推进"],
    related: "rag",
  },
  community: {
    title: "技术社团核心成员",
    type: "COMMUNITY / TECHNICAL SHARING",
    organization: "工程实践与分享 · 校级技术社团",
    period: "2023.09 — 2024.06",
    location: "10+ SESSIONS",
    status: "PRACTICE / KNOWLEDGE SHARING",
    lede: "组织后端基础、Git 协作和项目复盘分享，维护一份面向新成员的学习资料库，持续练习把复杂内容讲清楚。",
    role: "作为核心成员，我负责主题策划、内容准备、现场分享和资料维护，也参与新成员的学习路径设计。",
    responsibilities: ["围绕后端基础、Git 协作和项目复盘策划分享主题。", "把抽象概念拆成示例、练习和可复用的学习资料。", "维护资料库并收集反馈，持续调整分享内容的难度和顺序。"],
    outcomes: ["组织 10+ 次技术分享，形成稳定的内容准备和复盘流程。", "将零散经验整理成可被新成员快速使用的学习资料。", "建立“先理解问题，再解释方案”的技术表达习惯。"],
    skills: ["技术写作", "公开表达", "知识沉淀", "协作组织", "课程设计"],
    related: "atlas",
  },
};

const app = document.querySelector("#app");
const mobileNav = document.querySelector(".mobile-nav");
const menuToggle = document.querySelector(".menu-toggle");
const toast = document.querySelector(".toast");
let toastTimer;
let lastHash = null;
window.history.scrollRestoration = "manual";

function getRoute() {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const [path, section] = raw.split("#");
  const route = path.replace(/\/$/, "");
  if (!route) return { type: "page", name: "home", section: "" };
  if (route.startsWith("experience/")) {
    const experienceKey = route.split("/")[1] || "internship";
    return { type: "experience-detail", name: "experience-detail", experienceKey, section: section || "" };
  }
  if (route.startsWith("docs/") || route.startsWith("projects/")) {
    const projectKey = route.split("/")[1] || "atlas";
    return { type: "detail", name: "detail", projectKey, section: section || "overview" };
  }
  return { type: "page", name: pageMap[route] || "home", section: "" };
}

function navigate(route, options = {}) {
  const nextHash = `#/${route}`;
  if (window.location.hash === nextHash) {
    renderRoute();
    return;
  }
  if (options.replace) {
    window.history.replaceState({}, "", nextHash);
    renderRoute();
    return;
  }
  // 让 hashchange 只负责一次渲染，避免旧页/新页连续切换导致闪烁。
  window.location.hash = `/${route}`;
}

function resetScrollPosition() {
  const root = document.documentElement;
  const body = document.body;
  const previousBehavior = root.style.scrollBehavior;
  const previousBodyBehavior = body.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  body.style.scrollBehavior = "auto";
  root.scrollTop = 0;
  body.scrollTop = 0;
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  root.style.scrollBehavior = previousBehavior;
  body.style.scrollBehavior = previousBodyBehavior;
}

function buildProjectDocument(project) {
  const metrics = project.metrics.map(([value, label]) => `<div class="doc-metric"><strong>${value}</strong><span>${label}</span></div>`).join("");
  return `
    <section class="doc-section" id="overview" data-doc-section-block="overview">
      <span class="section-index">00 / PROJECT OVERVIEW</span>
      <h2>项目简介</h2>
      <p>${project.purpose}</p>
      <div class="doc-callout"><strong>项目定位</strong><span>${project.lede}</span></div>
      <div class="doc-metrics">${metrics}</div>
      <div class="doc-facts"><div><span>项目类型</span><strong>${project.category.split(" / ")[1]}</strong></div><div><span>主要读者</span><strong>${project.audience}</strong></div><div><span>文档来源</span><strong>Markdown / ${project.path}</strong></div></div>
    </section>
    <section class="doc-section" id="requirements" data-doc-section-block="requirements">
      <span class="section-index">01 / REQUIREMENTS</span>
      <h2>需求分析</h2>
      <p>${project.requirements}</p>
      <h3>需要先回答的三个问题</h3>
      <ol class="doc-list"><li><strong>谁在使用？</strong><span>${project.audience}</span></li><li><strong>什么结果算完成？</strong><span>关键路径有清晰输入、输出和异常反馈。</span></li><li><strong>如何判断可以继续迭代？</strong><span>每一次变化都能留下可观察的证据和复盘记录。</span></li></ol>
    </section>
    <section class="doc-section" id="architecture" data-doc-section-block="architecture">
      <span class="section-index">02 / SYSTEM DESIGN</span>
      <h2>系统设计</h2>
      <p>${project.architecture}</p>
      <div class="doc-diagram"><div><span>INPUT</span><strong>内容 / 请求</strong></div><b>→</b><div><span>DOMAIN</span><strong>领域模型</strong></div><b>→</b><div><span>OUTPUT</span><strong>页面 / 结果</strong></div></div>
      <div class="doc-code"><div class="code-head"><span>${project.codeTitle}</span><span>example / v1</span></div><pre><code>${project.code.replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</code></pre></div>
    </section>
    <section class="doc-section" id="implementation" data-doc-section-block="implementation">
      <span class="section-index">03 / CORE IMPLEMENTATION</span>
      <h2>核心实现</h2>
      <p>${project.implementation}</p>
      <div class="doc-steps"><div><b>01</b><strong>拆分内容或领域</strong><span>把模糊问题拆成可验证的对象与边界。</span></div><div><b>02</b><strong>建立可读链路</strong><span>让输入、处理过程和输出之间有迹可循。</span></div><div><b>03</b><strong>保留可复用结果</strong><span>将经验沉淀为 Markdown、测试或数据样例。</span></div></div>
    </section>
    <section class="doc-section" id="deployment" data-doc-section-block="deployment">
      <span class="section-index">04 / DEPLOYMENT &amp; VERIFICATION</span>
      <h2>部署验证</h2>
      <p>${project.deployment}</p>
      <div class="doc-checklist"><div><span class="checkmark">✓</span><strong>本地启动路径</strong><small>环境、依赖和初始化步骤可复现</small></div><div><span class="checkmark">✓</span><strong>关键功能验证</strong><small>核心链路和异常路径都有检查项</small></div><div><span class="checkmark">✓</span><strong>内容更新检查</strong><small>标题、链接、标签和关联关系可校验</small></div></div>
    </section>
    <section class="doc-section" id="reflection" data-doc-section-block="reflection">
      <span class="section-index">05 / PROJECT REFLECTION</span>
      <h2>项目复盘</h2>
      <p>${project.reflection}</p>
      <div class="doc-callout doc-callout-muted"><strong>下一步</strong><span>补充真实项目截图、代码仓库链接、上线地址和对应的 Markdown 章节。</span></div>
    </section>`;
}

function renderProjectDocument(projectKey) {
  const project = detailProjects[projectKey] || detailProjects.atlas;
  const content = document.querySelector("[data-doc-content]");
  if (!content) return;
  document.querySelector("[data-detail-project-label]").textContent = project.title;
  document.querySelector("[data-detail-title]").textContent = project.title;
  document.querySelector("[data-detail-category]").textContent = project.category;
  document.querySelector("[data-detail-lede]").textContent = project.lede;
  document.querySelector("[data-detail-stack]").textContent = project.stack;
  document.querySelector("[data-detail-status]").textContent = project.status;
  document.querySelector("[data-detail-updated]").textContent = project.updated;
  document.querySelector(".doc-sidebar-note p").innerHTML = `${project.path}<br />index.md`;
  content.innerHTML = buildProjectDocument(project);
}

function buildExperienceDetail(experience) {
  const responsibilities = experience.responsibilities.map((item, index) => `<li><span>0${index + 1}</span><p>${item}</p></li>`).join("");
  const outcomes = experience.outcomes.map((item) => `<li><span class="checkmark">✓</span><p>${item}</p></li>`).join("");
  const skills = experience.skills.map((skill) => `<span>${skill}</span>`).join("");
  return `
    <section class="experience-detail-section" id="role">
      <span class="section-index">01 / ROLE &amp; SCOPE</span>
      <h2>我的角色</h2>
      <p>${experience.role}</p>
      <div class="experience-facts"><div><span>ROLE</span><strong>${experience.title}</strong></div><div><span>ORGANIZATION</span><strong>${experience.organization}</strong></div><div><span>PERIOD</span><strong>${experience.period}</strong></div></div>
    </section>
    <section class="experience-detail-section" id="responsibilities">
      <span class="section-index">02 / RESPONSIBILITIES</span>
      <h2>具体参与</h2>
      <ol class="experience-detail-list">${responsibilities}</ol>
    </section>
    <section class="experience-detail-section" id="outcomes">
      <span class="section-index">03 / OUTCOMES &amp; REFLECTION</span>
      <h2>结果与复盘</h2>
      <ul class="experience-outcomes">${outcomes}</ul>
      <div class="experience-detail-callout"><strong>这段经历带给我的方法</strong><span>把角色、问题、动作和结果写清楚，才能让一次参与真正变成可复用的经验。</span></div>
    </section>
    <section class="experience-detail-section experience-detail-last" id="skills">
      <span class="section-index">04 / SKILLS IN PRACTICE</span>
      <h2>实践中的关键词</h2>
      <div class="experience-skill-list">${skills}</div>
    </section>`;
}

function renderExperienceDetail(experienceKey) {
  const experience = experienceDetails[experienceKey] || experienceDetails.internship;
  const content = document.querySelector("[data-experience-content]");
  if (!content) return;
  document.querySelector("[data-experience-title]").textContent = experience.title;
  document.querySelector("[data-experience-type]").textContent = experience.type;
  document.querySelector("[data-experience-organization]").textContent = experience.organization;
  document.querySelector("[data-experience-period]").textContent = experience.period;
  document.querySelector("[data-experience-location]").textContent = experience.location;
  document.querySelector("[data-experience-status]").textContent = experience.status;
  document.querySelector("[data-experience-lede]").textContent = experience.lede;
  content.innerHTML = buildExperienceDetail(experience);
  document.querySelectorAll("[data-experience-section]").forEach((link) => {
    link.setAttribute("href", `#/experience/${experienceKey}#${link.dataset.experienceSection}`);
  });
  const related = document.querySelector("[data-related-project]");
  if (related && experience.related) {
    const project = detailProjects[experience.related];
    related.href = `#/docs/${experience.related}`;
    related.querySelector("strong").textContent = project.title;
    related.querySelector("small").textContent = "查看关联项目文档 ↗";
  }
}

function updateDocNavigation(route) {
  document.querySelectorAll("[data-doc-section]").forEach((link) => {
    const current = link.dataset.docSection === (route.section || "overview");
    link.classList.toggle("is-active", current);
    if (route.projectKey) link.setAttribute("href", `#/docs/${route.projectKey}#${link.dataset.docSection}`);
  });
}

function renderRoute() {
  const route = getRoute();
  const routeHash = window.location.hash;
  const hasRouteChanged = lastHash !== routeHash;
  lastHash = routeHash;
  document.querySelectorAll("[data-page]").forEach((page) => {
    page.classList.toggle("is-active", page.dataset.page === route.name);
  });

  const activeNav = route.name === "detail" ? "docs" : route.name === "experience-detail" ? "experience" : route.name;
  document.querySelectorAll("[data-route]").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.route === activeNav);
  });
  document.querySelectorAll("[data-nav-docs]").forEach((link) => {
    link.classList.toggle("is-active", activeNav === "docs");
  });

  if (route.type === "detail") {
    renderProjectDocument(route.projectKey);
    updateDocNavigation(route);
  }
  if (route.type === "experience-detail") renderExperienceDetail(route.experienceKey);

  mobileNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  document.querySelectorAll("[data-docs-dropdown]").forEach((dropdown) => {
    dropdown.classList.remove("is-open");
    dropdown.querySelector("[data-action='toggle-docs-menu']")?.setAttribute("aria-expanded", "false");
  });
  document.querySelector(".doc-sidebar")?.classList.remove("is-open");
  document.querySelector(".doc-sidebar-toggle")?.setAttribute("aria-expanded", "false");

  const shouldJumpToSection = route.type === "detail" && route.section && route.section !== "overview"
    || route.type === "experience-detail" && Boolean(route.section);
  if (hasRouteChanged) resetScrollPosition();
  window.setTimeout(() => {
    app.focus({ preventScroll: true });
    if (!hasRouteChanged) return;
    // 某些浏览器仍会在 focus 主内容后恢复旧滚动位置，因此再次即时归零。
    resetScrollPosition();
    if (shouldJumpToSection) {
      window.setTimeout(() => document.getElementById(route.section)?.scrollIntoView({ block: "start" }), 0);
    }
  }, 50);
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

function handleResume() {
  showToast("简历下载入口已预留，接入真实 PDF 后即可下载。");
}

async function copyEmail(button) {
  const email = "xerina@example.com";
  try {
    await navigator.clipboard.writeText(email);
    showToast("邮箱已复制：xerina@example.com");
  } catch {
    showToast("请手动复制邮箱：xerina@example.com");
  }
  button.blur();
}

document.addEventListener("click", (event) => {
  const routeLink = event.target.closest("[data-route]");
  if (routeLink) {
    event.preventDefault();
    navigate(routeLink.dataset.route);
    return;
  }

  const docLink = event.target.closest("[data-doc-section]");
  if (docLink) {
    event.preventDefault();
    const route = getRoute();
    navigate(`docs/${route.projectKey || "atlas"}#${docLink.dataset.docSection}`);
    return;
  }

  const action = event.target.closest("[data-action]");
  if (action) {
    const actionName = action.dataset.action;
    if (actionName === "menu") {
      const isOpen = mobileNav.classList.toggle("is-open");
      action.setAttribute("aria-expanded", String(isOpen));
    }
    if (actionName === "toggle-docs-menu") {
      const dropdown = action.closest("[data-docs-dropdown]");
      const isOpen = dropdown.classList.toggle("is-open");
      document.querySelectorAll("[data-docs-dropdown]").forEach((item) => {
        if (item !== dropdown) {
          item.classList.remove("is-open");
          item.querySelector("[data-action='toggle-docs-menu']")?.setAttribute("aria-expanded", "false");
        }
      });
      action.setAttribute("aria-expanded", String(isOpen));
    }
    if (actionName === "doc-sidebar") {
      const sidebar = document.querySelector(".doc-sidebar");
      const isOpen = sidebar.classList.toggle("is-open");
      action.setAttribute("aria-expanded", String(isOpen));
    }
    if (actionName === "toggle-doc-group") {
      const group = action.closest(".doc-tree-group");
      const isCollapsed = group.classList.toggle("is-collapsed");
      action.setAttribute("aria-expanded", String(!isCollapsed));
    }
    if (actionName === "resume") handleResume();
    if (actionName === "copy-email") copyEmail(action);
  }

  const projectFilter = event.target.closest("[data-filter]");
  if (projectFilter) {
    document.querySelectorAll("[data-filter]").forEach((button) => button.classList.toggle("is-active", button === projectFilter));
    const value = projectFilter.dataset.filter;
    document.querySelectorAll("[data-project-category]").forEach((card) => {
      card.hidden = value !== "all" && card.dataset.projectCategory !== value;
    });
  }

  const noteFilter = event.target.closest("[data-note-filter]");
  if (noteFilter) {
    document.querySelectorAll("[data-note-filter]").forEach((button) => button.classList.toggle("is-active", button === noteFilter));
    const value = noteFilter.dataset.noteFilter;
    document.querySelectorAll("[data-note-category]").forEach((row) => {
      row.hidden = value !== "all" && row.dataset.noteCategory !== value;
    });
  }

  if (!event.target.closest("[data-docs-dropdown]")) {
    document.querySelectorAll("[data-docs-dropdown]").forEach((dropdown) => {
      dropdown.classList.remove("is-open");
      dropdown.querySelector("[data-action='toggle-docs-menu']")?.setAttribute("aria-expanded", "false");
    });
  }
});

document.querySelector("[data-notes-search]")?.addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();
  document.querySelectorAll("[data-note-category]").forEach((row) => {
    row.hidden = !row.textContent.toLowerCase().includes(query);
  });
});

window.addEventListener("hashchange", renderRoute);
window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  document.querySelectorAll("[data-docs-dropdown]").forEach((dropdown) => {
    dropdown.classList.remove("is-open");
    dropdown.querySelector("[data-action='toggle-docs-menu']")?.setAttribute("aria-expanded", "false");
  });
});
renderRoute();
