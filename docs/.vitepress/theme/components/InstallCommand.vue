<script setup>
import { ref, onBeforeUnmount } from 'vue'

const props = defineProps({
  command: { type: String, default: 'npm install twd-js' },
  umamiEvent: { type: String, default: '' },
})

const copied = ref(false)
let timer = null

async function copy() {
  try {
    await navigator.clipboard.writeText(props.command)
    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => { copied.value = false }, 1800)
  } catch {
    // Clipboard blocked (insecure context, permissions). The command is plain
    // text right there, so selecting it by hand still works.
  }
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="install">
    <code class="install-code"><span class="install-prompt" aria-hidden="true">$ </span>{{ command }}</code>
    <button
      type="button"
      class="install-copy"
      :class="{ 'is-copied': copied }"
      :data-umami-event="umamiEvent || undefined"
      :aria-label="copied ? 'Copied' : 'Copy install command'"
      @click="copy"
    >
      <svg v-if="copied" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5l3 3 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" stroke="currentColor" stroke-width="1.5"/></svg>
    </button>
    <span class="install-status" role="status">{{ copied ? 'Install command copied' : '' }}</span>
  </div>
</template>

<style scoped>
.install {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 46px;
  padding: 0 5px 0 16px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg-soft);
}

.install-code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
  white-space: nowrap;
}

.install-prompt {
  color: var(--vp-c-brand-1);
}

.install-copy {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.install-copy:hover {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.install-copy.is-copied {
  color: var(--pipeline-green);
}

.install-status {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
