import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Typefaces are self-hosted (Google Fonts sources, trimmed to the weights and
// widths the site uses by scripts/build-fonts.py): no render-blocking request
// to another origin, and visitors' IP addresses are not sent to a third party.
import './assets/fonts/fonts.css'
import './index.css'
import App from './App.tsx'

// Static title/link-preview tags written into the HTML for crawlers sit
// between <!-- seo:start --> and <!-- seo:end --> (scripts/prerender-meta.ts).
// Once the app runs, <Seo> renders the live ones, so drop the static block to
// avoid duplicate tags when navigating between pages.
removeStaticSeo()

function removeStaticSeo(): void {
  let inside = false
  for (const node of [...document.head.childNodes]) {
    const marker = node.nodeType === Node.COMMENT_NODE ? node.textContent?.trim() : null
    if (marker === 'seo:start') inside = true
    else if (marker === 'seo:end') inside = false
    else if (inside) node.remove()
  }
}

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
