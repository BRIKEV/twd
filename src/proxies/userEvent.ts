import userEventLib from '@testing-library/user-event';
import { log } from '../utils/log';
import { eventsMessage } from './eventsMessage';
import { pace, getKeyDelay, getPaceGeneration } from '../pace';

type UserEvent = typeof userEventLib;

/**
 * Maps userEvent key syntax to DOM KeyboardEvent.key values.
 * Keys are lowercased for case-insensitive matching.
 */
const KEY_MAP: Record<string, string> = {
  '{arrowdown}': 'ArrowDown',
  '{arrowup}': 'ArrowUp',
  '{arrowleft}': 'ArrowLeft',
  '{arrowright}': 'ArrowRight',
  '{enter}': 'Enter',
  '{escape}': 'Escape',
  '{esc}': 'Escape',
  '{tab}': 'Tab',
  '{space}': ' ',
  '{backspace}': 'Backspace',
  '{delete}': 'Delete',
  '{del}': 'Delete',
  '{home}': 'Home',
  '{end}': 'End',
  '{pageup}': 'PageUp',
  '{pagedown}': 'PageDown',
};

/**
 * Parses a userEvent key string into individual tokens.
 * Special keys like {arrowdown} are kept as-is; regular characters are
 * returned one per token.
 *
 * e.g. "Spain{arrowdown}{enter}" → ["S","p","a","i","n","{arrowdown}","{enter}"]
 */
function parseKeys(keys: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < keys.length) {
    if (keys[i] === '{') {
      const end = keys.indexOf('}', i);
      if (end !== -1) {
        tokens.push(keys.slice(i, end + 1));
        i = end + 1;
      } else {
        tokens.push(keys[i]);
        i++;
      }
    } else {
      tokens.push(keys[i]);
      i++;
    }
  }
  return tokens;
}

/**
 * Fallback for userEvent.type() when the browser tab is not in focus.
 * Uses the native value setter to trigger React's controlled input update,
 * then dispatches focus/focusin so React's event delegation registers the
 * element as focused (browsers suppress these events in unfocused tabs),
 * followed by input/change events so frameworks pick up the change.
 *
 * The explicit focus/focusin dispatch is required because React 17+ uses
 * focusin (bubbling) for synthetic onFocus/onBlur tracking via event
 * delegation at the root. Without it, React won't fire onBlur when focusout
 * is later dispatched (e.g. from the keyboard "{Tab}" fallback).
 */
