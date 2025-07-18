if (import.meta.env.DEV || import.meta.env.MODE === 'production') {
  const { worker } = await import('./mocks/browser')
  worker.start()
}
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './main.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
