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
        expect(input.value).toBe('Hello');
      });
    });
    const tests = twd.handlers;
    const testArray = Array.from(tests.values());
    testArray[1].status = 'running';
    await testArray[1].handler();
    expect(testArray[1].logs).toContainEqual(
      expect.stringContaining('Event fired: Clicked element'),
    );
    expect(testArray[1].logs).toContainEqual(
      expect.stringContaining('Event fired: Typed "Hello" into element'),
    );
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

describe('userEvent clear fallback', () => {
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

  it('should clear input value and dispatch events when document is hidden', async () => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    hasFocusSpy.mockReturnValue(false);

    const input = document.createElement('input');
    input.value = 'existing text';
    document.body.appendChild(input);

    const inputHandler = vi.fn();
    const changeHandler = vi.fn();
    input.addEventListener('input', inputHandler);
    input.addEventListener('change', changeHandler);

    twd.describe('Clear fallback hidden', () => {
      twd.it('clears via fallback', async () => {
        await userEvent.clear(input);
      });
    });

    const testArray = Array.from(twd.handlers.values());
    const test = testArray[testArray.length - 1];
    test.status = 'running';
    await test.handler();

    expect(input.value).toBe('');
    expect(inputHandler).toHaveBeenCalled();
    expect(changeHandler).toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('should clear input value when document has no focus but is visible', async () => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
    hasFocusSpy.mockReturnValue(false);

    const input = document.createElement('input');
    input.value = 'some text';
    document.body.appendChild(input);

    twd.describe('Clear fallback unfocused', () => {
      twd.it('clears via fallback', async () => {
        await userEvent.clear(input);
      });
    });

    const testArray = Array.from(twd.handlers.values());
    const test = testArray[testArray.length - 1];
    test.status = 'running';
    await test.handler();

    expect(input.value).toBe('');

    document.body.removeChild(input);
  });
});

describe('userEvent keyboard fallback', () => {
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

  it('should dispatch blur and focusout when pressing Tab and document is hidden', async () => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    hasFocusSpy.mockReturnValue(false);

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const blurHandler = vi.fn();
    const focusoutHandler = vi.fn();
    input.addEventListener('blur', blurHandler);
    input.addEventListener('focusout', focusoutHandler);

    twd.describe('Keyboard Tab fallback hidden', () => {
      twd.it('dispatches blur via fallback', async () => {
        await userEvent.keyboard('{Tab}');
      });
    });

    const testArray = Array.from(twd.handlers.values());
    const test = testArray[testArray.length - 1];
    test.status = 'running';
    await test.handler();

    expect(blurHandler).toHaveBeenCalled();
    expect(focusoutHandler).toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('should dispatch blur and focusout when pressing Tab and document has no focus', async () => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
    hasFocusSpy.mockReturnValue(false);

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const blurHandler = vi.fn();
    const focusoutHandler = vi.fn();
    input.addEventListener('blur', blurHandler);
    input.addEventListener('focusout', focusoutHandler);

    twd.describe('Keyboard Tab fallback unfocused', () => {
      twd.it('dispatches blur via fallback', async () => {
        await userEvent.keyboard('{Tab}');
      });
    });

    const testArray = Array.from(twd.handlers.values());
    const test = testArray[testArray.length - 1];
    test.status = 'running';
    await test.handler();

    expect(blurHandler).toHaveBeenCalled();
    expect(focusoutHandler).toHaveBeenCalled();

    document.body.removeChild(input);
  });

  // Regression: when keyboard("{Tab}") is called after type() in fallback mode,
  // blur must fire on the input even though input.focus() was never called
  // manually. Before the fix, typingFallback did not dispatch focus/focusin, so
  // React's event delegation didn't know the element was focused and would not
  // fire onBlur when focusout arrived.
  it('should dispatch blur on the input after type() fallback without manual focus call', async () => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    hasFocusSpy.mockReturnValue(false);

    const input = document.createElement('input');
    document.body.appendChild(input);
    // NOTE: input.focus() is intentionally NOT called here — simulating the
    // real relay scenario where keyboard("{Tab}") follows userEvent.type().

    const focusinHandler = vi.fn();
    const blurHandler = vi.fn();
    const focusoutHandler = vi.fn();
    input.addEventListener('focusin', focusinHandler);
    input.addEventListener('blur', blurHandler);
    input.addEventListener('focusout', focusoutHandler);

    twd.describe('Tab after type without manual focus', () => {
      twd.it('dispatches blur after type fallback', async () => {
        await userEvent.type(input, 'hello');
        await userEvent.keyboard('{Tab}');
      });
    });

    const testArray = Array.from(twd.handlers.values());
    const test = testArray[testArray.length - 1];
    test.status = 'running';
    await test.handler();

    // typingFallback must have dispatched focusin so that React knows the
    // element is focused before focusout arrives.
    expect(focusinHandler).toHaveBeenCalled();
    expect(blurHandler).toHaveBeenCalled();
    expect(focusoutHandler).toHaveBeenCalled();

    document.body.removeChild(input);
  });

  // Regression: keyboard() with non-Tab keys (e.g. "Spain{arrowdown}{enter}")
  // was a complete no-op when the tab was not focused. This caused combobox
  // interactions (type to filter → arrow-select → enter) to silently fail,
  // leaving the dropdown open and blocking subsequent clicks.
  it('should dispatch keydown events for arrow and enter keys when document is hidden', async () => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    hasFocusSpy.mockReturnValue(false);

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const keydownHandler = vi.fn();
    input.addEventListener('keydown', keydownHandler);

    twd.describe('Keyboard non-Tab fallback hidden', () => {
      twd.it('dispatches keydown for arrow and enter', async () => {
        await userEvent.keyboard('{arrowdown}{enter}');
      });
    });

    const testArray = Array.from(twd.handlers.values());
    const test = testArray[testArray.length - 1];
    test.status = 'running';
    await test.handler();

    const keys = keydownHandler.mock.calls.map((c: any[]) => (c[0] as KeyboardEvent).key);
    expect(keys).toContain('ArrowDown');
    expect(keys).toContain('Enter');

    document.body.removeChild(input);
  });

  it('should type text characters and dispatch keydown for special keys in a mixed key string', async () => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    hasFocusSpy.mockReturnValue(false);

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const inputHandler = vi.fn();
    const keydownHandler = vi.fn();
    input.addEventListener('input', inputHandler);
    input.addEventListener('keydown', keydownHandler);

    twd.describe('Mixed keys fallback hidden', () => {
      twd.it('types text then dispatches arrow+enter', async () => {
        await userEvent.keyboard('Spain{arrowdown}{enter}');
      });
    });

    const testArray = Array.from(twd.handlers.values());
    const test = testArray[testArray.length - 1];
    test.status = 'running';
    await test.handler();

    // Text characters must have been flushed as a value update
    expect(input.value).toBe('Spain');
    expect(inputHandler).toHaveBeenCalled();

    // Special keys must have fired keydown events
    const keys = keydownHandler.mock.calls.map((c: any[]) => (c[0] as KeyboardEvent).key);
    expect(keys).toContain('ArrowDown');
    expect(keys).toContain('Enter');

    document.body.removeChild(input);
  });
});
