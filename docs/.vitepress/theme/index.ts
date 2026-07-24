import DefaultTheme from 'vitepress/theme'
import HomePage from './components/HomePage.vue'
import ThesisBanner from './components/ThesisBanner.vue'
import AdoptionLineDiagram from './components/AdoptionLineDiagram.vue'
import LandingHero from './components/LandingHero.vue'
import LandingCrossLinks from './components/LandingCrossLinks.vue'
import YouTubeEmbed from './components/YouTubeEmbed.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomePage', HomePage)
    app.component('ThesisBanner', ThesisBanner)
    app.component('AdoptionLineDiagram', AdoptionLineDiagram)
    app.component('LandingHero', LandingHero)
    app.component('LandingCrossLinks', LandingCrossLinks)
    app.component('YouTubeEmbed', YouTubeEmbed)
  },
}
