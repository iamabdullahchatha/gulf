import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Static title/link-preview tags written into the HTML for crawlers (see
// scripts/prerender-meta.ts). Once the app runs, <Seo> renders the live ones,
// so drop these to avoid duplicates when navigating between pages.
document.head.querySelectorAll('[data-seo]').forEach((el) => el.remove())

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
