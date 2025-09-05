import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { TWDSidebar } from '../../../src/TWDSidebar'
import './loadTests' // Importa los archivos de test para que se registren
import router from './routes.ts'
import { RouterProvider } from 'react-router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <TWDSidebar />
  </StrictMode>,
)
