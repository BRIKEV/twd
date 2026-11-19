import type { Handler } from './runner';

export interface ViewportDefinition {
  /** Inclusive lower bound, in CSS px. */
  minWidth?: number;
  /** Inclusive upper bound, in CSS px. */
  maxWidth?: number;
}

export type Viewports = Record<string, ViewportDefinition>;

export interface DefineViewportsOptions {
  /** Viewport given to tests that declare none, e.g. `'desktop'` for desktop-first projects. */
  default?: string;
}

export interface ViewportConfig {
  viewports: Viewports;
  defaultViewport?: string;
}

const NAME_PATTERN = /^[a-z][a-z0-9-]*$/;

// Kept on window, like pace, so every copy of twd-js loaded in the page (the
// bundled sidebar, the runner a test file imports, twd-relay, twd-cli) shares one
// registry.
const getState = (): ViewportConfig => {
  if (!window.__TWD_VIEWPORTS__) {
    window.__TWD_VIEWPORTS__ = { viewports: {}, defaultViewport: undefined };
  }
  return window.__TWD_VIEWPORTS__;
};

const warnedNames = new Set<string>();

const validateBound = (name: string, key: 'minWidth' | 'maxWidth', value: unknown) => {
  if (value === undefined) return;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(`Viewport "${name}" ${key} must be a non-negative number`);
  }
};

/**
 * Declare the viewports tests can refer to by name. Call it once, in the entry
 * file, before or after the tests load. Calling it again replaces the registry.
 *
 * @example
 * defineViewports(
 *   { mobile: { maxWidth: 767 }, desktop: { minWidth: 1024 } },
 *   { default: 'desktop' },
 * );
 */
export const defineViewports = (viewports: Viewports, options: DefineViewportsOptions = {}) => {
  for (const [name, definition] of Object.entries(viewports)) {
    if (!NAME_PATTERN.test(name)) {
      throw new Error(
        `Invalid viewport name "${name}": use lowercase letters, digits and dashes, starting with a letter`,
      );
    }
    const { minWidth, maxWidth } = definition ?? {};
    if (minWidth === undefined && maxWidth === undefined) {
      throw new Error(`Viewport "${name}" needs minWidth, maxWidth or both`);
    }
    validateBound(name, 'minWidth', minWidth);
    validateBound(name, 'maxWidth', maxWidth);
    if (minWidth !== undefined && maxWidth !== undefined && minWidth > maxWidth) {
      throw new Error(
        `Viewport "${name}" has minWidth (${minWidth}) greater than maxWidth (${maxWidth})`,
      );
    }
  }
  if (options.default !== undefined && !(options.default in viewports)) {
    throw new Error(`defaultViewport "${options.default}" is not a declared viewport`);
  }

  const state = getState();
  state.viewports = { ...viewports };
  state.defaultViewport = options.default;
  warnedNames.clear();
  window.dispatchEvent(new CustomEvent('twd:viewports-change'));
};

/** Clears the registry. Mainly for tests. */
export const resetViewports = () => {
  const state = getState();
  state.viewports = {};
  state.defaultViewport = undefined;
  warnedNames.clear();
};

export const getViewportConfig = (): ViewportConfig => {
  const { viewports, defaultViewport } = getState();
  return { viewports, defaultViewport };
};

export const hasViewports = () => Object.keys(getState().viewports).length > 0;

export const buildMediaQuery = ({ minWidth, maxWidth }: ViewportDefinition) => {
  const parts: string[] = [];
  if (minWidth !== undefined) parts.push(`(min-width: ${minWidth}px)`);
  if (maxWidth !== undefined) parts.push(`(max-width: ${maxWidth}px)`);
  return parts.join(' and ');
};

const definitionMatches = (definition: ViewportDefinition) => {
  // matchMedia is what the app's CSS follows. innerWidth is the fallback for
  // environments without it (jsdom).
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia(buildMediaQuery(definition)).matches;
  }
  const width = window.innerWidth;
  const { minWidth, maxWidth } = definition;
  return (
    (minWidth === undefined || width >= minWidth) && (maxWidth === undefined || width <= maxWidth)
  );
};

const warnUnknown = (name: string) => {
  if (warnedNames.has(name)) return;
  warnedNames.add(name);
  console.warn(
    `[twd] Unknown viewport "${name}". Declare it with defineViewports() or the viewports option of initTWD. Tests using it never run in Run All.`,
  );
};

/** Names of the declared viewports matching the window right now, in registry order. */
export const getMatchingViewports = (): string[] => {
  const { viewports } = getState();
  return Object.entries(viewports)
    .filter(([, definition]) => definitionMatches(definition))
    .map(([name]) => name);
};

const describeRange = ({ minWidth, maxWidth }: ViewportDefinition) => {
  if (minWidth !== undefined && maxWidth !== undefined) return `${minWidth}-${maxWidth}px`;
  if (minWidth !== undefined) return `min ${minWidth}px`;
  return `max ${maxWidth}px`;
};

/** Human description for labels and warnings: `desktop (min 1024px)`. */
export const describeViewports = (names: string[]) => {
  const { viewports } = getState();
  return names
    .map((name) =>
      viewports[name]
        ? `${name} (${describeRange(viewports[name])})`
        : `unknown viewport "${name}"`,
    )
    .join(', ');
};

/**
 * The viewport names a test belongs to: its own, else the nearest describe's,
 * else the default. `undefined` means every width. Resolved on demand, so the
 * registry can be declared after the tests are registered.
 */
export const getEffectiveViewport = (handler: Handler): string[] | undefined => {
  const state = window.__TWD_STATE__ as { handlers?: Map<string, Handler> } | undefined;
  const all = state?.handlers;
  let current: Handler | undefined = handler;
  while (current) {
    if (current.viewport) return current.viewport;
    current = current.parent ? all?.get(current.parent) : undefined;
  }
  const { defaultViewport } = getState();
  return defaultViewport ? [defaultViewport] : undefined;
};

/** Whether a test belongs to a given named viewport, regardless of the window. */
export const isInViewport = (handler: Handler, name: string) => {
  const effective = getEffectiveViewport(handler);
  return effective === undefined || effective.includes(name);
};

/**
 * Whether a test runs at the current window width. Always true when no
 * viewports are declared, so projects that do not use the feature see no change.
 */
export const isInCurrentViewport = (handler: Handler, matching = getMatchingViewports()) => {
  if (!hasViewports()) return true;
  const effective = getEffectiveViewport(handler);
  if (effective === undefined) return true;
  const { viewports } = getState();
  return effective.some((name) => {
    if (!viewports[name]) {
      warnUnknown(name);
      return false;
    }
    return matching.includes(name);
  });
};
