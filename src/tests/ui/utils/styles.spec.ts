import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { injectStyles } from '../../../ui/utils/styles';

describe('injectStyles', () => {
  beforeEach(() => {
    // Clean up any injected style tag before each test
    document.getElementById('twd-styles')?.remove();
  });

  afterEach(() => {
    document.getElementById('twd-styles')?.remove();
  });

  it("injects a <style> tag with id='twd-styles'", () => {
    injectStyles();
    const el = document.getElementById('twd-styles');
    expect(el).not.toBeNull();
    expect(el?.tagName.toLowerCase()).toBe('style');
  });

  it('does not double-inject on repeated calls', () => {
    injectStyles();
    injectStyles();
    const all = document.querySelectorAll('#twd-styles');
    expect(all.length).toBe(1);
  });

  it('contains twd-btn class rule', () => {
    injectStyles();
    const el = document.getElementById('twd-styles');
    expect(el?.textContent).toContain('.twd-btn');
  });

  it('contains twd-sidebar class rule', () => {
    injectStyles();
    const el = document.getElementById('twd-styles');
    expect(el?.textContent).toContain('.twd-sidebar');
  });

  it('contains twd-spin keyframe', () => {
    injectStyles();
    const el = document.getElementById('twd-styles');
    expect(el?.textContent).toContain('twd-spin');
  });

  it('contains status class rules', () => {
    injectStyles();
    const el = document.getElementById('twd-styles');
    expect(el?.textContent).toContain('.twd-status-pass');
    expect(el?.textContent).toContain('.twd-status-fail');
    expect(el?.textContent).toContain('.twd-status-skip');
  });
});
