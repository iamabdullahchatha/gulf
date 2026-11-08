/**
 * FAQ catalogue for the /faqs page. It gathers every question already
 * published on the site (company, enquiry, service and industry FAQs), removes
 * duplicates and gives each one a stable id for deep links (/faqs#<id>).
 * No new answers are written here.
 */
import { ABOUT_FAQ, CONTACT_FAQ, type FaqItem } from '@/data/faq'
import { SERVICES } from '@/data/services'
import { INDUSTRIES } from '@/data/industries'

export type FaqCategoryKey = 'company' | 'working' | 'enquiries' | 'safety' | 'services' | 'industries'

export interface FaqCategory {
  key: FaqCategoryKey
  title: string
  desc: string
}

export interface CatalogFaq {
  id: string
  q: string
  a: string
  category: FaqCategoryKey
  /** Sub-heading inside a category (a service or an industry). */
  group?: string
  link?: { label: string; href: string }
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  { key: 'company', title: 'Company', desc: 'Who we are, where we work and the sectors we serve.' },
  { key: 'working', title: 'Working with us', desc: 'Scopes, contracting models and planning around your operations.' },
  { key: 'enquiries', title: 'Enquiries', desc: 'What to send us and what happens after you get in touch.' },
  { key: 'safety', title: 'Safety & quality', desc: 'How we approach live-plant work and what you receive at handover.' },
  { key: 'services', title: 'Services', desc: 'Questions about each of our nine service lines.' },
  { key: 'industries', title: 'Industries', desc: 'Questions about working in each of the four sectors.' },
]

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64)

function build(): CatalogFaq[] {
  const out: CatalogFaq[] = []
  const seen = new Set<string>()
  const ids = new Set<string>()
  const add = (f: FaqItem, category: FaqCategoryKey, extra: Partial<CatalogFaq> = {}) => {
    const key = f.q.trim().toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    let id = slug(f.q)
    for (let n = 2; ids.has(id); n++) id = `${slug(f.q)}-${n}`
    ids.add(id)
    out.push({ id, q: f.q, a: f.a, category, ...extra })
  }

  const ABOUT_TOPIC: Record<string, FaqCategoryKey> = { Company: 'company', Projects: 'working', 'Safety & quality': 'safety' }
  const CONTACT_TOPIC: Record<string, FaqCategoryKey> = { 'Your enquiry': 'enquiries', 'Working with us': 'working' }
  for (const f of ABOUT_FAQ) add(f, ABOUT_TOPIC[f.topic ?? ''] ?? 'company')
  for (const f of CONTACT_FAQ) add(f, CONTACT_TOPIC[f.topic ?? ''] ?? 'enquiries')
  for (const s of SERVICES) for (const f of s.faqs) add(f, 'services', { group: s.title, link: { label: `View ${s.title}`, href: `/services/${s.slug}` } })
  for (const i of INDUSTRIES) for (const f of i.faqs) add(f, 'industries', { group: i.title, link: { label: `View ${i.title}`, href: `/industries/${i.slug}` } })

  const order = FAQ_CATEGORIES.map((c) => c.key)
  return out.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category))
}

export const FAQ_CATALOG: CatalogFaq[] = build()

/** Questions shown on the hero carousel: a spread across the topics. */
export const FEATURED_FAQ: CatalogFaq[] = (() => {
  const picks: CatalogFaq[] = []
  const take = (cat: FaqCategoryKey, n: number) => picks.push(...FAQ_CATALOG.filter((f) => f.category === cat).slice(0, n))
  take('company', 1)
  take('working', 2)
  take('enquiries', 2)
  take('safety', 1)
  take('services', 1)
  take('industries', 1)
  return picks
})()
