if (import.meta.env.DEV) {
  await import('./mocks/browser').then(({ worker }) => worker.start());
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
