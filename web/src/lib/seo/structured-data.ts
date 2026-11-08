import { SITE } from '@/config/site'
import { absoluteUrl } from './url'

export type JsonLd = Record<string, unknown>

/** schema.org Organization block for the homepage. */
export function organizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    logo: absoluteUrl(SITE.logo),
  }
}

/** schema.org BreadcrumbList for inner pages. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}
