/**
 * Company facts — VERIFIED DATA ONLY.
 * ----------------------------------------------------------------------------
 * Every field here is rendered on the public site (footer, contact page,
 * structured data). Leave a field `null` until it has been confirmed from the
 * company's registration documents. Components render nothing for `null`
 * fields — they never fall back to sample or placeholder values.
 *
 * Status (2026-11-10): email and LinkedIn page confirmed by the company.
 * Phone, address, hours and registration number are still unverified.
 */
export interface CompanyContact {
  email: string | null
  phone: string | null
  /** One line per address line. */
  address: string[] | null
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
    address: null,
    hours: null,
  },
  social: {
    linkedin: 'https://www.linkedin.com/company/gulf-next-oil-and-gas',
  },
}

/** True when at least one public contact channel is verified. */
export function hasVerifiedContact(c: CompanyContact = COMPANY.contact): boolean {
  return Boolean(c.email ?? c.phone ?? c.address?.length)
}
