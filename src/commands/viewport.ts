import { log } from '../utils/log';

const STYLE_ID = 'twd-viewport-styles';
const IFRAME_ID = 'twd-viewport-iframe';

let originalStyles: {
  maxWidth: string;
  maxHeight: string;
  minHeight: string;
  overflow: string;
  margin: string;
  boxSizing: string;
  boxShadow: string;
} | null = null;

interface MediaRulePatch {
  sheet: CSSStyleSheet;
  originalIndex: number;
  originalCssText: string;
  injectedRulesCount: number;
}

interface ViewportOverrideState {
  patches: MediaRulePatch[];
  originalInnerWidthDesc: PropertyDescriptor | undefined;
  originalInnerHeightDesc: PropertyDescriptor | undefined;
  originalMatchMedia: typeof window.matchMedia | null;
  iframe: HTMLIFrameElement | null;
}

let overrideState: ViewportOverrideState | null = null;

const saveOriginalStyles = () => {
  if (originalStyles) return;
  const { style } = document.body;
  originalStyles = {
    maxWidth: style.maxWidth,
    maxHeight: style.maxHeight,
    minHeight: style.minHeight,
    overflow: style.overflow,
    margin: style.margin,
    boxSizing: style.boxSizing,
    boxShadow: style.boxShadow,
  };
};

const injectBadge = (width: number, height?: number) => {
  let styleEl = document.getElementById(STYLE_ID);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;
    document.head.appendChild(styleEl);
  }

  const label = height ? `${width} \u00d7 ${height}` : `${width}`;

  styleEl.textContent = `
#twd-viewport-badge {
  position: fixed;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(37, 99, 235, 0.85);
  color: #fff;
  font-size: 12px;
  font-family: monospace;
  padding: 2px 10px;
  border-radius: 4px;
  z-index: 99998;
  pointer-events: none;
  white-space: nowrap;
}
`;

  let badge = document.getElementById('twd-viewport-badge');
  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'twd-viewport-badge';
    document.body.appendChild(badge);
  }
  badge.textContent = label;
};

const removeBadge = () => {
  document.getElementById(STYLE_ID)?.remove();
  document.getElementById('twd-viewport-badge')?.remove();
};

const createViewportIframe = (width: number, height: number): HTMLIFrameElement => {
  let iframe = document.getElementById(IFRAME_ID) as HTMLIFrameElement | null;
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = IFRAME_ID;
    iframe.style.cssText =
      'position:fixed;top:-9999px;left:-9999px;visibility:hidden;pointer-events:none;border:none;';
    document.body.appendChild(iframe);
  }
  iframe.style.width = `${width}px`;
  iframe.style.height = `${height}px`;
  return iframe;
};

const removeViewportIframe = () => {
  document.getElementById(IFRAME_ID)?.remove();
};

const overrideJSAPIs = (state: ViewportOverrideState, width: number, height?: number) => {
  state.originalInnerWidthDesc = Object.getOwnPropertyDescriptor(window, 'innerWidth');
  state.originalInnerHeightDesc = Object.getOwnPropertyDescriptor(window, 'innerHeight');
  state.originalMatchMedia = window.matchMedia ?? null;

  Object.defineProperty(window, 'innerWidth', {
    get: () => width,
    configurable: true,
  });

  if (height !== undefined) {
    Object.defineProperty(window, 'innerHeight', {
      get: () => height,
      configurable: true,
    });
  }

  const iframe = state.iframe;
  if (iframe?.contentWindow?.matchMedia) {
    const iframeMatchMedia = iframe.contentWindow.matchMedia.bind(iframe.contentWindow);
    window.matchMedia = (query: string): MediaQueryList => iframeMatchMedia(query);
  }
};

const restoreJSAPIs = (state: ViewportOverrideState) => {
  if (state.originalInnerWidthDesc) {
    Object.defineProperty(window, 'innerWidth', state.originalInnerWidthDesc);
  } else {
    delete (window as unknown as Record<string, unknown>)['innerWidth'];
  }

  if (state.originalInnerHeightDesc) {
    Object.defineProperty(window, 'innerHeight', state.originalInnerHeightDesc);
  } else {
    delete (window as unknown as Record<string, unknown>)['innerHeight'];
  }

  if (state.originalMatchMedia) {
    window.matchMedia = state.originalMatchMedia;
  }
};

const rewriteCSSMediaRules = (
  state: ViewportOverrideState,
  iframeMatchMedia: (query: string) => MediaQueryList,
  realMatchMedia: typeof window.matchMedia,
) => {
  const sheets = document.styleSheets;
  for (let s = 0; s < sheets.length; s++) {
    const sheet = sheets[s];
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      // Cross-origin stylesheet — skip
      continue;
    }

    // Iterate in reverse to avoid index shifting when deleting/inserting rules
    for (let i = rules.length - 1; i >= 0; i--) {
      const rule = rules[i];
      if (!(rule instanceof CSSMediaRule)) continue;

      processMediaRule(state, sheet, i, rule, iframeMatchMedia, realMatchMedia);
    }
  }
};

