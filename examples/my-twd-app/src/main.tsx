import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { TWDSidebar } from '../../../src'
import './loadTests' // Import test files
import router from './routes.ts'
import { RouterProvider } from 'react-router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <TWDSidebar open={true} position="right" />
  </StrictMode>,
)
