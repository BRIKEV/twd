<script setup>
// The Testing Trophy (Kent C. Dodds), redrawn for TWD. Each layer is one grid
// row: the text on the left, its slice of the trophy on the right. The slices
// stretch vertically to the row height, so their edges stay joined however
// much the text wraps. On narrow screens the slices stack into one trophy of
// fixed size above the texts.
const layers = [
  {
    key: 'e2e',
    name: 'End to End',
    summary: 'A robot clicks through the deployed app, real backend included, to check the whole system works together.',
    note: 'Few of these. Slower, and the closest you get to production.',
    tools: [{ name: 'Playwright' }, { name: 'Cypress' }],
  },
  {
    key: 'integration',
    name: 'Integration',
    summary: 'Several units working together: your real app, its routes, providers and components, with only the network mocked. TWD runs these in the browser you develop in.',
    note: 'Also here: Testing Library with jsdom in Vitest or Jest, the classic setup. Same idea, in a simulated DOM.',
    tools: [{ name: 'TWD', primary: true }],
  },
  {
    key: 'unit',
    name: 'Unit',
    summary: 'One function, hook or component on its own, checked in isolation.',
    note: 'For a single component, TWD can render it in the same browser session.',
    tools: [{ name: 'Vitest' }, { name: 'Jest' }],
  },
  {
    key: 'static',
    name: 'Static',
    summary: 'Typos and type errors caught as you write the code.',
    note: 'twd-lint covers your test files: missing awaits, wrong imports, a forgotten it.only.',
    tools: [{ name: 'TypeScript' }, { name: 'ESLint' }, { name: 'twd-lint' }],
  },
]
</script>

<template>
  <figure class="trophy" aria-labelledby="trophy-caption">
    <p class="trophy-eyebrow">The four types of tests</p>

    <div class="trophy-grid">
      <template v-for="layer in layers" :key="layer.key">
        <div class="trophy-text" :class="`trophy-text--${layer.key}`">
          <h3 class="trophy-name">{{ layer.name }}</h3>
          <p class="trophy-summary">{{ layer.summary }}</p>
          <ul class="trophy-tools" :aria-label="`Tools for ${layer.name.toLowerCase()} tests`">
            <li
              v-for="tool in layer.tools"
              :key="tool.name"
              class="trophy-tool"
              :class="{ 'trophy-tool--primary': tool.primary }"
            >{{ tool.name }}</li>
          </ul>
          <p v-if="layer.note" class="trophy-note">{{ layer.note }}</p>
        </div>

        <div class="trophy-art" :class="`trophy-art--${layer.key}`" aria-hidden="true">
          <svg v-if="layer.key === 'e2e'" viewBox="0 70 200 70" preserveAspectRatio="xMidYMax meet">
            <g class="fill-lid">
              <circle cx="100" cy="86" r="9" />
              <rect x="96" y="92" width="8" height="12" />
              <path d="M44 128 C56 104 144 104 156 128 Z" />
              <rect x="16" y="128" width="168" height="12" rx="6" />
            </g>
            <rect class="fill-gold" x="88" y="103" width="24" height="3" rx="1.5" />
          </svg>

          <template v-else-if="layer.key === 'integration'">
            <svg viewBox="0 0 200 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="twd-trophy-body" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#2faaae" />
                  <stop offset="1" stop-color="#123956" />
                </linearGradient>
              </defs>
              <path d="M22 0 H178 L168 100 H32 Z" fill="url(#twd-trophy-body)" />
              <rect class="fill-gold" x="22" y="4" width="156" height="2.5" />
            </svg>
            <span class="trophy-badge">TWD</span>
          </template>

          <svg v-else-if="layer.key === 'unit'" viewBox="0 0 200 100" preserveAspectRatio="none">
            <path class="fill-silver" d="M32 0 H168 L172 50 C172 84 142 100 120 100 H80 C58 100 28 84 28 50 Z" />
          </svg>

          <svg v-else viewBox="0 0 200 100" preserveAspectRatio="none">
            <path class="fill-base" d="M80 0 H120 L113 38 C113 54 150 62 157 80 L162 100 H38 L43 80 C50 62 87 54 87 38 Z" />
            <rect class="fill-gold" x="86" y="30" width="28" height="2.5" />
          </svg>
        </div>
      </template>
    </div>

    <figcaption id="trophy-caption" class="trophy-caption">
      The Testing Trophy by
      <a href="https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications" target="_blank" rel="noopener">Kent C. Dodds</a>,
      redrawn for TWD. Learn the full strategy at
      <a href="https://www.testingjavascript.com/" target="_blank" rel="noopener">TestingJavaScript.com</a>.
    </figcaption>
  </figure>
