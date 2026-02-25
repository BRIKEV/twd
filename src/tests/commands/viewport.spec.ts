import { beforeEach, describe, expect, it } from 'vitest';
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
