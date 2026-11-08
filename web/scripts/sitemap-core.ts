/**
 * Builds sitemap.xml and robots.txt from the site's own data, so every
 * service and industry page is listed automatically. Shared by the dev-server
 * middleware (vite.config.ts) and the post-build writer (generate-sitemap.ts).
 *
 * `load` is Vite's `ssrLoadModule`, which resolves the app's `@/` aliases and
 * TypeScript exactly as the site itself does.
 */
type Load = (id: string) => Promise<Record<string, unknown>>

interface Route {
  path: string
  changefreq: string
  priority: number
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Canonical origin, in order of preference: VITE_SITE_URL, the default in
 * src/config/site.ts, then the Vercel production domain as a last resort.
 */
export function resolveSiteUrl(viteSiteUrl: string | undefined, fallback: string): string {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const url = viteSiteUrl || process.env.VITE_SITE_URL || fallback || (vercel ? `https://${vercel}` : '')
  return url.replace(/\/$/, '')
}

export async function collectRoutes(load: Load): Promise<{ routes: Route[]; fallbackUrl: string }> {
  const site = await load('/src/config/site.ts')
  const { SERVICES } = (await load('/src/data/services.ts')) as { SERVICES: { slug: string }[] }
  const { INDUSTRIES } = (await load('/src/data/industries.ts')) as { INDUSTRIES: { slug: string }[] }
  const base = site.ROUTES as readonly Route[]
  const routes: Route[] = [
    ...base,
    ...SERVICES.map((s) => ({ path: `/services/${s.slug}`, changefreq: 'monthly', priority: 0.8 })),
    ...INDUSTRIES.map((i) => ({ path: `/industries/${i.slug}`, changefreq: 'monthly', priority: 0.8 })),
  ]
  const fallbackUrl = (site.SITE as { url: string }).url
  return { routes, fallbackUrl }
}

export function sitemapXml(routes: Route[], siteUrl: string, lastmod = new Date().toISOString().slice(0, 10)): string {
  const urls = routes
    .map(
      (r) =>
        `  <url>\n    <loc>${esc(siteUrl + (r.path === '/' ? '/' : r.path))}</loc>\n    <lastmod>${lastmod}</lastmod>\n` +
        `    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority.toFixed(1)}</priority>\n  </url>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export function robotsTxt(siteUrl: string): string {
  return ['# GULF NEXT Oil and Gas', 'User-agent: *', 'Allow: /', '', `Sitemap: ${siteUrl}/sitemap.xml`, ''].join('\n')
}
