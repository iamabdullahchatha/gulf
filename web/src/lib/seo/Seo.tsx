import { buildMeta, type MetaInput } from './meta'
import type { JsonLd } from './structured-data'

/**
 * Per-page SEO metadata.
 *
 * React 19 hoists <title>, <meta> and <link> rendered anywhere in the tree into
 * <head>, so no third-party head manager is needed. Render <Seo /> once at the
 * top of each route component. The tags come from `buildMeta`, the same
 * builder the build uses to write static per-page HTML for link previews.
 */
export interface SeoProps extends MetaInput {
  /** One or more schema.org objects, emitted as JSON-LD. */
  jsonLd?: JsonLd | JsonLd[]
}

export function Seo({ jsonLd, ...meta }: SeoProps) {
  const ld = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []
  return (
    <>
      {buildMeta(meta).map((m, i) => {
        if (m.tag === 'title') return <title key={i}>{m.text}</title>
        return m.tag === 'meta' ? <meta key={i} {...m.attrs} /> : <link key={i} {...m.attrs} />
      })}
      {ld.map((obj, i) => (
        <script
          key={`ld-${i}`}
          type="application/ld+json"
          // JSON.stringify output is escaped for </script> safety.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj).replace(/</g, '\\u003c') }}
        />
      ))}
    </>
  )
}
