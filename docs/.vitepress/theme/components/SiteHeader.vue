<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vitepress'
import { data as projects } from '../../data/projects.data'
import ItemIcon from './ItemIcon.vue'
import { relativeUrl } from '../utils/relative-url'

const route = useRoute()
const mobileOpen = ref(false)
const docsOpen = ref(false)

const navItems = [
  { text: '首页', href: '/' },
  { text: '实习经历', href: '/experience/' },
  { text: '项目经历', href: '/projects/' },
  { text: '作品集', href: '/portfolio/' },
  { text: '文章', href: '/notes/' },
  { text: '关于', href: '/about/' },
]

const currentPath = computed(() => route.path.replace(/index\.html$/, '').replace(/\.html$/, ''))

function isActive(href: string) {
  const normalized = href.replace(/index\.html$/, '').replace(/\.html$/, '')
  return normalized === '/' ? currentPath.value === '/' : currentPath.value.startsWith(normalized)
}

function resumeUrl() {
  return relativeUrl('/resume/xerina-java-backend-resume.pdf', route.path)
}

function url(path: string) { return relativeUrl(path, route.path) }

</script>

<template>
  <header class="site-header">
    <div class="container nav-shell">
      <a class="brand" :href="url('/')" aria-label="回到 Xerina 首页">
        <span class="brand-mark"><img :src="url('/brand/xerina-avatar.png')" alt="" width="128" height="128" fetchpriority="high" /></span>
        <span class="brand-copy">
          <strong>Xerina</strong>
            <small>AI Engineer &amp; Java Developer</small>
        </span>
      </a>

      <nav class="desktop-nav" aria-label="主导航">
        <a v-for="item in navItems.slice(0, 4)" :key="item.href" :href="url(item.href)" :class="{ 'is-active': isActive(item.href) }">{{ item.text }}</a>
        <div class="nav-dropdown" :class="{ 'is-open': docsOpen }">
          <button class="nav-dropdown-trigger" type="button" aria-haspopup="true" :aria-expanded="docsOpen" @click="docsOpen = !docsOpen">
            项目文档 <span aria-hidden="true">⌄</span>
          </button>
          <div class="nav-dropdown-panel" role="menu" aria-label="选择项目文档">
            <span class="nav-dropdown-label">SELECT PROJECT DOCUMENT</span>
            <a v-for="(project, index) in projects" :key="project.slug" class="nav-dropdown-item" role="menuitem" :href="url(project.url)" @click="docsOpen = false">
              <span class="nav-dropdown-icon"><ItemIcon :name="project.frontmatter.icon" :size="19" /></span>
              <span class="nav-dropdown-copy"><b>{{ String(index + 1).padStart(2, '0') }}</b><strong>{{ project.frontmatter.title }}</strong><small>{{ project.frontmatter.categoryLabel || project.frontmatter.category }}</small></span>
              <i aria-hidden="true">↗</i>
            </a>
          </div>
        </div>
        <a v-for="item in navItems.slice(4)" :key="item.href" :href="url(item.href)" :class="{ 'is-active': isActive(item.href) }">{{ item.text }}</a>
      </nav>

      <div class="nav-actions">
        <a class="text-button" :href="resumeUrl()" download>下载简历 <span aria-hidden="true">↗</span></a>
        <button class="icon-button menu-toggle" type="button" aria-label="打开菜单" :aria-expanded="mobileOpen" @click="mobileOpen = !mobileOpen">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
      </div>
    </div>

    <nav v-if="mobileOpen" class="mobile-nav is-open" aria-label="移动端主导航">
      <a v-for="item in navItems" :key="item.href" :href="url(item.href)" :class="{ 'is-active': isActive(item.href) }" @click="mobileOpen = false">{{ item.text }} <span>↗</span></a>
      <div class="mobile-nav-group" :class="{ 'is-open': docsOpen }">
        <button class="mobile-nav-docs-trigger" type="button" :aria-expanded="docsOpen" @click="docsOpen = !docsOpen">项目文档 <span>展开⌄</span></button>
        <div v-if="docsOpen" class="mobile-docs-menu" role="menu">
          <a v-for="project in projects" :key="project.slug" role="menuitem" :href="url(project.url)" @click="mobileOpen = false"><span>{{ project.frontmatter.title }}</span><b>↗</b></a>
        </div>
      </div>
    </nav>
  </header>

  <div class="sr-only" aria-live="polite">{{ route.path }}</div>
</template>
