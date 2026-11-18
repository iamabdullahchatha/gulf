/**
 * Company facts — VERIFIED DATA ONLY.
 * ----------------------------------------------------------------------------
 * Every field here is rendered on the public site (footer, contact page,
 * structured data). Leave a field `null` until it has been confirmed from the
 * company's registration documents. Components render nothing for `null`
 * fields — they never fall back to sample or placeholder values.
 *
 * Status (2026-11-18): email, LinkedIn page and both office addresses
 * confirmed by the company. Phone, hours and registration number are still
 * unverified.
 */
export interface Office {
  /** Role of the office, e.g. "Head office". */
  label: string
  /** City shown as the office's heading. */
  city: string
  /** Address lines as printed, most specific first. */
  lines: string[]
  /** The same address for schema.org (search engines, maps). */
  postal: { streetAddress: string; addressLocality: string; addressRegion: string; addressCountry: string }
}

export interface CompanyContact {
  email: string | null
  phone: string | null
  /** Head office first. Empty until verified. */
  offices: Office[]
  /** e.g. "Sun–Thu, 08:00–17:00 GST" */
  hours: string | null
}

export interface Company {
  legalName: string
  tradingName: string
  /** Commercial registration number, once verified. */
  registrationNumber: string | null
  contact: CompanyContact
  /** Official social profiles (also published as schema.org `sameAs`). */
  social: {
    linkedin: string | null
  }
}

export const COMPANY: Company = {
  legalName: 'GULF NEXT Oil and Gas',
  tradingName: 'GULF NEXT',
  registrationNumber: null,
  contact: {
    email: 'info@gulfnext.ae',
    phone: null,
    offices: [
      {
        label: 'Head office',
        city: 'Al Ruwais',
        lines: ['Al Ruwais Industrial City', 'Abu Dhabi, United Arab Emirates'],
        postal: { streetAddress: 'Al Ruwais Industrial City', addressLocality: 'Al Ruwais', addressRegion: 'Abu Dhabi', addressCountry: 'AE' },
      },
      {
        label: 'Branch office',
        city: 'Dubai',
        lines: ['Park Avenue Building, Dubai Silicon Oasis', 'Dubai, United Arab Emirates'],
        postal: { streetAddress: 'Park Avenue Building, Dubai Silicon Oasis', addressLocality: 'Dubai', addressRegion: 'Dubai', addressCountry: 'AE' },
      },
    ],
    hours: null,
  },
  social: {
    linkedin: 'https://www.linkedin.com/company/gulf-next-oil-and-gas',
  },
}

/** True when at least one public contact channel is verified. */
export function hasVerifiedContact(c: CompanyContact = COMPANY.contact): boolean {
  return Boolean(c.email ?? c.phone ?? c.offices.length)
}

/** Google Maps search link for an office (opens directions on phones). */
export function directionsUrl(o: Office): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.lines.join(', '))}`
}
