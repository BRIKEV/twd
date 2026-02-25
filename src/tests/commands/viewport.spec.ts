import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { twd } from '../../';

describe('twd viewport command', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.body.removeAttribute('style');
    document.getElementById('twd-viewport-styles')?.remove();
    document.getElementById('twd-viewport-badge')?.remove();
    // ensure resetViewport clears internal state
    twd.resetViewport();
  });

  it('should set body maxWidth, maxHeight, and centering styles', () => {
    twd.viewport(375, 667);

    const { style } = document.body;
    expect(style.maxWidth).toBe('375px');
    expect(style.minHeight).toBe('667px');
    expect(style.maxHeight).toBe('667px');
    expect(style.margin).toBe('0px auto');
    expect(style.overflow).toBe('auto');
    expect(style.boxSizing).toBe('border-box');
    expect(style.boxShadow).toBe('0 0 0 1px rgba(37, 99, 235, 0.4)');
  });

  it('should set only width when height is omitted', () => {
    twd.viewport(768);

    const { style } = document.body;
    expect(style.maxWidth).toBe('768px');
    expect(style.margin).toBe('0px auto');
    // height should remain at original (empty string in jsdom)
    expect(style.maxHeight).toBe('');
    expect(style.minHeight).toBe('');
  });

  it('should reset body styles when called with no arguments', () => {
    twd.viewport(375, 667);
    twd.viewport();

    const { style } = document.body;
    expect(style.maxWidth).toBe('');
    expect(style.maxHeight).toBe('');
    expect(style.minHeight).toBe('');
    expect(style.margin).toBe('');
    expect(style.overflow).toBe('');
  });

  it('should reset body styles via resetViewport()', () => {
    twd.viewport(375, 667);
    twd.resetViewport();

    const { style } = document.body;
    expect(style.maxWidth).toBe('');
    expect(style.maxHeight).toBe('');
    expect(style.margin).toBe('');
  });

  it('should update styles on multiple calls', () => {
    twd.viewport(375, 667);
    expect(document.body.style.maxWidth).toBe('375px');

    twd.viewport(1024, 768);
    expect(document.body.style.maxWidth).toBe('1024px');
    expect(document.body.style.maxHeight).toBe('768px');
  });

  it('should inject viewport badge style element', () => {
    twd.viewport(375, 667);

    const styleEl = document.getElementById('twd-viewport-styles');
    expect(styleEl).not.toBeNull();
    expect(styleEl?.tagName).toBe('STYLE');
  });

  it('should inject viewport badge with correct label', () => {
    twd.viewport(375, 667);

    const badge = document.getElementById('twd-viewport-badge');
    expect(badge).not.toBeNull();
    expect(badge?.textContent).toBe('375 \u00d7 667');
  });

  it('should show width-only label when height is omitted', () => {
    twd.viewport(768);

    const badge = document.getElementById('twd-viewport-badge');
    expect(badge?.textContent).toBe('768');
  });

  it('should remove badge on reset', () => {
    twd.viewport(375, 667);
    expect(document.getElementById('twd-viewport-badge')).not.toBeNull();

    twd.resetViewport();
    expect(document.getElementById('twd-viewport-badge')).toBeNull();
    expect(document.getElementById('twd-viewport-styles')).toBeNull();
  });

  it('should be a no-op when resetViewport is called without a prior viewport call', () => {
    // should not throw
    twd.resetViewport();
    expect(document.body.style.maxWidth).toBe('');
  });
});

describe('twd viewport media query support', () => {
  let originalInnerWidth: number;
  let originalInnerHeight: number;
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    document.body.innerHTML = '';
    document.body.removeAttribute('style');
    document.getElementById('twd-viewport-styles')?.remove();
    document.getElementById('twd-viewport-badge')?.remove();
    document.getElementById('twd-viewport-iframe')?.remove();
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
    originalMatchMedia = window.matchMedia;
    twd.resetViewport();
  });

  afterEach(() => {
    twd.resetViewport();
    // Ensure cleanup even if tests fail
    document.getElementById('twd-viewport-iframe')?.remove();
  });

  it('should override window.innerWidth to the simulated value', () => {
    twd.viewport(375, 667);
    expect(window.innerWidth).toBe(375);
  });

  it('should override window.innerHeight when height is provided', () => {
    twd.viewport(375, 667);
    expect(window.innerHeight).toBe(667);
  });

  it('should not override window.innerHeight when height is omitted', () => {
    twd.viewport(768);
    expect(window.innerWidth).toBe(768);
    // innerHeight should remain at original jsdom value
    expect(window.innerHeight).toBe(originalInnerHeight);
  });

  it('should restore window.innerWidth and innerHeight on reset', () => {
    twd.viewport(375, 667);
    expect(window.innerWidth).toBe(375);
    expect(window.innerHeight).toBe(667);

    twd.resetViewport();
    expect(window.innerWidth).toBe(originalInnerWidth);
    expect(window.innerHeight).toBe(originalInnerHeight);
  });

  it('should preserve matchMedia state through viewport lifecycle', () => {
    // In jsdom, matchMedia is undefined so it won't be replaced.
    // In a real browser, it would be replaced with the iframe's matchMedia.
    // Either way, after reset it should be back to the original.
    twd.viewport(375, 667);
    twd.resetViewport();
    expect(window.matchMedia).toBe(originalMatchMedia);
  });

  it('should create a hidden iframe for media query evaluation', () => {
    twd.viewport(375, 667);

    const iframe = document.getElementById('twd-viewport-iframe');
    expect(iframe).not.toBeNull();
    expect(iframe?.tagName).toBe('IFRAME');
    expect((iframe as HTMLIFrameElement).style.visibility).toBe('hidden');
  });

  it('should remove the iframe on reset', () => {
    twd.viewport(375, 667);
    expect(document.getElementById('twd-viewport-iframe')).not.toBeNull();

    twd.resetViewport();
    expect(document.getElementById('twd-viewport-iframe')).toBeNull();
  });

  it('should dispatch a resize event when viewport is set', () => {
    const listener = vi.fn();
    window.addEventListener('resize', listener);

    twd.viewport(375, 667);
    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener('resize', listener);
  });

  it('should dispatch a resize event when viewport is reset', () => {
    twd.viewport(375, 667);

    const listener = vi.fn();
    window.addEventListener('resize', listener);

    twd.resetViewport();
    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener('resize', listener);
  });

  it('should only have one iframe when viewport is called multiple times', () => {
    twd.viewport(375, 667);
    twd.viewport(1024, 768);

    const iframes = document.querySelectorAll('#twd-viewport-iframe');
    expect(iframes.length).toBe(1);
    expect(window.innerWidth).toBe(1024);
    expect(window.innerHeight).toBe(768);
  });

  it('should update innerWidth/innerHeight on subsequent calls', () => {
    twd.viewport(375, 667);
    expect(window.innerWidth).toBe(375);

    twd.viewport(1024, 768);
    expect(window.innerWidth).toBe(1024);
    expect(window.innerHeight).toBe(768);
  });
});
