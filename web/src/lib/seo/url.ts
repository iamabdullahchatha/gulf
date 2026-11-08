import { SITE } from '@/config/site'

/** Resolve a path ("/about") or URL against the canonical site origin. */
export function absoluteUrl(pathOrUrl: string): string {
  return new URL(pathOrUrl, SITE.url).toString()
}
