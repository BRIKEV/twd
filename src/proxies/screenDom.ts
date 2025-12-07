import { screen, configure, within } from '@testing-library/dom';
import { log } from '../utils/log';
import { domMessage } from './domMessage';

type ScreenDom = typeof screen;

// Define which container to use (anything except the sidebar)
const getFilteredContainer = () => {
  // Generic strategy: Find the first direct child of body that isn't the TWD sidebar
  // This works for <div id="root">, <app-root>, <main>, etc.
  return document.querySelector("body > :not(#twd-sidebar-root):not(script):not(style)") ?? document.body;
};

// It takes whatever RTL query the user calls (like getByText) and calls the same function from within(filteredContainer), so the search happens only inside the allowed part of the DOM.
const callWithin = (prop: string | symbol, args: any[]) => {
  const container = getFilteredContainer();
  const scoped = within(container as HTMLElement);

  // Try using the within() version
  const scopedFn = (scoped as any)[prop];
  if (typeof scopedFn === "function") {
    return scopedFn(...args);
  }

  // Fallback to original (debug, config, etc.)
  const orig = (screen as any)[prop];

  // If it's a function, just call it
  if (typeof orig === "function") {
    return orig(...args);
  }

  // Otherwise it’s a value (like screen.config) — return it
  return orig;
};


function createLoggedProxy(obj: any, prefix = 'screen') {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const orig = Reflect.get(target, prop, receiver);
      if (typeof orig !== 'function') return orig;

      // We need to wrap the query so it uses filtered container
      return (...args: any[]) => {
        const result = callWithin(prop, args);
        log(domMessage(prefix, prop, args));
        return result;
      };
    },
  });
}

export const screenDom: ScreenDom = createLoggedProxy(screen);

configure({
  getElementError(message) {
    return new Error(`${message}`);
  },
});
export const configureScreenDom: typeof configure = configure;
