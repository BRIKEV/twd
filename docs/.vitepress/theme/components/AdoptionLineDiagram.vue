<script setup>
const stages = [
  {
    state: 'start',
    eyebrow: 'SIDEBAR',
    package: 'twd-js',
    description: 'Sidebar in your browser. Tests live where you build.',
    badge: 'START HERE',
    cta: 'Learn more',
    href: '/twd-js',
    umamiEvent: 'home_ecosystem_sidebar',
  },
  {
    state: 'optional',
    eyebrow: 'AI AGENT',
    package: 'twd-relay + twd-ai',
    description: 'Add when you use AI coding agents.',
    badge: '',
    cta: 'Learn more',
    href: '/twd-relay',
    umamiEvent: 'home_ecosystem_ai_agent',
  },
  {
    state: 'optional',
    eyebrow: 'CI',
    package: 'twd-cli',
    description: 'Add when you want CI, coverage, and contract validation.',
    badge: '',
    cta: 'Learn more',
    href: '/ci-execution',
    umamiEvent: 'home_ecosystem_ci',
  },
  {
    state: 'ship',
    eyebrow: 'SHIP',
    package: 'Merge with confidence',
    description: 'Contracts validated, tests green.',
    badge: '',
    cta: '',
    href: '',
    umamiEvent: '',
  },
];
</script>

<template>
  <ol class="adopt-line" aria-label="TWD adoption path">
    <template v-for="(stage, i) in stages" :key="stage.eyebrow">
      <li class="adopt-stage-wrap">
        <component
          :is="stage.href ? 'a' : 'div'"
          :href="stage.href || undefined"
          class="adopt-stage"
          :class="`adopt-stage--${stage.state}`"
          :data-umami-event="stage.umamiEvent || undefined"
        >
          <span v-if="stage.badge" class="adopt-badge" :class="`adopt-badge--${stage.state}`">{{ stage.badge }}</span>
          <span class="adopt-eyebrow">{{ stage.eyebrow }}</span>
          <span class="adopt-pkg">{{ stage.package }}</span>
          <span class="adopt-desc">{{ stage.description }}</span>
          <span v-if="stage.cta" class="adopt-cta">{{ stage.cta }} →</span>
        </component>
      </li>
      <li v-if="i < stages.length - 1" class="adopt-arrow" aria-hidden="true"></li>
    </template>
  </ol>
</template>

<style scoped>
.adopt-line {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.adopt-stage-wrap {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
}

.adopt-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 24px 20px 22px;
  border-radius: 10px;
  background: var(--pipeline-card-bg, var(--vp-c-bg-soft));
  text-decoration: none;
  color: inherit;
  width: 100%;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.adopt-stage--start {
  border: 2px solid var(--vp-c-brand-1);
}

.adopt-stage--optional {
  border: 1.5px dashed var(--vp-c-brand-1);
}

.adopt-stage--ship {
  border: 2px solid var(--pipeline-green);
  cursor: default;
}

a.adopt-stage:hover,
a.adopt-stage:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px -8px rgba(0, 0, 0, 0.25);
  outline: none;
}

.adopt-stage--start:hover,
.adopt-stage--start:focus-visible {
  border-color: var(--vp-c-brand-1);
}

.adopt-badge {
  position: absolute;
  top: -10px;
  left: 16px;
  padding: 2px 12px;
  border-radius: 10px;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  background: var(--vp-c-bg);
}

.adopt-badge--start {
  background: var(--vp-c-brand-btn);
  color: #fff;
}

.adopt-eyebrow {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--vp-c-brand-1);
  margin-top: 4px;
}

.adopt-stage--ship .adopt-eyebrow {
  color: var(--pipeline-green);
}

.adopt-pkg {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.adopt-desc {
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--vp-c-text-2);
  margin-top: 4px;
}

.adopt-cta {
  margin-top: auto;
  padding-top: 14px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

/* Arrow between cards (desktop only) */
.adopt-arrow {
  flex: 0 0 24px;
  align-self: center;
  height: 2px;
  background: var(--vp-c-brand-1);
  opacity: 0.4;
  position: relative;
}

.adopt-arrow::after {
  content: '';
  position: absolute;
  right: -5px;
  top: -4px;
  border-left: 6px solid var(--vp-c-brand-1);
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  opacity: 1;
}

/* Mobile: linearize vertical */
@media (max-width: 900px) {
  .adopt-line {
    flex-direction: column;
    gap: 0;
  }
  .adopt-stage-wrap {
    width: 100%;
  }
  .adopt-arrow {
    width: 2px;
    height: 24px;
    margin: 0 auto;
    background: var(--vp-c-brand-1);
  }
  .adopt-arrow::after {
    right: auto;
    top: auto;
    left: -3px;
    bottom: -5px;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 6px solid var(--vp-c-brand-1);
    border-bottom: none;
  }
}
</style>
