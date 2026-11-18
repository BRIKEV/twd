// Entry of dist/twd.global.js: an IIFE build that exposes window.TWD, for
// pages that can only run classic <script> tags (no import map, no modules).
// One file covers what twd-js/bundled, twd-js and twd-js/runner cover as ESM,
// and sharing one module graph keeps the runner and the sidebar on the same state.
export { initTWD } from './bundled';
export { twd, userEvent, screenDom, screenDomGlobal, expect } from './index';
export { describe, it, beforeEach, afterEach } from './runner';
