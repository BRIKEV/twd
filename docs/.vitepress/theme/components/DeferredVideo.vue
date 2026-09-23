<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

// Autoplay loop with the same progressive-enhancement contract everywhere on
// the landing: SSR and no-JS render the poster; the video only mounts client
// side when the visitor has not asked for reduced motion (WCAG 2.3.3), and a
// pause control always ships with it (WCAG 2.2.2).
//
// mode="eager" plays as soon as it mounts (above the fold). mode="lazy" waits
// until the video scrolls into view and pauses when it leaves, which keeps its
// bytes off the initial critical path.
const props = defineProps({
  src: { type: String, required: true },
  poster: { type: String, required: true },
  // Describes what happens in the clip. Used as the video's aria-label and the
  // poster's alt text.
  label: { type: String, required: true },
  // Short noun for the pause control: "Pause the <name>" / "Play the <name>".
  name: { type: String, default: 'animation' },
  mode: { type: String, default: 'lazy' },
  width: { type: [Number, String], default: 1280 },
  height: { type: [Number, String], default: 720 },
})

const showVideo = ref(false)
const paused = ref(false)
const userPaused = ref(false)
const videoEl = ref(null)
let observer = null

onMounted(() => {
  const allowMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  showVideo.value = allowMotion
  if (!allowMotion || props.mode === 'eager') return
  nextTick(() => {
    const video = videoEl.value
    if (!video) return
    if (!('IntersectionObserver' in window)) {
      video.play().catch(() => {})
      return
    }
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (!userPaused.value) video.play().catch(() => {})
      } else {
        video.pause()
      }
    }, { threshold: 0.25 })
    observer.observe(video)
  })
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})

function toggle() {
  const video = videoEl.value
  if (!video) return
  if (video.paused) {
    userPaused.value = false
    video.play().catch(() => {})
    paused.value = false
  } else {
    userPaused.value = true
    video.pause()
    paused.value = true
  }
}
</script>

<template>
  <div class="dvideo">
    <template v-if="showVideo">
      <video
        ref="videoEl"
        class="dvideo-media"
        :src="src"
        :poster="poster"
        :aria-label="label"
        :autoplay="mode === 'eager'"
        :preload="mode === 'eager' ? 'auto' : 'none'"
        :width="width"
        :height="height"
        muted
        loop
        playsinline
      ></video>
      <button
        type="button"
        class="dvideo-toggle"
        :aria-pressed="paused"
        :aria-label="paused ? `Play the ${name}` : `Pause the ${name}`"
        @click="toggle"
      >
        <svg v-if="paused" width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4 2.5v11l9-5.5-9-5.5z"/></svg>
        <svg v-else width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4 2h3v12H4zM9 2h3v12H9z"/></svg>
      </button>
    </template>
    <img
      v-else
      class="dvideo-media"
      :src="poster"
      :alt="label"
      :width="width"
      :height="height"
      loading="lazy"
    />
  </div>
</template>

<style scoped>
.dvideo {
  position: relative;
}

.dvideo-media {
  display: block;
  width: 100%;
  height: auto;
  /* Reserve the box before the deferred poster paints (avoids CLS). */
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.dvideo-toggle {
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

.dvideo-toggle:hover,
.dvideo-toggle:focus-visible {
  opacity: 1;
}
</style>
