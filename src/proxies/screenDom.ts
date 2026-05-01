import { screen, configure, within } from '@testing-library/dom';
import { log } from '../utils/log';
import { domMessage } from './domMessage';

type ScreenDom = typeof screen;

// Known app-root selectors in priority order (framework semantic signals)
const ROOT_SELECTOR_PRIORITY = ['#root', '#app', 'app-root'] as const;

const EXCLUDED_FALLBACK_SELECTOR =
  'body > :not(#twd-sidebar-root):not(script):not(style):not(svg):not(path):not(noscript):not(link):not(meta):not(iframe):not(template)';

const FALLBACK_WARNING =
  '[TWD] screenDom could not find a known app root (#root / #app / app-root). ' +
  'Falling back to best-guess container — if queries behave unexpectedly, pass ' +
  "rootSelector to initTWD: initTWD(modules, { rootSelector: '#my-app' }).";

const state = {
  rootSelector: null as string | null,
  warnedOnFallback: false,
};

/**
 * Set the app root selector used by screenDom queries. Package-internal —
 * wired through `initTWD({ rootSelector })`. Not re-exported from `src/index.ts`.
 */
export const setRootSelector = (selector: string) => {
  state.rootSelector = selector;
};

/**
 * Reset screenDom module state. Only use in tests.
 * @internal
 */
export const resetScreenDomState = () => {
  state.rootSelector = null;
  state.warnedOnFallback = false;
};

const isNonEmpty = (el: Element): boolean =>
  el.childElementCount > 0 || (el.textContent?.trim().length ?? 0) > 0;

const warnOnFallbackOnce = () => {
  if (state.warnedOnFallback) return;
  state.warnedOnFallback = true;
  console.warn(FALLBACK_WARNING);
};

// Define which container to use (anything except the sidebar)
const getFilteredContainer = (): HTMLElement => {
  // 1. User-configured selector (if it matches)
  if (state.rootSelector) {
    const configured = document.querySelector(state.rootSelector);
    if (configured) return configured as HTMLElement;
  }
  // 2. Priority list: trust semantic app-root selectors
  for (const selector of ROOT_SELECTOR_PRIORITY) {
    const match = document.querySelector(selector);
    if (match) return match as HTMLElement;
  }
  // 3. Fallback heuristic: first non-empty direct body child
  warnOnFallbackOnce();
  const candidates = document.querySelectorAll(EXCLUDED_FALLBACK_SELECTOR);
  for (const candidate of Array.from(candidates)) {
    if (isNonEmpty(candidate)) return candidate as HTMLElement;
  }
  return document.body;
};

// It takes whatever RTL query the user calls (like getByText) and calls the same function from within(filteredContainer), so the search happens only inside the allowed part of the DOM.
const callWithin = (prop: string | symbol, args: any[]) => {
  const container = getFilteredContainer();
  const scoped = within(container);

  // Try using the within() version
  const scopedFn = (scoped as any)[prop];
  if (typeof scopedFn === 'function') {
    return scopedFn(...args);
  }

  // Fallback to original (debug, config, etc.)
  const orig = (screen as any)[prop];

  // If it's a function, just call it
  if (typeof orig === 'function') {
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
  asyncUtilTimeout: 3000,
  getElementError(message) {
    return new Error(`${message}`);
  },
});
export const configureScreenDom: typeof configure = configure;