function typingFallback(element: HTMLElement, text: string) {
  element.focus();
  // Browsers suppress focus/focusin events when the tab is not focused.
  // Dispatch them explicitly so React's event delegation tracks this element.
  element.dispatchEvent(new FocusEvent('focus', { bubbles: false, cancelable: false }));
  element.dispatchEvent(new FocusEvent('focusin', { bubbles: true, cancelable: false }));

  const isInput = element instanceof HTMLInputElement;
  const isTextarea = element instanceof HTMLTextAreaElement;

  if (isInput || isTextarea) {
    /* eslint-disable @typescript-eslint/unbound-method -- set is called via .call(), so this-binding is explicit */
    const nativeSetter = isInput
      ? Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
      : Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
    /* eslint-enable @typescript-eslint/unbound-method */

    if (nativeSetter) {
      nativeSetter.call(element, text);
    } else {
      element.value = text;
    }
  }

  element.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Fallback for userEvent.clear() when the browser tab is not in focus.
 * Reuses the native value setter pattern from typingFallback with an empty string.
 */
function clearFallback(element: HTMLElement) {
  typingFallback(element, '');
}

/**
 * Logs the command and then holds, so a recorded run shows the result of the
 * action before moving on. `pace()` is a no-op when pacing is off.
 */
async function logAndPace(prefix: string, prop: string | symbol, args: any[]) {
  log(eventsMessage(prefix, prop, args));
  await pace();
}

// Keyed on the pace generation, not on the delay. A plain `cached ??= ...`
// would keep a stale delay forever, and keying on the delay alone would miss
// the case where the same value is set twice.
let cachedPaced: { generation: number; user: any } | null = null;

/**
 * The implementation to call for `prop`.
 *
 * When paced, this is a user-event setup instance carrying the derived delay.
 * user-event applies `delay` at config level, in wrapAndBindImpl after every
 * API method as well as between keystrokes and pointer actions, so one instance
 * covers every method uniformly. That includes `clear`, which is the one direct
 * API method taking no options at all.
 *
 * Returns null when pacing is off, so a normal run uses the direct API
 * untouched and builds no instance.
 */
function pacedImpl(prop: string | symbol): ((...args: any[]) => any) | null {
  const delay = getKeyDelay();
  if (!delay) {
    cachedPaced = null;
    return null;
  }

  const generation = getPaceGeneration();
  if (!cachedPaced || cachedPaced.generation !== generation) {
    cachedPaced = { generation, user: userEventLib.setup({ delay }) };
  }

  const fn = cachedPaced.user[prop];
  return typeof fn === 'function' ? fn.bind(cachedPaced.user) : null;
}

function createLoggedProxy(obj: any, prefix = 'userEvent') {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const orig = Reflect.get(target, prop, receiver);
      if (typeof orig !== 'function') return orig;

      // Special handling for setup
      if (prop === 'setup') {
        return (...args: any[]) => {
          // Spread the caller's options last so an explicit delay wins.
          const delay = getKeyDelay();
          const instance = delay ? orig({ delay, ...(args[0] || {}) }) : orig(...args);
          // Proxy the returned instance
          return createLoggedProxy(instance, `${prefix}.instance`);
        };
      }

      // Fallback for type() when tab is not in focus (e.g. AI relay workflow)
      if (prop === 'type') {
        return async (...args: any[]) => {
          if (document.visibilityState === 'hidden' || !document.hasFocus()) {
            typingFallback(args[0], args[1]);
            await logAndPace(prefix, prop, args);
            return;
          }
          const impl = prefix === 'userEvent' ? (pacedImpl(prop) ?? orig) : orig;
          const result = await impl(...args);
          await logAndPace(prefix, prop, args);
          return result;
        };
      }

      // Fallback for clear() when tab is not in focus
      if (prop === 'clear') {
        return async (...args: any[]) => {
          if (document.visibilityState === 'hidden' || !document.hasFocus()) {
            clearFallback(args[0]);
            await logAndPace(prefix, prop, args);
            return;
          }
          const impl = prefix === 'userEvent' ? (pacedImpl(prop) ?? orig) : orig;
          const result = await impl(...args);
          await logAndPace(prefix, prop, args);
          return result;
        };
      }

      // Fallback for keyboard() when tab is not in focus.
      //
      // The real userEvent.keyboard() relies on actual browser focus and
      // interaction events that get deprioritized when the tab is backgrounded.
      // This fallback parses the key string and dispatches synthetic events
      // for each token:
      //   - Regular characters: appended to the active element's value via
      //     typingFallback (native setter + input/change events)
      //   - {Tab}: blur + focusout on the active element
      //   - Arrow keys, Enter, Escape, etc.: keydown + keyup events
      //   - {Backspace}: removes the last character from the element value
      if (prop === 'keyboard') {
        return async (...args: any[]) => {
          if (document.visibilityState === 'hidden' || !document.hasFocus()) {
            const keys = args[0] as string;
            const tokens = parseKeys(keys);
            const active = document.activeElement as HTMLElement;

            if (!active || active === document.body) {
              log(eventsMessage(prefix, prop, args));
              return;
            }

            let textBuffer = '';

            const flushText = () => {
              if (!textBuffer) return;
              const currentValue = (active as HTMLInputElement).value ?? '';
              typingFallback(active, currentValue + textBuffer);
              textBuffer = '';
            };

            for (const token of tokens) {
              const mappedKey = KEY_MAP[token.toLowerCase()];

              if (mappedKey === 'Tab') {
                flushText();
                active.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
                active.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
              } else if (mappedKey === 'Backspace') {
                flushText();
                const currentValue = (active as HTMLInputElement).value ?? '';
                typingFallback(active, currentValue.slice(0, -1));
              } else if (mappedKey) {
                flushText();
                active.dispatchEvent(
                  new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: mappedKey }),
                );
                active.dispatchEvent(
                  new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: mappedKey }),
                );
              } else {
                // Regular character — accumulate for a single flush
                textBuffer += token;
              }
            }

            flushText();
            await logAndPace(prefix, prop, args);
            return;
          }
          const impl = prefix === 'userEvent' ? (pacedImpl(prop) ?? orig) : orig;
          const result = await impl(...args);
          await logAndPace(prefix, prop, args);
          return result;
        };
      }

      return async (...args: any[]) => {
        const impl = prefix === 'userEvent' ? (pacedImpl(prop) ?? orig) : orig;
        const result = await impl(...args);
        await logAndPace(prefix, prop, args);
        return result;
      };
    },
  });
}

export const userEvent: UserEvent = createLoggedProxy(userEventLib);
