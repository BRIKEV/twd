import { describe, it, expect } from 'vitest';
import * as TWD from '../../browser-global';

// src/browser-global.ts is the entry of dist/twd.global.js, the IIFE build that
// exposes window.TWD for classic <script> tags. Everything a single-file
// prototype needs must come from that one global.
describe('global build entry', () => {
  it('exposes the sidebar initializer', () => {
    expect(typeof TWD.initTWD).toBe('function');
  });

  it('exposes the test API', () => {
    expect(TWD.twd).toBeTypeOf('object');
    expect(TWD.userEvent).toBeDefined();
    expect(TWD.screenDom).toBeDefined();
    expect(TWD.screenDomGlobal).toBeDefined();
    expect(typeof TWD.expect).toBe('function');
  });

  it('exposes the runner', () => {
    expect(typeof TWD.describe).toBe('function');
    expect(typeof TWD.it).toBe('function');
    expect(typeof TWD.beforeEach).toBe('function');
    expect(typeof TWD.afterEach).toBe('function');
  });
});
