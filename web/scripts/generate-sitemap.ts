/**
 * Writes dist/sitemap.xml and dist/robots.txt after `vite build`.
 * Runs on Node's native TypeScript support: `node scripts/generate-sitemap.ts`.
 *
 * The page list comes from the site's own data (src/config/site.ts plus every
 * service and industry), loaded through Vite so the app's aliases resolve.
 */
import { existsSync, writeFileSync } from 'node:fs'
import { createServer, loadEnv } from 'vite'
import { collectRoutes, resolveSiteUrl, robotsTxt, sitemapXml } from './sitemap-core.ts'

if (!existsSync('dist')) {
  console.error('[sitemap] dist/ not found. Run `vite build` first.')
  process.exit(1)
}

const env = loadEnv('production', process.cwd(), 'VITE_')
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error', mode: 'production' })
try {
  const { routes, fallbackUrl } = await collectRoutes((id) => server.ssrLoadModule(id))
  const siteUrl = resolveSiteUrl(env.VITE_SITE_URL, fallbackUrl)
  writeFileSync('dist/sitemap.xml', sitemapXml(routes, siteUrl))
  writeFileSync('dist/robots.txt', robotsTxt(siteUrl))
  const source = env.VITE_SITE_URL || process.env.VITE_SITE_URL ? 'VITE_SITE_URL' : 'default in src/config/site.ts'
  console.log(`[sitemap] Wrote sitemap.xml (${routes.length} URLs) and robots.txt for ${siteUrl} (from ${source})`)
} finally {
  await server.close()
}
