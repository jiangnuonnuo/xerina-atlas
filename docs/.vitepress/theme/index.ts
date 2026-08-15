import Teek from "vitepress-theme-teek";
import "vitepress-theme-teek/index.css";
import type { Theme } from "vitepress";
import HomePage from "./components/HomePage.vue";
import ExperiencePage from "./components/ExperiencePage.vue";
import ProjectsPage from "./components/ProjectsPage.vue";
import ProjectDetail from "./components/ProjectDetail.vue";
import ArticlesPage from "./components/ArticlesPage.vue";
import AboutPage from "./components/AboutPage.vue";
import ResumePage from "./components/ResumePage.vue";
import "./styles/custom.css";

export default {
  extends: Teek,
  enhanceApp({ app }) {
    app.component("HomePage", HomePage);
    app.component("ExperiencePage", ExperiencePage);
    app.component("ProjectsPage", ProjectsPage);
    app.component("ProjectDetail", ProjectDetail);
    app.component("ArticlesPage", ArticlesPage);
    app.component("AboutPage", AboutPage);
    app.component("ResumePage", ResumePage);
  },
} satisfies Theme;

