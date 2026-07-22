// Generates docs/public/llms-full.txt: the full TWD documentation concatenated
// into a single file for LLM ingestion (the companion to the curated llms.txt).
// Run automatically before `vitepress build` (see package.json docs:build).
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS = join(__dirname, '..', 'docs');
const SITE = 'https://twd.dev';
const OUT = join(DOCS, 'public', 'llms-full.txt');

// Preferred order (mirrors docs/public/llms.txt for a coherent read). Any docs
// not listed here are appended afterwards in alphabetical order.
const ORDER = [
  'twd-manifesto.md', 'motivation.md',
  'twd-js.md', 'twd-relay.md', 'contract-testing.md',
  'getting-started.md', 'writing-tests.md', 'api-mocking.md', 'component-mocking.md',
  'module-mocking.md', 'frameworks.md', 'testing-library.md', 'ci-execution.md',
  'coverage.md', 'ai-overview.md', 'contract-testing-setup.md', 'theming.md',
  'twd-ai/setup.md', 'twd-ai/writing-tests.md', 'twd-ai/ci-setup.md',
  'twd-ai/test-gaps.md', 'twd-ai/test-quality.md', 'twd-ai/flow-gallery.md',
  'claude-plugin.md', 'agents.md', 'ai-remote-testing.md',
  'api/index.md', 'api/test-functions.md', 'api/twd-commands.md', 'api/assertions.md',
  'tutorial/index.md', 'tutorial/intro.md', 'tutorial/installation.md', 'tutorial/first-test.md',
  'tutorial/api-mocking.md', 'tutorial/ci-integration.md', 'tutorial/coverage.md',
  'tutorial/production-builds.md', 'tutorial/testing-library-selectors.md',
  'community.md', 'accessibility-statement.md',
];

// Pages that are Vue-component landing shells with no prose body.
const SKIP = new Set(['index.md']);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (['.vitepress', 'public', 'node_modules'].includes(entry)) continue;
      out.push(...walk(full));
    } else if (entry.endsWith('.md')) {
      out.push(relative(DOCS, full).replace(/\\/g, '/'));
    }
  }
  return out;
}

const stripFrontmatter = (src) => src.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
const stripHtmlComments = (src) => src.replace(/<!--[\s\S]*?-->/g, '');

function titleOf(src, rel) {
  const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const t = fm && fm[1].match(/^title:\s*(.+)$/m);
  if (t) return t[1].trim().replace(/^["']|["']$/g, '');
  const h1 = stripFrontmatter(src).match(/^#\s+(.+)$/m);
  return h1 ? h1[1].trim() : rel;
}

function urlOf(rel) {
  if (rel === 'index.md') return `${SITE}/`;
  const p = rel.replace(/\/index\.md$/, '/').replace(/\.md$/, '');
  return `${SITE}/${p}`;
}

const all = walk(DOCS).filter((rel) => !SKIP.has(rel));
const ordered = [
  ...ORDER.filter((f) => all.includes(f)),
  ...all.filter((f) => !ORDER.includes(f)).sort(),
];

const header = `# TWD (Test While Developing) - Full Documentation

> In-browser frontend testing for React, Vue, Angular, Solid, Astro, Nuxt, HTMX and vanilla JS. Runs in your real browser via Vite, Webpack, or a CDN. This file concatenates the full TWD documentation for LLM ingestion. For a concise index, see ${SITE}/llms.txt.
`;

let body = '';
let count = 0;
for (const rel of ordered) {
  const src = readFileSync(join(DOCS, rel), 'utf8');
  const title = titleOf(src, rel);
  let content = stripHtmlComments(stripFrontmatter(src)).trim();
  // Drop the leading H1 (we render our own title + source line for each page).
  content = content.replace(/^#\s+.+\r?\n+/, '');
  if (!content) continue;
  body += `\n\n\n# ${title}\nSource: ${urlOf(rel)}\n\n${content}\n`;
  count += 1;
}

writeFileSync(OUT, `${header}${body}\n`, 'utf8');
console.log(`Wrote ${relative(join(__dirname, '..'), OUT)} (${count} pages)`);
