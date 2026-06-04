<script setup>
defineProps({
  heading: { type: String, default: 'Where to next' },
  links: {
    type: Array,
    required: true,
    // [{ href, title, blurb }]
  },
});
</script>

<template>
  <section class="landing-xlinks" aria-labelledby="landing-xlinks-heading">
    <h2 id="landing-xlinks-heading" class="landing-xlinks__heading">{{ heading }}</h2>
    <ul class="landing-xlinks__list">
      <li v-for="link in links" :key="link.href" class="landing-xlinks__item">
        <a :href="link.href" class="landing-xlinks__link">
          <span class="landing-xlinks__title">{{ link.title }} →</span>
          <span class="landing-xlinks__blurb">{{ link.blurb }}</span>
        </a>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.landing-xlinks {
  margin-top: 24px;
}

.landing-xlinks__heading {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 24px;
  letter-spacing: -0.01em;
}

.landing-xlinks__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.landing-xlinks__item {
  margin: 0;
}

.landing-xlinks__link {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px 22px;
  border: 1px solid var(--vp-c-border);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  transition: border-color 0.15s ease, transform 0.15s ease;
}

.landing-xlinks__link:hover,
.landing-xlinks__link:focus-visible {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-1px);
  outline: none;
}

.landing-xlinks__title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.landing-xlinks__blurb {
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--vp-c-text-3);
}
</style>
