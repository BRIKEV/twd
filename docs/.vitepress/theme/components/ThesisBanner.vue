<script setup>
defineProps({
  size: { type: String, default: 'lg' }, // 'lg' (homepage) | 'md' (landings)
});
</script>

<template>
  <div class="thesis-banner" :class="`thesis-banner--${size}`" aria-label="The TWD philosophy">
    <p class="thesis-line">
      <span class="thesis-text">Test what you </span><span class="thesis-accent">own</span><span class="thesis-text">.</span>
    </p>
    <p class="thesis-line">
      <span class="thesis-text">Mock what you </span><span class="thesis-accent">don't</span><span class="thesis-text">.</span>
    </p>
  </div>
</template>

<style scoped>
.thesis-banner {
  text-align: center;
  padding: 64px 16px;
  margin: 0 auto;
  max-width: 880px;
}

.thesis-line {
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0;
}

.thesis-line + .thesis-line {
  margin-top: 8px;
}

.thesis-text {
  color: var(--vp-c-text-1);
}

.thesis-accent {
  color: var(--vp-c-brand-1);
}

/* Size variants */
.thesis-banner--lg .thesis-line {
  font-size: 3rem;
}

.thesis-banner--md .thesis-line {
  font-size: 2rem;
}

@media (max-width: 768px) {
  .thesis-banner--lg {
    padding: 40px 16px;
  }
  .thesis-banner--lg .thesis-line {
    font-size: 1.75rem;
  }
  .thesis-banner--md .thesis-line {
    font-size: 1.375rem;
  }
}
</style>
