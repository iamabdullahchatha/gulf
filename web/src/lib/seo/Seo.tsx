import { SITE } from '@/config/site'
import { absoluteUrl } from './url'
import type { JsonLd } from './structured-data'

/**
 * Per-page SEO metadata.
 *
 * React 19 hoists <title>, <meta> and <link> rendered anywhere in the tree into
 * <head>, so no third-party head manager is needed. Render <Seo /> once at the
 * top of each route component.
 */
export interface SeoProps {
  title?: string
  description?: string
  /** Route path, e.g. "/about". Used for the canonical URL and og:url. */
  path?: string
  image?: string
  type?: 'website' | 'article'
  noIndex?: boolean
  /** One or more schema.org objects, emitted as JSON-LD. */
  jsonLd?: JsonLd | JsonLd[]
}

export function Seo({
  title,
  description = SITE.defaultDescription,
  path = '/',
  image = SITE.defaultImage,
  type = 'website',
  noIndex = false,
  jsonLd,
}: SeoProps) {
  const fullTitle = title ? `${title} | ${SITE.name}` : SITE.name
  const url = absoluteUrl(path)
  const img = absoluteUrl(image)
  const ld = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />

      {ld.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          // JSON.stringify output is escaped for </script> safety.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj).replace(/</g, '\\u003c') }}
        />
      ))}
    </>
  )
}

