<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  ctaLabel: { type: String, default: 'Get Started' },
  ctaHref: { type: String, default: '/getting-started' },
  imageSrc: { type: String, default: '' },
  imageAlt: { type: String, default: '' },
});
</script>

<template>
  <section class="landing-hero" :class="{ 'landing-hero--no-image': !imageSrc }">
    <div class="landing-hero__content">
      <p v-if="eyebrow" class="landing-hero__eyebrow">{{ eyebrow }}</p>
      <h1 class="landing-hero__title">{{ title }}</h1>
      <p class="landing-hero__sub">{{ subtitle }}</p>
      <a :href="ctaHref" class="landing-hero__cta">{{ ctaLabel }} →</a>
    </div>
    <div v-if="imageSrc" class="landing-hero__visual">
      <img :src="imageSrc" :alt="imageAlt" loading="lazy" />
    </div>
  </section>
</template>

<style scoped>
.landing-hero {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 40px;
  align-items: center;
  padding: 32px 0 48px;
  border-bottom: 1px solid var(--vp-c-divider);
  margin-bottom: 40px;
}

.landing-hero--no-image {
  grid-template-columns: 1fr;
}

.landing-hero__eyebrow {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
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
}

.landing-hero__visual img {
  width: 100%;
  border-radius: 10px;
  border: 1px solid var(--vp-c-border);
  box-shadow: 0 12px 32px -12px rgba(0, 0, 0, 0.2);
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
