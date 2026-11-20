import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as twd from '../../runner';
import { defineViewports, resetViewports } from '../../viewports';

const VIEWPORTS = {
  mobile: { maxWidth: 767 },
  desktop: { minWidth: 1024 },
};

const findByName = (name: string) =>
  Array.from(twd.handlers.values()).find((h) => h.name === name)!;

const createRunner = () => {
  const ran: string[] = [];
  const skipped: string[] = [];
  const runner = new twd.TestRunner({
    onStart: (test) => ran.push(test.name),
    onPass: () => {},
    onFail: () => {},
    onSkip: (test) => skipped.push(test.name),
  });
  return { runner, ran, skipped };
};

describe('twd runner - viewport options', () => {
  beforeEach(() => {
    twd.clearTests();
    resetViewports();
    window.innerWidth = 1280;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('registration', () => {
    it('accepts options as the second argument on describe and it', () => {
      const testFn = vi.fn();
      twd.describe('Header', { viewport: 'mobile' }, () => {
        twd.it('opens burger menu', { viewport: ['mobile', 'desktop'] }, testFn);
      });
      expect(findByName('Header').viewport).toEqual(['mobile']);
      expect(findByName('opens burger menu').viewport).toEqual(['mobile', 'desktop']);
      expect(findByName('opens burger menu').handler).toBe(testFn);
      expect(findByName('opens burger menu').parent).toBe(findByName('Header').id);
    });

    it('keeps the two-argument form working with no viewport', () => {
      twd.describe('Plain', () => {
        twd.it('plain test', () => {});
      });
      expect(findByName('Plain').viewport).toBeUndefined();
      expect(findByName('plain test').viewport).toBeUndefined();
    });

    it('accepts options on .only and .skip variants', () => {
      twd.describe.only('Only suite', { viewport: 'mobile' }, () => {
        twd.it.only('only test', { viewport: 'desktop' }, () => {});
        twd.it.skip('skipped test', { viewport: 'mobile' }, () => {});
        twd.it.skip('skipped without body', { viewport: 'mobile' });
      });
      twd.describe.skip('Skip suite', { viewport: 'desktop' }, () => {});

      expect(findByName('Only suite')).toMatchObject({ only: true, viewport: ['mobile'] });
      expect(findByName('only test')).toMatchObject({ only: true, viewport: ['desktop'] });
      expect(findByName('skipped test')).toMatchObject({ skip: true, viewport: ['mobile'] });
      expect(findByName('skipped without body')).toMatchObject({
        skip: true,
        viewport: ['mobile'],
      });
      expect(findByName('Skip suite')).toMatchObject({ skip: true, viewport: ['desktop'] });
    });

    it('ignores an options object without viewport', () => {
      twd.describe('Group', {}, () => {
        twd.it('test', {}, () => {});
      });
      expect(findByName('Group').viewport).toBeUndefined();
      expect(findByName('test').viewport).toBeUndefined();
    });
  });

  describe('runAll', () => {
    it('runs everything when no viewports are declared, tags included', async () => {
      twd.describe('Group', () => {
        twd.it('mobile test', { viewport: 'mobile' }, () => {});
        twd.it('plain test', () => {});
      });
      const { runner, ran } = createRunner();
      await runner.runAll();
      expect(ran).toEqual(['mobile test', 'plain test']);
    });

    it('runs only the tests matching the current width', async () => {
      defineViewports(VIEWPORTS, { default: 'desktop' });
      window.innerWidth = 390;
      twd.describe('Header', () => {
        twd.it('shows nav links', () => {});
        twd.it('opens burger menu', { viewport: 'mobile' }, () => {});
      });
      twd.describe('Desktop only', () => {
        twd.it('wide table', () => {});
      });
      const suiteStarts: string[] = [];
      const { runner, ran, skipped } = createRunner();
      (runner as any).events.onSuiteStart = (s: twd.Handler) => suiteStarts.push(s.name);
      await runner.runAll();
      expect(ran).toEqual(['opens burger menu']);
      // Out-of-viewport tests are not part of the run at all: not reported as skipped.
      expect(skipped).toEqual([]);
      // A suite with nothing in scope is not entered.
      expect(suiteStarts).toEqual(['Header']);
    });

    it('runs untagged tests at every width when there is no default', async () => {
      defineViewports(VIEWPORTS);
      window.innerWidth = 390;
      twd.describe('Group', () => {
        twd.it('plain', () => {});
        twd.it('desktop', { viewport: 'desktop' }, () => {});
      });
      const { runner, ran } = createRunner();
      await runner.runAll();
      expect(ran).toEqual(['plain']);
    });

    it('freezes the set at run start, so a resize mid-run changes nothing', async () => {
      defineViewports(VIEWPORTS);
      window.innerWidth = 390;
      twd.describe('Group', () => {
        twd.it('mobile 1', { viewport: 'mobile' }, () => {
          window.innerWidth = 1280;
        });
        twd.it('mobile 2', { viewport: 'mobile' }, () => {});
        twd.it('desktop', { viewport: 'desktop' }, () => {});
      });
      const { runner, ran } = createRunner();
      await runner.runAll();
      expect(ran).toEqual(['mobile 1', 'mobile 2']);
    });

    it('applies .only inside the matching set only', async () => {
      defineViewports(VIEWPORTS);
      window.innerWidth = 390;
      twd.describe('Group', () => {
        twd.it.only('desktop only', { viewport: 'desktop' }, () => {});
        twd.it('mobile 1', { viewport: 'mobile' }, () => {});
        twd.it('mobile 2', { viewport: 'mobile' }, () => {});
      });
      const { runner, ran } = createRunner();
      await runner.runAll();
      // The out-of-viewport .only does not suppress the matching tests.
      expect(ran).toEqual(['mobile 1', 'mobile 2']);
    });

    it('still honours a matching .only', async () => {
      defineViewports(VIEWPORTS);
      window.innerWidth = 390;
      twd.describe('Group', () => {
        twd.it.only('mobile only', { viewport: 'mobile' }, () => {});
        twd.it('mobile other', { viewport: 'mobile' }, () => {});
      });
      const { runner, ran } = createRunner();
      await runner.runAll();
      expect(ran).toEqual(['mobile only']);
    });

    it('selects by name, ignoring the window, when a viewport is passed', async () => {
      defineViewports(VIEWPORTS);
      window.innerWidth = 1280;
      twd.describe('Group', () => {
        twd.it('plain', () => {});
        twd.it('mobile', { viewport: 'mobile' }, () => {});
        twd.it('desktop', { viewport: 'desktop' }, () => {});
      });
      const { runner, ran } = createRunner();
      await runner.runAll({ viewport: 'mobile' });
      expect(ran).toEqual(['plain', 'mobile']);
    });

    it('leaves untagged tests out of a named run when a default is set', async () => {
      defineViewports(VIEWPORTS, { default: 'desktop' });
      twd.describe('Group', () => {
        twd.it('plain', () => {});
        twd.it('mobile', { viewport: 'mobile' }, () => {});
      });
      const { runner, ran } = createRunner();
      await runner.runAll({ viewport: 'mobile' });
      expect(ran).toEqual(['mobile']);
    });
  });

  describe('viewportScope (public, for twd-cli)', () => {
    const register = () => {
      twd.describe('Group', () => {
        twd.it('burger', { viewport: 'mobile' }, () => {});
        twd.it('nav', { viewport: 'desktop' }, () => {});
        twd.it('plain', () => {});
        twd.it('typo', { viewport: 'deskop' }, () => {});
      });
    };
    const names = (scope: Set<string> | null) =>
      scope
        ? Array.from(scope)
            .map((id) => twd.handlers.get(id)!.name)
            .sort()
        : scope;

    it('returns null when no viewports are declared', () => {
      register();
      const { runner } = createRunner();
      expect(runner.viewportScope()).toBeNull();
    });

    it('returns the tests in scope at the current width', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      defineViewports(VIEWPORTS);
      register();
      const { runner } = createRunner();
      expect(names(runner.viewportScope())).toEqual(['nav', 'plain']);
      window.innerWidth = 390;
      expect(names(runner.viewportScope())).toEqual(['burger', 'plain']);
    });

    it('returns the tests for a named viewport without resizing', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      defineViewports(VIEWPORTS);
      register();
      const { runner } = createRunner();
      expect(names(runner.viewportScope({ viewport: 'mobile' }))).toEqual(['burger', 'plain']);
    });

    it('leaves untagged tests to the default viewport', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      defineViewports(VIEWPORTS, { default: 'desktop' });
      register();
      const { runner } = createRunner();
      expect(names(runner.viewportScope({ viewport: 'mobile' }))).toEqual(['burger']);
      expect(names(runner.viewportScope({ viewport: 'desktop' }))).toEqual(['nav', 'plain']);
    });

    it('is reachable from the page through window.__testRunner', () => {
      defineViewports(VIEWPORTS);
      register();
      const runner = new window.__testRunner({
        onStart: () => {},
        onPass: () => {},
        onFail: () => {},
      });
      expect(runner.viewportScope()).toBeInstanceOf(Set);
    });
  });

  describe('runByIds', () => {
    it('intersects the ids with the current viewport', async () => {
      defineViewports(VIEWPORTS);
      window.innerWidth = 390;
      twd.describe('Group', () => {
        twd.it('mobile', { viewport: 'mobile' }, () => {});
        twd.it('desktop', { viewport: 'desktop' }, () => {});
      });
      const { runner, ran } = createRunner();
      await runner.runByIds([findByName('mobile').id, findByName('desktop').id]);
      expect(ran).toEqual(['mobile']);
    });
  });

  describe('runSingle', () => {
    it('runs a test outside the current viewport', async () => {
      defineViewports(VIEWPORTS);
      window.innerWidth = 390;
      twd.describe('Group', () => {
        twd.it('desktop', { viewport: 'desktop' }, () => {});
      });
      const { runner, ran } = createRunner();
      await runner.runSingle(findByName('desktop').id);
      expect(ran).toEqual(['desktop']);
    });
  });

  describe('run events', () => {
    const collect = () => {
      const events: Array<{ type: string; detail: unknown }> = [];
      const types = ['twd:run-start', 'twd:test-end', 'twd:run-end'];
      const listener = (e: Event) =>
        events.push({ type: e.type, detail: (e as CustomEvent).detail });
      types.forEach((t) => window.addEventListener(t, listener));
      const stop = () => types.forEach((t) => window.removeEventListener(t, listener));
      return { events, stop };
    };

    it('announces start with the total, each test end, and the end of the run', async () => {
      defineViewports(VIEWPORTS);
      window.innerWidth = 390;
      twd.describe('Group', () => {
        twd.it('pass', { viewport: 'mobile' }, () => {});
        twd.it('fail', { viewport: 'mobile' }, () => {
          throw new Error('boom');
        });
        twd.it.skip('skip', { viewport: 'mobile' }, () => {});
        twd.it('desktop', { viewport: 'desktop' }, () => {});
      });
      const { events, stop } = collect();
      const { runner } = createRunner();
      await runner.runAll();
      stop();
      expect(events).toEqual([
        { type: 'twd:run-start', detail: { total: 3 } },
        { type: 'twd:test-end', detail: { status: 'pass' } },
        { type: 'twd:test-end', detail: { status: 'fail' } },
        { type: 'twd:test-end', detail: { status: 'skip' } },
        { type: 'twd:run-end', detail: null },
      ]);
    });

    it('announces a single run with a total of one', async () => {
      twd.describe('Group', () => {
        twd.it('only one', () => {});
      });
      const { events, stop } = collect();
      const { runner } = createRunner();
      await runner.runSingle(findByName('only one').id);
      stop();
      expect(events.map((e) => e.type)).toEqual(['twd:run-start', 'twd:test-end', 'twd:run-end']);
      expect(events[0].detail).toEqual({ total: 1 });
    });

    it('still ends the run when a hook throws outside a test', async () => {
      twd.describe('Group', () => {
        twd.it('ok', () => {});
      });
      const { events, stop } = collect();
      const { runner } = createRunner();
      (runner as any).events.onPass = () => {
        throw new Error('listener blew up');
      };
      await expect(runner.runAll()).rejects.toThrow('listener blew up');
      stop();
      expect(events.at(-1)?.type).toBe('twd:run-end');
    });
  });
});
