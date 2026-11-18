/**
 * Site-wide constants used by SEO metadata, the sitemap and navigation.
 * VITE_SITE_URL can override the canonical origin (see .env.example).
 */
export const SITE = {
  name: 'GULF NEXT Oil and Gas',
  shortName: 'GULF NEXT',
  url: (import.meta.env?.VITE_SITE_URL as string | undefined) || 'https://www.gulfnext.ae',
  /** Full title of the homepage (other pages use "<Page> | <name>"). */
  homeTitle: 'GULF NEXT Oil and Gas',
  defaultDescription:
    'Integrated engineering, construction and operations support for the oil, gas and petrochemical sector.',
  /**
   * Link-preview image (WhatsApp, LinkedIn, Facebook, X, iMessage, Slack):
   * the original branded artwork, uncropped. Width/height/type are declared
   * so apps render the large-image card straight away. Pair with
   * `twitter:card=summary_large_image` (set in lib/seo/meta.ts).
   */
  defaultImage: '/brand/og-image.webp',
  defaultImageType: 'image/webp',
  defaultImageAlt: 'GULF NEXT Oil and Gas',
  defaultImageSize: { width: 1672, height: 941 },
  logo: '/brand/logo.webp',
  locale: 'en',
  themeColor: '#040c1c',
} as const

/** Page title for an industry page, e.g. "Oil & Gas Sector" (the site calls them sectors). */
export const sectorTitle = (industry: string) => `${industry} Sector`

/**
 * Title and link-preview description for each top-level page — the single
 * source for both the in-app <Seo> tags and the static HTML written per page
 * at build time (scripts/prerender-meta.ts), which is what WhatsApp, LinkedIn
 * and other link previews read, since they do not run JavaScript.
 * Keep descriptions under ~160 characters so previews do not truncate them.
 * Service and industry pages use the title/description in their data files.
 */
export const PAGE_META = {
  '/': { title: undefined, description: SITE.defaultDescription },
  '/about': {
    title: 'About Us',
    description:
      'Engineering strength, building trust. GULF NEXT delivers integrated engineering, construction, maintenance and supply for oil, gas and industrial facilities.',
  },
  '/services': {
    title: 'Our Services',
    description:
      'Nine integrated service lines under one point of accountability: field services, drilling support, pipelines, mechanical works, construction and maintenance.',
  },
  '/industries': {
    title: 'Industries We Serve',
    description:
      'Engineering, construction and maintenance support for oil and gas, petrochemical and processing, industrial infrastructure and mechanical equipment.',
  },
  '/faqs': {
    title: 'FAQs',
    description:
      'Answers to common questions about working with GULF NEXT: our nine service lines, the sectors we support, safety, enquiries and project handover.',
  },
  '/contact': {
    title: 'Contact Us',
    description:
      'Tell us about your scope, site and schedule. Our engineering team will come back with a practical plan for your oil, gas or industrial project.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy',
    description:
      'How GULF NEXT collects, uses and protects personal information shared through our website and enquiries, and the rights you have over it.',
  },
  '/terms-of-service': {
    title: 'Terms of Service',
    description:
      'The terms that apply when you use the GULF NEXT website, including acceptable use, intellectual property, enquiries and governing law.',
  },
} as const satisfies Record<string, { title: string | undefined; description: string }>

/** Public routes. The sitemap is generated from this list. */
export const ROUTES = [
  { path: '/', changefreq: 'monthly', priority: 1.0 },
  { path: '/about', changefreq: 'yearly', priority: 0.8 },
  { path: '/services', changefreq: 'monthly', priority: 0.9 },
  { path: '/industries', changefreq: 'monthly', priority: 0.9 },
  { path: '/faqs', changefreq: 'monthly', priority: 0.7 },
  { path: '/contact', changefreq: 'yearly', priority: 0.7 },
  { path: '/privacy-policy', changefreq: 'yearly', priority: 0.3 },
  { path: '/terms-of-service', changefreq: 'yearly', priority: 0.3 },
] as const
