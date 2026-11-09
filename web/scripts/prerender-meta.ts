/**
 * Writes a static HTML file per page with that page's title, description and
 * link-preview tags (Open Graph + Twitter/X), after `vite build`.
 *
 * Why: the site is a single-page app, and WhatsApp, LinkedIn, Facebook, X,
 * iMessage, Slack and Teams never run JavaScript when they build a link
 * preview — they read only the HTML the server sends. Without this, every
 * shared link previews as the homepage. Each file is dist/index.html with the
 * block between <!-- seo:start --> and <!-- seo:end --> replaced, written to
 * dist/<path>/index.html, which Vercel serves at /<path> before the SPA
 * fallback rewrite applies. The app itself is unchanged; it boots as usual.
 *
 * Runs on Node's native TypeScript support: `node scripts/prerender-meta.ts`.
 * Page data is loaded through Vite so the app's `@/` aliases resolve.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { createServer } from 'vite'

type MetaInput = { title?: string; description?: string; path?: string }
type MetaModule = {
  buildMeta: (i: MetaInput) => unknown[]
  metaToHtml: (tags: unknown[], indent?: string) => string
}
type Page = { slug: string; title: string; description: string }

const TEMPLATE = 'dist/index.html'
const BLOCK = /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/

if (!existsSync(TEMPLATE)) {
  console.error('[prerender-meta] dist/index.html not found. Run `vite build` first.')
  process.exit(1)
}
const template = readFileSync(TEMPLATE, 'utf8')
if (!BLOCK.test(template)) {
  console.error('[prerender-meta] seo markers missing from index.html.')
  process.exit(1)
}

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error', mode: 'production' })
try {
  const { buildMeta, metaToHtml } = (await server.ssrLoadModule('/src/lib/seo/meta.ts')) as MetaModule
  const { PAGE_META, sectorTitle } = (await server.ssrLoadModule('/src/config/site.ts')) as {
    PAGE_META: Record<string, { title?: string; description: string }>
    sectorTitle: (t: string) => string
  }
  const { SERVICES } = (await server.ssrLoadModule('/src/data/services.ts')) as { SERVICES: Page[] }
  const { INDUSTRIES } = (await server.ssrLoadModule('/src/data/industries.ts')) as { INDUSTRIES: Page[] }

  const list: (MetaInput & { path: string })[] = [
    ...Object.entries(PAGE_META).map(([path, m]) => ({ path, title: m.title, description: m.description })),
    ...SERVICES.map((s) => ({ path: `/services/${s.slug}`, title: s.title, description: s.description })),
    ...INDUSTRIES.map((i) => ({ path: `/industries/${i.slug}`, title: sectorTitle(i.title), description: i.description })),
  ]

  for (const page of list) {
    // A function replacement, so "$" in copy is never treated as a pattern.
    const html = template.replace(BLOCK, () => `<!-- seo:start -->\n${metaToHtml(buildMeta(page))}\n    <!-- seo:end -->`)
    const out = page.path === '/' ? TEMPLATE : join('dist', page.path, 'index.html')
    mkdirSync(dirname(out), { recursive: true })
    writeFileSync(out, html)
  }
  console.log(`[prerender-meta] Wrote link-preview HTML for ${list.length} pages`)
} finally {
  await server.close()
}
