/**
 * Site-wide constants used by SEO metadata, the sitemap and navigation.
 * VITE_SITE_URL can override the canonical origin (see .env.example).
 */
export const SITE = {
  name: 'GULF NEXT Oil and Gas',
  shortName: 'GULF NEXT',
  url: (import.meta.env?.VITE_SITE_URL as string | undefined) || 'https://www.gulfnext.ae',
  defaultDescription:
    'Integrated engineering, construction and operations support for the oil, gas and petrochemical sector.',
  defaultImage: '/brand/og-image.webp',
  logo: '/brand/logo.webp',
  locale: 'en',
  themeColor: '#040c1c',
} as const

/** Public routes. The sitemap is generated from this list. */
export const ROUTES = [
  { path: '/', changefreq: 'monthly', priority: 1.0 },
  { path: '/about', changefreq: 'yearly', priority: 0.8 },
  { path: '/services', changefreq: 'monthly', priority: 0.9 },
  { path: '/industries', changefreq: 'monthly', priority: 0.9 },
  { path: '/faqs', changefreq: 'monthly', priority: 0.7 },
  { path: '/contact', changefreq: 'yearly', priority: 0.7 },
] as const
