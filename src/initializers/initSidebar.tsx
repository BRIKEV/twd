import { TWDSidebar } from '../ui/TWDSidebar';

interface Options {
  open: boolean;
  position?: 'left' | 'right';
}

/**
 * Initialize the TWD sidebar.
 * @param options - Options for initializing the sidebar.
 * @example
 * ```ts
 * import { initSidebar } from 'twd-js';
 * 
 * // Initialize the sidebar (e.g., in your main app file)
 * initSidebar({ open: false, position: 'left' });
 * ```
 */
export const initSidebar = async (options: Options) => {
  const el = document.createElement('div');
  document.body.appendChild(el);

  const { createRoot } = await import('react-dom/client');
  const root = createRoot(el);
  root.render(<TWDSidebar open={options.open} position={options.position} />);
};
