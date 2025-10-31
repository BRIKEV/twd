interface Options {
  Component: React.ReactNode;
  createRoot: (el: HTMLElement) => { render: (el: React.ReactNode) => void };
}

/**
 * Initialize the TWD sidebar.
 * @param options - Options for initializing the sidebar.
 * @example
 * ```ts
 * import { initSidebar } from 'twd-js';
 * 
 * // Initialize the sidebar (e.g., in your main app file)
 * initSidebar({
 *   Component: <TWDSidebar open={true} position="left" />,
 *   createRoot,
 * });
 * ```
 */
export const initSidebar = (options: Options) => {
  const { Component, createRoot } = options;
  const el = document.createElement('div');
  el.setAttribute('id', 'twd-sidebar-root');
  document.body.appendChild(el);
  const root = createRoot(el);
  root.render(Component);
};
