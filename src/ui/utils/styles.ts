export const CSS_STYLES = `
/* ========================
   Animation keyframes
   ======================== */
@keyframes twd-spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ========================
   Buttons — shared base
   ======================== */
.twd-btn {
  cursor: pointer;
  border-radius: var(--twd-border-radius);
  transition: all var(--twd-animation-duration) ease;
}
.twd-btn:hover { filter: brightness(1.15); }
.twd-btn:active { filter: brightness(0.9); }
.twd-btn:focus-visible {
  outline: 2px solid var(--twd-primary);
  outline-offset: 2px;
}
.twd-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.twd-btn:disabled:hover { filter: none; }

/* ========================
   Button variants
   ======================== */
.twd-btn-primary {
  background: var(--twd-button-primary);
  color: var(--twd-button-primary-text);
  padding: var(--twd-spacing-xs) var(--twd-spacing-md);
  border: none;
}
.twd-btn-secondary {
  background: var(--twd-button-secondary);
  color: var(--twd-button-secondary-text);
  padding: var(--twd-spacing-xs) var(--twd-spacing-md);
  border: 1px solid var(--twd-button-border);
}
.twd-btn-icon {
  background: transparent;
  border: 1px solid var(--twd-border-light);
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  font-size: var(--twd-font-size-sm);
}
.twd-btn-mock-rules {
  background: var(--twd-button-secondary);
  border: 1px solid var(--twd-button-border);
  border-radius: var(--twd-border-radius-lg);
  padding: var(--twd-spacing-md) var(--twd-spacing-lg);
  font-size: var(--twd-font-size-sm);
  color: var(--twd-button-secondary-text);
  display: flex;
  align-items: center;
  gap: var(--twd-spacing-md);
  margin-bottom: 10px;
  width: 100%;
  text-align: left;
  transition: all var(--twd-animation-duration) ease;
  box-shadow: var(--twd-shadow-sm);
}

/* ========================
   Sidebar layout
   ======================== */
.twd-sidebar {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  position: fixed;
  top: 0;
  bottom: 0;
  width: var(--twd-sidebar-width);
  background: var(--twd-background);
  font-size: var(--twd-font-size-md);
  overflow-y: auto;
  box-shadow: var(--twd-shadow);
  text-align: left;
  z-index: var(--twd-z-index-sidebar);
  pointer-events: all;
  isolation: isolate;
}
.twd-sidebar-header {
  padding: var(--twd-spacing-md);
  background: var(--twd-background);
  position: sticky;
  top: 0;
  z-index: var(--twd-z-index-sticky);
  border-bottom: 1px solid var(--twd-border);
}
.twd-sidebar-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--twd-spacing-xl);
}
.twd-sidebar-header-buttons {
  display: flex;
  gap: var(--twd-spacing-xs);
}
.twd-sidebar-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--twd-font-size-md);
  color: var(--twd-text-secondary);
  margin-bottom: 10px;
}
.twd-sidebar-stats-counts {
  display: flex;
  gap: var(--twd-spacing-xs);
}
.twd-sidebar-content {
  padding: var(--twd-spacing-md);
}
.twd-sidebar-closed {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  z-index: var(--twd-z-index-sidebar);
  background: var(--twd-button-primary);
  color: var(--twd-button-primary-text);
  padding: var(--twd-spacing-sm) 10px;
  font-size: var(--twd-font-size-sm);
}
.twd-sidebar-version {
  color: var(--twd-text-secondary);
  font-size: var(--twd-font-size-sm);
  align-self: center;
}

/* ========================
   Test list
   ======================== */
.twd-test-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.twd-test-group {
  background: var(--twd-describe-bg);
  border-left: 3px solid var(--twd-describe-border);
  border-radius: var(--twd-border-radius);
  padding: var(--twd-spacing-xs) var(--twd-spacing-sm);
  margin-bottom: var(--twd-spacing-sm);
}
.twd-test-group-toggle {
  font-weight: var(--twd-font-weight-medium);
  font-size: var(--twd-font-size-sm);
  cursor: pointer;
  color: var(--twd-describe-text);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--twd-spacing-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.twd-test-item {
  display: flex;
  align-items: left;
  justify-content: space-between;
  padding: var(--twd-spacing-sm) var(--twd-spacing-sm);
  border-radius: var(--twd-border-radius);
}
.twd-test-item-name {
  font-weight: var(--twd-font-weight-medium);
  font-size: var(--twd-font-size-md);
  color: var(--twd-text);
  max-width: 220px;
}
.twd-test-item-logs {
  border-radius: var(--twd-border-radius);
  max-height: 260px;
  overflow-y: auto;
  padding: 0;
  background: var(--twd-background-secondary);
  list-style: none;
  margin-top: var(--twd-spacing-xs);
  text-align: left;
}

/* ========================
   Status variants
   ======================== */
.twd-status-pass  { background: var(--twd-success-bg); }
.twd-status-fail  { background: var(--twd-error-bg); }
.twd-status-skip  { background: var(--twd-skip-bg); }
.twd-status-running { background: var(--twd-warning-bg); }

/* ========================
   Search
   ======================== */
.twd-search-wrapper {
  position: relative;
  margin-bottom: var(--twd-spacing-md);
}
.twd-search-input {
  width: 100%;
  padding: var(--twd-spacing-md);
  background: var(--twd-background);
  color: var(--twd-text);
  border: 1px solid var(--twd-border);
  border-radius: var(--twd-border-radius);
  font-size: var(--twd-font-size-md);
  box-sizing: border-box;
}
.twd-search-input:focus-visible {
  outline: 2px solid var(--twd-primary);
  outline-offset: 2px;
}

/* ========================
   Loader
   ======================== */
.twd-loader {
  animation: twd-spin 1s linear infinite;
}
`;

/**
 * Injects all sidebar CSS classes into the document.
 * Guards against double-injection (same pattern as injectTheme).
 * Called once from initSidebar.tsx after injectTheme().
 */
export function injectStyles(): void {
  const styleId = 'twd-styles';
  if (document.getElementById(styleId)) return;

  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.textContent = CSS_STYLES;
  document.head.appendChild(styleElement);
}
