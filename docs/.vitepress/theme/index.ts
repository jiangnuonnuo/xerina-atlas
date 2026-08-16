import TeekTheme from 'vitepress-theme-teek'
import 'vitepress-theme-teek/index.css'
import './styles.css'
import CustomLayout from './layouts/CustomLayout.vue'
import HomePage from './components/HomePage.vue'
import ProjectIndexPage from './components/ProjectIndexPage.vue'
import ExperienceIndexPage from './components/ExperienceIndexPage.vue'
import NotesIndexPage from './components/NotesIndexPage.vue'
import AboutPage from './components/AboutPage.vue'
import ProjectVisual from './components/ProjectVisual.vue'
import MediaFigure from './components/MediaFigure.vue'
import MediaVideo from './components/MediaVideo.vue'
import InteractiveDiagram from './components/InteractiveDiagram.vue'
import DownloadLink from './components/DownloadLink.vue'

export default {
  ...TeekTheme,
  Layout: CustomLayout,
  async enhanceApp(context: any) {
    await TeekTheme.enhanceApp?.(context)
    context.app.component('HomePage', HomePage)
    context.app.component('ProjectIndexPage', ProjectIndexPage)
    context.app.component('ExperienceIndexPage', ExperienceIndexPage)
    context.app.component('NotesIndexPage', NotesIndexPage)
    context.app.component('AboutPage', AboutPage)
    context.app.component('ProjectVisual', ProjectVisual)
    context.app.component('MediaFigure', MediaFigure)
    context.app.component('MediaVideo', MediaVideo)
    context.app.component('InteractiveDiagram', InteractiveDiagram)
    context.app.component('DownloadLink', DownloadLink)
  },
}
