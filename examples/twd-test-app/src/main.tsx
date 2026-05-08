import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import router from './routes.tsx';
import { RouterProvider } from 'react-router';

// twd-relay browser client (separate from twd-js init, which the twd Vite plugin handles).
if (import.meta.env.DEV) {
  const { createBrowserClient } = await import('twd-relay/browser');
  const client = createBrowserClient();
  client.connect();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
