import { SITE } from '@/config/site'
import { absoluteUrl } from './url'

/**
 * Builds the <head> tags for one page: title, description, canonical, Open
 * Graph and Twitter/X cards. Shared by the in-app <Seo> component and by
 * scripts/prerender-meta.ts, which writes the same tags into a static HTML
 * file per page at build time. Link previews (WhatsApp, LinkedIn, Facebook,
 * X, iMessage, Slack, Teams) never run JavaScript, so those static files are
 * what they actually read.
 */
export interface MetaInput {
  /** Page name, rendered as "<title> | GULF NEXT Oil and Gas". Omit for the homepage. */
  title?: string
  description?: string
  /** Route path, e.g. "/about". Used for the canonical URL and og:url. */
  path?: string
  /** Custom preview image (path or URL). Defaults to the branded 1200x630 card. */
  image?: string
  imageAlt?: string
  type?: 'website' | 'article'
  noIndex?: boolean
}

export type MetaTag = { tag: 'title'; text: string } | { tag: 'meta' | 'link'; attrs: Record<string, string> }

export function fullTitle(title?: string): string {
  return title ? `${title} | ${SITE.name}` : SITE.homeTitle
}

export function buildMeta({
  title,
  description = SITE.defaultDescription,
  path = '/',
  image,
  imageAlt,
  type = 'website',
  noIndex = false,
}: MetaInput): MetaTag[] {
  const t = fullTitle(title)
  const url = absoluteUrl(path)
  const isDefault = !image
  const img = absoluteUrl(image ?? SITE.defaultImage)
  const alt = imageAlt ?? (isDefault ? SITE.defaultImageAlt : t)
  const meta = (attrs: Record<string, string>): MetaTag => ({ tag: 'meta', attrs })

  return [
    { tag: 'title', text: t },
    meta({ name: 'description', content: description }),
    { tag: 'link', attrs: { rel: 'canonical', href: url } },
    ...(noIndex ? [meta({ name: 'robots', content: 'noindex, nofollow' })] : []),

    meta({ property: 'og:site_name', content: SITE.name }),
    meta({ property: 'og:locale', content: SITE.ogLocale }),
    meta({ property: 'og:type', content: type }),
    meta({ property: 'og:title', content: t }),
    meta({ property: 'og:description', content: description }),
    meta({ property: 'og:url', content: url }),
    meta({ property: 'og:image', content: img }),
    meta({ property: 'og:image:secure_url', content: img }),
    ...(isDefault
      ? [
          meta({ property: 'og:image:type', content: 'image/jpeg' }),
          meta({ property: 'og:image:width', content: String(SITE.defaultImageSize.width) }),
          meta({ property: 'og:image:height', content: String(SITE.defaultImageSize.height) }),
        ]
      : []),
    meta({ property: 'og:image:alt', content: alt }),

    meta({ name: 'twitter:card', content: 'summary_large_image' }),
    meta({ name: 'twitter:title', content: t }),
    meta({ name: 'twitter:description', content: description }),
    meta({ name: 'twitter:image', content: img }),
    meta({ name: 'twitter:image:alt', content: alt }),
  ]
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Serialise tags as static HTML. Each tag carries `data-seo` so the app can
 * drop them on start-up and let <Seo> own the head from then on.
 */
export function metaToHtml(tags: MetaTag[], indent = '    '): string {
  return tags
    .map((m) => {
      if (m.tag === 'title') return `${indent}<title data-seo>${escapeHtml(m.text)}</title>`
      const attrs = Object.entries(m.attrs)
        .map(([k, v]) => `${k}="${escapeHtml(v)}"`)
        .join(' ')
      return `${indent}<${m.tag} data-seo ${attrs} />`
    })
    .join('\n')
}