const processMediaRule = (
  state: ViewportOverrideState,
  sheet: CSSStyleSheet,
  index: number,
  rule: CSSMediaRule,
  iframeMatchMedia: (query: string) => MediaQueryList,
  realMatchMedia: typeof window.matchMedia,
) => {
  const mediaText = rule.conditionText ?? rule.media.mediaText;
  if (!mediaText) return;

  const matchesReal = realMatchMedia(mediaText).matches;
  const matchesSimulated = iframeMatchMedia(mediaText).matches;

  // No change in match state — leave the rule alone
  if (matchesReal === matchesSimulated) return;

  const originalCssText = rule.cssText;

  if (matchesSimulated && !matchesReal) {
    // Should activate: delete the @media wrapper, inject inner rules as plain rules
    const innerRules: string[] = [];
    for (let j = 0; j < rule.cssRules.length; j++) {
      innerRules.push(rule.cssRules[j].cssText);
    }

    sheet.deleteRule(index);

    let injectedCount = 0;
    for (let j = 0; j < innerRules.length; j++) {
      try {
        sheet.insertRule(innerRules[j], index + j);
        injectedCount++;
      } catch {
        // Skip rules that can't be inserted (e.g., nested @media in environments that don't support it)
      }
    }

    state.patches.push({
      sheet,
      originalIndex: index,
      originalCssText,
      injectedRulesCount: injectedCount,
    });
  } else if (!matchesSimulated && matchesReal) {
    // Should deactivate: delete the @media rule entirely
    sheet.deleteRule(index);

    state.patches.push({
      sheet,
      originalIndex: index,
      originalCssText,
      injectedRulesCount: 0,
    });
  }
};

const restoreCSSMediaRules = (state: ViewportOverrideState) => {
  // Restore patches in reverse order to maintain correct indices
  for (let i = state.patches.length - 1; i >= 0; i--) {
    const patch = state.patches[i];
    const { sheet, originalIndex, originalCssText, injectedRulesCount } = patch;

    try {
      // Remove injected rules
      for (let j = 0; j < injectedRulesCount; j++) {
        sheet.deleteRule(originalIndex);
      }

      // Re-insert original @media rule
      sheet.insertRule(originalCssText, originalIndex);
    } catch {
      // Sheet may have been removed or modified — skip
    }
  }
};

const applyMediaOverrides = (width: number, height?: number) => {
  // If already overridden, restore first
  if (overrideState) {
    restoreMediaOverrides();
  }

  const effectiveHeight = height ?? window.innerHeight;
  const iframe = createViewportIframe(width, effectiveHeight);

  const state: ViewportOverrideState = {
    patches: [],
    originalInnerWidthDesc: undefined,
    originalInnerHeightDesc: undefined,
    originalMatchMedia: null,
    iframe,
  };

  overrideState = state;

  // Capture real matchMedia before overriding (may be undefined in jsdom)
  const realMatchMedia = window.matchMedia ? window.matchMedia.bind(window) : null;

  // Override JS APIs (innerWidth, innerHeight, matchMedia)
  overrideJSAPIs(state, width, height);

  // Rewrite CSS @media rules (requires matchMedia support)
  if (realMatchMedia && iframe.contentWindow?.matchMedia) {
    const iframeMatchMedia = iframe.contentWindow.matchMedia.bind(iframe.contentWindow);
    rewriteCSSMediaRules(state, iframeMatchMedia, realMatchMedia);
  }

  // Dispatch resize event so JS resize listeners respond
  window.dispatchEvent(new Event('resize'));
};

const restoreMediaOverrides = () => {
  if (!overrideState) return;

  restoreCSSMediaRules(overrideState);
  restoreJSAPIs(overrideState);
  removeViewportIframe();

  overrideState = null;

  window.dispatchEvent(new Event('resize'));
};

export const viewport = (width?: number, height?: number): void => {
  if (width === undefined) {
    resetViewport();
    return;
  }

  saveOriginalStyles();

  const { style } = document.body;
  style.maxWidth = `${width}px`;
  style.margin = '0 auto';
  style.overflow = 'auto';
  style.boxSizing = 'border-box';
  style.boxShadow = '0 0 0 1px rgba(37, 99, 235, 0.4)';

  if (height !== undefined) {
    style.minHeight = `${height}px`;
    style.maxHeight = `${height}px`;
  } else {
    style.minHeight = originalStyles!.minHeight;
    style.maxHeight = originalStyles!.maxHeight;
  }

  applyMediaOverrides(width, height);

  injectBadge(width, height);
  log(`viewport(${width}${height !== undefined ? `, ${height}` : ''})`);
};

export const resetViewport = (): void => {
  if (!originalStyles) return;

  restoreMediaOverrides();

  const { style } = document.body;
  style.maxWidth = originalStyles.maxWidth;
  style.maxHeight = originalStyles.maxHeight;
  style.minHeight = originalStyles.minHeight;
  style.overflow = originalStyles.overflow;
  style.margin = originalStyles.margin;
  style.boxSizing = originalStyles.boxSizing;
  style.boxShadow = originalStyles.boxShadow;

  originalStyles = null;
  removeBadge();
  log('resetViewport()');
};
