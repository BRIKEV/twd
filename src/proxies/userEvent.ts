import userEventLib from '@testing-library/user-event';
import { log } from '../utils/log';
import { eventsMessage } from './eventsMessage';

type UserEvent = typeof userEventLib;

/**
 * Fallback for userEvent.type() when the browser tab is not in focus.
 * Uses the native value setter to trigger React's controlled input update,
 * then dispatches input/change events so frameworks pick up the change.
 */
function typingFallback(element: HTMLElement, text: string) {
  element.focus();

  const isInput = element instanceof HTMLInputElement;
  const isTextarea = element instanceof HTMLTextAreaElement;

  if (isInput || isTextarea) {
    const nativeSetter = isInput
      ? Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
      : Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;

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

function createLoggedProxy(obj: any, prefix = 'userEvent') {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const orig = Reflect.get(target, prop, receiver);
      if (typeof orig !== 'function') return orig;

      // Special handling for setup
      if (prop === 'setup') {
        return (...args: any[]) => {
          const instance = orig(...args);
          // Proxy the returned instance
          return createLoggedProxy(instance, `${prefix}.instance`);
        };
      }

      // Fallback for type() when tab is not in focus (e.g. AI relay workflow)
      if (prop === 'type') {
        return async (...args: any[]) => {
          if (document.visibilityState === 'hidden' || !document.hasFocus()) {
            typingFallback(args[0], args[1]);
            log(eventsMessage(prefix, prop, args));
            return;
          }
          const result = await orig(...args);
          log(eventsMessage(prefix, prop, args));
          return result;
        };
      }

      // Fallback for clear() when tab is not in focus
      if (prop === 'clear') {
        return async (...args: any[]) => {
          if (document.visibilityState === 'hidden' || !document.hasFocus()) {
            clearFallback(args[0]);
            log(eventsMessage(prefix, prop, args));
            return;
          }
          const result = await orig(...args);
          log(eventsMessage(prefix, prop, args));
          return result;
        };
      }

      // Fallback for keyboard() when tab is not in focus
      if (prop === 'keyboard') {
        return async (...args: any[]) => {
          if (document.visibilityState === 'hidden' || !document.hasFocus()) {
            const keys = args[0] as string;
            if (keys === '{Tab}') {
              const active = document.activeElement as HTMLElement;
              if (active) {
                active.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
                active.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
              }
            }
            log(eventsMessage(prefix, prop, args));
            return;
          }
          const result = await orig(...args);
          log(eventsMessage(prefix, prop, args));
          return result;
        };
      }

      return async (...args: any[]) => {
        const result = await orig(...args);
        log(eventsMessage(prefix, prop, args));
        return result;
      };
    },
  });
}

export const userEvent: UserEvent = createLoggedProxy(userEventLib);
