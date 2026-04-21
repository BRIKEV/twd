import { describe, it, beforeEach, vi, expect } from 'vitest';
import * as twd from '../../runner';
import { screenDom, screenDomGlobal, setRootSelector, resetScreenDomState } from '../../proxies/screenDom';

describe('screenDom', () => {
  beforeEach(() => {
    twd.clearTests();
    vi.clearAllMocks();
    document.body.innerHTML = '';
    resetScreenDomState();
  });

  it('should not select buton in sidebar', () => {
    const sidebar = document.createElement('div');
    sidebar.id = 'twd-sidebar-root';
    document.body.appendChild(sidebar);
    const sidebarContent = document.createElement('div');
    sidebarContent.id = 'twd-sidebar-content';
    sidebar.appendChild(sidebarContent);
    const sideBarButton = document.createElement('button');
    sideBarButton.textContent = 'Click me';
    sidebarContent.appendChild(sideBarButton);
    const button = document.createElement('button');
    button.textContent = 'Click me';
    document.body.appendChild(button);
    expect(screenDom.getByText('Click me')).toBeInTheDocument();
  });

  it('should prefer #root over other body children regardless of order', () => {
    const decoy = document.createElement('div');
    decoy.id = 'highlighter';
    const decoyButton = document.createElement('button');
    decoyButton.textContent = 'Click me';
    decoy.appendChild(decoyButton);
    document.body.appendChild(decoy);

    const root = document.createElement('div');
    root.id = 'root';
    const rootButton = document.createElement('button');
    rootButton.textContent = 'Submit';
    root.appendChild(rootButton);
    document.body.appendChild(root);

    expect(screenDom.getByText('Submit')).toBeInTheDocument();
    expect(screenDom.queryByText('Click me')).toBeNull();
  });

  it('should prefer #app when #root is absent', () => {
    const app = document.createElement('div');
    app.id = 'app';
    const appButton = document.createElement('button');
    appButton.textContent = 'Vue button';
    app.appendChild(appButton);
    document.body.appendChild(app);

    expect(screenDom.getByText('Vue button')).toBeInTheDocument();
  });

  it('should prefer app-root when #root and #app are absent', () => {
    const ng = document.createElement('app-root');
    const ngButton = document.createElement('button');
    ngButton.textContent = 'Angular button';
    ng.appendChild(ngButton);
    document.body.appendChild(ng);

    expect(screenDom.getByText('Angular button')).toBeInTheDocument();
  });

  it('should skip empty body children in the heuristic fallback', () => {
    // No #root / #app / app-root — must fall back to the heuristic
    const empty = document.createElement('div');
    empty.id = 'highlighter';
    document.body.appendChild(empty);

    const custom = document.createElement('div');
    custom.id = 'custom-app';
    const customText = document.createElement('span');
    customText.textContent = 'Hello custom';
    custom.appendChild(customText);
    document.body.appendChild(custom);

    expect(screenDom.getByText('Hello custom')).toBeInTheDocument();
  });

  it('should use configured rootSelector when provided', () => {
    const custom = document.createElement('div');
    custom.id = 'my-app';
    const customText = document.createElement('span');
    customText.textContent = 'Custom app content';
    custom.appendChild(customText);
    document.body.appendChild(custom);

    const root = document.createElement('div');
    root.id = 'root';
    const rootText = document.createElement('span');
    rootText.textContent = 'Default root content';
    root.appendChild(rootText);
    document.body.appendChild(root);

    setRootSelector('#my-app');

    expect(screenDom.getByText('Custom app content')).toBeInTheDocument();
    expect(screenDom.queryByText('Default root content')).toBeNull();
  });

  it('should warn exactly once when falling back to the heuristic', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // No #root / #app / app-root — heuristic will fire
    const custom = document.createElement('div');
    custom.id = 'custom-app';
    custom.textContent = 'Hello';
    document.body.appendChild(custom);

    screenDom.getByText('Hello');
    screenDom.getByText('Hello');
    screenDom.getByText('Hello');

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain('[TWD]');
    expect(warnSpy.mock.calls[0][0]).toContain('rootSelector');

    warnSpy.mockRestore();
  });

  it('should not warn when a configured rootSelector matches', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const custom = document.createElement('div');
    custom.id = 'my-app';
    custom.textContent = 'Hello';
    document.body.appendChild(custom);

    setRootSelector('#my-app');
    screenDom.getByText('Hello');

    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('should fall through to priority list without warning when configured rootSelector does not match but priority list matches', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const root = document.createElement('div');
    root.id = 'root';
    root.textContent = 'Priority hit';
    document.body.appendChild(root);

    setRootSelector('#does-not-exist');

    // #root is matched via priority list — no warn because priority list succeeded
    expect(screenDom.getByText('Priority hit')).toBeInTheDocument();
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('should warn when configured selector misses AND priority list misses', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const custom = document.createElement('div');
    custom.id = 'custom-app';
    custom.textContent = 'Heuristic hit';
    document.body.appendChild(custom);

    setRootSelector('#does-not-exist');

    expect(screenDom.getByText('Heuristic hit')).toBeInTheDocument();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });

  it('should throw an error if we have two buttons one in sidebar and one in the body using global screen selector', () => {
    const sidebar = document.createElement('div');
    sidebar.id = 'twd-sidebar-root';
    document.body.appendChild(sidebar);
    const sidebarContent = document.createElement('div');
    sidebarContent.id = 'twd-sidebar-content';
    sidebar.appendChild(sidebarContent);
    const sideBarButton = document.createElement('button');
    sideBarButton.textContent = 'Click me';
    sidebarContent.appendChild(sideBarButton);
    const button = document.createElement('button');
    button.textContent = 'Click me';
    document.body.appendChild(button);
    expect(() => screenDomGlobal.getByText('Click me')).toThrow();
  });

  it('should log query messages for getBy methods', async () => {
    const div = document.createElement('div');
    div.textContent = 'Hello World';
    document.body.appendChild(div);

    twd.describe('Screen Queries', () => {
      twd.it('should log getByText', async () => {
        screenDom.getByText('Hello World');
        screenDom.logTestingPlaygroundURL;
        // @ts-expect-error - prettyDOM is not a function but we want to test the call within
        screenDom.prettyDOM;
      });
    });

    const tests = twd.handlers;
    const testArray = Array.from(tests.values());
    testArray[1].status = 'running';
    await testArray[1].handler();
    expect(testArray[1].logs).toContainEqual(expect.stringContaining('query: getByText("Hello World")'));
  });

  it('should log query messages for queryBy methods', async () => {
    const button = document.createElement('button');
    button.textContent = 'Click me';
    document.body.appendChild(button);

    twd.describe('Screen Queries', () => {
      twd.it('should log queryByRole', async () => {
        screenDom.queryByRole('button');
      });
    });

    const tests = twd.handlers;
    const testArray = Array.from(tests.values());
    testArray[1].status = 'running';
    await testArray[1].handler();
    expect(testArray[1].logs).toContainEqual(expect.stringContaining('query: queryByRole("button")'));
  });

  it('should log query messages for getAllBy methods', async () => {
    const div1 = document.createElement('div');
    div1.textContent = 'Item 1';
    const div2 = document.createElement('div');
    div2.textContent = 'Item 1';
    document.body.appendChild(div1);
    document.body.appendChild(div2);

    twd.describe('Screen Queries', () => {
      twd.it('should log getAllByText', async () => {
        try {
          screenDom.getAllByText('Item 1');
        } catch (e) {
          // getAllByText might throw if elements don't match exactly, but we still want to test the log
        }
      });
    });

    const tests = twd.handlers;
    const testArray = Array.from(tests.values());
    testArray[1].status = 'running';
    await testArray[1].handler();
    expect(testArray[1].logs).toContainEqual(expect.stringContaining('query: getAllByText("Item 1")'));
  });

  it('should log query messages for queryAllBy methods', async () => {
    const button1 = document.createElement('button');
    button1.textContent = 'Button 1';
    const button2 = document.createElement('button');
    button2.textContent = 'Button 2';
    document.body.appendChild(button1);
    document.body.appendChild(button2);

    twd.describe('Screen Queries', () => {
      twd.it('should log queryAllByRole', async () => {
        screenDom.queryAllByRole('button');
      });
    });

    const tests = twd.handlers;
    const testArray = Array.from(tests.values());
    testArray[1].status = 'running';
    await testArray[1].handler();
    expect(testArray[1].logs).toContainEqual(expect.stringContaining('query: queryAllByRole("button")'));
  });

  it('should log debug message for prettyDOM if available', async () => {
    // prettyDOM might not be on screen, so we'll test if it exists
    if (typeof (screenDom as any).prettyDOM === 'function') {
      twd.describe('Screen Queries', () => {
        twd.it('should log prettyDOM', async () => {
          (screenDom as any).prettyDOM();
        });
      });

      const tests = twd.handlers;
      const testArray = Array.from(tests.values());
      testArray[1].status = 'running';
      await testArray[1].handler();
      expect(testArray[1].logs).toContainEqual(expect.stringContaining('debug: prettyDOM called'));
    }
  });

  it('should log debug message for logDOM if available', async () => {
    // logDOM might not be on screen, so we'll test if it exists
    if (typeof (screenDom as any).logDOM === 'function') {
      twd.describe('Screen Queries', () => {
        twd.it('should log logDOM', async () => {
          (screenDom as any).logDOM();
        });
      });

      const tests = twd.handlers;
      const testArray = Array.from(tests.values());
      testArray[1].status = 'running';
      await testArray[1].handler();
      expect(testArray[1].logs).toContainEqual(expect.stringContaining('debug: logDOM called'));
    }
  });

  it('should log async utility message for waitFor if available', async () => {
    // waitFor might not be on screen, so we'll test if it exists
    if (typeof (screenDom as any).waitFor === 'function') {
      twd.describe('Screen Queries', () => {
        twd.it('should log waitFor', async () => {
          await (screenDom as any).waitFor(() => {
            return Promise.resolve();
          });
        });
      });

      const tests = twd.handlers;
      const testArray = Array.from(tests.values());
      testArray[1].status = 'running';
      await testArray[1].handler();
      expect(testArray[1].logs).toContainEqual(expect.stringContaining('async utility: waitFor executed'));
    }
  });

  it('should not log for non-function properties', async () => {
    twd.describe('Screen Queries', () => {
      twd.it('should not log non-function properties', async () => {
        // Access a non-function property - screenDom itself is an object, not a function call
        // So accessing it shouldn't trigger logging
      });
    });

    const tests = twd.handlers;
    const testArray = Array.from(tests.values());
    testArray[1].status = 'running';
    await testArray[1].handler();
    // Should not have any logs from accessing non-function properties
    expect(testArray[1].logs).toEqual([]);
  });

  it('should handle multiple query calls and log all of them', async () => {
    const div = document.createElement('div');
    div.textContent = 'Test';
    document.body.appendChild(div);

    twd.describe('Screen Queries', () => {
      twd.it('should log multiple queries', async () => {
        screenDom.getByText('Test');
        // queryByRole might not find anything, but should still log
        screenDom.queryByRole('button');
        try {
          screenDom.getAllByText('Test');
        } catch (e) {
          // getAllByText might throw, but we still want to test the log
        }
      });
    });

    const tests = twd.handlers;
    const testArray = Array.from(tests.values());
    testArray[1].status = 'running';
    await testArray[1].handler();
    expect(testArray[1].logs).toContainEqual(expect.stringContaining('query: getByText("Test")'));
    expect(testArray[1].logs).toContainEqual(expect.stringContaining('query: queryByRole("button")'));
    expect(testArray[1].logs).toContainEqual(expect.stringContaining('query: getAllByText("Test")'));
  });
});

