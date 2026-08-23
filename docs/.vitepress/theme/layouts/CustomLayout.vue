<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import TeekTheme from 'vitepress-theme-teek'
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'
import HomePage from '../components/HomePage.vue'
import ProjectIndexPage from '../components/ProjectIndexPage.vue'
import ExperienceIndexPage from '../components/ExperienceIndexPage.vue'
import NotesIndexPage from '../components/NotesIndexPage.vue'
import AboutPage from '../components/AboutPage.vue'
import PortfolioPage from '../components/PortfolioPage.vue'
import ImageLightbox from '../components/ImageLightbox.vue'
import ProjectDocLayout from './ProjectDocLayout.vue'
import ExperienceDetailLayout from './ExperienceDetailLayout.vue'

const { frontmatter } = useData()
const layout = computed(() => frontmatter.value.layout || 'doc')
</script>

<template>
  <div v-if="layout === 'home-custom'" class="atlas-site"><SiteHeader /><HomePage /><SiteFooter /></div>
  <div v-else-if="layout === 'projects-index'" class="atlas-site"><SiteHeader /><ProjectIndexPage /><SiteFooter /></div>
  <div v-else-if="layout === 'experience-index'" class="atlas-site"><SiteHeader /><ExperienceIndexPage /><SiteFooter /></div>
  <div v-else-if="layout === 'notes-index'" class="atlas-site"><SiteHeader /><NotesIndexPage /><SiteFooter /></div>
  <div v-else-if="layout === 'about-custom'" class="atlas-site"><SiteHeader /><AboutPage /><SiteFooter /></div>
  <div v-else-if="layout === 'portfolio-index'" class="atlas-site"><SiteHeader /><PortfolioPage /><SiteFooter /></div>
  <ProjectDocLayout v-else-if="layout === 'project-doc'" />
  <ExperienceDetailLayout v-else-if="layout === 'experience-detail'" />
  <TeekTheme.Layout v-else />
  <ImageLightbox />
</template>
