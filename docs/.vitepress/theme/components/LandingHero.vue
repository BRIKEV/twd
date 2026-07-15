<script setup>
import { ref, onMounted } from 'vue'

defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  ctaLabel: { type: String, default: 'Get Started' },
  ctaHref: { type: String, default: '/getting-started' },
  imageSrc: { type: String, default: '' },
  imageAlt: { type: String, default: '' },
  // Optional autoplay loop shown instead of the image. The image becomes the
  // poster + the fallback for SSR/no-JS and prefers-reduced-motion users
  // (WCAG 2.3.3); a pause control is always rendered with it (WCAG 2.2.2).
  videoSrc: { type: String, default: '' },
});

const showVideo = ref(false)
const videoPaused = ref(false)
const videoEl = ref(null)

onMounted(() => {
  showVideo.value = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

function toggleVideo() {
  const video = videoEl.value
  if (!video) return
  if (video.paused) {
    video.play()
    videoPaused.value = false
  } else {
    video.pause()
    videoPaused.value = true
  }
}
</script>

<template>
  <section class="landing-hero" :class="{ 'landing-hero--no-image': !imageSrc }">
    <div class="landing-hero__content">
      <p v-if="eyebrow" class="landing-hero__eyebrow">{{ eyebrow }}</p>
      <h1 class="landing-hero__title">{{ title }}</h1>
      <p class="landing-hero__sub">{{ subtitle }}</p>
      <a :href="ctaHref" class="landing-hero__cta">{{ ctaLabel }} →</a>
    </div>
    <div v-if="imageSrc || videoSrc" class="landing-hero__visual">
      <template v-if="videoSrc && showVideo">
        <video
          ref="videoEl"
          :src="videoSrc"
          :poster="imageSrc || undefined"
          :aria-label="imageAlt"
          autoplay
          muted
          loop
          playsinline
        ></video>
        <button
          type="button"
          class="landing-hero__video-toggle"
          :aria-pressed="videoPaused"
          :aria-label="videoPaused ? 'Play hero animation' : 'Pause hero animation'"
          @click="toggleVideo"
        >
          <svg v-if="videoPaused" width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4 2.5v11l9-5.5-9-5.5z"/></svg>
          <svg v-else width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4 2h3v12H4zM9 2h3v12H9z"/></svg>
        </button>
      </template>
      <img v-else :src="imageSrc" :alt="imageAlt" loading="lazy" />
    </div>
  </section>
</template>

<style scoped>
.landing-hero {
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 40px;
  align-items: center;
  padding: 32px 0 48px;
  margin-bottom: 8px;
}

.landing-hero--no-image {
  grid-template-columns: 1fr;
}

.landing-hero__eyebrow {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--vp-c-brand-1);
  padding: 4px 14px;
  border: 1px solid var(--vp-c-brand-soft);
  border-radius: 999px;
  margin-bottom: 16px;
}

.landing-hero__title {
  font-size: 2.5rem;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--vp-c-text-1);
  margin: 0 0 16px;
}

.landing-hero__sub {
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--vp-c-text-2);
  margin: 0 0 24px;
}

.landing-hero__cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 22px;
  background: var(--vp-c-brand-btn);
  color: #fff;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.landing-hero__cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: var(--vp-c-brand-btn);
  color: #fff;
  text-decoration: none;
}

.landing-hero__visual {
  position: relative;
}

.landing-hero__visual img,
.landing-hero__visual video {
  display: block;
  width: 100%;
  border-radius: 10px;
  border: 1px solid var(--vp-c-border);
  box-shadow: 0 12px 32px -12px rgba(0, 0, 0, 0.2);
}

.landing-hero__video-toggle {
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  opacity: 0.85;
  transition: opacity 0.2s;
}

.landing-hero__video-toggle:hover,
.landing-hero__video-toggle:focus-visible {
  opacity: 1;
}

@media (max-width: 900px) {
  .landing-hero {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .landing-hero__title {
    font-size: 1.875rem;
  }
}
</style>
