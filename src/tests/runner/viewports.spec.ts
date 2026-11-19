import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as twd from '../../runner';
import {
  defineViewports,
  getViewportConfig,
  hasViewports,
  buildMediaQuery,
  getMatchingViewports,
  getEffectiveViewport,
  isInCurrentViewport,
  describeViewports,
  resetViewports,
} from '../../viewports';

const setWidth = (width: number) => {
  window.innerWidth = width;
};

const VIEWPORTS = {
  mobile: { maxWidth: 767 },
  tablet: { minWidth: 768, maxWidth: 1023 },
  desktop: { minWidth: 1024 },
};

describe('viewports', () => {
  beforeEach(() => {
    twd.clearTests();
    resetViewports();
    setWidth(1280);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('defineViewports', () => {
    it('starts empty, so projects that declare nothing are unaffected', () => {
      expect(hasViewports()).toBe(false);
      expect(getViewportConfig()).toEqual({ viewports: {}, defaultViewport: undefined });
    });

    it('stores the registry and the default on a shared global', () => {
      defineViewports(VIEWPORTS, { default: 'desktop' });
      expect(hasViewports()).toBe(true);
      expect(getViewportConfig()).toEqual({ viewports: VIEWPORTS, defaultViewport: 'desktop' });
      expect(window.__TWD_VIEWPORTS__).toEqual({
        viewports: VIEWPORTS,
        defaultViewport: 'desktop',
      });
    });

    it('replaces the registry when called again', () => {
      defineViewports(VIEWPORTS, { default: 'desktop' });
      defineViewports({ phone: { maxWidth: 500 } });
      expect(getViewportConfig()).toEqual({
        viewports: { phone: { maxWidth: 500 } },
        defaultViewport: undefined,
      });
    });

    it('notifies listeners so the sidebar can re-render', () => {
      const listener = vi.fn();
      window.addEventListener('twd:viewports-change', listener);
      defineViewports(VIEWPORTS);
      window.removeEventListener('twd:viewports-change', listener);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('throws when a definition has no bounds', () => {
      expect(() => defineViewports({ mobile: {} })).toThrow(
        'Viewport "mobile" needs minWidth, maxWidth or both',
      );
    });

    it('throws when minWidth is greater than maxWidth', () => {
      expect(() => defineViewports({ broken: { minWidth: 900, maxWidth: 300 } })).toThrow(
        'Viewport "broken" has minWidth (900) greater than maxWidth (300)',
      );
    });

    it('throws when a bound is not a non-negative number', () => {
      expect(() => defineViewports({ bad: { maxWidth: -1 } })).toThrow(
        'Viewport "bad" maxWidth must be a non-negative number',
      );
      expect(() => defineViewports({ bad: { minWidth: '768px' as unknown as number } })).toThrow(
        'Viewport "bad" minWidth must be a non-negative number',
      );
    });

    it('throws on names that are not safe identifiers', () => {
      expect(() => defineViewports({ Mobile: { maxWidth: 767 } })).toThrow(
        'Invalid viewport name "Mobile"',
      );
      expect(() => defineViewports({ 'small phone': { maxWidth: 400 } })).toThrow(
        'Invalid viewport name "small phone"',
      );
    });

    it('throws when the default is not one of the declared viewports', () => {
      expect(() => defineViewports(VIEWPORTS, { default: 'wide' })).toThrow(
        'defaultViewport "wide" is not a declared viewport',
      );
    });

    it('does not keep a half-applied registry after a throw', () => {
      defineViewports(VIEWPORTS);
      expect(() => defineViewports({ mobile: {} })).toThrow();
      expect(getViewportConfig().viewports).toEqual(VIEWPORTS);
    });
  });

  describe('buildMediaQuery', () => {
    it('builds the query for each definition shape', () => {
      expect(buildMediaQuery({ maxWidth: 767 })).toBe('(max-width: 767px)');
      expect(buildMediaQuery({ minWidth: 1024 })).toBe('(min-width: 1024px)');
      expect(buildMediaQuery({ minWidth: 768, maxWidth: 1023 })).toBe(
        '(min-width: 768px) and (max-width: 1023px)',
      );
    });
  });

  describe('getMatchingViewports', () => {
    beforeEach(() => {
      defineViewports(VIEWPORTS);
    });

    it('falls back to innerWidth when matchMedia is unavailable, bounds inclusive', () => {
      setWidth(767);
      expect(getMatchingViewports()).toEqual(['mobile']);
      setWidth(768);
      expect(getMatchingViewports()).toEqual(['tablet']);
      setWidth(1024);
      expect(getMatchingViewports()).toEqual(['desktop']);
    });

    it('uses matchMedia when available, the same rule CSS follows', () => {
      const matchMedia = vi.fn((query: string) => ({
        matches: query === '(max-width: 767px)',
      }));
      vi.stubGlobal('matchMedia', matchMedia);
      setWidth(1280); // ignored: matchMedia wins
      expect(getMatchingViewports()).toEqual(['mobile']);
      expect(matchMedia).toHaveBeenCalledWith('(max-width: 767px)');
      vi.unstubAllGlobals();
    });

    it('returns every viewport whose range overlaps, in registry order', () => {
      defineViewports({
        tablet: { minWidth: 768, maxWidth: 1279 },
        desktop: { minWidth: 1024 },
      });
      setWidth(1100);
      expect(getMatchingViewports()).toEqual(['tablet', 'desktop']);
    });
  });

  describe('describeViewports', () => {
    it('describes ranges for labels and warnings', () => {
      defineViewports(VIEWPORTS);
      expect(describeViewports(['desktop'])).toBe('desktop (min 1024px)');
      expect(describeViewports(['mobile'])).toBe('mobile (max 767px)');
      expect(describeViewports(['tablet', 'desktop'])).toBe(
        'tablet (768-1023px), desktop (min 1024px)',
      );
      expect(describeViewports(['deskop'])).toBe('unknown viewport "deskop"');
    });
  });

  describe('getEffectiveViewport', () => {
    const findByName = (name: string) =>
      Array.from(twd.handlers.values()).find((h) => h.name === name)!;

    it('is undefined for untagged tests without a default', () => {
      defineViewports(VIEWPORTS);
      twd.describe('Group', () => {
        twd.it('plain', () => {});
      });
      expect(getEffectiveViewport(findByName('plain'))).toBeUndefined();
    });

    it('uses defaultViewport for untagged tests', () => {
      defineViewports(VIEWPORTS, { default: 'desktop' });
      twd.describe('Group', () => {
        twd.it('plain', () => {});
      });
      expect(getEffectiveViewport(findByName('plain'))).toEqual(['desktop']);
    });

    it('inherits from the nearest describe that declares one', () => {
      defineViewports(VIEWPORTS, { default: 'desktop' });
      twd.describe('Outer', { viewport: 'tablet' }, () => {
        twd.describe('Inner', { viewport: 'mobile' }, () => {
          twd.it('deep', () => {});
        });
        twd.describe('Plain inner', () => {
          twd.it('from outer', () => {});
        });
      });
      expect(getEffectiveViewport(findByName('deep'))).toEqual(['mobile']);
      expect(getEffectiveViewport(findByName('from outer'))).toEqual(['tablet']);
    });

    it('lets the test replace the inherited value instead of intersecting', () => {
      defineViewports(VIEWPORTS);
      twd.describe('Header', { viewport: 'mobile' }, () => {
        twd.it('wide only', { viewport: ['tablet', 'desktop'] }, () => {});
      });
      expect(getEffectiveViewport(findByName('wide only'))).toEqual(['tablet', 'desktop']);
    });

    it('is resolved lazily, so a registry defined after the tests still applies', () => {
      twd.describe('Group', () => {
        twd.it('plain', () => {});
      });
      defineViewports(VIEWPORTS, { default: 'desktop' });
      expect(getEffectiveViewport(findByName('plain'))).toEqual(['desktop']);
    });
  });

  describe('isInCurrentViewport', () => {
    const findByName = (name: string) =>
      Array.from(twd.handlers.values()).find((h) => h.name === name)!;

    it('is always true when no viewports are declared, whatever the tags', () => {
      twd.describe('Group', () => {
        twd.it('tagged', { viewport: 'mobile' }, () => {});
      });
      expect(isInCurrentViewport(findByName('tagged'))).toBe(true);
    });

    it('matches untagged tests everywhere when there is no default', () => {
      defineViewports(VIEWPORTS);
      setWidth(390);
      twd.describe('Group', () => {
        twd.it('plain', () => {});
      });
      expect(isInCurrentViewport(findByName('plain'))).toBe(true);
    });

    it('matches when any of the names matches', () => {
      defineViewports(VIEWPORTS);
      setWidth(900);
      twd.describe('Group', () => {
        twd.it('tablet or desktop', { viewport: ['tablet', 'desktop'] }, () => {});
        twd.it('mobile', { viewport: 'mobile' }, () => {});
      });
      expect(isInCurrentViewport(findByName('tablet or desktop'))).toBe(true);
      expect(isInCurrentViewport(findByName('mobile'))).toBe(false);
    });

    it('never matches an unknown name and warns once per name', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      defineViewports(VIEWPORTS);
      twd.describe('Group', () => {
        twd.it('typo 1', { viewport: 'deskop' }, () => {});
        twd.it('typo 2', { viewport: 'deskop' }, () => {});
      });
      expect(isInCurrentViewport(findByName('typo 1'))).toBe(false);
      expect(isInCurrentViewport(findByName('typo 2'))).toBe(false);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain('Unknown viewport "deskop"');
    });
  });
});
