/**
 * Site navigation. Services and Industries open full-width mega menus whose
 * content is generated from `services.ts` and `industries.ts`, so adding a
 * service or industry updates the menu, footer and pages together.
 */
export type MegaKey = 'services' | 'industries'

export interface NavEntry {
  label: string
  href: string
  mega?: MegaKey
}

export const PRIMARY_NAV: NavEntry[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services', mega: 'services' },
  { label: 'Industries', href: '/industries', mega: 'industries' },
  { label: 'FAQs', href: '/faqs' },
]

/** Company links for the footer. Every anchor here exists on the page. */
export const COMPANY_LINKS = [
  { label: 'About GULF NEXT', href: '/about' },
  { label: 'Core values', href: '/about#values' },
  { label: 'HSE & quality', href: '/about#hse' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Contact', href: '/contact' },
]
