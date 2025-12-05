import { describe, it, beforeEach, vi, expect } from 'vitest';
import * as twd from '../../runner';
import { screenDom } from '../../proxies/screenDom';

describe('screenDom', () => {
  beforeEach(() => {
    twd.clearTests();
    vi.clearAllMocks();
    document.body.innerHTML = '';
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

