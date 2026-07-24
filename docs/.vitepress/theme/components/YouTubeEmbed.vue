<script setup>
import { ref } from 'vue'

// Click-to-play YouTube facade. Renders a poster with a play button and only
// loads the (privacy-friendly, cookie-less) youtube-nocookie iframe once the
// user clicks — so no YouTube script or cookie touches the page on load.
const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, default: 'Watch the video' },
  poster: { type: String, default: '/images/twd-agent-loop-poster.jpg' }
})

const loaded = ref(false)
</script>

<template>
  <div class="yt-embed">
    <button
      v-if="!loaded"
      type="button"
      class="yt-facade"
      :style="{ backgroundImage: `url(${poster})` }"
      :aria-label="`Play video: ${title}`"
      @click="loaded = true"
    >
      <span class="yt-play" aria-hidden="true">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </span>
    </button>
    <iframe
      v-else
      class="yt-iframe"
      :src="`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`"
      :title="title"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    ></iframe>
  </div>
</template>

<style scoped>
.yt-embed {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  margin: 24px 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg-soft);
}

.yt-facade,
.yt-iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.yt-facade {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  background-size: cover;
  background-position: center;
  background-color: #0e1f26;
  transition: filter 0.2s ease;
}

.yt-facade:hover,
.yt-facade:focus-visible {
  filter: brightness(1.05);
}

.yt-play {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  border-radius: 50%;
  color: #fff;
  background: rgba(229, 48, 43, 0.92); /* YouTube red */
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
  padding-left: 4px; /* optically center the play triangle */
  transition: transform 0.2s ease;
}

.yt-facade:hover .yt-play,
.yt-facade:focus-visible .yt-play {
  transform: scale(1.06);
}
</style>
