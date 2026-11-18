/* eslint-disable react-refresh/only-export-components -- build-time entry, never hot-reloaded */
/**
 * Build-time renderer: turns one route into the HTML for <div id="root">.
 * Used by scripts/prerender-meta.ts after `vite build --ssr`; never shipped to
 * the browser.
 *
 * Pages are passed in eagerly imported, so nothing suspends and a plain
 * synchronous render produces the finished page: no Suspense placeholders and
 * no streaming <script> tags (the Content-Security-Policy forbids inline
 * scripts). The head tags React would
 * hoist (title, meta, preloads) are dropped from the body: the build writes
 * the same tags into <head>, and on the client <Seo> takes them over.
 */
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { AppRoutes, type Pages } from './App'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ServicesPage from './pages/ServicesPage'
import ServiceDetailPage from './pages/services/ServiceDetailPage'
import IndustriesPage from './pages/IndustriesPage'
import IndustryDetailPage from './pages/industries/IndustryDetailPage'
import ContactPage from './pages/ContactPage'
import FaqPage from './pages/FaqPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import NotFoundPage from './pages/NotFoundPage'

const PAGES: Pages = {
  HomePage,
  AboutPage,
  ServicesPage,
  ServiceDetailPage,
  IndustriesPage,
  IndustryDetailPage,
  ContactPage,
  FaqPage,
  PrivacyPolicyPage,
  TermsOfServicePage,
  NotFoundPage,
}

export function render(url: string): string {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <AppRoutes pages={PAGES} />
      </StaticRouter>
    </StrictMode>,
  )
  if (html.includes('<!--$!-->') || html.includes('<!--$?-->')) throw new Error(`[prerender] ${url} rendered a Suspense fallback instead of the page`)
  const scripts = html.match(/<script(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/g)
  if (scripts) throw new Error(`[prerender] ${url} contains an executable <script>: ${scripts.map((s) => s.slice(0, 90)).join(' || ')}`)
  // Everything before the app's first element is hoisted head content.
  return html.slice(html.search(/<(?!link|meta|title|base|style)[a-z]/i))
}
