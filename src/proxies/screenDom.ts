import { screen, configure, within } from '@testing-library/dom';
import { log } from '../utils/log';
import { domMessage } from './domMessage';

type ScreenDom = typeof screen;

// Define which container to use (anything except the sidebar)
const getFilteredContainer = () => {
  // Generic strategy: Find the first direct child of body that isn't the TWD sidebar
  // This works for <div id="root">, <app-root>, <main>, etc.
  return document.querySelector("body > :not(#twd-sidebar-root):not(script):not(style):not(svg):not(path):not(noscript):not(link):not(meta):not(iframe):not(template)") ?? document.body;
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

  // Otherwise it's a value (like screen.config) — return it
  return orig;
};

// Call screen directly without filtering (for global queries)
const callGlobal = (prop: string | symbol, args: any[]) => {
  const orig = (screen as any)[prop];
  
  if (typeof orig !== 'function') {
    return orig;
  }
  
  return orig(...args);
};


function createLoggedProxy(obj: any, prefix = 'screen', useWithin = false) {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const orig = Reflect.get(target, prop, receiver);
      if (typeof orig !== 'function') return orig;

      // We need to wrap the query so it uses filtered container or global search
      return (...args: any[]) => {
        const result = useWithin ? callWithin(prop, args) : callGlobal(prop, args);
        log(domMessage(prefix, prop, args));
        return result;
      };
    },
  });
}

/**
 * screenDom - Scoped queries that exclude the TWD sidebar
 * 
 * Searches only within the main app container (typically #root).
 * Use this for most queries to avoid matching elements in the sidebar.
 * 
 * Note: This will NOT find portal-rendered elements (modals, dialogs) that are
 * rendered outside the root container. For portals, use `screenDomGlobal` instead.
 */
export const screenDom: ScreenDom = createLoggedProxy(screen, 'screen', true);

/**
 * screenDomGlobal - Global queries that search the entire document.body
 * 
 * Searches all elements in document.body, including portal-rendered elements
 * (modals, dialogs, tooltips, etc.).
 * 
 * ⚠️ WARNING: This may also match elements inside the TWD sidebar if your selectors
 * are not specific enough. Use more specific queries (e.g., getByRole with name)
 * to avoid matching sidebar elements.
 * 
 * Use this when:
 * - Querying portal-rendered elements (modals, dialogs)
 * - You need to search outside the root container
 * 
 * Example:
 * ```ts
 * // For a modal rendered via portal
 * const modal = screenDomGlobal.getByRole('dialog', { name: 'Confirm' });
 * ```
 */
export const screenDomGlobal: ScreenDom = createLoggedProxy(screen, 'screen', false);

configure({
  getElementError(message) {
    return new Error(`${message}`);
  },
});
export const configureScreenDom: typeof configure = configure;
