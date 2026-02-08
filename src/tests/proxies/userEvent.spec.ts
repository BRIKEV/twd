import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';
import * as twd from '../../runner';
import { userEvent } from '../../proxies/userEvent';

describe('userEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should simulate user events', async () => {
    twd.describe('User Events', () => {
      twd.it('should log userEvent actions', async () => {
        const user = userEvent.setup();
        const input = document.createElement('input');
        document.body.appendChild(input);

        await user.click(input);
        expect(document.activeElement).toBe(input);

        await user.type(input, 'Hello');
        expect((input as HTMLInputElement).value).toBe('Hello');
      });
    });
    const tests = twd.handlers;
    const testArray = Array.from(tests.values());
    testArray[1].status = 'running';
    await testArray[1].handler();
    expect(testArray[1].logs).toContainEqual(expect.stringContaining('Event fired: Clicked element'));
    expect(testArray[1].logs).toContainEqual(expect.stringContaining('Event fired: Typed "Hello" into element'));
  });
});

describe('userEvent typing fallback', () => {
  let originalVisibilityState: PropertyDescriptor | undefined;
  let hasFocusSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    twd.handlers.clear();
    originalVisibilityState = Object.getOwnPropertyDescriptor(document, 'visibilityState');
    hasFocusSpy = vi.spyOn(document, 'hasFocus');
  });

  afterEach(() => {
    if (originalVisibilityState) {
      Object.defineProperty(document, 'visibilityState', originalVisibilityState);
    } else {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'visible',
      });
    }
    hasFocusSpy.mockRestore();
  });

  it('should set input value and dispatch events when document is hidden', async () => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    hasFocusSpy.mockReturnValue(false);

    const input = document.createElement('input');
    document.body.appendChild(input);

    const inputHandler = vi.fn();
    const changeHandler = vi.fn();
    input.addEventListener('input', inputHandler);
    input.addEventListener('change', changeHandler);

    twd.describe('Fallback hidden', () => {
      twd.it('types via fallback', async () => {
        await userEvent.type(input, 'fallback text');
      });
    });

    const testArray = Array.from(twd.handlers.values());
    const test = testArray[testArray.length - 1];
    test.status = 'running';
    await test.handler();

    expect(input.value).toBe('fallback text');
    expect(inputHandler).toHaveBeenCalled();
    expect(changeHandler).toHaveBeenCalled();
    expect(test.logs).toContainEqual('Event fired: Typed "fallback text" into element');

    document.body.removeChild(input);
  });

  it('should use fallback when document has no focus but is visible', async () => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
    hasFocusSpy.mockReturnValue(false);

    const input = document.createElement('input');
    document.body.appendChild(input);

    twd.describe('Fallback unfocused', () => {
      twd.it('types via fallback', async () => {
        await userEvent.type(input, 'no focus text');
      });
    });

    const testArray = Array.from(twd.handlers.values());
    const test = testArray[testArray.length - 1];
    test.status = 'running';
    await test.handler();

    expect(input.value).toBe('no focus text');

    document.body.removeChild(input);
  });
});
