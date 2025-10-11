import { TWDSidebar } from '../ui/TWDSidebar';

interface Options {
  open: boolean;
  position?: 'left' | 'right';
}

// src/loadTests.tsx
export const initSidebar = async (options: Options) => {
  const el = document.createElement('div');
  document.body.appendChild(el);

  const { createRoot } = await import('react-dom/client');
  const root = createRoot(el);
  root.render(<TWDSidebar open={options.open} position={options.position} />);
};