</template>

<style scoped>
.trophy {
  --trophy-gold: #b7790f;
  --trophy-silver: #b4bac3;
  --trophy-base: #2b3038;
  --trophy-lid: #123956;
  --trophy-gold-text: #8a5a00;
  margin: 32px 0;
}

.dark .trophy {
  --trophy-gold: #e2a93b;
  --trophy-silver: #8b929c;
  --trophy-base: #3d434d;
  --trophy-lid: #1a5270;
  --trophy-gold-text: #e2a93b;
}

.trophy-eyebrow {
  margin: 0 0 12px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--trophy-gold-text);
}

.trophy-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  column-gap: 40px;
}

.trophy-text {
  padding: 20px 0;
  border-top: 1px solid var(--vp-c-divider);
}

.trophy-text--e2e { min-height: 160px; }
.trophy-text--integration { min-height: 240px; }
.trophy-text--unit { min-height: 130px; }
.trophy-text--static { min-height: 130px; }

.trophy-text--integration {
  border-top: 2px solid var(--vp-c-brand-1);
}

.vp-doc .trophy-name {
  margin: 0 0 6px;
  padding: 0;
  border: 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.trophy-text--integration .trophy-name {
  color: var(--vp-c-brand-1);
}

/* Marker tying each text to its slice of the trophy */
.vp-doc .trophy-name::before {
  content: '';
  display: inline-block;
  width: 0.6em;
  height: 0.6em;
  margin-right: 0.4em;
  border-radius: 3px;
  vertical-align: 0.08em;
  background: var(--marker);
}

.trophy-text--e2e { --marker: var(--trophy-lid); }
.trophy-text--integration { --marker: linear-gradient(135deg, #2faaae, #123956); }
.trophy-text--unit { --marker: var(--trophy-silver); }
.trophy-text--static { --marker: var(--trophy-base); }

.vp-doc .trophy-summary {
  margin: 0;
  color: var(--vp-c-text-1);
  line-height: 1.55;
}

.vp-doc .trophy-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.vp-doc .trophy-tool {
  margin: 0;
  padding: 2px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.vp-doc .trophy-tool--primary {
  border-color: var(--vp-c-brand-btn);
  background: var(--vp-c-brand-btn);
  color: #fff;
}

.vp-doc .trophy-note {
  margin: 10px 0 0;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}

.trophy-art {
  position: relative;
}

.trophy-art svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.fill-gold { fill: var(--trophy-gold); }
.fill-silver { fill: var(--trophy-silver); }
.fill-base { fill: var(--trophy-base); }
.fill-lid { fill: var(--trophy-lid); }

.trophy-badge {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.25rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #fff;
}

.trophy-caption {
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

@media (max-width: 640px) {
  .trophy-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  /* The four slices first, as one trophy, then the four texts */
  .trophy-art {
    grid-column: 1;
    justify-self: center;
    width: 180px;
  }
  .trophy-art--e2e { grid-row: 1; height: 90px; }
  .trophy-art--integration { grid-row: 2; height: 170px; }
  .trophy-art--unit { grid-row: 3; height: 90px; }
  .trophy-art--static { grid-row: 4; height: 90px; margin-bottom: 24px; }

  .trophy-text { grid-column: 1; min-height: 0; }
  .trophy-text--e2e { grid-row: 5; }
  .trophy-text--integration { grid-row: 6; }
  .trophy-text--unit { grid-row: 7; }
  .trophy-text--static { grid-row: 8; }

  .vp-doc .trophy-name { font-size: 1.25rem; }

  .trophy-badge { font-size: 2.25rem; }
}
</style>
