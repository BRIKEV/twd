import { injectTheme, TWDTheme } from "../ui/utils/theme";

interface Options {
  Component: React.ReactNode;
  createRoot: (el: HTMLElement) => { render: (el: React.ReactNode) => void };
  /**
   * Optional theme customization
   * Users can override default theme values by passing a partial theme object
   */
  theme?: Partial<TWDTheme>;
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
 *   theme: { primary: '#ff0000', background: '#ffffff' }
 * });
 * ```
 */
export const initSidebar = (options: Options) => {
  const { Component, createRoot, theme } = options;
  
  // Inject theme CSS variables
  injectTheme(theme);
  
  const el = document.createElement('div');
  el.setAttribute('id', 'twd-sidebar-root');
  document.body.appendChild(el);
  const root = createRoot(el);
  root.render(Component);
};
